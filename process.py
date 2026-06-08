import re

with open('index.html', 'r') as f:
    lines = f.readlines()

mweb_start = 97
mweb_end = 1391  # Line index where MWEB section ends
app_end = 1966   # Line index where Modals start

mweb_lines = lines[mweb_start:mweb_end]

# Duplicate
app_content = "".join(mweb_lines)

# 1. Replace IDs and onClick handlers
app_content = app_content.replace('id="mweb-', 'id="app-')
app_content = app_content.replace("handleBannerClick('mweb')", "handleBannerClick('app')")
app_content = app_content.replace('goBackToFeed(', 'goBackToAppFeed(')

# 2. Text Replacements for "5 mins" to "10 mins"
app_content = app_content.replace('5 मिनट', '10 मिनट')
app_content = app_content.replace('5 mins', '10 mins')
app_content = app_content.replace('5 Mins', '10 Mins')
app_content = app_content.replace('5 Mins', '10 Mins')
app_content = app_content.replace('5:00', '10:00')

# 3. Add back button to all app screens except dialing and active-call
screens_to_add_back = [
    'app-login-error-empty',
    'app-login-error-invalid',
    'app-otp-timer',
    'app-otp-error-wrong',
    'app-logged-in-splash',
    'app-splash-hybrid',
    'app-chat-history',
    'app-toast-test-screen',
    'app-time-over-screen',
    'app-chat-feedback-screen'
]

back_btn_html = '''
    <div onclick="goBackToAppFeed()" style="position: absolute; left: 16px; top: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 50%; cursor: pointer; backdrop-filter: blur(4px); z-index: 100;">
        <i class="fa-solid fa-arrow-left" style="color: #FFF; font-size: 16px;"></i>
    </div>
'''

for screen in screens_to_add_back:
    pattern = f'<div id="{screen}"[^>]*>\n(.*?)<div class="ios-home-indicator"></div>'
    def replacement(match):
        return f'<div id="{screen}"' + match.group(0).split(f'<div id="{screen}"')[1] + back_btn_html
    # Actually regex on html is tricky, let's just do a string replace:
    search_str = f'<div id="{screen}"'
    # we find where it is, find the next ios-home-indicator, and insert after it
    # Because there are many attributes on the div, we can just find 'class="ios-home-indicator"></div>'
    # inside that section.

# Let's do it simply by splitting on each screen div
# Better yet, since we are doing it manually, we can just replace `<div class="ios-home-indicator"></div>`
# Wait, replacing `ios-home-indicator` with itself + back_btn would add it to ALL screens including dialing and active-call!
# So let's replace it with a placeholder, then for dialing/active-call remove it, and for the rest replace with back btn.

parts = re.split(r'(<div id="app-[a-z-]+"[\s\S]*?<div class="ios-home-indicator"></div>)', app_content)
for i in range(1, len(parts), 2):
    if 'app-dialing' not in parts[i] and 'app-active-call' not in parts[i] and 'app-feed' not in parts[i] and 'app-start-login' not in parts[i]:
        parts[i] = parts[i] + back_btn_html

app_content = "".join(parts)

# Prepend the comment header
header = """
<!-- ==========================================
     APP SCREENS (Duplicated from MWEB)
     ========================================== -->
"""

final_content = "".join(lines[:mweb_end]) + header + app_content + "".join(lines[app_end:])

with open('index.html', 'w') as f:
    f.write(final_content)

print("Done")
