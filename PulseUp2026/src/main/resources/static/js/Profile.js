function navigate(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    event.target.classList.add("active");
}
function navigate(page) {

    const content = document.getElementById("app-content");

    if (page === "profile") {
        content.innerHTML = `
            <h4>Profile</h4>

            <div class="card p-3 shadow-sm">
                <p><strong>Name:</strong> Dr Inga Plati</p>
                <p><strong>Email:</strong> inga@email.com</p>

                <button class="btn btn-primary mt-3" onclick="openEditModal()">
                    Edit Profile
                </button>
            </div>
        `;
    }

    if (page === "settings") {
        content.innerHTML = `
            <h4>Settings</h4>

            <div class="card p-3 shadow-sm mb-3">
                <h6>Account</h6>
                <input class="form-control mb-2" placeholder="Email">
                <button class="btn btn-primary">Save</button>
            </div>

            <div class="card p-3 shadow-sm">
                <h6>Appearance</h6>
                <button class="btn btn-outline-dark me-2" onclick="setTheme('light')">Light</button>
                <button class="btn btn-dark" onclick="setTheme('dark')">Dark</button>
            </div>
        `;
    }
}

/* Theme Switch */
function setTheme(mode) {
    document.documentElement.setAttribute("data-bs-theme", mode);
}

/* Default page */
navigate("profile");