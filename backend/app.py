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

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
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

@app.get("/tasks/{due_date}", response_model=list[Task])
async def get_tasks(due_date: date):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        rows = await conn.fetch('SELECT id, title, description, due_date FROM tasks WHERE due_date = $1', due_date)
        return [dict(row) for row in rows]
    finally:
        await conn.close()

@app.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow(
            'INSERT INTO tasks (title, description, due_date) VALUES ($1, $2, $3) RETURNING id, title, description, due_date',
            task.title, task.description, task.due_date
        )
        return dict(row)
    finally:
        await conn.close()

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task: TaskUpdate):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        existing = await conn.fetchrow('SELECT id, title, description, due_date FROM tasks WHERE id = $1', task_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Task not found")
        new_title = task.title if task.title is not None else existing['title']
        new_description = task.description if task.description is not None else existing['description']
        new_due_date = task.due_date if task.due_date is not None else existing['due_date']
        row = await conn.fetchrow(
            'UPDATE tasks SET title=$1, description=$2, due_date=$3 WHERE id=$4 RETURNING id, title, description, due_date',
            new_title, new_description, new_due_date, task_id
        )
        return dict(row)
    finally:
        await conn.close()

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        result = await conn.execute('DELETE FROM tasks WHERE id = $1', task_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Task not found")
        return {"message": "Task deleted"}
    finally:
        await conn.close()
