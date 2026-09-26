# E-Commerce Platform

A full-stack e-commerce application built with FastAPI, MySQL, and React, developed in a Linux (WSL2) environment.

## Tech Stack

**Backend**: FastAPI · SQLAlchemy · MySQL · JWT · bcrypt · pytest  
**Frontend**: React · Axios · React Router  
**Dev Environment**: WSL2 Ubuntu · Linux

## Features

- Dual-role system: **Admin** and **Customer**
- JWT authentication with bcrypt password hashing
- Shopping cart with real-time stock validation (per-user, persists across sessions)
- Order management with customer cancel support
- **Admin Dashboard**: product CRUD, order status management, user list, audit log
- Full audit log for all operations
- 19 pytest tests covering auth, products, and orders
- Product images served from local static files

## Project Structure

```
ecommerce-platform/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── auth.py
│   │   ├── models/
│   │   ├── schemas/
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── products.py
│   │       ├── orders.py
│   │       └── admin.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_products.py
│   │   └── test_orders.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── api/client.js
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── PrivateRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Products.jsx
            ├── Cart.jsx
            ├── Orders.jsx
            └── Admin.jsx
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

App: `http://localhost:3000`

### Run Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | User | Current user profile |
| GET | `/products/` | Public | List products (filter by category) |
| POST | `/products/` | Admin | Create product |
| PUT | `/products/{id}` | Admin | Update product |
| DELETE | `/products/{id}` | Admin | Delete product |
| POST | `/orders/` | User | Place order |
| GET | `/orders/` | User | List own orders (admin sees all) |
| PUT | `/orders/{id}/status` | User/Admin | Update status (customers can cancel) |
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/audit-log` | Admin | View operation audit log |

## Environment Variables

Create a `.env` file in `backend/`:

```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/ecommerce
SECRET_KEY=your-random-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3000
```

## Author

**Haochen Li** — M.S. Computer Engineering, SMU Dallas (2026)  
[GitHub](https://github.com/Haochen0416) · [LinkedIn](https://linkedin.com/in/haochenli)

## License

MIT
