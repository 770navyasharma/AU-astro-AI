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
    // We no longer overwrite the banner text here because the user requested the banner 
    // text and typewriter animation to remain identical whether logged in or out.
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

    openGatewayScreen();
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

    // Mark as logged in
    isLoggedIn = true;
    if (currentUserState === 'guest') {
        // After MWeb login, treat as guest with 5-min quota
        currentUserState = 'guest';
    }
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userState', currentUserState);

    // Show success toast
    showSuccessToast('✅ लॉगिन सफल! अपनी कुंडली के राज़ जानने के लिए तैयार हो जाएं ✨');

    // Update banners
    updateAllBanners();

    // After short delay, refresh gateway screen
    setTimeout(() => {
        openGatewayScreen();
    }, 1500);
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

    showSuccessToast('✅ Google से लॉगिन सफल! अपनी कुंडली के राज़ जानने के लिए तैयार हो जाएं ✨');
    updateAllBanners();

    setTimeout(() => {
        openGatewayScreen();
    }, 1500);
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
function openGatewayScreen() {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('callInterface').classList.add('hidden');
    stopCallTimer();

    const isAppFlow     = lastFeedSource === 'app-feed';
    const platformTotal = isAppFlow ? FREE_TOTAL : GUEST_TOTAL;  // 600s vs 300s
    const remaining = Math.max(0, platformTotal - minutesUsedSeconds);
    const rMin = Math.floor(remaining / 60);
    const rSec = remaining % 60;
    const remStr = `${rMin}:${rSec.toString().padStart(2,'0')}`;
    const totalMinStr = isAppFlow ? '10:00' : '5:00';
    
    const container = document.getElementById('gatewayDynamicContent');
    
    if (!isLoggedIn) {
        // STATE A: GUEST (NOT LOGGED IN)
        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <h3 style="color:#FFF; font-size:20px; font-weight:800; margin-bottom:8px;">अपने भविष्य की बातें करें 🌟</h3>
                <p style="color:#FFD700; font-size:14px; font-weight:700; margin-bottom:12px;">विशेषज्ञता: करियर • विवाह • प्रेम • धन</p>
                <p style="color:rgba(255,255,255,0.7); font-size:14px; line-height: 1.5;">डॉ. प्रिया आपकी कुंडली का सटीक विश्लेषण कर हर सवाल का जवाब देंगी।</p>
            </div>
            
            <div class="trust-chips mb-20" style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); justify-content: space-between;">
                <span class="trust-chip" style="font-size: 11px;"><i class="fa-solid fa-gift text-gold"></i> ${totalMinStr} मिनट मुफ़्त</span>
                <span class="trust-chip" style="font-size: 11px;"><i class="fa-solid fa-shield-halved text-gold"></i> 100% सुरक्षित</span>
                <span class="trust-chip" style="font-size: 11px;"><i class="fa-solid fa-user-shield text-gold"></i> कोई स्पैम नहीं</span>
            </div>

            <div class="input-group dark-input mb-15">
                <i class="fa-solid fa-user text-light" style="padding:16px;"></i>
                <input type="text" id="loginNameField" placeholder="अपना नाम दर्ज करें *" class="input-field" required>
            </div>

            <div class="input-group dark-input mb-20">
                <span class="country-code"><img src="https://flagcdn.com/w20/in.png" style="width:16px; margin-right:5px; vertical-align:middle;"> +91</span>
                <input type="tel" id="loginPhoneField" placeholder="मोबाइल नंबर दर्ज करें *" class="input-field" required>
                <i class="fa-solid fa-lock text-light" style="padding:16px;"></i>
            </div>
            
            <button class="cta-btn yellow-btn full-width" onclick="simulateLogin()">
                OTP भेजें और शुरू करें
            </button>
        `;
    } else {
        if (remaining > 0) {
            // STATE B: LOGGED IN (TIME REMAINING)
            // STATE B: LOGGED IN (TIME REMAINING)
            const isReturning = minutesUsedSeconds > 0;
            const badgeText = isReturning ? `⏱ ${remStr} मिनट अभी बाकी हैं` : `⏱ ${totalMinStr} मिनट बिल्कुल मुफ़्त`;
            const btnText = isReturning ? 'सेशन जारी रखें' : 'सेशन शुरू करें';

            container.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 20px;">
                    <h3 style="color:#FFF; font-size:24px; font-weight:900; margin-bottom:12px; line-height: 1.3;">अपने भविष्य के हर सवाल का जवाब जानें 🌟</h3>
                    <p style="color:rgba(255,255,255,0.7); font-size:15px; margin-bottom:24px; line-height: 1.6;">डॉ. प्रिया आपकी कुंडली का सटीक विश्लेषण कर हर सवाल का जवाब देंगी।</p>
                    
                    <div class="start-timer-badge" style="margin-bottom:24px; align-self: flex-start; border: 1px solid rgba(255,215,0,0.3); background: rgba(255,215,0,0.1);">
                        <span style="color:#FFD700; font-weight: 700;">${badgeText}</span>
                    </div>

                    <div style="text-align: center; margin-bottom: 12px; color: rgba(255,255,255,0.6); font-size: 13px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px;">
                        <i class="fa-solid fa-lock text-green"></i> आप सुरक्षित रूप से लॉग इन हैं। आपकी जानकारी 100% सुरक्षित है।
                    </div>

                    <button class="cta-btn yellow-btn full-width mb-10" onclick="startSessionNow()">
                        <i class="fa-solid fa-phone-volume call-ring-anim"></i> ${btnText}
                    </button>
                    <button class="cta-btn text-btn full-width" style="color:rgba(255,255,255,0.6);" onclick="goBackToFeed()">
                        वापस जाएं
                    </button>
                </div>
            `;
        } else {
            // STATE C: LOGGED IN (TIME OVER)
            if (!isAppFlow) {
                // If MWeb and time is over, force the Download App bottom sheet instead of Gateway State C
                document.getElementById('mwebAppDownloadSheet').classList.remove('hidden');
                return; // Stop execution here, don't show the gateway screen
            } else {
                // If App and time is over, force the Feedback bottom sheet instead of Gateway State C
                document.getElementById('appTimeOverFeedbackSheet').classList.remove('hidden');
                return; // Stop execution here, don't show the gateway screen
            }

            container.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 20px; text-align: center;">
                    <i class="fa-solid fa-hourglass-end" style="font-size: 48px; color: #EF4444; margin-bottom: 20px;"></i>
                    <h3 style="color:#FFF; font-size:24px; font-weight:900; margin-bottom:12px;">आज का समय समाप्त हुआ! 🌅</h3>
                    <p style="color:rgba(255,255,255,0.7); font-size:15px; margin-bottom:24px;">आपकी ${totalMinStr} मिनट की फ्री कॉल लिमिट पूरी हो चुकी है। कल फिर से आएं और अपने भविष्य के बारे में जानें।</p>
                    
                    <button class="cta-btn dark-btn full-width mt-auto" onclick="goBackToFeed()">
                        वापस जाएं (Back to Home)
                    </button>
                </div>
            `;
        }
    }

    document.getElementById('unifiedGatewayScreen').classList.remove('hidden');
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
    
    // Check if user is returning
    const isReturning = minutesUsedSeconds > 0;
    
    const btn = document.getElementById('primaryCallActionBtn');
    if (btn) {
        btn.innerHTML = isReturning ? '<i class="fa-solid fa-play"></i> सेशन जारी रखें' : '<i class="fa-solid fa-phone-volume"></i> सेशन शुरू करें';
        btn.setAttribute('onclick', 'beginCallTimer()');
    }
}

function beginCallTimer() {
    const btn = document.getElementById('primaryCallActionBtn');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-phone-slash"></i> सेशन समाप्त करें';
        btn.setAttribute('onclick', 'closeCall()');
    }
    
    // Clear chat to make it look fresh
    const transcript = document.getElementById('transcript');
    if (transcript) {
        transcript.innerHTML = `
            <div style="text-align:center; margin-bottom:30px;">
                <p style="color:rgba(255,255,255,0.6); font-style:italic; font-size:14px;">बोलना शुरू करें।<br><span style="font-size:12px; color:rgba(255,255,255,0.4);">डॉ. प्रिया के साथ आपकी बातचीत यहाँ दिखाई देगी।</span></p>
            </div>
            <div class="chat-bubble ai-bubble">
                <img src="assets/dr_priya_verma.png" class="chat-avatar" alt="AI">
                <div class="bubble-content">
                    <div class="bubble-header">डॉ. प्रिया वर्मा</div>
                    <p>नमस्ते! बताइए, आज मन में क्या सवाल है?</p>
                </div>
            </div>
        `;
    }
    
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

    // MWeb 5-min hard stop
    if (totalUsed >= 300 && currentUserState === 'guest') {
        stopCallTimer();
        document.getElementById('callInterface').classList.add('hidden');
        minutesUsedSeconds = 300;
        sessionStorage.setItem('minutesUsed', minutesUsedSeconds);
        openSheet('mwebAppDownloadSheet');
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
        openSheet('appTimeOverFeedbackSheet');
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

function goBackToFeedFromDownloadSheet() {
    closeSheet('mwebAppDownloadSheet');
    goBackToFeed();
}

function goBackToFeedFromAppSheet() {
    closeSheet('appTimeOverFeedbackSheet');
    goBackToFeed();
}

function submitAppFeedback() {
    closeSheet('appTimeOverFeedbackSheet');
    window.open('https://amarujala.com/feedback', '_blank');
}

function downloadApp() {
    // Simulate deferred deep link — user "installs" app, comes back as 'free' user
    closeModal('stop5MinModal');
    closeSheet('mwebAppDownloadSheet');
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

function demoGateway(platform, state) {
    if (platform === 'mweb') {
        lastFeedSource = 'mweb-feed';
        if (state === 'guest') { isLoggedIn = false; minutesUsedSeconds = 0; }
        if (state === 'resume') { isLoggedIn = true; minutesUsedSeconds = 120; }
        if (state === 'over') { isLoggedIn = true; minutesUsedSeconds = 300; }
    } else {
        lastFeedSource = 'app-feed';
        if (state === 'guest') { isLoggedIn = false; minutesUsedSeconds = 0; }
        if (state === 'resume') { isLoggedIn = true; minutesUsedSeconds = 120; }
        if (state === 'over') { isLoggedIn = true; minutesUsedSeconds = 600; }
    }
    openGatewayScreen();
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

// ==========================================
// TYPEWRITER ANIMATION FOR BANNERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const words = ["करियर", "धन", "प्रेम", "विवाह", "भविष्य"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const elements = document.querySelectorAll('.typewriter-text');
        if (!elements.length) return;

        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        const textToDisplay = currentWord.substring(0, charIndex);
        
        elements.forEach(el => {
            el.textContent = textToDisplay;
        });

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
            // Pause at the end of a word
            typeSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }

    // Start typewriter
    setTimeout(type, 1000);
});
