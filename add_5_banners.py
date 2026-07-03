import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to insert the 5 new banners right before the </div> that closes <div id="mweb-banner-variants">
# The banners will all use the bvl-right-focus layout.

new_banners = """
                <!-- ═══════════════════════════════════════════════
                     5 NEW GEN-Z BANNERS (RIGHT FOCUS LAYOUT)
                     ═══════════════════════════════════════════════ -->
                <div class="bv-group-label" style="background:#FFE4E6;color:#E11D48;border:1px solid #FECDD3;width:100%;text-align:center;margin-top:24px;">✨ 5 NEW GEN-Z BANNERS (RED, DARK, LIGHT)</div>

                <!-- 1. Red Theme -->
                <div style="margin-bottom:12px">
                    <div style="font-size:8px;color:#9CA3AF;font-weight:700;margin-bottom:4px">NEW 1. RIGHT FOCUS · REDDISH COSMIC</div>
                    <div class="bvl-right-focus" style="background: linear-gradient(125deg, rgba(69,10,10,0.5), rgba(127,29,29,0.3)), url('assets/bg_red.png') center/cover; border:1px solid rgba(239,68,68,.5); box-shadow:0 6px 20px rgba(185,28,28,.4); height: 100px;">
                        <div style="position:relative; z-index:2; max-width:62%;">
                            <div class="bv-t1" style="color:#FFF; font-size: 17px; font-weight: 900; line-height: 1.3;">ज्योतिषी से सीधे बात करें</div>
                            <div class="bv-bump" style="margin-top:6px; background:#E53E3E; color:#FFF; font-weight:800; font-size:13px; padding:6px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(229,62,62,0.5); border:1px solid #FC8181;">
                                <i class="fa-solid fa-microphone"></i> अभी बात करें - मुफ़्त
                            </div>
                        </div>
                        <img src="assets/classy_astro_1.png" class="bvl-rf-astro" style="width:125px; height:125px; top:-12px; right:-15px; border:3px solid rgba(254,226,226,0.4); box-shadow: -5px 0 25px rgba(153,27,27,0.6); object-fit:cover;">
                    </div>
                </div>

                <!-- 2. Dark Theme 1 -->
                <div style="margin-bottom:12px">
                    <div style="font-size:8px;color:#9CA3AF;font-weight:700;margin-bottom:4px">NEW 2. RIGHT FOCUS · DARK PURPLE</div>
                    <div class="bvl-right-focus" style="background: url('assets/bg_purple.png') center/cover; border:1px solid rgba(167,139,250,.4); box-shadow:0 6px 20px rgba(109,40,217,.3); height: 100px;">
                        <div style="position:relative; z-index:2; max-width:62%;">
                            <div class="bv-t1" style="color:#FFF; font-size: 17px; font-weight: 900; line-height: 1.3;">ज्योतिषी से सीधे बात करें</div>
                            <div class="bv-bump" style="margin-top:6px; background:#E53E3E; color:#FFF; font-weight:800; font-size:13px; padding:6px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(229,62,62,0.5); border:1px solid #FC8181;">
                                <i class="fa-solid fa-microphone"></i> अभी बात करें - मुफ़्त
                            </div>
                        </div>
                        <img src="assets/classy_astro_2.png" class="bvl-rf-astro" style="width:125px; height:125px; top:-12px; right:-15px; object-fit:cover;object-position:center 15%;">
                    </div>
                </div>

                <!-- 3. Dark Theme 2 -->
                <div style="margin-bottom:12px">
                    <div style="font-size:8px;color:#9CA3AF;font-weight:700;margin-bottom:4px">NEW 3. RIGHT FOCUS · MIDNIGHT BLUE</div>
                    <div class="bvl-right-focus" style="background: url('assets/bg_blue.png') center/cover; border:1px solid rgba(99,179,237,.4); box-shadow:0 6px 20px rgba(26,35,126,.3); height: 100px;">
                        <div style="position:relative; z-index:2; max-width:62%;">
                            <div class="bv-t1" style="color:#FFF; font-size: 17px; font-weight: 900; line-height: 1.3;">ज्योतिषी से सीधे बात करें</div>
                            <div class="bv-bump" style="margin-top:6px; background:#E53E3E; color:#FFF; font-weight:800; font-size:13px; padding:6px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(229,62,62,0.5); border:1px solid #FC8181;">
                                <i class="fa-solid fa-microphone"></i> अभी बात करें - मुफ़्त
                            </div>
                        </div>
                        <img src="assets/classy_astro_1.png" class="bvl-rf-astro" style="width:125px; height:125px; top:-12px; right:-15px; object-fit:cover;">
                    </div>
                </div>

                <!-- 4. Light Theme 1 -->
                <div style="margin-bottom:12px">
                    <div style="font-size:8px;color:#9CA3AF;font-weight:700;margin-bottom:4px">NEW 4. RIGHT FOCUS · LIGHT CELESTIAL</div>
                    <div class="bvl-right-focus" style="background: url('assets/bg_light.png') center/cover; border:1px solid rgba(245,158,11,.3); box-shadow:0 6px 16px rgba(0,0,0,0.06); height: 100px;">
                        <div style="position:relative; z-index:2; max-width:62%;">
                            <div class="bv-t1-light" style="font-size: 17px; font-weight: 900; line-height: 1.3;">ज्योतिषी से सीधे बात करें</div>
                            <div class="bv-bump" style="margin-top:6px; background:#E53E3E; color:#FFF; font-weight:800; font-size:13px; padding:6px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(229,62,62,0.5); border:1px solid #FC8181;">
                                <i class="fa-solid fa-microphone"></i> अभी बात करें - मुफ़्त
                            </div>
                        </div>
                        <img src="assets/classy_astro_2.png" class="bvl-rf-astro" style="width:125px; height:125px; top:-12px; right:-15px; border:3px solid #FFF; box-shadow: -4px 0 15px rgba(245,158,11,0.2); object-fit:cover;object-position:center 15%;">
                    </div>
                </div>

                <!-- 5. Light Theme 2 -->
                <div style="margin-bottom:12px">
                    <div style="font-size:8px;color:#9CA3AF;font-weight:700;margin-bottom:4px">NEW 5. RIGHT FOCUS · LIGHT BLUE TINT</div>
                    <div class="bvl-right-focus" style="background: linear-gradient(rgba(239,246,255,0.7), rgba(219,234,254,0.7)), url('assets/bg_light.png') center/cover; border:1px solid rgba(59,130,246,.3); box-shadow:0 6px 16px rgba(0,0,0,0.06); height: 100px;">
                        <div style="position:relative; z-index:2; max-width:62%;">
                            <div class="bv-t1-light" style="color:#1E3A8A; font-size: 17px; font-weight: 900; line-height: 1.3;">ज्योतिषी से सीधे बात करें</div>
                            <div class="bv-bump" style="margin-top:6px; background:#E53E3E; color:#FFF; font-weight:800; font-size:13px; padding:6px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(229,62,62,0.5); border:1px solid #FC8181;">
                                <i class="fa-solid fa-microphone"></i> अभी बात करें - मुफ़्त
                            </div>
                        </div>
                        <img src="assets/classy_astro_1.png" class="bvl-rf-astro" style="width:125px; height:125px; top:-12px; right:-15px; border:3px solid #FFF; box-shadow: -4px 0 15px rgba(59,130,246,0.2); object-fit:cover;">
                    </div>
                </div>
"""

# Find the end of mweb-banner-variants section
pattern = r'(</div>\s*</div>\s*)(<!-- 2\. NEW MWEB START)'
match = re.search(pattern, content)

if match:
    # Insert new banners right before the closing div
    insertion_point = match.start(1)
    new_content = content[:insertion_point] + new_banners + content[insertion_point:]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("New 5 banners added!")
else:
    print("Could not find insertion point!")

