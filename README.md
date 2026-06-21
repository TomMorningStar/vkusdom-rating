# vkusdom-rating

## Production на Ubuntu

Проект подготовлен под запуск на одном сервере через Docker Compose:

- `postgres` — PostgreSQL с постоянным volume `postgres-data`
- `server` — Express API, перед стартом выполняет `prisma migrate deploy`
- `client` — собранный React/Vite, отдаётся через nginx
- nginx внутри `client` проксирует `/api/*` в `server`

### Первый запуск

На чистом Ubuntu-сервере один раз поставь Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Дальше:

```bash
git clone <repo-url> vkusdom-rating
cd vkusdom-rating
cp .env.example .env
nano .env
bash deploy.sh
```

В `.env` обязательно поменяй:

- `POSTGRES_PASSWORD`
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD`
- `APP_PORT`, если порт `80` уже занят

Для `POSTGRES_PASSWORD` используй буквы, цифры, `_` и `-`. Если поставить символы вроде `@`, `:`, `/`, `?`, `#`, `&`, их нужно URL-encode, потому что пароль используется внутри `DATABASE_URL`.

### Обновление после изменений

```bash
cd vkusdom-rating
git pull
bash deploy.sh
```

### Полезные команды

```bash
docker compose ps
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres
docker compose down
```

База хранится в Docker volume `postgres-data`; `docker compose down` её не удаляет. Удалит только команда `docker compose down -v`.