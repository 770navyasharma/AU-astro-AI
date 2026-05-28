// ==========================================
// STATE MANAGEMENT
// ==========================================
// Simulated state (real app would use JWT/Firebase)
let currentUserState = 'guest';    // 'guest' | 'free' | 'paid'
let isLoggedIn = false;
let minutesUsedSeconds = 0;        // How many seconds the user has already used
let lastFeedSource = 'mweb-feed'; // Which feed they came from, to go back

const GUEST_TOTAL = 300;    // 5 min in seconds
const FREE_TOTAL  = 600;    // 10 min in seconds

// On page load, read state
window.addEventListener('DOMContentLoaded', () => {
    // Read persisted state from sessionStorage for the demo
    isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    minutesUsedSeconds = parseInt(sessionStorage.getItem('minutesUsed') || '0');
    currentUserState = sessionStorage.getItem('userState') || 'guest';

    // Sync dropdown
    document.getElementById('userStateSelect').value = currentUserState;
    document.body.classList.add(`state-${currentUserState}`);
    document.body.classList.add('body-mobile-mode'); // Default to mobile mode

    updateAllBanners();
});

function switchUserState() {
    const selector = document.getElementById('userStateSelect');
    currentUserState = selector.value;

    if (currentUserState === 'guest') {
        isLoggedIn = false;
        minutesUsedSeconds = 0;
    } else {
        isLoggedIn = true;
    }

    sessionStorage.setItem('userState', currentUserState);
    sessionStorage.setItem('isLoggedIn', isLoggedIn);
    sessionStorage.setItem('minutesUsed', minutesUsedSeconds);

    document.body.classList.remove('state-guest', 'state-free', 'state-paid');
    document.body.classList.add(`state-${currentUserState}`);
    updateAllBanners();
}

function updateAllBanners() {
    // Calculate remaining time
    const total = currentUserState === 'paid' ? FREE_TOTAL : (currentUserState === 'free' ? FREE_TOTAL : GUEST_TOTAL);
    const remaining = Math.max(0, total - minutesUsedSeconds);
    const rMin = Math.floor(remaining / 60);
    const rSec = remaining % 60;
    const remStr = `${rMin}:${rSec.toString().padStart(2,'0')}`;

    if (isLoggedIn) {
        // MWeb banner
        const mTitle = document.getElementById('mwebBannerTitle');
        const mSub   = document.getElementById('mwebBannerSub');
        if (mTitle) mTitle.innerHTML = `<span class="banner-loggedin-badge">● वापस आए!</span><br>डॉ. प्रिया इंतज़ार कर रही हैं`;
        if (mSub)   mSub.textContent  = `⏱ ${remStr} मिनट अभी बाकी हैं — जारी रखें`;

        // App banner
        const aTitle = document.getElementById('appBannerTitle');
        const aSub   = document.getElementById('appBannerSub');
        if (aTitle) aTitle.innerHTML = `<span class="banner-loggedin-badge">● वापस आए!</span><br>डॉ. प्रिया ऑनलाइन हैं`;
        if (aSub)   aSub.textContent  = `⏱ ${remStr} मिनट अभी बाकी हैं`;
    } else {
        const mTitle = document.getElementById('mwebBannerTitle');
        const mSub   = document.getElementById('mwebBannerSub');
        if (mTitle) mTitle.textContent = 'भविष्य की उलझन का सटीक जवाब!';
        if (mSub)   mSub.textContent   = 'डॉ. प्रिया से 5 मिनट फ्री बात करें। 🌟';

        const aTitle = document.getElementById('appBannerTitle');
        const aSub   = document.getElementById('appBannerSub');
        if (aTitle) aTitle.textContent = 'आपकी पर्सनल AI ज्योतिषी ऑनलाइन हैं!';
        if (aSub)   aSub.textContent   = 'रोज़ 10 मिनट फ्री ज्योतिष सलाह पाएं। ✨';
    }
}


// ==========================================
// SECTION / SCREEN NAVIGATION
// ==========================================
function showSection(sectionId, btnElement) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('callInterface').classList.add('hidden');
    stopCallTimer();
    closeSidebar();

    // Desktop mode only for web-feed
    if (sectionId === 'web-feed') {
        document.body.classList.add('body-desktop-mode');
        document.body.classList.remove('body-mobile-mode');
    } else {
        document.body.classList.remove('body-desktop-mode');
        document.body.classList.add('body-mobile-mode');
    }

    const target = document.getElementById(sectionId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    // Track where user came from for "back" navigation
    if (['mweb-feed','app-feed','web-feed'].includes(sectionId)) {
        lastFeedSource = sectionId;
    }
}

function goBackToFeed() {
    showSection(lastFeedSource, null);
}


// ==========================================
// BANNER CLICK — THE MAIN ENTRY POINT
// ==========================================
function handleBannerClick(source) {
    if (source === 'desktop' || source === 'web-feed') {
        document.body.classList.add('body-desktop-mode');
        document.body.classList.remove('body-mobile-mode');
    } else {
        document.body.classList.add('body-mobile-mode');
        document.body.classList.remove('body-desktop-mode');
    }

    if (!isLoggedIn) {
        // Show login sheet
        openSheet('loginSheet');
    } else {
        // Already logged in → go to Start/Resume screen
        goToStartScreen();
    }
}


// ==========================================
// LOGIN FLOW
// ==========================================
function simulateLogin() {
    const nameInput = document.getElementById('loginNameField');
    const phoneInput = document.getElementById('loginPhoneField');
    
    if (nameInput && !nameInput.value.trim()) {
        alert("कृपया अपना नाम दर्ज करें।");
        return;
    }
    if (phoneInput && !phoneInput.value.trim()) {
        alert("कृपया अपना मोबाइल नंबर दर्ज करें।");
        return;
    }

    closeSheet('loginSheet');

    // Mark as logged in
    isLoggedIn = true;
    if (currentUserState === 'guest') {
        // After MWeb login, treat as guest with 5-min quota
        currentUserState = 'guest';
    }
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userState', currentUserState);

    // Show success toast
    showSuccessToast('✅ लॉगिन सफल! डॉ. प्रिया आपका इंतज़ार कर रही हैं ✨');

    // Update banners
    updateAllBanners();

    // After short delay, navigate to Start Screen
    setTimeout(() => {
        goToStartScreen();
    }, 1800);
}

function simulateGoogleLogin() {
    closeSheet('loginSheet');

    // Mark as logged in
    isLoggedIn = true;
    if (currentUserState === 'guest') {
        currentUserState = 'guest';
    }
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userState', currentUserState);

    showSuccessToast('✅ Google से लॉगिन सफल! डॉ. प्रिया आपका इंतज़ार कर रही हैं ✨');
    updateAllBanners();

    setTimeout(() => {
        goToStartScreen();
    }, 1800);
}

function showSuccessToast(message) {
    // Remove existing toast if any
    const old = document.getElementById('successToast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'successToast';
    toast.className = 'success-toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function showWarningToast(message) {
    const old = document.getElementById('warningToast');
    if (old) old.remove();

    const isDesktop = document.body.classList.contains('body-desktop-mode');

    const toast = document.createElement('div');
    toast.id = 'warningToast';
    toast.className = 'warning-toast';
    toast.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> ${message}`;

    // Desktop: come from top, bigger; Mobile/App: come from bottom, compact
    if (isDesktop) {
        toast.style.cssText += '; bottom:auto; top:40px; padding:20px 40px; font-size:16px; border-radius:20px; animation:slideDown 0.4s cubic-bezier(0.175,0.885,0.32,1) forwards;';
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 8000);
}


// ==========================================
// START / RESUME SCREEN
// ==========================================
function goToStartScreen() {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('callInterface').classList.add('hidden');
    stopCallTimer();

    // App = 10 min, MWeb / Desktop = 5 min  — based on WHICH feed the user came from
    const isAppFlow     = lastFeedSource === 'app-feed';
    const platformTotal = isAppFlow ? FREE_TOTAL : GUEST_TOTAL;  // 600s vs 300s

    const remaining = Math.max(0, platformTotal - minutesUsedSeconds);
    const rMin = Math.floor(remaining / 60);
    const rSec = remaining % 60;
    const remStr = `${rMin}:${rSec.toString().padStart(2,'0')}`;

    const isReturning = minutesUsedSeconds > 0;

    // Update content
    const headline = document.getElementById('startScreenHeadline');
    const sub      = document.getElementById('startScreenSub');
    const badge    = document.getElementById('startTimerBadge');
    const btnLabel = document.getElementById('startBtnLabel');

    if (isReturning) {
        headline.textContent = 'वापस आए! डॉ. प्रिया आपका इंतज़ार कर रही थीं 🌟';
        sub.textContent      = 'आपकी पिछली बातचीत याद है। जहाँ छोड़ा था, वहीं से शुरू करें।';
        badge.innerHTML      = `🕐 ${remStr} मिनट अभी बाकी हैं`;
        btnLabel.textContent = 'सेशन जारी रखें';
    } else {
        headline.textContent = 'भविष्य के हर सवाल का जवाब, सिर्फ एक कॉल दूर';
        sub.textContent      = 'डॉ. प्रिया आपकी कुंडली पढ़कर करियर, प्रेम और धन के हर सवाल का सटीक जवाब देंगी।';
        // Show 10:00 for App, 5:00 for MWeb/Desktop
        const totalMinStr = isAppFlow ? '10:00' : '5:00';
        badge.innerHTML      = `🕐 ${totalMinStr} मिनट बिल्कुल मुफ़्त`;
        btnLabel.textContent = 'सेशन शुरू करें';
    }

    document.getElementById('startResumeScreen').classList.remove('hidden');
}

function startSessionNow() {
    openCall();
}


// ==========================================
// LIVE CALL & TIMER LOGIC
// ==========================================
let callTimerInterval;
let secondsElapsed = 0;

function openCall() {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('callInterface').classList.remove('hidden');
    startCallTimer();
}

function closeCall() {
    // Pause timer while user decides
    stopCallTimer();
    openModal('endCallConfirmModal');
}

function cancelEndCall() {
    // Resume timer if user decides to stay
    closeModal('endCallConfirmModal');
    callTimerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
        checkTimeLimits();
    }, 1000);
}

function confirmEndCall() {
    closeModal('endCallConfirmModal');
    document.getElementById('callInterface').classList.add('hidden');
    stopCallTimer();
    // Save progress
    minutesUsedSeconds += secondsElapsed;
    sessionStorage.setItem('minutesUsed', minutesUsedSeconds);
    updateAllBanners();
    // Feedback Gate
    openSheet('feedbackModal');
}

function startCallTimer() {
    secondsElapsed = 0;
    updateTimerDisplay();

    callTimerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
        checkTimeLimits();
    }, 1000);
}

function stopCallTimer() {
    clearInterval(callTimerInterval);
}

function updateTimerDisplay() {
    const total = currentUserState === 'paid' ? FREE_TOTAL : (currentUserState === 'free' ? FREE_TOTAL : GUEST_TOTAL);
    const totalUsed = minutesUsedSeconds + secondsElapsed;
    let remaining = Math.max(0, total - totalUsed);

    const rMin = Math.floor(remaining / 60);
    const rSec = remaining % 60;
    const remStr = `${rMin.toString().padStart(2,'0')}:${rSec.toString().padStart(2,'0')}`;

    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = remStr;
    const sidebarTimerEl = document.getElementById('sidebarTimer');
    if (sidebarTimerEl) sidebarTimerEl.textContent = remStr;
}

function checkTimeLimits() {
    if (currentUserState === 'paid') return;

    const totalUsed = minutesUsedSeconds + secondsElapsed;

    // MWeb Guest: 4-min warning (at 240s total)
    if (totalUsed === 240 && currentUserState === 'guest') {
        showWarningToast('ध्यान दें: आपकी फ्री कॉल में 1 मिनट बचा है।');
    }

    // MWeb Guest: 5-min hard stop (at 300s total)
    if (totalUsed >= 300 && currentUserState === 'guest') {
        stopCallTimer();
        openModal('stop5MinModal');
    }

    // App Free: 9-min warning (at 540s total)
    if (totalUsed === 540 && currentUserState === 'free') {
        showWarningToast('ध्यान दें: आपकी 10 मिनट फ्री कॉल में 1 मिनट बचा है।');
    }

    // App Free: 10-min hard stop (at 600s total)
    if (totalUsed >= 600 && currentUserState === 'free') {
        stopCallTimer();
        document.getElementById('callInterface').classList.add('hidden');
        minutesUsedSeconds = 600;
        sessionStorage.setItem('minutesUsed', minutesUsedSeconds);
        openModal('stop10MinModal');
    }
}

function goToFeedbackFrom10Min() {
    closeModal('stop10MinModal');
    openSheet('feedbackModal');
}


// ==========================================
// MODAL & SHEET CONTROLLERS
// ==========================================
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openSheet(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeSheet(id) { document.getElementById(id).classList.add('hidden'); }

function resumeCallFromWelcome() {
    closeModal('welcomeBackModal');
    goToStartScreen();
}

function endCallManually() {
    closeModal('welcomeBackModal');
    openSheet('feedbackModal');
}

function downloadApp() {
    // Simulate deferred deep link — user "installs" app, comes back as 'free' user
    closeModal('stop5MinModal');
    closeModal('warning4MinModal');

    // Upgrade user state to "free" (simulates app login)
    currentUserState = 'free';
    isLoggedIn = true;
    // They already used 5 minutes from MWeb
    minutesUsedSeconds = 300;
    document.getElementById('userStateSelect').value = 'free';
    document.body.classList.remove('state-guest', 'state-paid');
    document.body.classList.add('state-free');

    sessionStorage.setItem('userState', 'free');
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('minutesUsed', '300');

    updateAllBanners();
    openModal('welcomeBackModal');
}


// ==========================================
// SIDEBAR
// ==========================================
function openSidebar() {
    document.getElementById('astroSidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.remove('hidden');
}
function closeSidebar() {
    document.getElementById('astroSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.add('hidden');
}


// ==========================================
// FEEDBACK & THANK YOU FLOW
// ==========================================
document.querySelectorAll('.f-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
});

function submitFeedback() {
    closeSheet('feedbackModal');
    showThankYou();
}

let thankYouInterval;
function showThankYou() {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('callInterface').classList.add('hidden');
    document.getElementById('thankYouScreen').classList.remove('hidden');

    let count = 10;
    document.getElementById('tyCountdown').textContent = count;
    document.getElementById('tyProgressFill').style.width = '100%';
    document.getElementById('tyProgressFill').style.transition = 'none';

    // Start countdown after a short delay
    setTimeout(() => {
        document.getElementById('tyProgressFill').style.transition = `width ${count}s linear`;
        document.getElementById('tyProgressFill').style.width = '0%';
    }, 100);

    clearInterval(thankYouInterval);
    thankYouInterval = setInterval(() => {
        count--;
        document.getElementById('tyCountdown').textContent = count;
        if (count <= 0) {
            clearInterval(thankYouInterval);
            closeThankYou();
        }
    }, 1000);
}

function closeThankYou() {
    clearInterval(thankYouInterval);
    document.getElementById('thankYouScreen').classList.add('hidden');
    // Navigate back to the start/resume screen so user can come back tomorrow
    goToStartScreen();
}


// ==========================================
// PUSH NOTIFICATION SIMULATOR
// ==========================================
// ==========================================
// RESET DEMO
// ==========================================
function resetDemo() {
    sessionStorage.clear();
    location.reload();
}

function simulatePush(segment) {
    const notif = document.getElementById('pushNotification');
    const title = document.getElementById('pushTitle');
    const body  = document.getElementById('pushBody');

    if (segment === 'web_morning') {
        title.innerHTML  = '✨ शुभ प्रभात!';
        body.textContent = 'आपके आज के 5 मुफ़्त मिनट तैयार हैं। अभी सवाल पूछें!';
    } else if (segment === 'app_morning') {
        title.innerHTML  = '🌟 डॉ. प्रिया ऑनलाइन हैं';
        body.textContent = 'आपके 10 मुफ़्त मिनट आपका इंतज़ार कर रहे हैं। भविष्य जानें!';
    } else if (segment === 'app_unused') {
        title.innerHTML  = '🔮 एक राज़ की बात...';
        body.textContent = 'आपके 10 फ्री मिनट बर्बाद हो रहे हैं! डॉ. प्रिया से अभी बात करें।';
    }

    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 10000);
}
