import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Euro, AlertCircle, CheckCircle, Calendar, Wifi, Wind, UtensilsCrossed, Car, Sparkles, Waves } from 'lucide-react';
import { notifyAdminNewBooking } from './emailService';
/* eslint-disable no-restricted-globals */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (activeSection === 'prenota') {
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, activeSection]);

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
      // Mostra come occupate sia le confirmed che le pending
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
  const result = await response.json();
  
  // Invia email notifica admin
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
  
  setSuccess('Richiesta inviata! Riceverai conferma via email entro 24 ore.');
  // ... resto del codice
}
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      <input 
                        type="email" 
                        placeholder="Email"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      <textarea 
                        placeholder="Messaggio"
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                        Invia Richiesta
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
        <p className="mb-2">&copy; 2024 Villa Marina. Tutti i diritti riservati.</p>
        <p className="text-sm text-blue-300">P.IVA: 12345678901 | Privacy Policy | Cookie Policy</p>
      </footer>
    </div>
  );
};

export default VillaMarinaSite;