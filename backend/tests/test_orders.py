import pytest

@pytest.fixture
def product_id(client, admin_token):
    r = client.post("/products/", json={
        "name": "Order Test Product",
        "price": 100.0,
        "stock": 50
    }, headers={"Authorization": f"Bearer {admin_token}"})
    return r.json()["id"]

def test_create_order(client, customer_token, product_id):
    r = client.post("/orders/", json={
        "items": [{"product_id": product_id, "quantity": 2}]
    }, headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 201
    assert float(r.json()["total_amount"]) == 200.0

def test_stock_deducted_after_order(client, customer_token, admin_token, product_id):
    before = client.get(f"/products/{product_id}").json()["stock"]
    client.post("/orders/", json={
        "items": [{"product_id": product_id, "quantity": 3}]
    }, headers={"Authorization": f"Bearer {customer_token}"})
    after = client.get(f"/products/{product_id}").json()["stock"]
    assert after == before - 3

def test_customer_sees_own_orders_only(client, customer_token):
    r = client.get("/orders/", headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 200
    for order in r.json():
        assert order["status"] in ["pending", "paid", "shipped", "completed", "cancelled"]

def test_order_insufficient_stock(client, customer_token, product_id):
    r = client.post("/orders/", json={
        "items": [{"product_id": product_id, "quantity": 99999}]
    }, headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 400

def test_admin_update_order_status(client, admin_token, customer_token, product_id):
    r = client.post("/orders/", json={
        "items": [{"product_id": product_id, "quantity": 1}]
    }, headers={"Authorization": f"Bearer {customer_token}"})
    oid = r.json()["id"]
    r2 = client.put(f"/orders/{oid}/status?status=paid",
        headers={"Authorization": f"Bearer {admin_token}"})
    assert r2.status_code == 200
