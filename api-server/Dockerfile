FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

RUN npm install -g pnpm

WORKDIR /usr/src/node-app

COPY package.json pnpm-lock.yaml ./

USER node

RUN pnpm install


COPY --chown=node:node . .

EXPOSE ${PORT}

ENV REDIS_URL=${REDIS_URL}

ENV EMAIL_SERVICE_ADDRESS=${EMAIL_SERVICE_ADDRESS}

ENV SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}

ENV SLACK_CHANNEL=${SLACK_CHANNEL}

ENV SLACK_USERNAME=${SLACK_USERNAME}

RUN pnpm build

RUN npx prisma generate


CMD ["pnpm", "start", "-p", "$PORT"]