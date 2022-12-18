# syntax=docker/dockerfile:1

# ---- Builder ----
FROM --platform=$BUILDPLATFORM node:18-slim AS builder

RUN mkdir /build
WORKDIR /build

COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn generate
RUN yarn build

# ---- Runner ----
FROM --platform=$BUILDPLATFORM node:18-slim

RUN apt-get update && apt-get install -y openssl dumb-init

WORKDIR /app

COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/yarn.lock ./yarn.lock
COPY --from=builder /build/node_modules ./node_modules
COPY --chown=node:node --from=builder /build/.next ./.next
COPY --chown=node:node --from=builder /build/public ./public
COPY --from=builder /build/next.config.js ./

USER node
EXPOSE 8001
ENV PORT=8001
ENV NODE_ENV production

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "yarn start"]
