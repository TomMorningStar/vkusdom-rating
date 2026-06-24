FROM node:24-alpine AS build

WORKDIR /app
ARG PRISMA_BUILD_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

COPY package*.json ./
COPY prisma ./prisma
RUN DATABASE_URL=$PRISMA_BUILD_DATABASE_URL npm ci
RUN DATABASE_URL=$PRISMA_BUILD_DATABASE_URL npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres npm ci --omit=dev && npm cache clean --force
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres npx prisma generate

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 5000

CMD ["sh", "docker-entrypoint.sh"]


