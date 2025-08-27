export interface FormData {
  id: string
  name: string
  email: string
  phone?: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  notes?: string
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

export interface MapMarker {
  id: string
  position: {
    lat: number
    lng: number
  }
  title: string
  data: FormData
}

