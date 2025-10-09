FROM node:22-alpine

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY . .

EXPOSE 3003
