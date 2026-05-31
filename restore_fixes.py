import re
import html

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove "Start Demo Flow" button
start_demo_regex = r'<div class="demo-btn-group mt-10" style="justify-content: center;">\s*<button class="demo-btn" style="background:#10B981; border:none; width: 100%; max-width: 250px;" onclick="startDemoFlow\(\)"><i class="fa-solid fa-play"></i> Start Demo Flow</button>\s*</div>'
content = re.sub(start_demo_regex, '', content)

# 2. Add app-filters
app_filters_html = """
        <!-- App Filters (Hidden by default unless App is active) -->
        <div id="app-filters" style="display:none;">
            <h4 class="demo-title mt-10">Native App Screens</h4>
            <div class="demo-btn-group">
                <button class="demo-btn-outline" onclick="showSection('app-feed', this)">1. App Banner</button>
                <button class="demo-btn-outline" onclick="showSection('app-start-login', this)">2. Login Screen</button>
                <button class="demo-btn-outline" onclick="showSection('app-splash', this)">3. Splash Screen</button>
                <button class="demo-btn-outline" onclick="showSection('app-astro-contact-screen', this)">4. Contact List</button>
                <button class="demo-btn-outline" onclick="showSection('app-dialing', this)">5. Dialing Screen</button>
                <button class="demo-btn-outline" onclick="showSection('app-active-call', this)">6. Active Call Screen</button>
            </div>
            
            <h4 class="demo-title mt-10">App Modals</h4>
            <div class="demo-btn-group">
                <button class="demo-btn-outline" onclick="showSection('app-toast-test-screen', this)">🔔 1 Min Left Warning</button>
                <button class="demo-btn-outline" onclick="showSection('app-time-over-screen', this)">⏳ 10 Min Over Sheet</button>
            </div>
        </div>
"""
# Insert app_filters_html after mweb-filters
content = re.sub(r'(<div id="mweb-filters" style="display:block;">.*?</div>)', r'\1' + app_filters_html, content, flags=re.DOTALL)

# 3. Duplicate screens
screen_ids = [
    "mweb-feed",
    "mweb-start-login",
    "mweb-splash",
    "astro-contact-screen",
    "mweb-dialing",
    "mweb-active-call",
    "mweb-toast-test-screen",
    "mweb-time-over-screen"
]

def extract_div(html_str, div_id):
    match = re.search(f'<div id="{div_id}"', html_str)
    if not match:
        return ""
    start_idx = match.start()
    depth = 0
    i = start_idx
    while i < len(html_str):
        if html_str[i:i+4] == "<div":
            depth += 1
            i += 4
        elif html_str[i:i+6] == "</div>":
            depth -= 1
            if depth == 0:
                return html_str[start_idx:i+6]
            i += 6
        else:
            i += 1
    return ""

new_screens = []
for sid in screen_ids:
    div_html = extract_div(content, sid)
    if not div_html:
        continue
    new_id = sid.replace("mweb-", "app-")
    if sid == "astro-contact-screen":
        new_id = "app-astro-contact-screen"
    new_div = div_html.replace(f'id="{sid}"', f'id="{new_id}"')
    
    # Specific fix for app-feed
    if new_id == "app-feed":
        breadcrumb_regex = r'<div style="font-size: 12px; color: #666; margin-bottom: 15px;">\s*Hindi News &nbsp;>&nbsp; Photo Gallery &nbsp;>&nbsp; Astrology &nbsp;>&nbsp; Predictions &nbsp;>&nbsp; Jupiter Transit\s*</div>'
        new_div = re.sub(breadcrumb_regex, '', new_div)
        
    new_screens.append(new_div)

old_app_feed = extract_div(content, "app-feed")
if old_app_feed:
    replacement = "\n\n<!-- ==========================================\n     APP SCREENS (Duplicated from MWEB)\n     ========================================== -->\n" + "\n\n".join(new_screens)
    content = content.replace(old_app_feed, replacement)

# 4. Replace HTML entities
def replace_entities(match):
    return html.unescape(match.group(0))
content = re.sub(r'&#[0-9]+;', replace_entities, content)

# 5. Fix spellings
content = content.replace('आर अपने', 'और अपने')
content = content.replace('आगे बड़ें', 'आगे बढ़ें')
content = content.replace('आएं आर बिना', 'आएं और बिना')
content = content.replace('बिल्कुल मुफ्त', 'बिल्कुल मुफ़्त')

# 6. Replace texts
content = content.replace('मुफ़्त में 5 मिनट बात करें', 'मुफ़्त में रोज़ 10 मिनट बात करें')

# 7. app-feed banner onclick
app_feed_block = extract_div(content, "app-feed")
if app_feed_block:
    new_app_feed_block = app_feed_block.replace("onclick=\"handleBannerClick('mweb')\"", "onclick=\"handleBannerClick('app')\"")
    content = content.replace(app_feed_block, new_app_feed_block)

# 8. scrollSplash(1, this)
content = content.replace('scrollSplash(1)', 'scrollSplash(1, this)')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Restored successfully!")
