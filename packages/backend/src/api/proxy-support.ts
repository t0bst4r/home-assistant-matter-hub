import express from "express";

const proxyHeaders = ["x-forwarded-prefix", "x-ingress-path"];

export function proxySupport(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const proxyHeader = proxyHeaders.find((header) => header in req.headers);
  if (proxyHeader) {
    let proxyPrefix = req.header(proxyHeader);
    if (proxyPrefix) {
      if (!proxyPrefix.startsWith("/")) {
        proxyPrefix = `/${proxyPrefix}`;
      }
      if (proxyPrefix.endsWith("/")) {
        proxyPrefix = proxyPrefix.slice(0, -1);
      }
      if (!req.url.startsWith(proxyPrefix)) {
        res
          .status(400)
          .contentType("text/plain")
          .send(
            `Request header "${proxyHeader}" included a prefix "${proxyPrefix}" but request url does not match this prefix: ${req.path}`,
          );
        return;
      }
      req.originalUrl = req.url;
      req.url = req.url.slice(proxyPrefix.length);
      req.baseUrl = proxyPrefix;
    }
  }
  next();
}
