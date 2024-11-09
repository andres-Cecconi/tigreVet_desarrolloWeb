export function formatDate(date) {
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "numeric" });
}

export function formatFullDate(date) {
    return date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}