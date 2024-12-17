FROM node:22

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

CMD ["sh", "-c", "DATABASE_URL=${DATABASE_URL} DIRECT_URL=${DIRECT_URL} pnpm exec prisma db push && pnpm dev"]
