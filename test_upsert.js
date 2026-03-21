const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const userId = "user_test_123";
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: `${userId}@clerk.local`,
                password: "",
                name: "Clerk User"
            }
        });
        console.log("Upsert succeeded: ", user);
    } catch (e) {
        console.error("Upsert failed: ", e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
