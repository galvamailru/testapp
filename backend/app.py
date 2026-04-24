from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
from typing import Optional
import asyncpg
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/tasks")

class Task(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = ""
    due_date: date

async def get_db():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

@app.on_event("startup")
async def startup():
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            due_date DATE NOT NULL
        )
    ''')
    await conn.close()

@app.get("/tasks/{due_date}")
async def get_tasks(due_date: date):
    conn = await asyncpg.connect(DATABASE_URL)
    rows = await conn.fetch("SELECT id, title, description, due_date FROM tasks WHERE due_date = $1", due_date)
    await conn.close()
    return [dict(row) for row in rows]

@app.post("/tasks")
async def create_task(task: Task):
    conn = await asyncpg.connect(DATABASE_URL)
    row = await conn.fetchrow(
        "INSERT INTO tasks (title, description, due_date) VALUES ($1, $2, $3) RETURNING id, title, description, due_date",
        task.title, task.description, task.due_date
    )
    await conn.close()
    return dict(row)

@app.put("/tasks/{task_id}")
async def update_task(task_id: int, task: Task):
    conn = await asyncpg.connect(DATABASE_URL)
    row = await conn.fetchrow(
        "UPDATE tasks SET title=$1, description=$2, due_date=$3 WHERE id=$4 RETURNING id, title, description, due_date",
        task.title, task.description, task.due_date, task_id
    )
    await conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return dict(row)

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    conn = await asyncpg.connect(DATABASE_URL)
    result = await conn.execute("DELETE FROM tasks WHERE id=$1", task_id)
    await conn.close()
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}
