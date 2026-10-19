"""Foto de perfil 1080x1080 (símbolo AR) para WhatsApp/Instagram. Uso: python -I perfil.py <pasta_py> <saida>"""
import sys, os, json
sys.path.insert(0, sys.argv[1])
import pymupdf

SAIDA = sys.argv[2]
os.makedirs(SAIDA, exist_ok=True)
L = json.load(open(r"C:/Users/rafae/autoregiao/docs/plotagem-carro/_scripts/logo_camadas.json"))
LAR, GRA, BRA = "#FF6600", "#1A1A1A", "#FFFFFF"
ESC = L["W"] / 1510  # as camadas foram traçadas em 4x o PNG original (1510 x 688)
# (MuPDF ignora clipPath: o texto abaixo do símbolo é coberto com a cor do fundo.)
# Região do símbolo AR no PNG original (px): x 270–1235, y 20–390.
SX, SY, SW, SH = 270 * ESC, 20 * ESC, 965 * ESC, 370 * ESC
LADO = 1080


def perfil(nome, fundo, versao):
    cores = [("branco", GRA if versao == "pos" else BRA), ("laranja", LAR)]
    corpo = "".join(p.replace("{cor}", c) for k, c in cores for p in L["camadas"][k])
    larg = LADO * 0.72  # cabe folgado dentro do círculo do WhatsApp
    s = larg / SW
    alt = SH * s
    x, y = (LADO - larg) / 2, (LADO - alt) / 2 + LADO * 0.02
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{LADO}" height="{LADO}" viewBox="0 0 {LADO} {LADO}">'
           f'<rect width="{LADO}" height="{LADO}" fill="{fundo}"/>'
           f'<g transform="translate({x:.1f} {y:.1f}) scale({s:.6f}) translate({-SX:.1f} {-SY:.1f})">{corpo}<rect x="-2000" y="{SY + SH}" width="10000" height="5000" fill="{fundo}"/></g></svg>')
    doc = pymupdf.open("svg", svg.encode())
    doc[0].get_pixmap(dpi=72, alpha=False).save(os.path.join(SAIDA, nome + ".png"))
    # prévia com o recorte redondo do WhatsApp
    prev = svg.replace("</svg>", f'<path fill="#E9E9E9" fill-rule="evenodd" d="M0 0H{LADO}V{LADO}H0Z M{LADO/2} 0a{LADO/2} {LADO/2} 0 1 0 0.1 0Z"/></svg>')
    pymupdf.open("svg", prev.encode())[0].get_pixmap(dpi=24, alpha=False).save(os.path.join(SAIDA, "_previa-" + nome + ".png"))


perfil("perfil-whatsapp-grafite", GRA, "neg")
perfil("perfil-whatsapp-branco", BRA, "pos")
print("ok")
