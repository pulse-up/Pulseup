/* ============================================================
   signin.js – Complete validation for student sign in
   ============================================================ */

(function() {
    // DOM element references
    const form = document.getElementById('signinForm');
    const formContainer = document.getElementById('siFormContainer');
    const successScreen = document.getElementById('siSuccessScreen');
    const globalBanner = document.getElementById('globalErrBanner');
    const globalMsgSpan = document.getElementById('globalErrMsg');

    // inputs
    const emailInput = document.getElementById('emailStudent');
    const passwordInput = document.getElementById('passwordStudent');
    const rememberCheckbox = document.getElementById('rememberCheckbox');

    // error spans
    const errEmailSpan = document.getElementById('errEmail');
    const errPasswordSpan = document.getElementById('errPassword');

    // wrappers for border error styling
    const pwWrapper = document.getElementById('pwWrapper');

    // Helper: set inline error & border
    function setFieldError(errorSpan, message, inputWrapper = null) {
        if (!errorSpan) return;
        if (message) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'flex';
            if (inputWrapper) inputWrapper.classList.add('si-err-border');
        } else {
            errorSpan.style.display = 'none';
            errorSpan.textContent = '';
            if (inputWrapper) inputWrapper.classList.remove('si-err-border');
        }
    }

    function clearAllErrors() {
        setFieldError(errEmailSpan, '', emailInput);
        setFieldError(errPasswordSpan, '', pwWrapper);
        if (globalBanner) globalBanner.style.display = 'none';
    }

    function showGlobalError(msg) {
        globalMsgSpan.textContent = msg;
        globalBanner.style.display = 'flex';
        globalBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // eye toggle for password
    function setupEyeToggle(btnId, targetId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(targetId);
        if (!btn || !input) return;
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            const icon = btn.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    setupEyeToggle('togglePwdEye', 'passwordStudent');

    // Forgot password handler
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearAllErrors();

            const email = emailInput.value.trim();
            if (!email) {
                setFieldError(errEmailSpan, 'Please enter your email address first', emailInput);
                showGlobalError('Enter your CPUT email to reset password.');
                emailInput.focus();
                return;
            }
            if (!email.endsWith('@mycput.ac.za')) {
                setFieldError(errEmailSpan, 'Must be a valid @mycput.ac.za email', emailInput);
                showGlobalError('Please use a valid CPUT email address.');
                return;
            }

            // Simulate password reset
            alert(`Password reset link has been sent to ${email}. Check your inbox.`);
        });
    }

    // Real-time blur validations
    emailInput.addEventListener('blur', function() {
        const email = emailInput.value.trim();
        if (!email) {
            setFieldError(errEmailSpan, 'Email address is required', emailInput);
        } else if (!email.endsWith('@mycput.ac.za')) {
            setFieldError(errEmailSpan, 'Must be a valid @mycput.ac.za email', emailInput);
        } else {
            setFieldError(errEmailSpan, '', emailInput);
        }
    });

    passwordInput.addEventListener('blur', function() {
        if (!passwordInput.value) {
            setFieldError(errPasswordSpan, 'Password is required', pwWrapper);
        } else {
            setFieldError(errPasswordSpan, '', pwWrapper);
        }
    });

    // FORM SUBMIT (full validation + success + redirect)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearAllErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberDevice = rememberCheckbox ? rememberCheckbox.checked : false;

        let isValid = true;

        // Validate email
        if (!email) {
            setFieldError(errEmailSpan, 'Email address is required', emailInput);
            isValid = false;
        } else if (!email.endsWith('@mycput.ac.za')) {
            setFieldError(errEmailSpan, 'Use a valid @mycput.ac.za address', emailInput);
            isValid = false;
        }

        // Validate password
        if (!password) {
            setFieldError(errPasswordSpan, 'Password is required', pwWrapper);
            isValid = false;
        } else if (password.length < 3) {
            setFieldError(errPasswordSpan, 'Password must be at least 3 characters', pwWrapper);
            isValid = false;
        }

        if (!isValid) {
            showGlobalError('Please fix the highlighted errors before continuing.');
            return;
        }

        // Handle "Remember this device" - store in localStorage
        if (rememberDevice) {
            localStorage.setItem('pulseup_remembered_email', email);
        } else {
            localStorage.removeItem('pulseup_remembered_email');
        }

        // SUCCESS: hide form, show success screen and redirect to dashboard
        formContainer.style.display = 'none';
        successScreen.style.display = 'block';

        // Redirect to student dashboard after 2.8 seconds
        setTimeout(function() {
            window.location.href = '/student-dashboard.html';
        }, 2800);
    });

    // Navigation handlers
    const homeBtn = document.getElementById('homeNavBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/index.html';
        });
    }

    const signUpLink = document.getElementById('signUpRedirectLink');
    if (signUpLink) {
        signUpLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/StudentSignup.html';
        });
    }

    // Auto-fill remembered email if exists
    const rememberedEmail = localStorage.getItem('pulseup_remembered_email');
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
})();