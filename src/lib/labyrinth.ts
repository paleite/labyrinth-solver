import { words } from "./words";

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

export type LabyrinthPath = string[];

function* findShortestPaths(
  start: string,
  end: string,
  excludedWords: string[],
  maxDepth: number,
  dictionary: readonly string[] = words,
): Generator<LabyrinthPath> {
  // The dictionary controls intermediate words. Start and end are always
  // valid graph nodes, even when they are absent from the dictionary.
  const candidateWords = [...new Set([...dictionary, start, end])];
  const excludedWordSet = new Set(excludedWords);
  const queue: LabyrinthPath[] = [[start]];
  let queueIndex = 0;
  const bestDepthByWord = new Map<string, number>([[start, 0]]);
  const yieldedPaths = new Set<string>();
  let shortestDepth: number | null = null;

  while (queueIndex < queue.length) {
    const path = queue[queueIndex++];
    const currentWord = path.at(-1);
    const currentDepth = path.length - 1;

    if (!currentWord) {
      continue;
    }

    if (shortestDepth !== null && currentDepth > shortestDepth) {
      break;
    }

    if (currentWord === end) {
      shortestDepth ??= currentDepth;

      const pathKey = path.join("\0");
      if (!yieldedPaths.has(pathKey)) {
        yieldedPaths.add(pathKey);
        yield path;
      }

      continue;
    }

    if (currentDepth >= maxDepth) {
      continue;
    }

    const neighbors = [
      ...findWordsWithOneLetterDifference(currentWord, candidateWords),
      ...findWordsWithSameLetters(currentWord, candidateWords),
    ].filter((word) => word === end || !excludedWordSet.has(word));

    for (const neighbor of neighbors) {
      const neighborDepth = currentDepth + 1;
      const bestKnownDepth = bestDepthByWord.get(neighbor);

      if (bestKnownDepth !== undefined && bestKnownDepth < neighborDepth) {
        continue;
      }

      if (bestKnownDepth === undefined) {
        bestDepthByWord.set(neighbor, neighborDepth);
      }

      queue.push([...path, neighbor]);
    }
  }
}

export { findShortestPaths };
