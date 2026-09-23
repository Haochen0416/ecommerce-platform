from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Order, OrderItem, Product, AuditLog, User
from app.schemas import OrderCreate, OrderOut
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderOut, status_code=201)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = 0
    items_data = []
    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        total += float(product.price) * item.quantity
        items_data.append((product, item.quantity, product.price))

    order = Order(user_id=current_user.id, total_amount=total)
    db.add(order)
    db.flush()

    for product, quantity, unit_price in items_data:
        db.add(OrderItem(order_id=order.id, product_id=product.id,
                         quantity=quantity, unit_price=unit_price))
        product.stock -= quantity

    db.add(AuditLog(user_id=current_user.id, action="create_order", table_name="orders",
                    record_id=order.id, detail=f"Order total: ${total:.2f}"))
    db.commit()
    db.refresh(order)
    return order

@router.get("/", response_model=List[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        return db.query(Order).all()
    return db.query(Order).filter(Order.user_id == current_user.id).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return order

@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    valid = ["pending", "paid", "shipped", "completed", "cancelled"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    old_status = order.status
    order.status = status
    db.add(AuditLog(user_id=admin.id, action="update_order_status", table_name="orders",
                    record_id=order.id, detail=f"Status: {old_status} -> {status}"))
    db.commit()
    return {"message": f"Order {order_id} status updated to {status}"}
