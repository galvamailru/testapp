from pydantic import BaseModel
from datetime import date, time
from typing import Optional

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
