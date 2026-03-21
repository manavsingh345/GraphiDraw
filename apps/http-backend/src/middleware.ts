import { Request, Response, NextFunction, RequestHandler } from "express";
import { clerkMiddleware, getAuth } from '@clerk/express';
import { prismaClient } from "@repo/database/client";
import { resolveClerkUser } from "@repo/backend-common/auth";

const clerkPublishableKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

const syncUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = getAuth(req);
        const user = await resolveClerkUser(auth?.userId, auth?.sessionClaims as Record<string, unknown> | null | undefined);
        if (user) {
            await prismaClient.user.upsert({
                where: { id: user.id },
                update: {
                    email: user.email,
                    name: user.name,
                    photo: user.photo
                },
                create: {
                    id: user.id,
                    email: user.email,
                    password: "",
                    name: user.name,
                    photo: user.photo
                }
            });
            // @ts-ignore
            req.userId = user.id;
            next();
        } else {
            console.log("Unauthorized: No clerk req.auth.userId found", auth);
            res.status(403).json({ message: "Unauthorized" });
        }
    } catch (err) {
        console.log("Error upserting user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const middleware: RequestHandler[] = [
    clerkMiddleware({
        publishableKey: clerkPublishableKey,
        secretKey: clerkSecretKey
    }) as RequestHandler,
    // @ts-ignore
    syncUser
];
