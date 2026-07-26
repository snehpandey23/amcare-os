FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/ai-scrum-master/package.json apps/ai-scrum-master/package.json
COPY integrations/ai-scrum-master-api/package.json integrations/ai-scrum-master-api/package.json

RUN npm install

COPY . .

RUN npm run build:ai-scrum-master

ENV NODE_ENV=production
ENV SERVE_AI_SCRUM_UI=true
ENV AI_SCRUM_MASTER_STATIC_DIR=/app/apps/ai-scrum-master/dist

EXPOSE 3000

CMD ["node", "--loader", "ts-node/esm", "integrations/ai-scrum-master-api/src/index.ts"]
