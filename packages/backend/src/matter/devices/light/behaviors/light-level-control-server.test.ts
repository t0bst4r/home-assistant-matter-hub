import { LightLevelControlServer } from "./light-level-control-server";
import { HomeAssistantEntityBehavior } from "../custom-behaviors/home-assistant-entity-behavior";
import { applyPatchState } from "../../utils/apply-patch-state";

jest.mock("../custom-behaviors/home-assistant-entity-behavior");
jest.mock("../../utils/apply-patch-state");

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
      subscribe: jest.fn(),
    };

    const behavior = {
      entity: mockEntity,
      onChange: mockOnChange,
      callAction: jest.fn(),
    };

    mockAgent = {
      load: jest.fn().mockResolvedValue(behavior),
      get: jest.fn().mockReturnValue(behavior),
    };

    const serverFactory = LightLevelControlServer;
    serverInstance = new (serverFactory as any).constructor();
    serverInstance.agent = mockAgent;
    serverInstance.state = {
      config: serverFactory.state?.config ?? serverFactory?.config,
      onLevel: 50,
    };
    serverInstance.minLevel = 1;
    serverInstance.maxLevel = 254;
  });

  it("should call applyPatchState with correct values during initialize", async () => {
    await serverInstance.initialize();

    expect(mockAgent.load).toHaveBeenCalledWith(HomeAssistantEntityBehavior);
    expect(applyPatchState).toHaveBeenCalledWith(expect.anything(), {
      minLevel: 1,
      maxLevel: 254,
      currentLevel: expect.any(Number),
      onLevel: expect.any(Number),
    });
  });

  it("should call Home Assistant action if level changes", async () => {
    mockEntity.state.attributes.brightness = 64;
    const callActionSpy = jest.fn();
    mockAgent.get = jest.fn().mockReturnValue({
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

  it("should not call Home Assistant action if level is the same", async () => {
    const brightness = 128;
    mockEntity.state.attributes.brightness = brightness;
    const level = Math.round((brightness / 255) * (254 - 1) + 1);

    const callActionSpy = jest.fn();
    mockAgent.get = jest.fn().mockReturnValue({
      entity: mockEntity,
      callAction: callActionSpy,
    });

    await serverInstance.moveToLevelLogic(level);

    expect(callActionSpy).not.toHaveBeenCalled();
  });

  describe("LightLevelControlServerConfig", () => {
    describe("getValuePercent", () => {
        const getValuePercent = LightLevelControlServer.state?.config?.getValuePercent
            ?? (LightLevelControlServer as any).config?.getValuePercent;

        it("should return normalized brightness if brightness is set", () => {
            const state = { attributes: { brightness: 128 } };
            const result = getValuePercent(state);
            expect(result).toBeCloseTo(128 / 255, 5);
        });

        it("should return 0.0 if brightness is null", () => {
            const state = { attributes: { brightness: null } };
            const result = getValuePercent(state);
            expect(result).toBe(0.0);
        });

        it("should return 0.0 if brightness is undefined", () => {
            const state = { attributes: {} };
            const result = getValuePercent(state);
            expect(result).toBe(0.0);
        });

        it("should return 0.0 if attributes is missing entirely", () => {
            const state = {};
            const result = getValuePercent(state);
            expect(result).toBe(0.0);
        });

        it("should handle edge cases like max brightness (255)", () => {
            const state = { attributes: { brightness: 255 } };
            const result = getValuePercent(state);
            expect(result).toBeCloseTo(1.0);
        });

        it("should handle edge cases like min brightness (0)", () => {
            const state = { attributes: { brightness: 0 } };
            const result = getValuePercent(state);
            expect(result).toBeCloseTo(0.0);
        });
    });
  });
});