# syntax=docker/dockerfile:1

# ---- Builder ----
FROM --platform=$BUILDPLATFORM node:18.20.6-alpine3.20 AS builder

RUN mkdir /build
WORKDIR /build

COPY package.json .
COPY pnpm-lock.yaml .

RUN apk add --update --no-cache git
RUN npm install -g pnpm@9

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run generate
RUN pnpm run build

# ---- Dependencies ----
FROM --platform=$BUILDPLATFORM node:18.20.6-alpine3.20 AS deps

WORKDIR /deps

COPY package.json .
COPY pnpm-lock.yaml .
COPY ./prisma .

RUN apk add --update --no-cache git
RUN npm install -g pnpm@9

RUN pnpm install --frozen-lockfile --prod --no-optional
RUN pnpm dlx prisma generate

# ---- Runner ----
FROM --platform=$BUILDPLATFORM node:18.20.6-alpine3.20

RUN apk add --update --no-cache dumb-init git
RUN npm install -g pnpm@9

WORKDIR /app

COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=node:node --from=deps /deps/node_modules ./node_modules
COPY --chown=node:node --from=builder /build/.next ./.next
COPY --chown=node:node --from=builder /build/public ./public
COPY --from=builder /build/next.config.js ./

USER node
EXPOSE 8001
ENV PORT=8001
ENV NODE_ENV production

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "pnpm run start"]
