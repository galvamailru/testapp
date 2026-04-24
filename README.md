# Календарь задач

Приложение для ведения календаря задач с сохранением в PostgreSQL 15.

## Запуск

1. Установите Docker и Docker Compose.
2. Склонируйте репозиторий.
3. Запустите `docker-compose up --build`.
4. Приложение будет доступно по адресу `http://localhost:8085`.

## Структура проекта

- `backend/` - FastAPI приложение
- `frontend/` - HTML, CSS, JS
- `docker-compose.yml` - конфигурация Docker

## API

- `GET /tasks?date=YYYY-MM-DD` - получить задачи на дату
- `POST /tasks` - создать задачу
- `PUT /tasks/{id}` - обновить задачу
- `DELETE /tasks/{id}` - удалить задачу
