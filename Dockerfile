FROM node:12.16.1-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ Asia/Seoul

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 4000

CMD ["yarn", "start"]