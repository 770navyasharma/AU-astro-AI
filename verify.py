import re
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# check astro size
print("Astro size: ", re.findall(r'width:65px;height:65px', c)[:2])
# check mic badge size
print("Mic badge size: ", re.findall(r'width:26px;height:26px;', c)[:2])
# check text
print("Text 1: ", len(re.findall(r'अनुभवी ज्योतिषी से अपने सवाल पूछें', c)))
print("Text 2: ", len(re.findall(r'मुफ़्त में रोज़ाना बात करें', c)))
print("Text font size: ", re.findall(r'font-size:15px', c)[:2])
print("Typewriter removed: ", "a1w" not in c)
