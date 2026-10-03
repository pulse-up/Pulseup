document.addEventListener("DOMContentLoaded", function () {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        document.documentElement.setAttribute(
            "data-bs-theme",
            savedTheme
        );
    }

    const settingsIcon =
        document.getElementById("settingsIcon");

    const settingsModalElement =
        document.getElementById("settingsModal");

    if (settingsIcon && settingsModalElement) {

        const settingsModal =
            new bootstrap.Modal(settingsModalElement);

        settingsIcon.addEventListener("click", function () {

            settingsModal.show();

        });
    }

    const lightBtn =
        document.getElementById("lightModeBtn");

    const darkBtn =
        document.getElementById("darkModeBtn");

    if (lightBtn) {

        lightBtn.addEventListener("click", function () {

            document.documentElement.setAttribute(
                "data-bs-theme",
                "light"
            );

            localStorage.setItem(
                "theme",
                "light"
            );

        });
    }

    if (darkBtn) {

        darkBtn.addEventListener("click", function () {

            document.documentElement.setAttribute(
                "data-bs-theme",
                "dark"
            );

            localStorage.setItem(
                "theme",
                "dark"
            );

        });
    }

});