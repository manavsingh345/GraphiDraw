import { createClerkClient } from "@clerk/backend";

export type ClerkClaims = Record<string, unknown> | null | undefined;

export type NormalizedClerkUser = {
  id: string;
  email: string;
  name: string;
  photo: string | null;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function extractEmail(claims: ClerkClaims): string | null {
  if (!claims) {
    return null;
  }

  const directEmail = readString(claims.email);
  if (directEmail) {
    return directEmail.toLowerCase();
  }

  const emailAddresses = claims.email_addresses;
  if (Array.isArray(emailAddresses)) {
    for (const entry of emailAddresses) {
      if (entry && typeof entry === "object") {
        const candidate = readString((entry as Record<string, unknown>).email_address);
        if (candidate) {
          return candidate.toLowerCase();
        }
      }
    }
  }

  const emails = readStringArray(claims.emails);
  if (emails.length > 0) {
    return emails[0]!.toLowerCase();
  }

  return null;
}

function extractName(claims: ClerkClaims, email: string, userId: string): string {
  if (!claims) {
    return email.split("@")[0] ?? userId;
  }

  const fullName = readString(claims.name) ?? readString(claims.full_name);
  if (fullName) {
    return fullName;
  }

  const firstName = readString(claims.first_name);
  const lastName = readString(claims.last_name);
  const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (combined) {
    return combined;
  }

  const username = readString(claims.username);
  if (username) {
    return username;
  }

  return email.split("@")[0] ?? userId;
}

function extractPhoto(claims: ClerkClaims): string | null {
  if (!claims) {
    return null;
  }

  return readString(claims.image_url) ?? readString(claims.picture);
}

export function normalizeClerkUser(userId: string | null | undefined, claims: ClerkClaims): NormalizedClerkUser | null {
  const normalizedUserId = readString(userId);
  if (!normalizedUserId) {
    return null;
  }

  const email = extractEmail(claims) ?? `${normalizedUserId}@clerk.local`;

  return {
    id: normalizedUserId,
    email,
    name: extractName(claims, email, normalizedUserId),
    photo: extractPhoto(claims),
  };
}

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function resolveClerkUser(userId: string | null | undefined, claims: ClerkClaims): Promise<NormalizedClerkUser | null> {
  const normalized = normalizeClerkUser(userId, claims);
  if (!normalized) {
    return null;
  }

  if (!normalized.email.endsWith("@clerk.local")) {
    return normalized;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(normalized.id);
    const primaryEmail =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      normalized.email;
    const fullName = clerkUser.fullName?.trim();
    const name =
      fullName && fullName.length > 0
        ? fullName
        : [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
          clerkUser.username ||
          extractName(claims, primaryEmail, normalized.id);

    return {
      id: normalized.id,
      email: primaryEmail.toLowerCase(),
      name,
      photo: clerkUser.imageUrl ?? normalized.photo,
    };
  } catch {
    return normalized;
  }
}
