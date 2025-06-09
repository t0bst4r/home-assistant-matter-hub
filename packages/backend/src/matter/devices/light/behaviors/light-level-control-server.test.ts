import { describe, it, beforeEach, vi, expect } from "vitest";
import type {
  HomeAssistantEntityState,
  LightDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { HomeAssistantEntityBehavior } from "../../../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../../../utils/apply-patch-state.js";

// 🧼 Mock the hell out of everything
vi.mock("../custom-behaviors/home-assistant-entity-behavior", () => ({
  HomeAssistantEntityBehavior: vi.fn(),
}));

vi.mock("../../utils/apply-patch-state", () => ({
  applyPatchState: vi.fn(),
}));

describe("LightLevelControlServer", () => {
  let mockAgent: any;
  let mockEntity: any;
  let serverInstance: any;

  beforeEach(() => {
    mockEntity = {
      state: {
        attributes: {
          brightness: 128,
        },
      },
    };

    const mockOnChange = {
      subscribe: vi.fn(),
    };

    const behavior = {
      entity: mockEntity,
      onChange: mockOnChange,
      callAction: vi.fn(),
    };

    mockAgent = {
      load: vi.fn().mockResolvedValue(behavior),
      get: vi.fn().mockReturnValue(behavior),
    };

    const serverFactory = LightLevelControlServer;
    serverInstance = new (serverFactory as any).constructor();
    serverInstance.agent = mockAgent;
    serverInstance.minLevel = 1;
    serverInstance.maxLevel = 254;
  });

  it("calls applyPatchState with correct values during initialize", async () => {
    await serverInstance.initialize();

    expect(mockAgent.load).toHaveBeenCalledWith(HomeAssistantEntityBehavior);
    expect(applyPatchState).toHaveBeenCalledWith(expect.anything(), {
      minLevel: 1,
      maxLevel: 254,
      currentLevel: expect.any(Number),
      onLevel: expect.any(Number),
    });
  });

  it("calls Home Assistant action if level changes", async () => {
    mockEntity.State.attributes.brightness = 64;

    const callActionSpy = vi.fn();
    mockAgent.get = vi.fn().mockReturnValue({
      entity: mockEntity,
      callAction: callActionSpy,
    });

    await serverInstance.moveToLevelLogic(200);

    expect(callActionSpy).toHaveBeenCalledWith({
      action: "light.turn_on",
      data: {
        brightness: expect.any(Number),
      },
    });
  });

  it("does not call Home Assistant action if level is the same", async () => {
    const brightness = 128;
    mockEntity.State.attributes.brightness = brightness;
    const level = Math.round((brightness / 255) * (254 - 1) + 1);

    const callActionSpy = vi.fn();
    mockAgent.get = vi.fn().mockReturnValue({
      entity: mockEntity,
      callAction: callActionSpy,
    });

    await serverInstance.moveToLevelLogic(level);

    expect(callActionSpy).not.toHaveBeenCalled();
  });

  describe("LightLevelControlServerConfig", () => {
    describe("getValuePercent", () => {
      let getValuePercent: (state: HomeAssistantEntityState<LightDeviceAttributes>) => number;
      
      beforeEach(() => {
        getValuePercent = serverInstance.config?.getValuePercent
          ?? (LightLevelControlServer as any).config?.getValuePercent;
      })

      it("returns normalized brightness if brightness is set", () => {
          const state = { attributes: { brightness: 128 } };
          const result = getValuePercent(state);
          expect(result).toBeCloseTo(128 / 255, 5);
      });

      it("returns 0.0 if brightness is null", () => {
          const state = { attributes: { brightness: null } };
          const result = getValuePercent(state);
          expect(result).toBe(0.0);
      });

      it("returns 0.0 if brightness is undefined", () => {
          const state = { attributes: {} };
          const result = getValuePercent(state);
          expect(result).toBe(0.0);
      });

      it("returns 0.0 if attributes are missing entirely", () => {
          const state = {};
          const result = getValuePercent(state);
          expect(result).toBe(0.0);
      });

      it("handles edge case of max brightness (255)", () => {
          const state = { attributes: { brightness: 255 } };
          const result = getValuePercent(state);
          expect(result).toBeCloseTo(1.0);
      });

      it("handles edge case of min brightness (0)", () => {
          const state = { attributes: { brightness: 0 } };
          const result = getValuePercent(state);
          expect(result).toBeCloseTo(0.0);
      });
    });
  });
});