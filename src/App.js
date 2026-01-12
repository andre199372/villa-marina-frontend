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
      if (booking.status === 'cancelled') return false;
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
      setError('Inserisci un indirizzo email valido');
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
      setError('Inserisci un indirizzo email valido');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Inserisci un numero di telefono valido');
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
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    dayNames.forEach(day => {
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
              <p className="text-blue-200 text-sm italic">Affitti Esclusivi sul Mare</p>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-6">
              {['home', 'proprieta', 'galleria', 'servizi', 'prenota', 'contatti'].map(section => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`px-4 py-2 rounded-lg transition capitalize ${
                    activeSection === section 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-blue-700/50'
                  }`}
                >
                  {section}
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
              {['home', 'proprieta', 'galleria', 'servizi', 'prenota', 'contatti'].map(section => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`px-4 py-3 rounded-lg transition capitalize text-left ${
                    activeSection === section 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-700/30 hover:bg-blue-700/50'
                  }`}
                >
                  {section}
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
          title="Torna alla Home"
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
                  Utilizzo dei Cookie
                </h3>
                <p className="text-gray-700 text-sm">
                  Utilizziamo cookie tecnici necessari per il funzionamento del sito. Non utilizziamo cookie di profilazione o tracciamento.
                  Continuando la navigazione accetti l'utilizzo dei cookie tecnici.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowCookieModal(true)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-semibold transition"
                >
                  Maggiori Info
                </button>
                <button
                  onClick={declineCookies}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Rifiuta
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Accetta
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
              <h2 className="text-2xl font-bold text-blue-900">Informativa Privacy</h2>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-700">
              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">1. Titolare del Trattamento</h3>
                <p>Casa Marè S.r.l., con sede in Via del Mare 123, 00100 Località Marina</p>
                <p>Email: privacy@casamare.it | Tel: +39 123 456 7890</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">2. Dati Raccolti</h3>
                <p>Raccogliamo i seguenti dati personali:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Nome e cognome</li>
                  <li>Indirizzo email</li>
                  <li>Numero di telefono</li>
                  <li>Date di prenotazione e numero ospiti</li>
                  <li>Eventuali note o richieste specifiche</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">3. Finalità del Trattamento</h3>
                <p>I dati vengono trattati per:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Gestione delle prenotazioni e richieste di informazioni</li>
                  <li>Comunicazioni relative al servizio richiesto</li>
                  <li>Adempimenti di obblighi contrattuali e fiscali</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">4. Base Giuridica</h3>
                <p>Il trattamento è basato su:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Esecuzione di un contratto (prenotazione)</li>
                  <li>Consenso dell'interessato (richieste informazioni)</li>
                  <li>Obblighi di legge (fiscali, contabili)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">5. Conservazione dei Dati</h3>
                <p>I dati saranno conservati per:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Durata del rapporto contrattuale</li>
                  <li>10 anni per adempimenti fiscali</li>
                  <li>Fino a revoca del consenso per richieste informazioni</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">6. Diritti dell'Interessato</h3>
                <p>Hai diritto di:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Accedere ai tuoi dati personali</li>
                  <li>Richiedere la rettifica o cancellazione</li>
                  <li>Limitare il trattamento</li>
                  <li>Opporti al trattamento</li>
                  <li>Richiedere la portabilità dei dati</li>
                  <li>Revocare il consenso in qualsiasi momento</li>
                  <li>Proporre reclamo al Garante Privacy</li>
                </ul>
                <p className="mt-2">Per esercitare i tuoi diritti, contattaci a: privacy@casamare.it</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">7. Comunicazione dei Dati</h3>
                <p>I dati potranno essere comunicati a:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Fornitori di servizi IT per la gestione del sistema</li>
                  <li>Consulenti legali, fiscali e amministrativi</li>
                  <li>Autorità pubbliche per obblighi di legge</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">8. Trasferimento Dati Extra-UE</h3>
                <p>I dati non vengono trasferiti al di fuori dell'Unione Europea.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">9. Sicurezza</h3>
                <p>Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati da accessi non autorizzati, perdita o divulgazione.</p>
              </section>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-blue-200 p-6">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Chiudi
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
              <h2 className="text-2xl font-bold text-blue-900">Cookie Policy</h2>
              <button onClick={() => setShowCookieModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-700">
              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Cosa sono i Cookie</h3>
                <p>I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. Vengono utilizzati per migliorare l'esperienza di navigazione.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Cookie Utilizzati</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">Cookie Tecnici (Necessari)</h4>
                    <p className="text-sm mb-2">Sono essenziali per il funzionamento del sito e non possono essere disabilitati.</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>casa-mare-cookie-consent</strong>: memorizza la tua preferenza sui cookie</li>
                      <li>Durata: 12 mesi</li>
                      <li>Finalità: ricordare la tua scelta sui cookie</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Cookie NON Utilizzati</h3>
                <p>Il nostro sito NON utilizza:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Cookie di profilazione</li>
                  <li>Cookie di tracciamento</li>
                  <li>Cookie di terze parti per pubblicità</li>
                  <li>Cookie di analisi (Google Analytics o simili)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Gestione dei Cookie</h3>
                <p>Puoi gestire o disabilitare i cookie attraverso le impostazioni del tuo browser:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li><strong>Chrome</strong>: Impostazioni → Privacy e sicurezza → Cookie</li>
                  <li><strong>Firefox</strong>: Opzioni → Privacy e sicurezza → Cookie</li>
                  <li><strong>Safari</strong>: Preferenze → Privacy → Cookie</li>
                  <li><strong>Edge</strong>: Impostazioni → Cookie e autorizzazioni sito</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">Nota: disabilitare i cookie tecnici potrebbe compromettere alcune funzionalità del sito.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Aggiornamenti</h3>
                <p>Questa Cookie Policy può essere aggiornata periodicamente. Ti invitiamo a consultarla regolarmente.</p>
                <p className="mt-2 text-sm">Ultimo aggiornamento: Gennaio 2026</p>
              </section>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-blue-200 p-6">
              <button
                onClick={() => setShowCookieModal(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Chiudi
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
                backgroundImage: `url('https://raw.githubusercontent.com/andre199372/images/97120821dd44a331b5999cc49db48229365f2560/back.jpeg')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-cyan-700/70"></div>
            </div>
            
            <div className="relative z-10 text-center text-white px-4">
              <h2 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
                Benvenuti in Paradiso
              </h2>
              <p className="text-2xl md:text-3xl mb-8 text-blue-100 drop-shadow-lg">
                Una villa esclusiva affacciata sul mare cristallino
              </p>
              <button
                onClick={() => scrollToSection('prenota')}
                className="bg-cyan-400 text-blue-900 px-8 py-4 rounded-full text-xl font-bold hover:bg-cyan-300 transform hover:scale-105 transition shadow-2xl"
              >
                Prenota Ora
              </button>
            </div>
          </section>
        )}

        {/* PROPRIETÀ */}
        {activeSection === 'proprieta' && (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">La Nostra Villa</h2>
              
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <h3 className="text-3xl font-bold text-blue-800 mb-6">Un'Esperienza Indimenticabile</h3>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  Casa Marè è una splendida proprietà di lusso situata direttamente sulla costa, con accesso privato alla spiaggia. 
                  Questa residenza esclusiva offre un rifugio perfetto per chi cerca tranquillità e comfort in un ambiente mozzafiato.
                </p>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Con i suoi ampi spazi interni ed esterni, la villa può ospitare comodamente fino a 8 persone, 
                  rendendola ideale per famiglie o gruppi di amici desiderosi di vivere un'esperienza unica.
                </p>

                <div className="grid md:grid-cols-4 gap-6 mt-8">
                  {[
                    { title: '6 Camere', desc: 'Spaziose e arredate', icon: '🛏️' },
                    { title: '4 Bagni', desc: 'Moderni e attrezzati', icon: '🚿' },
                    { title: '350 m²', desc: 'Di puro comfort', icon: '📏' },
                    { title: 'Piscina', desc: 'Vista mare panoramica', icon: '🏊' }
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
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">Galleria Fotografica</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {['Vista Esterna', 'Soggiorno', 'Camera Matrimoniale', 'Cucina', 'Piscina', 'Terrazza'].map((title, idx) => (
                  <div key={idx} className="group relative h-64 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition transform hover:scale-105">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold drop-shadow-lg">{title}</span>
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
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">Servizi Inclusi</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Wifi, title: 'WiFi Alta Velocità', desc: 'Fibra in tutta la villa' },
                  { icon: Wind, title: 'Aria Condizionata', desc: 'In tutte le stanze' },
                  { icon: UtensilsCrossed, title: 'Cucina Attrezzata', desc: 'Completa di elettrodomestici' },
                  { icon: Car, title: 'Parcheggio Privato', desc: 'Sicuro e coperto per 3 auto' },
                  { icon: Sparkles, title: 'Servizio Pulizie', desc: 'Settimanale incluso' },
                  { icon: Waves, title: 'Accesso Spiaggia', desc: 'Diretto e privato' }
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
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">Prenota la Tua Vacanza</h2>

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
                    <h3 className="text-2xl font-bold text-blue-900">Bassa Stagione</h3>
                  </div>
                  <p className="text-gray-600 mb-2">Ottobre - Maggio</p>
                  <p className="text-4xl font-bold text-blue-600">€1.500<span className="text-xl text-gray-500">/settimana</span></p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white transform scale-105">
                  <div className="flex items-center gap-3 mb-4">
                    <Euro size={28} />
                    <h3 className="text-2xl font-bold">Alta Stagione</h3>
                  </div>
                  <p className="mb-2 opacity-90">Giugno - Settembre</p>
                  <p className="text-4xl font-bold">€2.800<span className="text-xl opacity-75">/settimana</span></p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    ← Precedente
                  </button>
                  <h3 className="text-2xl font-bold text-blue-900">
                    {currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Successivo →
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
                          Check-in: {selectedDates.start.toLocaleDateString('it-IT')} | 
                          Check-out: {selectedDates.end.toLocaleDateString('it-IT')} | 
                          Totale: €{calculatePrice()}
                        </>
                      ) : (
                        `Data selezionata: ${selectedDates.start.toLocaleDateString('it-IT')} - Seleziona data di fine`
                      )}
                    </p>
                  </div>
                )}
              </div>

              {showBookingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold text-blue-900 mb-6">Completa la Prenotazione</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          <User className="inline mr-2" size={18} />
                          Nome Completo *
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
                          Email *
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
                          Telefono *
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
                        <label className="block text-gray-700 font-semibold mb-2">Ospiti</label>
                        <select
                          value={formData.guests}
                          onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-lg font-bold text-blue-900">Totale: €{calculatePrice()}</p>
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
                            Ho letto e accetto l'<button 
                              type="button"
                              onClick={() => setShowPrivacyModal(true)} 
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              informativa privacy
                            </button> e autorizzo il trattamento dei miei dati personali ai sensi del GDPR (Regolamento UE 2016/679) per l'elaborazione della prenotazione *
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
                          Annulla
                        </button>
                        <button
                          onClick={handleSubmitBooking}
                          disabled={loading}
                          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50"
                        >
                          {loading ? 'Invio...' : 'Conferma'}
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
              <h2 className="text-5xl font-bold text-center text-blue-900 mb-12">Contattaci</h2>
              
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
                    <h3 className="text-2xl font-bold text-blue-900 mb-6">Informazioni</h3>
                    <div className="space-y-4 text-gray-700">
                      <p><strong>Indirizzo:</strong><br/>Via del Mare 123<br/>00100 Località Marina</p>
                      <p><strong>Telefono:</strong><br/>+39 123 456 7890</p>
                      <p><strong>Email:</strong><br/>info@casamare.it</p>
                      <p><strong>Orari:</strong><br/>Lun-Ven: 9:00 - 18:00<br/>Sab: 9:00 - 13:00</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-6">Invia un Messaggio</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Nome e Cognome"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      <input 
                        type="email" 
                        placeholder="Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      <textarea 
                        placeholder="Messaggio"
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
                            Ho letto e accetto l'<button 
                              type="button"
                              onClick={() => setShowPrivacyModal(true)} 
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              informativa privacy
                            </button> e autorizzo il trattamento dei miei dati personali ai sensi del GDPR (Regolamento UE 2016/679) *
                          </span>
                        </label>
                      </div>

                      <button 
                        onClick={handleSubmitContact}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Invio...' : 'Invia Richiesta'}
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
        <p className="mb-2">&copy; 2024 Casa Marè. Tutti i diritti riservati.</p>
        <div className="flex justify-center gap-4 text-sm text-blue-300 flex-wrap px-4">
          <button 
            onClick={() => setShowPrivacyModal(true)}
            className="hover:text-white underline"
          >
            Privacy Policy
          </button>
          <span>|</span>
          <button 
            onClick={() => setShowCookieModal(true)}
            className="hover:text-white underline"
          >
            Cookie Policy
          </button>
          <span>|</span>
          <span>P.IVA: 12345678901</span>
        </div>
      </footer>
    </div>
  );
};

export default CasaMareSite;
