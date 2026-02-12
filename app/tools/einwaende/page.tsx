'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Search, ChevronDown, ChevronUp, Plus, Edit2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Einwand {
  _id: string
  titel: string
  kategorie: string
  einwand: string
  antwort: string
  tipps: string[]
  haeufigkeit: 'häufig' | 'mittel' | 'selten'
}

const kategorien = [
  'Alle',
  'Preis',
  'Vertrauen',
  'Zeit',
  'Nutzen',
  'Technik',
  'Konkurrenz'
]

export default function EinwaendePage() {
  const router = useRouter()
  const [einwaende, setEinwaende] = useState<Einwand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKategorie, setSelectedKategorie] = useState('Alle')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    fetchEinwaende()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role || '')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }

  const fetchEinwaende = async () => {
    try {
      const response = await fetch('/api/objections')
      if (response.ok) {
        const data = await response.json()
        setEinwaende(data)
      }
    } catch (error) {
      console.error('Error fetching objections:', error)
      toast.error('Fehler beim Laden der Einwände')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const filteredEinwaende = einwaende.filter(e => {
    const matchesSearch = 
      e.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.einwand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.antwort.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesKategorie = selectedKategorie === 'Alle' || e.kategorie === selectedKategorie
    return matchesSearch && matchesKategorie
  })

  const getHaeufigkeitColor = (h: string) => {
    switch (h) {
      case 'häufig': return 'bg-red-100 text-red-700'
      case 'mittel': return 'bg-yellow-100 text-yellow-700'
      case 'selten': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="px-4 py-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()} 
              className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Einwände Datenbank</h1>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Einwände durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm rounded-lg placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {kategorien.map(kat => (
              <button
                key={kat}
                onClick={() => setSelectedKategorie(kat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedKategorie === kat
                    ? 'bg-white text-orange-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEinwaende.map(einwand => (
              <div key={einwand._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleExpand(einwand._id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {einwand.titel}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getHaeufigkeitColor(einwand.haeufigkeit)}`}>
                          {einwand.haeufigkeit}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {einwand.kategorie}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        &ldquo;{einwand.einwand}&rdquo;
                      </p>
                    </div>
                    <div className="ml-4 mt-1">
                      {expandedItems.has(einwand._id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
                
                {expandedItems.has(einwand._id) && (
                  <div className="px-4 pb-4 border-t">
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Empfohlene Antwort:</h4>
                      <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                        {einwand.antwort}
                      </p>
                    </div>
                    
                    {einwand.tipps && einwand.tipps.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Zusätzliche Tipps:</h4>
                        <ul className="space-y-1">
                          {einwand.tipps.map((tipp, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-orange-500 mr-2">•</span>
                              <span className="text-sm text-gray-600">{tipp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}