from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import tasks
from database import engine, Base

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(tasks.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Task Calendar API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
