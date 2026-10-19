"""Imagens 1080x1080 dos planos para o Catálogo do WhatsApp. Uso: python -I catalogo.py <pasta_py> <saida>"""
import sys, os, json
sys.path.insert(0, sys.argv[1])
import pymupdf
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

SAIDA = sys.argv[2]
RAIZ = r"C:/Users/rafae/autoregiao"
LAR, GRA, BRA, CIN = "#FF6600", "#1A1A1A", "#FFFFFF", "#BDBDBD"
L = json.load(open(os.path.join(RAIZ, "docs/plotagem-carro/_scripts/logo_camadas.json")))
LADO = 1080


def logo(x, y, largura):
    s = largura / L["W"]
    corpo = "".join(p.replace("{cor}", c) for k, c in [("branco", BRA), ("laranja", LAR)] for p in L["camadas"][k])
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({s:.6f})">{corpo}</g>'


def carregar(arq, peso):
    f = instancer.instantiateVariableFont(TTFont(os.path.join(RAIZ, ".next/static/media", arq)), {"wght": peso})
    return f.getGlyphSet(), f.getBestCmap(), f["head"].unitsPerEm


EXO = carregar("a626ed2fbe2db1bf-s.p.342nhdmq3f7um.woff2", 800)
JAK = carregar("fba5a26ea33df6a3-s.p.18rizl4rsrl42.woff2", 500)
JAKB = carregar("fba5a26ea33df6a3-s.p.18rizl4rsrl42.woff2", 750)


def largura(t, tam, f):
    gs, cm, upm = f
    return sum(gs[cm.get(ord(c), cm[ord("?")])].width for c in t) * tam / upm


def texto(t, x, y, tam, cor, f=JAK, alinh="esq"):
    gs, cm, upm = f
    s = tam / upm
    w = largura(t, tam, f)
    cx = x - (w if alinh == "dir" else w / 2 if alinh == "centro" else 0)
    out = []
    for c in t:
        g = cm.get(ord(c), cm[ord("?")])
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
        out.append(f'<path fill="{cor}" d="{pen.getCommands()}"/>')
        cx += gs[g].width * s
    return "".join(out)


def ok(x, y):
    return (f'<circle cx="{x}" cy="{y}" r="17" fill="{LAR}"/>'
            f'<path d="M{x - 8} {y} l5.5 5.5 l11 -11.5" stroke="{BRA}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')


PLANOS = [
    ("1-basico", "BÁSICO", "99", "até 15 carros", ["Página da loja com logo e mapa", "Contato direto no WhatsApp", "Relatório mensal de contatos"], False),
    ("2-profissional", "PROFISSIONAL", "169", "até 40 carros", ["Etiqueta “Destaque” nos anúncios", "Logo da loja nos anúncios", "Aparece antes do plano Básico"], True),
    ("3-premium", "PREMIUM", "279", "até 80 carros", ["Primeiro na busca", "Vitrine na página inicial", "Selo “Loja Premium”"], False),
]
M = 90
for arq, nome, preco, limite, itens, popular in PLANOS:
    c = [f'<rect width="{LADO}" height="{LADO}" fill="{GRA}"/>']
    c.append(f'<rect x="0" y="0" width="{LADO}" height="14" fill="{LAR}"/>')
    c.append(logo(M - 6, 70, 300))
    if popular:
        w = largura("MAIS ESCOLHIDO", 30, JAKB) + 56
        c.append(f'<rect x="{LADO - M - w}" y="92" width="{w}" height="60" rx="30" fill="{LAR}"/>')
        c.append(texto("MAIS ESCOLHIDO", LADO - M - w / 2, 133, 30, BRA, JAKB, "centro"))
    c.append(texto("PLANO", M, 330, 36, CIN, JAKB))
    c.append(texto(nome, M, 425, 96, LAR if popular else BRA, EXO))
    # preço
    c.append(texto("R$", M, 560, 48, BRA, EXO))
    wp = largura(preco, 150, EXO)
    c.append(texto(preco, M + 78, 590, 150, BRA, EXO))
    c.append(texto("/mês", M + 92 + wp, 590, 40, CIN, JAK))
    c.append(texto(limite, M, 650, 40, BRA, JAKB))
    y = 745
    for it in itens:
        c.append(ok(M + 17, y - 13)); c.append(texto(it, M + 52, y, 34, BRA, JAK)); y += 62
    # faixa inferior
    c.append(f'<rect x="0" y="{LADO - 120}" width="{LADO}" height="120" fill="{LAR}"/>')
    c.append(texto("60 DIAS GRÁTIS", M, LADO - 48, 50, GRA, EXO))
    c.append(texto("autoregiao.com.br", LADO - M, LADO - 50, 32, GRA, JAKB, "dir"))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{LADO}" height="{LADO}" viewBox="0 0 {LADO} {LADO}">'
           + "".join(c) + "</svg>")
    pymupdf.open("svg", svg.encode())[0].get_pixmap(dpi=72, alpha=False).save(os.path.join(SAIDA, f"catalogo-{arq}.png"))
print("ok")
