import { describe, it, beforeEach, vi, expect } from "vitest";
import type {
  HomeAssistantEntityState,
  HomeAssistantEntityStateAttributes,
  LightDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import {
  INSTALL_BEHAVIOR,
} from "@matter/main";
import { LightLevelControlServer } from "./light-level-control-server.js";
import { HomeAssistantEntityBehavior } from "../../../custom-behaviors/home-assistant-entity-behavior.js";
import { applyPatchState } from "../../../../utils/apply-patch-state.js";

const BACKING = Symbol("endpoint-owner");
const STATE = Symbol("state");
const INTERNAL = Symbol("internal");
const EVENTS = Symbol("events");

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
      prototype: {
        [EVENTS]: vi.fn(),
        [INTERNAL]: vi.fn(),
        [STATE]: vi.fn(),
      }
    };

    mockAgent = {
      load: vi.fn().mockResolvedValue(behavior),
      get: vi.fn().mockReturnValue(behavior),
      [INSTALL_BEHAVIOR]: vi.fn(),
    };

    const serverFactory = LightLevelControlServer;
    serverInstance = new (serverFactory as any)(mockAgent);
    // serverInstance.agent = mockAgent;
    // serverInstance.minLevel = 1;
    // serverInstance.maxLevel = 254;
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

      const generateHomeAssistantState = (
        attributes: HomeAssistantEntityStateAttributes<LightDeviceAttributes>
      ): HomeAssistantEntityState<LightDeviceAttributes> => {
        return {
          entity_id: "light.test_light",
          state: "on",
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          attributes: {
            ...attributes
          },
          context: {
            id: "context",
            user_id: null,
            parent_id: null
          }
        }
      }
      
      beforeEach(() => {
        getValuePercent = serverInstance.config?.getValuePercent
          ?? (LightLevelControlServer as any).config?.getValuePercent;
      })

      it("returns normalized brightness if brightness is set", () => {
          const result = getValuePercent(generateHomeAssistantState({brightness: 128}));
          expect(result).toBeCloseTo(128 / 255, 5);
      });

      it("returns 0.0 if brightness is undefined", () => {
          const result = getValuePercent(generateHomeAssistantState({}));
          expect(result).toBe(0.0);
      });

      it("handles edge case of max brightness (255)", () => {
          const result = getValuePercent(generateHomeAssistantState({brightness: 255}));
          expect(result).toBeCloseTo(1.0);
      });

      it("handles edge case of min brightness (0)", () => {
          const result = getValuePercent(generateHomeAssistantState({brightness: 0}));
          expect(result).toBeCloseTo(0.0);
      });
    });
  });
});