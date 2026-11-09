# Imagen del backend de Syllab (NestJS + Prisma)
FROM node:24-alpine

# Prisma necesita openssl para conectarse a PostgreSQL
RUN apk add --no-cache openssl

WORKDIR /app

# primero las dependencias, asi Docker las reutiliza si no cambian
COPY package.json package-lock.json ./
RUN npm ci

# codigo del backend
COPY . .

# genera el cliente de Prisma y compila (la URL es de mentira, solo se usa para generar)
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" npx prisma generate && npm run build

EXPOSE 3000

# al partir: aplica las migraciones, carga los datos de prueba y levanta la API
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main"]
