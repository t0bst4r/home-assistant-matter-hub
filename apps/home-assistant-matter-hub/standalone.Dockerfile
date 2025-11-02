ARG NODE_VERSION="22"
ARG PACKAGE_VERSION="unknown"

FROM node:${NODE_VERSION}-alpine
RUN apk add --no-cache netcat-openbsd

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

LABEL package.version="$PACKAGE_VERSION"

RUN mkdir /install
COPY package.tgz /install/package.tgz
RUN npm install -g /install/package.tgz
RUN rm -rf /install

CMD exec home-assistant-matter-hub start
