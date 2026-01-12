import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Euro, AlertCircle, CheckCircle, Calendar, Wifi, Wind, UtensilsCrossed, Car, Sparkles, Waves, X, Shield, Home, Menu } from 'lucide-react';
import { notifyAdminNewBooking } from './emailService';
/* eslint-disable no-restricted-globals */
const API_URL = 'https://villa-marina-api.onrender.com/api';

const CasaMareSite = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [language, setLanguage] = useState('it');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Stati GDPR
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState({
    booking: false,
    contact: false
  });
  // Translations
  const translations = {
  it: {
    heroTitle: "Il Tuo Rifugio Sul Mare",
    heroSubtitle: "Dove il lusso incontra l'orizzonte infinito del Mediterraneo",
    bookNow: "Prenota Ora",
    home: "home",
    property: "proprietà",
    gallery: "galleria",
    services: "servizi",
    booking: "prenota",
    contacts: "contatti",
    invalidEmail: "Inserisci un indirizzo email valido",
    invalidPhone: "Inserisci un numero di telefono valido",
    fillAllFields: "Compila tutti i campi obbligatori",
    fillAllContactFields: "Compila tutti i campi del modulo contatti",
    acceptPrivacy: "Devi accettare l'informativa privacy per procedere",
    bookingSuccess: "Richiesta di prenotazione inviata! Riceverai una conferma via email entro 24 ore.",
    contactSuccess: "Messaggio inviato con successo! Ti ricontatteremo presto.",
    ourVilla: "La Nostra Villa",
    unforgettableExp: "Un'Esperienza Indimenticabile",
    photoGallery: "Galleria Fotografica",
    servicesIncluded: "Servizi Inclusi",
    bookYourVacation: "Prenota la Tua Vacanza",
    lowSeason: "Bassa Stagione",
    highSeason: "Alta Stagione",
    perWeek: "/settimana",
    previous: "← Precedente",
    next: "Successivo →",
    checkIn: "Check-in",
    checkOut: "Check-out",
    total: "Totale",
    selectedDate: "Data selezionata",
    selectEndDate: "Seleziona data di fine",
    completeBooking: "Completa la Prenotazione",
    fullName: "Nome Completo",
    email: "Email",
    phone: "Telefono",
    guests: "Ospiti",
    cancel: "Annulla",
    confirm: "Conferma",
    sending: "Invio...",
    contactUs: "Contattaci",
    information: "Informazioni",
    address: "Indirizzo",
    hours: "Orari",
    sendMessage: "Invia un Messaggio",
    name: "Nome e Cognome",
    message: "Messaggio",
    sendRequest: "Invia Richiesta",
    privacyPolicy: "Privacy Policy",
    cookiePolicy: "Cookie Policy",
    readAccept: "Ho letto e accetto l'",
    privacyInfo: "informativa privacy",
    gdprConsent: "e autorizzo il trattamento dei miei dati personali ai sensi del GDPR (Regolamento UE 2016/679)",
    forBooking: "per l'elaborazione della prenotazione",
    required: "*",
    close: "Chiudi",
    allRightsReserved: "Tutti i diritti riservati",
    villaDescription1: "Casa Marè è una splendida proprietà di lusso situata direttamente sulla costa, con accesso privato alla spiaggia. Questa residenza esclusiva offre un rifugio perfetto per chi cerca tranquillità e comfort in un ambiente mozzafiato.",
    villaDescription2: "Con i suoi ampi spazi interni ed esterni, la villa può ospitare comodamente fino a 8 persone, rendendola ideale per famiglie o gruppi di amici desiderosi di vivere un'esperienza unica.",
    bedrooms: "Camere",
    spaciousDecorated: "Spaziose e arredate",
    bathrooms: "Bagni",
    modernEquipped: "Moderni e attrezzati",
    squareMeters: "m²",
    pureComfort: "Di puro comfort",
    pool: "Piscina",
    seaView: "Vista mare panoramica",
    cinCir: "CIN e CIR",
    cinCirDesc: "CIN IT053006C2RQZ6FHWS CIR 053006LTN2665",
    airConditioning: "Aria Condizionata",
    inAllRooms: "In tutte le stanze",
    equippedKitchen: "Cucina Attrezzata",
    completeAppliances: "Completa di elettrodomestici",
    privateParking: "Parcheggio Privato",
    safeForCar: "Sicuro per 1 auto",
    cleanHouse: "Casa Pulita",
    alwaysInOrder: "Sempre in Ordine",
    seaViewLiving: "Vista Mare",
    fromLivingGarden: "Dal Soggiorno, Giardino o dalla Terrazza",
    externalView: "Vista Esterna",
    livingRoom: "Soggiorno",
    masterBedroom: "Camera Matrimoniale",
    kitchen: "Cucina",
    panorama: "Panorama",
    terrace: "Terrazza",
    octoberMay: "Ottobre - Maggio",
    juneSeptember: "Giugno - Settembre",
    addressDetails: "Via del Mare 123\n00100 Località Marina",
    telephone: "Telefono",
    hoursDetails: "Lun-Ven: 9:00 - 18:00\nSab: 9:00 - 13:00",
    copyright: "© 2024 Casa Marè. Tutti i diritti riservati.",
    vat: "P.IVA: 12345678901",
    notes: "Note",
    additionalNotes: "Note aggiuntive (opzionale)",
    cookieBannerTitle: "Utilizzo dei Cookie",
    cookieBannerText: "Utilizziamo cookie tecnici necessari per il funzionamento del sito. Non utilizziamo cookie di profilazione o tracciamento. Continuando la navigazione accetti l'utilizzo dei cookie tecnici.",
    moreInfo: "Maggiori Info",
    decline: "Rifiuta",
    accept: "Accetta",
    privacyTitle: "Informativa Privacy",
    dataController: "1. Titolare del Trattamento",
    dataControllerText: "Casa Marè S.r.l., con sede in Via del Mare 123, 00100 Località Marina",
    dataControllerContact: "Email: privacy@casamare.it | Tel: +39 123 456 7890",
    dataCollected: "2. Dati Raccolti",
    dataCollectedText: "Raccogliamo i seguenti dati personali:",
    dataCollectedList: ["Nome e cognome", "Indirizzo email", "Numero di telefono", "Date di prenotazione e numero ospiti", "Eventuali note o richieste specifiche"],
    processingPurpose: "3. Finalità del Trattamento",
    processingPurposeText: "I dati vengono trattati per:",
    processingPurposeList: ["Gestione delle prenotazioni e richieste di informazioni", "Comunicazioni relative al servizio richiesto", "Adempimenti di obblighi contrattuali e fiscali"],
    legalBasis: "4. Base Giuridica",
    legalBasisText: "Il trattamento è basato su:",
    legalBasisList: ["Esecuzione di un contratto (prenotazione)", "Consenso dell'interessato (richieste informazioni)", "Obblighi di legge (fiscali, contabili)"],
    dataRetention: "5. Conservazione dei Dati",
    dataRetentionText: "I dati saranno conservati per:",
    dataRetentionList: ["Durata del rapporto contrattuale", "10 anni per adempimenti fiscali", "Fino a revoca del consenso per richieste informazioni"],
    userRights: "6. Diritti dell'Interessato",
    userRightsText: "Hai diritto di:",
    userRightsList: ["Accedere ai tuoi dati personali", "Richiedere la rettifica o cancellazione", "Limitare il trattamento", "Opporti al trattamento", "Richiedere la portabilità dei dati", "Revocare il consenso in qualsiasi momento", "Proporre reclamo al Garante Privacy"],
    exerciseRights: "Per esercitare i tuoi diritti, contattaci a: privacy@casamare.it",
    dataCommunication: "7. Comunicazione dei Dati",
    dataCommunicationText: "I dati potranno essere comunicati a:",
    dataCommunicationList: ["Fornitori di servizi IT per la gestione del sistema", "Consulenti legali, fiscali e amministrativi", "Autorità pubbliche per obblighi di legge"],
    dataTransfer: "8. Trasferimento Dati Extra-UE",
    dataTransferText: "I dati non vengono trasferiti al di fuori dell'Unione Europea.",
    security: "9. Sicurezza",
    securityText: "Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati da accessi non autorizzati, perdita o divulgazione.",
    cookiePolicyTitle: "Cookie Policy",
    whatAreCookies: "Cosa sono i Cookie",
    whatAreCookiesText: "I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. Vengono utilizzati per migliorare l'esperienza di navigazione.",
    cookiesUsed: "Cookie Utilizzati",
    technicalCookies: "Cookie Tecnici (Necessari)",
    technicalCookiesDesc: "Sono essenziali per il funzionamento del sito e non possono essere disabilitati.",
    cookieName: "casa-mare-cookie-consent",
    cookieNameDesc: "memorizza la tua preferenza sui cookie",
    duration: "Durata",
    durationValue: "12 mesi",
    purpose: "Finalità",
    purposeValue: "ricordare la tua scelta sui cookie",
    cookiesNotUsed: "Cookie NON Utilizzati",
    cookiesNotUsedText: "Il nostro sito NON utilizza:",
    cookiesNotUsedList: ["Cookie di profilazione", "Cookie di tracciamento", "Cookie di terze parti per pubblicità", "Cookie di analisi (Google Analytics o simili)"],
    manageCookies: "Gestione dei Cookie",
    manageCookiesText: "Puoi gestire o disabilitare i cookie attraverso le impostazioni del tuo browser:",
    browserList: ["Chrome: Impostazioni → Privacy e sicurezza → Cookie", "Firefox: Opzioni → Privacy e sicurezza → Cookie", "Safari: Preferenze → Privacy → Cookie", "Edge: Impostazioni → Cookie e autorizzazioni sito"],
    disableNote: "Nota: disabilitare i cookie tecnici potrebbe compromettere alcune funzionalità del sito.",
    updates: "Aggiornamenti",
    updatesText: "Questa Cookie Policy può essere aggiornata periodicamente. Ti invitiamo a consultarla regolarmente.",
    lastUpdate: "Ultimo aggiornamento: Gennaio 2026",
    monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
    dayNames: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
    exclusiveRentals: "Affitti Esclusivi sul Mare",
    backToHome: "Torna alla Home"
  },
  en: {
    heroTitle: "Your Seaside Retreat",
    heroSubtitle: "Where luxury meets the endless Mediterranean horizon",
    bookNow: "Book Now",
    home: "home",
    property: "property",
    gallery: "gallery",
    services: "services",
    booking: "book",
    contacts: "contacts",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    fillAllFields: "Please fill in all required fields",
    fillAllContactFields: "Please fill in all contact form fields",
    acceptPrivacy: "You must accept the privacy policy to proceed",
    bookingSuccess: "Booking request sent! You will receive a confirmation email within 24 hours.",
    contactSuccess: "Message sent successfully! We will contact you soon.",
    ourVilla: "Our Villa",
    unforgettableExp: "An Unforgettable Experience",
    photoGallery: "Photo Gallery",
    servicesIncluded: "Services Included",
    bookYourVacation: "Book Your Vacation",
    lowSeason: "Low Season",
    highSeason: "High Season",
    perWeek: "/week",
    previous: "← Previous",
    next: "Next →",
    checkIn: "Check-in",
    checkOut: "Check-out",
    total: "Total",
    selectedDate: "Selected date",
    selectEndDate: "Select end date",
    completeBooking: "Complete Booking",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    guests: "Guests",
    cancel: "Cancel",
    confirm: "Confirm",
    sending: "Sending...",
    contactUs: "Contact Us",
    information: "Information",
    address: "Address",
    hours: "Hours",
    sendMessage: "Send a Message",
    name: "Name and Surname",
    message: "Message",
    sendRequest: "Send Request",
    privacyPolicy: "Privacy Policy",
    cookiePolicy: "Cookie Policy",
    readAccept: "I have read and accept the",
    privacyInfo: "privacy policy",
    gdprConsent: "and authorize the processing of my personal data in accordance with GDPR (EU Regulation 2016/679)",
    forBooking: "for booking processing",
    required: "*",
    close: "Close",
    allRightsReserved: "All rights reserved",
    villaDescription1: "Casa Marè is a stunning luxury property located directly on the coast, with private beach access. This exclusive residence offers a perfect retreat for those seeking tranquility and comfort in a breathtaking environment.",
    villaDescription2: "With its spacious indoor and outdoor areas, the villa can comfortably accommodate up to 8 people, making it ideal for families or groups of friends eager to experience something unique.",
    bedrooms: "Bedrooms",
    spaciousDecorated: "Spacious and decorated",
    bathrooms: "Bathrooms",
    modernEquipped: "Modern and equipped",
    squareMeters: "sqm",
    pureComfort: "Of pure comfort",
    pool: "Pool",
    seaView: "Panoramic sea view",
    cinCir: "CIN and CIR",
    cinCirDesc: "CIN IT053006C2RQZ6FHWS CIR 053006LTN2665",
    airConditioning: "Air Conditioning",
    inAllRooms: "In all rooms",
    equippedKitchen: "Equipped Kitchen",
    completeAppliances: "Complete with appliances",
    privateParking: "Private Parking",
    safeForCar: "Safe for 1 car",
    cleanHouse: "Clean House",
    alwaysInOrder: "Always in Order",
    seaViewLiving: "Sea View",
    fromLivingGarden: "From Living Room, Garden or Terrace",
    externalView: "External View",
    livingRoom: "Living Room",
    masterBedroom: "Master Bedroom",
    kitchen: "Kitchen",
    panorama: "Panorama",
    terrace: "Terrace",
    octoberMay: "October - May",
    juneSeptember: "June - September",
    addressDetails: "Via del Mare 123\n00100 Località Marina",
    telephone: "Phone",
    hoursDetails: "Mon-Fri: 9:00 - 18:00\nSat: 9:00 - 13:00",
    copyright: "© 2024 Casa Marè. All rights reserved.",
    vat: "VAT: 12345678901",
    notes: "Notes",
    additionalNotes: "Additional notes (optional)",
    cookieBannerTitle: "Cookie Usage",
    cookieBannerText: "We use technical cookies necessary for the site to function. We do not use profiling or tracking cookies. By continuing to browse, you accept the use of technical cookies.",
    moreInfo: "More Info",
    decline: "Decline",
    accept: "Accept",
    privacyTitle: "Privacy Policy",
    dataController: "1. Data Controller",
    dataControllerText: "Casa Marè S.r.l., located at Via del Mare 123, 00100 Località Marina",
    dataControllerContact: "Email: privacy@casamare.it | Tel: +39 123 456 7890",
    dataCollected: "2. Data Collected",
    dataCollectedText: "We collect the following personal data:",
    dataCollectedList: ["Name and surname", "Email address", "Phone number", "Booking dates and number of guests", "Any notes or specific requests"],
    processingPurpose: "3. Processing Purpose",
    processingPurposeText: "Data is processed for:",
    processingPurposeList: ["Management of bookings and information requests", "Communications related to the requested service", "Fulfillment of contractual and tax obligations"],
    legalBasis: "4. Legal Basis",
    legalBasisText: "Processing is based on:",
    legalBasisList: ["Contract execution (booking)", "Data subject's consent (information requests)", "Legal obligations (tax, accounting)"],
    dataRetention: "5. Data Retention",
    dataRetentionText: "Data will be retained for:",
    dataRetentionList: ["Duration of the contractual relationship", "10 years for tax compliance", "Until consent withdrawal for information requests"],
    userRights: "6. Data Subject Rights",
    userRightsText: "You have the right to:",
    userRightsList: ["Access your personal data", "Request rectification or deletion", "Limit processing", "Object to processing", "Request data portability", "Withdraw consent at any time", "Lodge a complaint with the Privacy Authority"],
    exerciseRights: "To exercise your rights, contact us at: privacy@casamare.it",
    dataCommunication: "7. Data Communication",
    dataCommunicationText: "Data may be communicated to:",
    dataCommunicationList: ["IT service providers for system management", "Legal, tax and administrative consultants", "Public authorities for legal obligations"],
    dataTransfer: "8. Extra-EU Data Transfer",
    dataTransferText: "Data is not transferred outside the European Union.",
    security: "9. Security",
    securityText: "We adopt adequate technical and organizational measures to protect your data from unauthorized access, loss or disclosure.",
    cookiePolicyTitle: "Cookie Policy",
    whatAreCookies: "What are Cookies",
    whatAreCookiesText: "Cookies are small text files that are stored on your device when you visit a website. They are used to improve the browsing experience.",
    cookiesUsed: "Cookies Used",
    technicalCookies: "Technical Cookies (Necessary)",
    technicalCookiesDesc: "They are essential for the site to function and cannot be disabled.",
    cookieName: "casa-mare-cookie-consent",
    cookieNameDesc: "stores your cookie preference",
    duration: "Duration",
    durationValue: "12 months",
    purpose: "Purpose",
    purposeValue: "remember your cookie choice",
    cookiesNotUsed: "Cookies NOT Used",
    cookiesNotUsedText: "Our site does NOT use:",
    cookiesNotUsedList: ["Profiling cookies", "Tracking cookies", "Third-party cookies for advertising", "Analytics cookies (Google Analytics or similar)"],
    manageCookies: "Cookie Management",
    manageCookiesText: "You can manage or disable cookies through your browser settings:",
    browserList: ["Chrome: Settings → Privacy and security → Cookies", "Firefox: Options → Privacy and security → Cookies", "Safari: Preferences → Privacy → Cookies", "Edge: Settings → Cookies and site permissions"],
    disableNote: "Note: disabling technical cookies may compromise some site features.",
    updates: "Updates",
    updatesText: "This Cookie Policy may be updated periodically. We invite you to consult it regularly.",
    lastUpdate: "Last update: January 2026",
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    exclusiveRentals: "Exclusive Seaside Rentals",
    backToHome: "Back to Home"
  },
  de: {
    heroTitle: "Ihr Refugium am Meer",
    heroSubtitle: "Wo Luxus auf den endlosen mediterranen Horizont trifft",
    bookNow: "Jetzt Buchen",
    home: "startseite",
    property: "objekt",
    gallery: "galerie",
    services: "dienstleistungen",
    booking: "buchen",
    contacts: "kontakte",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    invalidPhone: "Bitte geben Sie eine gültige Telefonnummer ein",
    fillAllFields: "Bitte füllen Sie alle erforderlichen Felder aus",
    fillAllContactFields: "Bitte füllen Sie alle Kontaktformularfelder aus",
    acceptPrivacy: "Sie müssen die Datenschutzerklärung akzeptieren, um fortzufahren",
    bookingSuccess: "Buchungsanfrage gesendet! Sie erhalten innerhalb von 24 Stunden eine Bestätigungs-E-Mail.",
    contactSuccess: "Nachricht erfolgreich gesendet! Wir werden Sie bald kontaktieren.",
    ourVilla: "Unsere Villa",
    unforgettableExp: "Ein Unvergessliches Erlebnis",
    photoGallery: "Fotogalerie",
    servicesIncluded: "Enthaltene Dienstleistungen",
    bookYourVacation: "Buchen Sie Ihren Urlaub",
    lowSeason: "Nebensaison",
    highSeason: "Hauptsaison",
    perWeek: "/Woche",
    previous: "← Zurück",
    next: "Weiter →",
    checkIn: "Check-in",
    checkOut: "Check-out",
    total: "Gesamt",
    selectedDate: "Ausgewähltes Datum",
    selectEndDate: "Enddatum auswählen",
    completeBooking: "Buchung Abschließen",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    phone: "Telefon",
    guests: "Gäste",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    sending: "Senden...",
    contactUs: "Kontaktieren Sie Uns",
    information: "Informationen",
    address: "Adresse",
    hours: "Öffnungszeiten",
    sendMessage: "Nachricht Senden",
    name: "Name und Nachname",
    message: "Nachricht",
    sendRequest: "Anfrage Senden",
    privacyPolicy: "Datenschutzerklärung",
    cookiePolicy: "Cookie-Richtlinie",
    readAccept: "Ich habe die",
    privacyInfo: "Datenschutzerklärung",
    gdprConsent: "gelesen und akzeptiert und autorisiere die Verarbeitung meiner personenbezogenen Daten gemäß DSGVO (EU-Verordnung 2016/679)",
    forBooking: "zur Buchungsabwicklung",
    required: "*",
    close: "Schließen",
    allRightsReserved: "Alle Rechte vorbehalten",
    villaDescription1: "Casa Marè ist eine atemberaubende Luxusimmobilie direkt an der Küste mit privatem Strandzugang. Diese exklusive Residenz bietet einen perfekten Rückzugsort für alle, die Ruhe und Komfort in einer atemberaubenden Umgebung suchen.",
    villaDescription2: "Mit ihren großzügigen Innen- und Außenbereichen bietet die Villa bequem Platz für bis zu 8 Personen und ist somit ideal für Familien oder Freundesgruppen, die etwas Einzigartiges erleben möchten.",
    bedrooms: "Schlafzimmer",
    spaciousDecorated: "Geräumig und eingerichtet",
    bathrooms: "Badezimmer",
    modernEquipped: "Modern und ausgestattet",
    squareMeters: "qm",
    pureComfort: "Purer Komfort",
    pool: "Pool",
    seaView: "Panorama-Meerblick",
    cinCir: "CIN und CIR",
    cinCirDesc: "CIN IT053006C2RQZ6FHWS CIR 053006LTN2665",
    airConditioning: "Klimaanlage",
    inAllRooms: "In allen Räumen",
    equippedKitchen: "Ausgestattete Küche",
    completeAppliances: "Komplett mit Geräten",
    privateParking: "Privatparkplatz",
    safeForCar: "Sicher für 1 Auto",
    cleanHouse: "Sauberes Haus",
    alwaysInOrder: "Immer in Ordnung",
    seaViewLiving: "Meerblick",
    fromLivingGarden: "Vom Wohnzimmer, Garten oder Terrasse",
    externalView: "Außenansicht",
    livingRoom: "Wohnzimmer",
    masterBedroom: "Hauptschlafzimmer",
    kitchen: "Küche",
    panorama: "Panorama",
    terrace: "Terrasse",
    octoberMay: "Oktober - Mai",
    juneSeptember: "Juni - September",
    addressDetails: "Via del Mare 123\n00100 Località Marina",
    telephone: "Telefon",
    hoursDetails: "Mo-Fr: 9:00 - 18:00\nSa: 9:00 - 13:00",
    copyright: "© 2024 Casa Marè. Alle Rechte vorbehalten.",
    vat: "USt-IdNr.: 12345678901",
    notes: "Notizen",
    additionalNotes: "Zusätzliche Notizen (optional)",
    cookieBannerTitle: "Cookie-Nutzung",
    cookieBannerText: "Wir verwenden technische Cookies, die für die Funktion der Website erforderlich sind. Wir verwenden keine Profiling- oder Tracking-Cookies. Wenn Sie weiter surfen, akzeptieren Sie die Verwendung technischer Cookies.",
    moreInfo: "Mehr Infos",
    decline: "Ablehnen",
    accept: "Akzeptieren",
    privacyTitle: "Datenschutzerklärung",
    dataController: "1. Verantwortlicher für die Datenverarbeitung",
    dataControllerText: "Casa Marè S.r.l., mit Sitz in Via del Mare 123, 00100 Località Marina",
    dataControllerContact: "E-Mail: privacy@casamare.it | Tel: +39 123 456 7890",
    dataCollected: "2. Erhobene Daten",
    dataCollectedText: "Wir erheben folgende personenbezogene Daten:",
    dataCollectedList: ["Name und Nachname", "E-Mail-Adresse", "Telefonnummer", "Buchungsdaten und Anzahl der Gäste", "Eventuelle Notizen oder spezielle Anfragen"],
    processingPurpose: "3. Zweck der Verarbeitung",
    processingPurposeText: "Die Daten werden verarbeitet für:",
    processingPurposeList: ["Verwaltung von Buchungen und Informationsanfragen", "Kommunikation im Zusammenhang mit dem angeforderten Service", "Erfüllung vertraglicher und steuerlicher Verpflichtungen"],
    legalBasis: "4. Rechtsgrundlage",
    legalBasisText: "Die Verarbeitung basiert auf:",
    legalBasisList: ["Vertragserfüllung (Buchung)", "Einwilligung der betroffenen Person (Informationsanfragen)", "Gesetzliche Verpflichtungen (steuerlich, buchhalterisch)"],
    dataRetention: "5. Datenspeicherung",
    dataRetentionText: "Die Daten werden gespeichert für:",
    dataRetentionList: ["Dauer der Vertragsbeziehung", "10 Jahre für steuerliche Zwecke", "Bis zum Widerruf der Einwilligung für Informationsanfragen"],
    userRights: "6. Rechte der betroffenen Person",
    userRightsText: "Sie haben das Recht:",
    userRightsList: ["Auf Ihre personenbezogenen Daten zuzugreifen", "Berichtigung oder Löschung zu verlangen", "Die Verarbeitung einzuschränken", "Der Verarbeitung zu widersprechen", "Datenübertragbarkeit zu verlangen", "Die Einwilligung jederzeit zu widerrufen", "Beschwerde bei der Datenschutzbehörde einzureichen"],
    exerciseRights: "Um Ihre Rechte auszuüben, kontaktieren Sie uns unter: privacy@casamare.it",
    dataCommunication: "7. Datenweitergabe",
    dataCommunicationText: "Die Daten können weitergegeben werden an:",
    dataCommunicationList: ["IT-Dienstleister für die Systemverwaltung", "Rechts-, Steuer- und Verwaltungsberater", "Öffentliche Behörden aufgrund gesetzlicher Verpflichtungen"],
    dataTransfer: "8. Datenübermittlung außerhalb der EU",
    dataTransferText: "Die Daten werden nicht außerhalb der Europäischen Union übermittelt.",
    security: "9. Sicherheit",
    securityText: "Wir ergreifen angemessene technische und organisatorische Maßnahmen, um Ihre Daten vor unbefugtem Zugriff, Verlust oder Offenlegung zu schützen.",
    cookiePolicyTitle: "Cookie-Richtlinie",
    whatAreCookies: "Was sind Cookies",
    whatAreCookiesText: "Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie eine Website besuchen. Sie werden verwendet, um das Surferlebnis zu verbessern.",
    cookiesUsed: "Verwendete Cookies",
    technicalCookies: "Technische Cookies (Notwendig)",
    technicalCookiesDesc: "Sie sind für die Funktion der Website unerlässlich und können nicht deaktiviert werden.",
    cookieName: "casa-mare-cookie-consent",
    cookieNameDesc: "speichert Ihre Cookie-Präferenz",
duration: "Dauer",
durationValue: "12 Monate",
purpose: "Zweck",
purposeValue: "Ihre Cookie-Wahl zu merken",
cookiesNotUsed: "NICHT verwendete Cookies",
cookiesNotUsedText: "Unsere Website verwendet NICHT:",
cookiesNotUsedList: ["Profiling-Cookies", "Tracking-Cookies", "Drittanbieter-Cookies für Werbung", "Analyse-Cookies (Google Analytics oder ähnliche)"],
manageCookies: "Cookie-Verwaltung",
manageCookiesText: "Sie können Cookies über Ihre Browser-Einstellungen verwalten oder deaktivieren:",
browserList: ["Chrome: Einstellungen → Datenschutz und Sicherheit → Cookies", "Firefox: Optionen → Datenschutz und Sicherheit → Cookies", "Safari: Einstellungen → Datenschutz → Cookies", "Edge: Einstellungen → Cookies und Websiteberechtigungen"],
disableNote: "Hinweis: Das Deaktivieren technischer Cookies kann einige Website-Funktionen beeinträchtigen.",
updates: "Aktualisierungen",
updatesText: "Diese Cookie-Richtlinie kann regelmäßig aktualisiert werden. Wir laden Sie ein, sie regelmäßig zu konsultieren.",
lastUpdate: "Letzte Aktualisierung: Januar 2026",
monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
dayNames: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
exclusiveRentals: "Exklusive Vermietungen am Meer",
backToHome: "Zurück zur Startseite"
},
fr: {
heroTitle: "Votre Refuge en Bord de Mer",
heroSubtitle: "Où le luxe rencontre l'horizon infini de la Méditerranée",
bookNow: "Réserver Maintenant",
home: "accueil",
property: "propriété",
gallery: "galerie",
services: "services",
booking: "réserver",
contacts: "contacts",
invalidEmail: "Veuillez saisir une adresse e-mail valide",
invalidPhone: "Veuillez saisir un numéro de téléphone valide",
fillAllFields: "Veuillez remplir tous les champs obligatoires",
fillAllContactFields: "Veuillez remplir tous les champs du formulaire de contact",
acceptPrivacy: "Vous devez accepter la politique de confidentialité pour continuer",
bookingSuccess: "Demande de réservation envoyée! Vous recevrez un e-mail de confirmation dans les 24 heures.",
contactSuccess: "Message envoyé avec succès! Nous vous contacterons bientôt.",
ourVilla: "Notre Villa",
unforgettableExp: "Une Expérience Inoubliable",
photoGallery: "Galerie de Photos",
servicesIncluded: "Services Inclus",
bookYourVacation: "Réservez Vos Vacances",
lowSeason: "Basse Saison",
highSeason: "Haute Saison",
perWeek: "/semaine",
previous: "← Précédent",
next: "Suivant →",
checkIn: "Arrivée",
checkOut: "Départ",
total: "Total",
selectedDate: "Date sélectionnée",
selectEndDate: "Sélectionnez la date de fin",
completeBooking: "Finaliser la Réservation",
fullName: "Nom Complet",
email: "E-mail",
phone: "Téléphone",
guests: "Invités",
cancel: "Annuler",
confirm: "Confirmer",
sending: "Envoi...",
contactUs: "Contactez-nous",
information: "Informations",
address: "Adresse",
hours: "Horaires",
sendMessage: "Envoyer un Message",
name: "Nom et Prénom",
message: "Message",
sendRequest: "Envoyer la Demande",
privacyPolicy: "Politique de Confidentialité",
cookiePolicy: "Politique des Cookies",
readAccept: "J'ai lu et j'accepte la",
privacyInfo: "politique de confidentialité",
gdprConsent: "et j'autorise le traitement de mes données personnelles conformément au RGPD (Règlement UE 2016/679)",
forBooking: "pour le traitement de la réservation",
required: "*",
close: "Fermer",
allRightsReserved: "Tous droits réservés",
villaDescription1: "Casa Marè est une superbe propriété de luxe située directement sur la côte, avec accès privé à la plage. Cette résidence exclusive offre un refuge parfait pour ceux qui recherchent tranquillité et confort dans un environnement à couper le souffle.",
villaDescription2: "Avec ses espaces intérieurs et extérieurs spacieux, la villa peut accueillir confortablement jusqu'à 8 personnes, ce qui la rend idéale pour les familles ou les groupes d'amis désireux de vivre une expérience unique.",
bedrooms: "Chambres",
spaciousDecorated: "Spacieuses et décorées",
bathrooms: "Salles de bain",
modernEquipped: "Modernes et équipées",
squareMeters: "m²",
pureComfort: "De pur confort",
pool: "Piscine",
seaView: "Vue panoramique sur la mer",
cinCir: "CIN et CIR",
cinCirDesc: "CIN IT053006C2RQZ6FHWS CIR 053006LTN2665",
airConditioning: "Climatisation",
inAllRooms: "Dans toutes les pièces",
equippedKitchen: "Cuisine Équipée",
completeAppliances: "Complète avec appareils",
privateParking: "Parking Privé",
safeForCar: "Sûr pour 1 voiture",
cleanHouse: "Maison Propre",
alwaysInOrder: "Toujours en Ordre",
seaViewLiving: "Vue sur la Mer",
fromLivingGarden: "Du Salon, Jardin ou Terrasse",
externalView: "Vue Extérieure",
livingRoom: "Salon",
masterBedroom: "Chambre Principale",
kitchen: "Cuisine",
panorama: "Panorama",
terrace: "Terrasse",
octoberMay: "Octobre - Mai",
juneSeptember: "Juin - Septembre",
addressDetails: "Via del Mare 123\n00100 Località Marina",
telephone: "Téléphone",
hoursDetails: "Lun-Ven: 9:00 - 18:00\nSam: 9:00 - 13:00",
copyright: "© 2024 Casa Marè. Tous droits réservés.",
vat: "TVA: 12345678901",
notes: "Notes",
additionalNotes: "Notes supplémentaires (optionnel)",
cookieBannerTitle: "Utilisation des Cookies",
cookieBannerText: "Nous utilisons des cookies techniques nécessaires au fonctionnement du site. Nous n'utilisons pas de cookies de profilage ou de suivi. En continuant à naviguer, vous acceptez l'utilisation de cookies techniques.",
moreInfo: "Plus d'Infos",
decline: "Refuser",
accept: "Accepter",
privacyTitle: "Politique de Confidentialité",
dataController: "1. Responsable du Traitement",
dataControllerText: "Casa Marè S.r.l., située à Via del Mare 123, 00100 Località Marina",
dataControllerContact: "E-mail: privacy@casamare.it | Tél: +39 123 456 7890",
dataCollected: "2. Données Collectées",
dataCollectedText: "Nous collectons les données personnelles suivantes:",
dataCollectedList: ["Nom et prénom", "Adresse e-mail", "Numéro de téléphone", "Dates de réservation et nombre d'invités", "Éventuelles notes ou demandes spécifiques"],
processingPurpose: "3. Finalité du Traitement",
processingPurposeText: "Les données sont traitées pour:",
processingPurposeList: ["Gestion des réservations et des demandes d'informations", "Communications relatives au service demandé", "Respect des obligations contractuelles et fiscales"],
legalBasis: "4. Base Juridique",
legalBasisText: "Le traitement est basé sur:",
legalBasisList: ["Exécution d'un contrat (réservation)", "Consentement de la personne concernée (demandes d'informations)", "Obligations légales (fiscales, comptables)"],
dataRetention: "5. Conservation des Données",
dataRetentionText: "Les données seront conservées pendant:",
dataRetentionList: ["Durée de la relation contractuelle", "10 ans pour les obligations fiscales", "Jusqu'au retrait du consentement pour les demandes d'informations"],
userRights: "6. Droits de la Personne Concernée",
userRightsText: "Vous avez le droit de:",
userRightsList: ["Accéder à vos données personnelles", "Demander la rectification ou la suppression", "Limiter le traitement", "Vous opposer au traitement", "Demander la portabilité des données", "Retirer votre consentement à tout moment", "Déposer une plainte auprès de l'autorité de protection des données"],
exerciseRights: "Pour exercer vos droits, contactez-nous à: privacy@casamare.it",
dataCommunication: "7. Communication des Données",
dataCommunicationText: "Les données peuvent être communiquées à:",
dataCommunicationList: ["Prestataires de services informatiques pour la gestion du système", "Conseillers juridiques, fiscaux et administratifs", "Autorités publiques pour obligations légales"],
dataTransfer: "8. Transfert de Données Extra-UE",
dataTransferText: "Les données ne sont pas transférées en dehors de l'Union Européenne.",
security: "9. Sécurité",
securityText: "Nous adoptons des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.",
cookiePolicyTitle: "Politique des Cookies",
whatAreCookies: "Que sont les Cookies",
whatAreCookiesText: "Les cookies sont de petits fichiers texte qui sont stockés sur votre appareil lorsque vous visitez un site web. Ils sont utilisés pour améliorer l'expérience de navigation.",
cookiesUsed: "Cookies Utilisés",
technicalCookies: "Cookies Techniques (Nécessaires)",
technicalCookiesDesc: "Ils sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.",
cookieName: "casa-mare-cookie-consent",
cookieNameDesc: "stocke votre préférence en matière de cookies",
duration: "Durée",
durationValue: "12 mois",
purpose: "Finalité",
purposeValue: "se souvenir de votre choix de cookies",
cookiesNotUsed: "Cookies NON Utilisés",
cookiesNotUsedText: "Notre site n'utilise PAS:",
cookiesNotUsedList: ["Cookies de profilage", "Cookies de suivi", "Cookies tiers pour la publicité", "Cookies d'analyse (Google Analytics ou similaires)"],
manageCookies: "Gestion des Cookies",
manageCookiesText: "Vous pouvez gérer ou désactiver les cookies via les paramètres de votre navigateur:",
browserList: ["Chrome: Paramètres → Confidentialité et sécurité → Cookies", "Firefox: Options → Confidentialité et sécurité → Cookies", "Safari: Préférences → Confidentialité → Cookies", "Edge: Paramètres → Cookies et autorisations de site"],
disableNote: "Note: la désactivation des cookies techniques peut compromettre certaines fonctionnalités du site.",
updates: "Mises à Jour",
updatesText: "Cette Politique des Cookies peut être mise à jour périodiquement. Nous vous invitons à la consulter régulièrement.",
lastUpdate: "Dernière mise à jour: Janvier 2026",
monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
dayNames: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
exclusiveRentals: "Locations Exclusives en Bord de Mer",
backToHome: "Retour à l'Accueil"
}
};

  const t = translations[language];
// ora usa t
const galleryImages = [
  { url: 'https://raw.githubusercontent.com/andre199372/images/de1b6c5b9e6db80f7d364ba0c991d53182f326d9/Vistaest.jpeg', title: t.externalView },
  { url: 'https://raw.githubusercontent.com/andre199372/images/de1b6c5b9e6db80f7d364ba0c991d53182f326d9/sogg.jpeg', title: t.livingRoom },
  { url: 'https://raw.githubusercontent.com/andre199372/images/de1b6c5b9e6db80f7d364ba0c991d53182f326d9/matr.jpeg', title: t.masterBedroom },
  { url: 'https://raw.githubusercontent.com/andre199372/images/de1b6c5b9e6db80f7d364ba0c991d53182f326d9/cuc1.jpeg', title: t.kitchen },
  { url: 'https://raw.githubusercontent.com/andre199372/images/de1b6c5b9e6db80f7d364ba0c991d53182f326d9/panorama.jpeg', title: t.panorama },
  { url: 'https://raw.githubusercontent.com/andre199372/images/58f9c74e9a08ccedd1b47e43d21aff701ca34b7f/terr.jpeg', title: t.terrace }
];
  useEffect(() => {
    if (activeSection === 'prenota') {
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, activeSection]);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('casa-mare-cookie-consent');
    if (!cookieConsent) {
      setTimeout(() => setShowCookieBanner(true), 1000);
    }
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await fetch(
        `${API_URL}/bookings/range?startDate=${firstDay.toISOString().split('T')[0]}&endDate=${lastDay.toISOString().split('T')[0]}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    setShowMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const acceptCookies = () => {
    localStorage.setItem('casa-mare-cookie-consent', 'accepted');
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('casa-mare-cookie-consent', 'declined');
    setShowCookieBanner(false);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone.replace(/\s/g, ''));
  };

  const checkAvailability = async (startDate, endDate) => {
    try {
      const response = await fetch(
        `${API_URL}/availability?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const isDateBooked = (date) => {
  return bookings.some(booking => {
    // Solo le prenotazioni CONFERMATE bloccano il calendario
    if (booking.status !== 'confirmed') return false;
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return date >= start && date <= end;
  });
};

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = async (date) => {
    if (isDateBooked(date) || isDateInPast(date)) return;

    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: date, end: null });
      setError(null);
    } else if (date > selectedDates.start) {
      const available = await checkAvailability(selectedDates.start, date);
      if (available) {
        setSelectedDates({ ...selectedDates, end: date });
        setShowBookingForm(true);
        setError(null);
      } else {
        setError('Date non disponibili. Seleziona un altro periodo.');
      }
    } else {
      setSelectedDates({ start: date, end: null });
    }
  };

  const calculatePrice = () => {
    if (!selectedDates.start || !selectedDates.end) return 0;
    const days = Math.ceil((selectedDates.end - selectedDates.start) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.floor(days / 7);
    const extraDays = days % 7;
    const month = selectedDates.start.getMonth();
    const isHighSeason = month >= 5 && month <= 8;
    const weeklyRate = isHighSeason ? 2800 : 1500;
    const dailyRate = Math.round(weeklyRate / 7);
    return (weeks * weeklyRate) + (extraDays * dailyRate);
  };

  const handleSubmitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setError('Compila tutti i campi del modulo contatti');
      return;
    }

    if (!validateEmail(contactForm.email)) {
  setError(t.invalidEmail);
  return;
}

    if (!privacyConsent.contact) {
      setError('Devi accettare l\'informativa privacy per procedere');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      if (response.ok) {
        setSuccess('Messaggio inviato con successo! Ti ricontatteremo presto.');
        setContactForm({ name: '', email: '', message: '' });
        setPrivacyConsent({ ...privacyConsent, contact: false });
        setTimeout(() => setSuccess(null), 5000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante l\'invio del messaggio');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedDates.start || !selectedDates.end || !formData.name || !formData.email || !formData.phone) {
      setError('Compila tutti i campi obbligatori');
      return;
    }

   if (!validateEmail(formData.email)) {
  setError(t.invalidEmail);
  return;
}

if (!validatePhone(formData.phone)) {
  setError(t.invalidPhone);
  return;
}

    if (!privacyConsent.booking) {
      setError('Devi accettare l\'informativa privacy per procedere');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          guests: formData.guests,
          startDate: selectedDates.start.toISOString().split('T')[0],
          endDate: selectedDates.end.toISOString().split('T')[0],
          price: calculatePrice(),
          notes: formData.notes
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        await notifyAdminNewBooking({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          guests: formData.guests,
          startDate: selectedDates.start,
          endDate: selectedDates.end,
          price: calculatePrice(),
          notes: formData.notes
        });
        
        setSuccess('Richiesta di prenotazione inviata! Riceverai una conferma via email entro 24 ore.');
        setShowBookingForm(false);
        setSelectedDates({ start: null, end: null });
        setFormData({ name: '', email: '', phone: '', guests: 1, notes: '' });
        setPrivacyConsent({ ...privacyConsent, booking: false });
        await loadBookings();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante la prenotazione');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { 
      daysInMonth: lastDay.getDate(), 
      startingDayOfWeek: firstDay.getDay(), 
      year, 
      month 
    };
  };

  const renderCalendar = () => {
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const days = [];

  t.dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-semibold text-gray-600 py-2">
          {day}
        </div>
      );
    });

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isBooked = isDateBooked(date);
      const isPast = isDateInPast(date);
      const isSelected = (selectedDates.start && date.getTime() === selectedDates.start.getTime()) ||
                        (selectedDates.end && date.getTime() === selectedDates.end.getTime());
      const isInRange = selectedDates.start && selectedDates.end && 
                       date > selectedDates.start && date < selectedDates.end;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            p-2 text-center cursor-pointer rounded-lg transition-all
            ${isBooked ? 'bg-red-100 text-red-400 cursor-not-allowed line-through' : ''}
            ${isPast && !isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
            ${isSelected ? 'bg-blue-500 text-white font-bold' : ''}
            ${isInRange ? 'bg-blue-100 text-blue-700' : ''}
            ${!isBooked && !isPast && !isSelected && !isInRange ? 'hover:bg-blue-50 hover:border-blue-300 border border-transparent' : ''}
          `}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white fixed w-full top-0 left-0 right-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Casa Marè</h1>
              <p className="text-blue-200 text-sm italic">{t.exclusiveRentals}</p>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-6">
  {['home', 'property', 'gallery', 'services', 'booking', 'contacts'].map(section => (
    <button
      key={section}
      onClick={() => scrollToSection(section === 'property' ? 'proprieta' : section === 'gallery' ? 'galleria' : section === 'services' ? 'servizi' : section === 'booking' ? 'prenota' : section === 'contacts' ? 'contatti' : section)}
      className={`px-4 py-2 rounded-lg transition capitalize ${
        activeSection === (section === 'property' ? 'proprieta' : section === 'gallery' ? 'galleria' : section === 'services' ? 'servizi' : section === 'booking' ? 'prenota' : section === 'contacts' ? 'contatti' : section)
          ? 'bg-blue-600 text-white' 
          : 'hover:bg-blue-700/50'
      }`}
    >
      {t[section]}
    </button>
  ))}
</nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-blue-700/50 rounded-lg transition"
            >
              <Menu size={28} />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
  <nav className="md:hidden mt-4 pb-4 flex flex-col gap-2">
    {['home', 'property', 'gallery', 'services', 'booking', 'contacts'].map(section => (
      <button
        key={section}
        onClick={() => scrollToSection(section === 'property' ? 'proprieta' : section === 'gallery' ? 'galleria' : section === 'services' ? 'servizi' : section === 'booking' ? 'prenota' : section === 'contacts' ? 'contatti' : section)}
        className={`px-4 py-3 rounded-lg transition capitalize text-left ${
          activeSection === (section === 'property' ? 'proprieta' : section === 'gallery' ? 'galleria' : section === 'services' ? 'servizi' : section === 'booking' ? 'prenota' : section === 'contacts' ? 'contatti' : section)
            ? 'bg-blue-600 text-white' 
            : 'bg-blue-700/30 hover:bg-blue-700/50'
        }`}
      >
        {t[section]}
      </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Floating Home Button (visible on non-home sections) */}
      {activeSection !== 'home' && (
        <button
  onClick={() => scrollToSection('home')}
  className="fixed bottom-8 right-8 z-40 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition transform hover:scale-110"
  title={t.backToHome}
>
          <Home size={24} />
        </button>
      )}

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-4 border-blue-600 z-50 p-6 animate-slide-up">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
  <Shield size={24} />
  {t.cookieBannerTitle}
</h3>
<p className="text-gray-700 text-sm">
  {t.cookieBannerText}
</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
  onClick={() => setShowCookieModal(true)}
  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-semibold transition"
>
  {t.moreInfo}
</button>
<button
  onClick={declineCookies}
  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
>
  {t.decline}
</button>
<button
  onClick={acceptCookies}
  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
>
  {t.accept}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-blue-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">{t.privacyTitle}</h2>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-700">
  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.dataController}</h3>
    <p>{t.dataControllerText}</p>
    <p>{t.dataControllerContact}</p>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.dataCollected}</h3>
    <p>{t.dataCollectedText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      {t.dataCollectedList.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.processingPurpose}</h3>
    <p>{t.processingPurposeText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      {t.processingPurposeList.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.legalBasis}</h3>
    <p>{t.legalBasisText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      {t.legalBasisList.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.dataRetention}</h3>
    <p>{t.dataRetentionText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      {t.dataRetentionList.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.userRights}</h3>
    <p>{t.userRightsText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      {t.userRightsList.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
    <p className="mt-2">{t.exerciseRights}</p>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.dataCommunication}</h3>
    <p>{t.dataCommunicationText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      {t.dataCommunicationList.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.dataTransfer}</h3>
    <p>{t.dataTransferText}</p>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.security}</h3>
    <p>{t.securityText}</p>
  </section>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-blue-200 p-6">
              <button
  onClick={() => setShowPrivacyModal(false)}
  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
>
  {t.close}
</button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Policy Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-blue-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">{t.cookiePolicyTitle}</h2>
              <button onClick={() => setShowCookieModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-700">
  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.whatAreCookies}</h3>
    <p>{t.whatAreCookiesText}</p>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.cookiesUsed}</h3>
    <div className="space-y-3">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">{t.technicalCookies}</h4>
        <p className="text-sm mb-2">{t.technicalCookiesDesc}</p>
        <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
          <li><strong>{t.cookieName}</strong>: {t.cookieNameDesc}</li>
          <li>{t.duration}: {t.durationValue}</li>
          <li>{t.purpose}: {t.purposeValue}</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.cookiesNotUsed}</h3>
    <p>{t.cookiesNotUsedText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      {t.cookiesNotUsedList.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.manageCookies}</h3>
    <p>{t.manageCookiesText}</p>
    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
      {t.browserList.map((item, idx) => {
        const parts = item.split(':');
        return <li key={idx}><strong>{parts[0]}</strong>:{parts.slice(1).join(':')}</li>;
      })}
    </ul>
    <p className="mt-3 text-sm text-gray-600">{t.disableNote}</p>
  </section>

  <section>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{t.updates}</h3>
    <p>{t.updatesText}</p>
    <p className="mt-2 text-sm">{t.lastUpdate}</p>
  </section>
</div>
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-blue-200 p-6">
              <button
  onClick={() => setShowCookieModal(false)}
  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
>
  {t.close}
</button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24">
        {/* HOME */}
        {activeSection === 'home' && (
          <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-24 pt-24">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('https://raw.githubusercontent.com/andre199372/images/74614d79731cefad3e60d8496181ff05be494ced/back3.jpeg')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-cyan-700/70"></div>
            </div>
            
            {/* Language Selector */}
<div className="absolute top-28 right-8 z-20 flex gap-3">
  {[
    { code: 'it', flag: 'https://flagcdn.com/w40/it.png', name: 'Italiano' },
    { code: 'en', flag: 'https://flagcdn.com/w40/gb.png', name: 'English' },
    { code: 'de', flag: 'https://flagcdn.com/w40/de.png', name: 'Deutsch' },
    { code: 'fr', flag: 'https://flagcdn.com/w40/fr.png', name: 'Français' }
  ].map(lang => (
    <button
      key={lang.code}
      onClick={() => setLanguage(lang.code)}
      className={`w-12 h-12 rounded-full overflow-hidden transition transform hover:scale-110 ${
        language === lang.code ? 'ring-4 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
      }`}
      title={lang.name}
    >
      <img 
        src={lang.flag} 
        alt={lang.name}
        className="w-full h-full object-cover"
      />
    </button>
  ))}
</div>

<div className="relative z-10 text-center text-white px-4">
  <h2 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
    {t.heroTitle}
  </h2>
  <p className="text-2xl md:text-3xl mb-8 text-blue-100 drop-shadow-lg">
    {t.heroSubtitle}
  </p>
  <button
    onClick={() => scrollToSection('prenota')}
    className="bg-cyan-400 text-blue-900 px-8 py-4 rounded-full text-xl font-bold hover:bg-cyan-300 transform hover:scale-105 transition shadow-2xl"
  >
    {t.bookNow}
  </button>
      </div>
          </section>
        )}

        {/* PROPRIETÀ */}
        {activeSection === 'proprieta' && (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
             <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">{t.ourVilla}</h2>

<div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
  <h3 className="text-3xl font-bold text-blue-800 mb-6">{t.unforgettableExp}</h3>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
  {t.villaDescription1}
</p>
<p className="text-lg text-gray-700 mb-8 leading-relaxed">
  {t.villaDescription2}
</p>

                <div className="grid md:grid-cols-4 gap-6 mt-8">
  {[
    { title: `6 ${t.bedrooms}`, desc: t.spaciousDecorated, icon: '🛏️' },
    { title: `4 ${t.bathrooms}`, desc: t.modernEquipped, icon: '🚿' },
    { title: `350 ${t.squareMeters}`, desc: t.pureComfort, icon: '📏' },
    { title: t.pool, desc: t.seaView, icon: '🏊' }
  ].map((feature, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 text-center hover:shadow-lg transition">
                      <div className="text-4xl mb-3">{feature.icon}</div>
                      <h4 className="text-xl font-bold text-blue-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GALLERIA */}
        {activeSection === 'galleria' && (
          <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">{t.photoGallery}</h2>
              <div className="grid md:grid-cols-3 gap-6">
  {galleryImages.map((image, idx) => (
    <div key={idx} className="group relative h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition transform hover:scale-105">
      <img 
        src={image.url} 
        alt={image.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
        <span className="text-white text-2xl font-bold p-4 drop-shadow-lg">{image.title}</span>
      </div>
    </div>
  ))}
</div>
            </div>
          </section>
        )}

        {/* SERVIZI */}
        {activeSection === 'servizi' && (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">{t.servicesIncluded}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
  { icon: Wifi, title: t.cinCir, desc: t.cinCirDesc },
  { icon: Wind, title: t.airConditioning, desc: t.inAllRooms },
  { icon: UtensilsCrossed, title: t.equippedKitchen, desc: t.completeAppliances },
  { icon: Car, title: t.privateParking, desc: t.safeForCar },
  { icon: Sparkles, title: t.cleanHouse, desc: t.alwaysInOrder },
  { icon: Waves, title: t.seaViewLiving, desc: t.fromLivingGarden }
].map((service, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition border-t-4 border-blue-500">
                    <service.icon className="text-blue-600 mb-4" size={48} />
                    <h3 className="text-2xl font-bold text-blue-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PRENOTA (Sistema Prenotazioni) */}
        {activeSection === 'prenota' && (
          <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">{t.bookYourVacation}</h2>

              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 max-w-4xl mx-auto">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start gap-3 max-w-4xl mx-auto">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-400">
                  <div className="flex items-center gap-3 mb-4">
                    <Euro className="text-blue-600" size={28} />
                    <h3 className="text-2xl font-bold text-blue-900">{t.lowSeason}</h3>
                  </div>
                  <p className="text-gray-600 mb-2">{t.octoberMay}</p>
                  <p className="text-4xl font-bold text-blue-600">€1.500<span className="text-xl text-gray-500">{t.perWeek}</span></p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white transform scale-105">
                  <div className="flex items-center gap-3 mb-4">
                    <Euro size={28} />
                    <h3 className="text-2xl font-bold">{t.highSeason}</h3>
                  </div>
                  <p className="mb-2 opacity-90">{t.juneSeptember}</p>
                  <p className="text-4xl font-bold">€2.800<span className="text-xl opacity-75">{t.perWeek}</span></p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <button
  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
>
  {t.previous}
</button>
                  <h3 className="text-2xl font-bold text-blue-900">
  {t.monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
</h3>
                  <button
  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
>
  {t.next}
</button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-6">
                  {renderCalendar()}
                </div>

                {selectedDates.start && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-900 font-semibold">
  {selectedDates.end ? (
    <>
      {t.checkIn}: {selectedDates.start.toLocaleDateString('it-IT')} | 
      {t.checkOut}: {selectedDates.end.toLocaleDateString('it-IT')} | 
      {t.total}: €{calculatePrice()}
    </>
  ) : (
    `${t.selectedDate}: ${selectedDates.start.toLocaleDateString('it-IT')} - ${t.selectEndDate}`
  )}
</p>
                  </div>
                )}
              </div>

              {showBookingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold text-blue-900 mb-6">{t.completeBooking}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
  <User className="inline mr-2" size={18} />
  {t.fullName} {t.required}
</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
  <Mail className="inline mr-2" size={18} />
  {t.email} {t.required}
</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="esempio@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
  <Phone className="inline mr-2" size={18} />
  {t.phone} {t.required}
</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="+39 123 456 7890"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">{t.guests}</label>
                        <select
                          value={formData.guests}
                          onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-lg font-bold text-blue-900">{t.total}: €{calculatePrice()}</p>
                      </div>

                      <div className="border-t-2 border-gray-200 pt-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacyConsent.booking}
                            onChange={(e) => setPrivacyConsent({...privacyConsent, booking: e.target.checked})}
                            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
  {t.readAccept}<button 
    type="button"
    onClick={() => setShowPrivacyModal(true)} 
    className="text-blue-600 underline hover:text-blue-800"
  >
    {t.privacyInfo}
  </button> {t.gdprConsent} {t.forBooking} {t.required}
</span>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
  onClick={() => {
    setShowBookingForm(false);
    setSelectedDates({ start: null, end: null });
    setPrivacyConsent({ ...privacyConsent, booking: false });
  }}
  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
>
  {t.cancel}
</button>
<button
  onClick={handleSubmitBooking}
  disabled={loading}
  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50"
>
  {loading ? t.sending : t.confirm}
</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CONTATTI */}
        {activeSection === 'contatti' && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">{t.contactUs}</h2>
              
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-green-700">{success}</p>
                </div>
              )}
              
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-6">{t.information}</h3>
<div className="space-y-4 text-gray-700">
  <p><strong>{t.address}:</strong><br/>{t.addressDetails}</p>
  <p><strong>{t.telephone}:</strong><br/>+39 123 456 7890</p>
  <p><strong>Email:</strong><br/>info@casamare.it</p>
  <p><strong>{t.hours}:</strong><br/>{t.hoursDetails}</p>
</div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-6">{t.sendMessage}</h3>
                    <div className="space-y-4">
                      <input 
  type="text" 
  placeholder={t.name}
  value={contactForm.name}
  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
/>
<input 
  type="email" 
  placeholder={t.email}
  value={contactForm.email}
  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
/>
<textarea 
  placeholder={t.message}
  rows="4"
  value={contactForm.message}
  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
/>
                      
                      <div className="border-t-2 border-gray-200 pt-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacyConsent.contact}
                            onChange={(e) => setPrivacyConsent({...privacyConsent, contact: e.target.checked})}
                            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
  {t.readAccept}<button 
    type="button"
    onClick={() => setShowPrivacyModal(true)} 
    className="text-blue-600 underline hover:text-blue-800"
  >
    {t.privacyInfo}
  </button> {t.gdprConsent} {t.required}
</span>
                        </label>
                      </div>

                      <button 
  onClick={handleSubmitContact}
  disabled={loading}
  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
>
  {loading ? t.sending : t.sendRequest}
</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 text-center">
  <p className="mb-2">{t.copyright}</p>
  <div className="flex justify-center gap-4 text-sm text-blue-300 flex-wrap px-4">
    <button 
      onClick={() => setShowPrivacyModal(true)}
      className="hover:text-white underline"
    >
      {t.privacyPolicy}
    </button>
    <span>|</span>
    <button 
      onClick={() => setShowCookieModal(true)}
      className="hover:text-white underline"
    >
      {t.cookiePolicy}
    </button>
    <span>|</span>
    <span>{t.vat}</span>
  </div>
</footer>
    </div>
  );
};

export default CasaMareSite;
