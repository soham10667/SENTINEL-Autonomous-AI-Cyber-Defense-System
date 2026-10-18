"""
Model Context Protocol (MCP) Server for SENTINEL
Exposes defensive cybersecurity investigation and simulated containment tools.
"""
import sys
import json
import logging
from app.mcp.tools import (
    get_security_event,
    find_connected_assets,
    trace_possible_attack_paths,
    get_asset_permissions,
    calculate_graph_risk_tool,
    get_incident_history,
    simulate_block_ip,
    simulate_disable_account,
    simulate_isolate_device,
    verify_containment
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentinel.mcp.server")

TOOLS_REGISTRY = {
    "get_security_event": get_security_event,
    "find_connected_assets": find_connected_assets,
    "trace_possible_attack_paths": trace_possible_attack_paths,
    "get_asset_permissions": get_asset_permissions,
    "calculate_graph_risk": calculate_graph_risk_tool,
    "get_incident_history": get_incident_history,
    "simulate_block_ip": simulate_block_ip,
    "simulate_disable_account": simulate_disable_account,
    "simulate_isolate_device": simulate_isolate_device,
    "verify_containment": verify_containment,
}

TOOL_DEFINITIONS = [
    {
        "name": "get_security_event",
        "description": "Fetch details of a security event from FalkorDB graph.",
        "inputSchema": {
            "type": "object",
            "properties": {"event_id": {"type": "string"}},
            "required": ["event_id"]
        }
    },
    {
        "name": "find_connected_assets",
        "description": "Discover all graph assets connected to an entity up to depth hops.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "entity_id": {"type": "string"},
                "depth": {"type": "integer", "default": 2}
            },
            "required": ["entity_id"]
        }
    },
    {
        "name": "trace_possible_attack_paths",
        "description": "Multi-hop graph traversal to find attack routes to crown jewel databases and critical servers.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "source_id": {"type": "string"},
                "max_depth": {"type": "integer", "default": 4}
            },
            "required": ["source_id"]
        }
    },
    {
        "name": "get_asset_permissions",
        "description": "Retrieve access permissions and authorized identities for an asset.",
        "inputSchema": {
            "type": "object",
            "properties": {"asset_id": {"type": "string"}},
            "required": ["asset_id"]
        }
    },
    {
        "name": "calculate_graph_risk",
        "description": "Compute deterministic mathematical risk score based on FalkorDB topology.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "incident_id": {"type": "string"},
                "source_id": {"type": "string"},
                "severity": {"type": "string", "default": "HIGH"}
            },
            "required": ["incident_id", "source_id"]
        }
    },
    {
        "name": "get_incident_history",
        "description": "Retrieve recent incident history and resolution records.",
        "inputSchema": {
            "type": "object",
            "properties": {"limit": {"type": "integer", "default": 10}}
        }
    },
    {
        "name": "simulate_block_ip",
        "description": "Simulates blocking an external malicious IP address in perimeter firewalls.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "ip": {"type": "string"},
                "reason": {"type": "string"}
            },
            "required": ["ip", "reason"]
        }
    },
    {
        "name": "simulate_disable_account",
        "description": "Simulates suspending a compromised user identity in directory services.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "reason": {"type": "string"}
            },
            "required": ["user_id", "reason"]
        }
    },
    {
        "name": "simulate_isolate_device",
        "description": "Simulates isolating an endpoint device from internal network via EDR.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "device_id": {"type": "string"},
                "reason": {"type": "string"}
            },
            "required": ["device_id", "reason"]
        }
    },
    {
        "name": "verify_containment",
        "description": "Validates that defensive containment action is enforced in FalkorDB.",
        "inputSchema": {
            "type": "object",
            "properties": {"action_id": {"type": "string"}},
            "required": ["action_id"]
        }
    }
]

def run_stdio_server():
    """Runs standard MCP stdio protocol loop."""
    logger.info("SENTINEL MCP Server running on stdio...")
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            req = json.loads(line)
            method = req.get("method")
            msg_id = req.get("id")
            
            if method == "tools/list":
                response = {"jsonrpc": "2.0", "id": msg_id, "result": {"tools": TOOL_DEFINITIONS}}
            elif method == "tools/call":
                params = req.get("params", {})
                tool_name = params.get("name")
                args = params.get("arguments", {})
                
                if tool_name in TOOLS_REGISTRY:
                    result = TOOLS_REGISTRY[tool_name](**args)
                    response = {"jsonrpc": "2.0", "id": msg_id, "result": {"content": [{"type": "text", "text": json.dumps(result)}]}}
                else:
                    response = {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32601, "message": f"Tool '{tool_name}' not found"}}
            else:
                response = {"jsonrpc": "2.0", "id": msg_id, "result": {}}
                
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err_resp = {"jsonrpc": "2.0", "error": {"code": -32000, "message": str(e)}}
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    run_stdio_server()
