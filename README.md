# Календарь задач

Веб-приложение для ведения календаря задач с бэкендом на FastAPI, фронтендом на HTML/JS и PostgreSQL 15.

## Запуск

1. Установите Docker и Docker Compose.
2. Склонируйте репозиторий.
3. Выполните `docker-compose up --build`.
4. Откройте http://localhost:8080.

## API

- `GET /tasks?date=YYYY-MM-DD` - получить задачи на дату
- `POST /tasks` - создать задачу
- `PUT /tasks/{id}` - обновить задачу
- `DELETE /tasks/{id}` - удалить задачу
