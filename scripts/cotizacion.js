// Objeto que almacena el presupuesto por servicio y tamaño
const precios = {
    "clinica": { "pequeno": 10000, "mediano": 15000, "grande": 20000 },
    "castracion": { "pequeno": 20000, "mediano": 25000, "grande": 30000 },
    "guarderia": { "pequeno": 8000, "mediano": 10000, "grande": 12000 }
};

// Arreglo para almacenar las mascotas agregadas
let mascotasAgregadas = [];

// Mostrar campo de fecha si el servicio es Guardería
function mostrarCalendario() {
    const servicio = document.getElementById("servicio").value;
    const diasGuarderia = document.getElementById("dias-guarderia");
    diasGuarderia.classList.toggle("d-none", servicio !== "guarderia");
}

// Función para agregar una mascota con sus datos
function agregarMascota() {
    const servicio = document.getElementById("servicio").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const tamano = document.getElementById("tamano").value;
    let dias = 1;

    // Validar que todos los campos estén seleccionados
    if (!servicio || !cantidad || !tamano) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Verificar el total de mascotas para ese tamaño y servicio
    const mascotasExistentes = mascotasAgregadas.filter(m => m.servicio === servicio && m.tamano === tamano);
    const totalCantidad = mascotasExistentes.reduce((acc, mascota) => acc + mascota.cantidad, 0);

    // Verificar que no se agregue más de 10 mascotas por tipo de tamaño y servicio
    if (totalCantidad + cantidad > 10) {
        alert("No puedes agregar más de 10 mascotas por tipo de tamaño y servicio. Para esa cantidad de mascotas, solicita un presupuesto por los medios de contacto de la veterinaria.");
        return;
    }

    // Para guardería, calcular los días seleccionados
    if (servicio === "guarderia") {
        const fechaInicio = new Date(document.getElementById("fecha-inicio").value);
        const fechaFin = new Date(document.getElementById("fecha-fin").value);
        
        if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
            alert("Por favor, selecciona fechas válidas para Guardería.");
            return;
        }

        // Calcular cantidad de días entre fechas
        dias = (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24) + 1;
    }

    const precioUnitario = precios[servicio][tamano] * dias;
    const totalPorMascota = precioUnitario * cantidad;

    // Crear un objeto con la información de la mascota
    const mascota = {
        servicio: servicio,
        cantidad: cantidad,
        tamano: tamano,
        dias: dias,
        precioUnitario: precioUnitario,
        totalPorMascota: totalPorMascota
    };

    // Verificar si ya existe el mismo servicio y tamaño en el arreglo
    let mascotaExistente = mascotasAgregadas.find(m => m.servicio === servicio && m.tamano === tamano);

    if (mascotaExistente) {
        // Si la mascota ya existe, solo se suma la cantidad
        mascotaExistente.cantidad += cantidad;
        mascotaExistente.totalPorMascota = mascotaExistente.precioUnitario * mascotaExistente.cantidad;
    } else {
        // Si no existe, se agrega la nueva mascota
        mascotasAgregadas.push(mascota);
    }

    // Mostrar el resumen de cotización
    const resumenCotizacion = document.getElementById("resumen-cotizacion");
    resumenCotizacion.classList.remove("d-none");

    // Crear una entrada en la lista de servicios seleccionados
    renderizarResumen();
}

// Función para renderizar el resumen de cotización
function renderizarResumen() {
    const listaServicios = document.getElementById("lista-servicios");
    listaServicios.innerHTML = ""; // Limpiar la lista antes de renderizar nuevamente

    mascotasAgregadas.forEach((mascota, index) => {
        const divServicio = document.createElement("div");
        divServicio.classList.add("mb-3");

        // Corregir los nombres de los servicios y tamaños
        const nombreServicio = {
            "clinica": "Clínica General",
            "castracion": "Castración",
            "guarderia": "Guardería"
        };

        const nombreTamano = {
            "pequeno": "Pequeño",
            "mediano": "Mediano",
            "grande": "Grande"
        };

        // Construir el HTML para cada servicio
        divServicio.innerHTML = `
            <div><strong>Servicio:</strong> ${nombreServicio[mascota.servicio]}</div>
            <div><strong>Tamaño:</strong> ${nombreTamano[mascota.tamano]}</div>
            <div><strong>Cantidad de mascotas:</strong> ${mascota.cantidad}</div>
            ${mascota.servicio === "guarderia" ? `<div><strong>Días de estadía:</strong> ${mascota.dias}</div>` : ""}
            <div><strong>Precio unitario por mascota:</strong> $${mascota.precioUnitario}</div>
            <div><strong>Total:</strong> $${mascota.totalPorMascota}</div>
            <button class="btn btn-danger btn-sm mt-2" onclick="eliminarMascota(${index})">Eliminar</button>
        `;

        listaServicios.appendChild(divServicio);
    });

    // Mostrar el botón "Calcular Presupuesto Final" si ya se agregaron mascotas
    if (mascotasAgregadas.length > 0) {
        const botonCalcular = document.querySelector("button[onclick='calcularPresupuesto()']");
        botonCalcular.classList.remove("d-none");
    }
}

// Función para eliminar una mascota del resumen
function eliminarMascota(index) {
    mascotasAgregadas.splice(index, 1);
    renderizarResumen();
}

// Función para calcular el presupuesto total
function calcularPresupuesto() {
    if (mascotasAgregadas.length === 0) {
        alert("Por favor, agrega al menos una mascota.");
        return;
    }

    let presupuestoTotal = 0;

    // Recorrer el arreglo de mascotas agregadas y sumar los precios
    for (let mascota of mascotasAgregadas) {
        presupuestoTotal += mascota.totalPorMascota;
    }

    // Mostrar el total
    const resultado = document.getElementById("resultado");
    resultado.innerText = `El presupuesto estimado total es: $${presupuestoTotal}`;
    resultado.classList.remove("d-none");
}