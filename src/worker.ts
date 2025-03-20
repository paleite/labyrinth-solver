import { solveLabyrinth } from "@/lib/labyrinth";

addEventListener(
  "message",
  (event: MessageEvent<{ start: string; end: string; maxDepth: number }>) => {
    postMessage(
      solveLabyrinth(event.data.start, event.data.end, event.data.maxDepth),
    );
  },
);
