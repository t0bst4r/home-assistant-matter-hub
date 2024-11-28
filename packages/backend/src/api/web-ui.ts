import express from "express";
import path from "node:path";
import fs from "node:fs";

export function webUi(dist?: string) {
  const router = express.Router();
  if (dist) {
    router.use(express.static(dist));
    router.get(/.*/, (req: express.Request, res: express.Response) => {
      const relative = path.relative(path.join(dist, req.path), dist);
      const content = fs
        .readFileSync(path.join(dist, "index.html"), "utf8")
        .replace("<!-- BASE -->", `<base href='${relative}' />`);
      res.status(200).contentType("text/html").send(content);
    });
  }
  return router;
}
