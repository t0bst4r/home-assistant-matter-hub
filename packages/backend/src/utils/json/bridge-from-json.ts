import { BridgeData } from "@home-assistant-matter-hub/common";
import { Node, ServerNode } from "@project-chip/matter.js/node";
import { Environment } from "@project-chip/matter.js/environment";
import _ from "lodash";
import { ExposedFabricInformation } from "@project-chip/matter.js/fabric";
import {
  FabricId,
  FabricIndex,
  NodeId,
  VendorId,
} from "@project-chip/matter.js/datatype";
import { AggregatorEndpoint } from "@project-chip/matter.js/endpoints/AggregatorEndpoint";
import crypto from "node:crypto";

type ServerNodeConfiguration = Node.Configuration<ServerNode.RootEndpoint>;

export function bridgeFromJson(
  environment: Environment,
  data: BridgeData,
): ServerNodeConfiguration {
  const commissioning: ServerNodeConfiguration["commissioning"] =
    data.commissioning
      ? {
          commissioned: data.commissioning.isCommissioned,
          passcode: data.commissioning.passcode,
          discriminator: data.commissioning.discriminator,
          pairingCodes: {
            manualPairingCode: data.commissioning.manualPairingCode,
            qrPairingCode: data.commissioning.qrPairingCode,
          },
          fabrics: _.fromPairs(
            data.commissioning.fabrics
              .map<ExposedFabricInformation>((fabric) => ({
                fabricIndex: FabricIndex(fabric.fabricIndex),
                fabricId: FabricId(fabric.fabricId),
                nodeId: NodeId(fabric.nodeId),
                rootNodeId: NodeId(fabric.rootNodeId),
                rootVendorId: VendorId(fabric.rootVendorId),
                label: fabric.label,
              }))
              .map((fabric) => [fabric.fabricIndex, fabric]),
          ),
        }
      : undefined;

  return {
    type: ServerNode.RootEndpoint,
    environment: environment,
    id: data.id,
    network: {
      port: data.port,
    },
    commissioning: commissioning,
    productDescription: {
      name: data.name,
      deviceType: AggregatorEndpoint.deviceType,
    },
    basicInformation: {
      uniqueId: data.id,
      nodeLabel: data.name,
      vendorId: data.basicInformation.vendorId,
      vendorName: data.basicInformation.vendorName,
      productId: data.basicInformation.productId,
      productName: data.basicInformation.productName,
      productLabel: data.basicInformation.productLabel,
      serialNumber: crypto
        .createHash("md5")
        .update(`serial-${data.id}`)
        .digest("hex")
        .substring(0, 32),
      hardwareVersion: data.basicInformation.hardwareVersion,
      softwareVersion: data.basicInformation.softwareVersion,
    },
  };
}
