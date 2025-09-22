document.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });
});

function loadSettings() {
    const settings = getCookie('gameSettings');
    if (settings) {
        const { bgColor, textColor, btnColor } = JSON.parse(settings);
        document.documentElement.style.setProperty('--bg-color', bgColor);
        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--btn-color', btnColor);

        document.getElementById('bgColor').value = bgColor;
        document.getElementById('textColor').value = textColor;
        document.getElementById('btnColor').value = btnColor;
    }
}

function saveSettings() {
    const settings = {
        bgColor: document.getElementById('bgColor').value,
        textColor: document.getElementById('textColor').value,
        btnColor: document.getElementById('btnColor').value
    };

    setCookie('gameSettings', JSON.stringify(settings), 365);
    applySettings(settings);
}

function applySettings(settings) {
    document.documentElement.style.setProperty('--bg-color', settings.bgColor);
    document.documentElement.style.setProperty('--text-color', settings.textColor);
    document.documentElement.style.setProperty('--btn-color', settings.btnColor);
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
