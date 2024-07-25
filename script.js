document.addEventListener("DOMContentLoaded", () => {
    loadChat();
    loadArchive();
    loadUserData();
    setupDailyArchive();

    // Mesaj kutusu otomatik olarak aşağıya kaydırılır
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Mesaj gönderimi için Enter tuşu ile etkinlik
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Kullanıcı verilerini belirli aralıklarla güncelle
    setInterval(loadUserData, 1000);

    // Sağ tıklama menüsünü ayarla
    document.getElementById("chat-messages").addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (e.target.closest(".message")) {
            const contextMenu = document.getElementById("context-menu");
            contextMenu.style.display = "block";
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.dataset.messageId = e.target.closest(".message").dataset.messageId;
        }
    });

    // Sayfayı tıklamak menüyü kapatır
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#context-menu")) {
            document.getElementById("context-menu").style.display = "none";
        }
    });

    // Arşiv dosyalarını yükle
    loadArchiveFiles();

    // Eski mesajları yükle
    loadChatHistory();

    // Ayarlar sayfasına gitmek için işlev
    document.getElementById("open-settings").addEventListener("click", () => {
        window.location.href = "settings.html";
    });
});

function loadUserData() {
    const username = localStorage.getItem("username") || "Kullanıcı";
    const profilePic = localStorage.getItem("profilePic");

    // Kullanıcı adını ve profil fotoğrafını chat ekranında kullan
    document.getElementById("chat-username").textContent = username;

    if (profilePic) {
        document.getElementById("chat-profile-pic").src = profilePic;
    }
}

function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();
    const username = localStorage.getItem("username") || 'Kullanıcı';
    const profilePic = localStorage.getItem("profilePic");

    if (message) {
        const chatMessages = document.getElementById("chat-messages");
        const time = new Date().toLocaleString();
        const newMessage = document.createElement("div");
        newMessage.className = "message";
        newMessage.dataset.messageId = Date.now(); // Mesaj ID'si

        newMessage.innerHTML = `
            <img src="${profilePic || 'default-profile-pic.png'}" alt="Profil Resmi" />
            <div class="message-content">
                ${time} - ${username}: ${message}
            </div>
        `;
        chatMessages.appendChild(newMessage);

        saveMessage(time, username, message);
        chatInput.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight; // Mesaj kutusunu en alta kaydır
    }
}

function saveMessage(time, username, message) {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında tarih

    if (!chatHistory[today]) {
        chatHistory[today] = [];
    }
    
    chatHistory[today].push({ time, username, message });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    updateArchive();
}

function updateArchive() {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında tarih
    const archiveTextArea = document.getElementById("archive-textarea");
    
    // Arşivdeki verileri yükleyin
    const archiveContent = chatHistory[today] || [];
    archiveTextArea.value = archiveContent.map(msg => `${msg.time} - ${msg.username}: ${msg.message}`).join('\n');
}

function loadArchive() {
    updateArchive();
}

function toggleArchive() {
    const chatContainer = document.getElementById("chat-container");
    const chatArchive = document.getElementById("chat-archive");
    
    if (chatArchive.style.transform === "translateX(0%)") {
        chatArchive.style.transform = "translateX(100%)";
        chatContainer.style.width = "100%";
    } else {
        chatArchive.style.transform = "translateX(0%)";
        chatContainer.style.width = "75%";
    }
}

function loadArchiveFiles() {
    fetch('path/to/archive/files') // Sunucuda günlük dosyalarının bulunduğu dizine erişim yolu
        .then(response => response.json())
        .then(files => {
            const archiveFilesDiv = document.getElementById("archive-files");
            archiveFilesDiv.innerHTML = files.map(file => `
                <div>
                    <a href="path/to/archive/files/${file}" target="_blank">${file}</a>
                </div>
            `).join('');
        })
        .catch(error => console.error('Dosyalar yüklenirken hata oluştu:', error));
}

function editMessage() {
    const contextMenu = document.getElementById("context-menu");
    const messageId = contextMenu.dataset.messageId;
    const messageElement = document.querySelector(`.message[data-message-id='${messageId}'] .message-content`);
    const newMessage = prompt("Yeni mesajınızı girin:", messageElement.textContent);

    if (newMessage !== null) {
        messageElement.innerHTML = newMessage;
        saveChatHistory();
    }
    contextMenu.style.display = "none";
}

function deleteMessage() {
    const contextMenu = document.getElementById("context-menu");
    const messageId = contextMenu.dataset.messageId;
    const messageElement = document.querySelector(`.message[data-message-id='${messageId}']`);
    
    if (messageElement) {
        messageElement.remove();
        saveChatHistory();
    }
    contextMenu.style.display = "none";
}

function saveChatHistory() {
    const chatMessages = document.querySelectorAll(".message");
    const chatHistory = {};
    const today = new Date().toISOString().split('T')[0];

    chatMessages.forEach(msg => {
        const time = msg.querySelector(".message-content").textContent.split(' - ')[0];
        const username = msg.querySelector(".message-content").textContent.split(' - ')[1].split(':')[0];
        const message = msg.querySelector(".message-content").textContent.split(':')[1].trim();

        if (!chatHistory[today]) {
            chatHistory[today] = [];
        }

        chatHistory[today].push({ time, username, message });
    });

    // Mesajları bir arşiv dosyasına kaydetmek için sunucuya gönder
    fetch('save_chat_history.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `content=${encodeURIComponent(JSON.stringify(chatHistory))}`,
    })
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.error('Hata:', error));
}

function openSettings() {
    window.location.href = "ayarlar.html";
}

function updateDailyMessages(time, username, message) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında tarih
    const content = `${time} - ${username}: ${message}\n`;
    
    // Günlük mesajları saklamak için localStorage'a yaz
    let dailyMessages = localStorage.getItem(`messages-${today}`);
    if (dailyMessages) {
        dailyMessages += content;
    } else {
        dailyMessages = content;
    }
    
    localStorage.setItem(`messages-${today}`, dailyMessages);
}
