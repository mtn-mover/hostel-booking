const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateEventPrices() {
  console.log('Starting migration of EventPrice table...');
  
  try {
    // First, backup existing event prices
    const existingEvents = await prisma.$queryRaw`
      SELECT * FROM EventPrice
    `;
    
    console.log(`Found ${existingEvents.length} existing event prices to migrate`);
    
    // Drop the old table and recreate with new structure
    await prisma.$executeRaw`
      DROP TABLE IF EXISTS EventPrice_backup
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE EventPrice_backup AS SELECT * FROM EventPrice
    `;
    
    console.log('Created backup table');
    
    // Drop existing table
    await prisma.$executeRaw`
      DROP TABLE EventPrice
    `;
    
    // Create new table with updated structure
    await prisma.$executeRaw`
      CREATE TABLE EventPrice (
        id TEXT PRIMARY KEY,
        apartmentId TEXT NOT NULL,
        eventName TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        price REAL NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartmentId) REFERENCES Apartment(id) ON DELETE CASCADE
      )
    `;
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX EventPrice_apartmentId_eventName_startDate_key 
      ON EventPrice(apartmentId, eventName, startDate)
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX EventPrice_apartmentId_startDate_endDate_idx 
      ON EventPrice(apartmentId, startDate, endDate)
    `;
    
    console.log('Created new EventPrice table with date range support');
    
    // Migrate existing data
    if (existingEvents.length > 0) {
      for (const event of existingEvents) {
        // Convert single date to date range (same start and end date)
        // Handle case where event.date might not exist
        const eventDate = event.date || event.startDate || event.endDate || new Date().toISOString().split('T')[0];
        await prisma.$executeRaw`
          INSERT INTO EventPrice (id, apartmentId, eventName, startDate, endDate, price, isActive, createdAt, updatedAt)
          VALUES (${event.id}, ${event.apartmentId}, ${event.eventName}, ${eventDate}, ${eventDate}, 
                  ${event.price}, ${event.isActive}, ${event.createdAt}, ${event.updatedAt})
        `;
      }
      console.log(`Migrated ${existingEvents.length} event prices`);
    }
    
    // Drop backup table
    await prisma.$executeRaw`
      DROP TABLE EventPrice_backup
    `;
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    
    // Try to restore from backup
    try {
      await prisma.$executeRaw`
        DROP TABLE IF EXISTS EventPrice
      `;
      await prisma.$executeRaw`
        ALTER TABLE EventPrice_backup RENAME TO EventPrice
      `;
      console.log('Restored from backup due to error');
    } catch (restoreError) {
      console.error('Failed to restore backup:', restoreError);
    }
    
    throw error;
  }
}

migrateEventPrices()
  .then(() => console.log('✅ Migration completed'))
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());