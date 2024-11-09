export const professionalSchedules = {
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
export const currentDate = new Date();
export let currentMonday = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
export const appointments = JSON.parse(localStorage.getItem('appointments')) || [];