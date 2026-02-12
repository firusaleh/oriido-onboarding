'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  MessageSquare, 
  Map, 
  Bell, 
  Users, 
  BarChart, 
  Settings,
  ArrowRight,
  TrendingUp,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminStats {
  totalUsers: number
  totalDocuments: number
  totalBriefings: number
  totalRestaurants: number
  activeUsers: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>('')
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDocuments: 0,
    totalBriefings: 0,
    totalRestaurants: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.role !== 'admin') {
          router.push('/dashboard')
          return
        }
        setUserRole(data.role)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const adminModules = [
    {
      title: 'Dokumente verwalten',
      icon: FileText,
      href: '/tools/dokumente',
      description: 'Dokumente hochladen, bearbeiten und löschen',
      color: 'from-blue-500 to-blue-600',
      stats: `${stats.totalDocuments} Dokumente`
    },
    {
      title: 'Einwände verwalten',
      icon: MessageSquare,
      href: '/admin/einwaende',
      description: 'Einwände und Antworten bearbeiten',
      color: 'from-orange-500 to-red-600',
      stats: '12 Einwände'
    },
    {
      title: 'Leitfaden bearbeiten',
      icon: Map,
      href: '/admin/leitfaden',
      description: 'Gesprächsleitfaden anpassen',
      color: 'from-purple-500 to-indigo-600',
      stats: '8 Schritte'
    },
    {
      title: 'Briefings erstellen',
      icon: Bell,
      href: '/tools/briefing',
      description: 'Neue Briefings für das Team',
      color: 'from-indigo-500 to-purple-600',
      stats: `${stats.totalBriefings} aktiv`
    },
    {
      title: 'Benutzer verwalten',
      icon: Users,
      href: '/admin/users',
      description: 'Benutzerkonten und Berechtigungen',
      color: 'from-green-500 to-teal-600',
      stats: `${stats.totalUsers} Benutzer`
    },
    {
      title: 'Onboardings',
      icon: BarChart,
      href: '/admin/onboardings',
      description: 'Onboarding-Einreichungen verwalten',
      color: 'from-pink-500 to-rose-600',
      stats: 'Alle anzeigen'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="px-4 py-8">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-300 mt-1">Verwaltung aller Module und Funktionen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Benutzer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRestaurants}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Dokumente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Aktiv heute</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Verwaltungsmodule</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {adminModules.map((module) => {
            const Icon = module.icon
            return (
              <button
                key={module.href}
                onClick={() => router.push(module.href)}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-5 text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                <p className="text-xs font-medium text-gray-500">{module.stats}</p>
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Schnellaktionen</h3>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/tools/briefing')}
              className="w-full text-left p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Neues Briefing erstellen
            </button>
            <button
              onClick={() => router.push('/admin/onboardings')}
              className="w-full text-left p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              <Users className="w-4 h-4 inline mr-2" />
              Onboardings verwalten
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}