import os

html_template = """
        <!-- ==========================================
             {title}
             ========================================== -->
        <div id="{id}" class="view-section hidden mobile-frame starry-theme astro-premium-bg banner-shine">
            <div class="ios-home-indicator"></div>
            <div class="app-banner-bg"></div>
            
            <div class="login-slider-container">
                <div class="login-slider" style="pointer-events: none;">
                    <div class="slider-card" data-astro="priya">
                        <div class="slider-image-box">
                            <img src="assets/priya_gesture_1.png" alt="Dr Priya">
                            <div class="slider-overlay-text">
                                <h2 class="slide-in-text">क्या प्रमोशन रुका हुआ है?</h2>
                            </div>
                        </div>
                        <div class="hanging-cta theme-priya" style="cursor: default; padding-right: 24px; justify-content: center;">
                            <span class="cta-text">मिलेगी नई राह! 🚀</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom-sheet">
                <div class="slider-dots" style="position: absolute; top: -15px; left: 0; width: 100%; display: flex; justify-content: center; gap: 8px; pointer-events: none; z-index: 100;">
                    <span class="dot active"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="login-main-text mt-15">
                    <h1>मुफ़्त में 5 मिनट बात करें</h1>
                    <p>करियर, प्रेम या धन... अपने हर सवाल का सटीक जवाब पाएं。<div style="height: 8px;"></div><span style="color: #FFD700; font-weight: bold;">अपने पर्सनल AI ज्योतिषी से बात करें।</span></p>
                </div>

                <div class="trust-badges mt-15">
                    <div class="trust-stamp">
                        <div class="icon-glow-wrapper blue-glow"><i class="fa-solid fa-shield-halved"></i></div>
                        <p class="trust-stamp-text">100% सुरक्षित</p>
                    </div>
                    <div class="trust-stamp">
                        <div class="icon-glow-wrapper gold-glow"><i class="fa-solid fa-robot"></i></div>
                        <p class="trust-stamp-text">पर्सनल AI</p>
                    </div>
                </div>

                <div class="login-form-container mt-15">
                    {content}
                </div>
            </div>
        </div>
"""

login_empty_content = """
                    <div id="loginInputSection-empty">
                        <input type="text" class="login-input input-error" placeholder="आपका शुभ नाम">
                        <div class="phone-input-group mt-10">
                            <span class="country-code">+91</span>
                            <input type="tel" class="login-input input-error" placeholder="मोबाइल नंबर" maxlength="10">
                        </div>
                        <div class="error-text" style="display: block;">कृपया अपना नाम और मोबाइल नंबर दर्ज करें</div>
                        <button class="cta-btn yellow-btn full-width mt-15" style="height: 48px; padding: 0; display: flex; align-items: center; justify-content: center;">लॉगिन करें और बात शुरू करें</button>
                    </div>
"""

login_invalid_content = """
                    <div id="loginInputSection-invalid">
                        <input type="text" class="login-input" placeholder="आपका शुभ नाम" value="Kavita">
                        <div class="phone-input-group mt-10">
                            <span class="country-code">+91</span>
                            <input type="tel" class="login-input input-error" placeholder="मोबाइल नंबर" value="98765" maxlength="10">
                        </div>
                        <div class="error-text" style="display: block;">कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें</div>
                        <button class="cta-btn yellow-btn full-width mt-15" style="height: 48px; padding: 0; display: flex; align-items: center; justify-content: center;">लॉगिन करें और बात शुरू करें</button>
                    </div>
"""

otp_timer_content = """
                    <div id="otpInputSection-timer" style="width: 100%;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <h2 style="font-size: 20px; font-weight: 800; color: #FFF; margin-bottom: 8px;">वेरिफिकेशन कोड</h2>
                            <p style="color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.4;">हमने आपके मोबाइल नंबर पर एक वेरिफिकेशन कोड भेजा है</p>
                        </div>
                        <div class="otp-boxes" style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                            <input type="text" maxlength="1" class="otp-box" value="1" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box" value="4" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box" value="3" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                        </div>
                        <button class="cta-btn yellow-btn" style="width: 60%; height: 48px; padding: 0; margin: 0 auto; display: flex; align-items: center; justify-content: center;">कन्फर्म करें</button>
                        
                        <div style="text-align: center;">
                            <div class="otp-timer-text" id="demo-otp-timer-display">Resend OTP in <span style="color: #FFF;">00:59</span></div>
                            <div class="resend-link" id="demo-otp-resend-btn" style="display: none;">Resend OTP</div>
                        </div>
                    </div>
"""

otp_error_content = """
                    <div id="otpInputSection-error" style="width: 100%;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <h2 style="font-size: 20px; font-weight: 800; color: #FFF; margin-bottom: 8px;">वेरिफिकेशन कोड</h2>
                            <p style="color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.4;">हमने आपके मोबाइल नंबर पर एक वेरिफिकेशन कोड भेजा है</p>
                        </div>
                        <div class="otp-boxes shake-animation" style="display:flex; gap:10px; justify-content:center; margin-bottom:5px;">
                            <input type="text" maxlength="1" class="otp-box input-error" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box input-error" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box input-error" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box input-error" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box input-error" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                            <input type="text" maxlength="1" class="otp-box input-error" value="" style="width: 42px; height: 50px; text-align: center; font-size: 20px; font-weight: 800; border-radius: 12px;">
                        </div>
                        <div class="error-text" style="display: block; text-align: center; margin-bottom: 15px;">गलत OTP! कृपया पुनः प्रयास करें</div>
                        <button class="cta-btn yellow-btn" style="width: 60%; height: 48px; padding: 0; margin: 0 auto; display: flex; align-items: center; justify-content: center;">कन्फर्म करें</button>
                    </div>
"""

screens = [
    {"id": "mweb-login-error-empty", "title": "NEW MWEB LOGIN ERROR (EMPTY)", "content": login_empty_content},
    {"id": "mweb-login-error-invalid", "title": "NEW MWEB LOGIN ERROR (INVALID NUM)", "content": login_invalid_content},
    {"id": "mweb-otp-timer", "title": "NEW MWEB OTP TIMER RUNNING", "content": otp_timer_content},
    {"id": "mweb-otp-error-wrong", "title": "NEW MWEB OTP ERROR WRONG", "content": otp_error_content},
]

final_html = "\n".join([html_template.format(**s) for s in screens])

with open('/Users/navyasharma/Documents/AU/astro-app/index.html', 'r') as f:
    content = f.read()

# Insert before LOGGED-IN SPLASH
insert_marker = "        <!-- ==========================================\n             LOGGED-IN SPLASH"
if insert_marker in content:
    content = content.replace(insert_marker, final_html + "\n" + insert_marker)
    with open('/Users/navyasharma/Documents/AU/astro-app/index.html', 'w') as f:
        f.write(content)
    print("Successfully injected new screens.")
else:
    print("Error: Could not find insertion marker.")
