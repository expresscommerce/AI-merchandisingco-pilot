> **Your AI-Powered Smart Assistant for E-Commerce Stores** 🚀
> 
> Boost sales, save time, and grow your online store with automated recommendations for smart pricing, compelling product descriptions, and profit-boosting product bundles!

---

## 🌟 What is Merchandising Co-Pilot?

Running an online store involves hundreds of tiny decisions every day. **Merchandising Co-Pilot** acts like your personal 24/7 retail strategist. It analyzes store data and market trends to automatically generate actionable business proposals:

- 💰 **Smart Price Adjustments:** Recommends optimal product pricing based on market trends to increase sales while preserving high profit margins.
- ✍️ **AI Copy Rewriting:** Transforms plain product descriptions into persuasive, customer-focused copy that boosts conversion rates.
- 📦 **Product Bundling:** Identifies products frequently bought together and suggests discounted bundles to raise your Average Order Value (AOV).
- ⚡ **One-Click Actions:** Review data-backed proposals in a clean interactive dashboard and approve or reject them instantly!

---

## Project Structure

```
merchandising-copilot/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py          # Application entry point
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   ├── models/          # Pydantic data models
│   │   │   └── product.py
│   │   ├── routes/          # API route handlers
│   │   │   ├── health.py
│   │   │   └── products.py
│   │   └── services/        # Business logic
│   │       └── product_service.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # React + Vite frontend
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Full-stack orchestration
├── .env.example             # Environment variable template
└── README.md
```

---

## Quick Start (Docker)

### 1. Clone & configure environment

```bash
git clone <your-repo-url> merchandising-copilot
cd merchandising-copilot
cp .env.example .env        # edit .env if needed
```

### 2. Start everything

```bash
docker-compose up --build
```

This brings up three containers:

| Service      | URL                        | Description              |
| ------------ | -------------------------- | ------------------------ |
| **Backend**  | http://localhost:8000      | FastAPI (auto-reload)    |
| **Frontend** | http://localhost:5173      | Vite dev server          |
| **Postgres** | `localhost:5432`           | PostgreSQL 16            |

### 3. Verify it's running

```bash
# Health check
curl http://localhost:8000/health

# Interactive API docs
open http://localhost:8000/docs
```

### 4. Stop everything

```bash
docker-compose down          # keep data
docker-compose down -v       # remove data volumes too
```

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Docs

Once the backend is running, visit:

- **Swagger UI** → http://localhost:8000/docs
- **ReDoc** → http://localhost:8000/redoc

---

## Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

| Variable         | Default                                                     | Description               |
| ---------------- | ----------------------------------------------------------- | ------------------------- |
| `APP_NAME`       | `Merchandising Co-Pilot`                                    | Display name              |
| `DEBUG`          | `true`                                                      | Enable debug mode         |
| `DATABASE_URL`   | `postgresql+asyncpg://postgres:postgres@db:5432/merchandising` | Async Postgres DSN     |
| `SECRET_KEY`     | `change-me-in-production`                                   | App secret key            |
| `CORS_ORIGINS`   | `["http://localhost:5173"]`                                  | Allowed CORS origins      |

---

## License

MIT
