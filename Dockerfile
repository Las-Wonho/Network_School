FROM node:9

COPY . .

RUN npm install koa
RUN npm install koa-router
RUN npm install koa-body
RUN npm install koa-static

RUN npm install mysql