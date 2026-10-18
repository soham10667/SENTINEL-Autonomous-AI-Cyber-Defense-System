import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.event_bus import get_event_bus

logger = logging.getLogger("sentinel.api.websocket")
ws_router = APIRouter()

@ws_router.websocket("/ws/events")
async def websocket_events_endpoint(websocket: WebSocket):
    bus = get_event_bus()
    await bus.connect(websocket)
    try:
        # Keep connection open and receive any client pings/messages
        while True:
            data = await websocket.receive_text()
            # Respond to client heartbeats
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        bus.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection closed with error: {e}")
        bus.disconnect(websocket)
