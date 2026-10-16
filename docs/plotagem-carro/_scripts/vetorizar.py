"""Vetoriza o logo-completo.png (cores chapadas) em camadas: laranja, branco (letras) e preto (contorno)."""
import sys, re, os
sys.path.insert(0, sys.argv[1])  # pasta py
import numpy as np, vtracer
from PIL import Image, ImageFilter
from scipy import ndimage  # noqa

SRC = r"C:/Users/rafae/autoregiao/public/marca/logo-completo.png"
OUT = sys.argv[2]
ESC = 4

im = np.array(Image.open(SRC).convert("RGBA")).astype(float) / 255
r, g, b, a = im[..., 0], im[..., 1], im[..., 2], im[..., 3]
sat = r - b
laranja = np.clip((sat - 0.35) / 0.3, 0, 1) * (a > 0.5)
branco = np.clip((np.minimum(np.minimum(r, g), b) - 0.35) / 0.3, 0, 1) * (sat < 0.25) * (a > 0.5)
preto = np.clip((0.35 - np.maximum(np.maximum(r, g), b)) / 0.25, 0, 1) * (a > 0.5)

# Branco da borda externa (encosta no transparente) x branco das letras (cercado de preto).
lab, n = ndimage.label(branco > 0.5)
fora = ndimage.binary_dilation(a < 0.5, iterations=3)
borda = np.isin(lab, np.unique(lab[fora & (lab > 0)]))
branco_letras = branco * (~ndimage.binary_dilation(borda, iterations=2))
# Silhueta (tudo que não é transparente), para o fundo preto opcional.
silhueta = (a > 0.5).astype(float)


def tracar(campo, nome):
    m = Image.fromarray((campo * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    m = m.resize((m.width * ESC, m.height * ESC), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.5))
    bw = Image.fromarray(np.where(np.array(m) > 127, 0, 255).astype(np.uint8)).convert("RGB")
    p = os.path.join(OUT, f"_m_{nome}.png"); bw.save(p)
    s = os.path.join(OUT, f"_t_{nome}.svg")
    vtracer.convert_image_to_svg_py(p, s, colormode="binary", mode="spline", filter_speckle=40,
                                    corner_threshold=70, length_threshold=4.0, splice_threshold=45,
                                    path_precision=2)
    txt = open(s, encoding="utf-8").read()
    return re.findall(r"<path[^>]*/>", txt), m.width, m.height


camadas = {}
for nome, campo in [("laranja", laranja), ("branco", branco_letras), ("preto", preto), ("silhueta", silhueta)]:
    paths, W, H = tracar(campo, nome)
    camadas[nome] = [re.sub(r'fill="[^"]*"', "", p).replace("<path", '<path fill="{cor}"') for p in paths]
    print(nome, len(paths))

import json
json.dump({"W": W, "H": H, "camadas": camadas}, open(os.path.join(OUT, "logo_camadas.json"), "w"))
