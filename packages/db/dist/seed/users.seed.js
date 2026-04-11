"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
async function seedUsers(prisma) {
    const passwordHash = await (0, bcryptjs_1.hash)("12345678", 10);
    const users = Array.from({ length: 10 }, (_, index) => {
        const no = index + 1;
        return {
            name: `Demo User ${String(no).padStart(2, "0")}`,
            email: `demo.user${String(no).padStart(2, "0")}@example.com`,
            slug: `demo.user${String(no).padStart(2, "0")}`,
            passwordHash,
            status: client_1.UserStatus.ACTIVE,
            roles: [client_1.Role.USER, client_1.Role.SELLER],
        };
    });
    for (const item of users) {
        await prisma.user.upsert({
            where: { email: item.email },
            update: {
                name: item.name,
                passwordHash: item.passwordHash,
                status: item.status,
                userRoles: {
                    deleteMany: {},
                    create: item.roles.map((role) => ({ role })),
                },
            },
            create: {
                name: item.name,
                email: item.email,
                passwordHash: item.passwordHash,
                status: item.status,
                slug: item.slug,
                userRoles: {
                    create: item.roles.map((role) => ({ role })),
                },
            },
        });
    }
    console.log(`✅ Seeded ${users.length} users with roles USER + SELLER`);
}
