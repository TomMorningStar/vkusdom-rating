import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.employee.deleteMany();

  await prisma.employee.createMany({
    data: [
      {
        fullName: "Иванова Анна Сергеевна",
        position: "Шеф-повар",
        description: "Готовит лучшие блюда для гостей ресторана.",
        photoUrl: "https://i.pravatar.cc/300?u=anna",
      },
      {
        fullName: "Петров Дмитрий Александрович",
        position: "Су-шеф",
        description: "Отвечает за горячий цех и разработку меню.",
        photoUrl: "https://i.pravatar.cc/300?u=dmitry",
      },
      {
        fullName: "Смирнова Елена Викторовна",
        position: "Администратор зала",
        description: "Встречает гостей и следит за сервисом.",
        photoUrl: "https://i.pravatar.cc/300?u=elena",
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
