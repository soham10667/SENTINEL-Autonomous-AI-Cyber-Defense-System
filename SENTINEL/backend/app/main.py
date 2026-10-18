import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.falkor import get_db_manager
from app.database.schema import init_schema
from app.simulation.seed_data import seed_enterprise_graph
from app.api.routes import router as api_router
from app.api.websocket import ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sentinel.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SENTINEL Cyber Defense System...")
    logger.info(f"Targeting FalkorDB at {settings.FALKORDB_HOST}:{settings.FALKORDB_PORT} (Graph: {settings.FALKORDB_GRAPH})")
    
    # 1. Connect to FalkorDB
    db = get_db_manager()
    connected = db.connect()
    
    if connected:
        logger.info(f"Connected to FalkorDB successfully (Graph: {settings.FALKORDB_GRAPH}).")
        if settings.FALKORDB_GRAPH != "hackathon":
            init_schema()
            health = db.check_health()
            if health.get("node_count", 0) == 0:
                logger.info("FalkorDB graph is empty. Seeding baseline synthetic corporate infrastructure...")
                seed_enterprise_graph()
        else:
            logger.info("Using existing 'hackathon' graph. Persistent graph nodes and relationships preserved.")
    else:
        logger.warning(
            "Could not connect to FalkorDB at startup. "
            "Ensure Docker container 'falkordb' is running on port 6379."
        )

    yield
    logger.info("Shutting down SENTINEL Cyber Defense System...")

app = FastAPI(
    title="SENTINEL Cyber Defense API",
    description="Autonomous Cyber Defense System Powered by FalkorDB Graph-Based Attack Investigation and Intelligent Response",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "system": "SENTINEL",
        "status": "ONLINE",
        "version": "1.0.0",
        "hackathon_track": "Track 1 — Agents That Act on Connected Data",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
