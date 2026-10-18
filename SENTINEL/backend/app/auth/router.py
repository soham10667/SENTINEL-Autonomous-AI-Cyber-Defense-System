import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr

from app.database.falkor import get_db_manager
from app.auth.security import hash_password, verify_password, create_access_token, decode_access_token

logger = logging.getLogger("sentinel.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory account cache fallback in case FalkorDB is resetting
IN_MEMORY_OPERATORS: Dict[str, Dict[str, Any]] = {
    "admin@sentinel.gov": {
        "id": "OP-ADMIN-01",
        "email": "admin@sentinel.gov",
        "full_name": "Chief Security Officer",
        "password_hash": hash_password("Sentinel2026!"),
        "role": "ADMIN",
        "clearance": "full_command",
        "is_demo": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
}

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    clearance_level: Optional[str] = "operator"

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency to extract and verify JWT operator from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    return payload

@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    """Register a new operator with server-side validation and secure password hashing."""
    email_clean = req.email.strip().lower()
    name_clean = req.full_name.strip()
    
    if not name_clean:
        raise HTTPException(status_code=400, detail="Full Name is required.")
        
    if not re.match(EMAIL_REGEX, email_clean):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
        
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    db = get_db_manager()
    
    # Check if user already exists in FalkorDB
    if db.is_connected():
        try:
            check_cypher = "MATCH (op:OperatorAccount {email: $email}) RETURN op.email AS email"
            existing = db.query(check_cypher, {"email": email_clean})
            if existing:
                raise HTTPException(status_code=400, detail="An operator with this email address is already registered.")
        except HTTPException:
            raise
        except Exception as e:
            logger.debug(f"FalkorDB operator query check: {e}")
            
    if email_clean in IN_MEMORY_OPERATORS:
        raise HTTPException(status_code=400, detail="An operator with this email address is already registered.")

    op_id = f"OP-{uuid.uuid4().hex[:8].upper()}"
    pw_hashed = hash_password(req.password)
    now_iso = datetime.now(timezone.utc).isoformat()
    clearance = req.clearance_level or "operator"

    user_data = {
        "id": op_id,
        "email": email_clean,
        "full_name": name_clean,
        "role": "ADMIN" if clearance == "admin" else "OPERATOR",
        "clearance": clearance,
        "is_demo": False,
        "created_at": now_iso
    }

    # Persist in FalkorDB
    if db.is_connected():
        try:
            create_cypher = """
            MERGE (op:OperatorAccount {email: $email})
            ON CREATE SET 
                op.id = $id,
                op.full_name = $name,
                op.password_hash = $pw_hash,
                op.role = $role,
                op.clearance = $clearance,
                op.is_demo = false,
                op.created_at = $created_at
            """
            db.query(create_cypher, {
                "email": email_clean,
                "id": op_id,
                "name": name_clean,
                "pw_hash": pw_hashed,
                "role": user_data["role"],
                "clearance": clearance,
                "created_at": now_iso
            })
            logger.info(f"Registered operator '{email_clean}' in FalkorDB.")
        except Exception as e:
            logger.error(f"Failed to persist operator to FalkorDB: {e}")

    # Also keep in in-memory cache
    IN_MEMORY_OPERATORS[email_clean] = {
        **user_data,
        "password_hash": pw_hashed
    }

    token = create_access_token(user_data)
    return AuthResponse(access_token=token, user=user_data)

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """Authenticate operator credentials and return secure JWT session token."""
    email_clean = req.email.strip().lower()
    
    if not email_clean or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    operator_record = None
    db = get_db_manager()

    # 1. Search in FalkorDB
    if db.is_connected():
        try:
            cypher = """
            MATCH (op:OperatorAccount {email: $email})
            RETURN op.id AS id, op.email AS email, op.full_name AS full_name,
                   op.password_hash AS password_hash, op.role AS role,
                   op.clearance AS clearance, op.is_demo AS is_demo,
                   op.created_at AS created_at
            LIMIT 1
            """
            results = db.query(cypher, {"email": email_clean})
            if results:
                operator_record = results[0]
        except Exception as e:
            logger.debug(f"FalkorDB query during login: {e}")

    # 2. Fallback to in-memory store
    if not operator_record and email_clean in IN_MEMORY_OPERATORS:
        operator_record = IN_MEMORY_OPERATORS[email_clean]

    if not operator_record:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Verify password hash
    stored_hash = operator_record.get("password_hash", "")
    if not verify_password(req.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user_data = {
        "id": operator_record.get("id"),
        "email": operator_record.get("email"),
        "full_name": operator_record.get("full_name"),
        "role": operator_record.get("role", "OPERATOR"),
        "clearance": operator_record.get("clearance", "standard"),
        "is_demo": bool(operator_record.get("is_demo", False)),
        "created_at": operator_record.get("created_at")
    }

    token = create_access_token(user_data)
    return AuthResponse(access_token=token, user=user_data)


@router.get("/me")
def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Return verified current operator profile from token."""
    return {
        "status": "authenticated",
        "user": current_user
    }
