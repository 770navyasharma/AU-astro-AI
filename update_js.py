import re

with open('script.js', 'r') as f:
    content = f.read()

# Make isApp accessible easily
isApp_getter = 'const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");\n    const prefix = isApp ? "app-" : "mweb-";\n'

# 1. showOtpSection
content = content.replace("const loginSection = document.getElementById('mweb-start-login');",
    isApp_getter + "    const loginSection = document.getElementById(prefix + 'start-login');")
content = content.replace("showSection('mweb-otp-timer', btnElement);",
    "showSection(prefix + 'otp-timer', btnElement);")

# 2. showLoginError
content = content.replace("showSection('mweb-login-error-empty');", "const prefix = (document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active')) ? 'app-' : 'mweb-'; showSection(prefix + 'login-error-empty');")
content = content.replace("showSection('mweb-login-error-invalid');", "const prefix = (document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active')) ? 'app-' : 'mweb-'; showSection(prefix + 'login-error-invalid');")

# 3. loginSuccess
content = content.replace("showSection('mweb-splash-hybrid');", "const prefix = (document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active')) ? 'app-' : 'mweb-'; showSection(prefix + 'splash-hybrid');")

# 4. handleBannerClick
content = content.replace("showSection('mweb-start-login');", "const prefix = (platform === 'app' || (document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active'))) ? 'app-' : 'mweb-'; showSection(prefix + 'start-login');")
content = content.replace("showSection('mweb-logged-in-splash');", "const prefix = (platform === 'app' || (document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active'))) ? 'app-' : 'mweb-'; showSection(prefix + 'logged-in-splash');")

# 5. renderSplashState - this function needs the "10 minutes" logic if it's app.
# We will inject isApp check at the top of renderSplashState
render_splash_top = """function renderSplashState(state, btn) {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    const minText = isApp ? "10" : "5";
    const minTextHindi = isApp ? "10" : "5";
"""
content = content.replace("function renderSplashState(state, btn) {", render_splash_top)
content = content.replace("showSection('mweb-splash-hybrid', btn);", "showSection(prefix + 'splash-hybrid', btn);")
content = content.replace("showSection('mweb-splash-hybrid');", "showSection(prefix + 'splash-hybrid');")
content = content.replace("आपका आज का शेष समय: 05:00 मिनट", "आपका आज का शेष समय: " + "0" + "${minText}:00 मिनट")
content = content.replace("5 मिनट पूरे हुए", "${minText} मिनट पूरे हुए")
content = content.replace("⏱️ 5 मिनट पूरे हो गए हैं", "⏱️ ${minText} मिनट पूरे हो गए हैं")
content = content.replace("5 मिनट", "${minText} मिनट")

# We need to change the literal strings in renderSplashState to use backticks where we injected ${minText}
content = content.replace("'आपका आज का शेष समय: 0${minText}:00 मिनट'", "`आपका आज का शेष समय: 0${minText}:00 मिनट`")
content = content.replace("'अपना ज्योतिषी चुनें'", "`अपना ज्योतिषी चुनें`")
content = content.replace("'<span style=\"font-size: 22px;\">⏱️ ${minText} मिनट पूरे हो गए हैं</span>'", "`<span style=\"font-size: 22px;\">⏱️ ${minText} मिनट पूरे हो गए हैं</span>`")


# Also need to create goBackToAppFeed() since we put it in the HTML
goBackToAppFeed_code = """
function goBackToAppFeed() {
    closeAllModals();
    closeAllSheets();
    const btn = document.querySelectorAll('#app-filters .demo-btn-outline')[0];
    showSection('app-feed', btn);
    lastFeedSource = 'app-feed';
}
"""
content += goBackToAppFeed_code

with open('script.js', 'w') as f:
    f.write(content)

print("Updated script.js")
