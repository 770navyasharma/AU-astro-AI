import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make light theme backgrounds pop more by lowering the white/light color opacity from 0.8 to 0.55
def lower_light_opacity(match):
    return match.group(0).replace('0.8)', '0.55)')

content = re.sub(r'background:linear-gradient\(125deg,rgba\(\d+,\d+,\d+,0\.8\).*?0\.8\)\)', lower_light_opacity, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Lowered opacity of light gradients.")
