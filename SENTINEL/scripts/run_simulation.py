import sys
import os
import asyncio

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from app.database.falkor import get_db_manager
from app.simulation.scenarios import launch_scenario_a
from app.agents.workflow import InvestigationWorkflow

async def main():
    print("=" * 65)
    print("SENTINEL — Autonomous Investigation Agent CLI Demonstration")
    print("Hackathon Track 1: Agents That Act on Connected Data")
    print("=" * 65)
    
    db = get_db_manager()
    if not db.connect():
        print("ERROR: FalkorDB is not connected. Exiting.")
        return
        
    print("\n[Step 1] Injecting Scenario A: Compromised Employee Account...")
    scenario = launch_scenario_a()
    print(f"Incident Created: {scenario['incident_id']}")
    print(f"Trigger Event:    {scenario['event_id']}")
    print(f"Source Origin:    {scenario['source_entity']}")
    print(f"Threat Context:   {scenario['threat_description']}")
    
    print("\n[Step 2] Dispatched Autonomous Investigation Agent into FalkorDB...")
    workflow = InvestigationWorkflow(
        incident_id=scenario["incident_id"],
        event_id=scenario["event_id"]
    )
    
    final_state = await workflow.run()
    
    print("\n[Step 3] Autonomous Investigation Trace Steps:")
    for step in final_state.steps:
        print(f"  Step {step.step_num} [{step.phase}] -> Tool: '{step.tool_name}'")
        print(f"    Rationale: {step.rationale}")
        print(f"    Evidence Nodes: {step.evidence_node_ids}")
        
    print("\n[Step 4] Decision & Verified Containment:")
    print(f"  Total Graph Risk:    {final_state.risk_assessment.total_risk_score} ({final_state.risk_assessment.severity_level})")
    print(f"  Counterfactual Drop: -{final_state.counterfactual.risk_reduction} pts (Residual Risk: {final_state.counterfactual.risk_after})")
    print(f"  Action Executed:     {final_state.action_taken.action_type} on {final_state.action_taken.target_id}")
    print(f"  Graph Status:        {final_state.verification_result.get('containment_status')}")
    print(f"  Summary:             {final_state.report_summary}")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(main())
