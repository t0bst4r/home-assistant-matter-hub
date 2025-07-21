FROM node:24-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

CMD exec home-assistant-matter-hub start
