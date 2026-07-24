import { describe, expect, it } from "vitest";

import { findShortestPaths } from "./labyrinth";

const collectPaths = (
  start: string,
  end: string,
  dictionary: readonly string[],
  excludedWords: string[] = [],
  maxDepth = 10,
) => [...findShortestPaths(start, end, excludedWords, maxDepth, dictionary)];

describe("findShortestPaths", () => {
  it("emits every deterministic shortest path through shared words", () => {
    const paths = collectPaths("COLD", "WARM", [
      "CORD",
      "CARD",
      "WORD",
      "WARD",
    ]);

    expect(paths).toEqual([
      ["COLD", "CORD", "CARD", "WARD", "WARM"],
      ["COLD", "CORD", "WORD", "WARD", "WARM"],
    ]);
  });

  it("does not emit routes longer than the first solution", () => {
    const paths = collectPaths("AAAA", "BBBB", [
      "BAAA",
      "BBAA",
      "BBBA",
      "AAAC",
      "AACC",
      "ACCC",
      "BCCC",
      "BBCC",
      "BBBC",
    ]);

    expect(paths).toEqual([["AAAA", "BAAA", "BBAA", "BBBA", "BBBB"]]);
  });

  it("respects exclusions while still allowing the destination", () => {
    const paths = collectPaths(
      "COLD",
      "WARM",
      ["CORD", "CARD", "WORD", "WARD"],
      ["CARD", "WARM"],
    );

    expect(paths).toEqual([["COLD", "CORD", "WORD", "WARD", "WARM"]]);
  });

  it("adds unknown endpoints and enforces max depth", () => {
    const dictionary = ["CORD", "CARD", "WARD"];

    expect(collectPaths("COLD", "WARM", dictionary, [], 3)).toEqual([]);
    expect(collectPaths("COLD", "WARM", dictionary, [], 4)).toEqual([
      ["COLD", "CORD", "CARD", "WARD", "WARM"],
    ]);
  });

  it("emits no paths when the destination is unreachable", () => {
    expect(collectPaths("COLD", "WARM", ["CORD"])).toEqual([]);
  });

  it("emits an identical start and destination once", () => {
    expect(collectPaths("SAME", "SAME", [], ["SAME"], 0)).toEqual([["SAME"]]);
  });
});
