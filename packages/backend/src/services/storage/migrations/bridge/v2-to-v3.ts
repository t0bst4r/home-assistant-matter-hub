import type { StorageContext } from "@matter/main";

export async function migrateBridgeV2ToV3(
  storage: StorageContext,
): Promise<number> {
  const bridgeIdsValue = await storage.get<string | string[]>("ids", []);
  let bridgeIds: string[];
  if (typeof bridgeIdsValue === "string") {
    bridgeIds = JSON.parse(bridgeIdsValue);
    await storage.set("ids", bridgeIds);
  } else {
    bridgeIds = bridgeIdsValue;
  }

  for (const bridgeId of bridgeIds) {
    const bridgeValue = await storage.get<string | {} | undefined>(bridgeId);
    if (bridgeValue === undefined) {
      continue;
    }
    let bridge: {};
    if (typeof bridgeValue === "string") {
      bridge = JSON.parse(bridgeValue);
    } else {
      bridge = bridgeValue;
    }
    await storage.set(bridgeId, bridge);
  }
  return 3;
}
