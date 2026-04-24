from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as tasks_router
from database import engine, Base
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(tasks_router)

@app.get("/")
async def root():
    return {"message": "Task Calendar API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
