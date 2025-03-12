FROM node:20-slim

ENV HAMH_STORAGE_LOCATION="/data"
VOLUME /data

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

ENTRYPOINT ["home-assistant-matter-hub"]
CMD [ "start" ]
