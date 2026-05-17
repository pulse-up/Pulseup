document.addEventListener("DOMContentLoaded", function () {

    const bellIcon = document.getElementById("bellIcon");
    const notificationBox = document.getElementById("notificationBox");
    const wrapper = document.getElementById("notificationWrapper");
    const notifCount = document.getElementById("notifCounting");

    if (!bellIcon || !notificationBox || !wrapper) {
        console.error("Notification elements not found");
        return;
    }

    let isOpen = false;

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

    notificationBox.style.display = "none";
});