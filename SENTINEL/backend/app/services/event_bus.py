import asyncio
import json
import logging
from typing import Set, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("sentinel.event_bus")

class EventBus:
    _instance = None

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    @classmethod
    def get_instance(cls) -> "EventBus":
        if cls._instance is None:
            cls._instance = EventBus()
        return cls._instance

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        """Broadcast JSON message to all active WebSocket connections."""
        if not self.active_connections:
            return
            
        message = json.dumps({
            "type": event_type,
            "data": data
        })
        
        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.add(connection)
                
        for dead in dead_connections:
            self.active_connections.discard(dead)

def get_event_bus() -> EventBus:
    return EventBus.get_instance()
