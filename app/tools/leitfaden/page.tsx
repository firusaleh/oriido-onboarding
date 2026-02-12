'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle, Circle, Clock, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface GuideStep {
  _id: string
  nummer: number
  titel: string
  beschreibung: string
  fragen: string[]
  tipps: string[]
  dauer: string
  ziel: string
}

export default function LeitfadenPage() {
  const router = useRouter()
  const [steps, setSteps] = useState<GuideStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuideSteps()
  }, [])

  const fetchGuideSteps = async () => {
    try {
      const response = await fetch('/api/guide-steps')
      if (response.ok) {
        const data = await response.json()
        setSteps(data)
      }
    } catch (error) {
      console.error('Error fetching guide steps:', error)
      toast.error('Fehler beim Laden des Leitfadens')
    } finally {
      setLoading(false)
    }
  }

  const markStepComplete = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber)
    } else {
      newCompleted.add(stepNumber)
    }
    setCompletedSteps(newCompleted)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="px-4 py-6">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()} 
              className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Gesprächsleitfaden</h1>
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, idx) => (
              <div key={s._id} className="flex-1 flex items-center">
                <button
                  onClick={() => setCurrentStep(idx)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    idx === currentStep
                      ? 'bg-white text-purple-600 scale-110'
                      : completedSteps.has(s.nummer)
                      ? 'bg-green-500 text-white'
                      : 'bg-white/30 text-white'
                  }`}
                >
                  {completedSteps.has(s.nummer) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{s.nummer}</span>
                  )}
                </button>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 transition-colors ${
                    completedSteps.has(s.nummer)
                      ? 'bg-green-500'
                      : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {step?.dauer}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Schritt {currentStep + 1} von {steps.length}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {step && (
            <motion.div
              key={step._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {step.nummer}. {step.titel}
                    </h2>
                    <p className="text-gray-600 mt-2">{step.beschreibung}</p>
                  </div>
                  <button
                    onClick={() => markStepComplete(step.nummer)}
                    className={`p-2 rounded-lg transition-colors ${
                      completedSteps.has(step.nummer)
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {completedSteps.has(step.nummer) ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Ziel dieses Schritts
                  </h3>
                  <p className="text-purple-700">{step.ziel}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Schlüsselfragen
                    </h3>
                    <ul className="space-y-2">
                      {step.fragen.map((frage, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-purple-600 mr-2 mt-1">•</span>
                          <span className="text-gray-700">{frage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Tipps & Tricks
                    </h3>
                    <ul className="space-y-2">
                      {step.tipps.map((tipp, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2 mt-1">✓</span>
                          <span className="text-gray-700">{tipp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Zurück
                </button>

                <div className="flex gap-2">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentStep
                          ? 'bg-purple-600'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === steps.length - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Weiter
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Fortschritt</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {completedSteps.size} / {steps.length} abgeschlossen
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}