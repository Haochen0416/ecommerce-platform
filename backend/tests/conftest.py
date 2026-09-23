import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

TEST_DB = "mysql+pymysql://ecom_user:ecom_pass@localhost:3306/ecommerce_test"

engine = create_engine(TEST_DB)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token(client):
    client.post("/auth/register", json={
        "username": "admin_test",
        "email": "admin_test@test.com",
        "password": "Admin@2026"
    })
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("UPDATE users SET role='admin' WHERE username='admin_test'"))
        conn.commit()
    r = client.post("/auth/login", data={
        "username": "admin_test",
        "password": "Admin@2026"
    })
    return r.json()["access_token"]

@pytest.fixture
def customer_token(client):
    client.post("/auth/register", json={
        "username": "customer_test",
        "email": "customer_test@test.com",
        "password": "Customer@2026"
    })
    r = client.post("/auth/login", data={
        "username": "customer_test",
        "password": "Customer@2026"
    })
    return r.json()["access_token"]
