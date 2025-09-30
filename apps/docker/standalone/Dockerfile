ARG NODE_VERSION="22"

FROM node:${NODE_VERSION}-alpine
RUN apk add --no-cache netcat-openbsd

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

CMD exec home-assistant-matter-hub start
