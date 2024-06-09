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

RUN pnpm build

RUN npx prisma generate


CMD ["pnpm", "start", "-p", "$PORT"]