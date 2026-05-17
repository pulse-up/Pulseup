document.addEventListener("DOMContentLoaded", () => {

    const gearIcon =
        document.getElementById("settingsIcon");

    const filterBtn =
        document.getElementById("applyFilters");

    const filterType =
        document.getElementById("filterType");

    const filterDate =
        document.getElementById("filterDate");

    const rows =
        document.querySelectorAll("tbody tr");

    const tableLinks =
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

    filterBtn.addEventListener("click", () => {

        const selectedType =
            filterType.value;

        const selectedDate =
            filterDate.value;

        rows.forEach(row => {

            const type =
                row.cells[0].innerText;

            const date =
                row.cells[2].innerText;

            let showRow = true;

            if (
                selectedType !== "All Types" &&
                type !== selectedType
            ) {
                showRow = false;
            }

            if (selectedDate !== "") {

                const rowDate =
                    new Date(date);

                const chosenDate =
                    new Date(selectedDate);

                if (
                    rowDate.toDateString() !==
                    chosenDate.toDateString()
                ) {
                    showRow = false;
                }

            }

            row.style.display =
                showRow ? "" : "none";

        });

    });

    tableLinks.forEach(link => {

        link.addEventListener("click", (e) => {

            e.preventDefault();

            const action =
                link.innerText;

            if (action === "View Notes") {

                const notesModal = `

                <div class="modal fade"
                     id="notesModal"
                     tabindex="-1">

                    <div class="modal-dialog">
                        <div class="modal-content">

                            <div class="modal-header">

                                <h5 class="modal-title">
                                    Consultation Notes
                                </h5>

                                <button type="button"
                                        class="btn-close"
                                        data-bs-dismiss="modal"></button>
                            </div>

                            <div class="modal-body">

                                Patient responded well to treatment.
                                Follow-up recommended after 2 weeks.

                            </div>

                        </div>
                    </div>

                </div>

                `;

                document.body.insertAdjacentHTML(
                    "beforeend",
                    notesModal
                );

                new bootstrap.Modal(
                    document.getElementById("notesModal")
                ).show();

            }

            if (action === "Details") {

                const detailsModal = `

                <div class="modal fade"
                     id="detailsModal"
                     tabindex="-1">

                    <div class="modal-dialog">
                        <div class="modal-content">

                            <div class="modal-header">

                                <h5 class="modal-title">
                                    Vaccination Details
                                </h5>

                                <button type="button"
                                        class="btn-close"
                                        data-bs-dismiss="modal"></button>

                            </div>

                            <div class="modal-body">

                                Flu vaccination completed successfully
                                at City Health Center.

                            </div>

                        </div>
                    </div>

                </div>

                `;

                document.body.insertAdjacentHTML(
                    "beforeend",
                    detailsModal
                );

                new bootstrap.Modal(
                    document.getElementById("detailsModal")
                ).show();

            }

            if (action === "Download") {

                const download =
                    confirm(
                        "Download prescription document?"
                    );

                if (download) {

                    alert(
                        "Prescription downloaded successfully."
                    );

                }

            }

        });

    });

});