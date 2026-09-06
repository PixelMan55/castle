#!/usr/bin/env python3
"""Composite The Castle Quest share cards from restored storybook art."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

ROOT = Path("/workspace")
GROK = ROOT / ".grok"
PUBLIC = ROOT / "public"
FONTS = GROK / "fonts"

PAPER = (244, 238, 227)
INK = (47, 36, 31)
ROSE = (196, 92, 106)
MEADOW = (76, 138, 98)

FRAUNCES = str(FONTS / "fraunces-latin.woff2")
FREDOKA = str(FONTS / "fredoka-latin.woff2")


def cover_crop(im: Image.Image, w: int, h: int, fx: float = 0.5, fy: float = 0.48) -> Image.Image:
    src_w, src_h = im.size
    scale = max(w / src_w, h / src_h)
    nw, nh = round(src_w * scale), round(src_h * scale)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, min(nw - w, int(nw * fx - w / 2)))
    top = max(0, min(nh - h, int(nh * fy - h / 2)))
    return resized.crop((left, top, left + w, top + h))


def strip_crop(im: Image.Image, w: int, h: int, fy: float = 0.42) -> Image.Image:
    src_w, src_h = im.size
    src_band_h = src_w * h / w
    top = max(0.0, min(src_h - src_band_h, src_h * fy - src_band_h / 2))
    band = im.crop((0, int(top), src_w, int(top + src_band_h)))
    return band.resize((w, h), Image.Resampling.LANCZOS)


def content(im: Image.Image, pad: int = 2) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def load_rgba(path: str | Path) -> Image.Image:
    return content(Image.open(path).convert("RGBA"))


def scale_h(im: Image.Image, height: int) -> Image.Image:
    if im.height == height:
        return im
    w = max(1, round(im.width * height / im.height))
    return im.resize((w, height), Image.Resampling.LANCZOS)


def drop_shadow(sprite: Image.Image, blur: int = 10, opacity: int = 96, dy: int = 10) -> Image.Image:
    alpha = sprite.split()[-1]
    shadow = Image.new("RGBA", sprite.size, (47, 36, 31, 0))
    shadow.putalpha(alpha.point(lambda a: int(a * opacity / 255)))
    canvas = Image.new("RGBA", (sprite.width + blur * 4, sprite.height + blur * 4 + dy), (0, 0, 0, 0))
    canvas.paste(shadow, (blur * 2, blur * 2 + dy), shadow)
    canvas = canvas.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(sprite, (blur * 2, blur * 2))
    return canvas


def ground_blob(width: int, height: int, opacity: int = 70) -> Image.Image:
    im = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((0, 0, width - 1, height - 1), fill=(47, 36, 31, opacity))
    return im.filter(ImageFilter.GaussianBlur(max(2, height // 4)))


def paste(base: Image.Image, sprite: Image.Image, x: int, y: int, anchor: str = "mm") -> None:
    ax = {"l": 0, "m": sprite.width // 2, "r": sprite.width}[anchor[0]]
    ay = {"t": 0, "m": sprite.height // 2, "b": sprite.height}[anchor[1]]
    base.alpha_composite(sprite, (int(x - ax), int(y - ay)))


def paper_wash(w: int, h: int, radius: int = 36) -> Image.Image:
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=(*PAPER, 220))
    d.rounded_rectangle((3, 3, w - 4, h - 4), radius=max(8, radius - 3), outline=(*ROSE, 220), width=4)
    d.rounded_rectangle((10, 10, w - 11, h - 11), radius=max(6, radius - 8), outline=(*MEADOW, 150), width=2)
    return im


def text_card(
    lines: list[tuple[str, ImageFont.FreeTypeFont, tuple[int, int, int]]],
    stroke: int,
    gap: int,
) -> Image.Image:
    dummy = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    boxes = []
    for text, font, _fill in lines:
        b = dummy.textbbox((0, 0), text, font=font, stroke_width=stroke)
        boxes.append((b[2] - b[0], b[3] - b[1], -b[0], -b[1]))
    width = max(w for w, *_ in boxes)
    height = sum(h for _, h, *_ in boxes) + gap * (len(lines) - 1)
    pad = stroke + 16
    im = Image.new("RGBA", (width + pad * 2, height + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    y = pad
    for (text, font, fill), (tw, th, ox, oy) in zip(lines, boxes):
        x = pad + (width - tw) // 2
        d.text(
            (x + ox, y + oy + 3),
            text,
            font=font,
            fill=(*INK, 64),
            stroke_width=stroke,
            stroke_fill=(*INK, 64),
        )
        d.text(
            (x + ox, y + oy),
            text,
            font=font,
            fill=fill,
            stroke_width=stroke,
            stroke_fill=PAPER,
        )
        y += th + gap
    return im


def vignette(size: tuple[int, int], strength: float = 0.42) -> Image.Image:
    w, h = size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    inset_x, inset_y = int(w * 0.08), int(h * 0.10)
    d.ellipse((-inset_x, -inset_y, w + inset_x, h + inset_y), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(90))
    overlay = Image.new("RGBA", (w, h), (*INK, 0))
    inv = mask.point(lambda p: int((255 - p) * strength))
    overlay.putalpha(inv)
    return overlay


def compose_og() -> Image.Image:
    w, h = 1200, 630
    castle = Image.open(PUBLIC / "maps/castle-far.jpg").convert("RGB")
    bg = cover_crop(castle, w, h, fx=0.54, fy=0.46)
    bg = ImageEnhance.Color(bg).enhance(1.06)
    bg = ImageEnhance.Contrast(bg).enhance(1.04)
    paper = Image.new("RGB", (w, h), PAPER)
    bg = Image.blend(bg, paper, 0.10)
    canvas = bg.convert("RGBA")
    canvas.alpha_composite(vignette((w, h), 0.36))

    pip = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/player/idle-1.png"), 304), blur=12, opacity=110, dy=14)
    key = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/key.png"), 112), blur=8, opacity=90, dy=8)
    flower = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/flower.png"), 100), blur=8, opacity=85, dy=8)
    star = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/star.png"), 82), blur=6, opacity=70, dy=4)
    rainbow = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/rainbow.png"), 118), blur=6, opacity=60, dy=4)
    horse = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/horse.png"), 108), blur=8, opacity=90, dy=7)
    duck = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/duck.png"), 78), blur=6, opacity=80, dy=5)
    firefly = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/firefly.png"), 64), blur=5, opacity=60, dy=3)
    apple = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/apple.png"), 64), blur=6, opacity=75, dy=5)

    paste(canvas, rainbow, 150, 112, "mm")
    paste(canvas, star, 1060, 96, "mm")
    paste(canvas, firefly, 980, 168, "mm")

    title_font = ImageFont.truetype(FRAUNCES, 132)
    quest_font = ImageFont.truetype(FRAUNCES, 162)
    tag_font = ImageFont.truetype(FRAUNCES, 26)
    lockup = text_card(
        [
            ("The Castle", title_font, INK),
            ("Quest", quest_font, ROSE),
        ],
        stroke=8,
        gap=-8,
    )
    tag = text_card([("a storybook puzzle-adventure", tag_font, INK)], stroke=3, gap=0)
    plate_w = max(lockup.width, tag.width) + 56
    plate_h = lockup.height + tag.height - 18
    plate = paper_wash(plate_w, plate_h, radius=36)
    paste(canvas, plate, 600, 292, "mm")
    paste(canvas, lockup, 600, 272, "mm")
    paste(canvas, tag, 600, 272 + lockup.height // 2 - 4, "mt")

    paste(canvas, ground_blob(200, 42, 78), 200, 604, "mm")
    paste(canvas, ground_blob(120, 28, 60), 455, 612, "mm")
    paste(canvas, pip, 188, 618, "mb")
    paste(canvas, duck, 318, 622, "mb")
    paste(canvas, flower, 64, 568, "mb")
    paste(canvas, apple, 96, 624, "mb")
    paste(canvas, key, 356, 590, "mb")
    paste(canvas, horse, 500, 626, "mb")

    return canvas.convert("RGB")


def compose_banner() -> Image.Image:
    w, h = 1200, 264
    castle = Image.open(PUBLIC / "maps/castle-far.jpg").convert("RGB")
    bg = strip_crop(castle, w, h, fy=0.38)
    bg = ImageEnhance.Color(bg).enhance(1.05)
    paper = Image.new("RGB", (w, h), PAPER)
    bg = Image.blend(bg, paper, 0.10)
    canvas = bg.convert("RGBA")

    title_font = ImageFont.truetype(FRAUNCES, 44)
    quest_font = ImageFont.truetype(FRAUNCES, 58)
    lockup = text_card(
        [
            ("The Castle", title_font, INK),
            ("Quest", quest_font, ROSE),
        ],
        stroke=4,
        gap=-4,
    )
    plate = paper_wash(lockup.width + 36, lockup.height + 8, radius=22)
    # Plate and lockup: left half, glyphs fully above the midline (y=132).
    paste(canvas, plate, 338, 76, "mm")
    paste(canvas, lockup, 338, 74, "mm")

    canvas.alpha_composite(vignette((w, h), 0.26))

    pip = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/player/idle-1.png"), 168), blur=8, opacity=100, dy=8)
    key = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/key.png"), 68), blur=5, opacity=80, dy=4)
    flower = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/flower.png"), 60), blur=5, opacity=80, dy=4)
    star = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/star.png"), 52), blur=4, opacity=60, dy=2)
    rainbow = drop_shadow(scale_h(load_rgba(PUBLIC / "sprites/items/rainbow.png"), 80), blur=4, opacity=55, dy=2)

    paste(canvas, rainbow, 1094, 52, "mm")
    paste(canvas, star, 990, 44, "mm")
    paste(canvas, ground_blob(120, 26, 75), 88, 250, "mm")
    paste(canvas, pip, 88, 260, "mb")
    paste(canvas, flower, 176, 252, "mb")
    paste(canvas, key, 500, 168, "mb")

    return canvas.convert("RGB")


def save_jpeg(im: Image.Image, path: Path, quality: int = 88) -> None:
    im.save(path, "JPEG", quality=quality, optimize=True, subsampling=1)


def main() -> None:
    GROK.mkdir(parents=True, exist_ok=True)
    og = compose_og()
    banner = compose_banner()
    og.save(GROK / "og-preview.png", "PNG")
    banner.save(GROK / "x-banner-preview.png", "PNG")
    save_jpeg(og, GROK / "og.jpg.tmp", 88)
    save_jpeg(banner, GROK / "x-banner.jpg.tmp", 88)
    site = {"title": "The Castle Quest", "type": "x:game", "card": "custom"}
    (GROK / "site.json.tmp").write_text(json.dumps(site, indent=2) + "\n")
    print("og", og.size, (GROK / "og.jpg.tmp").stat().st_size // 1024, "KB")
    print("banner", banner.size, (GROK / "x-banner.jpg.tmp").stat().st_size // 1024, "KB")
    # lockup diagnostics
    from PIL import Image as _I
    print("og jpg exists", (GROK / "og.jpg.tmp").exists())


if __name__ == "__main__":
    main()
