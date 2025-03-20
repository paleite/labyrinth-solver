"use client";

import { ButtonWithLoader } from "@/components/button-with-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Labyrinth } from "@/lib/labyrinth";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ConfettiProps } from "react-confetti-blast";
import ConfettiExplosion from "react-confetti-blast";
import { toast } from "sonner";

const maxDepth = 10;

const largeProps: ConfettiProps = {
  force: 0.8,
  duration: 3000,
  particleCount: 300,
  width: 1600,
  colors: ["#041E43", "#1471BF", "#5BB4DC", "#FC027B", "#66D805"],
};
function LabyrinthSolver() {
  const [isExploding, setIsExploding] = React.useState(false);

  const [isCalculating, setIsCalculating] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [path, setPath] = useState<Labyrinth>(null);
  const [error, setError] = useState("");
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../worker.ts", import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<Labyrinth>) => {
      performance.mark("end");
      performance.measure("worker", "start", "end");
      setIsCalculating(false);

      const result = event.data;
      setPath(result);
      setDuration(performance.getEntriesByName("worker").at(-1)?.duration ?? 0);

      if (!result) {
        setError(
          `No path found from "${start}" to "${end}" within ${maxDepth} steps`,
        );

        setIsExploding(false);
      } else {
        toast.success(
          <div className="flex items-center gap-2 text-2xl">
            Clara är bäst ❤️
          </div>,
        );

        setIsExploding(true);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [end, start]);

  const handleWorker = useCallback(async () => {
    setError("");
    setPath(null);
    setIsExploding(false);
    setIsCalculating(true);
    performance.mark("start");
    workerRef.current?.postMessage({ start, end, maxDepth });
  }, [start, end]);

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-lg bg-card p-6 shadow-md">
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
              <Label htmlFor="start">Start 🏁</Label>
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
                  Slut ⛳️
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

            <div className="col-span-2 w-full">
              {isExploding && (
                <div className="col-span-2 flex items-center justify-center bg-red-500">
                  <ConfettiExplosion {...largeProps} />
                </div>
              )}

              <ButtonWithLoader
                isPending={isCalculating}
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
            </div>
          </div>
        </div>
      </form>

      {error && <div className="mt-4 text-destructive">{error}</div>}

      {path && !error && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">
            Resultat: {path.length - 1} steg
          </h2>
          <div className="rounded-md bg-muted p-4">
            <div className="grid grid-flow-col justify-between">
              {/* <div className="bg-red-500/50 grid gap-x-6 gap-y-6"> */}
              {path.map((word, index) => (
                <React.Fragment key={index}>
                  <span className="font-medium">{word}</span>
                  {index < path.length - 1 && <span className="mx-2">→</span>}
                </React.Fragment>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Tid: {duration.toFixed(2)} ms
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabyrinthSolver;
