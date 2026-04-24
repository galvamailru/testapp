# Task Calendar Application

## Описание
Приложение для ведения календаря задач с сохранением данных в PostgreSQL 15.

## Запуск
1. Установите Docker и Docker Compose.
2. Склонируйте репозиторий.
3. Запустите `docker-compose up --build`.
4. Откройте `http://localhost:8085`.

## Структура
- `backend/` - FastAPI приложение
- `frontend/` - HTML, CSS, JS
- `docker-compose.yml` - конфигурация Docker
- `nginx.conf` - конфигурация Nginx