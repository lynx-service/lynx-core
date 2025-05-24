import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const roleSeed = async () => {
  const roles: Prisma.RoleCreateInput[] = [
    {
      id: 'ADMIN',
      roleName: '管理者',
    },
    {
      id: 'USER',
      roleName: 'ユーザー',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  console.log('Roles seeded');
};

async function main() {
  await roleSeed();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
