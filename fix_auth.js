const fs = require('fs');

// 1. ws-backend index.ts
let wsCode = fs.readFileSync('apps/ws-backend/src/index.ts', 'utf8');
wsCode = wsCode.replace(
  /function checkUser[\s\S]*?\}\n\}\n/s,
  `import { verifyToken } from '@clerk/backend';

async function checkUser(token:string): Promise<string | null>{
    try{
        const decoded = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
        if(!decoded || !decoded.sub) return null;
        await prismaClient.user.upsert({
            where: { id: decoded.sub },
            update: {},
            create: { id: decoded.sub, email: decoded.sub+'@clerk.local', password: '', name: 'Clerk User' }
        });
        return decoded.sub;
    }catch(err){ return null; }
}

`
);
wsCode = wsCode.replace("wss.on('connection',function connection(ws,request){", "wss.on('connection',async function connection(ws,request){");
wsCode = wsCode.replace("const userId=checkUser(token);", "const userId=await checkUser(token);");
fs.writeFileSync('apps/ws-backend/src/index.ts', wsCode);

// 2. RoomCanvas.tsx
let canvasCode = fs.readFileSync('apps/frontend/components/RoomCanvas.tsx', 'utf8');
canvasCode = canvasCode.replace(
  /import { useRouter } from "next\/navigation";/g,
  `import { useRouter } from "next/navigation";\nimport { useAuth } from "@clerk/nextjs";`
);
canvasCode = canvasCode.replace(
  /const router = useRouter\(\);/g,
  `const router = useRouter();\n  const { getToken, isLoaded, isSignedIn } = useAuth();`
);
canvasCode = canvasCode.replace(
  /useEffect\(\(\) => \{\n    document\.body\.style\.overflow = "hidden";\n    const stored = localStorage\.getItem\("token"\) \?\? sessionStorage\.getItem\("token"\);\n    if \(!stored\) \{\n      setRequiresAuth\(true\);\n      setError\("Please sign in to continue\."\);\n      router\.replace\("\/signin"\);\n      return;\n    \}\n    setRequiresAuth\(false\);\n    setToken\(stored\);\n  \}, \[router\]\);/g,
  `useEffect(() => {
    document.body.style.overflow = "hidden";
    if (isLoaded && !isSignedIn) {
      setRequiresAuth(true);
      setError("Please sign in to continue.");
      router.replace("/signin");
      return;
    } else if (isSignedIn) {
      setRequiresAuth(false);
      getToken().then(t => setToken(t));
    }
  }, [isLoaded, isSignedIn, router, getToken]);`
);
fs.writeFileSync('apps/frontend/components/RoomCanvas.tsx', canvasCode);

// 3. rooms page.tsx
let roomCode = fs.readFileSync('apps/frontend/app/rooms/page.tsx', 'utf8');
roomCode = roomCode.replace(
  /import { useRouter } from "next\/navigation";/g,
  `import { useRouter } from "next/navigation";\nimport { useAuth } from "@clerk/nextjs";`
);
roomCode = roomCode.replace(
  /const router = useRouter\(\);/g,
  `const router = useRouter();\n  const { getToken, isLoaded, isSignedIn } = useAuth();`
);
roomCode = roomCode.replace(
  /useEffect\(\(\) => \{\n    const stored = localStorage\.getItem\("token"\) \?\? sessionStorage\.getItem\("token"\);\n    if \(!stored\) \{\n      router\.replace\("\/signin"\);\n      return;\n    \}\n    setToken\(stored\);\n  \}, \[router\]\);/g,
  `useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/signin");
      return;
    } else if (isSignedIn) {
      getToken().then(t => setToken(t));
    }
  }, [isLoaded, isSignedIn, router, getToken]);`
);
roomCode = roomCode.replace(
  /if \(!token\) return;\n    setCreateLoading\(true\);/g,
  `const currentToken = await getToken();\n    if (!currentToken) return;\n    setCreateLoading(true);`
);
roomCode = roomCode.replace(
  /authorization: token,/g,
  `authorization: \`Bearer \${currentToken}\`,`
);
fs.writeFileSync('apps/frontend/app/rooms/page.tsx', roomCode);
