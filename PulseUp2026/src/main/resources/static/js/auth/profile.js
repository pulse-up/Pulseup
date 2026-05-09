document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('studentProfileForm');
    const nameInput = document.getElementById('fullNameInput');
    const emailInput = document.querySelector('input[name="email"]');
    const headingName = document.getElementById('userNameDisplay');
    const avatarDisplay = document.getElementById('avatarDisplay');
    const navAvatar = document.getElementById('navAvatar');

    // --- NEW: FETCH DATA FROM SIGN IN ---
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName'); // If you saved name in Sign In

    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
    }

    if (savedName) {
        nameInput.value = savedName;
        updateUI(savedName); // Run the initials logic immediately
    }

    // --- DYNAMIC INITIALS LOGIC ---
    function updateUI(fullName) {
        headingName.textContent = fullName || "New Student Profile";
        if (fullName.trim()) {
            const parts = fullName.trim().split(' ').filter(p => p.length > 0);
            const initials = parts.length > 1
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : parts[0][0].toUpperCase();
            avatarDisplay.textContent = initials;
            navAvatar.textContent = initials;
        } else {
            avatarDisplay.textContent = "??";
            navAvatar.textContent = "??";
        }
    }

    nameInput.addEventListener('input', (e) => updateUI(e.target.value));

    // --- PHOTO UPLOAD ---
    document.getElementById('fileInput').onchange = (e) => {
        const [file] = e.target.files;
        if (file) {
            const imgUrl = URL.createObjectURL(file);
            const imgTag = `<img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">`;
            avatarDisplay.innerHTML = imgTag;
            navAvatar.innerHTML = imgTag;
        }
    };
});