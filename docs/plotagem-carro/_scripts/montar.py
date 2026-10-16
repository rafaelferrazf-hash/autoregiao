"""Monta os arquivos de plotagem (Fiat Punto 4 portas branco) em escala real (mm)."""
import sys, os, json
sys.path.insert(0, sys.argv[1])
import pymupdf
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = sys.argv[2]
os.makedirs(SAIDA, exist_ok=True)
LAR, GRA, BRA, PRE = "#FF6600", "#1A1A1A", "#FFFFFF", "#000000"
PT = 72 / 25.4  # pontos por mm

L = json.load(open(os.path.join(AQUI, "logo_camadas.json")))
LW, LH = L["W"], L["H"]


def logo(x, y, largura, versao):
    """Logo em vetor posicionado em mm. versao: 'pos' (fundo claro) ou 'neg' (fundo escuro)."""
    cores = [("branco", GRA), ("laranja", LAR)] if versao == "pos" else [("branco", BRA), ("laranja", LAR)]
    s = largura / LW
    corpo = "".join(p.replace("{cor}", c) for k, c in cores for p in L["camadas"][k])
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({s:.6f})">{corpo}</g>', largura * LH / LW


# Exo 2 (fonte da marca) em peso 700, texto convertido em curvas.
fonte = TTFont(r"C:/Users/rafae/autoregiao/.next/static/media/a626ed2fbe2db1bf-s.p.342nhdmq3f7um.woff2")
fonte = instancer.instantiateVariableFont(fonte, {"wght": 700})
GS, CMAP, UPM = fonte.getGlyphSet(), fonte.getBestCmap(), fonte["head"].unitsPerEm


def texto(t, x, y_base, altura_mm, cor, centro=False, espaco=0.0):
    """altura_mm = tamanho da fonte (em mm)."""
    s = altura_mm / UPM
    larg = sum(GS[CMAP[ord(c)]].width for c in t) * s + espaco * (len(t) - 1)
    cx = x - larg / 2 if centro else x
    out = []
    for c in t:
        g = CMAP[ord(c)]
        pen = SVGPathPen(GS)
        GS[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y_base)))
        out.append(f'<path fill="{cor}" d="{pen.getCommands()}"/>')
        cx += GS[g].width * s + espaco
    return "".join(out), larg


def salvar(nome, W, H, corpo, fundo=None):
    bg = f'<rect width="{W}" height="{H}" fill="{fundo}"/>' if fundo else ""
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * PT:.2f}" height="{H * PT:.2f}" '
           f'viewBox="0 0 {W} {H}">{bg}{corpo}</svg>')
    p = os.path.join(SAIDA, nome + ".svg")
    open(p, "w", encoding="utf-8").write(svg)
    doc = pymupdf.open(p)
    pdf = pymupdf.open("pdf", doc.convert_to_pdf())
    pdf.set_metadata({"title": nome, "author": "AutoRegião", "creator": "AutoRegião"})
    pdf.save(os.path.join(SAIDA, nome + ".pdf"), deflate=True)
    return svg


# ---------- Lateral (área das duas portas, abaixo dos vidros) ----------
SW, SH = 1900, 550  # mm (aprox. Fiat Punto 4 portas: porta dianteira ~1.050 + traseira ~850)
LOGO_LARG = 640


def faixa():
    """Duas lâminas (grafite em cima, laranja embaixo) subindo para a traseira (direita)."""
    return (f'<path fill="{GRA}" d="M150 520 Q1100 470 1900 300 L1900 345 Q1150 505 150 520 Z"/>'
            f'<path fill="{LAR}" d="M400 532 Q1200 500 1900 365 L1900 392 Q1250 527 400 532 Z"/>')


def lateral(lado):
    lg, lh = logo(0, 0, LOGO_LARG, "pos")
    x = 170 if lado == "esquerda" else SW - 170 - LOGO_LARG
    g_logo = logo(x, 40, LOGO_LARG, "pos")[0]
    f = faixa() if lado == "esquerda" else f'<g transform="translate({SW} 0) scale(-1 1)">{faixa()}</g>'
    return g_logo + f


for lado in ("esquerda", "direita"):
    salvar(f"02-lateral-{lado}_1900x550mm_escala-real", SW, SH, lateral(lado))

# ---------- Vidro traseiro (microperfurado, fundo preto) ----------
VW, VH, SANG = 1000, 420, 20  # vidro aprox. + 20 mm de sangria em volta
TW, TH = VW + 2 * SANG, VH + 2 * SANG


def vidro(com_site):
    larg = 560 if com_site else 620
    lh = larg * LH / LW
    topo = (TH - (lh + (70 if com_site else 0))) / 2
    corpo, _ = logo((TW - larg) / 2, topo, larg, "neg")
    if com_site:
        t, _ = texto("autoregiao.com.br", TW / 2, topo + lh + 62, 52, BRA, centro=True)
        corpo += t
    return corpo


salvar("03-vidro-traseiro_A-como-modelo_1040x460mm", TW, TH, vidro(False), fundo=PRE)
salvar("03-vidro-traseiro_B-com-site_1040x460mm", TW, TH, vidro(True), fundo=PRE)

# ---------- Logos soltos (vetor) ----------
salvar("01-logo-fundo-claro_vetor_640mm", LOGO_LARG, round(LOGO_LARG * LH / LW, 1), logo(0, 0, LOGO_LARG, "pos")[0])
salvar("01-logo-fundo-escuro_vetor_640mm", LOGO_LARG, round(LOGO_LARG * LH / LW, 1),
       logo(0, 0, LOGO_LARG, "neg")[0], fundo=PRE)
salvar("01-faixa-lateral_vetor_1750x232mm", 1750, 232, f'<g transform="translate(-150 -300)">{faixa()}</g>')

# ---------- Folha de instruções (A3 deitada: 420 x 297 mm) ----------
FW, FH = 420, 297
c = []


def t(s, x, y, tam, cor=GRA, centro=False):
    c.append(texto(s, x, y, tam, cor, centro)[0])


def caixa(x, y, w, h, escala, conteudo, fundo=None, rotulo=""):
    bg = f'<rect width="{w / escala}" height="{h / escala}" fill="{fundo}"/>' if fundo else ""
    c.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#F2F2F2" stroke="#999" stroke-width="0.3"/>')
    c.append(f'<g transform="translate({x} {y}) scale({escala})">{bg}{conteudo}</g>')
    if rotulo:
        t(rotulo, x, y - 2.5, 4.2)


t("AutoRegião — plotagem do Fiat Punto 4 portas (branco)", 15, 20, 9)
t("Medidas APROXIMADAS: o adesivador deve medir o carro e ajustar. Os arquivos são vetor (ampliam sem perder qualidade).", 15, 29, 4.2, "#555")

e = 0.12
caixa(15, 45, SW * e, SH * e, e, lateral("esquerda") + f'<line x1="1050" y1="0" x2="1050" y2="{SH}" stroke="#E0007A" stroke-width="4" stroke-dasharray="20 14"/>',
      rotulo="LADO ESQUERDO (motorista) — 1.900 x 550 mm — frente do carro à esquerda")
caixa(15, 125, SW * e, SH * e, e, lateral("direita") + f'<line x1="850" y1="0" x2="850" y2="{SH}" stroke="#E0007A" stroke-width="4" stroke-dasharray="20 14"/>',
      rotulo="LADO DIREITO (passageiro) — espelhado: logo na porta dianteira, faixa sobe para a traseira")
caixa(260, 45, TW * 0.14, TH * 0.14, 0.14, vidro(False), fundo=PRE, rotulo="VIDRO TRASEIRO A (como no modelo)")
caixa(260, 125, TW * 0.14, TH * 0.14, 0.14, vidro(True), fundo=PRE, rotulo="VIDRO TRASEIRO B (com o site) — recomendado")

y = 210
for linha in [
    "LINHA ROSA TRACEJADA = divisão entre as portas (aproximada). Não imprimir: o adesivador corta a faixa no vão da porta.",
    "Logo na porta dianteira (640 mm de largura), alinhado acima da faixa, longe da maçaneta.",
    "Vidro traseiro: vinil MICROPERFURADO (quem está dentro enxerga para fora). Cortar no formato do vidro; sangria de 20 mm.",
    "Cores: LARANJA #FF6600 (CMYK aprox. 0/75/100/0 — Pantone 1505 C aprox.)   GRAFITE #1A1A1A (CMYK aprox. 0/0/0/90).",
    "Pedir PROVA DE COR antes de imprimir tudo (o laranja varia muito de uma impressora para outra).",
    "Arquivos: PDF e SVG em vetor, escala 1:1 (tamanho real), textos já convertidos em curvas (não precisa da fonte).",
    "Laminação recomendada (proteção contra sol e lavagem).",
]:
    t("•  " + linha, 15, y, 4.4)
    y += 9.5

c.append(f'<rect x="15" y="{FH - 22}" width="12" height="12" fill="{LAR}"/><rect x="30" y="{FH - 22}" width="12" height="12" fill="{GRA}"/>')
t("Laranja  #FF6600", 46, FH - 15.5, 4, GRA)
t("Grafite  #1A1A1A", 46, FH - 10, 4, GRA)
t("Dúvidas: contato@autoregiao.com.br", FW - 15 - 80, FH - 10, 4, "#555")
salvar("00-LEIA-instrucoes-para-o-adesivador_A3", FW, FH, "".join(c), fundo=BRA)
pymupdf.open(os.path.join(SAIDA, "00-LEIA-instrucoes-para-o-adesivador_A3.pdf"))[0].get_pixmap(dpi=150).save(os.path.join(SAIDA, "00-previa.png"))
print("ok")
