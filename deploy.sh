set -eu

docker compose pull postgres
docker compose up -d --build
docker compose ps
