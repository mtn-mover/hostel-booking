const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const roomCategoriesData = [
  { name: 'living_room', nameEn: 'Living Room', nameDe: 'Wohnzimmer', order: 1, isDefault: true },
  { name: 'bedroom', nameEn: 'Bedroom', nameDe: 'Schlafzimmer', order: 2, isDefault: true },
  { name: 'kitchen', nameEn: 'Kitchen', nameDe: 'Küche', order: 3, isDefault: true },
  { name: 'bathroom', nameEn: 'Bathroom', nameDe: 'Badezimmer', order: 4, isDefault: true },
  { name: 'dining_room', nameEn: 'Dining Room', nameDe: 'Esszimmer', order: 5, isDefault: true },
  { name: 'balcony', nameEn: 'Balcony', nameDe: 'Balkon', order: 6, isDefault: true },
  { name: 'terrace', nameEn: 'Terrace', nameDe: 'Terrasse', order: 7, isDefault: true },
  { name: 'garden', nameEn: 'Garden', nameDe: 'Garten', order: 8, isDefault: true },
  { name: 'entrance', nameEn: 'Entrance', nameDe: 'Eingang', order: 9, isDefault: true },
  { name: 'hallway', nameEn: 'Hallway', nameDe: 'Flur', order: 10, isDefault: true },
  { name: 'exterior', nameEn: 'Exterior View', nameDe: 'Aussenansicht', order: 11, isDefault: true },
  { name: 'view', nameEn: 'View', nameDe: 'Aussicht', order: 12, isDefault: true },
  { name: 'parking', nameEn: 'Parking', nameDe: 'Parkplatz', order: 13, isDefault: true },
  { name: 'office', nameEn: 'Office/Workspace', nameDe: 'Büro/Arbeitsplatz', order: 14, isDefault: true },
  { name: 'storage', nameEn: 'Storage', nameDe: 'Abstellraum', order: 15, isDefault: true },
];

async function main() {
  console.log('Checking if RoomCategory table exists...');

  try {
    // First, try to create the table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RoomCategory" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL,
        "nameDe" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "icon" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RoomCategory_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('RoomCategory table created or already exists');

    // Create unique index if not exists
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "RoomCategory_name_key" ON "RoomCategory"("name");
    `);
    console.log('Unique index on name created');

    // Create order index if not exists
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "RoomCategory_order_idx" ON "RoomCategory"("order");
    `);
    console.log('Index on order created');

  } catch (e) {
    console.log('Table creation step:', e.message);
  }

  // Insert room categories
  console.log('\nSeeding room categories...');
  for (const category of roomCategoriesData) {
    try {
      // Use raw SQL upsert
      await prisma.$executeRawUnsafe(`
        INSERT INTO "RoomCategory" ("id", "name", "nameEn", "nameDe", "order", "isDefault", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("name") DO UPDATE SET
          "nameEn" = EXCLUDED."nameEn",
          "nameDe" = EXCLUDED."nameDe",
          "order" = EXCLUDED."order",
          "isDefault" = EXCLUDED."isDefault",
          "isActive" = true,
          "updatedAt" = CURRENT_TIMESTAMP
      `, category.name, category.nameEn, category.nameDe, category.order, category.isDefault);
      console.log(`✓ ${category.nameDe} (${category.nameEn})`);
    } catch (e) {
      console.error(`✗ Error creating ${category.name}:`, e.message);
    }
  }

  // Verify
  const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "RoomCategory"`;
  console.log(`\nTotal room categories in database:`, count[0].count);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
