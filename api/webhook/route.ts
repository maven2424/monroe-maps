import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the webhook secret if you want to add security
    const authHeader = request.headers.get('authorization')
    if (process.env.WEBHOOK_SECRET && authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract form data from the request
    const {
      name,
      phone,
      type_of_place,
      address,
      retention_days,
      notes,
      status = 'pending'
    } = body

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address' },
        { status: 400 }
      )
    }

    // Geocode the address to get coordinates
    let latitude, longitude
    try {
      const fullAddress = [address, city, state, zip_code].filter(Boolean).join(', ')
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      )
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json()
        if (geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location
          latitude = location.lat
          longitude = location.lng
        }
      }
    } catch (geocodeError) {
      console.warn('Geocoding failed:', geocodeError)
      // Continue without coordinates - they can be added later
    }

    // Insert the form submission into Supabase
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([
        {
          name,
          phone,
          type_of_place: type_of_place || '',
          address,
          retention_days: retention_days || '',
          notes,
          status,
          latitude,
          longitude
        }
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to store submission' },
        { status: 500 }
      )
    }

    console.log('Form submission stored successfully:', data[0])

    return NextResponse.json({
      success: true,
      message: 'Form submission received and stored',
      id: data[0].id
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is active' })
}

