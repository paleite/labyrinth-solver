import { words } from "@/lib/words";

const findWordsWithOneLetterDifference = (
  word: string,
  candidateWords: readonly string[],
) => {
  return candidateWords.filter(
    (candidateWord) =>
      candidateWord.length === word.length &&
      candidateWord.split("").filter((letter, index) => letter !== word[index])
        .length === 1,
  );
};

const createAnagramSignature = (word: string) => word.split("").sort().join("");

const findWordsWithSameLetters = (
  word: string,
  candidateWords: readonly string[],
) => {
  const wordSignature = createAnagramSignature(word);

  return candidateWords.filter(
    (candidateWord) =>
      candidateWord !== word &&
      candidateWord.length === word.length &&
      createAnagramSignature(candidateWord) === wordSignature,
  );
};

const bfsFindShortestPath = (
  start: string,
  end: string,
  excludedWords: string[],
  maxDepth: number,
): string[] | null => {
  // The dictionary controls intermediate words. Start and end are always
  // valid graph nodes, even when they are absent from the dictionary.
  const candidateWords = [...new Set([...words, start, end])];
  const excludedWordSet = new Set(excludedWords);
  const queue: [string, string[]][] = [[start, [start]]];
  let queueIndex = 0;
  const visited = new Set<string>([start]);

  while (queueIndex < queue.length) {
    const [currentWord, path] = queue[queueIndex++];

    if (currentWord === end) {
      return path;
    }

    if (path.length >= maxDepth + 1) {
      continue;
    }

    const neighbors = [
      ...findWordsWithOneLetterDifference(currentWord, candidateWords),
      ...findWordsWithSameLetters(currentWord, candidateWords),
    ].filter((word) => word === end || !excludedWordSet.has(word));

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);
      queue.push([neighbor, [...path, neighbor]]);
    }
  }

  return null;
};

const solveLabyrinth = (
  start: string,
  end: string,
  excludedWords: string[],
  maxDepth: number,
) => {
  return bfsFindShortestPath(start, end, excludedWords, maxDepth);
};

export type Labyrinth = ReturnType<typeof solveLabyrinth>;

export { solveLabyrinth };
