const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting admin passwords...\n');
  
  // Find all admin users
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  
  if (admins.length === 0) {
    console.log('No admin users found. Creating new admin...\n');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin user created!');
  } else {
    // Reset password for ALL admin users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    for (const admin of admins) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      console.log(`✅ Password reset for: ${admin.email}`);
    }
  }
  
  console.log('\n📝 You can now login with:');
  console.log('==========================');
  
  const allAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  
  allAdmins.forEach(admin => {
    console.log(`Email: ${admin.email}`);
    console.log('Password: admin123');
    console.log('---');
  });
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });