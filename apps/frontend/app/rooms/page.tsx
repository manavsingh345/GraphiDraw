"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";
import Link from "next/link";

export default function RoomsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [createSlug, setCreateSlug] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [roomPublicId, setRoomPublicId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinSlugLoading, setJoinSlugLoading] = useState(false);
  const [joinKeyLoading, setJoinKeyLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setError("Please sign in to continue.");
      return;
    }
    setToken(stored);
  }, []);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreateLoading(true);
    setError("");

    try {
      const res = await fetch(`${HTTP_BACKEND}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ slug: createSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to create room");
      }
      router.push(`/r/${data.roomPublicId}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  };

  const joinBySlug = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinSlugLoading(true);
    setError("");
    try {
      const res = await fetch(`${HTTP_BACKEND}/room/${joinSlug}`);
      const data = await res.json();
      if (!res.ok || !data.room?.publicId) {
        throw new Error(data.message ?? "Room not found");
      }
      router.push(`/r/${data.room.publicId}`);
    } catch (err: any) {
      setError(err?.message ?? "Room not found");
    } finally {
      setJoinSlugLoading(false);
    }
  };

  const joinByPublicId = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinKeyLoading(true);
    if (!roomPublicId.trim()) {
      setJoinKeyLoading(false);
      return;
    }
    router.push(`/r/${roomPublicId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card sketch-border shadow-sketch p-6 rounded-xl space-y-5">
        <h1 className="font-display text-2xl font-bold">Rooms</h1>
        <p className="text-muted-foreground text-sm">
          Create a new room or join an existing one.
        </p>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={createRoom} className="space-y-2">
          <label className="text-sm font-medium">Create room (slug)</label>
          <input
            className="w-full sketch-border bg-background px-3 py-2 rounded"
            placeholder="e.g. my-team-room"
            value={createSlug}
            onChange={(e) => setCreateSlug(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full sketch-border py-2 rounded bg-primary text-primary-foreground"
            disabled={createLoading || !token}
          >
            {createLoading ? "Please wait..." : "Create Room"}
          </button>
        </form>

        <div className="text-center text-muted-foreground text-sm">or</div>

        <form onSubmit={joinBySlug} className="space-y-2">
          <label className="text-sm font-medium">Join by slug</label>
          <input
            className="w-full sketch-border bg-background px-3 py-2 rounded"
            placeholder="room slug"
            value={joinSlug}
            onChange={(e) => setJoinSlug(e.target.value)}
          />
          <button
            type="submit"
            className="w-full sketch-border py-2 rounded bg-secondary text-secondary-foreground"
            disabled={joinSlugLoading}
          >
            {joinSlugLoading ? "Please wait..." : "Join by Slug"}
          </button>
        </form>

        <div className="text-center text-muted-foreground text-sm">or</div>

        <form onSubmit={joinByPublicId} className="space-y-2">
          <label className="text-sm font-medium">Join by room key</label>
          <input
            className="w-full sketch-border bg-background px-3 py-2 rounded"
            placeholder="room public key"
            value={roomPublicId}
            onChange={(e) => setRoomPublicId(e.target.value)}
          />
          <button
            type="submit"
            className="w-full sketch-border py-2 rounded bg-accent text-accent-foreground"
            disabled={joinKeyLoading}
          >
            {joinKeyLoading ? "Please wait..." : "Join by Key"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/signin" className="text-primary hover:underline text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
