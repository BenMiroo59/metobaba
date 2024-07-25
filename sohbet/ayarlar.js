document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
});

function loadSettings() {
    const usernameInput = document.getElementById("username-input");
    const profilePicInput = document.getElementById("profile-pic-input");
    const profilePicPreview = document.getElementById("profile-pic-preview");

    // Load saved username and profile picture
    const savedUsername = localStorage.getItem("username");
    const savedProfilePic = localStorage.getItem("profilePic");

    if (savedUsername) {
        usernameInput.value = savedUsername;
    }

    if (savedProfilePic) {
        profilePicPreview.src = savedProfilePic;
    }

    // Display profile picture preview on file input change
    profilePicInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePicPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function saveSettings() {
    const newUsername = document.getElementById("username-input").value.trim();
    const profilePicInput = document.getElementById("profile-pic-input");
    const newProfilePicFile = profilePicInput.files[0];

    if (newUsername) {
        localStorage.setItem("username", newUsername);
    }

    if (newProfilePicFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem("profilePic", e.target.result);
        };
        reader.readAsDataURL(newProfilePicFile);
    }

    alert("Ayarlar kaydedildi!");
}

function goBack() {
    window.location.href = "sohbet.html"; // Chat sisteminin olduğu sayfanın adı
}
