document.addEventListener("DOMContentLoaded", function () {

    const bellIcon = document.getElementById("bellIcon");
    const notificationBox = document.getElementById("notificationBox");
    const notifCount = document.getElementById("notifCounting");
    const wrapper = document.querySelector(".notification-container");

    if (bellIcon && notificationBox) {

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
    }
    const viewButtons = document.querySelectorAll(".view-btn");

    const modalType = document.getElementById("modalType");
    const modalCategory = document.getElementById("modalCategory");
    const modalDoctor = document.getElementById("modalDoctor");
    const modalDate = document.getElementById("modalDate");
    const modalStatus = document.getElementById("modalStatus");
    const modalNotes = document.getElementById("modalNotes");

    const modalElement = document.getElementById("viewHistoryModal");

    if (modalElement) {

        const historyModal = new bootstrap.Modal(modalElement);

        viewButtons.forEach(button => {

            button.addEventListener("click", function () {

                modalType.value = this.dataset.type;
                modalCategory.value = this.dataset.category;
                modalDoctor.value = this.dataset.doctor;
                modalDate.value = this.dataset.date;
                modalStatus.value = this.dataset.status;
                modalNotes.value = this.dataset.notes;

                historyModal.show();
            });
        });
    }

});