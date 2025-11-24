# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json vite.config.js tailwind.config.js postcss.config.js vitest.config.ts vitest.setup.ts .eslintrc.cjs ./
COPY src ./src
COPY public ./public
RUN npm install
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]