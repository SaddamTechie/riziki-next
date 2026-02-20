"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSession, updateUser } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string | null | undefined) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({ name });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 font-heading text-xl font-bold">Profile</h1>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-base font-semibold bg-primary text-primary-foreground">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Separator className="mb-6" />

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email-display">Email</Label>
          <Input
            id="email-display"
            value={user?.email ?? ""}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed at this time.
          </p>
        </div>

        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
