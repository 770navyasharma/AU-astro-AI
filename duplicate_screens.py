import re

with open('index.html', 'r') as f:
    lines = f.readlines()

mweb_start = -1
mweb_end = -1
phone_stage_end = -1

for i, line in enumerate(lines):
    if '<div id="mweb-feed"' in line:
        if mweb_start == -1:
            mweb_start = i
    if '<!-- ==========================================' in line and 'APP SCREENS' in lines[min(i+1, len(lines)-1)]:
        mweb_end = i
    if '</div> <!-- .phone-stage -->' in line:
        phone_stage_end = i

if mweb_end == -1:
    # Find the end of the last mweb screen which is mweb-chat-feedback-screen
    for i in range(len(lines)-1, -1, -1):
        if 'mweb-chat-feedback-screen' in lines[i]:
            # find the closing div of this screen
            pass
            
print(f"Mweb start: {mweb_start}")
print(f"Mweb end: {mweb_end}")
print(f"Phone stage end: {phone_stage_end}")
