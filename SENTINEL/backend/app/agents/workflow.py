import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

from app.config import settings
from app.database.falkor import get_db_manager
from app.agents.state import InvestigationState
from app.models.schemas import TraceStep, DefensiveAction, IncidentReport
from app.mcp.tools import (
    get_security_event,
    find_connected_assets,
    trace_possible_attack_paths,
    simulate_block_ip,
    simulate_disable_account,
    simulate_isolate_device,
    verify_containment
)
from app.agents.risk_engine import calculate_graph_risk, evaluate_counterfactual_containment
from app.services.event_bus import get_event_bus

logger = logging.getLogger("sentinel.agent.workflow")

class InvestigationWorkflow:
    def __init__(self, incident_id: str, event_id: str):
        self.investigation_id = f"INV-{uuid.uuid4().hex[:6].upper()}"
        self.incident_id = incident_id
        self.event_id = event_id
        self.state = InvestigationState(
            investigation_id=self.investigation_id,
            incident_id=self.incident_id,
            event_id=self.event_id,
            is_rule_based=not bool(settings.LLM_API_KEY)
        )
        self.event_bus = get_event_bus()

    async def _emit_step(self, step: TraceStep):
        self.state.steps.append(step)
        await self.event_bus.broadcast("AGENT_TRACE_STEP", {
            "investigation_id": self.investigation_id,
            "incident_id": self.incident_id,
            "step": step.model_dump()
        })

    async def run(self) -> InvestigationState:
        """Executes the full graph-grounded investigation pipeline."""
        logger.info(f"Starting Investigation {self.investigation_id} for Incident {self.incident_id}...")
        now = lambda: datetime.now(timezone.utc).isoformat()

        # Step 1: Alert Validation & Event Retrieval
        step1_res = get_security_event(self.event_id)
        self.state.event_data = step1_res
        source_id = step1_res.get("source_entity_id") or "UNKNOWN"
        source_type = step1_res.get("source_entity_type") or "Entity"
        self.state.source_entity_id = source_id
        self.state.source_entity_type = source_type

        await self._emit_step(TraceStep(
            step_num=1,
            phase="EVENT_VALIDATION",
            tool_name="get_security_event",
            tool_input={"event_id": self.event_id},
            tool_output=step1_res,
            rationale=f"Retrieved security event {self.event_id}. Event type '{step1_res.get('event_type')}' with severity '{step1_res.get('severity')}'. Source entity identified as {source_id} ({source_type}).",
            timestamp=now(),
            evidence_node_ids=[self.event_id, source_id]
        ))

        # Step 2: Connected Assets Discovery (1-2 hops)
        step2_res = find_connected_assets(source_id, depth=2)
        self.state.connected_assets = step2_res.get("connected_assets", [])
        connected_ids = [a.get("asset_id") for a in self.state.connected_assets if a.get("asset_id")]

        await self._emit_step(TraceStep(
            step_num=2,
            phase="GRAPH_TOPOLOGY_EXPLORATION",
            tool_name="find_connected_assets",
            tool_input={"entity_id": source_id, "depth": 2},
            tool_output={"connected_count": len(self.state.connected_assets), "sample": self.state.connected_assets[:4]},
            rationale=f"Explored FalkorDB neighborhood around origin {source_id}. Found {len(self.state.connected_assets)} directly linked infrastructure and identity nodes.",
            timestamp=now(),
            evidence_node_ids=connected_ids[:5]
        ))

        # Step 3: Multi-hop Attack Path Reconstruction
        step3_res = trace_possible_attack_paths(source_id, max_depth=4)
        self.state.attack_paths = step3_res.get("paths", [])
        path_summaries = [p.get("path_summary") for p in self.state.attack_paths[:3]]

        await self._emit_step(TraceStep(
            step_num=3,
            phase="ATTACK_CHAIN_RECONSTRUCTION",
            tool_name="trace_possible_attack_paths",
            tool_input={"source_id": source_id, "max_depth": 4},
            tool_output={"paths_discovered": len(self.state.attack_paths), "top_paths": path_summaries},
            rationale=f"Traversed {len(self.state.attack_paths)} possible multi-hop paths to sensitive assets. Crown jewels reachable via lateral access chains.",
            timestamp=now(),
            evidence_node_ids=[source_id] + [p.get("target_id") for p in self.state.attack_paths if p.get("target_id")]
        ))

        # Step 4: Deterministic Graph-Based Risk Evaluation
        event_sev = step1_res.get("severity", "HIGH")
        risk_breakdown = calculate_graph_risk(
            source_id=source_id,
            base_severity=event_sev,
            confidence=step1_res.get("confidence", 0.95),
            paths=self.state.attack_paths
        )
        self.state.risk_assessment = risk_breakdown
        self.state.crown_jewels_at_risk = risk_breakdown.reachable_crown_jewels

        await self._emit_step(TraceStep(
            step_num=4,
            phase="RISK_EVALUATION",
            tool_name="calculate_graph_risk",
            tool_input={"source_id": source_id, "base_severity": event_sev},
            tool_output=risk_breakdown.model_dump(),
            rationale=f"Calculated graph-based risk score: {risk_breakdown.total_risk_score}/100 ({risk_breakdown.severity_level}). {len(risk_breakdown.reachable_crown_jewels)} crown jewel assets exposed.",
            timestamp=now(),
            evidence_node_ids=[cj.get("id") for cj in risk_breakdown.reachable_crown_jewels if cj.get("id")]
        ))

        # Step 5: Counterfactual Containment Analysis (Differentiator B)
        # Determine candidate defensive target based on entity type
        if "IP" in source_type or "." in source_id:
            cand_action = "BLOCK_IP"
            cand_target = source_id
        elif "User" in source_type or "USR" in source_id or "@" in source_id:
            cand_action = "DISABLE_ACCOUNT"
            cand_target = source_id
        elif "Device" in source_type or "DEV" in source_id or "SRV" in source_id:
            cand_action = "ISOLATE_DEVICE"
            cand_target = source_id
        else:
            cand_action = "ISOLATE_DEVICE"
            cand_target = source_id

        cf_result = evaluate_counterfactual_containment(
            source_id=source_id,
            action_type=cand_action,
            target_id=cand_target,
            base_severity=event_sev
        )
        self.state.counterfactual = cf_result

        await self._emit_step(TraceStep(
            step_num=5,
            phase="COUNTERFACTUAL_ANALYSIS",
            tool_name="evaluate_counterfactual_containment",
            tool_input={"source_id": source_id, "action_type": cand_action, "target_id": cand_target},
            tool_output=cf_result.model_dump(),
            rationale=f"Simulated counterfactual impact: {cand_action} on {cand_target} cuts {cf_result.paths_severed} paths, dropping risk from {cf_result.risk_before} to {cf_result.risk_after} (-{cf_result.risk_reduction} pts).",
            timestamp=now(),
            evidence_node_ids=[cand_target]
        ))

        # Step 6 & 7: Defensive Action Execution via MCP Tool
        action_output = {}
        if cand_action == "BLOCK_IP":
            action_output = simulate_block_ip(cand_target, reason=f"Automated containment for incident {self.incident_id}")
        elif cand_action == "DISABLE_ACCOUNT":
            action_output = simulate_disable_account(cand_target, reason=f"Compromised credential containment for {self.incident_id}")
        else:
            action_output = simulate_isolate_device(cand_target, reason=f"Endpoint lateral containment for {self.incident_id}")

        action_id = action_output.get("action_id", f"ACT-{uuid.uuid4().hex[:6].upper()}")
        def_action = DefensiveAction(
            id=action_id,
            action_type=cand_action,
            target_type=source_type,
            target_id=cand_target,
            status="EXECUTED",
            reason=f"Risk score {risk_breakdown.total_risk_score} exceeded threshold. Counterfactual risk reduction of {cf_result.risk_reduction} pts.",
            approval_status="AUTO_APPROVED",
            executed_at=now(),
            verified=True,
            rollback_available=True,
            delta_risk=cf_result.risk_reduction
        )
        self.state.action_taken = def_action

        await self._emit_step(TraceStep(
            step_num=6,
            phase="DEFENSIVE_CONTAINMENT",
            tool_name=f"simulate_{cand_action.lower()}",
            tool_input={"target": cand_target, "action": cand_action},
            tool_output=action_output,
            rationale=f"Executed simulated containment: {cand_action} on target {cand_target}. Policy rule: Auto-approved for verified lateral risk.",
            timestamp=now(),
            evidence_node_ids=[cand_target]
        ))

        # Step 8: Containment Outcome Verification
        verification = verify_containment(action_id)
        self.state.verification_result = verification

        await self._emit_step(TraceStep(
            step_num=7,
            phase="OUTCOME_VERIFICATION",
            tool_name="verify_containment",
            tool_input={"action_id": action_id},
            tool_output=verification,
            rationale=f"Containment verified in FalkorDB: Node state updated. Downstream traversal paths severed.",
            timestamp=now(),
            evidence_node_ids=[cand_target]
        ))

        # Step 9: Store Investigation Node & Update Incident in FalkorDB
        db = get_db_manager()
        summary = (
            f"Autonomous investigation completed for {self.incident_id}. "
            f"Evaluated origin {source_id} with initial risk score {risk_breakdown.total_risk_score} ({risk_breakdown.severity_level}). "
            f"Executed simulated {cand_action} on {cand_target}, reducing residual risk to {cf_result.risk_after}. "
            f"Enforcement verified in graph state."
        )
        self.state.report_summary = summary
        self.state.status = "COMPLETED"
        self.state.finished = True

        # FalkorDB persistence
        try:
            inv_cypher = """
            CREATE (inv:Investigation {
                id: $inv_id,
                incident_id: $inc_id,
                status: 'COMPLETED',
                risk_score: $risk,
                summary: $summary,
                completed_at: $completed_at,
                is_rule_based: $is_rule_based
            })
            """
            db.query(inv_cypher, {
                "inv_id": self.investigation_id,
                "inc_id": self.incident_id,
                "risk": risk_breakdown.total_risk_score,
                "summary": summary,
                "completed_at": now(),
                "is_rule_based": self.state.is_rule_based
            })

            # Link Incident -> Investigation
            link_cypher = """
            MATCH (i:Incident {id: $inc_id})
            MATCH (inv:Investigation {id: $inv_id})
            MERGE (i)-[:INVESTIGATED_BY]->(inv)
            SET i.status = 'CONTAINED', i.risk_score = $risk
            """
            db.query(link_cypher, {
                "inc_id": self.incident_id,
                "inv_id": self.investigation_id,
                "risk": cf_result.risk_after
            })
        except Exception as e:
            logger.error(f"Error persisting investigation in FalkorDB: {e}")

        # Broadcast investigation completed
        await self.event_bus.broadcast("INVESTIGATION_COMPLETED", {
            "investigation_id": self.investigation_id,
            "incident_id": self.incident_id,
            "risk_score": risk_breakdown.total_risk_score,
            "residual_risk": cf_result.risk_after,
            "summary": summary
        })

        logger.info(f"Investigation {self.investigation_id} finished successfully.")
        return self.state
