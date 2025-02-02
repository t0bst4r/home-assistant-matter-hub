import express from "express";
import { Logger } from "@matter/general";

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
        `${req.method} ${decodeURI(req.originalUrl)} ${res.statusCode} ${res.statusMessage} from ${req.socket.remoteAddress}`,
      );
    });
    next();
  };
}
