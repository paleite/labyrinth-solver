import { solveLabyrinth } from "@/lib/labyrinth";

export type SolveLabyrinthEvent = MessageEvent<{
  start: string;
  end: string;
  excludedWords: string[];
  maxDepth: number;
}>;

addEventListener("message", (event: SolveLabyrinthEvent) => {
  postMessage(
    solveLabyrinth(
      event.data.start,
      event.data.end,
      event.data.excludedWords,
      event.data.maxDepth,
    ),
  );
});
