import { Bridge } from "../../matter/bridge.js";
import { BridgeData } from "@home-assistant-matter-hub/common";
import _ from "lodash";

export function bridgeToJson(bridge: Bridge): BridgeData {
  return {
    id: bridge.id,
    name: bridge.name,
    port: bridge.port,
    compatibility: bridge.compatibility,
    filter: bridge.filter,
    overrides: bridge.overrides,
    basicInformation: bridge.basicInformation,
    deviceCount: bridge.devices.length,
    commissioning: bridge.commissioning
      ? {
          isCommissioned: bridge.commissioning.commissioned,
          passcode: bridge.commissioning.passcode,
          discriminator: bridge.commissioning.discriminator,
          manualPairingCode:
            bridge.commissioning.pairingCodes.manualPairingCode,
          qrPairingCode: bridge.commissioning.pairingCodes.qrPairingCode,
          fabrics: _.values(bridge.commissioning.fabrics).map((fabric) => ({
            fabricIndex: fabric.fabricIndex,
            fabricId: Number(fabric.fabricId),
            nodeId: Number(fabric.nodeId),
            rootNodeId: Number(fabric.rootNodeId),
            rootVendorId: fabric.rootVendorId,
            label: fabric.label,
          })),
        }
      : undefined,
  };
}
