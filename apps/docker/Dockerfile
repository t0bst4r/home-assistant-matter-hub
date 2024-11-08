FROM node:22-slim

ENV HAMH_LOG_LEVEL="info"
ENV HAMH_DISABLE_LOG_COLORS="false"

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

ENV HAMH_WEB_PORT=8482
EXPOSE 8482

ENV HAMH_HOME_ASSISTANT_URL="http://x.x.x.x:yyyy"
ENV HAMH_HOME_ASSISTANT_ACCESS_TOKEN="access-token"

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

CMD home-assistant-matter-hub start
