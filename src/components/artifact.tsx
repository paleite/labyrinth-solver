"use client";

import { useState, useEffect } from "react";
import { solveLabyrinth } from "./labyrinth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function LabyrinthSolver() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [path, setPath] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const maxDepth = 10;

  const handleSolve = () => {
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

    // Solve labyrinth
    const result = solveLabyrinth(start, end, maxDepth);
    setPath(result);

    if (!result) {
      setError(
        `No path found from "${start}" to "${end}" within depth ${maxDepth}`,
      );
    }
  };

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

        <Button onClick={handleSolve} className="w-full">
          Solve
        </Button>
      </div>

      {error && <div className="mt-4 text-destructive">{error}</div>}

      {path && !error && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">Solution Path</h2>
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
