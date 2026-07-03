with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('assets/dr_priya_verma.png', 'assets/classy_astro_1.png')
content = content.replace('assets/astro_face_clean.png', 'assets/classy_astro_2.png')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Images replaced.")
