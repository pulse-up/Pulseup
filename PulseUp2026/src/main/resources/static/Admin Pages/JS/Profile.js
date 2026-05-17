document.addEventListener("DOMContentLoaded", () => {

    const editBtn =
        document.getElementById("editProfileBtn");

    const modal =
        document.getElementById("editModal");

    const closeModal =
        document.getElementById("closeModal");

    if (editBtn) {

        editBtn.addEventListener("click", () => {

            modal.classList.remove("d-none");
        });
    }
    if (closeModal) {

        closeModal.addEventListener("click", () => {

            modal.classList.add("d-none");
        });
    }
    window.addEventListener("click", (e) => {

        if (e.target === modal) {

            modal.classList.add("d-none");
        }

    });
    const bellIcon =
        document.getElementById("bellIcon");

    const notificationBox =
        document.getElementById("notificationBox");

    if (bellIcon) {

        bellIcon.addEventListener("click", () => {

            notificationBox.classList.toggle("d-none");

        });

    }
});