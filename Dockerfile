FROM node:13.10.1

WORKDIR /app

COPY . /app

RUN npm i

RUN npm run build

EXPOSE 3000

ENTRYPOINT npm run start
