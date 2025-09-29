import type { StorageContext } from "@matter/main";

export async function migrateBridgeV3ToV4(
  storage: StorageContext,
): Promise<number> {
  const bridgeIds = await storage.get<string[]>("ids", []);

  for (const bridgeId of bridgeIds) {
    const bridgeValue = await storage.get<{} | undefined>(bridgeId);
    if (bridgeValue === undefined) {
      continue;
    }

    const bridge = bridgeValue as Record<string, unknown>;
    const featureFlags = bridge.featureFlags as Record<string, unknown>;
    if (featureFlags) {
      featureFlags.coverDoNotInvertPercentage =
        featureFlags.mimicHaCoverPercentage ?? false;
      featureFlags.coverSwapOpenClose =
        featureFlags.mimicHaCoverPercentage ?? false;
      featureFlags.mimicHaCoverPercentage = undefined;
      await storage.set(bridgeId, bridgeValue);
    }
  }
  return 4;
}
