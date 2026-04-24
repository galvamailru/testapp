from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Task, SessionLocal, init_db
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: date

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.on_event("startup")
def on_startup():
    init_db()

@router.get("/tasks")
def get_tasks(date: date, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.date == date).all()
    return tasks

@router.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(title=task.title, description=task.description, date=task.date)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.title is not None:
        db_task.title = task.title
    if task.description is not None:
        db_task.description = task.description
    if task.date is not None:
        db_task.date = task.date
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}