FROM node:12-alpine

RUN apk add --update --no-cache tini
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

ENTRYPOINT ["tini", "--"]
CMD ["node", "lib"]