// Configuración
const professionalSchedules = {
    'Cirugía': {
        startHour: 8,
        endHour: 14,
    },
    'Clínica General': {
        startHour: 7,
        endHour: 19,
    },
    'Castración': {
        startHour: 9,
        endHour: 15,
    },
    'Guardería': {
        startHour: 7,
        endHour: 20,
    }
};

// Variables globales
const currentDate = new Date();
let currentMonday = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

function formatDate(date) {
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "numeric" });
}

function formatFullDate(date) {
    return date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Funciones de navegación
function nextWeek() {
    currentMonday.setDate(currentMonday.getDate() + 7);
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

function previousWeek() {
    currentMonday.setDate(currentMonday.getDate() - 7);
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

function currentWeek() {
    currentMonday = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

// Funciones del calendario
function generateCalendarHeader() {
    const calendarHeader = document.getElementById("calendar-header");
    calendarHeader.innerHTML = "<th>Hora</th>";
    const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    for (let i = 0; i < 7; i++) {
        const day = new Date(currentMonday);
        day.setDate(day.getDate() + i);
        const dayName = daysOfWeek[i];
        const formattedDate = formatDate(day);
        const headerCell = document.createElement("th");
        headerCell.innerText = `${dayName} ${formattedDate}`;

        if (day.toDateString() === new Date().toDateString()) {
            headerCell.classList.add("current-day-header");
        }
        calendarHeader.appendChild(headerCell);
    }
}

function generateCalendar(professional = 'Clínica General') {
    generateCalendarHeader();
    const calendarBody = document.getElementById("calendar-body");
    calendarBody.innerHTML = "";

    const schedule = professionalSchedules[professional];
    const startHour = schedule.startHour;
    const endHour = schedule.endHour;

    for (let hour = startHour; hour < endHour; hour++) {
        const row = document.createElement("tr");
        
        const timeCell = document.createElement("td");
        timeCell.innerText = `${hour}:00 - ${hour + 1}:00`;
        row.appendChild(timeCell);

        for (let i = 0; i < 7; i++) {
            const cell = document.createElement("td");
            const day = new Date(currentMonday);
            day.setDate(day.getDate() + i);
            
            if (day.toDateString() === new Date().toDateString()) {
                cell.classList.add("current-day-column");
            }

            cell.setAttribute("data-date", day.toISOString().split("T")[0]);
            cell.setAttribute("data-hour", hour);
            cell.setAttribute("data-professional", professional);
            cell.addEventListener('click', () => handleSlotClick(cell));
            
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }

    updateCalendarWithAppointments();
}

// Funciones de citas
function showAppointmentModal(professional, formattedDate, hour, cell) {
    const appointmentModal = document.getElementById('appointmentModal');
    const modal = new bootstrap.Modal(appointmentModal);
    const appointmentDetails = document.getElementById('appointmentDetails');
    const confirmButton = document.getElementById('confirmAppointment');
    const modalForm = document.getElementById('appointmentForm');

    appointmentDetails.textContent = `Turno con ${professional} para el ${formattedDate} a las ${hour}:00hs`;
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
        alert('¡Turno agendado con éxito!');
    };

    confirmButton.removeEventListener('click', handleConfirmation);
    confirmButton.addEventListener('click', handleConfirmation);
    modal.show();
}

function handleSlotClick(cell) {
    const date = new Date(cell.getAttribute('data-date'));
    const hour = cell.getAttribute('data-hour');
    const professional = cell.getAttribute('data-professional');

    const existingAppointment = appointments.find(app => 
        app.date === cell.getAttribute('data-date') && 
        app.hour === hour && 
        app.professional === professional
    );

    if (existingAppointment) {
        alert('Este horario ya está reservado');
        return;
    }

    const formattedDate = formatFullDate(date);
    showAppointmentModal(professional, formattedDate, hour, cell);
}

function updateCalendarWithAppointments() {
    document.querySelectorAll('.appointed-slot').forEach(slot => {
        slot.classList.remove('appointed-slot');
    });

    appointments.forEach(appointment => {
        const slot = document.querySelector(`td[data-date="${appointment.date}"][data-hour="${appointment.hour}"][data-professional="${appointment.professional}"]`);
        if (slot) {
            slot.classList.add('appointed-slot');
            slot.title = `Reservado por: ${appointment.patientName}`;
        }
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();

    const professionalSelect = document.getElementById('profesional');
    professionalSelect.addEventListener('change', (e) => {
        generateCalendar(e.target.value);
    });
});


function updateAppointmentsList() {
    const appointmentsContainer = document.getElementById('appointments-list');
    const currentProfessional = document.getElementById('profesional').value;
    
    // Filtrar turnos por profesional y ordenar por fecha
    const filteredAppointments = appointments
        .filter(app => app.professional === currentProfessional)
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA - dateB === 0) {
                return parseInt(a.hour) - parseInt(b.hour);
            }
            return dateA - dateB;
        });

    // Crear el contenido HTML
    let html = `
        <h3 class="mb-4">Turnos Agendados - ${currentProfessional}</h3>
        ${filteredAppointments.length === 0 ? '<p class="text-muted">No hay turnos agendados para este profesional</p>' : ''}
        <div class="row">
    `;

    // Generar las tarjetas de turnos
    filteredAppointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        html += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${formatFullDate(appointmentDate)}</h5>
                        <p class="card-text">
                            <strong>Hora:</strong> ${appointment.hour}:00 hs<br>
                            <strong>Paciente:</strong> ${appointment.patientName}<br>
                            <strong>Contacto:</strong> ${appointment.contactNumber}
                        </p>
                        <button onclick="cancelAppointment(${appointment.id})" class="btn btn-danger btn-sm">
                            Cancelar Turno
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    appointmentsContainer.innerHTML = html;
}

function cancelAppointment(appointmentId) {
    const confirmed = confirm('¿Estás seguro de que deseas cancelar este turno?');
    
    if (confirmed) {
        const index = appointments.findIndex(app => app.id === appointmentId);
        if (index !== -1) {
            appointments.splice(index, 1);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            updateCalendarWithAppointments();
            updateAppointmentsList();
            alert('Turno cancelado con éxito');
        }
    }
}

// Modificar la función showAppointmentModal para que actualice la lista de turnos
function showAppointmentModal(professional, formattedDate, hour, cell) {
    const appointmentModal = document.getElementById('appointmentModal');
    const modal = new bootstrap.Modal(appointmentModal);
    const appointmentDetails = document.getElementById('appointmentDetails');
    const confirmButton = document.getElementById('confirmAppointment');
    const modalForm = document.getElementById('appointmentForm');

    appointmentDetails.textContent = `Turno con ${professional} para el ${formattedDate} a las ${hour}:00hs`;
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

// Modificar la inicialización para incluir la lista de turnos
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    updateAppointmentsList();

    const professionalSelect = document.getElementById('profesional');
    professionalSelect.addEventListener('change', (e) => {
        generateCalendar(e.target.value);
        updateAppointmentsList();
    });
});