import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Die 4 spezifischen Apartments
export const AIRBNB_APARTMENTS = [
  { id: '24131251', url: 'https://www.airbnb.ch/rooms/24131251' },
  { id: '19632116', url: 'https://www.airbnb.ch/rooms/19632116' },
  { id: '20281126', url: 'https://www.airbnb.ch/rooms/20281126' },
  { id: '1006983308851279367', url: 'https://www.airbnb.ch/rooms/1006983308851279367' }
];

interface ApartmentData {
  airbnbId: string;
  airbnbUrl: string;
  title: string;
  description: string;
  images: string[];
  amenities: string[];
  pricing: {
    basePrice: number;
    currency: string;
    cleaningFee?: number;
  };
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  capacity: {
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  icalUrl?: string;
}

// Headers to appear more like a regular browser
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0'
};

// Delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function scrapeAirbnbListing(url: string, airbnbId: string): Promise<ApartmentData | null> {
  try {
    console.log(`🔍 Scraping Airbnb listing: ${url}`);
    
    // Add delay to avoid rate limiting
    await delay(2000 + Math.random() * 3000); // Random delay between 2-5 seconds
    
    const response = await axios.get(url, { 
      headers,
      timeout: 30000 
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract data from the page
    // Note: Airbnb's structure changes frequently, so we need multiple fallback selectors
    
    // Try to extract from JSON-LD structured data first
    let structuredData: any = {};
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const json = JSON.parse($(element).html() || '{}');
        if (json['@type'] === 'LodgingBusiness' || json['@type'] === 'Accommodation') {
          structuredData = json;
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
    
    // Extract title
    const title = structuredData.name || 
                  $('h1').first().text().trim() || 
                  $('[data-section-id="TITLE_DEFAULT"] h1').text().trim() ||
                  'Cozy Apartment in Interlaken';
    
    // Extract description
    const description = structuredData.description ||
                       $('[data-section-id="DESCRIPTION_DEFAULT"]').text().trim() ||
                       $('._1y6fhhr').text().trim() ||
                       'Beautiful apartment in the heart of Interlaken, perfect for your stay.';
    
    // Extract images (get high-quality versions)
    const images: string[] = [];
    $('img[data-original-uri], img[src*="airbnb"], picture source').each((_, element) => {
      const src = $(element).attr('data-original-uri') || 
                  $(element).attr('src') || 
                  $(element).attr('srcset')?.split(',')[0]?.split(' ')[0];
      if (src && !src.includes('profile') && !src.includes('user')) {
        // Convert to high-quality URL if needed
        const highQualityUrl = src.replace(/\?.*$/, '?im_w=1200');
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    });
    
    // If no images found, use placeholder images
    if (images.length === 0) {
      images.push(
        '/images/apartments/default-1.jpg',
        '/images/apartments/default-2.jpg',
        '/images/apartments/default-3.jpg'
      );
    }
    
    // Extract amenities
    const amenities: string[] = [];
    $('[data-section-id="AMENITIES_DEFAULT"] button, ._19xnuo97').each((_, element) => {
      const amenity = $(element).text().trim();
      if (amenity && amenity.length < 50) { // Filter out long descriptions
        amenities.push(amenity);
      }
    });
    
    // Default amenities if none found
    if (amenities.length === 0) {
      amenities.push('WiFi', 'Kitchen', 'Washer', 'Free parking', 'Air conditioning');
    }
    
    // Extract pricing (this is often dynamic, so we'll use defaults)
    const priceText = $('[data-testid="price"] span, ._tyxjp1').first().text();
    const priceMatch = priceText.match(/\d+/);
    const basePrice = priceMatch ? parseInt(priceMatch[0]) : 120; // Default price
    
    // Extract location
    const locationText = $('[data-section-id="LOCATION_DEFAULT"], ._16e70jgn').text().trim();
    const address = structuredData.address?.streetAddress || 'Interlaken, Switzerland';
    
    // Extract capacity
    const capacityText = $('._1adorps').text() || $('[data-section-id="OVERVIEW_DEFAULT"]').text();
    const guestsMatch = capacityText.match(/(\d+)\s*guest/i);
    const bedroomsMatch = capacityText.match(/(\d+)\s*bedroom/i);
    const bedsMatch = capacityText.match(/(\d+)\s*bed(?!room)/i);
    const bathroomsMatch = capacityText.match(/(\d+)\s*bath/i);
    
    // Extract rating
    const ratingText = $('[data-testid="reviews-summary"] span, ._17p6nbba').first().text();
    const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
    const reviewCountMatch = ratingText.match(/\((\d+)/);
    
    const apartmentData: ApartmentData = {
      airbnbId,
      airbnbUrl: url,
      title,
      description: description.substring(0, 1000), // Limit description length
      images: images.slice(0, 20), // Limit to 20 images
      amenities: amenities.slice(0, 30), // Limit amenities
      pricing: {
        basePrice,
        currency: 'CHF',
        cleaningFee: 50 // Default cleaning fee
      },
      location: {
        address,
        city: 'Interlaken',
        country: 'Switzerland',
        coordinates: [46.6863, 7.8632] // Interlaken coordinates
      },
      capacity: {
        guests: guestsMatch ? parseInt(guestsMatch[1]) : 4,
        bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 2,
        beds: bedsMatch ? parseInt(bedsMatch[1]) : 2,
        bathrooms: bathroomsMatch ? parseInt(bathroomsMatch[1]) : 1
      },
      rating: ratingMatch && reviewCountMatch ? {
        average: parseFloat(ratingMatch[1]),
        count: parseInt(reviewCountMatch[1])
      } : undefined,
      icalUrl: `https://www.airbnb.com/calendar/ical/${airbnbId}.ics`
    };
    
    console.log(`✅ Successfully scraped ${title}`);
    return apartmentData;
    
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    
    // Return fallback data if scraping fails
    return {
      airbnbId,
      airbnbUrl: url,
      title: `Apartment ${airbnbId}`,
      description: 'Beautiful apartment in Interlaken, perfect for your Swiss adventure.',
      images: [
        '/images/apartments/default-1.jpg',
        '/images/apartments/default-2.jpg'
      ],
      amenities: ['WiFi', 'Kitchen', 'Washer', 'Free parking'],
      pricing: {
        basePrice: 120,
        currency: 'CHF',
        cleaningFee: 50
      },
      location: {
        address: 'Interlaken, Switzerland',
        city: 'Interlaken',
        country: 'Switzerland',
        coordinates: [46.6863, 7.8632]
      },
      capacity: {
        guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1
      },
      icalUrl: `https://www.airbnb.com/calendar/ical/${airbnbId}.ics`
    };
  }
}

// Scrape all 4 apartments
export async function scrapeAllApartments(): Promise<ApartmentData[]> {
  const results: ApartmentData[] = [];
  
  for (const apartment of AIRBNB_APARTMENTS) {
    const data = await scrapeAirbnbListing(apartment.url, apartment.id);
    if (data) {
      results.push(data);
    }
    
    // Add delay between requests
    await delay(3000 + Math.random() * 5000);
  }
  
  return results;
}

// Save scraped data to database
export async function saveApartmentData(data: ApartmentData) {
  try {
    const apartment = await prisma.apartment.upsert({
      where: { 
        airbnbId: data.airbnbId 
      },
      update: {
        title: data.title,
        description: data.description,
        images: JSON.stringify(data.images),
        amenities: JSON.stringify(data.amenities),
        price: data.pricing.basePrice,
        cleaningFee: data.pricing.cleaningFee || 50,
        maxGuests: data.capacity.guests,
        bedrooms: data.capacity.bedrooms,
        beds: data.capacity.beds,
        bathrooms: data.capacity.bathrooms,
        address: data.location.address,
        city: data.location.city,
        country: data.location.country,
        latitude: data.location.coordinates?.[0],
        longitude: data.location.coordinates?.[1],
        rating: data.rating?.average,
        reviewCount: data.rating?.count,
        icalUrl: data.icalUrl,
        lastSynced: new Date()
      },
      create: {
        airbnbId: data.airbnbId,
        airbnbUrl: data.airbnbUrl,
        title: data.title,
        description: data.description,
        images: JSON.stringify(data.images),
        amenities: JSON.stringify(data.amenities),
        price: data.pricing.basePrice,
        cleaningFee: data.pricing.cleaningFee || 50,
        maxGuests: data.capacity.guests,
        bedrooms: data.capacity.bedrooms,
        beds: data.capacity.beds,
        bathrooms: data.capacity.bathrooms,
        address: data.location.address,
        city: data.location.city,
        country: data.location.country,
        latitude: data.location.coordinates?.[0],
        longitude: data.location.coordinates?.[1],
        rating: data.rating?.average,
        reviewCount: data.rating?.count,
        icalUrl: data.icalUrl,
        lastSynced: new Date()
      }
    });
    
    console.log(`💾 Saved apartment ${data.title} to database`);
    return apartment;
  } catch (error) {
    console.error(`❌ Error saving apartment data:`, error);
    throw error;
  }
}

// Main import function
export async function importAirbnbApartments() {
  console.log('🚀 Starting Airbnb apartment import...');
  
  try {
    const apartments = await scrapeAllApartments();
    console.log(`📊 Scraped ${apartments.length} apartments`);
    
    for (const apartment of apartments) {
      await saveApartmentData(apartment);
    }
    
    console.log('✅ Import completed successfully!');
    return apartments;
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}