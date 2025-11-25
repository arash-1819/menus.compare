"use client";

import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <div className="sticky top-0 z-30 backdrop-blur border-b bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center font-bold">MC</div>
          <span className="font-semibold tracking-tight">MenuCompare</span>
        </div>
      </div>
    </div>
  );
}
