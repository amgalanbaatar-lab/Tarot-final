import os
import zlib
import struct
import math

def make_chunk(chunk_type, data):
    return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)

def save_png(filename, width, height, pixels):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type none
        row_offset = y * width * 3
        raw_data.extend(pixels[row_offset:row_offset + width * 3])
    compressed = zlib.compress(bytes(raw_data), level=6)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = make_chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    idat = make_chunk(b'IDAT', compressed)
    iend = make_chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(header + ihdr + idat + iend)

def generate_card_image(filename, title, card_type, symbol_type):
    width = 240
    height = 380
    pixels = bytearray(width * height * 3)

    # Colors
    c_bg_top = (16, 22, 34)       # Deep Midnight Blue
    c_bg_bottom = (9, 12, 19)     # Deep Midnight Black
    c_gold = (222, 183, 106)      # Metallic Gold
    c_gold_light = (248, 225, 168)# Bright Gold
    c_pink = (232, 188, 176)      # Champagne Pink
    c_pink_soft = (250, 219, 212) # Soft Rose

    cx = width / 2.0
    cy = height / 2.0

    for y in range(height):
        fy = y / float(height)
        # Background gradient with radial celestial glow in center
        dy_center = (y - cy) / (height * 0.5)
        for x in range(width):
            dx_center = (x - cx) / (width * 0.5)
            dist_c = math.sqrt(dx_center * dx_center + dy_center * dy_center)

            # Base gradient
            bg_r = int(c_bg_top[0] * (1 - fy) + c_bg_bottom[0] * fy)
            bg_g = int(c_bg_top[1] * (1 - fy) + c_bg_bottom[1] * fy)
            bg_b = int(c_bg_top[2] * (1 - fy) + c_bg_bottom[2] * fy)

            # Soft central aura glow
            if dist_c < 0.85:
                aura = (1.0 - (dist_c / 0.85)) * 0.35
                bg_r = min(255, int(bg_r + c_pink[0] * aura * 0.4 + c_gold[0] * aura * 0.6))
                bg_g = min(255, int(bg_g + c_pink[1] * aura * 0.4 + c_gold[1] * aura * 0.6))
                bg_b = min(255, int(bg_b + c_pink[2] * aura * 0.4 + c_gold[2] * aura * 0.6))

            r, g, b = bg_r, bg_g, bg_b

            # Border 1: outer gold border (8px from edge)
            if (x in (8, 9, width - 9, width - 10) and 8 <= y <= height - 9) or \
               (y in (8, 9, height - 9, height - 10) and 8 <= x <= width - 9):
                r, g, b = c_gold

            # Border 2: inner delicate border (14px from edge)
            if (x in (14, width - 15) and 14 <= y <= height - 15) or \
               (y in (14, height - 15) and 14 <= x <= width - 15):
                r, g, b = c_gold_light if (x + y) % 4 != 0 else (c_gold[0]//2, c_gold[1]//2, c_gold[2]//2)

            # Four corner rosettes / diamond points
            corner_dists = [
                math.hypot(x - 14, y - 14),
                math.hypot(x - (width - 15), y - 14),
                math.hypot(x - 14, y - (height - 15)),
                math.hypot(x - (width - 15), y - (height - 15))
            ]
            if any(d < 4.5 for d in corner_dists):
                r, g, b = c_gold_light

            # Celestial Mandala / Symbol in Center
            rx = x - cx
            ry = y - cy
            dist_center = math.hypot(rx, ry)

            if symbol_type == 'back':
                # Card back intricate double interlaced hexagram & sunburst
                if 58 <= dist_center <= 60 or 76 <= dist_center <= 78:
                    r, g, b = c_gold
                elif 38 <= dist_center <= 40:
                    r, g, b = c_gold_light
                elif dist_center < 12:
                    r, g, b = c_gold_light
                # Lattice pattern on back
                elif dist_center < 70 and (int(x + y) % 18 in (0, 1) or int(x - y) % 18 in (0, 1)):
                    r = min(255, int(r + 45))
                    g = min(255, int(g + 38))
                    b = min(255, int(b + 20))
            else:
                # Outer circle
                if 68 <= dist_center <= 70:
                    r, g, b = c_gold
                elif 52 <= dist_center <= 53.5:
                    r, g, b = c_pink

                # Sunburst rays or stars
                angle = math.atan2(ry, rx)
                ray = math.cos(angle * 12)
                if 53 < dist_center < 68 and ray > 0.8:
                    r, g, b = c_gold_light

                # Core symbol based on suit / type
                if symbol_type == 'cups':
                    # Chalice shape
                    if abs(rx) < 16 and -24 < ry < 8:
                        if ry > 0 and abs(rx) < (8 - ry * 0.5):
                            r, g, b = c_gold_light
                        elif ry <= 0 and abs(rx) < (14 - ry * 0.3):
                            r, g, b = c_pink if abs(rx) < 11 else c_gold_light
                    elif abs(rx) < 4 and 8 <= ry < 26:
                        r, g, b = c_gold
                    elif abs(rx) < 18 and 24 <= ry <= 28:
                        r, g, b = c_gold_light
                elif symbol_type == 'swords':
                    # Sword shape (blade, crossguard, hilt)
                    if abs(rx) < 3.5 and -38 <= ry <= 20:
                        r, g, b = c_pink_soft
                    elif abs(ry - 20) <= 2.5 and abs(rx) <= 22:
                        r, g, b = c_gold_light
                    elif abs(rx) < 3 and 22 <= ry <= 34:
                        r, g, b = c_gold
                    elif dist_center < 6 and ry > 32:
                        r, g, b = c_gold_light
                elif symbol_type == 'wands':
                    # Flowering staff
                    if abs(rx) < 4 and -36 <= ry <= 36:
                        r, g, b = c_gold
                    elif (abs(rx - ry*0.2) < 5 or abs(rx + ry*0.2) < 5) and abs(ry) < 32 and int(ry) % 14 < 4:
                        r, g, b = c_gold_light
                    elif dist_center < 7 and ry < -30:
                        r, g, b = c_pink_soft
                elif symbol_type == 'pentacles':
                    # Pentagram star inside coin
                    if dist_center <= 28:
                        if 25 <= dist_center <= 27:
                            r, g, b = c_gold_light
                        else:
                            # 5-pointed star lines
                            star_pts = [(20 * math.cos(i * 2 * math.pi / 5 - math.pi/2),
                                         20 * math.sin(i * 2 * math.pi / 5 - math.pi/2)) for i in range(5)]
                            # check if near line
                            near_line = False
                            for i in range(5):
                                p1 = star_pts[i]
                                p2 = star_pts[(i + 2) % 5]
                                # dist from (rx, ry) to segment p1-p2
                                l2 = (p2[0]-p1[0])**2 + (p2[1]-p1[1])**2
                                t = max(0, min(1, ((rx-p1[0])*(p2[0]-p1[0]) + (ry-p1[1])*(p2[1]-p1[1])) / l2))
                                proj = (p1[0] + t*(p2[0]-p1[0]), p1[1] + t*(p2[1]-p1[1]))
                                if math.hypot(rx - proj[0], ry - proj[1]) < 1.6:
                                    near_line = True
                                    break
                            if near_line:
                                r, g, b = c_gold_light
                            else:
                                r = min(255, int(r * 0.8 + c_gold[0] * 0.2))
                                g = min(255, int(g * 0.8 + c_gold[1] * 0.2))
                                b = min(255, int(b * 0.8 + c_gold[2] * 0.2))
                else: # major / mystic
                    # Sacred Sun and Moon
                    if dist_center < 20:
                        # Crescent moon
                        cres_dist = math.hypot(rx - 6, ry)
                        if dist_center < 16 and cres_dist > 8:
                            r, g, b = c_gold_light
                        elif math.hypot(rx + 6, ry) < 5:
                            r, g, b = c_pink_soft
                    # Radiant 8 points
                    if 26 <= dist_center <= 46:
                        p_ang = math.atan2(ry, rx)
                        if math.cos(p_ang * 8) > 0.85:
                            r, g, b = c_gold

            idx = (y * width + x) * 3
            pixels[idx] = r
            pixels[idx + 1] = g
            pixels[idx + 2] = b

    save_png(filename, width, height, pixels)

os.makedirs('public/tarot', exist_ok=True)

# Generate Card Back
print("Generating card-back.png...")
generate_card_image('public/tarot/card-back.png', 'Card Back', 'back', 'back')

# 22 Major Arcana Slugs
majors = [
    ('fool', 'The Fool', 'major'),
    ('magician', 'The Magician', 'major'),
    ('high-priestess', 'The High Priestess', 'major'),
    ('empress', 'The Empress', 'major'),
    ('emperor', 'The Emperor', 'major'),
    ('hierophant', 'The Hierophant', 'major'),
    ('lovers', 'The Lovers', 'major'),
    ('chariot', 'The Chariot', 'major'),
    ('strength', 'Strength', 'major'),
    ('hermit', 'The Hermit', 'major'),
    ('wheel-of-fortune', 'Wheel of Fortune', 'major'),
    ('justice', 'Justice', 'major'),
    ('hanged-man', 'The Hanged Man', 'major'),
    ('death', 'Death', 'major'),
    ('temperance', 'Temperance', 'major'),
    ('devil', 'The Devil', 'major'),
    ('tower', 'The Tower', 'major'),
    ('star', 'The Star', 'major'),
    ('moon', 'The Moon', 'major'),
    ('sun', 'The Sun', 'major'),
    ('judgement', 'Judgement', 'major'),
    ('world', 'The World', 'major')
]

for slug, name, stype in majors:
    generate_card_image(f'public/tarot/{slug}.png', name, 'major', stype)

# Minor Arcana Suits
suits = [
    ('wands', 'wands'),
    ('cups', 'cups'),
    ('swords', 'swords'),
    ('pentacles', 'pentacles')
]

ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king']

for suit_name, symbol_type in suits:
    for rank in ranks:
        slug = f'{suit_name}-{rank}'
        title = f'{rank.capitalize()} of {suit_name.capitalize()}'
        generate_card_image(f'public/tarot/{slug}.png', title, 'minor', symbol_type)

print("Generated 78 cards + card-back.png in public/tarot!")
