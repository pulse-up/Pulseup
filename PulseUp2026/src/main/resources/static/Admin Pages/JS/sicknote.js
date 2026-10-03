document.addEventListener("DOMContentLoaded", function () {

    const bellIcon = document.getElementById("bellIcon");
    const notificationBox = document.getElementById("notificationBox");
    const notifCount = document.getElementById("notifCounting");

    let isOpen = false;

    if (bellIcon && notificationBox) {

        bellIcon.addEventListener("click", function (e) {
            e.stopPropagation();

            isOpen = !isOpen;

            if (isOpen) {

                notificationBox.style.display = "block";

                if (notifCount) {
                    notifCount.style.display = "none";
                }
            } else {

                notificationBox.style.display = "none";
            }
        });

        document.addEventListener("click", function () {

            isOpen = false;
            notificationBox.style.display = "none";
        });

        notificationBox.addEventListener("click", function (e) {
            e.stopPropagation();
        });
    }
    const viewButtons = document.querySelectorAll(".view-btn");

    const patientField = document.getElementById("modalPatient");
    const reasonField = document.getElementById("modalReason");
    const durationField = document.getElementById("modalDuration");
    const statusField = document.getElementById("modalStatus");
    const notesField = document.getElementById("modalNotes");

    const modalElement = document.getElementById("viewSickNoteModal");

    if (modalElement) {

        const sickModal = new bootstrap.Modal(modalElement);

        viewButtons.forEach(button => {

            button.addEventListener("click", function () {

                patientField.value = this.dataset.patient;
                reasonField.value = this.dataset.reason;
                durationField.value = this.dataset.duration;
                statusField.value = this.dataset.status;
                notesField.value = this.dataset.notes;

                sickModal.show();
            });
        });
    }
});