from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import AuditLog, User
from app.schemas import AuditLogOut, UserOut
from app.auth import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return db.query(User).all()

@router.get("/audit-log", response_model=List[AuditLogOut])
def list_audit_log(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
