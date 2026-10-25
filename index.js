const filterButtons = document.querySelectorAll(".filter-btn");
const catalogGroups = document.querySelectorAll(".catalog-group");
const reserveButtons = document.querySelectorAll(".reserve-btn");
const reservationDialog = document.querySelector(".reservation-dialog");
const reservationTitle = document.getElementById("reservation-title");
const bookingForm = document.getElementById("booking-form");
const bookingCar = document.getElementById("booking-car");
const reservationConfirmation = document.getElementById("reservation-confirmation");
const reservationMessage = document.getElementById("reservation-message");
const openBookingButton = document.getElementById("open-booking");
const cancelBookingButton = document.getElementById("cancel-booking");

const reservationsKey = "supercarsOlivosReservas";

function filterCars(category) {
  catalogGroups.forEach(function (group) {
    const carsInGroup = group.querySelectorAll(".car-card");
    let visibleCars = 0;

    carsInGroup.forEach(function (car) {
      const shouldShow = category === "todos" || car.dataset.category === category;
      car.hidden = !shouldShow;

      if (shouldShow) {
        visibleCars += 1;
      }
    });

    group.hidden = visibleCars === 0;
  });

  filterButtons.forEach(function (button) {
    const isSelected = button.dataset.category === category;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", isSelected);
  });
}

function saveReservation(carName, category) {
  let reservations = [];
  let savedReservations;

  try {
    savedReservations = localStorage.getItem(reservationsKey);
  } catch (error) {
    throw new Error("El navegador no permitió acceder al almacenamiento local.");
  }

  if (savedReservations !== null) {
    reservations = JSON.parse(savedReservations);

    if (!Array.isArray(reservations)) {
      throw new Error("Los datos guardados de reservas no tienen el formato esperado.");
    }
  }

  const reservation = {
    car: carName,
    category: category,
    reservedAt: new Date().toISOString(),
  };

  reservations.push(reservation);
  try {
    localStorage.setItem(reservationsKey, JSON.stringify(reservations));
  } catch (error) {
    throw new Error("El navegador no permitió acceder al almacenamiento local.");
  }

  return reservation;
}

function showReservationConfirmation(message) {
  reservationTitle.textContent = "Reserva registrada";
  bookingForm.hidden = true;
  reservationConfirmation.hidden = false;
  reservationMessage.textContent = message;

  if (!reservationDialog.open) {
    reservationDialog.showModal();
  }
}

function showBookingForm() {
  reservationTitle.textContent = "Reservar una prueba de manejo";
  bookingForm.hidden = false;
  reservationConfirmation.hidden = true;
  bookingForm.reset();
  reservationDialog.showModal();
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterCars(button.dataset.category);
  });
});

reserveButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const car = button.closest(".car-card");

    try {
      const reservation = saveReservation(
        car.querySelector("h4").textContent.trim(),
        car.dataset.category
      );
      showReservationConfirmation(
        "La prueba de manejo del " + reservation.car + " quedó guardada en este dispositivo."
      );
    } catch (error) {
      showReservationConfirmation("No se pudo guardar la reserva. " + error.message);
    }
  });
});

openBookingButton.addEventListener("click", showBookingForm);

cancelBookingButton.addEventListener("click", function () {
  reservationDialog.close();
});

bookingForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const selectedOption = bookingCar.selectedOptions[0];

  try {
    const reservation = saveReservation(
      selectedOption.value,
      selectedOption.dataset.category
    );
    showReservationConfirmation(
      "La prueba de manejo del " + reservation.car + " quedó guardada en este dispositivo."
    );
  } catch (error) {
    showReservationConfirmation("No se pudo guardar la reserva. " + error.message);
  }
});

reservationDialog.addEventListener("close", function () {
  bookingForm.hidden = false;
  reservationConfirmation.hidden = true;
  bookingForm.reset();
});