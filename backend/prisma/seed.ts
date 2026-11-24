import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ---- Users ----
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const customerHash = await bcrypt.hash('Customer123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@cloudmart.local' },
    update: {},
    create: {
      email: 'admin@cloudmart.local',
      name: 'Admin CloudMart',
      password_hash: adminHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@cloudmart.local' },
    update: {},
    create: {
      email: 'customer@cloudmart.local',
      name: 'Customer Demo',
      password_hash: customerHash,
      role: 'CUSTOMER',
    },
  });

  // ---- Categories ----
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Gadget dan perangkat elektronik terkini' },
    { name: 'Clothing', slug: 'clothing', description: 'Pakaian fashion berkualitas premium' },
    { name: 'Books', slug: 'books', description: 'Buku teknik, pemrograman, dan pengembangan diri' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Dekorasi rumah dan perlengkapan taman' },
    { name: 'Sports', slug: 'sports', description: 'Peralatan olahraga dan kebugaran' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const categoryMap = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const catBySlug: Record<string, string> = {};
  for (const c of categoryMap) {
    catBySlug[c.slug] = c.id;
  }

  // ---- Products ----
  const products = [
    // Electronics
    {
      name: 'Laptop Gaming',
      slug: 'laptop-gaming',
      description: 'Laptop gaming performa tinggi dengan GPU terbaru untuk pengalaman bermain yang luar biasa.',
      price: 15000000,
      category_slug: 'electronics',
      image_urls: [
        'https://picsum.photos/seed/laptop-gaming/800/600',
        'https://picsum.photos/seed/laptop-gaming-2/800/600',
      ],
    },
    {
      name: 'Smartphone 5G',
      slug: 'smartphone-5g',
      description: 'Smartphone flagship dengan konektivitas 5G, kamera 200MP, dan baterai 5000mAh.',
      price: 8000000,
      category_slug: 'electronics',
      image_urls: [
        'https://picsum.photos/seed/smartphone-5g/800/600',
        'https://picsum.photos/seed/smartphone-5g-2/800/600',
        'https://picsum.photos/seed/smartphone-5g-3/800/600',
      ],
    },
    {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Headphone nirkabel premium dengan noise cancellation aktif dan suara hi-fi yang jernih.',
      price: 1500000,
      category_slug: 'electronics',
      image_urls: [
        'https://picsum.photos/seed/wireless-headphones/800/600',
        'https://picsum.photos/seed/wireless-headphones-2/800/600',
      ],
    },
    // Clothing
    {
      name: 'Kaos Premium',
      slug: 'kaos-premium',
      description: 'Kaos bahan katun 100% combed 30s yang nyaman dan adem untuk sehari-hari.',
      price: 250000,
      category_slug: 'clothing',
      image_urls: [
        'https://picsum.photos/seed/kaos-premium/800/600',
        'https://picsum.photos/seed/kaos-premium-2/800/600',
      ],
    },
    {
      name: 'Jaket Hoodie',
      slug: 'jaket-hoodie',
      description: 'Hoodie tebal fleece berkualitas tinggi, cocok untuk cuaca dingin dan tampilan kasual modern.',
      price: 450000,
      category_slug: 'clothing',
      image_urls: [
        'https://picsum.photos/seed/jaket-hoodie/800/600',
        'https://picsum.photos/seed/jaket-hoodie-2/800/600',
      ],
    },
    {
      name: 'Celana Chino',
      slug: 'celana-chino',
      description: 'Celana chino slim fit berbahan katun twill premium, cocok untuk casual maupun semi-formal.',
      price: 350000,
      category_slug: 'clothing',
      image_urls: [
        'https://picsum.photos/seed/celana-chino/800/600',
        'https://picsum.photos/seed/celana-chino-2/800/600',
      ],
    },
    // Books
    {
      name: 'Belajar React',
      slug: 'belajar-react',
      description: 'Panduan lengkap membangun aplikasi web modern menggunakan React dan ekosistemnya.',
      price: 150000,
      category_slug: 'books',
      image_urls: [
        'https://picsum.photos/seed/belajar-react/800/600',
        'https://picsum.photos/seed/belajar-react-2/800/600',
      ],
    },
    {
      name: 'Clean Code',
      slug: 'clean-code',
      description: 'Buku wajib bagi setiap programmer: cara menulis kode bersih, mudah dibaca, dan mudah dipelihara.',
      price: 200000,
      category_slug: 'books',
      image_urls: [
        'https://picsum.photos/seed/clean-code/800/600',
        'https://picsum.photos/seed/clean-code-2/800/600',
      ],
    },
    {
      name: 'Arsitektur Microservices',
      slug: 'arsitektur-microservices',
      description: 'Memahami dan mengimplementasikan arsitektur microservices untuk aplikasi skala enterprise.',
      price: 175000,
      category_slug: 'books',
      image_urls: [
        'https://picsum.photos/seed/arsitektur-microservices/800/600',
        'https://picsum.photos/seed/arsitektur-microservices-2/800/600',
      ],
    },
    // Home & Garden
    {
      name: 'Lampu LED Smart',
      slug: 'lampu-led-smart',
      description: 'Lampu LED pintar yang dapat dikontrol via smartphone, mendukung jutaan warna dan jadwal otomatis.',
      price: 125000,
      category_slug: 'home-garden',
      image_urls: [
        'https://picsum.photos/seed/lampu-led-smart/800/600',
        'https://picsum.photos/seed/lampu-led-smart-2/800/600',
      ],
    },
    {
      name: 'Pot Tanaman Minimalis',
      slug: 'pot-tanaman-minimalis',
      description: 'Pot tanaman desain minimalis modern dari bahan keramik berkualitas tinggi untuk dekorasi ruangan.',
      price: 85000,
      category_slug: 'home-garden',
      image_urls: [
        'https://picsum.photos/seed/pot-tanaman-minimalis/800/600',
        'https://picsum.photos/seed/pot-tanaman-minimalis-2/800/600',
      ],
    },
    {
      name: 'Karpet Nordic',
      slug: 'karpet-nordic',
      description: 'Karpet bermotif nordic Skandinavia yang tebal dan lembut, sempurna untuk ruang tamu modern.',
      price: 650000,
      category_slug: 'home-garden',
      image_urls: [
        'https://picsum.photos/seed/karpet-nordic/800/600',
        'https://picsum.photos/seed/karpet-nordic-2/800/600',
      ],
    },
    // Sports
    {
      name: 'Sepatu Lari',
      slug: 'sepatu-lari',
      description: 'Sepatu lari dengan teknologi cushioning terbaru, ringan dan responsif untuk performa terbaik.',
      price: 850000,
      category_slug: 'sports',
      image_urls: [
        'https://picsum.photos/seed/sepatu-lari/800/600',
        'https://picsum.photos/seed/sepatu-lari-2/800/600',
      ],
    },
    {
      name: 'Raket Badminton',
      slug: 'raket-badminton',
      description: 'Raket badminton karbon full-frame ringan dengan keseimbangan sempurna untuk smash dan kontrol.',
      price: 450000,
      category_slug: 'sports',
      image_urls: [
        'https://picsum.photos/seed/raket-badminton/800/600',
        'https://picsum.photos/seed/raket-badminton-2/800/600',
      ],
    },
    {
      name: 'Matras Yoga',
      slug: 'matras-yoga',
      description: 'Matras yoga anti-slip tebal 6mm dari bahan TPE ramah lingkungan untuk latihan yoga dan pilates.',
      price: 300000,
      category_slug: 'sports',
      image_urls: [
        'https://picsum.photos/seed/matras-yoga/800/600',
        'https://picsum.photos/seed/matras-yoga-2/800/600',
      ],
    },
  ];

  const inventoryQty: Record<string, number> = {
    'laptop-gaming': 50,
    'smartphone-5g': 75,
    'wireless-headphones': 100,
    'kaos-premium': 100,
    'jaket-hoodie': 80,
    'celana-chino': 90,
    'belajar-react': 60,
    'clean-code': 55,
    'arsitektur-microservices': 50,
    'lampu-led-smart': 100,
    'pot-tanaman-minimalis': 100,
    'karpet-nordic': 60,
    'sepatu-lari': 70,
    'raket-badminton': 85,
    'matras-yoga': 95,
  };

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        category_id: catBySlug[p.category_slug],
        image_urls: p.image_urls,
      },
    });

    await prisma.inventory.upsert({
      where: { product_id: created.id },
      update: {},
      create: {
        product_id: created.id,
        quantity: inventoryQty[p.slug] ?? 50,
        reserved_quantity: 0,
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
