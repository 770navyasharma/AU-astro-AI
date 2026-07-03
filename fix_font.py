import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace font-size:13.5px with font-size:16px for the specific line
# Also maybe increase weight from 700 to 900
def increase_font(match):
    s = match.group(0)
    s = s.replace('font-size:13.5px;', 'font-size:16px;')
    s = s.replace('font-weight:700;', 'font-weight:900;letter-spacing:0.2px;')
    return s

content = re.sub(r'<div style="color:[^;]+;font-size:13\.5px;font-weight:700;.*?</div>', increase_font, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Font size increased!")
