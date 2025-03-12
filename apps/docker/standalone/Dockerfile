FROM node:20-slim

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

CMD exec home-assistant-matter-hub start
