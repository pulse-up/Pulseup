document.addEventListener("DOMContentLoaded", function () {

    var form       = document.getElementById("adminLoginForm");
    var errorBox   = document.getElementById("error");
    var successBox = document.getElementById("success");

    // ── Eye toggle ────────────────────────────────────────────
    document.querySelectorAll(".eye").forEach(function (span) {
        span.addEventListener("click", function () {
            var input = document.getElementById(span.getAttribute("data-target"));
            var icon  = span.querySelector("i");
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    });

    // ── Submit ────────────────────────────────────────────────
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var email    = document.getElementById("email").value.trim();
        var password = document.getElementById("password").value;

        errorBox.style.display   = "none";
        successBox.style.display = "none";

        if (!email || !password) {
            showError("Please fill in all fields.");
            return;
        }

        if (!/^[a-zA-Z0-9._%+\-]+@cput\.ac\.za$/.test(email)) {
            showError("Please use a valid CPUT staff email (@cput.ac.za).");
            return;
        }

        if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
            showError("Password must be at least 8 characters with letters and numbers.");
            return;
        }

        // Success
        form.style.display = "none";
        successBox.innerHTML = "<i class='fa fa-circle-check'></i> Login successful! Redirecting...";
        successBox.style.display = "block";

        setTimeout(function () {
            window.location.href = "AdminProfile.html";
        }, 1500);
    });

    // ── Forgot Password ───────────────────────────────────────
    var forgotLink = document.getElementById("forgotPassword");
    if (forgotLink) {
        forgotLink.addEventListener("click", function (e) {
            e.preventDefault();

            errorBox.style.display = "none";

            var email     = document.getElementById("email").value.trim();
            var forgotMsg = document.getElementById("forgotMsg");

            if (!forgotMsg) {
                forgotMsg = document.createElement("div");
                forgotMsg.id = "forgotMsg";
                forgotLink.closest(".row").insertAdjacentElement("afterend", forgotMsg);
            }

            if (!email) {
                forgotMsg.className = "msg error";
                forgotMsg.innerHTML =
                    "<i class='fa fa-circle-exclamation'></i> " +
                    "Please enter your email address first.";
            } else if (!/^[a-zA-Z0-9._%+\-]+@cput\.ac\.za$/.test(email)) {
                forgotMsg.className = "msg error";
                forgotMsg.innerHTML =
                    "<i class='fa fa-circle-exclamation'></i> " +
                    "Please enter a valid CPUT email (@cput.ac.za).";
            } else {
                forgotMsg.className = "msg forgot";
                forgotMsg.innerHTML =
                    "<i class='fa fa-circle-check'></i> " +
                    "Password reset link sent to <strong>" + email + "</strong>";
            }

            forgotMsg.style.display = "flex";
        });
    }

    // ── Helper ────────────────────────────────────────────────
    function showError(msg) {
        errorBox.innerHTML     = "<i class='fa fa-circle-exclamation'></i> " + msg;
        errorBox.style.display = "block";
    }
});