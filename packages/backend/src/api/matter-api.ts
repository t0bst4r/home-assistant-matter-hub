import {
  type CreateBridgeRequest,
  createBridgeRequestSchema,
  type UpdateBridgeRequest,
  updateBridgeRequestSchema,
} from "@home-assistant-matter-hub/common";
import { Ajv } from "ajv";
import express from "express";
import type { BridgeService } from "../services/bridges/bridge-service.js";
import { endpointToJson } from "../utils/json/endpoint-to-json.js";

const ajv = new Ajv();

export function matterApi(bridgeService: BridgeService): express.Router {
  const router = express.Router();
  router.get("/", (_, res) => {
    res.status(200).json({});
  });

  router.get("/bridges", async (_, res) => {
    res.status(200).json(bridgeService.bridges.map((b) => b.data));
  });

  router.post("/bridges", async (req, res) => {
    const body = req.body as CreateBridgeRequest;
    const isValid = ajv.validate(createBridgeRequestSchema, body);
    if (!isValid) {
      res.status(400).json(ajv.errors);
    } else {
      const bridge = await bridgeService.create(body);
      res.status(200).json(bridge.data);
    }
  });

  router.get("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.get(bridgeId);
    if (bridge) {
      res.status(200).json(bridge.data);
    } else {
      res.status(404).send("Not Found");
    }
  });

  router.put("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const body = req.body as UpdateBridgeRequest;
    const isValid = ajv.validate(updateBridgeRequestSchema, body);
    if (!isValid) {
      res.status(400).json(ajv.errors);
    } else if (bridgeId !== body.id) {
      res.status(400).send("Path variable `bridgeId` does not match `body.id`");
    } else {
      const bridge = await bridgeService.update(body);
      if (!bridge) {
        res.status(404).send("Not Found");
      } else {
        res.status(200).json(bridge.data);
      }
    }
  });

  router.delete("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    await bridgeService.delete(bridgeId);
    res.status(204).send();
  });

  router.get("/bridges/:bridgeId/actions/factory-reset", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      await bridge.factoryReset();
      await bridge.start();
      res.status(200).json(bridge.data);
    } else {
      res.status(404).send("Not Found");
    }
  });

  router.get("/bridges/:bridgeId/devices", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      res.status(200).json(endpointToJson(bridge.server));
    } else {
      res.status(404).send("Not Found");
    }
  });

  return router;
}
