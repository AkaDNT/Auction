import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
  const passwordHash = await hash("12345678", 10);

  const users = Array.from({ length: 10 }, (_, index) => {
    const no = index + 1;

    return {
      name: `Demo User ${String(no).padStart(2, "0")}`,
      email: `demo.user${String(no).padStart(2, "0")}@example.com`,
      passwordHash,
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER],
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
        userRoles: {
          create: item.roles.map((role) => ({ role })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${users.length} users with roles USER + SELLER`);
}
