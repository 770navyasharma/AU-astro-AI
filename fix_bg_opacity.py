import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 0.85 opacity (used in dark banners) with 0.35
content = re.sub(r'0\.85\)', '0.35)', content)

# Replace 0.55 opacity (used in light banners) with 0.25
content = re.sub(r'0\.55\)', '0.25)', content)

# Also increase text shadow to ensure text remains readable even with busy backgrounds
# Current: text-shadow: 0px 1px 2px rgba(0,0,0,0.1)
# New: text-shadow: 0px 2px 4px rgba(0,0,0,0.6) for dark text (or light text)
content = content.replace('text-shadow: 0px 1px 2px rgba(0,0,0,0.1);', 'text-shadow: 0px 2px 5px rgba(0,0,0,0.7);')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Background visibility increased!")
