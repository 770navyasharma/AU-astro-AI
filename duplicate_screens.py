import re

with open("index.html", "r") as f:
    html = f.read()

# The screens to duplicate
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

def extract_div(html, div_id):
    # Find the start of the div
    match = re.search(f'<div id="{div_id}"', html)
    if not match:
        return ""
    
    start_idx = match.start()
    
    # Simple tag counting to find the end
    depth = 0
    i = start_idx
    while i < len(html):
        if html[i:i+4] == "<div":
            depth += 1
            i += 4
        elif html[i:i+6] == "</div>":
            depth -= 1
            if depth == 0:
                return html[start_idx:i+6]
            i += 6
        else:
            i += 1
    return ""

new_screens = []

for sid in screen_ids:
    div_html = extract_div(html, sid)
    if not div_html:
        continue
        
    # Replace ID
    new_id = sid.replace("mweb-", "app-")
    if sid == "astro-contact-screen":
        new_id = "app-astro-contact-screen"
        
    new_div = div_html.replace(f'id="{sid}"', f'id="{new_id}"')
    
    # Specific fix for app-feed (mweb-feed duplicate)
    if new_id == "app-feed":
        # Remove breadcrumb
        breadcrumb_regex = r'<div style="font-size: 12px; color: #666; margin-bottom: 15px;">\s*Hindi News &nbsp;>&nbsp; Photo Gallery &nbsp;>&nbsp; Astrology &nbsp;>&nbsp; Predictions &nbsp;>&nbsp; Jupiter Transit\s*</div>'
        new_div = re.sub(breadcrumb_regex, '', new_div)
        
    new_screens.append(new_div)

# Now, we need to replace the entire "APP FEED & DISCOVERY (Native App)" section, which currently contains the old app-feed.
# We'll just replace the old app-feed completely and insert all new screens there.

# Find the old app-feed
old_app_feed = extract_div(html, "app-feed")

if old_app_feed:
    replacement = "\n\n<!-- ==========================================\n     APP SCREENS (Duplicated from MWEB)\n     ========================================== -->\n" + "\n\n".join(new_screens)
    html = html.replace(old_app_feed, replacement)
    
    with open("index.html", "w") as f:
        f.write(html)
    print("Successfully duplicated screens!")
else:
    print("Could not find old app-feed to replace.")
