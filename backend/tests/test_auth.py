import pytest

def test_register_success(client):
    r = client.post("/auth/register", json={
        "username": "newuser",
        "email": "newuser@test.com",
        "password": "NewUser@2026"
    })
    assert r.status_code == 201
    assert r.json()["role"] == "customer"
    assert "password" not in r.json()

def test_register_duplicate_username(client):
    client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup1@test.com",
        "password": "Dup@12345"
    })
    r = client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup2@test.com",
        "password": "Dup@12345"
    })
    assert r.status_code == 400

def test_register_role_escalation_blocked(client):
    r = client.post("/auth/register", json={
        "username": "hacker2",
        "email": "hacker2@test.com",
        "password": "Hack@12345",
        "role": "admin"
    })
    assert r.json()["role"] == "customer"

def test_register_short_password(client):
    r = client.post("/auth/register", json={
        "username": "shortpw",
        "email": "shortpw@test.com",
        "password": "abc"
    })
    assert r.status_code == 422

def test_login_success(client):
    client.post("/auth/register", json={
        "username": "loginuser",
        "email": "loginuser@test.com",
        "password": "Login@2026"
    })
    r = client.post("/auth/login", data={
        "username": "loginuser",
        "password": "Login@2026"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_login_wrong_password(client):
    r = client.post("/auth/login", data={
        "username": "loginuser",
        "password": "wrongpassword"
    })
    assert r.status_code == 401

def test_me_authenticated(client, customer_token):
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {customer_token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "customer_test"

def test_me_unauthenticated(client):
    r = client.get("/auth/me")
    assert r.status_code == 401
