import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the 20 replacements for the background styles.
# We will find each instance of `class="bv-card" style="background:..."` and replace it.

backgrounds = [
    # A Group
    "background:linear-gradient(125deg,rgba(18,1,46,0.85),rgba(45,27,105,0.85),rgba(12,0,24,0.85)), url('assets/bg_purple.png') center/cover",
    "background:linear-gradient(125deg,rgba(6,13,34,0.85),rgba(26,35,126,0.85),rgba(4,10,24,0.85)), url('assets/bg_blue.png') bottom left/cover",
    "background:linear-gradient(125deg,rgba(30,0,0,0.85),rgba(123,0,0,0.85),rgba(45,5,5,0.85)), url('assets/bg_saffron.png') center/cover",
    "background:linear-gradient(125deg,rgba(0,26,26,0.85),rgba(0,96,96,0.85),rgba(0,18,18,0.85)), url('assets/bg_emerald.png') top/cover",
    "background:linear-gradient(125deg,rgba(26,14,0,0.85),rgba(92,58,0,0.85),rgba(26,14,0,0.85)), url('assets/bg_saffron.png') bottom right/cover",
    # B Group
    "background:linear-gradient(125deg,rgba(10,5,32,0.85),rgba(55,48,163,0.85),rgba(10,5,32,0.85)), url('assets/bg_blue.png') center/cover",
    "background:linear-gradient(125deg,rgba(28,10,0,0.85),rgba(120,53,15,0.85),rgba(28,10,0,0.85)), url('assets/bg_saffron.png') top left/cover",
    "background:linear-gradient(125deg,rgba(0,26,10,0.85),rgba(6,95,70,0.85),rgba(0,26,10,0.85)), url('assets/bg_emerald.png') center/cover",
    "background:linear-gradient(125deg,rgba(26,0,16,0.85),rgba(131,24,67,0.85),rgba(26,0,16,0.85)), url('assets/bg_purple.png') top right/cover",
    "background:linear-gradient(125deg,rgba(10,15,26,0.85),rgba(30,58,95,0.85),rgba(10,15,26,0.85)), url('assets/bg_blue.png') top/cover",
    # C Group
    "background:linear-gradient(125deg,rgba(255,251,235,0.8),rgba(254,243,199,0.8),rgba(255,251,235,0.8)), url('assets/bg_light.png') center/cover",
    "background:linear-gradient(125deg,rgba(239,246,255,0.8),rgba(219,234,254,0.8),rgba(239,246,255,0.8)), url('assets/bg_light.png') bottom/cover",
    "background:linear-gradient(125deg,rgba(245,243,255,0.8),rgba(237,233,254,0.8),rgba(245,243,255,0.8)), url('assets/bg_light.png') top/cover",
    "background:linear-gradient(125deg,rgba(255,247,243,0.8),rgba(255,228,214,0.8),rgba(255,247,243,0.8)), url('assets/bg_light.png') center right/cover",
    "background:linear-gradient(125deg,rgba(240,253,244,0.8),rgba(220,252,231,0.8),rgba(240,253,244,0.8)), url('assets/bg_light.png') center left/cover",
    # D Group
    "background:linear-gradient(125deg,rgba(255,255,255,0.8),rgba(255,255,255,0.8),rgba(255,255,255,0.8)), url('assets/bg_light.png') bottom right/cover",
    "background:linear-gradient(125deg,rgba(241,245,249,0.8),rgba(226,232,240,0.8),rgba(241,245,249,0.8)), url('assets/bg_light.png') top right/cover",
    "background:linear-gradient(125deg,rgba(253,246,236,0.8),rgba(250,233,204,0.8),rgba(253,246,236,0.8)), url('assets/bg_light.png') bottom left/cover",
    "background:linear-gradient(125deg,rgba(250,245,255,0.8),rgba(243,232,255,0.8),rgba(250,245,255,0.8)), url('assets/bg_light.png') top left/cover",
    "background:linear-gradient(125deg,rgba(240,253,250,0.8),rgba(204,251,241,0.8),rgba(240,253,250,0.8)), url('assets/bg_light.png') center/cover; background-size: 150%"
]

# Find all cards
pattern = re.compile(r'class="bv-card" style="background:.*?(?=;border)', re.DOTALL)
matches = pattern.finditer(content)

new_content = ""
last_end = 0
count = 0

for match in matches:
    if count >= 20: break
    new_content += content[last_end:match.start()]
    new_content += f'class="bv-card" style="{backgrounds[count]}"'
    last_end = match.end()
    count += 1

new_content += content[last_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Updated {count} banner backgrounds.")
