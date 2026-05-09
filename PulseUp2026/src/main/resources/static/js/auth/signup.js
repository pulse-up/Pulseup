/* ============================================================
   StudentSignUp.js – complete validation, UI interactions & redirect
   (separated JavaScript file – no mixing)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    // DOM element references
    const form = document.getElementById('signupStudentForm');
    const formContainer = document.getElementById('suFormContainer');
    const successScreen = document.getElementById('suSuccessScreen');
    const globalBanner = document.getElementById('globalErrBanner');
    const globalMsgSpan = document.getElementById('globalErrMsg');

    // inputs
    const fullNameInput = document.getElementById('fullNameStudent');
    const studentNumInput = document.getElementById('studentNumber');
    const emailInput = document.getElementById('emailStudent');
    const passwordInput = document.getElementById('passwordStudent');
    const confirmInput = document.getElementById('confirmPasswordStudent');
    const termsCheck = document.getElementById('termsCheckbox');

    // error spans
    const errFull = document.getElementById('errFullName');
    const errStudent = document.getElementById('errStudentNum');
    const errEmailSpan = document.getElementById('errEmail');
    const errPasswordSpan = document.getElementById('errPassword');
    const errConfirmSpan = document.getElementById('errConfirmPassword');
    const errTermsSpan = document.getElementById('errTerms');

    // password hints elements
    const hintsBox = document.getElementById('pwdHintsBox');
    const hintLength = document.getElementById('hintLength');
    const hintUpper = document.getElementById('hintUpper');
    const hintNumber = document.getElementById('hintNumber');

    // wrappers for border error styling
    const pwWrapper = document.getElementById('pwWrapper');
    const cpwWrapper = document.getElementById('cpwWrapper');

    // Helper: set inline error & border
    function setFieldError(errorSpan, message, inputWrapper = null) {
        if (!errorSpan) return;
        if (message) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'flex';
            if (inputWrapper) inputWrapper.classList.add('su-err-border');
        } else {
            errorSpan.style.display = 'none';
            errorSpan.textContent = '';
            if (inputWrapper) inputWrapper.classList.remove('su-err-border');
        }
    }

    function clearAllErrors() {
        setFieldError(errFull, '', fullNameInput);
        setFieldError(errStudent, '', studentNumInput);
        setFieldError(errEmailSpan, '', emailInput);
        setFieldError(errPasswordSpan, '', pwWrapper);
        setFieldError(errConfirmSpan, '', cpwWrapper);
        setFieldError(errTermsSpan, '', null);
        if (globalBanner) globalBanner.style.display = 'none';
    }

    function showGlobalError(msg) {
        globalMsgSpan.textContent = msg;
        globalBanner.style.display = 'flex';
        globalBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // live password hints update
    function updatePasswordHints() {
        const pwd = passwordInput.value;
        const lenOk = pwd.length >= 8;
        const upperOk = /[A-Z]/.test(pwd);
        const numOk = /[0-9]/.test(pwd);
        applyHint(hintLength, lenOk, 'circle-check', 'circle-xmark');
        applyHint(hintUpper, upperOk, 'circle-check', 'circle-xmark');
        applyHint(hintNumber, numOk, 'circle-check', 'circle-xmark');
    }

    function applyHint(element, isValid, okIcon, failIcon) {
        const icon = element.querySelector('i');
        if (isValid) {
            element.classList.add('hint-pass');
            element.classList.remove('hint-fail');
            icon.className = `fa fa-${okIcon}`;
        } else {
            element.classList.add('hint-fail');
            element.classList.remove('hint-pass');
            icon.className = `fa fa-${failIcon}`;
        }
    }

    // eye toggles
    function setupEyeToggle(btnId, targetId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(targetId);
        if (!btn || !input) return;
        btn.addEventListener('click', function (e) {
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
    setupEyeToggle('toggleConfirmEye', 'confirmPasswordStudent');

    // password hints events
    passwordInput.addEventListener('focus', function () {
        hintsBox.style.display = 'block';
        updatePasswordHints();
    });
    passwordInput.addEventListener('input', updatePasswordHints);
    passwordInput.addEventListener('blur', function () {
        if (!passwordInput.value) hintsBox.style.display = 'none';
    });

    // real-time blur validations for better UX
    fullNameInput.addEventListener('blur', function () {
        if (!fullNameInput.value.trim()) setFieldError(errFull, 'Full name is required', fullNameInput);
        else setFieldError(errFull, '', fullNameInput);
    });
    studentNumInput.addEventListener('blur', function () {
        if (!studentNumInput.value.trim()) setFieldError(errStudent, 'Student number is required', studentNumInput);
        else setFieldError(errStudent, '', studentNumInput);
    });
    emailInput.addEventListener('blur', function () {
        const email = emailInput.value.trim();
        if (!email) setFieldError(errEmailSpan, 'Email address is required', emailInput);
        else if (!email.endsWith('@mycput.ac.za')) setFieldError(errEmailSpan, 'Must be a valid @mycput.ac.za email', emailInput);
        else setFieldError(errEmailSpan, '', emailInput);
    });
    confirmInput.addEventListener('blur', function () {
        if (confirmInput.value && confirmInput.value !== passwordInput.value) setFieldError(errConfirmSpan, 'Passwords do not match', cpwWrapper);
        else if (!confirmInput.value && passwordInput.value) setFieldError(errConfirmSpan, 'Please confirm your password', cpwWrapper);
        else setFieldError(errConfirmSpan, '', cpwWrapper);
    });

    // FORM SUBMIT (full validation + success + redirect)
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearAllErrors();

        const fullName = fullNameInput.value.trim();
        const studentNum = studentNumInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPwd = confirmInput.value;
        const termsAccepted = termsCheck.checked;

        let isValid = true;

        if (!fullName) {
            setFieldError(errFull, 'Full name is required', fullNameInput);
            isValid = false;
        }
        if (!studentNum) {
            setFieldError(errStudent, 'Student number is required', studentNumInput);
            isValid = false;
        }
        if (!email) {
            setFieldError(errEmailSpan, 'Email address is required', emailInput);
            isValid = false;
        } else if (!email.endsWith('@mycput.ac.za')) {
            setFieldError(errEmailSpan, 'Use a valid @mycput.ac.za address', emailInput);
            isValid = false;
        }

        if (!password) {
            setFieldError(errPasswordSpan, 'Password is required', pwWrapper);
            isValid = false;
        } else if (password.length < 8) {
            setFieldError(errPasswordSpan, 'Password must be at least 8 characters', pwWrapper);
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            setFieldError(errPasswordSpan, 'Password must contain an uppercase letter', pwWrapper);
            isValid = false;
        } else if (!/[0-9]/.test(password)) {
            setFieldError(errPasswordSpan, 'Password must contain a number', pwWrapper);
            isValid = false;
        } else {
            setFieldError(errPasswordSpan, '', pwWrapper);
        }

        if (!confirmPwd) {
            setFieldError(errConfirmSpan, 'Confirm your password', cpwWrapper);
            isValid = false;
        } else if (confirmPwd !== password) {
            setFieldError(errConfirmSpan, 'Passwords do not match', cpwWrapper);
            isValid = false;
        } else {
            setFieldError(errConfirmSpan, '', cpwWrapper);
        }

        if (!termsAccepted) {
            setFieldError(errTermsSpan, 'You must accept the Privacy Policy and campus health terms.', null);
            isValid = false;
        } else {
            setFieldError(errTermsSpan, '', null);
        }

        if (!isValid) {
            showGlobalError('Please fix the highlighted errors before continuing.');
            return;
        }

        // SUCCESS: hide form, show success screen and redirect to sign in
        hintsBox.style.display = 'none';
        formContainer.style.display = 'none';
        successScreen.style.display = 'block';

        setTimeout(function () {
            window.location.href = 'StudentSignin.html';
        }, 2800);
    });

    // Navigation handlers
    const homeBtn = document.getElementById('homeNavBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    const signInRedirect = document.getElementById('signInRedirectLink');
    if (signInRedirect) {
        signInRedirect.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'StudentSignin.html';
        });
    }

    const policyLink = document.getElementById('policyLink');
    if (policyLink) {
        policyLink.addEventListener('click', function (e) {
            e.preventDefault();
            alert('Privacy Policy: Your health data is handled under CPUT campus guidelines.');
        });
    }
});