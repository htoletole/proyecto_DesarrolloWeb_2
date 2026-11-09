# Imagen del frontend de Syllab (React + Vite servido con nginx)

# etapa 1: compilar el frontend
FROM node:24-alpine AS compilacion

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# la direccion de la API queda dentro del codigo al compilar
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# etapa 2: servir los archivos con nginx
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacion /app/dist /usr/share/nginx/html

EXPOSE 80
