import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "./csv";

describe("escapeCsvCell", () => {
  it.each(["=1+1", "+1", "-1", "@SUM(A1:A2)", "\t=1+1"])(
    "prefixes spreadsheet formula values with an apostrophe: %s",
    (value) => {
      expect(escapeCsvCell(value)).toBe(`"'${value}"`);
    },
  );

  it("escapes quotes and preserves ordinary values", () => {
    expect(escapeCsvCell('waybill "123"')).toBe('"waybill ""123"""');
    expect(escapeCsvCell(123)).toBe('"123"');
  });
});
