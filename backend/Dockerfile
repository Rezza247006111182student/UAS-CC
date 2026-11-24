# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY src ./src
COPY tsconfig.json ./
RUN npx prisma generate
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "dist/index.js"]
