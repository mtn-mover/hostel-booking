const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for admin users...\n');
  
  // Find all admin users
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  
  if (admins.length === 0) {
    console.log('No admin users found. Creating default admin...\n');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin user created:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
  } else {
    console.log(`Found ${admins.length} admin user(s):\n`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name})`);
    });
    
    // Reset password for the first admin
    console.log('\n🔄 Resetting password for admin@example.com...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.updateMany({
      where: { email: 'admin@example.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password reset complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
  }
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });