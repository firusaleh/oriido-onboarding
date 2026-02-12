import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Objection from '@/lib/models/Objection'

const defaultObjections = [
  {
    titel: "Zu teuer",
    kategorie: "Preis",
    einwand: "Das ist mir zu teuer. Wir haben bereits genug Ausgaben.",
    antwort: "Ich verstehe Ihre Bedenken. Lassen Sie uns die Investition im Verhältnis zum Nutzen betrachten. Mit unserem System generieren Restaurants durchschnittlich 30% mehr Online-Bestellungen. Bei nur 3 zusätzlichen Bestellungen pro Tag haben Sie die Kosten bereits gedeckt.",
    tipps: [
      "ROI-Rechnung vorführen",
      "Erfolgsbeispiele ähnlicher Restaurants zeigen",
      "Flexible Zahlungsoptionen anbieten"
    ],
    haeufigkeit: "häufig"
  },
  {
    titel: "Keine Zeit",
    kategorie: "Zeit",
    einwand: "Wir haben keine Zeit für die Einrichtung und Schulung.",
    antwort: "Das höre ich oft und kann das gut verstehen. Genau deshalb haben wir unser System so einfach gestaltet. Die Einrichtung dauert nur 30 Minuten und wir übernehmen alles für Sie. Ihre Mitarbeiter brauchen keine Schulung - das System ist selbsterklärend.",
    tipps: [
      "Kostenlose Einrichtung betonen",
      "Support-Team erwähnen",
      "Video-Demo zeigen (2 Minuten)"
    ],
    haeufigkeit: "häufig"
  },
  {
    titel: "Haben schon System",
    kategorie: "Konkurrenz",
    einwand: "Wir haben bereits ein System / arbeiten mit XY zusammen.",
    antwort: "Das ist gut! Es zeigt, dass Sie die Digitalisierung ernst nehmen. Viele unserer Kunden hatten vorher andere Systeme. Darf ich fragen, was Ihnen an Ihrem aktuellen System besonders wichtig ist und was Sie sich noch wünschen würden?",
    tipps: [
      "Nach Schwachstellen des aktuellen Systems fragen",
      "Alleinstellungsmerkmale hervorheben",
      "Kostenlosen Testmonat anbieten"
    ],
    haeufigkeit: "häufig"
  },
  {
    titel: "Kein Bedarf",
    kategorie: "Nutzen",
    einwand: "Wir brauchen sowas nicht. Läuft auch so gut.",
    antwort: "Das freut mich, dass Ihr Geschäft gut läuft! Viele erfolgreiche Restaurants nutzen unser System, um noch erfolgreicher zu werden. Es geht nicht darum, Probleme zu lösen, sondern Chancen zu nutzen. Wussten Sie, dass 73% der Gäste online bestellen möchten?",
    tipps: [
      "Markttrends aufzeigen",
      "Wettbewerbsvorteile erklären",
      "Kundenwünsche thematisieren"
    ],
    haeufigkeit: "mittel"
  },
  {
    titel: "Zu kompliziert",
    kategorie: "Technik",
    einwand: "Das ist alles zu kompliziert für uns. Wir sind keine Technik-Experten.",
    antwort: "Das verstehe ich vollkommen und genau deshalb ist unser System perfekt für Sie! Wir haben es speziell für Gastronomen entwickelt, die sich auf ihr Geschäft konzentrieren wollen. Alles funktioniert automatisch - Sie müssen nur Bestellungen annehmen.",
    tipps: [
      "Einfachheit demonstrieren",
      "Support-Hotline erwähnen",
      "Referenzen von ähnlichen Kunden"
    ],
    haeufigkeit: "mittel"
  },
  {
    titel: "Provision zu hoch",
    kategorie: "Preis",
    einwand: "Die Provisionen bei Online-Bestellungen sind zu hoch.",
    antwort: "Das ist ein wichtiger Punkt. Mit unserem eigenen Bestellsystem zahlen Sie nur 3% statt der üblichen 15-30% bei Lieferplattformen. Sie behalten die volle Kontrolle und die Kundendaten gehören Ihnen.",
    tipps: [
      "Vergleich mit Lieferando & Co.",
      "Kundenbindung betonen",
      "Langfristige Ersparnis vorrechnen"
    ],
    haeufigkeit: "häufig"
  },
  {
    titel: "Erstmal überlegen",
    kategorie: "Vertrauen",
    einwand: "Wir müssen das erstmal intern besprechen.",
    antwort: "Natürlich, das ist eine wichtige Entscheidung. Ich stelle Ihnen gerne alle Unterlagen zusammen. Was wären denn die wichtigsten Punkte, die Sie intern klären müssen? Vielleicht kann ich Ihnen schon jetzt einige Antworten geben.",
    tipps: [
      "Entscheidungsträger identifizieren",
      "Follow-up Termin vereinbaren",
      "Dringlichkeit schaffen (limitiertes Angebot)"
    ],
    haeufigkeit: "häufig"
  },
  {
    titel: "Schlechte Erfahrungen",
    kategorie: "Vertrauen",
    einwand: "Wir hatten schlechte Erfahrungen mit solchen Anbietern.",
    antwort: "Das tut mir leid zu hören und ich kann Ihre Vorsicht verstehen. Darf ich fragen, was genau schiefgelaufen ist? Wir haben aus den Fehlern anderer gelernt und bieten deshalb eine 30-Tage-Geld-zurück-Garantie.",
    tipps: [
      "Empathie zeigen",
      "Konkrete Unterschiede aufzeigen",
      "Referenzen und Bewertungen zeigen"
    ],
    haeufigkeit: "mittel"
  },
  {
    titel: "Ältere Kundschaft",
    kategorie: "Nutzen",
    einwand: "Unsere Kunden sind älter und bestellen nicht online.",
    antwort: "Das ist ein häufiges Missverständnis. Studien zeigen, dass auch die Generation 50+ zunehmend online bestellt - besonders seit Corona. Außerdem gewinnen Sie neue, jüngere Kunden dazu, ohne die Stammkunden zu verlieren.",
    tipps: [
      "Statistiken zeigen",
      "Telefonbestellung weiterhin möglich",
      "Generationenwechsel thematisieren"
    ],
    haeufigkeit: "mittel"
  },
  {
    titel: "Personalprobleme",
    kategorie: "Zeit",
    einwand: "Wir haben zu wenig Personal, um das auch noch zu managen.",
    antwort: "Genau das ist ja der Vorteil! Unser System reduziert den Arbeitsaufwand. Keine Telefonate mehr für Bestellungen, alles läuft automatisch. Ihr Personal hat mehr Zeit für die Gäste vor Ort.",
    tipps: [
      "Zeitersparnis konkret berechnen",
      "Automatisierung betonen",
      "Fehlerreduktion erwähnen"
    ],
    haeufigkeit: "selten"
  },
  {
    titel: "Saison-Geschäft",
    kategorie: "Nutzen",
    einwand: "Wir haben nur saisonales Geschäft, das lohnt sich nicht.",
    antwort: "Gerade für saisonale Betriebe ist es wichtig, in der Hauptsaison maximal zu profitieren. Mit Online-Bestellungen können Sie Ihre Kapazität voll ausschöpfen. In der Nebensaison hilft es, Stammkunden zu halten.",
    tipps: [
      "Flexible Vertragslaufzeiten anbieten",
      "Vorbestellungen für Hauptsaison",
      "Marketing-Tools für Nebensaison"
    ],
    haeufigkeit: "selten"
  },
  {
    titel: "Datenschutz",
    kategorie: "Technik",
    einwand: "Was ist mit dem Datenschutz? Das ist uns zu heikel.",
    antwort: "Sehr gut, dass Sie darauf achten! Wir sind vollständig DSGVO-konform und hosted in Deutschland. Alle Daten sind verschlüsselt und Sie behalten die volle Kontrolle. Wir können Ihnen gerne unsere Zertifikate zeigen.",
    tipps: [
      "DSGVO-Konformität betonen",
      "Deutsche Server erwähnen",
      "Datenschutz-Dokumentation anbieten"
    ],
    haeufigkeit: "selten"
  }
]

export async function GET() {
  try {
    await connectToDatabase()
    
    // Check if objections exist, if not, seed them
    const count = await Objection.countDocuments()
    if (count === 0) {
      await Objection.insertMany(defaultObjections)
    }
    
    const objections = await Objection.find().sort({ haeufigkeit: 1, kategorie: 1 })
    return NextResponse.json(objections)
  } catch (error) {
    console.error('Error fetching objections:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Einwände' },
      { status: 500 }
    )
  }
}