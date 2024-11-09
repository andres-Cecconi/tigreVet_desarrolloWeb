// appointments.js
import { appointments } from './config.js';
import { formatFullDate } from './utils.js';

export function showAppointmentModal(professional, formattedDate, hour, cell) {
    const appointmentModal = document.getElementById('appointmentModal');
    const modal = new bootstrap.Modal(appointmentModal);
    const appointmentDetails = document.getElementById('appointmentDetails');
    const confirmButton = document.getElementById('confirmAppointment');
    const modalForm = document.getElementById('appointmentForm');

    appointmentDetails.textContent = `Turno con ${professional} para el ${formattedDate} a las ${hour}:00hs`; // Corregido: usando backticks
    modalForm.reset();

    const handleConfirmation = () => {
        const nombreApellido = document.getElementById('modalNombreApellido').value.trim();
        const numeroContacto = document.getElementById('modalNumeroContacto').value.trim();

        if (!nombreApellido || !numeroContacto) {
            alert('Por favor, completa todos los campos');
            return;
        }

        const newAppointment = {
            id: Date.now(),
            professional,
            date: cell.getAttribute('data-date'),
            hour,
            patientName: nombreApellido,
            contactNumber: numeroContacto,
            createdAt: new Date().toISOString()
        };

        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        modal.hide();
        updateCalendarWithAppointments();
        updateAppointmentsList();
        alert('¡Turno agendado con éxito!');
    };

    confirmButton.removeEventListener('click', handleConfirmation);
    confirmButton.addEventListener('click', handleConfirmation);
    modal.show();
}

export function updateCalendarWithAppointments() {
    document.querySelectorAll('.appointed-slot').forEach(slot => {
        slot.classList.remove('appointed-slot');
    });

    appointments.forEach(appointment => {
        const slot = document.querySelector(`td[data-date="${appointment.date}"][data-hour="${appointment.hour}"][data-professional="${appointment.professional}"]`); // Corregido: usando backticks
        if (slot) {
            slot.classList.add('appointed-slot');
            slot.title = `Reservado por: ${appointment.patientName}`;
        }
    });
}