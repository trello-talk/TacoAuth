# syntax=docker/dockerfile:1

# ---- Builder ----
FROM node:18-alpine AS builder

RUN mkdir /build
WORKDIR /build

COPY package.json .
COPY yarn.lock .
RUN yarn install --immutable

COPY . .
RUN yarn generate
RUN yarn build

# ---- Dependencies ----
FROM node:18-alpine AS deps

WORKDIR /deps

COPY package.json .
COPY yarn.lock .
RUN yarn install --immutable --prod --ignore-optional
RUN yarn add -D prisma
RUN yarn generate

# ---- Runner ----
FROM node:18-alpine

RUN apk add dumb-init

WORKDIR /app

COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/yarn.lock ./yarn.lock
COPY --from=deps /deps/node_modules ./node_modules
COPY --from=builder /build/.next ./.next

USER node
EXPOSE 8001
ENV PORT=8001
ENV NODE_ENV production

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "yarn start"]
