import { describe, expect, it, vi } from "vitest";
import { DebounceContext } from "./debounce-context.js";

describe("DebounceContext", () => {
  it("should debounce a function", async () => {
    const times: number[] = [];
    const callback = vi.fn((_: string, __: string[]) => times.push(Date.now()));
    const context = new DebounceContext<string>(callback);

    const fn = context.get("one-key", 50);

    const start = Date.now();
    fn("one");
    fn("two");
    fn("three");
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(times.length).toEqual(1);
    expect(times[0] - start).toBeGreaterThanOrEqual(50);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("one-key", ["one", "two", "three"]);
  });

  it("should not mix up multiple debouncers", async () => {
    const callback = vi.fn((_: string, __: string[]) => {});
    const context = new DebounceContext<string>(callback);

    const fnOne = context.get("one-key", 75);
    const fnTwo = context.get("two-key", 50);

    fnOne("one.1");
    fnTwo("two.1");
    fnTwo("two.2");
    fnOne("one.2");
    fnOne("one.3");
    fnTwo("two.3");

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "two-key", [
      "two.1",
      "two.2",
      "two.3",
    ]);
    expect(callback).toHaveBeenNthCalledWith(2, "one-key", [
      "one.1",
      "one.2",
      "one.3",
    ]);
  });

  it("should call a debouncer twice", async () => {
    const times: number[] = [];
    const callback = vi.fn((_key: string, _payload: string[]) => {
      times.push(Date.now());
    });
    const context = new DebounceContext<string>(callback);

    const fn = context.get("one-key", 75);
    const start = Date.now();

    fn("one.1");
    fn("one.2");
    fn("one.3");

    await new Promise((resolve) => setTimeout(resolve, 200));

    fn("two.1");
    fn("two.2");
    fn("two.3");

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(times.length).toEqual(2);
    expect(times[0] - start).toBeGreaterThanOrEqual(75);
    expect(times[1] - times[0]).toBeGreaterThanOrEqual(75);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "one-key", [
      "one.1",
      "one.2",
      "one.3",
    ]);
    expect(callback).toHaveBeenNthCalledWith(2, "one-key", [
      "two.1",
      "two.2",
      "two.3",
    ]);
  });
});
