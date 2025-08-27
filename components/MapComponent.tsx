'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { FormData, MapMarker } from '@/types'

interface MapComponentProps {
  data: FormData[]
}

export default function MapComponent({ data }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null)

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['places']
      })

      try {
        const google = await loader.load()
        
        if (mapRef.current && !map) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
            zoom: 4,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })

          setMap(mapInstance)
          setInfoWindow(new google.maps.InfoWindow())
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    if (!map) {
      initMap()
    }
  }, [map])

  useEffect(() => {
    if (!map || !infoWindow) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: google.maps.Marker[] = []

    data.forEach((item) => {
      if (item.latitude && item.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: item.latitude, lng: item.longitude },
          map: map,
          title: item.name,
          icon: {
            url: getMarkerIcon(item.status),
            scaledSize: new google.maps.Size(30, 30)
          }
        })

        const content = `
          <div class="p-4 max-w-sm">
            <h3 class="font-semibold text-lg mb-2">${item.name}</h3>
            <p class="text-gray-600 mb-1">${item.email}</p>
            ${item.phone ? `<p class="text-gray-600 mb-1">${item.phone}</p>` : ''}
            <p class="text-gray-600 mb-2">${item.address}</p>
            <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}">
              ${item.status}
            </span>
          </div>
        `

        marker.addListener('click', () => {
          infoWindow.setContent(content)
          infoWindow.open(map, marker)
        })

        newMarkers.push(marker)
      }
    })

    setMarkers(newMarkers)

    // Fit bounds if we have markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!)
      })
      map.fitBounds(bounds)
    }
  }, [data, map, infoWindow])

  const getMarkerIcon = (status: string) => {
    const colors = {
      pending: '#fbbf24',    // yellow
      approved: '#10b981',   // green
      rejected: '#ef4444',   // red
      completed: '#3b82f6'   // blue
    }
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="15" fill="${colors[status as keyof typeof colors] || colors.pending}"/>
        <circle cx="15" cy="15" r="12" fill="white"/>
        <circle cx="15" cy="15" r="8" fill="${colors[status as keyof typeof colors] || colors.pending}"/>
      </svg>
    `)}`
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Status Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-gray-600">Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Rejected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

