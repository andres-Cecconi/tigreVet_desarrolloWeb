// Objeto que almacena el presupuesto por servicio y tamaño
const precios = {
    "clinica": { "pequeno": 10000, "mediano": 15000, "grande": 20000 },
    "cirugia": { "pequeno": 40000, "mediano": 50000, "grande": 60000 },
    "castracion": { "pequeno": 20000, "mediano": 25000, "grande": 30000 },
    "guarderia": { "pequeno": 8000, "mediano": 10000, "grande": 12000 }
};

// Arreglo para almacenar los animales agregados
let animalesAgregados = [];

// Función para agregar un animal con sus datos
function agregarAnimal() {
    const servicio = document.getElementById("servicio").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const tamano = document.getElementById("tamano").value;
    
    // Validar que todos los campos estén seleccionados
    if (!servicio || !cantidad || !tamano) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Verificar el total de animales para ese tamaño
    const animalesExistentes = animalesAgregados.filter(a => a.tamano === tamano);
    const totalCantidad = animalesExistentes.reduce((acc, animal) => acc + animal.cantidad, 0);

    // Verificar que no se agregue más de 10 animales por tipo de tamaño
    if (totalCantidad + cantidad > 10) {
        alert("No puedes agregar más de 10 animales por tipo de tamaño y servicio. Para esa cantidad de animales, por favor solicita presupuesto por los medios de contacto de la veterinaria.");
        return;
    }

    // Verificar que el tamaño y servicio sean válidos
    if (!precios[servicio] || !precios[servicio][tamano]) {
        alert("Servicio o tamaño no válido.");
        return;
    }

    // Crear un objeto con la información del animal
    const animal = {
        servicio: servicio,
        cantidad: cantidad,
        tamano: tamano,
        precioUnitario: precios[servicio][tamano],
        totalPorAnimal: precios[servicio][tamano] * cantidad
    };

    // Verificar si ya existe el mismo servicio y tamaño en el arreglo
    let animalExistente = animalesAgregados.find(a => a.servicio === servicio && a.tamano === tamano);

    if (animalExistente) {
        // Si el animal ya existe, solo se suma la cantidad
        animalExistente.cantidad += cantidad;
        animalExistente.totalPorAnimal = animalExistente.precioUnitario * animalExistente.cantidad;
    } else {
        // Si no existe, se agrega el nuevo animal
        animalesAgregados.push(animal);
    }

    // Mostrar el resumen de cotización
    const resumenCotizacion = document.getElementById("resumen-cotizacion");
    resumenCotizacion.classList.remove("d-none");

    // Crear una entrada en la lista de servicios seleccionados
    const listaServicios = document.getElementById("lista-servicios");
    listaServicios.innerHTML = ""; // Limpiar la lista antes de renderizar nuevamente

    // Volver a renderizar el resumen con los animales actualizados
    animalesAgregados.forEach(animal => {
        const divServicio = document.createElement("div");
        divServicio.classList.add("mb-3");

        // Corregir los nombres de los servicios y tamaños
        const nombreServicio = {
            "clinica": "Clínica General",
            "cirugia": "Cirugía",
            "castracion": "Castración",
            "guarderia": "Guardería"
        };

        const nombreTamano = {
            "pequeno": "Pequeño",
            "mediano": "Mediano",
            "grande": "Grande"
        };

        divServicio.innerHTML = `
            <div><strong>Servicio:</strong> ${nombreServicio[animal.servicio]}</div>
            <div><strong>Tamaño:</strong> ${nombreTamano[animal.tamano]}</div>
            <div><strong>Cantidad de animales:</strong> ${animal.cantidad}</div>
            <div><strong>Precio unitario por animal:</strong> $${animal.precioUnitario}</div>
            <div><strong>Total:</strong> $${animal.totalPorAnimal}</div>
        `;

        listaServicios.appendChild(divServicio);
    });

    // Ocultar el botón "Agregar al presupuesto" si ya se agregaron animales
    if (animalesAgregados.length > 0) {
        const botonCalcular = document.querySelector("button[onclick='calcularPresupuesto()']");
        botonCalcular.classList.remove("d-none");
    }
}

// Función para calcular el presupuesto total
function calcularPresupuesto() {
    if (animalesAgregados.length === 0) {
        alert("Por favor, agrega al menos un animal.");
        return;
    }

    let presupuestoTotal = 0;

    // Recorrer el arreglo de animales agregados y sumar los precios
    for (let animal of animalesAgregados) {
        presupuestoTotal += animal.totalPorAnimal;
    }

    // Mostrar el total
    const resultado = document.getElementById("resultado");
    resultado.innerText = `El presupuesto estimado total es: $${presupuestoTotal}`;
    resultado.classList.remove("d-none");
}