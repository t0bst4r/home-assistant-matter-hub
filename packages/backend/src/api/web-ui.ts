import express from "express";
import fs from "node:fs";
import path from "node:path";

export function webUi(dist?: string) {
  const router = express.Router();
  if (dist) {
    router.get(/.*/, (req: express.Request, res: express.Response) => {
      if (fs.existsSync(path.join(dist, req.path))) {
        res.sendFile(path.join(dist, req.path));
      } else {
        res.sendFile(path.join(dist, "index.html"));
      }
    });
  }
  return router;
}
