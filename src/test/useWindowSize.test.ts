import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowSize } from "../hooks/useWindowSize";

describe("useWindowSize", () => {
  it("returns current window dimensions on mount", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);
  });

  it("isMobile is true when width < 768", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 375 });
    const { result } = renderHook(() => useWindowSize());
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.isMobile).toBe(true);
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1280,
    });
  });
});
