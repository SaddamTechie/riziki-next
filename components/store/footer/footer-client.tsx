"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-sm gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <Input
        type="email"
        placeholder="Your email address"
        className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-background/50"
        required
      />
      <Button type="submit" variant="secondary" size="icon" aria-label="Subscribe">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

export function CopyrightYear({ siteName }: { siteName: string }) {
  return (
    <p>
      &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
    </p>
  );
}
