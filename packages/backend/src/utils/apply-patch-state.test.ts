import { beforeEach, describe, expect, it } from "vitest";
import { applyPatchState } from "./apply-patch-state.js";

interface MyState {
  health: number;
  name: string;
  weapons: string[];
  additionalAttributes: {
    height: number;
    weight: number;
    armor: string[];
  };
}

describe("applyPatchState", () => {
  let state: MyState;
  beforeEach(() => {
    state = {
      health: 95,
      name: "awesome knight",
      weapons: ["axe", "sword"],
      additionalAttributes: {
        height: 180,
        weight: 80,
        armor: ["shield", "helmet"],
      },
    };
  });

  it("should only not patch unchanged properties", async () => {
    const actualPatch = applyPatchState(state, {
      health: 95,
      name: "awesome knight",
      weapons: ["axe", "sword"],
      additionalAttributes: {
        height: 180,
        weight: 80,
        armor: ["shield", "helmet"],
      },
    });
    expect(actualPatch).toEqual({});
    expect(state).toEqual({
      health: 95,
      name: "awesome knight",
      weapons: ["axe", "sword"],
      additionalAttributes: {
        height: 180,
        weight: 80,
        armor: ["shield", "helmet"],
      },
    });
  });

  it("should patch changed properties", async () => {
    const actualPatch = applyPatchState(state, {
      health: 90,
      name: "ultra knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(actualPatch).toEqual({
      health: 90,
      name: "ultra knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(state).toEqual({
      health: 90,
      name: "ultra knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
  });

  it("should patch a state partially", async () => {
    const actualPatch = applyPatchState(state, {
      name: "awesome knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(actualPatch).toEqual({
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
    expect(state).toEqual({
      health: 95,
      name: "awesome knight",
      weapons: ["bow", "axe"],
      additionalAttributes: {
        height: 177,
        weight: 79,
        armor: ["metal helmet"],
      },
    });
  });

  it("should ignore undefined and not mess with zero and null", async () => {
    const state: Record<
      "a" | "b" | "c" | "d",
      string | number | undefined | null
    > = {
      a: undefined,
      b: null,
      c: 0,
      d: "",
    };
    const patch = applyPatchState(state, {
      a: 0,
      b: 0,
      c: undefined,
      d: 0,
    });
    expect(patch).toEqual({ a: 0, b: 0, d: 0 });
    expect(state).toEqual({ a: 0, b: 0, c: 0, d: 0 });
  });

  it("should handle rapid sequential updates without errors", async () => {
    let updateCount = 0;

    // Simulate many rapid state changes
    for (let i = 0; i < 1000; i++) {
      const patch = applyPatchState(state, {
        health: i % 2 === 0 ? 90 : 95,
        name: i % 2 === 0 ? "knight" : "awesome knight",
        weapons: i % 3 === 0 ? ["bow"] : ["axe", "sword"],
      });
      if (Object.keys(patch).length > 0) {
        updateCount++;
      }
    }

    expect(state.health).toBe(95);
    expect(state.name).toBe("awesome knight");
    expect(state.weapons).toEqual(["bow"]);
    expect(updateCount).toBeGreaterThan(0);
  });

  it("should work correctly with objects that have property setters", async () => {
    let setterCallCount = 0;
    const stateWithSetters = {
      _value: 0,
      get value() {
        return this._value;
      },
      set value(v: number) {
        setterCallCount++;
        this._value = v;
      },
      normalProp: "test",
    };

    const patch = applyPatchState(stateWithSetters, {
      value: 42,
      normalProp: "updated",
    });

    // Setter should be invoked by property assignment
    expect(setterCallCount).toBe(1);
    expect(stateWithSetters.value).toBe(42);
    expect(stateWithSetters.normalProp).toBe("updated");
    expect(patch).toEqual({ value: 42, normalProp: "updated" });
  });
});
