FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

RUN npm install -g pnpm

WORKDIR /usr/src/node-app

COPY package.json pnpm-lock.yaml ./

USER node

RUN pnpm install

COPY --chown=node:node . .

EXPOSE 3000

RUN pnpm build

CMD ["pnpm", "start"]