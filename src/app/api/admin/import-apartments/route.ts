import { NextRequest, NextResponse } from 'next/server';
import { importAirbnbApartments } from '@/lib/scrapers/airbnb-scraper';
import { syncAllApartments } from '@/lib/scrapers/ical-sync';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting apartment import process...');

    // Import apartment data from Airbnb
    const apartments = await importAirbnbApartments();
    console.log(`✅ Imported ${apartments.length} apartments`);

    // Sync availability from iCal feeds
    console.log('🔄 Starting iCal sync...');
    await syncAllApartments();
    console.log('✅ iCal sync completed');

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${apartments.length} apartments and synced availability`,
      apartments: apartments.map(apt => ({
        id: apt.airbnbId,
        title: apt.title,
        url: apt.airbnbUrl
      }))
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Apartment Import API',
    endpoints: {
      POST: '/api/admin/import-apartments - Import all apartments from Airbnb and sync availability'
    }
  });
}