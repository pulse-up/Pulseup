document.addEventListener("DOMContentLoaded", () => {

    const gearIcon = document.getElementById("settingsIcon");
    const rescheduleBtns =
        document.querySelectorAll(".btn-outline-primary");

    const cancelBtns =
        document.querySelectorAll(".btn-outline-danger");

    const startBookingBtn =
        document.querySelector(".add-booking .btn");

    const viewAll =
        document.getElementById("viewAllBookings");

    const tableLinks =
        document.querySelectorAll("table a");

    // SETTINGS MODAL
    const settingsHTML = `

    <div class="modal fade" id="settingsModal" tabindex="-1">

        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">
                        Profile Settings
                    </h5>

                    <button type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">

                    <div class="text-center mb-4">

                        <img src="PulseUp images/20221223_103444.jpg"
                             class="rounded-circle mb-2"
                             width="90"
                             height="90">

                        <h6>Matinisa Lubisi</h6>

                        <small class="text-muted">
                            Medical ID: 88201-P
                        </small>

                    </div>

                    <div class="mb-3">
                        <label class="form-label">
                            Full Name
                        </label>

                        <input type="text"
                               class="form-control"
                               value="Matinisa Lubisi">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">
                            Email
                        </label>

                        <input type="email"
                               class="form-control"
                               placeholder="Enter email">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">
                            Phone Number
                        </label>

                        <input type="text"
                               class="form-control"
                               placeholder="Enter number">
                    </div>

                    <div class="form-check form-switch mb-4">

                        <input class="form-check-input"
                               type="checkbox"
                               id="darkModeToggle">

                        <label class="form-check-label">
                            Dark Mode
                        </label>

                    </div>

                    <button class="btn btn-primary w-100">
                        Save Changes
                    </button>

                </div>

            </div>
        </div>

    </div>

    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        settingsHTML
    );

    const settingsModal =
        new bootstrap.Modal(
            document.getElementById("settingsModal")
        );

    gearIcon.addEventListener("click", () => {
        settingsModal.show();
    });

    // LOAD SAVED MODE
    if (localStorage.getItem("darkMode") === "enabled") {

        document.body.classList.add("dark-mode");

        const toggle =
            document.getElementById("darkModeToggle");

        if (toggle) {
            toggle.checked = true;
        }

    }

// TOGGLE DARK MODE
    document.addEventListener("change", (e) => {

        if (e.target.id === "darkModeToggle") {

            if (e.target.checked) {

                document.body.classList.add("dark-mode");

                localStorage.setItem(
                    "darkMode",
                    "enabled"
                );

            } else {

                document.body.classList.remove("dark-mode");

                localStorage.setItem(
                    "darkMode",
                    "disabled"
                );

            }

        }

    });

    viewAll.addEventListener("click", (e) => {

        e.preventDefault();

        const moreBookings = `

        <div class="alert alert-info mt-3">

            <strong>Additional Active Bookings</strong>

            <hr>

            <p>
                HIV Consultation - May 20, 11:00 AM
            </p>

            <p>
                Mental Health Support - May 22, 09:30 AM
            </p>

        </div>

        `;

        viewAll.insertAdjacentHTML(
            "afterend",
            moreBookings
        );

        viewAll.style.display = "none";

    });

    const rescheduleHTML = `

    <div class="modal fade"
         id="rescheduleModal"
         tabindex="-1">

        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">
                        Reschedule Appointment
                    </h5>

                    <button type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"></button>

                </div>

                <div class="modal-body">

                    <label class="form-label">
                        New Date
                    </label>

                    <input type="date"
                           class="form-control mb-3"
                           id="newDate">

                    <label class="form-label">
                        New Time
                    </label>

                    <input type="time"
                           class="form-control mb-3"
                           id="newTime">

                    <label class="form-label">
                        Reason
                    </label>

                    <textarea class="form-control mb-3"
                              id="reason"
                              rows="4"></textarea>

                    <button class="btn btn-primary w-100"
                            id="saveReschedule">
                        Save Changes
                    </button>

                </div>

            </div>
        </div>

    </div>

    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        rescheduleHTML
    );

    const rescheduleModal =
        new bootstrap.Modal(
            document.getElementById("rescheduleModal")
        );

    rescheduleBtns.forEach(btn => {

        btn.addEventListener("click", () => {
            rescheduleModal.show();
        });

    });

    document.addEventListener("click", (e) => {

        if (e.target.id === "saveReschedule") {

            const date =
                document.getElementById("newDate").value;

            const time =
                document.getElementById("newTime").value;

            const reason =
                document.getElementById("reason").value;

            if (
                date === "" ||
                time === "" ||
                reason === ""
            ) {
                alert("Complete all fields.");
                return;
            }

            alert(
                "Appointment rescheduled successfully."
            );

            rescheduleModal.hide();

        }

    });

    cancelBtns.forEach(btn => {

        btn.addEventListener("click", () => {

            const confirmCancel =
                confirm(
                    "Are you sure you want to cancel this booking?"
                );

            if (confirmCancel) {

                alert(
                    "Booking cancelled successfully."
                );

                btn.closest(".booking-card").remove();

            } else {

                alert(
                    "Booking cancellation aborted."
                );

            }

        });

    });

    const bookingHTML = `

    <div class="modal fade"
         id="bookingModal"
         tabindex="-1">

        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">
                        Start New Booking
                    </h5>

                    <button type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"></button>

                </div>

                <div class="modal-body">

                    <select class="form-select mb-3"
                            id="bookingService">

                        <option>
                            Select Service
                        </option>

                        <option>
                            General Medical
                        </option>

                        <option>
                            HIV VCT
                        </option>

                        <option>
                            Mental Health
                        </option>

                    </select>

                    <input type="date"
                           class="form-control mb-3"
                           id="bookingDate">

                    <input type="time"
                           class="form-control mb-3"
                           id="bookingTime">

                    <button class="btn btn-primary w-100"
                            id="confirmBooking">
                        Book Appointment
                    </button>

                </div>

            </div>
        </div>

    </div>

    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        bookingHTML
    );

    const bookingModal =
        new bootstrap.Modal(
            document.getElementById("bookingModal")
        );

    startBookingBtn.addEventListener("click", () => {
        bookingModal.show();
    });

    document.addEventListener("click", (e) => {

        if (e.target.id === "confirmBooking") {

            const service =
                document.getElementById("bookingService").value;

            const date =
                document.getElementById("bookingDate").value;

            const time =
                document.getElementById("bookingTime").value;

            if (
                service === "Select Service" ||
                date === "" ||
                time === ""
            ) {
                alert("Complete all booking fields.");
                return;
            }

            alert("Appointment booked successfully.");

            bookingModal.hide();
        }

    });

    tableLinks.forEach(link => {

        link.addEventListener("click", (e) => {

            e.preventDefault();

            const action = link.innerText;

            if (action === "Notes") {

                alert(
                    "Displaying consultation notes..."
                );
            }

            if (action === "Details") {

                alert(
                    "Displaying consultation details..."
                );
            }
            if (action === "Appeal") {

                alert(
                    "Opening appeal request form..."
                );

            }
        });
    });
});