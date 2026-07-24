"use client";

import { ButtonWithLoader } from "@/components/button-with-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emojis } from "@/lib/emojis";
import type { LabyrinthPath } from "@/lib/labyrinth";
import { cn } from "@/lib/utils";
import { words } from "@/lib/words";
import type { SolveLabyrinthRequest, SolveLabyrinthResponse } from "@/worker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ConfettiProps } from "react-confetti-blast";
import ConfettiExplosion from "react-confetti-blast";
import { toast } from "sonner";
import { MultiSelect } from "./multi-select";

const maxDepth = 10;
const knownWords: ReadonlySet<string> = new Set(words);

type Solution = {
  path: LabyrinthPath;
  intervalDuration: number;
};

const largeProps: ConfettiProps = {
  force: 0.8,
  duration: 3000,
  particleCount: 300,
  width: 1600,
  colors: [
    // Blå
    "#0057B7",
    // Gul
    "#FFD700",
  ],
};
function LabyrinthSolver() {
  const [isExploding, setIsExploding] = React.useState(false);

  const [isCalculating, setIsCalculating] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);
  const [wasStopped, setWasStopped] = useState(false);
  const [error, setError] = useState("");
  const workerRef = useRef<Worker>(null);
  const pendingSolutionsRef = useRef<Solution[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const searchStartedAtRef = useRef<number | null>(null);
  const hasCelebratedRef = useRef(false);

  const unknownEndpointWords = [
    start.length === 4 && !knownWords.has(start) ? start : null,
    end.length === 4 && !knownWords.has(end) ? end : null,
  ].filter((word): word is string => word !== null);

  const flushPendingSolutions = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (pendingSolutionsRef.current.length === 0) {
      return;
    }

    const pendingSolutions = pendingSolutionsRef.current;
    pendingSolutionsRef.current = [];
    setSolutions((currentSolutions) => [
      ...currentSolutions,
      ...pendingSolutions,
    ]);
  }, []);

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return terminateWorker;
  }, [terminateWorker]);

  const handleWorker = useCallback(() => {
    terminateWorker();
    pendingSolutionsRef.current = [];
    hasCelebratedRef.current = false;

    const request: SolveLabyrinthRequest = {
      start,
      end,
      excludedWords: [...excludedWords],
      maxDepth,
    };
    const worker = new Worker(new URL("../worker.ts", import.meta.url));
    workerRef.current = worker;

    setError("");
    setSolutions([]);
    setTotalDuration(null);
    setWasStopped(false);
    setIsExploding(false);
    setIsCalculating(true);
    searchStartedAtRef.current = performance.now();

    worker.onmessage = (event: MessageEvent<SolveLabyrinthResponse>) => {
      if (workerRef.current !== worker) {
        return;
      }

      if (event.data.type === "solution") {
        pendingSolutionsRef.current.push({
          path: event.data.path,
          intervalDuration: event.data.intervalDuration,
        });

        if (animationFrameRef.current === null) {
          animationFrameRef.current = requestAnimationFrame(() => {
            animationFrameRef.current = null;
            flushPendingSolutions();
          });
        }

        if (!hasCelebratedRef.current) {
          hasCelebratedRef.current = true;
          toast.success(
            <div className="flex items-center gap-2 text-2xl">
              Clara är bäst ❤️
            </div>,
          );
          setIsExploding(true);
        }

        return;
      }

      flushPendingSolutions();
      setIsCalculating(false);
      setTotalDuration(event.data.totalDuration);
      searchStartedAtRef.current = null;
      worker.terminate();
      workerRef.current = null;

      if (event.data.solutionCount === 0) {
        setError(
          `Hittade inte väg från "${request.start}" till "${request.end}" inom rimligt antal steg.`,
        );
        setIsExploding(false);
      }
    };

    worker.onerror = () => {
      if (workerRef.current !== worker) {
        return;
      }

      flushPendingSolutions();
      setIsCalculating(false);
      setError("Något gick fel när labyrinten söktes igenom.");
      searchStartedAtRef.current = null;
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(request);
  }, [end, excludedWords, flushPendingSolutions, start, terminateWorker]);

  const handleStop = useCallback(() => {
    if (!workerRef.current) {
      return;
    }

    flushPendingSolutions();
    terminateWorker();
    setIsCalculating(false);
    setWasStopped(true);

    if (searchStartedAtRef.current !== null) {
      const stoppedDuration = performance.now() - searchStartedAtRef.current;
      setTotalDuration(stoppedDuration);
      searchStartedAtRef.current = null;
    }
  }, [flushPendingSolutions, terminateWorker]);

  return (
    <div className="container mx-auto max-w-2xl space-y-6 overflow-hidden rounded-lg bg-card p-6 shadow-md">
      <h1 className="text-center text-2xl font-bold">🇸🇪 Labyrintlösaren 🇸🇪</h1>
      <p className="text-center text-sm text-muted-foreground">
        Bättre än svensk fika
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleWorker();
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="start">
                Start {emojis[start as keyof typeof emojis] ?? "🏁"}
              </Label>
              <Input
                id="start"
                value={start}
                onChange={(e) => setStart(e.target.value.toUpperCase())}
                placeholder="Ex. HÖRA"
                minLength={4}
                maxLength={4}
                required
              />
            </div>

            <div className="space-y-2">
              <div>
                <Label htmlFor="end" className="">
                  Slut {emojis[end as keyof typeof emojis] ?? "⛳️"}
                </Label>
              </div>
              <Input
                id="end"
                value={end}
                onChange={(e) => setEnd(e.target.value.toUpperCase())}
                placeholder="Ex. BORG"
                minLength={4}
                maxLength={4}
                required
              />
            </div>

            {unknownEndpointWords.length > 0 && (
              <div
                role="status"
                className="col-span-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
              >
                {unknownEndpointWords.length === 1 ? (
                  <>
                    Ordet <strong>{unknownEndpointWords[0]}</strong> saknas i
                    ordlistan. Det används ändå som start- eller slutord, men
                    inte som ett normalt mellanord.
                  </>
                ) : (
                  <>
                    Orden <strong>{unknownEndpointWords.join(" och ")}</strong>{" "}
                    saknas i ordlistan. De används ändå som start- och slutord,
                    men inte som normala mellanord.
                  </>
                )}
              </div>
            )}

            <div className="col-span-2">
              <details>
                <summary>
                  <Label className="cursor-pointer">Exkludera ord</Label>
                </summary>
                <MultiSelect
                  value={excludedWords}
                  onValueChange={(value) => setExcludedWords(value)}
                  options={words.map((word) => ({
                    value: word,
                    label: word,
                  }))}
                />
              </details>
            </div>

            <div className="col-span-2 w-full space-y-2">
              {isExploding && (
                <div className="col-span-2 flex items-center justify-center bg-red-500">
                  <ConfettiExplosion {...largeProps} />
                </div>
              )}

              <ButtonWithLoader
                isPending={isCalculating}
                disabled={isCalculating}
                className="h-auto w-full"
                renderLoader={
                  <div
                    className={cn(
                      "grid grid-flow-col items-center gap-2 opacity-0 transition-opacity duration-300",
                      isCalculating && "opacity-100",
                    )}
                  >
                    <div className="animate-spin text-5xl">🧠</div>
                  </div>
                }
              >
                Lös labyrinten
              </ButtonWithLoader>
              {isCalculating && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={handleStop}
                >
                  Stoppa sökningen
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {error && <div className="mt-4 text-destructive">{error}</div>}

      {wasStopped && solutions.length === 0 && totalDuration !== null && (
        <p className="text-sm text-muted-foreground">
          Sökningen stoppades efter {totalDuration.toFixed(2)} ms. Inga
          lösningar hade hittats.
        </p>
      )}

      {solutions.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">
            Resultat: {solutions.length}{" "}
            {solutions.length === 1 ? "lösning" : "lösningar"},{" "}
            {solutions[0].path.length - 1} steg
          </h2>
          {solutions.map((solution, solutionIndex) => (
            <div
              key={solution.path.join("→")}
              className="rounded-md bg-muted p-4 [contain-intrinsic-size:auto_8rem] [content-visibility:auto]"
            >
              <h3 className="mb-2 font-semibold">
                Lösning {solutionIndex + 1}
              </h3>
              <div className="flex flex-wrap justify-between">
                {solution.path.map((word, wordIndex, path) => (
                  <React.Fragment key={`${word}-${wordIndex}`}>
                    <span className="whitespace-nowrap font-medium">
                      {`${word} ${emojis[word as keyof typeof emojis] ?? ""}`}
                    </span>
                    {wordIndex < path.length - 1 && (
                      <span className="mx-2">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {solutionIndex === 0
                  ? "Tid till första lösningen"
                  : "Tid sedan föregående lösning"}
                : {solution.intervalDuration.toFixed(2)} ms
              </p>
            </div>
          ))}
          {isCalculating && (
            <p className="text-sm text-muted-foreground">
              Söker efter fler kortaste lösningar…
            </p>
          )}
          {totalDuration !== null && (
            <p className="text-sm text-muted-foreground">
              {wasStopped ? "Sökningen stoppades" : "Sökningen slutfördes"}{" "}
              efter {totalDuration.toFixed(2)} ms. {solutions.length}{" "}
              {solutions.length === 1 ? "lösning hittad" : "lösningar hittade"}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default LabyrinthSolver;
