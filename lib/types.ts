export type OnboardingStatus = "entwurf" | "eingereicht" | "in_bearbeitung" | "abgeschlossen";

export interface Oeffnungszeit {
  von: string;
  bis: string;
  geschlossen: boolean;
}

export interface Restaurant {
  name: string;
  strasse: string;
  plz: string;
  stadt: string;
  googleMapsLink?: string;
  art: string;
  artSonstiges?: string;
  sitzplaetzeInnen?: number;
  sitzplaetzeAussen?: number;
  oeffnungszeiten: {
    montag: Oeffnungszeit;
    dienstag: Oeffnungszeit;
    mittwoch: Oeffnungszeit;
    donnerstag: Oeffnungszeit;
    freitag: Oeffnungszeit;
    samstag: Oeffnungszeit;
    sonntag: Oeffnungszeit;
  };
}

export interface Kontakt {
  inhaberName: string;
  inhaberRolle: string;
  handynummer: string;
  email: string;
  bevorzugterKanal: string;
  zweiterKontakt?: {
    name: string;
    rolle: string;
    handynummer: string;
  };
}

export interface Geschaeftsdaten {
  firmenname: string;
  rechtsform: string;
  steuernummer: string;
  ustId?: string;
  handelsregister?: string;
  iban: string;
  bic?: string;
  bankname?: string;
  rechnungsadresse?: {
    abweichend: boolean;
    strasse?: string;
    plz?: string;
    stadt?: string;
  };
}

export interface Technik {
  kassensystem: string;
  kassensystemAnderes?: string;
  hatApiZugang: string;
  wlanVorhanden?: boolean;
  tabletImService?: boolean;
  internetAnbieter?: string;
}

export interface Tische {
  anzahlGesamt: number;
  anzahlInnen?: number;
  anzahlAussen?: number;
  nummerierungVorhanden?: boolean;
  nummerierungSchema?: string;
  grundrissFoto?: string;
  besonderheiten?: string;
}

export interface Speisekarte {
  dateien: string[];
  onlineLink?: string;
  mehrereKarten?: boolean;
  kartenBeschreibung?: string;
  logo?: string;
  restaurantFotos?: string[];
  sprachen?: string[];
}

export interface Vereinbarung {
  paket: string;
  startdatum?: string;
  testphase?: boolean;
  sonderkonditionen?: string;
  unterschriftVerkäufer?: string;
  unterschriftRestaurant?: string;
  zustimmungDSGVO?: boolean;
  zustimmungAGB?: boolean;
  notizen?: string;
}

export interface Fotos {
  aussenansicht?: string;
  innenraum?: string;
}

export interface OnboardingDocument {
  _id?: string;
  status: OnboardingStatus;
  erstelltAm: Date;
  eingereichtAm?: Date | null;
  verkaeuferId: string;
  verkaeuferName?: string;
  userId?: string; // Reference to User model
  restaurant?: Partial<Restaurant>;
  kontakt?: Partial<Kontakt>;
  geschaeftsdaten?: Partial<Geschaeftsdaten>;
  technik?: Partial<Technik>;
  tische?: Partial<Tische>;
  speisekarte?: Partial<Speisekarte>;
  vereinbarung?: Partial<Vereinbarung>;
  fotos?: Partial<Fotos>;
  interneNotizen?: string;
}