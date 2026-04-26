document.addEventListener("DOMContentLoaded", function () {

    var errorBox      = document.getElementById("error");
    var successBox    = document.getElementById("success");
    var passwordInput = document.getElementById("password");
    var passwordHint  = document.getElementById("passwordHint");

    var step1 = document.getElementById("step1");
    var step2 = document.getElementById("step2");

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

    // ── Live password hints ───────────────────────────────────
    passwordInput.addEventListener("focus", function () {
        passwordHint.style.display = "block";
    });

    passwordInput.addEventListener("input", function () {
        var val = passwordInput.value;
        updateHint("hintLength", val.length >= 8);
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

    // ── Next button (Step 1 → Step 2) ────────────────────────
    document.getElementById("nextBtn").addEventListener("click", function () {

        var fullName    = document.getElementById("fullName").value.trim();
        var staffNumber = document.getElementById("staffNumber").value.trim();
        var email       = document.getElementById("email").value.trim();
        var role        = document.getElementById("role").value;

        errorBox.style.display = "none";

        if (!fullName || !staffNumber || !email || !role) {
            showError("Please fill in all fields.");
            return;
        }

        if (!/^[a-zA-Z0-9._%+\-]+@cput\.ac\.za$/.test(email)) {
            showError("Please use a valid CPUT staff email (@cput.ac.za).");
            return;
        }

        // Move to step 2
        step1.style.display = "none";
        step2.style.display = "block";
        errorBox.style.display = "none";

        // Update step indicator
        document.getElementById("stepDot1").classList.remove("active");
        document.getElementById("stepDot1").classList.add("done");
        document.getElementById("stepDot2").classList.add("active");
    });

    // ── Back button (Step 2 → Step 1) ────────────────────────
    document.getElementById("backBtn").addEventListener("click", function () {
        step2.style.display = "none";
        step1.style.display = "block";
        errorBox.style.display = "none";

        // Reset step indicator
        document.getElementById("stepDot2").classList.remove("active");
        document.getElementById("stepDot1").classList.remove("done");
        document.getElementById("stepDot1").classList.add("active");
    });

    // ── Submit (Step 2) ───────────────────────────────────────
    document.getElementById("submitBtn").addEventListener("click", function () {

        var password        = passwordInput.value;
        var confirmPassword = document.getElementById("confirmPassword").value;

        errorBox.style.display   = "none";
        successBox.style.display = "none";

        if (!password || !confirmPassword) {
            showError("Please fill in both password fields.");
            return;
        }

        if (password.length < 8) {
            showError("Password must be at least 8 characters.");
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

        // Success
        passwordHint.style.display = "none";
        step2.style.display        = "none";

        successBox.innerHTML =
            "<i class='fa fa-circle-check'></i> " +
            "Account created successfully! Redirecting to login...";
        successBox.style.display = "block";

        setTimeout(function () {
            window.location.href = "AdminLogin.html";
        }, 2000);
    });

    // ── Helper ────────────────────────────────────────────────
    function showError(msg) {
        errorBox.innerHTML     = "<i class='fa fa-circle-exclamation'></i> " + msg;
        errorBox.style.display = "block";
    }
});