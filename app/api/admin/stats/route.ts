import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getSession } from '@/lib/auth'
import User from '@/lib/models/User'
import Document from '@/lib/models/Document'
import Briefing from '@/lib/models/Briefing'
import CrmRestaurant from '@/lib/models/CrmRestaurant'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    await connectToDatabase()

    // Get statistics
    const totalUsers = await User.countDocuments()
    const totalDocuments = await Document.countDocuments()
    const totalBriefings = await Briefing.countDocuments({ 
      gueltigBis: { $gte: new Date() } 
    })
    const totalRestaurants = await CrmRestaurant.countDocuments()
    
    // Get active users today (simplified - in production you'd track actual activity)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: today }
    })

    return NextResponse.json({
      totalUsers,
      totalDocuments,
      totalBriefings,
      totalRestaurants,
      activeUsers
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Statistiken' },
      { status: 500 }
    )
  }
}