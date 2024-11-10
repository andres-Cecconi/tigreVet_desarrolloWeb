const currentDate = new Date();
let currentMonday = new Date(currentDate);
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
const diff = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
currentMonday.setDate(currentDate.getDate() - diff);

// Configuración de horarios para servicios profesionales
const professionalSchedules = {
    Cirugía: {
        startHour: 8,
        endHour: 14,
    },
    'Clínica General': {
        startHour: 7,
        endHour: 19,
    },
    Castración: {
        startHour: 9,
        endHour: 15,
    },
    Guardería: {
        startHour: 7,
        endHour: 20,
    },
};

// Funciones de utilidad
function isPastDate(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
}

function isPastTime(dateStr, hour) {
    const now = new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day);
    if (isPastDate(dateStr)) {
        return true;
    }
    if (
        checkDate.getDate() === now.getDate() &&
        checkDate.getMonth() === now.getMonth() &&
        checkDate.getFullYear() === now.getFullYear()
    ) {
        return hour <= now.getHours();
    }

    return false;
}

function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'numeric',
        timeZone: 'UTC',
    });
}

function formatFullDate(date) {
    if (typeof date === 'string') {
        const [year, month, day] = date.split('-').map(Number);
        date = new Date(year, month - 1, day);
    }

    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Funciones del calendario
function generateCalendarHeader() {
    const calendarHeader = document.getElementById('calendar-header');
    calendarHeader.innerHTML = '<th>Hora</th>';
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
        const day = new Date(currentMonday);
        day.setDate(currentMonday.getDate() + i);
        const dayName = daysOfWeek[i];
        const formattedDate = formatDate(day);
        const headerCell = document.createElement('th');
        headerCell.innerText = `${dayName} ${formattedDate}`;

        // Verificar si es el día actual
        const today = new Date();
        if (
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear()
        ) {
            headerCell.classList.add('current-day-header');
        }
        calendarHeader.appendChild(headerCell);
    }
}

function generateCalendar(professional = 'Clínica General') {
    generateCalendarHeader();
    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = '';

    const schedule = professionalSchedules[professional];
    const startHour = schedule.startHour;
    const endHour = schedule.endHour;

    for (let hour = startHour; hour < endHour; hour++) {
        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        timeCell.innerText = `${hour}:00 - ${hour + 1}:00`;
        row.appendChild(timeCell);

        for (let i = 0; i < 7; i++) {
            const cell = document.createElement('td');
            const day = new Date(currentMonday);
            day.setDate(currentMonday.getDate() + i);

            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const dayOfMonth = String(day.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayOfMonth}`;

            cell.setAttribute('data-date', dateStr);
            cell.setAttribute('data-hour', hour);
            cell.setAttribute('data-professional', professional);

            const isPast = isPastDate(dateStr);
            const isPastTimeSlot = isPastTime(dateStr, hour);

            if (isPast || isPastTimeSlot) {
                cell.classList.add('past-date');
                cell.style.backgroundColor = '#f5f5f5';
                cell.style.cursor = 'not-allowed';
                cell.title = isPast
                    ? 'No se pueden agendar citas en fechas pasadas'
                    : 'No se pueden agendar citas en horarios pasados';
            } else {
                cell.style.cursor = 'pointer';
                cell.onclick = () => handleSlotClick(cell);
            }

            // Marcar el día actual
            const today = new Date();
            if (
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear()
            ) {
                cell.classList.add('current-day-column');
            }

            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }

    updateCalendarWithAppointments();
    updateAppointmentsList();
}

function updateCalendarWithAppointments() {
    document.querySelectorAll('.appointed-slot').forEach((slot) => {
        slot.classList.remove('appointed-slot');
    });

    appointments.forEach((appointment) => {
        const slot = document.querySelector(
            `td[data-date="${appointment.date}"][data-hour="${appointment.hour}"][data-professional="${appointment.professional}"]`
        );
        if (slot) {
            slot.classList.add('appointed-slot');
            slot.title = `Reservado por: ${appointment.patientName}`;
        }
    });
}

function handleSlotClick(cell) {
    const dateStr = cell.getAttribute('data-date');
    const hour = parseInt(cell.getAttribute('data-hour'));

    if (isPastTime(dateStr, hour)) {
        showErrorAlert('No se pueden agendar citas en horarios pasados');
        return;
    }

    const professional = cell.getAttribute('data-professional');

    const existingAppointment = appointments.find(
        (app) => app.date === dateStr && parseInt(app.hour) === hour && app.professional === professional
    );

    if (existingAppointment) {
        showErrorAlert('Este horario ya está reservado');
        return;
    }

    // Crear fecha para mostrar en el modal
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = formatFullDate(date);

    showAppointmentModal(professional, formattedDate, hour, cell);
}

function showAppointmentModal(professional, formattedDate, hour, cell) {
    const appointmentModal = document.getElementById('appointmentModal');
    const modal = new bootstrap.Modal(appointmentModal);
    const appointmentDetails = document.getElementById('appointmentDetails');
    const confirmButton = document.getElementById('confirmAppointment');
    const modalForm = document.getElementById('appointmentForm');
    const numeroContactoInput = document.getElementById('modalNumeroContacto');

    appointmentDetails.innerHTML = `Turno con <strong>${professional}</strong> para el <strong>${formattedDate}</strong> a las <strong>${hour}:00hs</strong>`;
    modalForm.reset();

    // Validación del número de contacto mientras se escribe
    numeroContactoInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número
        if (value.length > 10) value = value.slice(0, 10); // Limita a 10 dígitos
        e.target.value = value;
    });

    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

    newConfirmButton.addEventListener('click', async () => {
        const nombreApellido = document.getElementById('modalNombreApellido').value.trim();
        const numeroContacto = document.getElementById('modalNumeroContacto').value.trim();

        // Validación de campos vacíos
        if (!nombreApellido || !numeroContacto) {
            await Swal.fire({
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos requeridos',
                icon: 'warning',
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        // Validación del formato del número de contacto
        if (!/^\d{10}$/.test(numeroContacto)) {
            await Swal.fire({
                title: 'Número de contacto inválido',
                text: 'Por favor, ingresa un número de 10 dígitos sin espacios ni guiones',
                icon: 'error',
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Corregir',
            });
            return;
        }

        const dateStr = cell.getAttribute('data-date');
        const existingAppointment = appointments.find(
            (app) => app.date === dateStr && parseInt(app.hour) === hour && app.professional === professional
        );

        if (existingAppointment) {
            await Swal.fire({
                title: 'Horario no disponible',
                text: 'Este horario ya está reservado',
                icon: 'error',
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        // Confirmación final antes de guardar el turno
        const confirmResult = await Swal.fire({
            title: '¿Confirmar turno?',
            html: `
                <p>¿Deseas confirmar el turno con los siguientes datos?</p>
                <ul style="text-align: left; list-style: none;">
                    <li><strong>Servicio:</strong> ${professional}</li>
                    <li><strong>Fecha:</strong> ${formattedDate}</li>
                    <li><strong>Hora:</strong> ${hour}:00 hs</li>
                    <li><strong>Paciente:</strong> ${nombreApellido}</li>
                    <li><strong>Contacto:</strong> ${numeroContacto}</li>
                </ul>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        });

        if (confirmResult.isConfirmed) {
            const newAppointment = {
                id: Date.now(),
                professional,
                date: cell.getAttribute('data-date'),
                hour,
                patientName: nombreApellido,
                contactNumber: numeroContacto,
                createdAt: new Date().toISOString(),
            };

            appointments.push(newAppointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));

            updateCalendarWithAppointments();
            updateAppointmentsList();

            bootstrap.Modal.getInstance(appointmentModal).hide();

            await Swal.fire({
                title: '¡Turno confirmado!',
                text: 'Tu turno ha sido agendado exitosamente',
                icon: 'success',
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Excelente',
            });
        }
    });

    modal.show();
}
function updateAppointmentsList() {
    const appointmentsContainer = document.getElementById('appointments-list');

    // Ordenar todos los turnos por fecha y hora
    const sortedAppointments = appointments.sort((a, b) => {
        const dateA = new Date(a.date + 'T00:00:00');
        const dateB = new Date(b.date + 'T00:00:00');
        if (dateA - dateB === 0) {
            return parseInt(a.hour) - parseInt(b.hour);
        }
        return dateA - dateB;
    });

    // Agrupar turnos por tipo de profesional
    const appointmentsByType = sortedAppointments.reduce((acc, appointment) => {
        if (!acc[appointment.professional]) {
            acc[appointment.professional] = [];
        }
        acc[appointment.professional].push(appointment);
        return acc;
    }, {});

    let html = '<h3 class="mb-4">Todos los Turnos Agendados</h3>';

    if (sortedAppointments.length === 0) {
        html += '<p class="text-muted">No hay turnos agendados</p>';
    } else {
        // Crear sección para cada tipo de profesional
        Object.entries(appointmentsByType).forEach(([professional, profAppointments]) => {
            html += `
                <div class="professional-section mb-4">
                    <h4 class="professional-title mb-3 p-2 bg-light rounded">${professional} (${profAppointments.length} turnos)</h4>
                    <div class="row">
            `;

            profAppointments.forEach((appointment) => {
                const [year, month, day] = appointment.date.split('-').map(Number);
                const appointmentDate = new Date(year, month - 1, day);
                const isPastAppointment = isPastDate(appointment.date);

                const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                html += `
                    <div class="col-md-4 mb-3">
                        <div class="card ${isPastAppointment ? 'past-appointment' : ''}">
                            <div class="card-body">
                                <h5 class="card-title">${formattedDate}</h5>
                                <p class="card-text">
                                    <strong>Hora:</strong> ${appointment.hour}:00 hs<br>
                                    <strong>Paciente:</strong> ${appointment.patientName}<br>
                                    <strong>Contacto:</strong> ${appointment.contactNumber}
                                </p>
                                ${
                                    !isPastAppointment
                                        ? `
                                    <button onclick="cancelAppointment(${appointment.id})" class="btn btn-danger btn-sm">
                                        Cancelar Turno
                                    </button>
                                `
                                        : `
                                    <div class="text-muted font-italic">
                                        <small>Turno pasado</small>
                                    </div>
                                `
                                }
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div></div>';
        });
    }

    appointmentsContainer.innerHTML = html;
}

// Navegación
function nextWeek() {
    const newDate = new Date(currentMonday);
    newDate.setDate(currentMonday.getDate() + 7);
    currentMonday = newDate;
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

function previousWeek() {
    const newDate = new Date(currentMonday);
    newDate.setDate(currentMonday.getDate() - 7);

    const today = new Date();
    const startOfWeek = new Date(today);
    const todayDiff = today.getDay() === 0 ? 6 : today.getDay() - 1;
    startOfWeek.setDate(today.getDate() - todayDiff);
    startOfWeek.setHours(0, 0, 0, 0);

    if (newDate < startOfWeek) {
        showErrorAlert('No se puede navegar a semanas anteriores a la actual');
        return;
    }

    currentMonday = newDate;
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

function currentWeek() {
    const today = new Date();
    const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
    currentMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diff);
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const professionalSelect = document.getElementById('profesional');
    if (professionalSelect) {
        // Remover event listeners anteriores
        const newSelect = professionalSelect.cloneNode(true);
        professionalSelect.parentNode.replaceChild(newSelect, professionalSelect);

        // Agregar nuevo event listener
        newSelect.addEventListener('change', (e) => {
            generateCalendar(e.target.value);
        });

        generateCalendar(newSelect.value);
    }
});

// Función para cancelar turnos
async function cancelAppointment(appointmentId) {
    const confirmed = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas cancelar este turno?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#6c757d',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'No, mantener turno',
        cancelButtonText: 'Sí, cancelar turno',
        reverseButtons: true,
    });

    if (!confirmed.isConfirmed) {
        const index = appointments.findIndex((app) => app.id === appointmentId);
        if (index !== -1) {
            appointments.splice(index, 1);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            updateCalendarWithAppointments();
            updateAppointmentsList();
            await Swal.fire({
                title: '¡Turno cancelado!',
                text: 'El turno ha sido cancelado exitosamente',
                icon: 'success',
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Entendido',
            });
        }
    }
}

// Función para mostrar alertas de éxito
async function showSuccessAlert(message) {
    await Swal.fire({
        title: '¡Éxito!',
        text: message,
        icon: 'success',
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Aceptar',
    });
}

// Función para mostrar alertas de error
async function showErrorAlert(message) {
    await Swal.fire({
        title: '¡Error!',
        text: message,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
    });
}

// Función para mostrar confirmaciones
async function showConfirmation(message) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
    });
    return result.isConfirmed;
}

// Hacer funciones globales para los botones
window.nextWeek = nextWeek;
window.previousWeek = previousWeek;
window.currentWeek = currentWeek;
window.cancelAppointment = cancelAppointment;