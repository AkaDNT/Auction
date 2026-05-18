import { PrismaClient } from "@prisma/client";

export async function seedAuctionContents(prisma: PrismaClient) {
  const features = [
    {
      title: "Xac thuc nguoi ban",
      description:
        "Nguoi ban duoc xac thuc thong tin co ban, giup giao dich minh bach hon.",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Dat gia theo thoi gian thuc",
      description:
        "Cap nhat gia theo thoi gian thuc de nguoi dung de dang theo doi bien dong.",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Tuy chon mua ngay",
      description:
        "Mot so phien dau gia ho tro mua ngay de chot don nhanh khi can.",
      sortOrder: 3,
      isActive: true,
    },
    {
      title: "Thong bao ket thuc dau gia",
      description:
        "He thong gui thong bao khi phien dau gia sap ket thuc hoac da ket thuc.",
      sortOrder: 4,
      isActive: true,
    },
    {
      title: "Bao ve nguoi mua",
      description:
        "Dinh nghia ro trang thai giao dich va ho tro xu ly tranh chap co ban.",
      sortOrder: 5,
      isActive: false,
    },
  ];

  const faqs = [
    {
      question: "Lam sao de dat gia?",
      answer:
        "Dang nhap tai khoan, vao chi tiet san pham va nhap muc gia lon hon gia hien tai.",
      sortOrder: 1,
      isActive: true,
    },
    {
      question: "Gia giu cho bid duoc xu ly nhu the nao?",
      answer:
        "Khi dat gia, he thong co the tam giu so du. So tien se duoc giai phong neu ban khong thang.",
      sortOrder: 2,
      isActive: true,
    },
    {
      question: "Khi nao toi duoc xem ket qua phien dau gia?",
      answer:
        "Ket qua duoc cap nhat ngay khi phien ket thuc va se hien trong trang chi tiet.",
      sortOrder: 3,
      isActive: true,
    },
    {
      question: "Toi co the huy yeu cau rut tien khong?",
      answer:
        "Ban co the huy yeu cau neu trang thai van la PENDING hoac APPROVED tuy chinh sach.",
      sortOrder: 4,
      isActive: true,
    },
    {
      question: "Tai sao co phien dau gia bi huy?",
      answer:
        "Mot so phien co the bi huy do vi pham quy dinh hoac khong dap ung dieu kien giao dich.",
      sortOrder: 5,
      isActive: false,
    },
  ];

  await prisma.auctionFeature.deleteMany();
  await prisma.auctionFaq.deleteMany();

  await prisma.auctionFeature.createMany({
    data: features,
  });

  await prisma.auctionFaq.createMany({
    data: faqs,
  });

  console.log(
    `✅ Seeded ${features.length} auction features and ${faqs.length} auction faqs`,
  );
}
