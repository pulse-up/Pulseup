document.addEventListener("DOMContentLoaded", () => {

    const gearIcon =
        document.getElementById("settingsIcon");

    const submitBtn =
        document.querySelector("form .btn-primary");

    const quickRequestBtn =
        document.querySelector(".quick-card .btn-dark");

    const actionLinks =
        document.querySelectorAll("tbody a");

    const settingsHTML = `

    <div class="modal fade"
         id="settingsModal"
         tabindex="-1">

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

                    <button class="btn btn-primary w-100"
                            id="saveSettings">
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

    document.addEventListener("click", (e) => {

        if (e.target.id === "saveSettings") {

            alert(
                "Profile settings updated successfully."
            );

            settingsModal.hide();
        }

    });

    submitBtn.addEventListener("click", (e) => {

        e.preventDefault();

        const hospital =
            document.querySelector(
                'input[type="text"]'
            ).value;

        const reason =
            document.querySelector(
                "textarea"
            ).value;

        const dates =
            document.querySelectorAll(
                'input[type="date"]'
            );

        const fromDate =
            dates[0].value;

        const toDate =
            dates[1].value;

        if (
            hospital === "" ||
            reason === "" ||
            fromDate === "" ||
            toDate === ""
        ) {

            alert(
                "Please complete all fields."
            );

            return;
        }

        alert(
            "Sick note request submitted successfully."
        );

        document.querySelector("form").reset();

    });

    quickRequestBtn.addEventListener("click", () => {

        const confirmRequest =
            confirm(
                "Generate sick note from your last consultation?"
            );

        if (confirmRequest) {

            alert(
                "Quick sick note request generated successfully."
            );

        }
    });
    actionLinks.forEach(link => {

        link.addEventListener("click", (e) => {

            e.preventDefault();

            const action =
                link.innerText;

            if (action === "Download") {

                const confirmDownload =
                    confirm(
                        "Are you sure you want to download this sick note?"
                    );

                if (confirmDownload) {

                    alert(
                        "Sick note downloaded successfully."
                    );

                }
            }

            if (action === "Track") {

                const confirmTrack =
                    confirm(
                        "Track this request status?"
                    );

                if (confirmTrack) {

                    alert(
                        "Status: Pending medical review."
                    );

                }
            }
            if (action === "Details") {

                const confirmDetails =
                    confirm(
                        "Open rejection details?"
                    );

                if (confirmDetails) {

                    alert(
                        "Reason: Supporting documents were incomplete."
                    );
                }

            }

        });

    });

});