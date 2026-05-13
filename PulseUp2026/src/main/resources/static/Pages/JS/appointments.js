document.addEventListener("DOMContentLoaded", function () {

    const viewAll = document.getElementById("viewAllAppointments");

    if (viewAll) {
        viewAll.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "/appointments/all";
        });
    }
    document.querySelectorAll(".attend-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const id = this.dataset.id;

            this.innerText = "Attending...";
            this.disabled = true;

            console.log("Attend appointment:", id);
        });
    });
    document.querySelectorAll(".reschedule-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const id = this.dataset.id;

            console.log("Reschedule:", id);

            window.location.href = `/reschedule.html?id=${id}`;
        });
    });
    document.querySelectorAll(".details-link").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            const id = this.dataset.id;

            window.location.href = `/consultation/details/${id}`;
        });
    });
    const bellIcon = document.getElementById("bellIcon");
    const notificationBox = document.getElementById("notificationBox");
    const notifCount = document.getElementById("notifCount");

    if (bellIcon && notificationBox) {

        bellIcon.addEventListener("click", function (e) {
            e.stopPropagation(); // prevent bubbling

            notificationBox.classList.toggle("d-none");

            if (notifCount) {
                notifCount.style.display = "none";
            }
        });
        document.addEventListener("click", function (e) {
            if (!notificationBox.contains(e.target) && e.target !== bellIcon) {
                notificationBox.classList.add("d-none");
            }
        });
    }
});