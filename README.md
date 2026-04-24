# Календарь задач

Приложение для ведения календаря задач с сохранением данных в PostgreSQL 15.

## Запуск

1. Установите Docker и Docker Compose.
2. Склонируйте репозиторий.
3. Запустите `docker-compose up --build`.
4. Откройте `http://localhost:8085`.

## API

- `GET /tasks?date=YYYY-MM-DD` - получить задачи на дату
- `POST /tasks` - создать задачу
- `PUT /tasks/{id}` - обновить задачу
- `DELETE /tasks/{id}` - удалить задачу

## Структура проекта

```
project/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── docker-compose.yml
└── README.md
```