document.addEventListener("DOMContentLoaded", function () {

    const form            = document.getElementById("signupForm");
    const errorBox        = document.getElementById("error");
    const successBox      = document.getElementById("success");
    const passwordInput   = document.getElementById("password");
    const passwordHint    = document.getElementById("passwordHint");

    // ── Eye toggle ────────────────────────────────────────────────
    document.querySelectorAll(".eye").forEach(function (span) {
        span.addEventListener("click", function () {
            var targetId = span.getAttribute("data-target");
            var input    = document.getElementById(targetId);
            var icon     = span.querySelector("i");

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });
    });

    // ── Live password hints ───────────────────────────────────────
    passwordInput.addEventListener("focus", function () {
        passwordHint.style.display = "block";
    });

    passwordInput.addEventListener("input", function () {
        var val = passwordInput.value;
        updateHint("hintLength", val.length >= 6);
        updateHint("hintUpper",  /[A-Z]/.test(val));
        updateHint("hintNumber", /[0-9]/.test(val));
    });

    passwordInput.addEventListener("blur", function () {
        if (passwordInput.value === "") {
            passwordHint.style.display = "none";
        }
    });

    function updateHint(id, passed) {
        var li   = document.getElementById(id);
        var icon = li.querySelector("i");
        if (passed) {
            li.classList.add("hint-pass");
            li.classList.remove("hint-fail");
            icon.className = "fa fa-circle-check";
        } else {
            li.classList.remove("hint-pass");
            li.classList.add("hint-fail");
            icon.className = "fa fa-circle-xmark";
        }
    }

    // ── Form submit ───────────────────────────────────────────────
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var fullName        = document.getElementById("fullName").value.trim();
        var studentNumber   = document.getElementById("studentNumber").value.trim();
        var email           = document.getElementById("email").value.trim();
        var password        = passwordInput.value;
        var confirmPassword = document.getElementById("confirmPassword").value;

        errorBox.style.display   = "none";
        successBox.style.display = "none";

        if (!fullName || !studentNumber || !email || !password || !confirmPassword) {
            showError("Please fill in all fields.");
            return;
        }

        if (!email.endsWith("@mycput.ac.za")) {
            showError("Please use a valid CPUT email address (@mycput.ac.za).");
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            showError("Password must contain at least one uppercase letter.");
            return;
        }

        if (!/[0-9]/.test(password)) {
            showError("Password must contain at least one number.");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        // Hide form, show success — success is OUTSIDE the form so it stays visible
        passwordHint.style.display = "none";
        form.style.display         = "none";

        successBox.innerHTML = "<i class='fa fa-circle-check'></i> Account created successfully! Redirecting to sign in...";
        successBox.style.display = "block";

        setTimeout(function () {
            window.location.href = "StudentSignin.html";
        }, 2500);
    });

    function showError(msg) {
        errorBox.innerText     = msg;
        errorBox.style.display = "block";
    }
});