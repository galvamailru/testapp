from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    time: Optional[time] = None
    completed: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    date: date
    time: Optional[time] = None
    completed: bool

    class Config:
        from_attributes = True