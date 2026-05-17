document.addEventListener("DOMContentLoaded", function () {

    const viewAll = document.getElementById("viewAllAppointments");

    // =========================
    // VIEW ALL
    // =========================

    if (viewAll) {

        viewAll.addEventListener("click", function (e) {

            e.preventDefault();

            window.location.href = "/appointments/all";

        });

    }

    // =========================
    // ATTEND BUTTON
    // =========================

    document.querySelectorAll(".attend-btn").forEach(btn => {

        btn.addEventListener("click", function () {

            const id = this.dataset.id;

            this.innerText = "Attending...";
            this.disabled = true;

            console.log("Attend appointment:", id);

        });

    });

    // =========================
    // RESCHEDULE BUTTON
    // =========================

    document.querySelectorAll(".reschedule-btn").forEach(btn => {

        btn.addEventListener("click", function () {

            const id = this.dataset.id;

            console.log("Reschedule:", id);

            // OPEN MODAL
            const modal =
                new bootstrap.Modal(
                    document.getElementById("rescheduleModal")
                );

            modal.show();

        });

    });

    // =========================
    // SAVE RESCHEDULE
    // =========================

    const saveRescheduleBtn =
        document.getElementById("saveRescheduleBtn");

    if (saveRescheduleBtn) {

        saveRescheduleBtn.addEventListener("click", function () {

            alert("Appointment rescheduled successfully.");

            const modal =
                bootstrap.Modal.getInstance(
                    document.getElementById("rescheduleModal")
                );

            modal.hide();

        });

    }

    // =========================
    // DETAILS LINK
    // =========================

    document.querySelectorAll(".details-link").forEach(link => {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            const id = this.dataset.id;

            window.location.href =
                `/consultation/details/${id}`;

        });

    });

    // =========================
    // NOTIFICATION BELL
    // =========================

    const bellIcon =
        document.getElementById("bellIcon");

    const notificationBox =
        document.getElementById("notificationBox");

    const notifCount =
        document.getElementById("notifCount");

    const wrapper =
        document.getElementById("notificationWrapper");

    if (
        bellIcon &&
        notificationBox &&
        wrapper
    ) {

        bellIcon.addEventListener("click", function (e) {

            e.stopPropagation();

            notificationBox.classList.toggle("d-none");

            if (notifCount) {

                notifCount.style.display = "none";

            }

        });

        document.addEventListener("click", function (e) {

            if (!wrapper.contains(e.target)) {

                notificationBox.classList.add("d-none");

            }

        });

        notificationBox.addEventListener("click", function (e) {

            e.stopPropagation();

        });

    }

});