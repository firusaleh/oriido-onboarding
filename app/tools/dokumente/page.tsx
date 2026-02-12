'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Download, FileText, Trash2, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Document {
  _id: string
  titel: string
  beschreibung: string
  kategorie: string
  dateiName: string
  dateiGroesse: number
  dateiTyp: string
  url: string
  hochgeladenAm: string
  hochgeladenVon: string
}

const kategorien = [
  'Alle',
  'Präsentationen',
  'Verträge',
  'Produktinfos',
  'Preislisten',
  'Schulungen',
  'Marketing',
  'Sonstiges'
]

export default function DokumentePage() {
  const router = useRouter()
  const [dokumente, setDokumente] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKategorie, setSelectedKategorie] = useState('Alle')
  const [userRole, setUserRole] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchDokumente()
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

  const fetchDokumente = async () => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDokumente(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Fehler beim Laden der Dokumente')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Datei ist zu groß (max. 10MB)')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    const titel = prompt('Titel für das Dokument:')
    const beschreibung = prompt('Kurze Beschreibung:')
    const kategorie = prompt(`Kategorie (${kategorien.slice(1).join(', ')}):`) || 'Sonstiges'
    
    if (!titel) {
      setUploading(false)
      return
    }

    formData.append('titel', titel)
    formData.append('beschreibung', beschreibung || '')
    formData.append('kategorie', kategorie)

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Dokument erfolgreich hochgeladen')
        fetchDokumente()
      } else {
        throw new Error('Upload fehlgeschlagen')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Fehler beim Hochladen')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Dokument wirklich löschen?')) return

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Dokument gelöscht')
        fetchDokumente()
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc._id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = doc.dateiName
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Fehler beim Download')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredDokumente = dokumente.filter(doc => {
    const matchesSearch = doc.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.beschreibung.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesKategorie = selectedKategorie === 'Alle' || doc.kategorie === selectedKategorie
    return matchesSearch && matchesKategorie
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="px-4 py-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()} 
              className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Dokumente Hub</h1>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Dokumente suchen..."
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
                    ? 'bg-white text-blue-600'
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
        {userRole === 'admin' && (
          <label className="block mb-6">
            <div className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              <Upload className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">
                {uploading ? 'Wird hochgeladen...' : 'Dokument hochladen'}
              </span>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
              disabled={uploading}
            />
          </label>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredDokumente.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Keine Dokumente gefunden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDokumente.map(doc => (
              <div key={doc._id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doc.titel}</h3>
                    <p className="text-sm text-gray-600 mt-1">{doc.beschreibung}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {doc.kategorie}
                      </span>
                      <span>{formatFileSize(doc.dateiGroesse)}</span>
                      <span>{new Date(doc.hochgeladenAm).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}