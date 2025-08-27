'use client'

import { useState, useEffect } from 'react'
import MapComponent from '@/components/MapComponent'
import DataTable from '@/components/DataTable'
import SearchFilters from '@/components/SearchFilters'
import { createClient } from '@supabase/supabase-js'
import { FormData } from '@/types'

// Create Supabase client only when environment variables are available
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export default function Home() {
  const [formData, setFormData] = useState<FormData[]>([])
  const [filteredData, setFilteredData] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const supabase = createSupabaseClient()
    if (supabase) {
      fetchData(supabase)
      subscribeToRealtimeUpdates(supabase)
    }
  }, [])

  useEffect(() => {
    filterData()
  }, [formData, searchTerm, selectedStatus])

  const fetchData = async (supabaseClient: any) => {
    try {
      const { data, error } = await supabaseClient
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFormData(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToRealtimeUpdates = (supabaseClient: any) => {
    const subscription = supabaseClient
      .channel('form_submissions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'form_submissions' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setFormData(prev => [payload.new as FormData, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setFormData(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as FormData : item
            ))
          } else if (payload.eventType === 'DELETE') {
            setFormData(prev => prev.filter(item => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const filterData = () => {
    let filtered = formData

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    setFilteredData(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monroe Camera App</h1>
              <p className="text-gray-600">Form Data Visualization Dashboard</p>
            </div>
            <div className="text-sm text-gray-500">
              {formData.length} submissions
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Map</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapComponent data={filteredData} />
              </div>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Submissions</h2>
              <DataTable data={filteredData.slice(0, 10)} />
            </div>
          </div>
        </div>

        {/* Full Data Table */}
        <div className="mt-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Submissions</h2>
            <DataTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  )
}
