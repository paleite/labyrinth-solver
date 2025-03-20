"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonWithLoader } from "@/components/button-with-loader";
import { Loader2 } from "lucide-react";
const maxDepth = 10;

function LabyrinthSolver() {
  const [isPending, setIsPending] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [path, setPath] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../worker.ts", import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<string[] | null>) => {
      setIsPending(false);
      console.log("returned from worker");
      performance.mark("end");
      performance.measure("worker", "start", "end");
      const result = event.data;
      setPath(result);
      setDuration(performance.getEntriesByName("worker").at(-1)?.duration ?? 0);

      if (!result) {
        setError(
          `No path found from "${start}" to "${end}" within depth ${maxDepth}`,
        );
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [end, start]);

  const handleWorker = useCallback(async () => {
    setError("");

    // Validate inputs
    if (start.length !== 4) {
      setError("Start word must be exactly 4 letters long");
      return;
    }

    if (end.length !== 4) {
      setError("End word must be exactly 4 letters long");
      return;
    }

    console.log("sending to worker");
    setIsPending(true);
    performance.mark("start");
    workerRef.current?.postMessage({ start, end, maxDepth });
  }, [start, end]);

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-lg bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Labyrinth Solver</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start">Start Word (4 letters)</Label>
          <Input
            id="start"
            value={start}
            onChange={(e) => setStart(e.target.value.toLowerCase())}
            placeholder="Enter start word"
            maxLength={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end">End Word (4 letters)</Label>
          <Input
            id="end"
            value={end}
            onChange={(e) => setEnd(e.target.value.toLowerCase())}
            placeholder="Enter end word"
            maxLength={4}
          />
        </div>

        <ButtonWithLoader
          isPending={isPending}
          onClick={handleWorker}
          className="w-full"
          renderLoader={<Loader2 className="h-4 w-4 animate-spin" />}
        >
          Solve
        </ButtonWithLoader>
      </div>

      {error && <div className="mt-4 text-destructive">{error}</div>}

      {path && !error && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">Solution Path</h2>
          <span>Time taken: {duration}ms</span>
          <div className="rounded-md bg-muted p-4">
            <div className="flex flex-wrap gap-2">
              {path.map((word, index) => (
                <div key={index} className="flex items-center">
                  <span className="font-medium">{word}</span>
                  {index < path.length - 1 && <span className="mx-2">→</span>}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Path length: {path.length - 1} steps
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabyrinthSolver;
