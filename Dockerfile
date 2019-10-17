FROM node:12-alpine AS base
RUN apk add --update --no-cache tini
WORKDIR /app

FROM base AS builder
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile && yarn cache clean
COPY . .
RUN yarn build

FROM base AS production
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn --production --frozen-lockfile && yarn cache clean
COPY --from=builder /app/data ./data
COPY --from=builder /app/lib ./lib

ENTRYPOINT ["tini", "--"]
CMD ["node", "lib"]
