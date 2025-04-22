// seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clean existing data in safe order
  await prisma.heroAd.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.currency.deleteMany();

  // 1. Seed Currencies (prerequisite for products)
  const currencies = await prisma.currency.createMany({
    data: [
      {
        name: 'Saudi Riyal',
        code: 'SAR',
      },
      {
        name: 'Yemeni Rial',
        code: 'YER',
      }
    ],
  });

  // 2. Seed Categories
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Electronics',
        href: '/electronics',
        type: 'electronics',
        image: '/categories/electronics.jpg',
      },
      {
        name: 'Fashion',
        href: '/fashion',
        type: 'fashion',
        image: '/categories/fashion.jpg',
      },
      {
        name: 'Home & Kitchen',
        href: '/home-kitchen',
        type: 'home-kitchen',
        image: '/categories/home-kitchen.jpg',
      }
    ],
  });

  // 3. Seed Products with proper relations
  const [sarCurrency, yerCurrency] = await prisma.currency.findMany();
  const [electronics, fashion, homeKitchen] = await prisma.category.findMany();

  const products = await prisma.product.createMany({
    data: [
      {
        name: '4K Smart TV',
        categoryId: electronics.id,
        currencyId: sarCurrency.id,
        price: 2499,
        salePrice: 1999,
        description: '55" 4K Ultra HD Smart LED TV',
        images: ['/products/tv1.jpg', '/products/tv2.jpg'],
        discount: {
          isVaild: true,
          price: 1799,
        },
      },
      {
        name: 'Designer Dress',
        categoryId: fashion.id,
        currencyId: yerCurrency.id,
        price: 150000,
        salePrice: 120000,
        description: 'Luxury evening gown',
        images: ['/products/dress1.jpg'],
      },
     
    ],
  });

  // 4. Seed HeroAds with category relations
  await prisma.heroAd.createMany({
    data: [
      {
        title: 'Electronics Mega Sale',
        image: '/hero/electronics-banner.jpg',
        link: '/electronics',
        isAdvertising: true,
        categoryId: electronics.id,
      },
      {
        title: 'New Fashion Collection',
        image: '/hero/fashion-banner.jpg',
        link: '/fashion',
        isAdvertising: true,
        categoryId: fashion.id,
      },
      {
        title: 'Kitchen Essentials',
        image: '/hero/kitchen-banner.jpg',
        isAdvertising: false,
      }
    ],
  });
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });