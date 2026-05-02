# SubTrack

A full-stack web application for tracking recurring subscriptions and regular expenses. Users can manage subscriptions by category, monitor upcoming payment dates, view price change history, and set monthly budget limits per currency.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (SPA, no framework) |
| Backend | Node.js + Express |
| Database | SQLite via better-sqlite3 |
| Testing | Jest |
| API Docs | Swagger UI (swagger-ui-express) |
| CI | GitHub Actions + ESLint |

---

## Prerequisites

- Node.js 18 or higher
- npm

---

## Setup

```bash
git clone https://github.com/cnrasili/SubTrack.git
cd SubTrack
npm install
```

The SQLite database is created automatically on first run. No separate database setup is required.

---

## Running the Application

```bash
npm start
```

The server starts on `http://localhost:3000`. The frontend is served as a static SPA from the same port.

For development with auto-restart:

```bash
npm run dev
```

---

## Running Tests

```bash
npm test
```

Unit tests cover pure business logic functions in `summaryService` and `subscriptionAnalyzer`. Test files are located in `backend/tests/`.

---

## Linting

```bash
npm run lint
```

ESLint 9 with flat config. Targets `backend/src/`, `backend/tests/`, and `frontend/js/`. Rules enforce `===` equality, ban `var`, and warn on unused variables.

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:3000/api-docs
```

### Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/categories | List all categories |
| POST | /api/categories | Create a category |
| PUT | /api/categories/:id | Update a category |
| DELETE | /api/categories/:id | Delete a category |
| GET | /api/subscriptions | List subscriptions (filters: `q`, `category_id`, `billing_period`, `is_active`, `sort_by`, `order`) |
| POST | /api/subscriptions | Create a subscription |
| PUT | /api/subscriptions/:id | Update a subscription |
| DELETE | /api/subscriptions/:id | Delete a subscription |
| GET | /api/subscriptions/upcoming | Subscriptions due within N days (`?days=7`) |
| GET | /api/subscriptions/:id/history | Price change history for a subscription |
| GET | /api/summary | Monthly totals, yearly totals, breakdown by category |
| GET | /api/budgets | List budget limits |
| PUT | /api/budgets/:currency | Set or update a monthly budget limit |
| DELETE | /api/budgets/:currency | Remove a budget limit |

All error responses follow the shape:

```json
{ "error": "ERROR_CODE", "message": "Human-readable description" }
```

---

## Project Structure

```
SubTrack/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js          # SQLite connection and schema initialization
│   │   │   └── schema.sql           # Table definitions
│   │   ├── routes/                  # HTTP layer — request parsing and response only
│   │   │   ├── categories.js
│   │   │   ├── subscriptions.js
│   │   │   ├── summary.js
│   │   │   └── budgets.js
│   │   ├── services/                # Business logic and database access
│   │   │   ├── categoryService.js
│   │   │   ├── subscriptionService.js
│   │   │   ├── summaryService.js
│   │   │   ├── budgetService.js
│   │   │   └── subscriptionAnalyzer.js  # Pure cost analysis and projections
│   │   ├── validators/              # Input validation — pure functions, no DB
│   │   │   ├── categoryValidator.js
│   │   │   └── subscriptionValidator.js
│   │   └── app.js                   # Express app setup and route registration
│   ├── tests/
│   │   ├── subscriptionAnalyzer.test.js
│   │   ├── summaryService.test.js
│   │   ├── categoryService.test.js
│   │   └── subscriptionService.test.js
│   ├── swagger.json
│   └── server.js                    # Entry point
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js                   # All fetch calls
│       ├── app.js                   # SPA router
│       ├── dashboard.js
│       ├── subscriptions.js
│       └── categories.js
├── .github/
│   └── workflows/
│       └── ci.yml                   # Lint + test on every push
├── eslint.config.js
├── package.json
└── README.md
```

---

## Features

- **Subscription management** — create, update, and delete subscriptions with name, cost, billing period, category, currency, and notes
- **Category management** — organize subscriptions into color-coded categories
- **Filtering and sorting** — filter by name, category, billing period, and active status; sort by date, cost, or name
- **Upcoming payments** — dashboard view of payments due within 7 days with urgency indicators
- **Price history** — automatic tracking of cost changes on every update
- **Budget limits** — set monthly spending limits per currency with visual progress indicators
- **Cost projections** — monthly and annual cost summaries grouped by currency and category
