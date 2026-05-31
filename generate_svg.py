import math

def generate_scalloped_badge(filename, inner_text, top_text, bottom_text, icon_svg):
    cx, cy = 50, 50
    outer_r = 48
    inner_r = 42
    points = 32
    
    path_data = []
    for i in range(points * 2):
        angle = math.pi * i / points
        r = outer_r if i % 2 == 0 else inner_r
        x = cx + r * math.sin(angle)
        y = cy - r * math.cos(angle)
        if i == 0:
            path_data.append(f"M {x:.2f} {y:.2f}")
        else:
            path_data.append(f"L {x:.2f} {y:.2f}")
    path_data.append("Z")
    
    svg = f"""<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Drop shadow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    
    <!-- Scalloped Outer -->
    <path d="{' '.join(path_data)}" fill="#679A6B" filter="url(#glow)"/>
    
    <!-- White Inner Circle -->
    <circle cx="50" cy="50" r="36" fill="#FFF" />
    
    <!-- Inner Green Circle -->
    <circle cx="50" cy="50" r="33" fill="#FFF" stroke="#679A6B" stroke-width="1.5" />
    
    <!-- Texts along path (simplified with straight text for center) -->
    <!-- You can use curved text but it's complex, let's just use normal text -->
    {icon_svg}
    
</svg>"""

    with open(filename, 'w') as f:
        f.write(svg)

icon1 = '''<text x="50" y="45" font-family="Arial" font-weight="bold" font-size="20" fill="#679A6B" text-anchor="middle">100%</text>
<text x="50" y="65" font-family="Arial" font-weight="bold" font-size="10" fill="#679A6B" text-anchor="middle">GUARANTEE</text>'''

icon2 = '''<path d="M 35 45 L 45 55 L 65 35" fill="none" stroke="#679A6B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<text x="50" y="68" font-family="Arial" font-weight="bold" font-size="8" fill="#679A6B" text-anchor="middle">CERTIFIED</text>'''

icon3 = '''<path d="M 40 45 V 38 A 10 10 0 0 1 60 38 V 45 H 65 V 65 H 35 V 45 Z" fill="none" stroke="#679A6B" stroke-width="4" stroke-linejoin="round"/>
<circle cx="50" cy="55" r="3" fill="#679A6B"/>
<text x="50" y="75" font-family="Arial" font-weight="bold" font-size="7" fill="#679A6B" text-anchor="middle">SECURE</text>'''

generate_scalloped_badge('assets/badge1.svg', '100%', 'SATISFACTION', 'GUARANTEE', icon1)
generate_scalloped_badge('assets/badge2.svg', '', '', '', icon2)
generate_scalloped_badge('assets/badge3.svg', '', '', '', icon3)
