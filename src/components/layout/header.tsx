"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/themes/theme-toggle";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 z-40 w-full border-b border-violet-500/20 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="relative size-8 rounded-full bg-gradient-futuristic from-violet-600 to-fuchsia-600 animate-pulse-slow"></span>
            <span className="hidden font-bold text-xl gradient-text md:inline-block">TextOverlay</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="https://github.com/yourusername/text-overlay" target="_blank" rel="noopener noreferrer">
              <Github className="size-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
} 