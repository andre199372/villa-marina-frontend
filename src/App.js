import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Euro, AlertCircle, CheckCircle, Calendar, Wifi, Wind, UtensilsCrossed, Car, Sparkles, Waves, Cookie, X, Shield, FileText } from 'lucide-react';

const API_URL = 'https://villa-marina-api.onrender.com/api';

const VillaMarinaSite = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    notes: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Cookie Banner State
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    // Verifica se l'utente ha già dato il consenso ai cookie
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'prenota') {
      loadBookings();
    }
  }, [currentMonth, activeSection]);

  const acceptAllCookies = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowCookieBanner(false);
  };

  const acceptNecessaryOnly = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowCookieBanner(false);
  };

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleSubmitBooking = async () => {
    if (!selectedDates.start || !selectedDates.end || !formData.name || !formData.email || !formData.phone) {
      setError('Compila tutti i campi obbligatori');
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
        setSuccess('Richiesta di prenotazione inviata! Riceverai una conferma via email entro 24 ore.');
        setShowBookingForm(false);
        setSelectedDates({ start: null, end: null });
        setFormData({ name: '', email: '', phone: '', guests: 1, notes: '' });
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

  const handleSubmitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setError('Compila tutti i campi del modulo contatti');
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
    <div className="min-h-screen bg-gray-50">
      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-500 shadow-2xl z-50 p-6 animate-slide-up">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-4">
              <Cookie className="text-blue-600 flex-shrink-0 mt-1" size={32} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Utilizzo dei Cookie 🍪</h3>
                <p className="text-gray-700 mb-4">
                  Utilizziamo cookie tecnici necessari per il funzionamento del sito e dei servizi di prenotazione. 
                  I tuoi dati sono trattati in conformità al GDPR. 
                  <button 
                    onClick={() => scrollToSection('privacy')}
                    className="text-blue-600 font-semibold hover:underline ml-1"
                  >
                    Leggi la Privacy Policy
                  </button>
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={acceptAllCookies}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Accetta tutti
                  </button>
                  <button
                    onClick={acceptNecessaryOnly}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Solo necessari
                  </button>
                  <button
                    onClick={() => scrollToSection('cookie')}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Maggiori info
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowCookieBanner(false)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white fixed w-full top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Villa Marina</h1>
              <p className="text-blue-200 text-sm italic">Affitti Esclusivi sul Mare</p>
            </div>
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
          </div>
        </div>
      </header>

      <div className="pt-24">
        {/* HOME */}
        {activeSection === 'home' && (
          <section className="relative h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center text-white px-4 animate-fade-in">
              <h2 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg">
                Benvenuti in Paradiso
              </h2>
              <p className="text-2xl md:text-3xl mb-8 text-blue-100">
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
                  Villa Marina è una splendida proprietà di lusso situata direttamente sulla costa, con accesso privato alla spiaggia. 
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

        {/* PRENOTA */}
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

              <div className="mt-6 max-w-4xl mx-auto bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700">
                  <Shield className="inline mr-2" size={16} />
                  I tuoi dati sono protetti e trattati in conformità al GDPR. 
                  <button 
                    onClick={() => scrollToSection('privacy')}
                    className="text-blue-600 font-semibold hover:underline ml-1"
                  >
                    Leggi la Privacy Policy
                  </button>
                </p>
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

                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                        <p className="text-xs text-gray-700">
                          Cliccando "Conferma" accetti il trattamento dei dati secondo la nostra 
                          <button 
                            onClick={() => {
                              setShowBookingForm(false);
                              scrollToSection('privacy');
                            }}
                            className="text-blue-600 font-semibold hover:underline ml-1"
                          >
                            Privacy Policy
                          </button>
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowBookingForm(false);
                            setSelectedDates({ start: null, end: null });
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
                      <p><strong>Email:</strong><br/>info@villamarina.it</p>
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
                      <button 
                        onClick={handleSubmitContact}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Invio...' : 'Invia Richiesta'}
                      </button>
                      <p className="text-xs text-gray-600 text-center">
                        I tuoi dati saranno trattati secondo la nostra 
                        <button 
                          onClick={() => scrollToSection('privacy')}
                          className="text-blue-600 hover:underline ml-1"
                        >
                          Privacy Policy
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PRIVACY POLICY */}
        {activeSection === 'privacy' && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="text-blue-600" size={32} />
                  <h2 className="text-3xl font-bold text-gray-900">Privacy Policy</h2>
                </div>
                <p className="text-sm text-gray-500 mb-8">Ultimo aggiornamento: 12 Gennaio 2026</p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">1. Titolare del Trattamento</h3>
                    <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                      <p className="font-semibold text-gray-900 mb-3">Villa Marina S.r.l.</p>
                      <p className="text-gray-700">Via del Mare 123, 00100 Località Marina</p>
                      <p className="text-gray-700">Email: privacy@villamarina.it</p>
                      <p className="text-gray-700">Tel: +39 123 456 7890</p>
                      <p className="text-sm mt-3 text-gray-600">P.IVA: 12345678901</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">2. Dati Personali Raccolti</h3>
                    <p className="text-gray-700 mb-4">Raccogliamo i seguenti dati:</p>
                    <ul className="space-y-2 text-gray-700 ml-6">
                      <li>• Nome e cognome</li>
                      <li>• Indirizzo email</li>
                      <li>• Numero di telefono</li>
                      <li>• Date di soggiorno e numero ospiti</li>
                      <li>• Note e richieste speciali</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">3. Finalità del Trattamento</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900">Gestione Prenotazioni</h4>
                        <p className="text-sm text-gray-700 mt-1">Base legale: Esecuzione del contratto</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900">Obblighi di Legge</h4>
                        <p className="text-sm text-gray-700 mt-1">Base legale: Adempimenti fiscali e contabili</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900">Assistenza Clienti</h4>
                        <p className="text-sm text-gray-700 mt-1">Base legale: Consenso</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">4. Conservazione dei Dati</h3>
                    <ul className="space-y-2 text-gray-700 ml-6">
                      <li>• <strong>Prenotazioni:</strong> 10 anni (obbligo fiscale)</li>
                      <li>• <strong>Messaggi di contatto:</strong> 2 anni o fino alla cancellazione</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">5. I Tuoi Diritti (GDPR)</h3>
                    <p className="text-gray-700 mb-4">Hai diritto a:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        'Accesso ai dati',
                        'Rettifica dei dati',
                        'Cancellazione',
                        'Limitazione trattamento',
                        'Portabilità',
                        'Opposizione',
                        'Revoca consenso',
                        'Reclamo al Garante'
                      ].map((right, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{right}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <strong>Per esercitare i tuoi diritti:</strong> 
                        <a href="mailto:privacy@villamarina.it" className="text-blue-600 font-semibold ml-2 hover:underline">
                          privacy@villamarina.it
                        </a>
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">6. Sicurezza</h3>
                    <ul className="space-y-2 text-gray-700 ml-6">
                      <li>• Crittografia SSL/TLS</li>
                      <li>• Database protetto con autenticazione</li>
                      <li>• Backup regolari</li>
                      <li>• Accesso limitato al personale autorizzato</li>
                    </ul>
                  </section>

                  <section className="border-t-2 border-gray-200 pt-6">
                    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-lg">
                      <p className="mb-4">Per domande sulla privacy:</p>
                      <p><Mail className="inline mr-2" size={18} />
                        <a href="mailto:privacy@villamarina.it" className="hover:underline">privacy@villamarina.it</a>
                      </p>
                      <p className="mt-2"><Phone className="inline mr-2" size={18} />+39 123 456 7890</p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* COOKIE POLICY */}
        {activeSection === 'cookie' && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Cookie className="text-blue-600" size={32} />
                  <h2 className="text-3xl font-bold text-gray-900">Cookie Policy</h2>
                </div>
                <p className="text-sm text-gray-500 mb-8">Ultimo aggiornamento: 12 Gennaio 2026</p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Cosa sono i Cookie?</h3>
                    <p className="text-gray-700">
                      I cookie sono piccoli file di testo che i siti web inviano al browser e vengono memorizzati 
                      per migliorare l'esperienza di navigazione e garantire il corretto funzionamento del sito.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Cookie Utilizzati</h3>
                    
                    <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6 mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-xl font-bold text-gray-900">Cookie Tecnici</h4>
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          SEMPRE ATTIVI
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">Essenziali per il funzionamento. Non richiedono consenso.</p>
                      <div className="bg-white p-4 rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Cookie</th>
                              <th className="text-left py-2">Finalità</th>
                              <th className="text-left py-2">Durata</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 font-mono text-xs">adminToken</td>
                              <td className="py-2">Autenticazione</td>
                              <td className="py-2">Sessione</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-mono text-xs">cookieConsent</td>
                              <td className="py-2">Preferenze cookie</td>
                              <td className="py-2">12 mesi</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Cookie Analitici/Marketing</h4>
                      <p className="text-gray-700">
                        Attualmente non utilizziamo cookie di terze parti per analisi o marketing.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Gestisci Cookie</h3>
                    <p className="text-gray-700 mb-4">Puoi gestire i cookie tramite il tuo browser:</p>
                    <ul className="space-y-2 text-gray-700 ml-6">
                      <li>• <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
                      <li>• <a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
                      <li>• <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
                      <li>• <a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
                    </ul>
                  </section>

                  <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-lg">
                    <h3 className="text-2xl font-bold mb-4">Gestisci le tue Preferenze</h3>
                    <button
                      onClick={() => setShowCookieBanner(true)}
                      className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                    >
                      Modifica Preferenze Cookie
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 text-center">
        <p className="mb-2">&copy; 2026 Villa Marina. Tutti i diritti riservati.</p>
        <p className="text-sm text-blue-300">
          P.IVA: 12345678901 | 
          <button onClick={() => scrollToSection('privacy')} className="hover:underline ml-2">Privacy Policy</button> | 
          <button onClick={() => scrollToSection('cookie')} className="hover:underline ml-2">Cookie Policy</button>
        </p>
      </footer>
    </div>
  );
};

export default VillaMarinaSite;
