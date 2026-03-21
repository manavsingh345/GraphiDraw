const fs = require('fs');

// 1. Move dotenv to top of http-backend/index.ts
let httpIndex = fs.readFileSync('apps/http-backend/src/index.ts', 'utf8');
httpIndex = httpIndex.replace(/import dotenv from "dotenv";\r?\ndotenv\.config\(\);\r?\n/, '');
httpIndex = `import dotenv from "dotenv";\ndotenv.config();\n` + httpIndex;
fs.writeFileSync('apps/http-backend/src/index.ts', httpIndex);

// 2. Move dotenv to top of ws-backend/index.ts
let wsIndex = fs.readFileSync('apps/ws-backend/src/index.ts', 'utf8');
wsIndex = wsIndex.replace(/import dotenv from "dotenv";\r?\ndotenv\.config\(\);\r?\n/, '');
wsIndex = `import dotenv from "dotenv";\ndotenv.config();\n` + wsIndex;
fs.writeFileSync('apps/ws-backend/src/index.ts', wsIndex);

// 3. Rewrite http-backend/middleware.ts
const middlewareCode = `import { Request, Response, NextFunction } from "express";
import { clerkMiddleware, getAuth } from '@clerk/express';
import { prismaClient } from "@repo/database/client";

const syncUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = getAuth(req);
        if (auth && auth.userId) {
            const userId = auth.userId;
            await prismaClient.user.upsert({
                where: { id: userId },
                update: {},
                create: {
                    id: userId,
                    email: \`\${userId}@clerk.local\`,
                    password: "",
                    name: "Clerk User"
                }
            });
            // @ts-ignore
            req.userId = userId;
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

export const middleware = [
    clerkMiddleware(),
    syncUser
];
`;
fs.writeFileSync('apps/http-backend/src/middleware.ts', middlewareCode);
