# University Research Opportunity Portal

A web application where faculty members can post, view, update, close and delete research opportunities in one place, instead of sharing them through emails, WhatsApp groups and noticeboards.

**GitHub Repository:** https://github.com/hamidkhanbuilds/research-opportunity-portal

## Features

- Create, view, edit, close and delete research opportunities
- All data is stored in MySQL (nothing is hard-coded)
- Validation in the React form and again in the Flask API
- Success and error messages, loading state and empty-list state
- Open and Closed opportunities are shown with different colors

## Technologies

| Part | Technology |
|------|------------|
| Backend | Python, Flask, PyMySQL |
| Database | MySQL (XAMPP or MySQL Server) |
| Frontend | React.js (JavaScript), Vite, CSS |
| API testing | Postman |

## Project structure

```text
researchPortal/
    backend/
        app.py              Flask routes and validation
        db.py               MySQL connection and query helper
        requirements.txt    Python packages
        schema.sql          Creates the database and table
        .env.example        Template for database settings
        .gitignore
    frontend/
        package.json
        index.html
        vite.config.js      Vite settings and proxy to Flask
        src/
            main.jsx        Starts React
            App.jsx         List, messages and API calls
            OpportunityForm.jsx      Create / edit form with validation
            OpportunityDetails.jsx   Full details of one opportunity
            style.css
    postman/
        researchPortal.json Postman collection
    .gitignore
    README.md
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer (LTS) with npm
- MySQL: XAMPP (MySQL module) or MySQL Server
- Postman

## 1. Database setup

**With XAMPP and phpMyAdmin**
1. Open the XAMPP Control Panel and start **MySQL**.
2. Open http://localhost/phpmyadmin, click **Import**, choose `backend/schema.sql` and click **Import**.
3. You should see the database `research_portal` with the table `research_opportunities`.

**With the command line** (MySQL Server)
```powershell
Get-Content backend\schema.sql -Raw | mysql -u root -p
```

## 2. Backend (Flask)

Open PowerShell in the project folder:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `backend\.env` and write your MySQL details. XAMPP's root user has no password, so leave `DB_PASSWORD` empty:

```text
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=research_portal
```

Start Flask:

```powershell
python app.py
```

The API runs at **http://127.0.0.1:5000**. Keep this window open. If you change the Python code, stop Flask with Ctrl+C and start it again.

If PowerShell blocks `venv\Scripts\activate`, run `Set-ExecutionPolicy -Scope Process Bypass` once and try again. The virtual environment is optional if the packages are already installed.

## 3. Frontend (React with Vite)

Open a **second** PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Flask must be running at the same time.

**How the two parts connect:** the React code sends requests to `/api/opportunities`. Vite forwards every `/api` request to Flask (see `vite.config.js`), so the browser only uses one address and CORS settings are not needed. For the demonstration, run Flask in one terminal and Vite in another.

## API endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose | Success | Errors |
|--------|----------|---------|---------|--------|
| POST | `/api/opportunities` | Create an opportunity | 201 | 400, 500 |
| GET | `/api/opportunities` | Get all (empty array if none) | 200 | 500 |
| GET | `/api/opportunities/<id>` | Get one opportunity | 200 | 404, 500 |
| PUT | `/api/opportunities/<id>` | Update (send the complete record) | 200 | 400, 404, 500 |
| DELETE | `/api/opportunities/<id>` | Delete an opportunity | 200 | 404, 500 |

### Fields

| Field | Type | Rules |
|-------|------|-------|
| `id` | number | Created by the database |
| `researchTitle` | text | Required, up to 200 characters |
| `researchDescription` | text | Required, up to 5000 characters |
| `researchArea` | text | Required, up to 100 characters |
| `facultyName` | text | Required, up to 100 characters |
| `department` | text | Required, up to 100 characters |
| `requiredSkills` | text | Required, up to 255 characters |
| `availablePositions` | number | Required, whole number from 1 to 1000 |
| `applicationDeadline` | text | Required, valid date as `YYYY-MM-DD` |
| `status` | text | Required, `Open` or `Closed` |

### Example request body (POST and PUT)

```json
{
  "researchTitle": "Machine Learning for Crop Disease Detection",
  "researchDescription": "Students will build image models to find crop diseases.",
  "researchArea": "Machine Learning",
  "facultyName": "Dr. Ayesha Khan",
  "department": "Computer Science",
  "requiredSkills": "Python, TensorFlow",
  "availablePositions": 2,
  "applicationDeadline": "2026-12-15",
  "status": "Open"
}
```

### Example error response (400)

```json
{
  "error": "Invalid data",
  "problems": ["researchTitle is required", "status must be Open or Closed"]
}
```

## Postman

1. Start Flask.
2. In Postman click **Import** and choose `postman/researchPortal.json`.
3. Run the requests **in order, 1 to 10** (right-click the collection and choose **Run collection**, or send them one by one). Requests 1 to 3 save the new IDs in collection variables, and the later requests use them.

| # | Request | Expected |
|---|---------|----------|
| 1-3 | Create three opportunities | 201 |
| 4 | Get all | 200 |
| 5 | Get one by ID | 200 |
| 6 | Update | 200 |
| 7 | Change status Open to Closed | 200 |
| 8 | Delete | 200 |
| 9 | Get the deleted opportunity | 404 |
| 10 | Send invalid data | 400 |

The collection variable `baseUrl` is `http://localhost:5000`.

## Common problems

| Problem | Simple solution |
|---------|-----------------|
| `Access denied for user` | Check `DB_USER` and `DB_PASSWORD` in `backend\.env`. XAMPP root has an empty password. |
| `Unknown database 'research_portal'` | Import `backend/schema.sql` again. |
| Page shows "Database error" | MySQL is not running. Start it in XAMPP. |
| Page shows "Cannot connect to the server" | Flask is not running. Run `python app.py` in `backend`. |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` in the `backend` folder. |
| `npm` is not recognized | Install Node.js LTS, then open a new terminal. |
| Port 5000 or 5173 is already in use | Close the other program using it. |
| MySQL uses another port in XAMPP | Change `DB_PORT` in `backend\.env`. |

## Security notes

- Database settings are in `backend\.env`. This file is listed in `.gitignore` and must never be uploaded. Only `.env.example` (with no real password) is in the repository.
- All SQL queries use parameters (`%s`), which prevents SQL injection.
- Database errors are shown to the user as a simple message. The technical reason is printed only in the Flask terminal.
- Validation is done in React and again in Flask, so wrong data is rejected even if the form is bypassed.
