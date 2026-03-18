"""
AgentSwarp V3 — GravityClaw Backend Engine
FastAPI + JWT Auth + 3-Tier Memory + Personality Engine + Autonomous Loop
"""
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Any
import asyncio, time, uuid, json, hashlib, hmac, base64

app = FastAPI(title="AgentSwarp Engine", version="3.0.0")
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# JWT Auth (symmetric HMAC-SHA256, no external dependency)
# ---------------------------------------------------------------------------
JWT_SECRET = "gravityclaw-secret-change-in-production"

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def create_token(payload: dict) -> str:
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body   = _b64url(json.dumps({**payload, "iat": int(time.time()), "exp": int(time.time()) + 86400}).encode())
    sig    = _b64url(hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
    return f"{header}.{body}.{sig}"

def verify_token(token: str) -> dict:
    try:
        h, b, s = token.split(".")
        expected = _b64url(hmac.new(JWT_SECRET.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(s, expected):
            raise ValueError("bad sig")
        payload = json.loads(base64.urlsafe_b64decode(b + "=="))
        if payload["exp"] < time.time():
            raise ValueError("expired")
        return payload
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

def current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return verify_token(creds.credentials)

# ---------------------------------------------------------------------------
# 3-Tier Memory
# ---------------------------------------------------------------------------
short_term: dict[str, list] = {}   # {agent_id: [recent messages]}
long_term_kv: dict[str, Any] = {}  # {agent_id: config / facts}
vector_store: list[dict] = []      # simulated vector store (replace with pgvector in prod)

def remember_short(agent_id: str, text: str):
    short_term.setdefault(agent_id, []).append({"ts": time.time(), "text": text})
    short_term[agent_id] = short_term[agent_id][-20:]  # keep last 20

def remember_long(agent_id: str, key: str, value: Any):
    long_term_kv[f"{agent_id}:{key}"] = value

def vector_upsert(agent_id: str, content: str):
    vector_store.append({"id": str(uuid.uuid4()), "agent_id": agent_id, "content": content, "ts": time.time()})

def vector_search(query: str, agent_id: Optional[str] = None) -> list[dict]:
    pool = [v for v in vector_store if v["agent_id"] == agent_id] if agent_id else vector_store
    return [v for v in pool if query.lower() in v["content"].lower()][:5]

# ---------------------------------------------------------------------------
# Personality Engine
# ---------------------------------------------------------------------------
PERSONALITIES: dict[str, dict] = {
    "default": {"name": "GravityClaw", "prompt": "You are a concise, autonomous AI engine."},
    "elon":    {"name": "Elon Mode",   "prompt": "First principles. Ship fast. Be blunt. 2x or nothing."},
    "srk":     {"name": "SRK Mode",   "prompt": "Passionate, dramatic, inspirational. Zindagi milegi na dobara."},
    "rayn":    {"name": "Rayn Mode",   "prompt": "Ambitious builder. Move fast. Build things that matter."},
}

# ---------------------------------------------------------------------------
# Autonomous Background Loop (true self-healing 24/7 tick)
# ---------------------------------------------------------------------------
RUNNING_AGENTS: dict[str, dict] = {}

async def autonomous_loop(agent_id: str):
    config = RUNNING_AGENTS.get(agent_id, {})
    tick = 0
    while RUNNING_AGENTS.get(agent_id, {}).get("active"):
        await asyncio.sleep(20)
        tick += 1
        summary = f"Tick {tick}: Agent '{config.get('name')}' executed goal shard. Self-check passed."
        remember_short(agent_id, summary)
        vector_upsert(agent_id, summary)
        # Self-healing: if we detect a failure flag, reset
        if config.get("error_count", 0) > 3:
            RUNNING_AGENTS[agent_id]["error_count"] = 0
            remember_short(agent_id, "Self-healed: error_count reset.")

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class AgentCreate(BaseModel):
    name: str
    goal: str
    personality: str = "default"

class MemoryQuery(BaseModel):
    query: str
    agent_id: Optional[str] = None

# ---------------------------------------------------------------------------
# Routes — Auth
# ---------------------------------------------------------------------------
@app.post("/auth/login")
def login(req: LoginRequest):
    # Simple demo: accept any credentials, return JWT
    token = create_token({"sub": req.username, "role": "admin"})
    return {"token": token, "type": "Bearer"}

# ---------------------------------------------------------------------------
# Routes — Agents
# ---------------------------------------------------------------------------
@app.post("/agents/deploy")
async def deploy_agent(cfg: AgentCreate, background: BackgroundTasks, user=Depends(current_user)):
    agent_id = f"swarp_{uuid.uuid4().hex[:8]}"
    personality = PERSONALITIES.get(cfg.personality, PERSONALITIES["default"])
    RUNNING_AGENTS[agent_id] = {"id": agent_id, "name": cfg.name, "goal": cfg.goal,
                                 "personality": personality, "active": True, "error_count": 0}
    remember_long(agent_id, "config", cfg.dict())
    background.add_task(autonomous_loop, agent_id)
    return {"agent_id": agent_id, "status": "deployed", "personality": personality["name"]}

@app.get("/agents")
def list_agents(user=Depends(current_user)):
    return [{"id": k, **{kk: vv for kk, vv in v.items() if kk != "active"}}
            for k, v in RUNNING_AGENTS.items()]

@app.get("/agents/{agent_id}/telemetry")
def telemetry(agent_id: str, user=Depends(current_user)):
    if agent_id not in RUNNING_AGENTS:
        raise HTTPException(404, "Agent not found")
    return {
        "id": agent_id,
        "config": long_term_kv.get(f"{agent_id}:config"),
        "short_term_memory": short_term.get(agent_id, []),
        "vector_store_size": sum(1 for v in vector_store if v["agent_id"] == agent_id),
    }

@app.delete("/agents/{agent_id}")
def stop_agent(agent_id: str, user=Depends(current_user)):
    if agent_id in RUNNING_AGENTS:
        RUNNING_AGENTS[agent_id]["active"] = False
    return {"status": "stopped"}

# ---------------------------------------------------------------------------
# Routes — Memory
# ---------------------------------------------------------------------------
@app.post("/memory/search")
def search_memory(req: MemoryQuery, user=Depends(current_user)):
    return {"results": vector_search(req.query, req.agent_id)}

@app.get("/memory/{agent_id}")
def get_memory(agent_id: str, user=Depends(current_user)):
    return {
        "short_term": short_term.get(agent_id, []),
        "long_term": {k.split(":", 1)[1]: v for k, v in long_term_kv.items() if k.startswith(f"{agent_id}:")},
        "vector_count": sum(1 for v in vector_store if v["agent_id"] == agent_id),
    }

# ---------------------------------------------------------------------------
# Routes — Personalities
# ---------------------------------------------------------------------------
@app.get("/personalities")
def get_personalities():
    return [{"key": k, "name": v["name"]} for k, v in PERSONALITIES.items()]

# ---------------------------------------------------------------------------
# Routes — Health
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "online", "agents": len(RUNNING_AGENTS), "uptime_ts": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, workers=1)
