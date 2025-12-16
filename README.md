# LegalPlus AI Traffic Legal Support

Fullstack RAG platform (NestJS + React/Vite) for Vietnamese traffic accident compensation consultation. AI answers cite relevant law articles.

## Stack
- Backend: NestJS, TypeORM, PostgreSQL + pgvector, OpenAI embeddings/LLM
- Frontend: React + Vite + TailwindCSS + Zustand
- DB: PostgreSQL 15+, pgvector extension

## Backend setup
```bash
cd server
npm install
cp .env.example .env  # set OPENAI_API_KEY, DB_*
npm run build
npm run migration:run
npm run start:dev
```

## Frontend setup
```bash
cd client
npm install
npm run dev
```

## Model setup
```bash
cd model
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```


## Environment
- `VECTOR_DIMENSION=1536`
- Retrieval: `ORDER BY embedding <-> query_vector ASC LIMIT 5`
- LLM fallback when no context: "Xin lỗi, tôi không tìm thấy căn cứ pháp lý phù hợp."

## Initial data seed (optional)
```bash
cd server
npm run seed:knowledge
```

## Features
- Auth (JWT) login/signup/profile
- Chat with AI, answers cite law articles
- Conversation history per user
- Admin knowledge CRUD (create/update via API/UI)
- Feedback on answers

## API overview
- `POST /auth/register` { email, password, confirmPassword }
- `POST /auth/login`
- `GET /auth/me`
- `POST /chat/ask`
- `GET /chat/history` (auth)
- `GET /knowledge` (public), `POST/PUT/DELETE /knowledge/:id` (auth)
- `POST /feedback`

## Notes
- Ensure pgvector extension installed: `CREATE EXTENSION IF NOT EXISTS vector;`
- IVFFlat index created in migration with dimension 1536.
- Frontend expects `VITE_API_URL` (default http://localhost:3000).
