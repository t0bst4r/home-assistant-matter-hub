ARG NODE_VERSION="22"

FROM node:${NODE_VERSION}-alpine AS nodebuild

FROM ghcr.io/hassio-addons/base:18.2.1

# Install Node.js
RUN apk add --no-cache libstdc++ bash
COPY --from=nodebuild /usr/local/bin/node /usr/local/bin/
COPY --from=nodebuild /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN \
    ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx && \
    ln -s ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack
RUN corepack enable

ENV SUPERVISOR_TOKEN=""
VOLUME /config

COPY addon.docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ARG PACKAGE_VERSION="unknown"
LABEL \
  io.hass.version="$PACKAGE_VERSION" \
  io.hass.type="addon" \
  io.hass.arch="armhf|aarch64|i386|amd64"

RUN mkdir /install
COPY package.tgz /install/package.tgz
RUN npm install -g /install/package.tgz
RUN rm -rf /install

CMD /docker-entrypoint.sh
