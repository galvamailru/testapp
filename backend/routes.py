from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import List, Optional
from models import Task, get_db

router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: date

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    date: date

    class Config:
        orm_mode = True

@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(date: date, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.date == date).all()
    return tasks

@router.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(title=task.title, description=task.description, date=task.date)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
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

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return