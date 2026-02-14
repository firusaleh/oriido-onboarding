export const contractTemplates = [
  {
    name: 'Oriido Partnervertrag Standard',
    description: 'Standardvertrag für neue Restaurant-Partner',
    category: 'partner',
    active: true,
    version: 1,
    variables: [
      {
        key: 'restaurantName',
        label: 'Restaurantname',
        type: 'text',
        required: true,
      },
      {
        key: 'firmenname',
        label: 'Firmenname',
        type: 'text',
        required: true,
      },
      {
        key: 'strasse',
        label: 'Straße und Hausnummer',
        type: 'text',
        required: true,
      },
      {
        key: 'plz',
        label: 'Postleitzahl',
        type: 'text',
        required: true,
      },
      {
        key: 'stadt',
        label: 'Stadt',
        type: 'text',
        required: true,
      },
      {
        key: 'anzahlTische',
        label: 'Anzahl Tische',
        type: 'number',
        required: true,
      },
      {
        key: 'setupGebuehr',
        label: 'Einrichtungsgebühr',
        type: 'number',
        required: true,
        defaultValue: '300',
      },
      {
        key: 'preismodell',
        label: 'Preismodell',
        type: 'select',
        required: true,
        options: ['Pay per Order (€0,45)', 'Flat Rate (€279/Monat)'],
      },
      {
        key: 'testphase',
        label: 'Testphase',
        type: 'text',
        required: false,
        defaultValue: '100 Bestellungen kostenfrei',
      },
    ],
    content: `PARTNERVERTRAG

zwischen

Oriido GmbH
Musterstraße 123
12345 Berlin
Handelsregister: HRB 123456 B
Vertreten durch: Geschäftsführung
(nachfolgend "Oriido" genannt)

und

{{firmenname}}
{{strasse}}
{{plz}} {{stadt}}
(nachfolgend "Partner" genannt)

PRÄAMBEL

Oriido betreibt eine digitale Plattform für die Gastronomie, die es Restaurants ermöglicht, Bestellungen digital entgegenzunehmen und zu verwalten. Der Partner möchte diese Plattform für sein Restaurant {{restaurantName}} nutzen.

§1 VERTRAGSGEGENSTAND

1.1 Oriido stellt dem Partner eine digitale Bestellplattform ("Plattform") zur Verfügung, über die Gäste mittels QR-Codes Bestellungen aufgeben können.

1.2 Die Plattform umfasst:
- Digitale Speisekarte mit Mehrsprachigkeit
- QR-Code-System für {{anzahlTische}} Tische
- Bestellverwaltung und -übersicht
- Zahlungsabwicklung
- Statistiken und Auswertungen

§2 LEISTUNGEN VON ORIIDO

2.1 Oriido verpflichtet sich zu folgenden Leistungen:
- Bereitstellung und Wartung der Plattform
- Erstellung und Lieferung der QR-Codes
- Digitalisierung der Speisekarte
- Technischer Support während der Geschäftszeiten
- Regelmäßige Updates und Verbesserungen
- Schulung des Personals (einmalig)

2.2 Die Verfügbarkeit der Plattform beträgt mindestens 99% im Jahresmittel.

§3 PFLICHTEN DES PARTNERS

3.1 Der Partner verpflichtet sich:
- Aktuelle Speisekarten und Preise zu pflegen
- Bestellungen zeitnah zu bearbeiten
- Personal in der Nutzung zu schulen
- QR-Codes sichtbar zu platzieren
- Kundenbeschwerden eigenverantwortlich zu bearbeiten

3.2 Der Partner trägt die Verantwortung für die Richtigkeit aller Angaben.

§4 VERGÜTUNG

4.1 Preismodell: {{preismodell}}

4.2 Einmalige Einrichtungsgebühr: €{{setupGebuehr}} (netto)

4.3 Testphase: {{testphase}}

4.4 Alle Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer.

4.5 Die Abrechnung erfolgt monatlich nachträglich. Zahlungsziel: 14 Tage nach Rechnungsstellung.

§5 DATENSCHUTZ

5.1 Beide Parteien verpflichten sich zur Einhaltung der geltenden Datenschutzbestimmungen, insbesondere der DSGVO.

5.2 Oriido verarbeitet personenbezogene Daten ausschließlich im Rahmen der Auftragsverarbeitung.

5.3 Ein separater Auftragsverarbeitungsvertrag wird geschlossen.

§6 HAFTUNG

6.1 Oriido haftet für Vorsatz und grobe Fahrlässigkeit unbeschränkt.

6.2 Bei leichter Fahrlässigkeit haftet Oriido nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren, vertragstypischen Schaden.

6.3 Die Haftung für Datenverlust ist auf den typischen Wiederherstellungsaufwand beschränkt.

§7 LAUFZEIT UND KÜNDIGUNG

7.1 Der Vertrag beginnt mit Unterzeichnung und läuft auf unbestimmte Zeit.

7.2 Nach der Testphase beträgt die Mindestvertragslaufzeit 3 Monate.

7.3 Kündigungsfrist: 1 Monat zum Monatsende.

7.4 Das Recht zur außerordentlichen Kündigung bleibt unberührt.

§8 SCHLUSSBESTIMMUNGEN

8.1 Änderungen und Ergänzungen bedürfen der Schriftform.

8.2 Erfüllungsort und Gerichtsstand ist Berlin.

8.3 Es gilt das Recht der Bundesrepublik Deutschland.

8.4 Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.`,
  },
  {
    name: 'Datenschutzvereinbarung DSGVO',
    description: 'Vereinbarung zur Auftragsverarbeitung nach Art. 28 DSGVO',
    category: 'datenschutz',
    active: true,
    version: 1,
    variables: [
      {
        key: 'firmenname',
        label: 'Firmenname',
        type: 'text',
        required: true,
      },
      {
        key: 'ansprechpartner',
        label: 'Ansprechpartner Datenschutz',
        type: 'text',
        required: true,
      },
      {
        key: 'email',
        label: 'E-Mail Adresse',
        type: 'text',
        required: true,
      },
    ],
    content: `VEREINBARUNG ZUR AUFTRAGSVERARBEITUNG
gemäß Art. 28 DSGVO

zwischen

{{firmenname}}
(nachfolgend "Verantwortlicher" genannt)

und

Oriido GmbH
(nachfolgend "Auftragsverarbeiter" genannt)

§1 GEGENSTAND UND DAUER DER VERARBEITUNG

1.1 Gegenstand der Verarbeitung sind personenbezogene Daten, die im Rahmen der Nutzung der Oriido-Plattform anfallen.

1.2 Die Dauer der Verarbeitung entspricht der Laufzeit des Hauptvertrags.

§2 ART UND ZWECK DER VERARBEITUNG

2.1 Art der Verarbeitung:
- Erhebung und Speicherung von Bestelldaten
- Verarbeitung von Kundenkontaktdaten
- Zahlungsabwicklung

2.2 Zweck: Bereitstellung der digitalen Bestellplattform

§3 ART DER PERSONENBEZOGENEN DATEN

Folgende Datenkategorien werden verarbeitet:
- Kundenstammdaten (Name, Adresse, Kontaktdaten)
- Bestelldaten (Bestellungen, Präferenzen)
- Zahlungsdaten (verschlüsselt)
- Nutzungsdaten (Zeitstempel, IP-Adressen)

§4 KATEGORIEN BETROFFENER PERSONEN

- Kunden des Restaurants
- Mitarbeiter des Restaurants
- Lieferanten

§5 PFLICHTEN DES AUFTRAGSVERARBEITERS

5.1 Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschließlich auf dokumentierte Weisung des Verantwortlichen.

5.2 Der Auftragsverarbeiter gewährleistet, dass alle zur Verarbeitung befugten Personen zur Vertraulichkeit verpflichtet wurden.

5.3 Der Auftragsverarbeiter ergreift alle gemäß Art. 32 DSGVO erforderlichen technischen und organisatorischen Maßnahmen.

§6 TECHNISCHE UND ORGANISATORISCHE MASSNAHMEN

Der Auftragsverarbeiter hat folgende Maßnahmen implementiert:
- Verschlüsselung der Datenübertragung (TLS/SSL)
- Verschlüsselung der Datenbanken
- Regelmäßige Backups
- Zugriffskontrolle und Berechtigungskonzepte
- Protokollierung von Zugriffen
- Regelmäßige Sicherheitsupdates

§7 KONTAKT

Ansprechpartner Datenschutz beim Verantwortlichen:
{{ansprechpartner}}
E-Mail: {{email}}

Datenschutzbeauftragter Oriido GmbH:
datenschutz@oriido.de`,
  },
  {
    name: 'Allgemeine Geschäftsbedingungen',
    description: 'AGB für die Nutzung der Oriido-Plattform',
    category: 'agb',
    active: true,
    version: 1,
    variables: [],
    content: `ALLGEMEINE GESCHÄFTSBEDINGUNGEN
der Oriido GmbH

§1 GELTUNGSBEREICH

1.1 Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der Oriido GmbH und ihren Vertragspartnern (Restaurants).

1.2 Abweichende AGB des Vertragspartners gelten nur, wenn Oriido diesen ausdrücklich schriftlich zustimmt.

§2 VERTRAGSSCHLUSS

2.1 Die Präsentation der Dienstleistungen stellt kein bindendes Angebot dar.

2.2 Der Vertrag kommt durch Unterzeichnung des Partnervertrags zustande.

§3 LEISTUNGSUMFANG

3.1 Der konkrete Leistungsumfang ergibt sich aus dem individuellen Partnervertrag.

3.2 Oriido ist berechtigt, zur Leistungserbringung Dritte einzusetzen.

§4 PREISE UND ZAHLUNG

4.1 Es gelten die im Partnervertrag vereinbarten Preise.

4.2 Alle Preise verstehen sich netto zzgl. gesetzlicher Mehrwertsteuer.

4.3 Bei Zahlungsverzug werden Verzugszinsen in Höhe von 9 Prozentpunkten über dem Basiszinssatz berechnet.

§5 MITWIRKUNGSPFLICHTEN

5.1 Der Vertragspartner stellt alle für die Leistungserbringung erforderlichen Informationen rechtzeitig zur Verfügung.

5.2 Der Vertragspartner ist für die Aktualität der Speisekarte und Preise selbst verantwortlich.

§6 GEWÄHRLEISTUNG

6.1 Oriido gewährleistet die vertragsgemäße Erbringung der Leistungen.

6.2 Mängel sind unverzüglich schriftlich anzuzeigen.

§7 HAFTUNG

7.1 Die Haftung von Oriido richtet sich nach den gesetzlichen Bestimmungen bei Vorsatz und grober Fahrlässigkeit.

7.2 Bei leichter Fahrlässigkeit haftet Oriido nur bei Verletzung wesentlicher Vertragspflichten.

§8 VERTRAGSLAUFZEIT

8.1 Die Vertragslaufzeit ergibt sich aus dem Partnervertrag.

8.2 Das Recht zur außerordentlichen Kündigung bleibt unberührt.

§9 DATENSCHUTZ

9.1 Die Verarbeitung personenbezogener Daten erfolgt gemäß DSGVO.

9.2 Details regelt die separate Datenschutzvereinbarung.

§10 ÄNDERUNGEN DER AGB

10.1 Oriido behält sich vor, diese AGB zu ändern.

10.2 Änderungen werden dem Vertragspartner mindestens 4 Wochen vor Inkrafttreten mitgeteilt.

§11 SCHLUSSBESTIMMUNGEN

11.1 Erfüllungsort und Gerichtsstand ist Berlin.

11.2 Es gilt das Recht der Bundesrepublik Deutschland.

Stand: ${new Date().toLocaleDateString('de-DE')}`,
  },
  {
    name: 'Servicevereinbarung Support',
    description: 'Vereinbarung über Support-Leistungen',
    category: 'service',
    active: true,
    version: 1,
    variables: [
      {
        key: 'supportLevel',
        label: 'Support-Level',
        type: 'select',
        required: true,
        options: ['Basic', 'Premium', 'Enterprise'],
        defaultValue: 'Basic',
      },
      {
        key: 'reaktionszeit',
        label: 'Garantierte Reaktionszeit',
        type: 'select',
        required: true,
        options: ['24 Stunden', '8 Stunden', '4 Stunden', '1 Stunde'],
        defaultValue: '24 Stunden',
      },
    ],
    content: `SERVICE LEVEL AGREEMENT (SLA)

Support-Level: {{supportLevel}}

§1 SUPPORT-UMFANG

1.1 Oriido bietet technischen Support für die bereitgestellte Plattform.

1.2 Der Support umfasst:
- Behebung technischer Störungen
- Hilfe bei der Bedienung
- Updates und Wartung
- Telefonischer und E-Mail-Support

§2 SUPPORT-ZEITEN

Montag - Freitag: 9:00 - 18:00 Uhr
Samstag: 10:00 - 14:00 Uhr (nur Premium/Enterprise)
Sonntag und Feiertage: Notfallsupport (nur Enterprise)

§3 REAKTIONSZEITEN

Garantierte Reaktionszeit: {{reaktionszeit}}

Prioritäten:
- Kritisch (Komplettausfall): {{reaktionszeit}}
- Hoch (Teilausfall): 2x {{reaktionszeit}}
- Mittel (Einschränkung): 4x {{reaktionszeit}}
- Niedrig (Komfort): Best Effort

§4 ESKALATION

Stufe 1: First Level Support
Stufe 2: Second Level Support
Stufe 3: Entwicklung
Stufe 4: Geschäftsführung

§5 VERFÜGBARKEIT

Garantierte Plattform-Verfügbarkeit:
- Basic: 98% im Monatsmittel
- Premium: 99% im Monatsmittel
- Enterprise: 99,5% im Monatsmittel

§6 WARTUNGSFENSTER

Geplante Wartungen:
- Ankündigung: 7 Tage im Voraus
- Zeitfenster: Dienstag 2:00 - 6:00 Uhr

§7 AUSSCHLÜSSE

Nicht vom Support umfasst:
- Schulungen (über Erstschulung hinaus)
- Individuelle Anpassungen
- Probleme durch Drittanbieter
- Höhere Gewalt`,
  },
];

export async function seedContractTemplates() {
  try {
    const response = await fetch('/api/contracts/templates/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractTemplates),
    });
    
    if (response.ok) {
      console.log('Contract templates seeded successfully');
      return true;
    } else {
      console.error('Failed to seed contract templates');
      return false;
    }
  } catch (error) {
    console.error('Error seeding contract templates:', error);
    return false;
  }
}