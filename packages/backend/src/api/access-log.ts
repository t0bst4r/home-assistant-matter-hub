import express from "express";
import { Logger } from "winston";

export function accessLogger(
  logger: Logger,
): (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void {
  return (req, res, next) => {
    res.on("finish", function () {
      logger.debug(
        "%s %s %s %s",
        req.method,
        decodeURI(req.originalUrl),
        res.statusCode,
        res.statusMessage,
      );
    });
    next();
  };
}
