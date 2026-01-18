# Деплой на Netlify (без Vite build) + backend через Netlify Functions

## Что уже сделано в этом архиве
- Фронт публикуется **как есть** из папки `/public`.
- API `POST /api/lead` работает через **Netlify Function**: `/.netlify/functions/lead`.
- Добавлен редирект `/api/lead` -> `/.netlify/functions/lead` (см. `netlify.toml`).
- `node_modules` удалены из архива.

## Как залить на Netlify
1) Залей проект в GitHub (рекомендуется):
   - создай репозиторий
   - загрузи содержимое этого архива

2) В Netlify:
   - **Add new site** -> **Import an existing project**
   - выбери GitHub репозиторий

3) Build settings:
   - Netlify прочитает `netlify.toml` автоматически.
   - Publish directory: `public`

## Переменные окружения (обязательно)
Открой: Site settings -> Environment variables и добавь:

### Telegram
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### Email (SMTP)
- `SMTP_HOST`
- `SMTP_PORT` (обычно 465 или 587)
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_TO`
- `MAIL_FROM`
- `FROM_NAME` (необязательно)

### Honeypot (необязательно)
- `HONEYPOT_FIELD` (по умолчанию `company`)

## Проверка
После деплоя:
- Открой сайт и отправь форму.
- Открой URL `/.netlify/functions/lead` в браузере: GET вернёт 405 — это нормально.

