import emailjs from '@emailjs/browser';

// ⚠️ SOSTITUISCI CON I TUOI VALORI
const SERVICE_ID = 'service_n6kpl8g';
const TEMPLATE_ADMIN = 'template_r0ygl1n';
const TEMPLATE_CLIENT_CONFIRM = 'template_v8ksnqs';
const TEMPLATE_CLIENT_REJECT = 'template_ghi012';
const PUBLIC_KEY = 'ckOjn0FPeiyQ_sAYf';

emailjs.init(PUBLIC_KEY);

// Notifica admin di nuova prenotazione
export const notifyAdminNewBooking = async (booking) => {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, {
      client_name: booking.name,
      client_email: booking.email,
      client_phone: booking.phone,
      guests: booking.guests,
      checkin_date: new Date(booking.startDate).toLocaleDateString('it-IT'),
      checkout_date: new Date(booking.endDate).toLocaleDateString('it-IT'),
      price: booking.price,
      notes: booking.notes || 'Nessuna nota'
    });
    console.log('✅ Email admin inviata');
  } catch (error) {
    console.error('❌ Errore invio email admin:', error);
  }
};

// Email conferma al cliente
export const sendConfirmationEmail = async (booking) => {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_CLIENT_CONFIRM, {
      client_name: booking.name,
      client_email: booking.email,
      guests: booking.guests,
      checkin_date: new Date(booking.start_date).toLocaleDateString('it-IT'),
      checkout_date: new Date(booking.end_date).toLocaleDateString('it-IT'),
      price: booking.price
    });
    console.log('✅ Email conferma cliente inviata');
  } catch (error) {
    console.error('❌ Errore invio email cliente:', error);
  }
};

// Email rifiuto al cliente
export const sendRejectionEmail = async (booking) => {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_CLIENT_REJECT, {
      client_name: booking.name,
      client_email: booking.email,
      checkin_date: new Date(booking.start_date).toLocaleDateString('it-IT'),
      checkout_date: new Date(booking.end_date).toLocaleDateString('it-IT')
    });
    console.log('✅ Email rifiuto cliente inviata');
  } catch (error) {
    console.error('❌ Errore invio email rifiuto:', error);
  }
};