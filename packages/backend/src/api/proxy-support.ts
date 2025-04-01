import path from "node:path";
import type express from "express";

const ingressPath = "x-ingress-path";
const forwardedPrefix = "x-forwarded-prefix";

export function supportIngress(
  req: express.Request,
  _: express.Response,
  next: express.NextFunction,
) {
  if (!(ingressPath in req.headers)) {
    return next();
  }
  const prefix = req.header(ingressPath);
  if (!prefix) {
    return next();
  }
  const baseUrl = buildPath(prefix, req.baseUrl);
  req.baseUrl = baseUrl;
  req.originalUrl = buildPath(baseUrl, req.url);
  req.url = buildPath(req.url);
  next();
}

export function supportProxyLocation(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!(forwardedPrefix in req.headers)) {
    return next();
  }
  const prefix = req.header(forwardedPrefix);
  if (!prefix) {
    return next();
  }
  let baseUrl = buildPath(prefix, req.baseUrl);
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  if (!req.url.startsWith(`${baseUrl}/`)) {
    res
      .status(400)
      .contentType("text/plain")
      .send(`URL ${req.url} does not match base url ${baseUrl}`);
    return;
  }
  req.baseUrl = baseUrl;
  req.originalUrl = req.url;
  req.url = req.url.slice(baseUrl.length);
  next();
}

function buildPath(...paths: string[]): string {
  let result = path.posix.join(...paths);
  if (!result.startsWith("/")) {
    result = `/${result}`;
  }
  return result;
}
