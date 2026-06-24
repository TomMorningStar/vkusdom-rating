# vkusdom-rating

## Production на Ubuntu

Проект запускается напрямую на VPS:

- PostgreSQL установлен на хосте
- `server` - Express API на `localhost:5000`
- `client` - собранный React/Vite, отдаётся через nginx
- nginx проксирует `/api/*` в локальный `server`

### Первый запуск

На чистом Ubuntu-сервере один раз поставь Node.js, PostgreSQL и nginx:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
```

Создай базу и пользователя:

```bash
sudo -u postgres psql
```

```sql
CREATE USER vkusdom WITH PASSWORD 'change_this_postgres_password';
CREATE DATABASE vkusdom_rating OWNER vkusdom;
\q
```

Склонируй проект и установи зависимости:

```bash
git clone <repo-url> vkusdom-rating
cd vkusdom-rating

cd server
cp .env.example .env
nano .env
npm ci
npm run deploy

cd ../client
cp .env.example .env
npm ci
npm run build
```

В `server/.env` обязательно поменяй:

- `DATABASE_URL`
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD`

Если в пароле БД есть символы вроде `@`, `:`, `/`, `?`, `#`, `&`, их нужно URL-encode, потому что пароль используется внутри `DATABASE_URL`.

### Запуск сервера

Для ручной проверки:

```bash
cd server
npm start
```

Для постоянного запуска на VPS можно подключить `server/dist/server.js` к `systemd`, `pm2` или другому процесс-менеджеру.

### nginx

Собранный фронт лежит в `client/dist`. Пример конфига nginx есть в `client/nginx.conf`; после изменения пути к `root` включи его в `/etc/nginx/sites-enabled/` и проверь конфиг:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Обновление после изменений

```bash
cd vkusdom-rating
git pull

cd server
npm ci
npm run deploy
sudo systemctl restart vkusdom-rating

cd ../client
npm ci
npm run build
sudo systemctl reload nginx
```
