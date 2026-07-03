import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the floating mic badge from all Right Focus layouts to keep the face clean.
# The mic badges look like: <div style="position:absolute; right:15px; ..."><i class="fa-solid fa-microphone"...></div>
# For Banner 1 & 11: bottom:15px; background:#8B5CF6; / background:#F59E0B;
# For Banner 2 & 12: top:15px; background:#3182CE; / background:#2563EB;

content = re.sub(r'<div style="position:absolute; right:15px; bottom:15px; width:30px; height:30px;[^>]+>.*?</div>', '', content, flags=re.DOTALL)
content = re.sub(r'<div style="position:absolute; right:15px; top:15px; width:30px; height:30px;[^>]+>.*?</div>', '', content, flags=re.DOTALL)

# 2. Replace the text in Banner 2 with the Red Pill
# In Banner 2, we have:
# <div class="bv-t2 bv-bump" style="color:#90CDF4;">
#     <i class="fa-solid fa-phone" style="font-size:10px;"></i> फ्री कॉल शुरू करें
# </div>
# We will replace it with the red pill from Banner 3.
old_text = '''<div class="bv-t2 bv-bump" style="color:#90CDF4;">
                                <i class="fa-solid fa-phone" style="font-size:10px;"></i> फ्री कॉल शुरू करें
                            </div>'''

new_text = '''<div class="bv-bump" style="margin-top:6px; background:#E53E3E; color:#FFF; font-weight:800; font-size:13px; padding:6px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(229,62,62,0.5); border:1px solid #FC8181;">
                                <i class="fa-solid fa-microphone"></i> अभी बात करें - मुफ़्त
                            </div>'''

if old_text in content:
    content = content.replace(old_text, new_text)
else:
    # try regex just in case spaces are different
    content = re.sub(r'<div class="bv-t2 bv-bump" style="color:#90CDF4;">.*?</div>', new_text, content, count=1, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied to Right Focus banners.")
