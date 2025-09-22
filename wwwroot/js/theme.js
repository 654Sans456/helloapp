function applyThemeFromCookie() {
    function getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const settings = getCookie("gameSettings");
    if (settings) {
        try {
            const parsed = JSON.parse(decodeURIComponent(settings));
            if (parsed.bgColor) document.documentElement.style.setProperty("--bg-color", parsed.bgColor);
            if (parsed.textColor) document.documentElement.style.setProperty("--text-color", parsed.textColor);
            if (parsed.btnColor) document.documentElement.style.setProperty("--btn-color", parsed.btnColor);
        } catch (e) {
            console.error("Invalid gameSettings cookie", e);
        }
    }
}

document.addEventListener("DOMContentLoaded", applyThemeFromCookie);
