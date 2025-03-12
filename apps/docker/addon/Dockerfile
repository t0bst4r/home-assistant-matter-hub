FROM ghcr.io/hassio-addons/base-nodejs:stable

ENV SUPERVISOR_TOKEN ""
VOLUME /config

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ARG package_version
LABEL \
  io.hass.version="$package_version" \
  io.hass.type="addon" \
  io.hass.arch="armhf|aarch64|i386|amd64"

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

CMD /docker-entrypoint.sh