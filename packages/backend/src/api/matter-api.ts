import express from "express";
import {
  createBridgeRequestSchema,
  CreateBridgeRequest,
  updateBridgeRequestSchema,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { PortAlreadyInUseError } from "../errors/port-already-in-use-error.js";
import { BridgeService } from "../matter/bridge-service.js";
import { bridgeToJson } from "../utils/json/bridge-to-json.js";
import { deviceToJson } from "../utils/json/device-to-json.js";
import { Ajv } from "ajv";

const ajv = new Ajv();

export function matterApi(bridgeService: BridgeService): express.Router {
  const router = express.Router();
  router.get("/", (_, res) => {
    res.status(200).json({});
  });

  router.get("/bridges", (_, res) => {
    res.status(200).json(bridgeService.bridges.map(bridgeToJson));
  });

  router.post("/bridges", async (req, res) => {
    const body = req.body as CreateBridgeRequest;
    const isValid = ajv.validate(createBridgeRequestSchema, body);
    if (!isValid) {
      res.status(400).json(ajv.errors);
    } else {
      try {
        const bridge = await bridgeService.create(body);
        res.status(200).json(bridgeToJson(bridge));
      } catch (error: unknown) {
        if (error instanceof PortAlreadyInUseError) {
          res.status(400).json({ error: error.message });
        }
        throw error;
      }
    }
  });

  router.get("/bridges/:bridgeId", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      res.status(200).json(bridgeToJson(bridge));
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
      try {
        const bridge = await bridgeService.update(body);
        if (!bridge) {
          res.status(404).send("Not Found");
        } else {
          res.status(200).json(bridgeToJson(bridge));
        }
      } catch (error: unknown) {
        if (error instanceof PortAlreadyInUseError) {
          res.status(400).json({ error: error.message });
        }
        throw error;
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
      res.status(200).json(bridgeToJson(bridge));
    } else {
      res.status(404).send("Not Found");
    }
  });

  router.get("/bridges/:bridgeId/devices", async (req, res) => {
    const bridgeId = req.params.bridgeId;
    const bridge = bridgeService.bridges.find((b) => b.id === bridgeId);
    if (bridge) {
      res.status(200).json(bridge.devices.map(deviceToJson));
    } else {
      res.status(404).send("Not Found");
    }
  });

  return router;
}
