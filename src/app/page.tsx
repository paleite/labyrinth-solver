"use client";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";
const Artifact = dynamic(() => import("@/components/artifact"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 antialiased">
      <Artifact />
      <Toaster />
    </main>
  );
}
