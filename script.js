
function getPrefix() {
    const prefix = getPrefix();
    
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
    const prefix = getPrefix(); showSection(prefix + 'splash-hybrid');
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

    const prefix = getPrefix();

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
    const prefix = getPrefix();
    const callScreen = document.getElementById(prefix + "active-call");
    if (callScreen) {
        const visualizer = callScreen.querySelector("#audio-visualizer");
        if (visualizer) visualizer.classList.remove("active");
    }
    showSection("astro-contact-screen");
}

function startCallTimer() {
    clearInterval(currentCallTimer);
    currentCallSeconds = 0;
    
    // Check if on app
    const prefix = getPrefix();
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
    const prefix = getPrefix();
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
    const prefix = getPrefix();
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
    
    const prefix = getPrefix();
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
    const prefix = getPrefix();
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
    const prefix = getPrefix();
    const minText = isApp ? "10" : "5";
    const minTextHindi = isApp ? "10" : "5";

    if(btn) {
        showSection(prefix + 'splash-hybrid', btn);
    } else {
        const prefix = getPrefix(); showSection(prefix + 'splash-hybrid');
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

// V2 Chat/Call Mode Switch
function switchToSpeakMode(targetCallId) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech to ensure immediate playback
        window.speechSynthesis.cancel();
        
        const msg = new SpeechSynthesisUtterance();
        msg.text = "अब आप मुझसे बोलकर बात कर सकते हैं"; // Hindi text
        msg.lang = 'hi-IN'; // Hindi voice
        msg.rate = 0.95; // Slightly slower for natural feel
        
        window.speechSynthesis.speak(msg);
    }
    
    // Switch the UI to the target call screen
    showSection(targetCallId, null);
}
