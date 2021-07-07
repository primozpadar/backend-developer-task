FROM node:14-alpine3.13

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY ./src ./src
COPY tsconfig.json tsconfig.json
COPY ormconfig.js ormconfig.js

RUN yarn build

ENV NODE_ENV production

EXPOSE 4000
CMD [ "node", "build/index.js" ]
USER node