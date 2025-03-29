import { words } from "@/lib/words";

const findWordsWithOneLetterDifference = (word: string) => {
  return words.filter(
    (w: string) =>
      w.length === word.length &&
      w.split("").filter((l, i) => l !== word[i]).length === 1,
  );
};

const findWordsWithSameLetters = (word: string) => {
  return words.filter(
    (w: string) =>
      w.length === word.length &&
      w.split("").sort().join("") === word.split("").sort().join(""),
  );
};

const bfsFindShortestPath = (
  start: string,
  end: string,
  excludedWords: string[],
  maxDepth: number,
): string[] | null => {
  const queue: [string, string[]][] = [[start, [start]]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const [currentWord, path] = queue.shift()!;

    if (path.length > maxDepth + 1) {
      continue; // Stop exploring deeper paths
    }

    if (currentWord === end) {
      return path; // Return the shortest path
    }

    const neighbors = [
      ...findWordsWithOneLetterDifference(currentWord),
      ...findWordsWithSameLetters(currentWord),
    ].filter((word) => !excludedWords.includes(word));
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }

  return null; // No path found within maxDepth
};

const solveLabyrinth = (
  start: string,
  end: string,
  excludedWords: string[],
  maxDepth: number,
) => {
  const path = bfsFindShortestPath(start, end, excludedWords, maxDepth);
  return path;
};

export type Labyrinth = ReturnType<typeof solveLabyrinth>;

export { solveLabyrinth };
