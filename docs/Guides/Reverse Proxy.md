# Using a reverse proxy

## Running on its own domain

If you run the application on its own domain (e.g. `matter.example.org`), there is no special configuration needed.
For `nginx` you could use a config as easy as this:

```nginx
location / {
    proxy_pass http://192.168.178.23:8482/;
}
```

## Running in a sub-path

If you want to run the application in a sub-location, we need tell the application that it's run under that path.
There are two ways of doing that:

## Rewriting the URL, excluding the sub-path

When you are using an ingress-like configuration, where the sub-path gets removed from the URL, make sure to add a
`x-ingress-path` header and pass in the path value. That's what Home Assistant is doing under the hood.

For nginx this looks like:

```nginx
location /hamh/ {
    # it is important to have a trailing slash,
    # otherwise nginx will not remove the "hamh" prefix
    proxy_pass http://192.168.178.23:8482/;
    proxy_set_header x-ingress-path hamh;
}
```

## Not rewriting the URL, including the path

If you cannot (or don't want to) configure your proxy to remove the prefix, set `x-forwarded-prefix` instead.

For nginx this looks like:

```nginx
location /hamh/ {
    # the missing trailing slash will configure nginx to NOT remove the prefix
    proxy_pass http://192.168.178.23:8482;
    proxy_set_header x-forwarded-prefix hamh;
}
```
