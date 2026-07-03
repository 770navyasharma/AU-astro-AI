import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove bv-pr ripples
content = re.sub(r'<div class="bv-pr"[^>]*></div>\s*', '', content)

# 2. Increase astro size (50px -> 65px)
content = re.sub(r'width:50px;height:50px', 'width:65px;height:65px', content)

# 3. Increase mic badge size (17px -> 26px, font 7px -> 12px)
content = re.sub(r'width:17px;height:17px;', 'width:26px;height:26px;', content)
content = re.sub(r'font-size:7px;', 'font-size:12px;', content)

# 4. Remove typewriter JS block completely
js_pattern = re.compile(r'<!-- Typewriter JS: Groups A & C.*?</script>', re.DOTALL)
content = js_pattern.sub('', content)

# 5. Fix text and font sizes
# Let's iterate over each banner by splitting at `<div class="bv-card"`
parts = content.split('<div onclick="handleBannerClick(\'mweb\')" class="bv-card"')

new_parts = [parts[0]]

for part in parts[1:]:
    # Find the flex:1 div inside this banner
    # It contains the text lines. We'll replace it with the new static text.
    
    # We can just use re.sub for this part only
    def replace_text_block(match):
        full_block = match.group(0)
        c1_match = re.search(r'<div style="color:([^;]+);font-size:13px', full_block)
        c2_match = re.search(r'<div style="color:([^;]+);font-size:11px', full_block)
        
        c1 = c1_match.group(1) if c1_match else '#FFF'
        c2 = c2_match.group(1) if c2_match else 'rgba(255,255,255,0.85)'
        
        if '1E3A5F' in c1 or '1C1C1E' in c1 or '2E1065' in c1 or '431407' in c1 or '14532D' in c1 or '111827' in c1 or '0F172A' in c1 or '3B1F00' in c1 or '3B0764' in c1 or '042F2E' in c1:
            c1 = '#000000'
            c2 = '#111827'

        return f'''<div style="flex:1;min-width:0">
                            <div style="color:{c1};font-size:15px;font-weight:900;margin-bottom:4px;line-height:1.2;text-shadow: 0px 1px 2px rgba(0,0,0,0.1);">अनुभवी ज्योतिषी से अपने सवाल पूछें</div>
                            <div style="color:{c2};font-size:13.5px;font-weight:700;display:flex;align-items:center;gap:6px;"><span style="background:#22C55E;width:6px;height:6px;border-radius:50%;display:inline-block;animation:bvBlink 1s infinite;"></span> मुफ़्त में रोज़ाना बात करें</div>
                        </div>'''

    new_part = re.sub(r'<div style="flex:1;min-width:0">.*?</div>\s*</div>', replace_text_block, part, count=1, flags=re.DOTALL)
    new_parts.append(new_part)

content = '<div onclick="handleBannerClick(\'mweb\')" class="bv-card"'.join(new_parts)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating index.html")
