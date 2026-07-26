import { describe, expect, it } from "vitest";
import { getRestTimerRemainingSeconds } from "./restTimer";

describe("getRestTimerRemainingSeconds", () => {
  const timer = {
    exerciseIndex: 1,
    nextSetIndex: 2,
    endsAt: 90_000,
  };

  it("keeps the countdown accurate after time away from the active screen", () => {
    expect(getRestTimerRemainingSeconds(timer, 45_100)).toBe(45);
  });

  it("never returns a negative countdown after the rest has finished", () => {
    expect(getRestTimerRemainingSeconds(timer, 91_000)).toBe(0);
  });
});
