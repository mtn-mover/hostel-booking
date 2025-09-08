import axios from 'axios';
import ICAL from 'ical.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BlockedDate {
  apartmentId: string;
  date: Date;
  source: 'airbnb' | 'manual' | 'booking';
}

export async function fetchICalData(icalUrl: string): Promise<Date[]> {
  try {
    console.log(`📅 Fetching iCal data from: ${icalUrl}`);
    
    const response = await axios.get(icalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HostelBookingSystem/1.0)'
      }
    });
    
    const jcalData = ICAL.parse(response.data);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    const blockedDates: Date[] = [];
    
    vevents.forEach(vevent => {
      const event = new ICAL.Event(vevent);
      const startDate = event.startDate.toJSDate();
      const endDate = event.endDate.toJSDate();
      
      // Add all dates in the range as blocked
      const currentDate = new Date(startDate);
      while (currentDate < endDate) {
        blockedDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    console.log(`✅ Found ${blockedDates.length} blocked dates`);
    return blockedDates;
    
  } catch (error) {
    console.error(`❌ Error fetching iCal data:`, error);
    return [];
  }
}

export async function syncApartmentAvailability(apartmentId: string, icalUrl: string) {
  try {
    console.log(`🔄 Syncing availability for apartment ${apartmentId}`);
    
    const blockedDates = await fetchICalData(icalUrl);
    
    // Delete old blocked dates for this apartment (matching the schema)
    await prisma.availability.deleteMany({
      where: {
        apartmentId,
        status: 'BOOKED' // Using enum value instead of source
      }
    });
    
    // Insert new blocked dates
    const availabilityRecords = blockedDates.map(date => ({
      apartmentId,
      date,
      status: 'BOOKED' as const, // Using schema enum
      priceOverride: null, // Will use default price
      reason: 'Airbnb booking'
    }));
    
    if (availabilityRecords.length > 0) {
      await prisma.availability.createMany({
        data: availabilityRecords
      });
    }
    
    // Update last sync time
    await prisma.apartment.update({
      where: { id: apartmentId },
      data: { lastSynced: new Date() }
    });
    
    console.log(`✅ Synced ${blockedDates.length} blocked dates for apartment ${apartmentId}`);
    return blockedDates;
    
  } catch (error) {
    console.error(`❌ Error syncing availability:`, error);
    throw error;
  }
}

export async function syncAllApartments() {
  try {
    console.log('🔄 Starting availability sync for all apartments...');
    
    const apartments = await prisma.apartment.findMany({
      where: {
        icalUrl: { not: null }
      }
    });
    
    for (const apartment of apartments) {
      if (apartment.icalUrl) {
        await syncApartmentAvailability(apartment.id, apartment.icalUrl);
        // Add delay between syncs
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('✅ Availability sync completed for all apartments');
  } catch (error) {
    console.error('❌ Error in sync all apartments:', error);
    throw error;
  }
}

// Schedule daily sync
export function scheduleDailySync() {
  // Run sync every day at 3 AM
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(3, 0, 0, 0);
  
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  
  const msUntilSync = scheduled.getTime() - now.getTime();
  
  setTimeout(() => {
    syncAllApartments();
    // Schedule next sync
    setInterval(() => {
      syncAllApartments();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }, msUntilSync);
  
  console.log(`📅 Daily sync scheduled for ${scheduled.toLocaleString()}`);
}