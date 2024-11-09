import { currentMonday, currentDate } from './config.js';
import { generateCalendar } from './calendar.js';

export function nextWeek() {
    currentMonday.setDate(currentMonday.getDate() + 7);
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

export function previousWeek() {
    currentMonday.setDate(currentMonday.getDate() - 7);
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}

export function currentWeek() {
    currentMonday = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
    const professional = document.getElementById('profesional').value;
    generateCalendar(professional);
}