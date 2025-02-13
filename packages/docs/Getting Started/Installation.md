# Installation

This application can be installed in different ways:

1. Home-Assistant AddOn for Home Assistant OS (preferred)
2. Manual Deployment
   1. Ready to use Docker Image
   2. Manual installation using `npm`
   3. Configuration options

> [!WARNING]
> In order to successfully use this application, you need to ensure IPv6 is enabled properly.
> In addition, the matter protocol is relying on mDNS and UDP. If you are using VLANs you need
> to make sure that UDP (especially mDNS) packages are routed properly.
>
> If you are facing issues, make sure to look at the [troubleshooting guide](../Guides/Connect%20Multiple%20Fabrics.md).

## 1. Native Home-Assistant AddOn

> [!WARNING]
> Home Assistant AddOns can only be used with Home Assistant OS.

Simply add the following GitHub Repository URL to your Home Assistant AddOn Store.

> https://github.com/t0bst4r/home-assistant-addons

1. Open the UI of your Home Assistant instance
2. Go to `Settings` -> `Add-Ons` -> `Add-On Store`
3. Click the three dots in the top-right corner and select `Repositories`
4. Paste the repository URL into the text-field and click "Add"
5. Refresh your Add-On Store and Install the Add-On
6. You can configure the log level in the AddOn configuration page
7. Click "Start" to start the addon
8. Follow the [Bridge configuration guide](Bridge%20Configuration.md)

## 2. Manual Deployment

### 2.1 Docker Image

> [!WARNING]
> Make sure your docker installation has IPv6 enabled, too.
> See [this guide](https://fariszr.com/docker-ipv6-setup-with-propagation/) for more information.

This repository builds a docker image for every release. You can simply run it by using `docker-compose`:

```yaml
services:
  matter-hub:
    image: ghcr.io/t0bst4r/home-assistant-matter-hub:latest
    restart: unless-stopped
    network_mode: host
    environment: # more options can be found in the configuration section
      - HAMH_HOME_ASSISTANT_URL=http://192.168.178.123:8123/
      - HAMH_HOME_ASSISTANT_ACCESS_TOKEN=ey...ZI
      - HAMH_LOG_LEVEL=info
      - HAMH_HTTP_PORT=8482
    volumes:
      - $PWD/home-assistant-matter-hub:/data
```

Having that you can simply run `docker compose up -d` to start the container.

For the docker image, data is stored in `/data`, so you can mount a volume there for persistence.

Alternatively, you can also run the container as follows:

```bash
docker run -d \
  # more options can be found in the configuration section
  # required: the address of your home assistant instance
  -e HAMH_HOME_ASSISTANT_URL="http://192.168.178.123:8123/" \
  # required: a long lived access token for your home assistant instance
  -e HAMH_HOME_ASSISTANT_ACCESS_TOKEN="eyJ.....dlc" \
  # optional: debug | info | warn | error
  # default: info
  -e HAMH_LOG_LEVEL="info" \
  # optional: the port to use for the web ui
  # default: 8482
  -e HAMH_HTTP_PORT=8482 \
  # recommended: persist the configuration and application data
  -v $PWD/home-assistant-matter-hub:/data \
  # required due to restrictions in matter
  --network=host \
  ghcr.io/t0bst4r/home-assistant-matter-hub:latest
```

See 2.3 for more configuration options.

Now you can go ahead and follow the [bridge configuration guide](./Bridge%20Configuration.md).

### 2.2 Manual installation using `npm`

If you want to install this application by hand, you simply need to run

```bash
npm install -g home-assistant-matter-hub
```

To start the application, run

```bash
home-assistant-matter-hub start \
  # required: the address of your home assistant instance
  # can be replaced with an environment variable: HAMH_HOME_ASSISTANT_URL
  --home-assistant-url="http://192.168.178.123:8123/" \
  # required: a long lived access token for your home assistant instance
  # can be replaced with an environment variable: HAMH_HOME_ASSISTANT_ACCESS_TOKEN
  --home-assistant-access-token="eyJ.....dlc" \
  # optional: debug | info | warn | error
  # default: info
  # can be replaced with an environment variable: HAMH_LOG_LEVEL
  --log-level=info \
  # optional: the port to use for the web ui
  # default: 8482
  # can be replaced with an environment variable: HAMH_WEB_PORT
  --http-port=8482
```

The application will store its data in `$HOME/.home-assistant-matter-hub`. You can configure the storage path by
using the `--storage-location=/path/to/storage` option or `HAMH_STORAGE_STORAGE` environment variable.

See 2.3 for more configuration options.

Now you can go ahead and follow the [bridge configuration guide](./Bridge%20Configuration.md).

### 2.3 Configuration options

General app configuration is done using the command line interface or environment variables. The following parameters
are available:

```
home-assistant-matter-hub start

start the application

Options:
  --help                         Show help                                                                                         [boolean]
  --config                       Provide the path to a configuration JSON file, which can include all the other command options. You can use
                                  kebabcase ("log-level") or camelcase ("logLevel").
  --log-level                                                [string] [choices: "silly", "debug", "info", "warn", "error"] [default: "info"]
  --disable-log-colors                                                                                            [boolean] [default: false]
  --storage-location             Path to a directory where the application should store its data. Defaults to $HOME/.home-assistant-matter-h
                                 ub                                                                                                 [string]
  --http-port, --web-port        Port used by the web application. 'http-port' is recommended, 'web-port' is deprecated and will be removed
                                 in the future.                                                                     [number] [default: 8482]
  --http-auth-username           Username for HTTP basic authentication                                                             [string]
  --http-auth-password           Password for HTTP basic authentication                                                             [string]
  --http-ip-whitelist            Only allow the specified IPv4, IPv6 or CIDR. You can specify this option multiple times. When configured vi
                                 a ENV variables, you can only specify ONE value. Defaults to allow every IP address.                [array]
  --mdns-network-interface       Limit mDNS to this network interface                                                               [string]
  --home-assistant-url           The HTTP-URL of your Home Assistant URL                                                 [string] [required]
  --home-assistant-access-token  A long-lived access token for your Home Assistant Instance                              [string] [required]
```

Each of those configuration options can be configured via environment variables, too. Simply prefix them with `HAMH_`
and write them in capslock with underscores (e.g. `HAMH_MDNS_NETWORK_INTERFACE`).

**Those configuration options are not needed for the Home Assistant Addon Installation type.**
