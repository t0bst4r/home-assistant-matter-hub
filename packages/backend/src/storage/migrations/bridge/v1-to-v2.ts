import type { StorageContext } from "@matter/main";

export async function migrateBridgeV1ToV2(
  storage: StorageContext,
): Promise<number> {
  const bridgeIds = JSON.parse(await storage.get("ids", "[]")) as string[];
  await storage.set("ids", bridgeIds);

  for (const bridgeId of bridgeIds) {
    const bridgeValue = await storage.get<string | undefined>(bridgeId);
    if (bridgeValue === undefined) {
      continue;
    }
    const bridge = JSON.parse(bridgeValue);
    bridge.compatibility = undefined;
    await storage.set(bridgeId, bridge);
  }
  return 2;
}
