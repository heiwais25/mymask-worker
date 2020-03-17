FROM node:12.16.1-slim

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 4000

CMD ["yarn", "start"]