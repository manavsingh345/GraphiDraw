"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { HTTP_BACKEND } from "@/config";
import Link from "next/link";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function readCreatedRoomPublicId(data: Record<string, unknown> | null): string | null {
  if (!data) {
    return null;
  }

  if (typeof data.roomPublicId === "string" && data.roomPublicId.trim()) {
    return data.roomPublicId;
  }

  if (typeof data.publicId === "string" && data.publicId.trim()) {
    return data.publicId;
  }

  const room = data.room;
  if (
    room &&
    typeof room === "object" &&
    typeof (room as { publicId?: unknown }).publicId === "string" &&
    (room as { publicId: string }).publicId.trim()
  ) {
    return (room as { publicId: string }).publicId;
  }

  return null;
}

async function readJsonResponse(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function RoomsPage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [createSlug, setCreateSlug] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [roomPublicId, setRoomPublicId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinSlugLoading, setJoinSlugLoading] = useState(false);
  const [joinKeyLoading, setJoinKeyLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/signin");
      return;
    } else if (isSignedIn) {
      getToken()
        .then((t) => {
          setToken(t);
          if (!t) {
            setError("Unable to start an authenticated session. Please sign in again.");
          }
        })
        .catch(() => {
          setError("Unable to start an authenticated session. Please sign in again.");
        });
    }
  }, [isLoaded, isSignedIn, router, getToken]);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentToken = await getToken();
    if (!currentToken) return;
    setCreateLoading(true);
    setError("");

    try {
      const res = await fetch(`${HTTP_BACKEND}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ slug: createSlug }),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) {
        throw new Error(
          typeof data?.message === "string" ? data.message : "Failed to create room"
        );
      }
      const createdRoomPublicId = readCreatedRoomPublicId(data);
      if (!createdRoomPublicId) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Room creation returned an unexpected response"
        );
      }
      router.push(`/r/${createdRoomPublicId}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create room"));
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
      const data = await readJsonResponse(res);
      const room = data?.room;
      if (
        !res.ok ||
        !room ||
        typeof room !== "object" ||
        typeof (room as { publicId?: unknown }).publicId !== "string"
      ) {
        throw new Error(
          typeof data?.message === "string" ? data.message : "Room not found"
        );
      }
      router.push(`/r/${(room as { publicId: string }).publicId}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Room not found"));
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

  if (!isLoaded) {
    return null;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card sketch-border shadow-sketch p-6 rounded-xl space-y-3">
          <h1 className="font-display text-2xl font-bold">Rooms</h1>
          <p className="text-sm text-red-600" role="alert">
            {error || "Loading your authenticated session..."}
          </p>
          <Link href="/signin" className="text-primary hover:underline text-sm">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card sketch-border shadow-sketch p-6 rounded-xl space-y-5">
        <h1 className="font-display text-2xl font-bold">Rooms</h1>
        <p className="text-muted-foreground text-sm">Create a new room or join an existing one.</p>

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
