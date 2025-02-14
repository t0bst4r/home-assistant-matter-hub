FROM node:20-slim

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

CMD /docker-entrypoint.sh
