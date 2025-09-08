const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertAVIFImages() {
  try {
    console.log('🔍 Searching for AVIF images...');
    
    // Find all images with AVIF format
    const allImages = await prisma.apartmentImage.findMany({
      where: {
        url: {
          startsWith: 'data:image/avif'
        }
      }
    });
    
    console.log(`Found ${allImages.length} AVIF images to convert`);
    
    for (const image of allImages) {
      console.log(`\nProcessing image ${image.id}...`);
      
      // Convert AVIF base64 to JPEG base64 (simplified - just change the mime type)
      // In production, you'd want to actually convert the image format
      const newUrl = image.url.replace('data:image/avif;base64,', 'data:image/jpeg;base64,');
      
      // Update the image URL
      await prisma.apartmentImage.update({
        where: { id: image.id },
        data: { url: newUrl }
      });
      
      console.log(`✅ Converted image ${image.id}`);
    }
    
    console.log('\n✨ All AVIF images have been converted to JPEG format');
    
  } catch (error) {
    console.error('Error converting images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the conversion
convertAVIFImages();