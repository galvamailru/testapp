# Task Calendar Application

A simple task calendar application with FastAPI backend, vanilla HTML/JS frontend, and PostgreSQL 15 database.

## Requirements
- Docker and Docker Compose installed

## How to Run
1. Clone the repository.
2. Run `docker-compose up --build`.
3. Access the frontend at `http://localhost:8080`.
4. The backend API is available at `http://localhost:8085`.

## Features
- View tasks for a selected day.
- Add, edit, and delete tasks.
- Navigate between months.
- Data persists in PostgreSQL.

## Project Structure
```
project/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── docker-compose.yml
└── README.md
```
