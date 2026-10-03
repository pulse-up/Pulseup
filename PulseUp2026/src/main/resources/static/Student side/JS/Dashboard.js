document.addEventListener("DOMContentLoaded", () => {

    const gearIcon = document.getElementById("settingsIcon");
    const bookBtn = document.querySelector(".btn-main");
    const generateBtn = document.querySelectorAll(".btn-main")[1];
    const viewServices = document.getElementById("viewServices");
    const medicalHistory = document.querySelector(".right-card a");

    const settingsModal = `

    <div class="modal fade" id="settingsModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">Profile Settings</h5>
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
                        <label class="form-label">Full Name</label>
                        <input type="text"
                               class="form-control"
                               id="profileName"
                               value="Matinisa Lubisi">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email"
                               class="form-control"
                               id="profileEmail"
                               placeholder="Enter email">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Phone Number</label>
                        <input type="text"
                               class="form-control"
                               id="profilePhone"
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
                            id="saveProfileBtn">
                        Save Changes
                    </button>

                </div>

            </div>
        </div>
    </div>

    `;

    document.body.insertAdjacentHTML("beforeend", settingsModal);

    const settings = new bootstrap.Modal(
        document.getElementById("settingsModal")
    );

    gearIcon.addEventListener("click", () => {
        settings.show();
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

    document.addEventListener("click", (e) => {

        if (e.target.id === "saveProfileBtn") {

            const name = document.getElementById("profileName").value;

            if (name === "") {
                alert("Name cannot be empty.");
                return;
            }

            document.querySelector("strong").innerText = name;

            alert("Profile updated successfully.");

            settings.hide();
        }

    });

    bookBtn.addEventListener("click", () => {

        const service = document.querySelector("select").value;
        const date = document.querySelector('input[type="date"]').value;
        const time = document.querySelector('input[type="time"]').value;

        if (
            service === "Select Service" ||
            date === "" ||
            time === ""
        ) {
            alert("Please complete all fields.");
            return;
        }

        alert(`Appointment booked for ${service}`);
    });

    viewServices.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "services.html";
    });

    const requestModalHTML = `

    <div class="modal fade" id="requestModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">
                        Generate Medical Request
                    </h5>

                    <button type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">

                    <input type="text"
                           class="form-control mb-3"
                           id="hospitalName"
                           placeholder="Hospital Name">

                    <textarea class="form-control mb-3"
                              id="requestReason"
                              rows="4"
                              placeholder="Reason"></textarea>

                    <button class="btn btn-primary w-100"
                            id="submitRequest">
                        Submit Request
                    </button>

                </div>

            </div>
        </div>
    </div>

    `;

    document.body.insertAdjacentHTML("beforeend", requestModalHTML);

    const requestModal = new bootstrap.Modal(
        document.getElementById("requestModal")
    );

    generateBtn.addEventListener("click", () => {
        requestModal.show();
    });

    document.addEventListener("click", (e) => {

        if (e.target.id === "submitRequest") {

            const hospital =
                document.getElementById("hospitalName").value;

            const reason =
                document.getElementById("requestReason").value;

            if (hospital === "" || reason === "") {
                alert("Complete all fields.");
                return;
            }

            alert("Request generated successfully.");

            requestModal.hide();
        }

    });
    medicalHistory.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "history.html";
    });
});