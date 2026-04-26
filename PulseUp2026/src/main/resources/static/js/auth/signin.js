// Form elements
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");
const forgotBtn = document.getElementById("forgotPasswordBtn");

const errorBox = document.getElementById("error");
const successBox = document.getElementById("success");

// Password toggle
togglePassword.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        togglePassword.classList.add("fa-eye");
        togglePassword.classList.remove("fa-eye-slash");
    }
});

// login validation
form.addEventListener("submit", (e) => {
    e.preventDefault();

    errorBox.innerText = "";
    successBox.innerText = "";

    if (!email.value || !password.value) {
        errorBox.innerText = "Please fill in all fields";
        return;
    }

    successBox.innerText = "Sign in successful!";
});

// Forgot password
forgotBtn.addEventListener("click", () => {
    errorBox.innerText = "";
    successBox.innerText = "";

    if (!email.value) {
        errorBox.innerText = "Please enter your email first";
        return;
    }

    successBox.innerText = `Password reset link sent to ${email.value}`;
});