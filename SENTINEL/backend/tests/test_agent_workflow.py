import pytest
import asyncio
from app.database.falkor import get_db_manager
from app.simulation.scenarios import launch_scenario_a, reset_simulation_state
from app.agents.workflow import InvestigationWorkflow

@pytest.mark.asyncio
async def test_end_to_end_investigation_scenario_a():
    """
    End-to-end integration test:
    1. Resets and seeds baseline graph.
    2. Injects Scenario A attack event (194.26.29.112 -> USR-002).
    3. Runs autonomous investigation agent.
    4. Verifies 7-step investigation trace.
    5. Verifies FalkorDB containment outcome.
    """
    db = get_db_manager()
    if not db.is_connected():
        pytest.skip("FalkorDB is not connected. Skipping live integration test.")

    # 1. Launch Scenario A
    scenario_info = launch_scenario_a()
    assert scenario_info["incident_id"] == "INC-2026-0842"
    assert scenario_info["event_id"] == "EVT-AUTH-ANOMALY-01"

    # 2. Run Autonomous Agent Workflow
    workflow = InvestigationWorkflow(
        incident_id=scenario_info["incident_id"],
        event_id=scenario_info["event_id"]
    )
    final_state = await workflow.run()

    # 3. Assertions
    assert final_state.status == "COMPLETED"
    assert final_state.finished is True
    assert len(final_state.steps) >= 7
    assert final_state.risk_assessment is not None
    assert final_state.risk_assessment.total_risk_score > 60.0
    assert final_state.action_taken is not None
    assert final_state.action_taken.verified is True
    assert final_state.action_taken.action_type in ["BLOCK_IP", "DISABLE_ACCOUNT", "ISOLATE_DEVICE"]

    # 4. Verify graph record in FalkorDB
    inv_res = db.query("MATCH (inv:Investigation {id: $id}) RETURN inv", {"id": final_state.investigation_id})
    assert len(inv_res) == 1
