import { findShortestPaths, type LabyrinthPath } from "@/lib/labyrinth";

export type SolveLabyrinthRequest = {
  start: string;
  end: string;
  excludedWords: string[];
  maxDepth: number;
};

export type SolveLabyrinthResponse =
  | {
      type: "solution";
      path: LabyrinthPath;
      intervalDuration: number;
    }
  | {
      type: "complete";
      solutionCount: number;
      totalDuration: number;
    };

type SolveLabyrinthEvent = MessageEvent<SolveLabyrinthRequest>;

addEventListener("message", (event: SolveLabyrinthEvent) => {
  const startedAt = performance.now();
  let previousSolutionAt = startedAt;
  let solutionCount = 0;

  for (const path of findShortestPaths(
    event.data.start,
    event.data.end,
    event.data.excludedWords,
    event.data.maxDepth,
  )) {
    const foundAt = performance.now();

    postMessage({
      type: "solution",
      path,
      intervalDuration: foundAt - previousSolutionAt,
    } satisfies SolveLabyrinthResponse);

    previousSolutionAt = foundAt;
    solutionCount += 1;
  }

  postMessage({
    type: "complete",
    solutionCount,
    totalDuration: performance.now() - startedAt,
  } satisfies SolveLabyrinthResponse);
});
