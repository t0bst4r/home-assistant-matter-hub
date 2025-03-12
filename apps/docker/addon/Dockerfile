FROM ghcr.io/hassio-addons/base-nodejs:stable

ENV SUPERVISOR_TOKEN ""
VOLUME /config

ARG package_version
LABEL \
  io.hass.version="$package_version" \
  io.hass.type="addon" \
  io.hass.arch="armhf|aarch64|i386|amd64"

RUN mkdir /install
COPY package.tgz /install/app.tgz
RUN npm install -g /install/app.tgz
RUN rm -rf /install

ENTRYPOINT ["home-assistant-matter-hub"]
CMD [ \
  "start", \
  "--log-level=$(bashio::config 'app_log_level')", \
  "--disable-log-colors=$(bashio::config 'disable_log_colors')", \
  "--mdns-network-interface=\"$(bashio::config 'mdns_network_interface')\"", \
  "--storage-location=/config/data", \
  "--web-port=$(bashio::addon.ingress_port)", \
  "--home-assistant-url='http://supervisor/core'", \
  "--home-assistant-access-token=\"$SUPERVISOR_TOKEN\"", \
  "--http-ip-whitelist='172.30.32.2'" \
]
