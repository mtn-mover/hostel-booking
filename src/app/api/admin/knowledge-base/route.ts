import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs/promises'
import path from 'path'

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'src', 'lib', 'knowledge-base-data.json')

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to read the JSON file, if it doesn't exist, return default structure
    try {
      const data = await fs.readFile(KNOWLEDGE_BASE_PATH, 'utf-8')
      const knowledgeBase = JSON.parse(data)
      return NextResponse.json({ knowledgeBase })
    } catch (error) {
      // Return default structure if file doesn't exist
      return NextResponse.json({ 
        knowledgeBase: {
          general: {
            name: "Heart of Interlaken Apartments",
            address: "",
            phone: "",
            email: "",
            website: "https://heartofinterlaken.ch",
            languages: ["Deutsch", "English", "Français"]
          },
          checkin: {
            standardTime: "ab 17:00 Uhr",
            lateCheckin: "Kein Problem - Self Check-in mit Code verfügbar",
            earlyCheckin: "Vor 17:00 nach Absprache möglich",
            selfCheckin: "24/7 Self Check-in über Schlüsselbox mit Code",
            checkoutTime: "11:00 Uhr",
            keyReturn: "Schlüssel in Schlüsselbox zurücklegen"
          },
          wifi: {
            network: "",
            password: "",
            speed: "Highspeed Internet",
            coverage: "100% Abdeckung in allen Räumen"
          },
          location: {
            trainStation: "",
            busStop: "",
            parking: "",
            nearbyShops: ""
          },
          apartments: {
            heart1: { name: "Heart 1", maxGuests: 2, description: "", amenities: "", price: "" },
            heart2: { name: "Heart 2", maxGuests: 4, description: "", amenities: "", price: "" },
            heart3: { name: "Heart 3", maxGuests: 4, description: "", amenities: "", price: "" },
            heart4: { name: "Heart 4", maxGuests: 4, description: "", amenities: "", price: "" },
            heart5: { name: "Heart 5", maxGuests: 6, description: "", amenities: "", price: "" }
          },
          policies: {
            checkInFee: "Keine Early oder Late Check-in Gebühren",
            pets: "",
            smoking: "Rauchfrei in allen Apartments",
            parties: "Keine Partys erlaubt",
            cancellation: ""
          }
        }
      })
    }
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { knowledgeBase } = await request.json()

    // Save to JSON file
    await fs.writeFile(
      KNOWLEDGE_BASE_PATH,
      JSON.stringify(knowledgeBase, null, 2),
      'utf-8'
    )

    // Also update the TypeScript file for immediate use
    const tsContent = `// Auto-generated from admin interface - DO NOT EDIT DIRECTLY
// Use the admin interface at /admin/knowledge-base to make changes

export const dynamicKnowledgeBase = ${JSON.stringify(knowledgeBase, null, 2)};
`

    const tsPath = path.join(process.cwd(), 'src', 'lib', 'dynamic-knowledge-base.ts')
    await fs.writeFile(tsPath, tsContent, 'utf-8')

    return NextResponse.json({ 
      success: true,
      message: 'Knowledge Base erfolgreich gespeichert' 
    })
  } catch (error) {
    console.error('Error saving knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to save knowledge base' },
      { status: 500 }
    )
  }
}