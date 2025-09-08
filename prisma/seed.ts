import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@alpinehavenhostel.ch',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date()
    }
  });

  console.log('Created admin user:', adminUser.email);
  // Create amenities first
  const amenities = await Promise.all([
    prisma.amenity.create({
      data: {
        name: 'WiFi',
        icon: 'Wifi',
        category: 'Technology',
        description: 'Free high-speed internet'
      }
    }),
    prisma.amenity.create({
      data: {
        name: 'Kitchen',
        icon: 'ChefHat',
        category: 'Kitchen',
        description: 'Fully equipped kitchen'
      }
    }),
    prisma.amenity.create({
      data: {
        name: 'Parking',
        icon: 'Car',
        category: 'Transport',
        description: 'Free parking available'
      }
    }),
    prisma.amenity.create({
      data: {
        name: 'Balcony',
        icon: 'Home',
        category: 'Outdoor',
        description: 'Private balcony with view'
      }
    }),
    prisma.amenity.create({
      data: {
        name: 'Air Conditioning',
        icon: 'Wind',
        category: 'Comfort',
        description: 'Climate control'
      }
    })
  ]);

  // Create sample apartments
  const apartment1 = await prisma.apartment.create({
    data: {
      name: 'Cozy Studio Downtown',
      description: 'Perfect studio apartment in the heart of the city. Recently renovated with modern amenities and great natural light. Walking distance to all major attractions, restaurants, and public transport.',
      shortDescription: 'Modern studio in city center',
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 35,
      price: 89.99,
      pricePerNight: 89.99,
      pricePerWeek: 550.00,
      pricePerMonth: 2100.00,
      minStayNights: 1,
      maxStayNights: 30,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop'
      ]),
      amenities: JSON.stringify(['WiFi', 'Kitchen', 'Air Conditioning']),
      apartmentImages: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
            alt: 'Studio apartment main view',
            order: 0,
            isMain: true
          },
          {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
            alt: 'Studio apartment kitchen',
            order: 1,
            isMain: false
          },
          {
            url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop',
            alt: 'Studio apartment bathroom',
            order: 2,
            isMain: false
          }
        ]
      },
      apartmentAmenities: {
        create: [
          { amenityId: amenities[0].id }, // WiFi
          { amenityId: amenities[1].id }, // Kitchen
          { amenityId: amenities[4].id }  // Air Conditioning
        ]
      }
    }
  });

  const apartment2 = await prisma.apartment.create({
    data: {
      name: 'Spacious 2BR Family Apartment',
      description: 'Large family-friendly apartment with two bedrooms, living room, and full kitchen. Perfect for families or groups. Located in a quiet residential area with easy access to parks and shopping.',
      shortDescription: 'Family apartment with 2 bedrooms',
      maxGuests: 6,
      bedrooms: 2,
      bathrooms: 2,
      size: 85,
      price: 159.99,
      pricePerNight: 159.99,
      pricePerWeek: 980.00,
      pricePerMonth: 3800.00,
      minStayNights: 2,
      maxStayNights: 90,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'
      ]),
      amenities: JSON.stringify(['WiFi', 'Kitchen', 'Parking', 'Balcony', 'Air Conditioning']),
      apartmentImages: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
            alt: '2BR apartment living room',
            order: 0,
            isMain: true
          },
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
            alt: '2BR apartment master bedroom',
            order: 1,
            isMain: false
          },
          {
            url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
            alt: '2BR apartment second bedroom',
            order: 2,
            isMain: false
          },
          {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
            alt: '2BR apartment kitchen',
            order: 3,
            isMain: false
          }
        ]
      },
      apartmentAmenities: {
        create: [
          { amenityId: amenities[0].id }, // WiFi
          { amenityId: amenities[1].id }, // Kitchen
          { amenityId: amenities[2].id }, // Parking
          { amenityId: amenities[3].id }, // Balcony
          { amenityId: amenities[4].id }  // Air Conditioning
        ]
      }
    }
  });

  const apartment3 = await prisma.apartment.create({
    data: {
      name: 'Luxury Penthouse Suite',
      description: 'Premium penthouse apartment with stunning city views. Features high-end finishes, spacious layout, and premium amenities. Perfect for business travelers or special occasions.',
      shortDescription: 'Luxury penthouse with city views',
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      size: 120,
      price: 299.99,
      pricePerNight: 299.99,
      pricePerWeek: 1899.00,
      pricePerMonth: 7200.00,
      minStayNights: 2,
      maxStayNights: 60,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&h=600&fit=crop'
      ]),
      amenities: JSON.stringify(['WiFi', 'Kitchen', 'Parking', 'Balcony', 'Air Conditioning']),
      apartmentImages: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&h=600&fit=crop',
            alt: 'Penthouse apartment view',
            order: 0,
            isMain: true
          },
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
            alt: 'Penthouse living room',
            order: 1,
            isMain: false
          },
          {
            url: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&h=600&fit=crop',
            alt: 'Penthouse balcony view',
            order: 2,
            isMain: false
          }
        ]
      },
      apartmentAmenities: {
        create: amenities.map(amenity => ({ amenityId: amenity.id }))
      }
    }
  });

  // Create some sample availability entries
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // Generate availability for the next 90 days
  const availabilityPromises = [];
  for (let i = 0; i < 90; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Add availability for each apartment
    availabilityPromises.push(
      prisma.availability.create({
        data: {
          apartmentId: apartment1.id,
          date: date,
          status: 'AVAILABLE'
        }
      }),
      prisma.availability.create({
        data: {
          apartmentId: apartment2.id,
          date: date,
          status: 'AVAILABLE'
        }
      }),
      prisma.availability.create({
        data: {
          apartmentId: apartment3.id,
          date: date,
          status: 'AVAILABLE'
        }
      })
    );
  }

  await Promise.all(availabilityPromises);

  // Create some sample pricing rules (weekend premium)
  await prisma.pricingRule.create({
    data: {
      apartmentId: apartment1.id,
      name: 'Weekend Premium',
      dayOfWeek: 5, // Friday
      priceModifier: 1.3,
      priority: 1
    }
  });

  await prisma.pricingRule.create({
    data: {
      apartmentId: apartment1.id,
      name: 'Weekend Premium',
      dayOfWeek: 6, // Saturday
      priceModifier: 1.3,
      priority: 1
    }
  });

  console.log('Database seeded successfully!');
  console.log('Created:', {
    amenities: amenities.length,
    apartments: 3,
    images: 10,
    availabilities: 270, // 90 days * 3 apartments
    pricingRules: 2
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });