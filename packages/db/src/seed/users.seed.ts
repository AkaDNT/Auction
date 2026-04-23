import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";

type SeedUser = {
  name: string;
  email: string;
  slug: string;
  status: UserStatus;
  roles: Role[];
};

export async function seedUsers(prisma: PrismaClient) {
  const passwordHash = await hash("Test1234@", 10);

  const users: SeedUser[] = [
    {
      name: "Nhat Thong",
      email: "nhatthong@gmail.com",
      slug: "nhat-thong",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Nhat Thanh",
      email: "nhatthanh@gmail.com",
      slug: "nhat-thanh",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Hanh Nguyen",
      email: "hanhnguyen@gmail.com",
      slug: "hanh-nguyen",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Nguyen Minh",
      email: "nguyenminh@gmail.com",
      slug: "nguyen-minh",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Hoang Lam",
      email: "hoanglam@gmail.com",
      slug: "hoang-lam",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Minh Quan",
      email: "minhquan@gmail.com",
      slug: "minh-quan",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Quang Thinh",
      email: "QuangThinh@gmail.com",
      slug: "quang-thinh",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Minh Quan",
      email: "minhquan@gmail.com",
      slug: "minh-quan",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Anh Thu",
      email: "anhthu@gmail.com",
      slug: "anh-thu",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "Minh Thu",
      email: "minhthu@gmail.com",
      slug: "minh-thu",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER, Role.ADMIN],
    },
    {
      name: "System Admin",
      email: "admin@gmail.com",
      slug: "system-admin",
      status: UserStatus.ACTIVE,
      roles: [Role.ADMIN],
    },
    {
      name: "Nguyen Minh Anh",
      email: "minhanh@gmail.com",
      slug: "nguyen-minh-anh",
      status: UserStatus.ACTIVE,
      roles: [Role.USER],
    },
    {
      name: "Tran Quoc Bao",
      email: "quocbao@gmail.com",
      slug: "tran-quoc-bao",
      status: UserStatus.ACTIVE,
      roles: [Role.USER],
    },
    {
      name: "Le Thu Ha",
      email: "thuha@gmail.com",
      slug: "le-thu-ha",
      status: UserStatus.ACTIVE,
      roles: [Role.USER],
    },
    {
      name: "Pham Gia Huy",
      email: "giahuy@gmail.com",
      slug: "pham-gia-huy",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER],
    },
    {
      name: "Vo Khanh Linh",
      email: "khanhlinh@gmail.com",
      slug: "vo-khanh-linh",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER],
    },
    {
      name: "Doan Tuan Kiet",
      email: "tuankiet@gmail.com",
      slug: "doan-tuan-kiet",
      status: UserStatus.ACTIVE,
      roles: [Role.USER, Role.SELLER],
    },
    {
      name: "Bui Thanh Truc",
      email: "thanhtruc@gmail.com",
      slug: "bui-thanh-truc",
      status: UserStatus.DISABLED,
      roles: [Role.USER],
    },
    {
      name: "Hoang Duc Long",
      email: "duclong@gmail.com",
      slug: "hoang-duc-long",
      status: UserStatus.DISABLED,
      roles: [Role.USER, Role.SELLER],
    },
    {
      name: "Seller Support",
      email: "seller@gmail.com",
      slug: "seller-support",
      status: UserStatus.ACTIVE,
      roles: [Role.SELLER],
    },
  ];

  for (const item of users) {
    await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        slug: item.slug,
        passwordHash,
        status: item.status,
        userRoles: {
          deleteMany: {},
          create: item.roles.map((role) => ({ role })),
        },
      },
      create: {
        name: item.name,
        email: item.email,
        slug: item.slug,
        passwordHash,
        status: item.status,
        userRoles: {
          create: item.roles.map((role) => ({ role })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${users.length} users with password Test1234@`);
}
