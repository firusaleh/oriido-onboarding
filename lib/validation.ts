import { z } from 'zod';

const oeffnungszeitSchema = z.object({
  von: z.string(),
  bis: z.string(),
  geschlossen: z.boolean(),
});

export const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurantname ist erforderlich"),
  strasse: z.string().min(1, "Straße ist erforderlich"),
  plz: z.string().length(5, "PLZ muss 5 Zeichen haben"),
  stadt: z.string().min(1, "Stadt ist erforderlich"),
  googleMapsLink: z.string().url().optional().or(z.literal('')),
  art: z.string().min(1, "Art des Restaurants ist erforderlich"),
  artSonstiges: z.string().optional(),
  sitzplaetzeInnen: z.number().optional(),
  sitzplaetzeAussen: z.number().optional(),
  oeffnungszeiten: z.object({
    montag: oeffnungszeitSchema,
    dienstag: oeffnungszeitSchema,
    mittwoch: oeffnungszeitSchema,
    donnerstag: oeffnungszeitSchema,
    freitag: oeffnungszeitSchema,
    samstag: oeffnungszeitSchema,
    sonntag: oeffnungszeitSchema,
  }),
});

export const kontaktSchema = z.object({
  inhaberName: z.string().min(1, "Name ist erforderlich"),
  inhaberRolle: z.string().min(1, "Rolle ist erforderlich"),
  handynummer: z.string().min(1, "Handynummer ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  bevorzugterKanal: z.string(),
  zweiterKontakt: z.object({
    name: z.string(),
    rolle: z.string(),
    handynummer: z.string(),
  }).optional(),
});

export const geschaeftsdatenSchema = z.object({
  firmenname: z.string().min(1, "Firmenname ist erforderlich"),
  rechtsform: z.string().min(1, "Rechtsform ist erforderlich"),
  steuernummer: z.string().min(1, "Steuernummer ist erforderlich"),
  ustId: z.string().optional(),
  handelsregister: z.string().optional(),
  iban: z.string().min(1, "IBAN ist erforderlich"),
  bic: z.string().optional(),
  bankname: z.string().optional(),
  rechnungsadresse: z.object({
    abweichend: z.boolean(),
    strasse: z.string().optional(),
    plz: z.string().optional(),
    stadt: z.string().optional(),
  }).optional(),
});

export const technikSchema = z.object({
  kassensystem: z.string().min(1, "Kassensystem ist erforderlich"),
  kassensystemAnderes: z.string().optional(),
  hatApiZugang: z.string(),
  wlanVorhanden: z.boolean().optional(),
  tabletImService: z.boolean().optional(),
  internetAnbieter: z.string().optional(),
});

export const tischeSchema = z.object({
  anzahlGesamt: z.number().min(1, "Anzahl Tische ist erforderlich"),
  anzahlInnen: z.number().optional(),
  anzahlAussen: z.number().optional(),
  nummerierungVorhanden: z.boolean().optional(),
  nummerierungSchema: z.string().optional(),
  grundrissFoto: z.string().optional(),
  besonderheiten: z.string().optional(),
});

export const speisekarteSchema = z.object({
  dateien: z.array(z.string()).min(1, "Mindestens eine Speisekarte erforderlich"),
  onlineLink: z.string().optional(),
  mehrereKarten: z.boolean().optional(),
  kartenBeschreibung: z.string().optional(),
  logo: z.string().optional(),
  restaurantFotos: z.array(z.string()).optional(),
  sprachen: z.array(z.string()).optional(),
});

export const vereinbarungSchema = z.object({
  paket: z.string(),
  startdatum: z.string().optional(),
  testphase: z.boolean().optional(),
  sonderkonditionen: z.string().optional(),
  unterschriftVerkäufer: z.string().optional(),
  unterschriftRestaurant: z.string().min(1, "Name des Ansprechpartners erforderlich"),
  zustimmungDSGVO: z.literal(true, {
    errorMap: () => ({ message: "DSGVO-Zustimmung ist erforderlich" })
  }),
  zustimmungAGB: z.literal(true, {
    errorMap: () => ({ message: "AGB-Zustimmung ist erforderlich" })
  }),
  notizen: z.string().optional(),
});