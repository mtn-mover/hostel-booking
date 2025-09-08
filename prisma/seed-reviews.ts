import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReviews() {
  // First create some sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'GUEST'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'sarah.smith@example.com',
      name: 'Sarah Smith',
      role: 'GUEST'
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      role: 'GUEST'
    }
  });

  // Get existing apartments
  const apartments = await prisma.apartment.findMany({
    take: 3
  });

  if (apartments.length === 0) {
    console.log('No apartments found. Please run the main seed script first.');
    return;
  }

  // Create sample bookings first (required for reviews)
  const booking1 = await prisma.booking.create({
    data: {
      userId: user1.id,
      apartmentId: apartments[0].id,
      checkIn: new Date('2024-01-15'),
      checkOut: new Date('2024-01-18'),
      guests: 2,
      totalPrice: 269.97, // 3 nights
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      guestName: 'John Doe',
      guestEmail: 'john.doe@example.com'
    }
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: user2.id,
      apartmentId: apartments[0].id,
      checkIn: new Date('2024-02-10'),
      checkOut: new Date('2024-02-14'),
      guests: 1,
      totalPrice: 359.96, // 4 nights
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      guestName: 'Sarah Smith',
      guestEmail: 'sarah.smith@example.com'
    }
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: user3.id,
      apartmentId: apartments[1].id,
      checkIn: new Date('2024-03-05'),
      checkOut: new Date('2024-03-12'),
      guests: 4,
      totalPrice: 1119.93, // 7 nights
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      guestName: 'Mike Johnson',
      guestEmail: 'mike.johnson@example.com'
    }
  });

  // Create reviews
  const reviews = [
    {
      userId: user1.id,
      apartmentId: apartments[0].id,
      bookingId: booking1.id,
      rating: 5,
      title: 'Perfect downtown location!',
      comment: 'This studio apartment exceeded my expectations. The location is unbeatable - just a short walk to everything. The space was clean, modern, and had everything I needed for my 3-day stay. The host was responsive and helpful. Would definitely book again!',
      createdAt: new Date('2024-01-20')
    },
    {
      userId: user2.id,
      apartmentId: apartments[0].id,
      bookingId: booking2.id,
      rating: 4,
      title: 'Great stay with minor issues',
      comment: 'Overall a very good experience. The apartment is exactly as pictured and the amenities were great. The only minor issue was that the Wi-Fi was a bit slow, but everything else was perfect. Great value for money and excellent location.',
      createdAt: new Date('2024-02-16')
    },
    {
      userId: user3.id,
      apartmentId: apartments[1].id,
      bookingId: booking3.id,
      rating: 5,
      title: 'Amazing family apartment!',
      comment: 'We stayed here with our family for a week and it was absolutely perfect. The apartment is spacious, clean, and beautifully furnished. The kitchen was fully equipped and we loved having the balcony. The kids enjoyed the extra space and the location was great for exploring the city. Highly recommend for families!',
      createdAt: new Date('2024-03-14')
    }
  ];

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData
    });
  }

  console.log('Sample reviews and bookings created successfully!');
  console.log('Created:', {
    users: 3,
    bookings: 3,
    reviews: 3
  });
}

seedReviews()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });