from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    time: Optional[time] = None
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    completed: Optional[bool] = None

class Task(TaskBase):
    id: int

    class Config:
        from_attributes = True