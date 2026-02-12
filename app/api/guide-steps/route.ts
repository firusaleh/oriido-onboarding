import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import GuideStep from '@/lib/models/GuideStep'

const defaultSteps = [
  {
    nummer: 1,
    titel: "Begrüßung & Warming-Up",
    beschreibung: "Schaffen Sie eine positive Atmosphäre und bauen Sie Vertrauen auf.",
    fragen: [
      "Wie läuft es aktuell in Ihrem Restaurant?",
      "Was sind Ihre größten Herausforderungen im Moment?",
      "Wie zufrieden sind Sie mit Ihrer aktuellen Auslastung?"
    ],
    tipps: [
      "Lächeln und Augenkontakt halten",
      "Aktiv zuhören und Notizen machen",
      "Gemeinsame Themen finden (Wetter, lokale Events)",
      "Entspannte Körperhaltung einnehmen"
    ],
    dauer: "5 Minuten",
    ziel: "Vertrauen aufbauen und eine angenehme Gesprächsatmosphäre schaffen"
  },
  {
    nummer: 2,
    titel: "Bedarfsanalyse",
    beschreibung: "Verstehen Sie die spezifischen Bedürfnisse und Schmerzpunkte des Restaurants.",
    fragen: [
      "Wie viele Bestellungen erhalten Sie täglich per Telefon?",
      "Nutzen Ihre Kunden bereits Online-Bestellmöglichkeiten?",
      "Welche Lieferplattformen verwenden Sie und wie zufrieden sind Sie damit?",
      "Was würden Sie sich von einem idealen Bestellsystem wünschen?"
    ],
    tipps: [
      "Offene Fragen stellen",
      "Nach konkreten Beispielen fragen",
      "Probleme vertiefen mit 'Erzählen Sie mehr darüber'",
      "Emotionale Reaktionen beachten"
    ],
    dauer: "10 Minuten",
    ziel: "Konkrete Probleme identifizieren, die Oriido lösen kann"
  },
  {
    nummer: 3,
    titel: "Lösung präsentieren",
    beschreibung: "Stellen Sie Oriido als maßgeschneiderte Lösung für die identifizierten Probleme vor.",
    fragen: [
      "Wie klingt es für Sie, wenn ich Ihnen sage, dass...",
      "Was halten Sie davon, wenn Ihre Kunden...",
      "Können Sie sich vorstellen, wie das Ihren Alltag erleichtern würde?"
    ],
    tipps: [
      "Nutzen statt Features betonen",
      "Mit konkreten Zahlen arbeiten",
      "Erfolgsgeschichten einbauen",
      "Demo auf Tablet/Smartphone zeigen",
      "Kunde selbst ausprobieren lassen"
    ],
    dauer: "15 Minuten",
    ziel: "Oriido als perfekte Lösung positionieren und Begeisterung wecken"
  },
  {
    nummer: 4,
    titel: "Einwände behandeln",
    beschreibung: "Gehen Sie professionell mit Bedenken und Einwänden um.",
    fragen: [
      "Was sind Ihre größten Bedenken?",
      "Was müsste passieren, damit Sie überzeugt sind?",
      "Welche Fragen sind noch offen?"
    ],
    tipps: [
      "Einwände als Kaufsignale verstehen",
      "Erst verstehen, dann antworten",
      "Mit Referenzen arbeiten",
      "Garantien und Sicherheiten betonen"
    ],
    dauer: "10 Minuten",
    ziel: "Alle Bedenken ausräumen und Vertrauen stärken"
  },
  {
    nummer: 5,
    titel: "Nutzen zusammenfassen",
    beschreibung: "Fassen Sie die wichtigsten Vorteile nochmals zusammen.",
    fragen: [
      "Lassen Sie mich nochmal zusammenfassen, was Oriido für Sie bedeutet...",
      "Sie sparen also X Euro und Y Stunden pro Monat - richtig?",
      "Die wichtigsten Punkte für Sie waren..."
    ],
    tipps: [
      "Die 3 wichtigsten Vorteile wiederholen",
      "Persönlichen Nutzen betonen",
      "ROI nochmals vorrechnen",
      "Emotionale Vorteile einbeziehen"
    ],
    dauer: "5 Minuten",
    ziel: "Kaufentscheidung vorbereiten durch klare Nutzenargumentation"
  },
  {
    nummer: 6,
    titel: "Testphase anbieten",
    beschreibung: "Reduzieren Sie das Risiko durch ein attraktives Testangebot.",
    fragen: [
      "Wie wäre es, wenn Sie Oriido 30 Tage kostenlos testen?",
      "Was haben Sie zu verlieren?",
      "Wann könnten wir mit der Einrichtung starten?"
    ],
    tipps: [
      "Dringlichkeit schaffen (limitiertes Angebot)",
      "Einfachheit der Einrichtung betonen",
      "Support-Leistungen hervorheben",
      "Keine Verpflichtungen erwähnen"
    ],
    dauer: "5 Minuten",
    ziel: "Erste Zusage für Testphase erhalten"
  },
  {
    nummer: 7,
    titel: "Abschluss",
    beschreibung: "Sichern Sie die Vereinbarung und klären Sie die nächsten Schritte.",
    fragen: [
      "Soll ich die Einrichtung für morgen/übermorgen einplanen?",
      "Welche Zahlungsart bevorzugen Sie?",
      "Wer soll bei der Einrichtung dabei sein?"
    ],
    tipps: [
      "Assumptive Close verwenden",
      "Konkrete nächste Schritte vereinbaren",
      "Termin direkt im Kalender eintragen",
      "Visitenkarte und Unterlagen dalassen"
    ],
    dauer: "5 Minuten",
    ziel: "Verbindliche Zusage mit konkretem Starttermin"
  },
  {
    nummer: 8,
    titel: "Nachbereitung",
    beschreibung: "Sichern Sie den langfristigen Erfolg durch professionelle Nachbetreuung.",
    fragen: [
      "Wie läuft es mit Oriido?",
      "Gibt es noch Fragen oder Wünsche?",
      "Kennen Sie andere Restaurants, die auch profitieren könnten?"
    ],
    tipps: [
      "Follow-up E-Mail am gleichen Tag",
      "WhatsApp-Gruppe für Support anbieten",
      "Nach 1 Woche anrufen",
      "Empfehlungen erfragen",
      "Erfolge dokumentieren für Case Studies"
    ],
    dauer: "Ongoing",
    ziel: "Kundenzufriedenheit sichern und Empfehlungen generieren"
  }
]

export async function GET() {
  try {
    await connectToDatabase()
    
    // Check if steps exist, if not, seed them
    const count = await GuideStep.countDocuments()
    if (count === 0) {
      await GuideStep.insertMany(defaultSteps)
    }
    
    const steps = await GuideStep.find().sort({ nummer: 1 })
    return NextResponse.json(steps)
  } catch (error) {
    console.error('Error fetching guide steps:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Leitfadens' },
      { status: 500 }
    )
  }
}