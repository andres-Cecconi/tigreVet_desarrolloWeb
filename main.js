document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".card-nav");
    const contentItems = document.querySelectorAll(".content-item");

    cards.forEach(card => {
        card.addEventListener("click", function () {
            // Quita la clase 'active' de todos los elementos de navegación
            cards.forEach(card => card.classList.remove("active"));

            // Oculta todos los contenidos
            contentItems.forEach(item => item.classList.remove("active"));

            // Agrega la clase 'active' al elemento de navegación clicado
            this.classList.add("active");

            // Muestra el contenido correspondiente
            const target = this.getAttribute("data-target");
            document.getElementById(target).classList.add("active");
        });
    });
});
