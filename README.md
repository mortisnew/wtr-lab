# WebNovels

A Django REST API backend for a web novel platform.

## Features

* JWT authentication
* User registration and profile management
* Novel management
* Chapter management
* Genres, tags, and sections
* Favorites
* Custom folders
* Reading history
* Last-read chapter tracking
* Ratings and reviews
* Similar novels
* Personalized recommendations
* Trending novels
* Novel view and reader tracking
* PostgreSQL database
* CORS support
* Docker-ready structure

## Tech Stack

* Python
* Django
* Django REST Framework
* PostgreSQL
* SimpleJWT
* Docker
* React + TypeScript frontend

## Project Structure

```text
WebNovels/
├── accounts/
├── content/
├── special/
├── home/
├── core/
├── frontend/
├── media/
├── manage.py
├── requirements.txt
├── .env
└── .gitignore
```

## Setup

Clone the repository:

```bash
git clone <repository-url>
cd WebNovels
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key
DEBUG=True

ALLOWED_HOSTS=localhost,127.0.0.1

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DB_NAME=novels
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=5432
```

Run migrations:

```bash
python manage.py migrate
```

Start the development server:

```bash
python manage.py runserver
```

The API will be available at:

```text
http://127.0.0.1:8000/
```

## Authentication

The project uses JWT authentication.

```text
/api/token/
/api/token/refresh/
```

Access tokens are used for authenticated API requests.

## Frontend

The project also contains a React + TypeScript frontend.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173/
```

## Environment Variables

Sensitive configuration is stored in `.env` and is intentionally excluded from Git.

Never commit real database passwords, secret keys, or other credentials.

## Status

This project is a backend-focused web novel platform prototype built with Django REST Framework.
