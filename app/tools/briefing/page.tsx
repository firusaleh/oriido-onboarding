'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Plus, Edit2, Trash2, Eye, EyeOff, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Briefing {
  _id: string
  titel: string
  inhalt: string
  kategorie: 'daily' | 'weekly' | 'important'
  prioritaet: 'hoch' | 'mittel' | 'niedrig'
  gueltigBis: string
  erstelltVon: string
  erstelltAm: string
  gelesen: boolean
}

export default function BriefingPage() {
  const router = useRouter()
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    titel: '',
    inhalt: '',
    kategorie: 'daily' as const,
    prioritaet: 'mittel' as const,
    gueltigBis: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchBriefings()
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

  const fetchBriefings = async () => {
    try {
      const response = await fetch('/api/briefings')
      if (response.ok) {
        const data = await response.json()
        setBriefings(data)
      }
    } catch (error) {
      console.error('Error fetching briefings:', error)
      toast.error('Fehler beim Laden der Briefings')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/briefings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Briefing erstellt')
        setShowCreateModal(false)
        setFormData({
          titel: '',
          inhalt: '',
          kategorie: 'daily',
          prioritaet: 'mittel',
          gueltigBis: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        fetchBriefings()
      }
    } catch (error) {
      console.error('Error creating briefing:', error)
      toast.error('Fehler beim Erstellen')
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/briefings/${id}/read`, {
        method: 'PUT'
      })

      if (response.ok) {
        fetchBriefings()
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Briefing wirklich löschen?')) return

    try {
      const response = await fetch(`/api/briefings/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Briefing gelöscht')
        fetchBriefings()
      }
    } catch (error) {
      console.error('Error deleting briefing:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'hoch': return 'bg-red-100 text-red-700 border-red-200'
      case 'mittel': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'niedrig': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryIcon = (k: string) => {
    switch (k) {
      case 'daily': return '📅'
      case 'weekly': return '📊'
      case 'important': return '⚠️'
      default: return '📌'
    }
  }

  const activeBriefings = briefings.filter(b => new Date(b.gueltigBis) >= new Date())
  const unreadCount = activeBriefings.filter(b => !b.gelesen).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()} 
                className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">Tägliches Briefing</h1>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                <Bell className="w-4 h-4" />
                <span className="font-bold">{unreadCount} neu</span>
              </div>
            )}
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">Heutiges Datum</p>
                <p className="text-xl font-semibold">
                  {new Date().toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {userRole === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full mb-6 bg-indigo-600 text-white p-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Neues Briefing erstellen
          </button>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : activeBriefings.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Keine aktuellen Briefings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBriefings.map(briefing => (
              <motion.div
                key={briefing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                  !briefing.gelesen ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className={`p-4 border-l-4 ${getPriorityColor(briefing.prioritaet)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(briefing.kategorie)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {briefing.titel}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(briefing.prioritaet)}`}>
                            {briefing.prioritaet}
                          </span>
                          <span className="text-xs text-gray-500">
                            Gültig bis {new Date(briefing.gueltigBis).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!briefing.gelesen && (
                        <button
                          onClick={() => handleMarkAsRead(briefing._id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Als gelesen markieren"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(briefing._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-gray-700 whitespace-pre-wrap">
                    {briefing.inhalt}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Erstellt von {briefing.erstelltVon} am {new Date(briefing.erstelltAm).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Neues Briefing</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={formData.titel}
                    onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inhalt
                  </label>
                  <textarea
                    value={formData.inhalt}
                    onChange={(e) => setFormData({ ...formData, inhalt: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorie
                    </label>
                    <select
                      value={formData.kategorie}
                      onChange={(e) => setFormData({ ...formData, kategorie: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="daily">Täglich</option>
                      <option value="weekly">Wöchentlich</option>
                      <option value="important">Wichtig</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorität
                    </label>
                    <select
                      value={formData.prioritaet}
                      onChange={(e) => setFormData({ ...formData, prioritaet: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="niedrig">Niedrig</option>
                      <option value="mittel">Mittel</option>
                      <option value="hoch">Hoch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gültig bis
                  </label>
                  <input
                    type="date"
                    value={formData.gueltigBis}
                    onChange={(e) => setFormData({ ...formData, gueltigBis: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Erstellen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}