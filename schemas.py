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

class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True