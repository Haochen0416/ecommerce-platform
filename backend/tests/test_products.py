import pytest

def test_list_products_public(client):
    r = client.get("/products/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_create_product_admin(client, admin_token):
    r = client.post("/products/", json={
        "name": "Test Product",
        "price": 99.99,
        "stock": 10,
        "category": "Test"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 201
    assert r.json()["name"] == "Test Product"

def test_create_product_customer_forbidden(client, customer_token):
    r = client.post("/products/", json={
        "name": "Fake Product",
        "price": 1.0,
        "stock": 1
    }, headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 403

def test_update_product_admin(client, admin_token):
    r = client.post("/products/", json={
        "name": "To Update",
        "price": 50.0,
        "stock": 5
    }, headers={"Authorization": f"Bearer {admin_token}"})
    pid = r.json()["id"]
    r2 = client.put(f"/products/{pid}", json={"price": 75.0},
        headers={"Authorization": f"Bearer {admin_token}"})
    assert r2.status_code == 200
    assert float(r2.json()["price"]) == 75.0

def test_delete_product_admin(client, admin_token):
    r = client.post("/products/", json={
        "name": "To Delete",
        "price": 10.0,
        "stock": 1
    }, headers={"Authorization": f"Bearer {admin_token}"})
    pid = r.json()["id"]
    r2 = client.delete(f"/products/{pid}",
        headers={"Authorization": f"Bearer {admin_token}"})
    assert r2.status_code == 200

def test_get_nonexistent_product(client):
    r = client.get("/products/99999")
    assert r.status_code == 404
