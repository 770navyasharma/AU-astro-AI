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


    // Explicitly handle phone input focus for older browsers
    document.querySelectorAll('.phone-input-group').forEach(group => {
        const input = group.querySelector('.login-input');
        if (input) {
            input.addEventListener('focus', () => {
                group.style.setProperty('border-color', '#FFD700', 'important');
            });
            input.addEventListener('blur', () => {
                group.style.setProperty('border-color', 'rgba(255,255,255,0.1)', 'important');
            });
        }
    });
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

/**
 * Central function: syncs ALL filter buttons to the currently visible screen.
 * Call this any time the visible screen changes.
 */
function setActiveFilter(sectionId) {
    // Clear all active states across every group
    document.querySelectorAll('.demo-btn, .demo-btn-outline').forEach(b => b.classList.remove('active'));

    // Map sectionId -> which button index in mweb-filters to activate
    // Buttons: 0=Banner, 1=Start Screen, 2=Splash, 3=Contact, 4=Gateway, 5=Call
    const filterMap = {
        'mweb-feed': 0,
        'mweb-start-login': 1,

        'astro-contact-screen': 3,
        'unifiedGatewayScreen': 4,
        'callInterface': 5
    };

    // Activate the correct Platform button
    if (['mweb-feed', 'mweb-start-login', 'astro-contact-screen', 'unifiedGatewayScreen', 'callInterface'].includes(sectionId)) {
        const btn = document.getElementById('mwebSelectBtn');
        if (btn) btn.classList.add('active');
        document.getElementById('mweb-filters').style.display = 'block';
    } else if (sectionId === 'app-feed') {
        const btn = document.getElementById('appSelectBtn');
        if (btn) btn.classList.add('active');
    }

    // Activate the correct Screen button
    if (mwebScreenMap[sectionId] !== undefined) {
        const idx = mwebScreenMap[sectionId];
        const btn = document.querySelectorAll('#mweb-filters .demo-btn-outline')[idx];
        if (btn) btn.classList.add('active');
    } else if (sectionId === 'callInterface') {
        const btn = document.querySelectorAll('#mweb-filters .demo-btn-outline')[5];
        if (btn) btn.classList.add('active');
    }
}

function showSection(sectionId, btnElement) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('callInterface')?.classList.add('hidden');
    stopCallTimer();
    closeSidebar();

    // Reset start screen to fresh login state whenever we navigate
    const sliderContainer = document.querySelector('.login-slider-container');
    if (sliderContainer) sliderContainer.style.display = '';
    const bottomSheet = document.querySelector('#mweb-start-login .bottom-sheet');
    if (bottomSheet) {
        bottomSheet.style.position = '';
        bottomSheet.style.top = '';
        bottomSheet.style.left = '';
        bottomSheet.style.right = '';
        bottomSheet.style.bottom = '';
        bottomSheet.style.borderRadius = '';
        bottomSheet.style.padding = '';
        bottomSheet.style.overflowY = '';
    }
    const formContainer = document.querySelector('.login-form-container');
    if (formContainer) { formContainer.style.padding = ''; formContainer.style.margin = ''; }
    const loggedInSection = document.getElementById('loggedInCallSection');
    if (loggedInSection) loggedInSection.classList.add('hidden');
    const loginInput = document.getElementById('loginInputSection');
    if (loginInput) loginInput.classList.remove('hidden');
    const otpInput = document.getElementById('otpInputSection');
    if (otpInput) otpInput.classList.add('hidden');
    const loginText = document.getElementById('loginMainText');
    if (loginText) loginText.classList.remove('hidden');
    const trustBadges = document.getElementById('loginTrustBadges');
    if (trustBadges) trustBadges.classList.remove('hidden');

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


    
    if (sectionId === 'mweb-start-login' || sectionId === 'mweb-v2-start-login' || sectionId === 'app-start-login' || sectionId === 'mweb-logged-in-splash' || sectionId === 'mweb-splash-active-hybrid' || sectionId === 'mweb-login-error-empty' || sectionId === 'mweb-login-error-invalid' || sectionId === 'mweb-otp-timer' || sectionId === 'mweb-otp-error-wrong') {
        setTimeout(startSlider, 50);
    }

    // Properly mark the clicked button as active
    if (btnElement && btnElement.classList.contains('demo-btn-outline')) {
        // Clear other outline buttons
        const group = btnElement.closest('.demo-btn-group');
        if (group) {
            group.querySelectorAll('.demo-btn-outline').forEach(b => b.classList.remove('active'));
        } else {
            document.querySelectorAll('.demo-btn-outline').forEach(b => b.classList.remove('active'));
        }
        btnElement.classList.add('active');
    }

    // Sync platform buttons if needed (Mweb vs Native)
    if (['mweb-feed', 'mweb-start-login', 'astro-contact-screen', 'mweb-dialing', 'mweb-active-call', 'mweb-toast-test-screen', 'mweb-time-over-screen', 'mweb-chat-feedback-screen'].includes(sectionId)) {
        document.getElementById('mwebSelectBtn')?.classList.add('active');
        document.getElementById('appSelectBtn')?.classList.remove('active');
    } else if (sectionId.startsWith('app-')) {
        document.getElementById('mwebSelectBtn')?.classList.remove('active');
        document.getElementById('appSelectBtn')?.classList.add('active');
    }

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
            <!-- STATE A: GUEST (NOT LOGGED IN) -->
            <div class="gateway-form-card" id="gatewayGuestForm">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color:#111; font-size:18px; font-weight:800; margin-bottom:12px;">अपने भविष्य की बातें करें ✨</h3>
                    <div class="gateway-trust-row">
                        <span class="gateway-trust-pill" style="background:#FFF9C4; color:#F57F17; border-color:#FFF59D;">🎁 ${totalMinStr} मिनट मुफ़्त</span>
                        <span class="gateway-trust-pill" style="background:#E8F5E9; color:#2E7D32; border-color:#C8E6C9;">🛡️ 100% सुरक्षित</span>
                        <span class="gateway-trust-pill" style="background:#E3F2FD; color:#1565C0; border-color:#BBDEFB;">🤖 सटीक AI विश्लेषण</span>
                    </div>
                </div>

                <div class="light-input-group">
                    <i class="fa-solid fa-user"></i>
                    <input type="text" id="loginNameField" placeholder="अपना नाम दर्ज करें *" class="light-input-field" required>
                </div>

                <div class="light-input-group mb-20">
                    <div style="padding: 15px 10px 15px 15px; border-right: 1px solid #E5E7EB; display: flex; align-items: center; gap: 5px; color: #1F2937; font-weight: 600;">
                        <img src="https://flagcdn.com/w20/in.png" style="width:20px;"> +91
                    </div>
                    <input type="tel" id="loginPhoneField" placeholder="मोबाइल नंबर दर्ज करें *" class="light-input-field" style="padding-left: 15px;" required>
                    <i class="fa-solid fa-lock" style="color: #10B981;"></i>
                </div>
                
                <button class="orange-gradient-btn" onclick="simulateOTPStep()">
                    OTP भेजें और शुरू करें
                </button>
                <p style="text-align: center; font-size: 11px; color: #9CA3AF; margin-top: 15px;">लॉगिन करके आप हमारी नियम व शर्तों से सहमत हैं।</p>
            </div>

            <div class="gateway-form-card hidden" id="gatewayOTPForm">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color:#111; font-size:18px; font-weight:800; margin-bottom:8px;">OTP दर्ज करें 🔐</h3>
                    <p style="color:#6B7280; font-size:13px;">आपके मोबाइल नंबर पर भेजा गया 4 अंकों का कोड दर्ज करें।</p>
                </div>

                <div class="otp-boxes">
                    <input type="tel" maxlength="1" class="otp-box">
                    <input type="tel" maxlength="1" class="otp-box">
                    <input type="tel" maxlength="1" class="otp-box">
                    <input type="tel" maxlength="1" class="otp-box">
                </div>
                
                <button class="orange-gradient-btn" onclick="simulateLogin()">
                    सत्यापित करें और शुरू करें
                </button>
                <button class="cta-btn text-btn full-width mt-10" style="color: #9CA3AF;" onclick="goBackToFeed()">
                    वापस जाएं
                </button>
            </div>
        `;
    } else {
        if (remaining > 0) {
            // STATE B: LOGGED IN (TIME REMAINING)
            const isReturning = minutesUsedSeconds > 0;
            const badgeText = isReturning ? `⏱ ${remStr} मिनट अभी बाकी हैं` : `⏱ ${totalMinStr} मिनट बिल्कुल मुफ़्त`;
            const headlineText = 'अपने भविष्य के हर सवाल का जवाब जानें 🌟';
            const btnText = isReturning ? 'सेशन जारी रखें' : 'सेशन शुरू करें';

            container.innerHTML = `
            <div class="gateway-form-card" style="text-align: center;">
                <h3 style="color:#111; font-size:18px; font-weight:800; margin-bottom:15px;">${headlineText}</h3>
                
                <div class="mb-20">
                    <span style="background:#FFF9C4; color:#F57F17; font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: 20px; border: 1px solid #FFF59D; display: inline-block; margin-bottom: 15px;">${badgeText}</span>
                    <p style="color:#2E7D32; font-size: 13px; font-weight: 600;"><i class="fa-solid fa-shield-check"></i> आप सुरक्षित रूप से लॉग इन हैं।</p>
                </div>

                <button class="orange-gradient-btn mb-15" onclick="startSessionNow()">
                    ${btnText} <i class="fa-solid fa-arrow-right"></i>
                </button>
                <button class="cta-btn text-btn full-width" style="color: #6B7280;" onclick="goBackToFeed()">
                    वापस जाएं (Back)
                </button>
            </div>
        `;
        } else {
            // STATE C: LOGGED IN (TIME OVER)
            if (!isAppFlow) {
                document.getElementById('mwebAppDownloadSheet').classList.remove('hidden');
                return;
            } else {
                document.getElementById('appTimeOverFeedbackSheet').classList.remove('hidden');
                return;
            }

            container.innerHTML = `
                <div class="gateway-form-card" style="text-align: center;">
                    <i class="fa-solid fa-hourglass-end" style="font-size: 48px; color: #EF4444; margin-bottom: 20px;"></i>
                    <h3 style="color:#111; font-size:24px; font-weight:900; margin-bottom:12px;">आज का समय समाप्त हुआ! 🌅</h3>
                    <p style="color:#6B7280; font-size:15px; margin-bottom:24px;">आपकी ${totalMinStr} मिनट की फ्री कॉल लिमिट पूरी हो चुकी है। कल फिर से आएं और अपने भविष्य के बारे में जानें।</p>
                    
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
    document.getElementById('callInterface').classList.remove('hidden');
    setActiveFilter('callInterface');
    
    // Check if user is returning
    const isReturning = minutesUsedSeconds > 0;
    
    const btn = document.getElementById('primaryCallActionBtn');
    if (btn) {
        btn.innerHTML = isReturning ? '<i class="fa-solid fa-play"></i> सेशन जारी रखें' : '<i class="fa-solid fa-play"></i> सेशन शुरू करें';
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
    clearInterval(currentCallTimer);
    currentCallSeconds = 0;
    
    // Check if on app
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const maxTime = isApp ? 600 : 300;
    
    updateCallTimerUI();
    
    currentCallTimer = setInterval(() => {
        if (typeof isV2TimerPaused !== 'undefined' && isV2TimerPaused) return;
        currentCallSeconds++;
        updateCallTimerUI();
        
        // 1 Minute Warning
        if (currentCallSeconds === maxTime - 60) {
            showWarning4MinModal(); // Reusing the same 1-min warning modal UI
        }
        
        // End of call
        if (currentCallSeconds >= maxTime) {
            clearInterval(currentCallTimer);
            if (isApp) {
                showAppFeedbackSheet();
            } else {
                showStop5MinModal();
            }
        }
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
    document.getElementById('astroSidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.add('hidden');
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
    // These words all fit after "जानिए अपना ___" grammatically
    const words = [
        'करियर भविष्य',   // जानिए अपना करियर भविष्य
        'प्रेम का राज',     // जानिए अपना प्रेम का राज
        'धन का योग',      // जानिए अपना धन का योग
        'विवाह मुहूर्त', // जानिए अपना विवाह मुहूर्त
        'संतान सुख',      // जानिए अपना संतान सुख
        'ग्रह दोष',         // जानिए अपना ग्रह दोष
        'शत्रु से बचाव',   // जानिए अपना शत्रु से बचाव
        'भाग्य का रहस्य',  // जानिए अपना भाग्य का रहस्य
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWord() {
        const els = document.querySelectorAll('.tw-glow-word');
        if (!els.length) return;

        const currentWord = words[wordIndex];

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        const textToDisplay = currentWord.substring(0, charIndex);
        els.forEach(el => { el.textContent = textToDisplay; });

        let speed = isDeleting ? 45 : 85;

        if (!isDeleting && charIndex === currentWord.length) {
            speed = 2000; // Hold at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 400;
        }

        setTimeout(typeWord, speed);
    }

    setTimeout(typeWord, 1000);
});

/* ==========================================
   NEW MWEB REDESIGN LOGIC
   ========================================== */

function selectPlatform(platform) {
    document.getElementById('platformSelect').value = platform;
    updateNavigation();
}

function updateNavigation() {
    const platform = document.getElementById('platformSelect').value;
    const version = document.getElementById('versionSelect').value;
    
    document.querySelectorAll('.nav-screen-select').forEach(s => s.style.display = 'none');
    
    let targetSelectId = '';
    let defaultSection = '';
    if (version === 'v1') {
        targetSelectId = platform === 'mweb' ? 'mwebScreensSelect' : 'appScreensSelect';
        defaultSection = platform === 'mweb' ? 'mweb-feed' : 'app-feed';
    } else {
        targetSelectId = 'mwebV2ScreensSelect'; // App not supported in V2 demo
        defaultSection = 'mweb-v2-active-session';
    }
    
    const targetSelect = document.getElementById(targetSelectId);
    if (targetSelect) {
        targetSelect.style.display = 'block';
        targetSelect.selectedIndex = 0;
        eval(targetSelect.value);
    } else {
        if(defaultSection === 'mweb-v2-active-session') openV2Session('call'); else showSection(defaultSection, null);
    }
}

function startDemoFlow() {
    updateNavigation();
}

// Override banner click to go to start screen for Mweb
function handleBannerClick(source) {
    if (source === 'mweb') {
        showSection((document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active') ? 'app-' : 'mweb-') + 'start-login');
        // startSlider is now called automatically by showSection
    } else if (source === 'app') {
        showSection('app-splash');
    } else if (source === 'desktop') {
        openGatewayScreen();
    }
}

let currentAstro = 'priya';

const astroDetails = {
    priya: { name: 'डॉ. प्रिया वर्मा', image: 'assets/dr_priya_verma.png', specialty: 'करियर · प्रेम · रिश्ते विशेषज्ञ', tagline: '⭐ 4.9 · 10,000+ सेशन' },
    ajay: { name: 'डॉ. अजय शर्मा', image: 'assets/dr_ajay.png', specialty: 'व्यापार · धन · भविष्य विशेषज्ञ', tagline: '⭐ 4.8 · 8,500+ सेशन' },
    kirti: { name: 'डॉ. कीर्ति सिंह', image: 'assets/dr_kirti.png', specialty: 'विवाह · परिवार · संतान विशेषज्ञ', tagline: '⭐ 4.9 · 12,000+ सेशन' }
};

// Syncs the Ready-to-Call card in loggedInCallSection with the current slider
const sliderAstroOrder = ['priya', 'ajay', 'kirti'];
function syncReadyCallCard() {
    const astroId = sliderAstroOrder[sliderIndex] || 'priya';
    const details = astroDetails[astroId];
    if (!details) return;

    const avatarEl = document.getElementById('readyCallAstroAvatar');
    const nameEl = document.getElementById('readyCallAstroName');
    const specialtyEl = document.getElementById('readyCallAstroSpecialty');
    const taglineEl = document.getElementById('readyCallAstroTagline');

    if (avatarEl) avatarEl.src = details.image;
    if (nameEl) nameEl.textContent = details.name;
    if (specialtyEl) specialtyEl.textContent = details.specialty;
    if (taglineEl) taglineEl.textContent = details.tagline;
}

let sliderIndex = 0;
let sliderInterval;
let sliderTouchStartX = 0;
let sliderMouseStartX = 0;
let sliderIsDragging = false;

function getActiveSlider() {
    return document.querySelector('.view-section:not(.hidden) .login-slider');
}

function startSlider() {
    const slider = getActiveSlider();
    if (!slider) return;

    slider.scrollTo({ left: 0, behavior: 'instant' });
    sliderIndex = 0;

    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => scrollSlider(1), 5000);

    // Remove old listeners to avoid duplicates
    slider.removeEventListener('touchstart', sliderTouchStart);
    slider.removeEventListener('touchend', sliderTouchEnd);
    slider.removeEventListener('mousedown', sliderMouseDown);
    slider.removeEventListener('mouseup', sliderMouseUp);

    // Touch (mobile)
    slider.addEventListener('touchstart', sliderTouchStart, { passive: true });
    slider.addEventListener('touchend', sliderTouchEnd, { passive: true });

    // Mouse drag (desktop)
    slider.addEventListener('mousedown', sliderMouseDown);
    slider.addEventListener('mouseup', sliderMouseUp);
}

function sliderTouchStart(e) {
    sliderTouchStartX = e.changedTouches[0].screenX;
}
function sliderTouchEnd(e) {
    const diff = sliderTouchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 30) scrollSlider(diff > 0 ? 1 : -1);
}
function sliderMouseDown(e) {
    sliderMouseStartX = e.clientX;
    sliderIsDragging = true;
}
function sliderMouseUp(e) {
    if (!sliderIsDragging) return;
    sliderIsDragging = false;
    const diff = sliderMouseStartX - e.clientX;
    if (Math.abs(diff) > 30) scrollSlider(diff > 0 ? 1 : -1);
}


function scrollSlider(dir) {
    const slider = getActiveSlider();
    if (!slider) return;
    const cards = slider.querySelectorAll('.slider-card');
    const scrollAmount = slider.clientWidth;
    
    sliderIndex += dir;
    if (sliderIndex >= cards.length) {
        sliderIndex = 0;
    } else if (sliderIndex < 0) {
        sliderIndex = cards.length - 1;
    }
    
    // Reset interval when manual arrow is clicked
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        scrollSlider(1);
    }, 5000);
    
    slider.scrollTo({ left: sliderIndex * scrollAmount, behavior: 'smooth' });
    syncReadyCallCard();
}

function onSliderScroll(event) {
    const slider = event ? event.target : getActiveSlider();
    if (!slider) return;
    
    // Check if slider is visible before doing math
    if (slider.clientWidth === 0) return;
    
    const index = Math.round(slider.scrollLeft / slider.clientWidth);
    if (index !== sliderIndex) {
        sliderIndex = index;
        updateSliderDots();
        syncReadyCallCard();
        // Reset auto-slide timer on manual swipe
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => scrollSlider(1), 5000);
    }
}

function updateSliderDots() {
    const activeDotsContainer = document.querySelector('.view-section:not(.hidden) .slider-dots');
    if (!activeDotsContainer) return;
    const dots = activeDotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === sliderIndex);
    });
}

function initiateCallFlow(btn, ev) {
    if (ev) ev.stopPropagation();
    let astroId = 'priya';
    const parent = btn.closest('.astrologer-list-item');
    if (parent) {
        const onclickAttr = parent.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/'(.*?)'/);
            if (match) astroId = match[1];
        }
    }
    selectAstrologer(astroId);
    
    // Rotate through mic permissions or pick randomly
    const types = ['ios-chrome', 'android', 'ios-safari'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    showMicPermission(type, btn);
}

function openChatHistory(btn, ev) {
    if (ev) ev.stopPropagation();
    let astroId = 'priya';
    const parent = btn.closest('.astrologer-list-item');
    if (parent) {
        const onclickAttr = parent.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/'(.*?)'/);
            if (match) astroId = match[1];
        }
    }
    
    const astro = astroDetails[astroId] || astroDetails['priya'];
    
    document.getElementById('history-name').textContent = astro.name;
    document.getElementById('history-expertise').textContent = astro.specialty;
    document.getElementById('history-avatar').src = astro.image;
    
    // Update chat bubble names
    const historySection = document.getElementById('mweb-chat-history');
    if (historySection) {
        historySection.querySelectorAll('.bubble-header').forEach(el => {
            el.textContent = astro.name;
        });
    }
    
    // Default to showing the feedback prompt for demo purposes
    renderChatHistoryState('combined_feedback');
}

function renderChatHistoryState(state, btn) {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    
    if (btn) showSection(prefix + 'chat-history', btn);
    else showSection(prefix + 'chat-history');

    const activeSection = document.getElementById(prefix + 'chat-history');
    if (!activeSection) return;

    const activeContainer = activeSection.querySelector('#history-active-controls');
    const combinedContainer = activeSection.querySelector('#history-feedback-combined');
    const appPromoContainer = activeSection.querySelector('#history-app-promo');

    if(activeContainer) activeContainer.style.display = 'none';
    if(combinedContainer) combinedContainer.style.display = 'none';
    if(appPromoContainer) appPromoContainer.style.display = 'none';

    if (state === 'active' && activeContainer) {
        activeContainer.style.display = 'flex';
    } else if (state === 'combined_feedback' && combinedContainer) {
        combinedContainer.style.display = 'flex';
    } else if (state === 'app_promo' && appPromoContainer) {
        appPromoContainer.style.display = 'flex';
    }
}

function submitFeedbackFlow() {
    // Phase 2 implementation. For demo, we just transition to the splash screen.
    const prefix = (document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active')) ? 'app-' : 'mweb-'; showSection(prefix + 'splash-hybrid');
}

function selectAstrologer(astroId) {
    currentAstro = astroId;
    
    const details = astroDetails[astroId];
    if (details) {
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes('dr_priya_verma') || img.src.includes('dr_ajay') || img.src.includes('dr_kirti')) {
                // Update all astrologer images across the app, except in the slider, contact list, and hybrid/feed lists
                if(!img.closest('.slider-image-box') && !img.closest('#astro-contact-screen') && !img.closest('.astrologer-list-item') && !img.closest('.hybrid-listing-section')) { 
                    img.src = details.image;
                }
            }
        });
        
        document.querySelectorAll('.bubble-header, #appBannerTitle').forEach(el => {
            if (el.classList.contains('bubble-header')) {
                el.textContent = details.name;
            }
        });
    }

    // Removed scrollIntoView to prevent breaking fixed layout
    const nameField = document.querySelector('.login-input');
    if(nameField) setTimeout(() => nameField.focus(), 100);
}

// New function: select astrologer from contact list and go straight to call screen
let currentCallTimer = null;
let currentCallSeconds = 0;

function selectAndCallAstrologer(astroId) {
    if (astroId === "ajay") return;

    selectAstrologer(astroId);
    
    const details = astroDetails[astroId];
    if (!details) return;

    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";

    const dialingScreen = document.getElementById(prefix + "dialing");
    const callScreen = document.getElementById(prefix + "active-call");

    if (dialingScreen) {
        const avatar = dialingScreen.querySelector("#dialing-avatar");
        const name = dialingScreen.querySelector("#dialing-name");
        if (avatar) avatar.src = details.image;
        if (name) name.textContent = details.name;
    }
    
    if (callScreen) {
        const activeCallAvatar = callScreen.querySelector("#active-call-avatar");
        const activeCallName = callScreen.querySelector("#active-call-name");
        const activeCallExpertise = callScreen.querySelector("#active-call-expertise");
        const chatAvatar1 = callScreen.querySelector("#active-call-chat-avatar-1");
        const chatAvatar2 = callScreen.querySelector("#active-call-chat-avatar-2");

        if (activeCallAvatar) activeCallAvatar.src = details.image;
        if (activeCallName) activeCallName.textContent = details.name;
        if (activeCallExpertise) activeCallExpertise.textContent = details.specialty;
        if (chatAvatar1) chatAvatar1.src = details.image;
        if (chatAvatar2) chatAvatar2.src = details.image;
    }

    isMuted = false;
    isSpeaker = true;
    updateMuteUI();
    updateInterruptUI();

    showSection(prefix + "dialing");
    
    setTimeout(() => {
        const d = document.getElementById(prefix + "dialing");
        if (d && !d.classList.contains("hidden")) {
            showSection(prefix + "active-call");
            startCallTimer();
            if (!isMuted) {
                if (callScreen) {
                    const visualizer = callScreen.querySelector("#audio-visualizer");
                    if (visualizer) visualizer.classList.add("active");
                }
            }
        }
    }, 3000);
}

function endCall() {
    clearInterval(currentCallTimer);
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    const callScreen = document.getElementById(prefix + "active-call");
    if (callScreen) {
        const visualizer = callScreen.querySelector("#audio-visualizer");
        if (visualizer) visualizer.classList.remove("active");
    }
    showSection("astro-contact-screen");
}

function updateCallTimerUI() {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const maxTime = isApp ? 600 : 300;
    const remaining = Math.max(0, maxTime - currentCallSeconds);
    const rMin = Math.floor(remaining / 60);
    const rSec = remaining % 60;
    const timeStr = `${rMin.toString().padStart(2, '0')}:${rSec.toString().padStart(2, '0')}`;
    
    const callTimerEl = document.getElementById("call-timer");
    if (callTimerEl) callTimerEl.textContent = timeStr;
    
    const chatTimerEl = document.querySelector(".chat-time-display");
    if (chatTimerEl) chatTimerEl.textContent = timeStr;
}

function startCallTimer() {
    clearInterval(currentCallTimer);
    currentCallSeconds = 0;
    
    // Check if on app
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const maxTime = isApp ? 600 : 300;
    
    updateCallTimerUI();
    
    currentCallTimer = setInterval(() => {
        if (typeof isV2TimerPaused !== 'undefined' && isV2TimerPaused) return;
        currentCallSeconds++;
        updateCallTimerUI();
        
        // 1 Minute Warning
        if (currentCallSeconds === maxTime - 60) {
            showWarning4MinModal(); // Reusing the same 1-min warning modal UI
        }
        
        // End of call
        if (currentCallSeconds >= maxTime) {
            clearInterval(currentCallTimer);
            if (isApp) {
                showAppFeedbackSheet();
            } else {
                showStop5MinModal();
            }
        }
    }, 1000);
}

function showOneMinToast() {
    try {
        const container = document.getElementById('mweb-active-call');
        if (!container) return;
        
        // Try to play sound
        try {
            const audio = document.getElementById('toast-sound');
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio error:', e));
            }
        } catch(e) {}
        
        // Remove existing if any
        const existing = document.getElementById('dynamic-call-toast');
        if (existing) existing.remove();
        
        // Create new toast
        const toast = document.createElement('div');
        toast.id = 'dynamic-call-toast';
        toast.style.cssText = `
            position: absolute;
            left: 5%;
            width: 90%;
            background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
            border-radius: 12px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            z-index: 2147483647;
            top: 50%;
            transform: translateY(-50%) scale(0.8);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        `;
        
        toast.innerHTML = `
            <div style="background: rgba(255,255,255,0.2); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fa-solid fa-hourglass-half" style="color: #FFF; font-size: 16px;"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="color: #FFF; font-size: 14px; font-weight: 800; margin: 0 0 2px;">1 मिनट शेष</h4>
                <p style="color: rgba(255,255,255,0.9); font-size: 11px; margin: 0;">आपके फ्री परामर्श में केवल 1 मिनट शेष है।</p>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation (fade and scale in at center)
        setTimeout(() => {
            toast.style.transform = 'translateY(-50%) scale(1)';
            toast.style.opacity = '1';
        }, 50);
        
        // Hide and remove after 5s
        setTimeout(() => {
            toast.style.transform = 'translateY(-50%) scale(0.8)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    } catch(err) {
        console.error('Toast Error:', err);
    }
}

let isMuted = false;
function toggleMute() {
    isMuted = !isMuted;
    updateMuteUI();
}
function updateMuteUI() {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    const activeCallScreen = document.getElementById(prefix + "active-call");
    
    if (!activeCallScreen) return;
    
    const btn = activeCallScreen.querySelector("#mute-btn");
    const icon = activeCallScreen.querySelector("#mute-icon");
    const visualizer = activeCallScreen.querySelector("#audio-visualizer");
    if (!btn || !icon || !visualizer) return;
    
    if (isMuted) {
        btn.style.background = "#EF4444";
        btn.style.boxShadow = "0 4px 10px rgba(239,68,68,0.3)";
        icon.className = "fa-solid fa-microphone-slash";
        btn.classList.remove("mic-ripple");
        visualizer.classList.remove("active");
    } else {
        btn.style.background = "#10B981";
        btn.style.boxShadow = "0 4px 10px rgba(16,185,129,0.4)";
        icon.className = "fa-solid fa-microphone";
        btn.classList.add("mic-ripple");
        visualizer.classList.add("active");
    }
}

let isSpeaker = true;
function toggleInterrupt() {
    isSpeaker = !isSpeaker;
    updateInterruptUI();
}
function updateInterruptUI() {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    const activeCallScreen = document.getElementById(prefix + "active-call");
    
    if (!activeCallScreen) return;
    
    const btn = activeCallScreen.querySelector("#interrupt-btn");
    const icon = activeCallScreen.querySelector("#interrupt-icon");
    if (!btn || !icon) return;
    
    if (isSpeaker) {
        btn.style.background = "#10B981";
        btn.style.boxShadow = "0 4px 10px rgba(16,185,129,0.4)";
        icon.className = "fa-solid fa-volume-high";
    } else {
        btn.style.background = "#444";
        btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
        icon.className = "fa-solid fa-volume-xmark";
    }
}

const originalShowSection = window.showSection;
window.showSection = function(sectionId, btn) {
    if(originalShowSection) originalShowSection(sectionId, btn);
    if (sectionId === 'mweb-start-login' || sectionId === 'app-start-login' || sectionId === 'mweb-logged-in-splash' || sectionId === 'mweb-splash-hybrid') {
        startSlider();
    } else {
        clearInterval(sliderInterval);
    }
};

function showOtpSection() {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const activeSection = document.getElementById(isApp ? "app-start-login" : "mweb-start-login");
    if (!activeSection) return;
    
    const loginInput = activeSection.querySelector("#loginInputSection");
    if (loginInput) loginInput.classList.add("hidden");
    
    const trustBadges = activeSection.querySelector("#loginTrustBadges");
    if (trustBadges) trustBadges.classList.add("hidden");
    
    const mainText = activeSection.querySelector("#loginMainText");
    if (mainText) mainText.classList.add("hidden");

    const otpInput = activeSection.querySelector("#otpInputSection");
    if (otpInput) otpInput.classList.remove("hidden");

    // Simulate auto-reading SMS and filling OTP
    setTimeout(() => {
        const boxes = activeSection.querySelectorAll(".otp-box");
        if (boxes.length >= 4) {
            boxes[0].value = "8";
            boxes[1].value = "5";
            boxes[2].value = "2";
            boxes[3].value = "9";
            
            // Auto-submit after filling
            setTimeout(() => {
                verifyOtpAndProceed();
            }, 800);
        }
    }, 1500);
}

let demoOtpInterval = null;

function startDemoOtpTimer(btnElement) {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    showSection(prefix + 'otp-timer', btnElement);
    
    clearInterval(demoOtpInterval);
    
    let secondsLeft = 60;
    const timerDisplay = document.getElementById('demo-otp-timer-display');
    const resendBtn = document.getElementById('demo-otp-resend-btn');
    
    if (timerDisplay) {
        timerDisplay.style.display = 'block';
        timerDisplay.innerHTML = `Resend OTP in <span style="color: #FFF;">00:60</span>`;
    }
    if (resendBtn) resendBtn.style.display = 'none';
    
    demoOtpInterval = setInterval(() => {
        secondsLeft--;
        
        if (timerDisplay) {
            let secs = secondsLeft < 10 ? '0' + secondsLeft : secondsLeft;
            timerDisplay.innerHTML = `Resend OTP in <span style="color: #FFF;">00:${secs}</span>`;
        }
        
        if (secondsLeft <= 0) {
            clearInterval(demoOtpInterval);
            if (timerDisplay) timerDisplay.style.display = 'none';
            if (resendBtn) resendBtn.style.display = 'block';
            
            // Redirect after 1.5 seconds to show the resend button briefly
            setTimeout(simulateTimeoutRedirect, 1500);
        }
    }, 1000); // 1-second ticks
}

function simulateTimeoutRedirect() {
    // Automatically redirect to the main login screen with fields pre-filled
    const btn = document.querySelector('button[onclick="showSection(\\\'mweb-start-login\\\', this)"]');
    if (btn) showSection('mweb-start-login', btn);
    else showSection((document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active') ? 'app-' : 'mweb-') + 'start-login');
    
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    const loginSection = document.getElementById(prefix + 'start-login');
    if (loginSection) {
        const nameInput = loginSection.querySelector('input[placeholder="आपका शुभ नाम"]');
        const phoneInput = loginSection.querySelector('input[placeholder="मोबाइल नंबर"]');
        
        if (nameInput) nameInput.value = "Kavita";
        if (phoneInput) phoneInput.value = "9876543210";
        
        const loginInputSection = loginSection.querySelector('#loginInputSection');
        const otpInputSection = loginSection.querySelector('#otpInputSection');
        
        if (loginInputSection) loginInputSection.classList.remove('hidden');
        if (otpInputSection) otpInputSection.classList.add('hidden');
    }
}


// Jump directly to showing the Login input fields (used by filter button '3. Login Screen')
function showLoginStep() {
    // Make sure the login screen is visible and reset to login input state
    const loginInput = document.getElementById('loginInputSection');
    const otpInput = document.getElementById('otpInputSection');
    const trustBadges = document.getElementById('loginTrustBadges');
    const mainText = document.getElementById('loginMainText');
    const callSection = document.getElementById('loggedInCallSection');

    if (loginInput) loginInput.classList.remove('hidden');
    if (otpInput) otpInput.classList.add('hidden');
    if (trustBadges) trustBadges.classList.remove('hidden');
    if (mainText) mainText.classList.remove('hidden');
    if (callSection) callSection.classList.add('hidden');

    // Update filter to show '3. Login Screen'
    document.querySelectorAll('.demo-btn, .demo-btn-outline').forEach(b => b.classList.remove('active'));
    const mwebBtn = document.getElementById('mwebSelectBtn');
    if (mwebBtn) mwebBtn.classList.add('active');
    const loginFilterBtn = document.querySelectorAll('#mweb-filters .demo-btn-outline')[1];
    if (loginFilterBtn) loginFilterBtn.classList.add('active');
}

function moveToNextOtp(current, nextFieldID) {
    if (current.value.length >= current.maxLength) {
        if(nextFieldID) {
            document.getElementById(nextFieldID).focus();
        }
    }
}

function verifyOtpAndProceed() {
    selectAndCallAstrologer('priya');
}

// Device Mockup Toggle
function toggleMockup(os) {
    const noMockupBtn = document.getElementById('btn-no-mockup');
    const iosMockupBtn = document.getElementById('btn-ios-mockup');
    const androidMockupBtn = document.getElementById('btn-android-mockup');
    
    if(noMockupBtn) noMockupBtn.classList.remove('active');
    if(iosMockupBtn) iosMockupBtn.classList.remove('active');
    if(androidMockupBtn) androidMockupBtn.classList.remove('active');
    
    // Apply to phone-stage wrapper so chrome renders OUTSIDE overflow:hidden
    const stage = document.getElementById('phoneStage');
    if (stage) {
        stage.classList.remove('device-ios', 'device-android');
        if (os === 'ios') stage.classList.add('device-ios');
        else if (os === 'android') stage.classList.add('device-android');
    }

    if (os === 'none' && noMockupBtn) noMockupBtn.classList.add('active');
    else if (os === 'ios' && iosMockupBtn) iosMockupBtn.classList.add('active');
    else if (os === 'android' && androidMockupBtn) androidMockupBtn.classList.add('active');
}

// ==========================================
// MWEB SPLASH SCREEN LOGIC
// ==========================================
let splashIndex = 0;
let splashInterval;
let splashTouchStartX = 0;
let splashMouseStartX = 0;
let splashIsDragging = false;

function getActiveSplashSlider() {
    return document.querySelector('.view-section:not(.hidden) .splash-slider');
}

function startSplashSlider() {
    const slider = getActiveSplashSlider();
    if (!slider) return;

    slider.scrollTo({ left: 0, behavior: 'instant' });
    splashIndex = 0;
    updateSplashDots();

    // Manual swipe disabled per user request
}

function splashTouchStart(e) {
    splashTouchStartX = e.changedTouches[0].screenX;
}
function splashTouchEnd(e) {
    const diff = splashTouchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 30) scrollSplash(diff > 0 ? 1 : -1);
}
function splashMouseDown(e) {
    splashMouseStartX = e.clientX;
    splashIsDragging = true;
}
function splashMouseUp(e) {
    if (!splashIsDragging) return;
    splashIsDragging = false;
    const diff = splashMouseStartX - e.clientX;
    if (Math.abs(diff) > 30) scrollSplash(diff > 0 ? 1 : -1);
}

function scrollSplash(dir) {
    const slider = getActiveSplashSlider();
    if (!slider) return;
    const slides = slider.querySelectorAll('.splash-slide');
    const scrollAmount = slider.clientWidth;
    
    splashIndex += dir;
    if (splashIndex >= slides.length) {
        splashIndex = 0;
    } else if (splashIndex < 0) {
        splashIndex = slides.length - 1;
    }
    
    slider.scrollTo({ left: splashIndex * scrollAmount, behavior: 'smooth' });
}

function onSplashScroll(event) {
    const slider = event ? event.target : getActiveSplashSlider();
    if (!slider || slider.clientWidth === 0) return;
    const index = Math.round(slider.scrollLeft / slider.clientWidth);
    if (index !== splashIndex) {
        splashIndex = index;
        updateSplashDots();
    }
}

function updateSplashDots() {
    const activeDotsContainer = document.querySelector('.view-section:not(.hidden) .splash-dots');
    if (!activeDotsContainer) return;
    const dots = activeDotsContainer.querySelectorAll('.splash-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === splashIndex);
    });
}

function splashGoBack() {
    if (splashIndex > 0) {
        scrollSplash(-1);
    } else {
        goBackToFeed();
    }
}

function skipSplash() {
    if (document.getElementById('mwebSelectBtn').classList.contains('active')) {
        showSection((document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active') ? 'app-' : 'mweb-') + 'start-login');
    } else {
        showSection('app-start-login');
    }
}


// ==========================================
// APP FEEDBACK SHEET LOGIC
// ==========================================
function selectEmoji(el) {
    const row = el.closest(".emoji-rating-row");
    row.querySelectorAll(".emoji-btn").forEach(btn => btn.classList.remove("active"));
    el.classList.add("active");
}

function toggleTag(el) {
    el.classList.toggle("active");
}

function submitFeedback() {
    document.getElementById("appFeedbackSheet").classList.add("hidden");
    goBackToFeed();
}

function showAppFeedbackSheet() {
    showSection('app-time-over-screen');
}

// ==========================================
// IN-CHAT FEEDBACK LOGIC
// ==========================================
let feedbackStep = 0;

function startFeedbackFlow(btn) {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    const minText = isApp ? "10" : "5";

    if(btn) {
        showSection(prefix + 'chat-feedback-screen', btn);
    } else {
        showSection(prefix + 'chat-feedback-screen');
    }
    
    const chatContainer = document.getElementById('feedback-chat-container');
    const optionsContainer = document.getElementById('feedback-options-container');
    
    // Reset state
    feedbackStep = 0;
    chatContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    
    // Initial greeting from AI
    setTimeout(() => {
        renderFeedbackMessage('ai', `आपके ${minText} मिनट समाप्त हो गए हैं। आपसे बात करके बहुत अच्छा लगा। और बात करने के लिए कल वापस आएं। कृपया अपना फीडबैक शेयर करें।`);
        
        setTimeout(() => {
            renderFeedbackOptions([
                { text: 'फीडबैक दें', action: 'start_questions' },
                { text: 'वापस अमर उजाला पर जाएं', action: 'go_home' }
            ]);
        }, 800);
    }, 500);
}

function renderFeedbackMessage(sender, text) {
    const chatContainer = document.getElementById('feedback-chat-container');
    const msgDiv = document.createElement('div');
    msgDiv.style.display = 'flex';
    msgDiv.style.gap = '10px';
    msgDiv.style.maxWidth = '85%';
    
    if (sender === 'ai') {
        msgDiv.style.alignSelf = 'flex-start';
        msgDiv.innerHTML = `
            <img src="assets/dr_priya_verma.png" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" alt="Astro">
            <div style="background: rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 20px 20px 20px 0; border: 1px solid rgba(255,255,255,0.05);">
                <p style="color: #FFF; font-size: 14px; margin: 0; line-height: 1.5;">${text}</p>
            </div>
        `;
    } else {
        msgDiv.style.alignSelf = 'flex-end';
        msgDiv.innerHTML = `
            <div style="background: rgba(255,215,0,0.9); padding: 12px 16px; border-radius: 20px 20px 0 20px; box-shadow: 0 4px 12px rgba(255,215,0,0.15);">
                <p style="color: #0B0E1A; font-size: 14px; font-weight: 600; margin: 0; line-height: 1.4;">${text}</p>
            </div>
            <img src="assets/user_avatar.png" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" alt="User">
        `;
    }
    
    chatContainer.appendChild(msgDiv);
    scrollFeedbackChat();
}

function scrollFeedbackChat() {
    const chatContainer = document.getElementById('feedback-chat-container');
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
}

function renderFeedbackOptions(options) {
    const optionsContainer = document.getElementById('feedback-options-container');
    optionsContainer.innerHTML = '';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.text;
        btn.style.width = '100%';
        
        if (opt.action === 'go_home') {
            btn.style.background = 'transparent';
            btn.style.color = 'rgba(255, 255, 255, 0.8)';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            btn.style.boxShadow = 'none';
        } else {
            btn.style.background = '#FBBF24';
            btn.style.color = '#111827';
            btn.style.border = 'none';
        }
        
        btn.style.padding = '12px';
        btn.style.borderRadius = '12px';
        btn.style.fontSize = '14px';
        btn.style.fontWeight = '700';
        btn.style.cursor = 'pointer';
        
        if (opt.action !== 'go_home') {
            btn.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.25)';
        }
        
        btn.onclick = () => handleFeedbackAction(opt);
        optionsContainer.appendChild(btn);
    });
}

function renderStarRating() {
    const optionsContainer = document.getElementById('feedback-options-container');
    optionsContainer.innerHTML = '';
    
    const starContainer = document.createElement('div');
    starContainer.style.display = 'flex';
    starContainer.style.justifyContent = 'center';
    starContainer.style.gap = '15px';
    starContainer.style.width = '100%';
    starContainer.style.padding = '10px 0';
    
    for(let i=1; i<=5; i++) {
        const star = document.createElement('i');
        star.className = 'fa-solid fa-star';
        star.style.color = 'rgba(255,255,255,0.2)';
        star.style.fontSize = '28px';
        star.style.cursor = 'pointer';
        star.style.transition = 'color 0.2s';
        
        star.onmouseover = () => {
            const stars = starContainer.children;
            for(let j=0; j<stars.length; j++) {
                if(j < i) stars[j].style.color = '#FFD700';
                else stars[j].style.color = 'rgba(255,255,255,0.2)';
            }
        };
        
        starContainer.onmouseleave = () => {
            const stars = starContainer.children;
            for(let j=0; j<stars.length; j++) {
                stars[j].style.color = 'rgba(255,255,255,0.2)';
            }
        };
        
        star.onclick = () => {
            handleFeedbackAction({ text: `${i} स्टार`, action: 'rate' });
        };
        
        starContainer.appendChild(star);
    }
    
    optionsContainer.appendChild(starContainer);
}

function handleFeedbackAction(opt) {
    renderFeedbackMessage('user', opt.text);
    
    const optionsContainer = document.getElementById('feedback-options-container');
    optionsContainer.innerHTML = '';
    
    setTimeout(() => {
        if (opt.action === 'go_home') {
            renderFeedbackMessage('ai', 'धन्यवाद! आपका दिन शुभ हो।');
            setTimeout(() => {
                goBackToFeed();
            }, 1500);
            return;
        }
        
        if (opt.action === 'start_questions') {
            feedbackStep = 1;
            askNextQuestion();
            return;
        }
        
        if (opt.action === 'answer' || opt.action === 'rate') {
            feedbackStep++;
            askNextQuestion();
        }
    }, 500);
}

function askNextQuestion() {
    switch(feedbackStep) {
        case 1:
            renderFeedbackMessage('ai', 'आपने ज्योतिषी से मुख्य रूप से किस विषय पर बात की?');
            setTimeout(() => {
                renderFeedbackOptions([
                    { text: 'करियर / नौकरी', action: 'answer' },
                    { text: 'प्रेम / विवाह', action: 'answer' },
                    { text: 'धन / संपत्ति', action: 'answer' },
                    { text: 'अन्य', action: 'answer' }
                ]);
            }, 600);
            break;
        case 2:
            renderFeedbackMessage('ai', 'ज्योतिषी के उत्तर से आप कितने प्रतिशत संतुष्ट हैं?');
            setTimeout(() => {
                renderFeedbackOptions([
                    { text: '100% (पूरी तरह)', action: 'answer' },
                    { text: 'लगभग 75%', action: 'answer' },
                    { text: '50% से कम', action: 'answer' }
                ]);
            }, 600);
            break;
        case 3:
            renderFeedbackMessage('ai', 'क्या ज्योतिषी ने आपके मुख्य प्रश्न का स्पष्ट उत्तर दिया?');
            setTimeout(() => {
                renderFeedbackOptions([
                    { text: 'हाँ, बिल्कुल स्पष्ट', action: 'answer' },
                    { text: 'आंशिक रूप से', action: 'answer' },
                    { text: 'नहीं', action: 'answer' }
                ]);
            }, 600);
            break;
        case 4:
            renderFeedbackMessage('ai', 'आप इस सेवा को अपने दोस्तों को रिकमेंड करने की कितनी संभावना रखते हैं (1-10)?');
            setTimeout(() => {
                renderFeedbackOptions([
                    { text: '10 (ज़रूर करेंगे)', action: 'answer' },
                    { text: '5 (शायद करें)', action: 'answer' },
                    { text: '1 (बिल्कुल नहीं)', action: 'answer' }
                ]);
            }, 600);
            break;
        case 5:
            renderFeedbackMessage('ai', 'क्या आप भविष्य में पेड (Paid) सर्विस के लिए 10-20 रुपये/मिनट देना चाहेंगे?');
            setTimeout(() => {
                renderFeedbackOptions([
                    { text: 'हाँ, बिल्कुल', action: 'answer' },
                    { text: 'शायद, अगर ज़रूरत पड़ी', action: 'answer' },
                    { text: 'नहीं', action: 'answer' }
                ]);
            }, 600);
            break;
        case 6:
            renderFeedbackMessage('ai', 'अंत में, कृपया अपने अनुभव को रेटिंग दें:');
            setTimeout(() => {
                renderStarRating();
            }, 600);
            break;
        case 7:
            renderFeedbackMessage('ai', 'आपके कीमती समय और फीडबैक के लिए बहुत-बहुत धन्यवाद! 🙏');
            setTimeout(() => {
                renderFeedbackOptions([
                    { text: 'होम पर जाएं', action: 'go_home' },
                    { text: 'वापस अमर उजाला पर जाएं', action: 'go_home' }
                ]);
            }, 800);
            break;
    }
}

// ==========================================
// SPLASH SCREEN STATES LOGIC
// ==========================================
function renderSplashState(state, btn) {
    const isApp = document.getElementById("appSelectBtn") && document.getElementById("appSelectBtn").classList.contains("active");
    const prefix = isApp ? "app-" : "mweb-";
    const minText = isApp ? "10" : "5";
    const minTextHindi = isApp ? "10" : "5";

    if(btn) {
        showSection(prefix + 'splash-hybrid', btn);
    } else {
        const prefix = (document.getElementById('appSelectBtn') && document.getElementById('appSelectBtn').classList.contains('active')) ? 'app-' : 'mweb-'; showSection(prefix + 'splash-hybrid');
    }
    
    const activeSection = document.getElementById(prefix + 'splash-hybrid');
    if (!activeSection) return;

    const headerTitle = activeSection.querySelector('#hybrid-header-title');
    const headerSubtitle = activeSection.querySelector('#hybrid-header-subtitle');
    const headerTimer = activeSection.querySelector('#hybrid-header-timer');
    const bottomCta = activeSection.querySelector('#hybrid-bottom-cta');
    const fixedNudge = activeSection.querySelector('#hybrid-fixed-bottom-nudge');
    const basicNudge = activeSection.querySelector('#hybrid-basic-bottom-nudge');
    const callBtns = activeSection.querySelectorAll('.hybrid-call-btn');
    const chatBtns = activeSection.querySelectorAll('.hybrid-chat-btn');

    // Reset nudge state
    if (fixedNudge) {
        fixedNudge.style.display = 'none';
        fixedNudge.style.transform = 'translate(-50%, 0)';
    }
    if (basicNudge) {
        basicNudge.style.display = 'none';
        basicNudge.style.transform = 'translate(-50%, 0)';
    }

    if (state === 'active') {
        headerTitle.innerHTML = `अपना ज्योतिषी चुनें`;
        headerSubtitle.innerHTML = 'करियर, प्रेम या धन... अपने हर सवाल का सटीक जवाब पाएं।';
        headerSubtitle.className = 'glow-gold';
        headerSubtitle.style.color = '#FDE047';
        headerSubtitle.style.fontSize = '17px';
        headerSubtitle.style.display = 'block';
        
        headerTimer.innerHTML = `<i class="fa-regular fa-clock"></i> आपका आज का शेष समय: ${minText.padStart(2, '0')}:00 मिनट`;
        headerTimer.style.color = '#FFD700';
        headerTimer.style.background = '';
        headerTimer.style.border = '';
        headerTimer.style.padding = '';
        headerTimer.style.display = 'inline-flex';
        
        if (bottomCta) {
            bottomCta.style.display = 'none';
            bottomCta.innerHTML = '';
        }
        
        callBtns.forEach(b => b.style.display = 'flex');
        chatBtns.forEach(b => {
            b.style.display = 'flex';
            b.style.fontSize = '11px';
        });
    } 
    else if (state === 'ended_basic') {
        headerTitle.innerHTML = 'आज का समय समाप्त';
        headerSubtitle.innerHTML = '';
        headerSubtitle.style.display = 'none';
        
        const backLinkHtml = isApp ? "" : `
                <div onclick="goBackToFeed()" style="color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 4px;">
                    <i class="fa-solid fa-arrow-left" style="margin-right: 4px;"></i> वापस अमर उजाला पर जाएं
                </div>`;

        headerTimer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 10px;">
                <div style="color: #FFF; font-size: 18px; font-weight: 800; text-align: center; line-height: 1.4;">${minText} मिनट पूरे हुए! ⏱️ कल फिर आएं ✨</div>
                ${backLinkHtml}
            </div>
        `;
        headerTimer.style.color = '';
        headerTimer.style.background = 'transparent';
        headerTimer.style.border = 'none';
        headerTimer.style.padding = '0';
        headerTimer.style.display = 'block';
        
        if (bottomCta) {
            bottomCta.style.display = 'none';
            bottomCta.innerHTML = '';
        }
        
        if (basicNudge) {
            basicNudge.style.display = 'none';
        }
        
        callBtns.forEach(b => b.style.display = 'none');
        chatBtns.forEach(b => { b.style.display = 'flex'; b.style.fontSize = '14px'; });
    }
    else if (state === 'ended_app') {
        headerTitle.innerHTML = `<span style="font-size: 22px;">⏱️ ${minText} मिनट पूरे हो गए हैं</span>`;
        headerSubtitle.innerHTML = '';
        headerSubtitle.style.display = 'none';
        
        headerTimer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 10px;">
                <div style="color: #FFF; font-size: 16px; font-weight: 800; text-align: center; line-height: 1.4;">अमर उजाला ऐप पर रोज़ 10 मिनट फ्री बात करें ✨</div>
                <button onclick="downloadApp()" style="width: 100%; max-width: 220px; background: linear-gradient(90deg, #FBBF24, #F59E0B); color: #000; border: none; border-radius: 12px; padding: 12px 20px; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="assets/au_logo.png" style="width: 24px; height: 24px; object-fit: contain;" onerror="this.src='https://amarujala.com/favicon.ico'">
                        <span>ऐप डाउनलोड करें</span>
                    </div>
                    <i class="fa-solid fa-download"></i>
                </button>
                <div onclick="goBackToFeed()" style="color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 4px;">
                    <i class="fa-solid fa-arrow-left" style="margin-right: 4px;"></i> वापस अमर उजाला पर जाएं
                </div>
            </div>
        `;
        headerTimer.style.color = '';
        headerTimer.style.background = 'transparent';
        headerTimer.style.border = 'none';
        headerTimer.style.padding = '0';
        headerTimer.style.display = 'block';
        
        if (bottomCta) {
            bottomCta.style.display = 'none';
            bottomCta.innerHTML = '';
        }
        
        if (fixedNudge) {
            fixedNudge.style.display = 'none';
        }
        
        callBtns.forEach(b => b.style.display = 'none');
        chatBtns.forEach(b => { b.style.display = 'flex'; b.style.fontSize = '14px'; });
    }
}

// ==========================================
// IN-CHAT TOAST TEST LOGIC
// ==========================================
function showInChatToast(btn) {
    showSection('mweb-toast-test-screen', btn);
    
    const chatBox = document.getElementById('toast-test-chat-box');
    if (!chatBox) return;
    
    const screen = document.getElementById('mweb-toast-test-screen');
    
    // Create the overlay toast bubble
    const toastElem = document.createElement('div');
    toastElem.style.position = 'absolute';
    toastElem.style.bottom = '180px'; // Positioned higher per user request
    toastElem.style.left = '50%';
    toastElem.style.width = '90%';
    toastElem.style.maxWidth = '340px';
    toastElem.style.background = 'linear-gradient(135deg, #FF9800 0%, #F97316 100%)';
    toastElem.style.borderRadius = '16px';
    toastElem.style.padding = '14px 18px';
    toastElem.style.display = 'flex';
    toastElem.style.alignItems = 'center';
    toastElem.style.gap = '12px';
    toastElem.style.boxShadow = '0 10px 25px rgba(249, 115, 22, 0.4)';
    toastElem.style.zIndex = '50';
    toastElem.style.opacity = '0';
    toastElem.style.transform = 'translate(-50%, 150%)'; // Start hidden below
    toastElem.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    toastElem.innerHTML = `
        <div style="background: rgba(255,255,255,0.25); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fa-solid fa-hourglass-half" style="color: #FFF; font-size: 16px;"></i>
        </div>
        <div style="flex: 1;">
            <h4 style="color: #FFF; font-size: 15px; font-weight: 800; margin: 0 0 2px;">1 मिनट शेष</h4>
            <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 0; line-height: 1.3;">आपके फ्री परामर्श में केवल 1 मिनट शेष है।</p>
        </div>
    `;
    
    screen.appendChild(toastElem);
    
    // Prepare chatBox for smooth shifting
    chatBox.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Animate in: slide toast up and shift chat up
    setTimeout(() => {
        toastElem.style.opacity = '1';
        toastElem.style.transform = 'translate(-50%, 0)';
        chatBox.style.transform = 'translateY(-120px)';
    }, 100);
    
    // Remove after 5 seconds: slide toast down and chat back to original
    setTimeout(() => {
        toastElem.style.opacity = '0';
        toastElem.style.transform = 'translate(-50%, 150%)';
        chatBox.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            if(screen.contains(toastElem)) {
                screen.removeChild(toastElem);
            }
            chatBox.style.transition = ''; // Reset transition
        }, 500);
    }, 5000);
}

// ==========================================
// NATIVE MIC PERMISSION MOCKUPS LOGIC
// ==========================================
function renderDialingState(state, btn) {
    if (btn) showSection('mweb-dialing', btn);
    else showSection('mweb-dialing');

    const connectingContainer = document.getElementById('dialing-status-connecting');
    const noMicContainer = document.getElementById('dialing-status-no-mic');

    if (connectingContainer && noMicContainer) {
        if (state === 'connecting') {
            connectingContainer.style.display = 'block';
            noMicContainer.style.display = 'none';
        } else if (state === 'no_mic') {
            connectingContainer.style.display = 'none';
            noMicContainer.style.display = 'flex';
        }
    }
}

function showMicPermission(type, btn) {
    // 1. First ensure we are on the dialing screen in connecting state since that's where the request happens
    renderDialingState('connecting', btn);
    
    // 2. Hide all existing native modals first
    document.querySelectorAll('.native-modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // 3. Show the requested modal
    let modalId = '';
    if (type === 'ios-chrome') modalId = 'modal-ios-chrome';
    else if (type === 'android') modalId = 'modal-android';
    else if (type === 'ios-safari') modalId = 'modal-ios-safari';
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeMicPermission() {
    document.querySelectorAll('.native-modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

function retryMicPermission() {
    showMicPermission('android');
}

// ==========================================
// SCROLL LISTENER FOR HYBRID APP PROMO NUDGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const listSection = document.querySelector('.hybrid-listing-section');
    if (listSection) {
        let lastHybridScrollY = 0;
        listSection.addEventListener('scroll', function() {
            const currentScrollY = this.scrollTop;
            const fixedNudge = document.getElementById('hybrid-fixed-bottom-nudge');
            const basicNudge = document.getElementById('hybrid-basic-bottom-nudge');
            
            // Determine which nudge is active
            let activeNudge = null;
            if (fixedNudge && fixedNudge.style.display === 'flex') {
                activeNudge = fixedNudge;
            } else if (basicNudge && basicNudge.style.display === 'flex') {
                activeNudge = basicNudge;
            }
            
            if (!activeNudge) return;
            
            if (currentScrollY > lastHybridScrollY + 1) {
                // Scrolling down -> hide
                activeNudge.style.transform = 'translate(-50%, 150%)';
            } else if (currentScrollY < lastHybridScrollY - 1) {
                // Scrolling up -> show
                activeNudge.style.transform = 'translate(-50%, 0)';
            }
            lastHybridScrollY = currentScrollY;
        });
    }

    // ==========================================
    // GLOBAL MOBILE OS STATUS BAR INJECTOR
    // ==========================================
    // Automatically injects time, wifi, and battery icons into every mobile screen
    const statusBarHTML = `
        <div class="os-status-bar" style="position: absolute; top: 12px; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 28px; z-index: 9999; pointer-events: none; color: #FFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; box-sizing: border-box; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">
            <div class="os-time" style="margin-top: 2px; letter-spacing: 0.5px;">9:41</div>
            <div class="os-icons" style="display: flex; gap: 6px; align-items: center;">
                <i class="fa-solid fa-signal" style="font-size: 10px;"></i>
                <i class="fa-solid fa-wifi" style="font-size: 11px;"></i>
                <i class="fa-solid fa-battery-full" style="font-size: 15px;"></i>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.mobile-frame').forEach(frame => {
        if (!frame.querySelector('.os-status-bar')) {
            frame.insertAdjacentHTML('afterbegin', statusBarHTML);
        }
    });
});

function goBackToAppFeed() {
    closeAllModals();
    closeAllSheets();
    const btn = document.querySelectorAll('#app-filters .demo-btn-outline')[0];
    showSection('app-feed', btn);
    lastFeedSource = 'app-feed';
}




// Unified V2 Session Logic
function openV2Session(mode, isFreshConnection = false) {
    showSection('mweb-v2-active-session', null);
    switchV2SessionMode(mode, isFreshConnection);
}

function switchV2SessionMode(mode, isFreshConnection = false) {
    const callControls = document.getElementById('v2-call-controls');
    const chatControls = document.getElementById('v2-chat-controls');
    const switchToChatBtn = document.getElementById('switch-to-chat-btn');
    const switchToCallBtn = document.getElementById('switch-to-call-btn');
    const dynamicIslandTimer = document.getElementById('chat-dynamic-island-timer');
    
    if (dynamicIslandTimer) {
        dynamicIslandTimer.style.display = mode === 'chat' ? 'flex' : 'none';
    }
    
    if (mode === 'chat') {
        // Hide Call Controls (Scale down and fade out)
        if (callControls) {
            callControls.style.transform = 'translateX(-50%) scale(0.8)';
            callControls.style.opacity = '0';
            callControls.style.pointerEvents = 'none';
        }

        if (isFreshConnection) {
            // Give it a tiny delay to feel natural
            setTimeout(injectV2ChatGreeting, 800);
        }
    
        
        // Show Chat Controls (Slide up and fade in)
        if (chatControls) {
            chatControls.style.transform = 'translateY(0)';
            chatControls.style.opacity = '1';
            chatControls.style.pointerEvents = 'auto';
        }
        
        // Swap Header Buttons
        if (switchToChatBtn) switchToChatBtn.style.display = 'none';
        if (switchToCallBtn) {
            switchToCallBtn.style.display = 'flex';
            // Pop animation on appearance
            switchToCallBtn.style.transform = 'scale(0.8)';
            requestAnimationFrame(() => {
                switchToCallBtn.style.transform = 'scale(1)';
            });
        }
        
    } else {
        // Show Call Controls (Scale up and fade in)
        if (callControls) {
            callControls.style.transform = 'translateX(-50%) scale(1)';
            callControls.style.opacity = '1';
            callControls.style.pointerEvents = 'auto';
        }
        
        // Hide Chat Controls (Slide down and fade out)
        if (chatControls) {
            chatControls.style.transform = 'translateY(100%)';
            chatControls.style.opacity = '0';
            chatControls.style.pointerEvents = 'none';
        }
        
        // Swap Header Buttons
        if (switchToCallBtn) switchToCallBtn.style.display = 'none';
        if (switchToChatBtn) {
            switchToChatBtn.style.display = 'flex';
            switchToChatBtn.style.transform = 'scale(0.8)';
            requestAnimationFrame(() => {
                switchToChatBtn.style.transform = 'scale(1)';
            });
        }
        
        // Trigger TTS feedback when switching to call mode
        if ('speechSynthesis' in window && isFreshConnection) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance();
            msg.text = "Hello navya ji continue karte hain";
            msg.lang = 'hi-IN';
            msg.rate = 0.95;
            window.speechSynthesis.speak(msg);
        }
    }
}


// ==========================================
// V2 DIALING AND CONNECTION LOGIC
// ==========================================

function startV2CallConnection(btn) {
    if (btn) showSection('mweb-v2-dialing', btn);
    else showSection('mweb-v2-dialing');

    const connectingContainer = document.getElementById('v2-dialing-status-connecting');
    const noMicContainer = document.getElementById('v2-dialing-status-no-mic');
    const ringtone = document.getElementById('v2-dialing-ringtone');

    if (connectingContainer && noMicContainer) {
        connectingContainer.style.display = 'block';
        noMicContainer.style.display = 'none';
        
        // Play ringtone
        if (ringtone) {
            ringtone.currentTime = 0;
            ringtone.play().catch(e => console.log("Audio play blocked by browser:", e));
        }

        // Simulate connecting delay before showing mic permission prompt
        setTimeout(() => {
            connectingContainer.style.display = 'none';
            noMicContainer.style.display = 'flex';
            // We can pause ringtone when permission prompt shows, or let it ring. Let's let it ring to build urgency.
        }, 1500);
    }
}

function grantV2MicPermission() {
    const ringtone = document.getElementById('v2-dialing-ringtone');
    if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
    }

    // Trigger vibration if supported (Android mostly)
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }

    // Transition to V2 Session Call Mode
    openV2Session('call', true); // Pass a flag to indicate it's a fresh connection
}


// ==========================================
// V2 LOGIN FLOW & ROUTING
// ==========================================
let v2EntryMode = 'call';
let v2SelectedAstro = 'priya';

function initiateV2Flow(mode, astroId) {
    v2EntryMode = mode;
    v2SelectedAstro = astroId;
    
    // Reset login form just in case
    const v2LoginSection = document.getElementById('mweb-v2-start-login');
    if (v2LoginSection) {
        const inputContainer = v2LoginSection.querySelector('#loginInputSection');
        const otpContainer = v2LoginSection.querySelector('#otpInputSection');
        if (inputContainer && otpContainer) {
            inputContainer.classList.remove('hidden');
            otpContainer.classList.add('hidden');
        }
    }
    
    showSection('mweb-v2-start-login');
}

function showV2OtpSection() {
    const v2LoginSection = document.getElementById('mweb-v2-start-login');
    if (v2LoginSection) {
        const phoneInput = v2LoginSection.querySelector('input[type="tel"]');
        if (phoneInput && phoneInput.value.length < 10) {
            alert('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
            return;
        }
        v2LoginSection.querySelector('#loginInputSection').classList.add('hidden');
        v2LoginSection.querySelector('#otpInputSection').classList.remove('hidden');
    }
}

function moveToNextV2Otp(current, nextFieldID) {
    if (current.value.length >= 1) {
        const next = document.getElementById(nextFieldID);
        if (next) {
            next.focus();
        } else {
            current.blur();
        }
    }
}

function verifyV2OtpAndProceed() {
    // Route to intake form instead of directly to call/chat
    showSection('mweb-intake-form');
    
    // Set up button texts based on entry mode
    const skipBtn = document.getElementById('skip-intake-btn');
    const submitText = document.getElementById('submit-intake-text');
    
    if (v2EntryMode === 'call') {
        skipBtn.innerHTML = 'कॉल पर जाएँ <i class="fa-solid fa-forward-step" style="font-size: 11px;"></i>';
        submitText.innerText = 'सेव करें और कॉल शुरू करें';
    } else {
        skipBtn.innerHTML = 'चैट पर जाएँ <i class="fa-solid fa-forward-step" style="font-size: 11px;"></i>';
        submitText.innerText = 'सेव करें और चैट शुरू करें';
    }
    
    generateIntakeStars();
}

function injectV2ChatGreeting() {
    const chatContainer = document.getElementById('v2-chat-history-container');
    if (!chatContainer) return;
    
    const botHtml = `
        <div class="chat-message bot-message" style="display: flex; gap: 8px; max-width: 85%; align-self: flex-start; opacity: 0; transform: translateY(10px); animation: chatPopIn 0.3s forwards;">
            <img src="assets/classy_astro_1.png" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" alt="Astro">
            <div style="background: rgba(255,255,255,0.05); padding: 12px 14px; border-radius: 0 16px 16px 16px; border: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #FFF; font-size: 14px; margin: 0; line-height: 1.4;">
                    नमस्ते जी! 🙏 आज आप क्या जानना चाहते हैं? अपनी कुंडली के बारे में पूछना चाहते हैं? कृपया अपना नाम, जन्म तिथि, जन्म स्थान, और जन्म का समय बताएं ताकि मैं आपकी कुंडली देख पाऊं। ✨
                </p>
                <p style="color: rgba(255,255,255,0.4); font-size: 10px; margin: 4px 0 0; text-align: right;">अभी</p>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', botHtml);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ==========================================
// V2 INTAKE FORM LOGIC
// ==========================================

function skipIntakeForm() {
    if (v2EntryMode === 'call') {
        startV2CallConnection();
    } else {
        openV2Session('chat', true);
    }
}

function submitIntakeForm() {
    const btnText = document.getElementById('submit-intake-text');
    const spinner = document.getElementById('submit-intake-spinner');
    const toast = document.getElementById('intake-success-toast');
    
    // Show loading
    btnText.style.display = 'none';
    spinner.classList.remove('hidden');
    
    // Simulate API save delay
    setTimeout(() => {
        // Hide loading
        btnText.style.display = 'block';
        spinner.classList.add('hidden');
        
        // Show success toast
        toast.style.top = '60px';
        
        // Wait 3 seconds, hide toast and proceed
        setTimeout(() => {
            toast.style.top = '-100px';
            skipIntakeForm(); // proceeds to call/chat
        }, 3000);
        
    }, 1500);
}

function generateIntakeStars() {
    const container = document.getElementById('intake-stars-container');
    if (!container || container.children.length > 0) return; // already generated
    
    const colors = ['#FFF', '#FFD700', '#FF9AA2', '#82B1FF'];
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3 + 1;
        
        star.style.position = 'absolute';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        star.style.borderRadius = '50%';
        star.style.opacity = Math.random() * 0.8 + 0.2;
        star.style.boxShadow = `0 0 ${size * 2}px ${star.style.backgroundColor}`;
        
        // simple twinkle animation inline
        star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite alternate`;
        
        container.appendChild(star);
    }
}

// ==========================================
// V2 MODAL CONFIRMATIONS & TIMER PAUSE
// ==========================================
let isV2TimerPaused = false;
let pendingV2SessionSwitch = null;

function requestV2SessionSwitch(mode) {
    isV2TimerPaused = true;
    pendingV2SessionSwitch = mode;
    const title = document.getElementById('v2SwitchTitle');
    const icon = document.getElementById('v2SwitchIcon');
    if (mode === 'chat') {
        title.textContent = 'क्या आप चैट में स्विच करना चाहते हैं?';
        icon.className = 'fa-solid fa-message';
    } else {
        title.textContent = 'क्या आप कॉल में स्विच करना चाहते हैं?';
        icon.className = 'fa-solid fa-phone';
    }
    openModal('v2SwitchConfirmModal');
}

function cancelV2SessionSwitch() {
    isV2TimerPaused = false;
    pendingV2SessionSwitch = null;
    closeModal('v2SwitchConfirmModal');
}

function confirmV2SessionSwitch() {
    isV2TimerPaused = false;
    closeModal('v2SwitchConfirmModal');
    if (pendingV2SessionSwitch === 'chat') {
        switchV2SessionMode('chat');
    } else {
        startV2CallConnection();
    }
}

function requestEndV2Session() {
    isV2TimerPaused = true;
    openModal('v2EndConfirmModal');
}

function cancelEndV2Session() {
    isV2TimerPaused = false;
    closeModal('v2EndConfirmModal');
}

function confirmEndV2Session() {
    isV2TimerPaused = false;
    closeModal('v2EndConfirmModal');
    clearInterval(currentCallTimer);
    renderChatHistoryState('combined_feedback', null);
    showSection('app-chat-history');
}
