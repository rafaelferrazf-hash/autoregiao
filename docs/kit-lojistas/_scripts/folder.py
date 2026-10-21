"""Folder A4 com 2 dobras (6 painéis) para lojistas. Uso: python -I folder.py <pasta_py> <pasta_saida> "<whatsapp>"."""
import sys, os, json
sys.path.insert(0, sys.argv[1])
import pymupdf, segno, base64
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

SAIDA, WHATS = sys.argv[2], sys.argv[3]
os.makedirs(SAIDA, exist_ok=True)
RAIZ = r"C:/Users/rafae/autoregiao"
LAR, GRA, BRA, CIN = "#FF6600", "#1A1A1A", "#FFFFFF", "#5A5A5A"
PT = 72 / 25.4
SANG = 3  # sangria
W, H = 297 + 2 * SANG, 210 + 2 * SANG  # A4 deitado + sangria
LINK = "https://www.autoregiao.com.br/anunciar?utm_source=folder&utm_campaign=lojistas"
LINK_APP = "https://www.autoregiao.com.br/app"  # leva à Google Play / App Store conforme o celular (app/app/route.ts)

L = json.load(open(os.path.join(RAIZ, "docs/plotagem-carro/_scripts/logo_camadas.json")))


def logo(x, y, largura, versao):
    cores = [("branco", GRA), ("laranja", LAR)] if versao == "pos" else [("branco", BRA), ("laranja", LAR)]
    s = largura / L["W"]
    corpo = "".join(p.replace("{cor}", c) for k, c in cores for p in L["camadas"][k])
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({s:.6f})">{corpo}</g>'


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
    cx = x - (largura(t, tam, f) if alinh == "dir" else largura(t, tam, f) / 2 if alinh == "centro" else 0)
    out = []
    for c in t:
        g = cm.get(ord(c), cm[ord("?")])
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
        out.append(f'<path fill="{cor}" d="{pen.getCommands()}"/>')
        cx += gs[g].width * s
    return "".join(out)


def qr(x, y, lado, dado):
    q = segno.make(dado, error="m")
    n = q.symbol_size(border=0)[0]
    m = lado / n
    rects = "".join(f'<rect x="{x + c * m:.3f}" y="{y + r * m:.3f}" width="{m + 0.02:.3f}" height="{m + 0.02:.3f}"/>'
                    for r, linha in enumerate(q.matrix) for c, v in enumerate(linha) if v)
    borda = max(2.5, 4 * m)  # zona branca de 4 módulos em volta: os celulares leem com mais facilidade
    return f'<rect x="{x - borda:.2f}" y="{y - borda:.2f}" width="{lado + 2 * borda:.2f}" height="{lado + 2 * borda:.2f}" rx="2" fill="{BRA}"/><g fill="{GRA}">{rects}</g>'


def icone_ok(x, y, cor=LAR):
    return (f'<circle cx="{x}" cy="{y}" r="2.6" fill="{cor}"/>'
            f'<path d="M{x - 1.3} {y} l0.9 0.9 l1.8 -1.9" stroke="{BRA}" stroke-width="0.6" fill="none" stroke-linecap="round"/>')


def _png(caminho_ou_bytes):
    return base64.b64encode(caminho_ou_bytes if isinstance(caminho_ou_bytes, bytes) else open(caminho_ou_bytes, "rb").read()).decode()


def selos(x, y, alt):
    """Selos oficiais "Disponível no Google Play" e "App Store" lado a lado, com altura alt (mm)."""
    gp = Image.open(os.path.join(RAIZ, "public/banners/google-play.png"))
    # o PNG do Google Play tem margem transparente (~16% em cada lado na altura); compensa para alinhar
    alt_gp = alt / 0.68; larg_gp = alt_gp * gp.width / gp.height
    svg = pymupdf.open("svg", open(os.path.join(RAIZ, "public/banners/app-store.svg"), "rb").read())
    pix = svg[0].get_pixmap(dpi=1200); larg_as = alt * pix.width / pix.height
    return (f'<image x="{x - larg_gp * 0.06:.2f}" y="{y - (alt_gp - alt) / 2:.2f}" width="{larg_gp:.2f}" height="{alt_gp:.2f}" href="data:image/png;base64,{_png(os.path.join(RAIZ, "public/banners/google-play.png"))}"/>'
            f'<image x="{x + larg_gp * 0.88 + 2.5:.2f}" y="{y:.2f}" width="{larg_as:.2f}" height="{alt:.2f}" href="data:image/png;base64,{_png(pix.tobytes("png"))}"/>')


def salvar(nome, corpo, fundo):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * PT:.2f}" height="{H * PT:.2f}" viewBox="0 0 {W} {H}">'
           f'<rect width="{W}" height="{H}" fill="{fundo}"/>{corpo}</svg>')
    return pymupdf.open("pdf", pymupdf.open("svg", svg.encode()).convert_to_pdf())



import io
import re


def paragrafo(t, x, y, tam, cor, f, larg, entre):
    """Texto com quebra de linha automática na largura larg (mm). Devolve (svg, y da última linha)."""
    linhas, atual = [], ""
    for p in t.split():
        teste = (atual + " " + p).strip()
        if largura(teste, tam, f) <= larg:
            atual = teste
        else:
            linhas.append(atual)
            atual = p
    if atual:
        linhas.append(atual)
    out = "".join(texto(l, x, y + i * entre, tam, cor, f) for i, l in enumerate(linhas))
    return out, y + (len(linhas) - 1) * entre


def _jpg(im, q=90):
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=q)
    return base64.b64encode(buf.getvalue()).decode()


def foto(caminho, x, y, w, h, pos_x=0.5, pos_y=0.3, escurecer=None):
    """Foto cortada na proporção w×h (mm); escurecer(t) = opacidade do grafite em cada altura (0..1)."""
    im = Image.open(caminho).convert("RGB")
    pw = 1500
    ph = round(pw * h / w)
    esc = max(pw / im.width, ph / im.height)
    im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
    x0 = int((im.width - pw) * pos_x)
    y0 = int((im.height - ph) * pos_y)
    im = im.crop((x0, y0, x0 + pw, y0 + ph))
    if escurecer:
        escuro = Image.new("RGB", im.size, (26, 26, 26))
        masc = Image.new("L", im.size)
        for yy in range(ph):
            masc.paste(int(255 * min(1.0, max(0.0, escurecer(yy / ph)))), (0, yy, pw, yy + 1))
        im = Image.composite(escuro, im, masc)
    return f'<image x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" href="data:image/jpeg;base64,{_jpg(im)}"/>'


def celular(caminho, x, y, w, ini=0.0, fim=1.0):
    """Captura do site dentro de um celular fino (borda de 0,9 mm, cantos arredondados, ilha da câmera e sombra leve).
    Devolve (svg, altura total)."""
    from PIL import ImageDraw
    im = Image.open(caminho).convert("RGB")
    im = im.crop((0, int(im.height * ini), im.width, int(im.height * fim)))
    # faixa da hora (status bar) em cima, como num iPhone de verdade
    barra = round(im.width * 0.12)
    tela = Image.new("RGB", (im.width, im.height + barra), (255, 255, 255))
    tela.paste(im, (0, barra))
    im = tela
    h_tela = w * im.height / im.width
    pw = 720
    ph = round(pw * im.height / im.width)
    im = im.resize((pw, ph), Image.LANCZOS)
    raio_px = round(pw * 0.13)
    masc = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(masc).rounded_rectangle((0, 0, pw - 1, ph - 1), raio_px, fill=255)
    fundo = Image.new("RGB", (pw, ph), (17, 17, 17))
    im = Image.composite(im, fundo, masc)
    b = 0.9
    r = w * 0.13 + b
    ilha = (f'<rect x="{x + w / 2 - w * 0.15:.2f}" y="{y + w * 0.022:.2f}" width="{w * 0.3:.2f}" height="{w * 0.075:.2f}" '
            f'rx="{w * 0.0375:.2f}" fill="#111111"/>'
            + texto("9:41", x + w * 0.16, y + w * 0.085, w * 0.055, GRA, JAKB, "centro")
            + f'<rect x="{x + w * 0.76:.2f}" y="{y + w * 0.045:.2f}" width="{w * 0.075:.2f}" height="{w * 0.036:.2f}" rx="{w * 0.01:.2f}" fill="none" stroke="{GRA}" stroke-width="{w * 0.006:.3f}"/>'
            + f'<rect x="{x + w * 0.765:.2f}" y="{y + w * 0.05:.2f}" width="{w * 0.055:.2f}" height="{w * 0.026:.2f}" rx="{w * 0.006:.2f}" fill="{GRA}"/>')
    return (f'<rect x="{x - b + 0.7:.2f}" y="{y - b + 1.1:.2f}" width="{w + 2 * b:.2f}" height="{h_tela + 2 * b:.2f}" rx="{r:.2f}" fill="#000000" fill-opacity="0.12"/>'
            f'<rect x="{x - b:.2f}" y="{y - b:.2f}" width="{w + 2 * b:.2f}" height="{h_tela + 2 * b:.2f}" rx="{r:.2f}" fill="#111111"/>'
            f'<image x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h_tela:.2f}" href="data:image/jpeg;base64,{_jpg(im, 90)}"/>'
            + ilha), h_tela + 2 * b


ICONES = os.path.join(RAIZ, "node_modules/@tabler/icons/icons/outline")


def icone(nome, x, y, tam, cor, traco=2):
    """Ícone Tabler (o mesmo do site) com canto superior esquerdo em (x, y) e lado tam (mm)."""
    svg = open(os.path.join(ICONES, nome + ".svg"), encoding="utf-8").read()
    corpo = "".join(m for m in re.findall(r"<(?:path|circle|rect|line|polyline|polygon|ellipse)[^>]*/>", svg) if 'stroke="none"' not in m)
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({tam / 24:.4f})" fill="none" stroke="{cor}" '
            f'stroke-width="{traco}" stroke-linecap="round" stroke-linejoin="round">{corpo}</g>')


def bolinha(nome, cx, cy, r, fundo=LAR, cor=BRA):
    return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fundo}"/>' + icone(nome, cx - r * 0.6, cy - r * 0.6, r * 1.2, cor)


TELAS = os.path.join(RAIZ, "docs/app-store-capturas")
FOTO_CAPA = os.path.join(RAIZ, "docs/kit-lojistas/_scripts/capa-casal-pexels-36729871.jpg")  # mesma foto do folheto de compradores
# Painéis (sem a sangria). Por fora: aba que dobra para dentro (0..97) | contracapa (97..197) | capa (197..297).
# Por dentro: 1 (0..100) | 2 (100..200) | 3 (200..297). A aba é 3 mm mais estreita para fechar sem amassar.
S = SANG
PM = 9  # margem interna de cada painel
CINZA_CLARO = "#F3F2EF"

# ======================= LADO DE FORA =======================
c = []
# ---------- CAPA (direita): foto inteira com o título por cima ----------
x0 = S + 197
LP = 100
c.append(foto(FOTO_CAPA, x0, 0, LP + S, H - S - 30, 0.62, 0.15,
              lambda t: max(0.0, 1 - t / 0.2) * 0.95 + min(0.92, max(0.0, (t - 0.42) / 0.2))))
c.append(logo(x0 + (LP - 50) / 2, S + 7, 50, "neg"))
y = H - S - 82
_pl = largura("PRÉ-LANÇAMENTO", 3.6, JAKB) + 7
c.append(f'<rect x="{x0 + PM}" y="{y - 13}" width="{_pl}" height="6.4" rx="3.2" fill="{LAR}"/>')
c.append(texto("PRÉ-LANÇAMENTO", x0 + PM + 3.5, y - 8.4, 3.6, BRA, JAKB))
for l in ["Seus carros na", "vitrine de quem", "compra na região."]:
    c.append(texto(l, x0 + PM, y, 9.4, BRA, EXO))
    y += 10.3
t, y = paragrafo("O portal de veículos da sua cidade e região, no site e no app.", x0 + PM, y + 1, 4, "#E0E0E0", JAK, LP - 2 * PM, 5.4)
c.append(t)
c.append(f'<rect x="{x0}" y="{H - S - 30}" width="{LP + S}" height="{30 + S}" fill="{LAR}"/>')
c.append(texto("60 DIAS GRÁTIS", x0 + PM, H - S - 17.5, 9.5, GRA, EXO))
c.append(texto("Sem cartão. Sem compromisso.", x0 + PM, H - S - 10, 4.2, GRA, JAKB))

# ---------- CONTRACAPA (meio): pré-lançamento + contato + app ----------
x0 = S + 97
LP = 100
xi = x0 + PM
Li = LP - 2 * PM
y = S + 16
c.append(f'<rect x="{xi}" y="{y}" width="{Li}" height="32" rx="3" fill="{GRA}"/>')
c.append(texto("Oferta de pré-lançamento", xi + 5, y + 9, 4.6, LAR, JAKB))
t, yy = paragrafo("Cadastre sua loja até 30/11 e ganhe 60 dias grátis, que só começam a contar no lançamento oficial, em 03/11.",
                  xi + 5, y + 15.5, 3.7, BRA, JAK, Li - 10, 4.9)
c.append(t)
y += 44
c.append(texto("Fale com a gente", xi, y, 6.6, GRA, EXO))
y += 7
t, y = paragrafo("Tiramos dúvidas e ajudamos no cadastro, pelo WhatsApp ou pessoalmente.", xi, y, 3.7, CIN, JAK, Li, 4.9)
c.append(t)
y += 9
for ic, val, tam in [("brand-whatsapp", WHATS, 5.2), ("mail", "contato@autoregiao.com.br", 4.1), ("world", "www.autoregiao.com.br", 4.1)]:
    c.append(bolinha(ic, xi + 4, y - 1.6, 4))
    c.append(texto(val, xi + 11, y, tam, GRA, JAKB))
    y += 11
y += 2
c.append(f'<rect x="{xi}" y="{y}" width="{Li}" height="38" rx="3" fill="{CINZA_CLARO}"/>')
c.append(texto("Baixe o app", xi + 5, y + 9.5, 5, GRA, JAKB))
c.append(texto("Android e iPhone.", xi + 5, y + 15.5, 3.5, CIN))
c.append(texto("Aponte a câmera:", xi + 5, y + 20.3, 3.5, CIN))
c.append(qr(xi + Li - 5 - 21, y + 8.5, 21, LINK_APP))
c.append(selos(xi + 5, y + 26, 6))
c.append(logo(x0 + (LP - 38) / 2, H - S - 24, 38, "pos"))

# ---------- ABA (esquerda, a 1ª coisa ao abrir): por que o AutoRegião ----------
c.append(f'<rect x="0" y="0" width="{97 + S}" height="{H}" fill="#FFF3EA"/>')
xa = S + PM
La = 97 - 2 * PM
y = S + 22
c.append(texto("Por que o", xa, y, 8, GRA, EXO))
c.append(texto("AutoRegião?", xa, y + 9, 8, LAR, EXO))
y += 22
motivos = [("map-pin", "Feito para a região", "Quem procura carro aqui encontra as lojas daqui, não de outro estado."),
           ("currency-real", "Sem comissão", "Você paga só o plano. O que vender é todo seu."),
           ("brand-whatsapp", "Cliente direto no WhatsApp", "Sem formulário e sem intermediário."),
           ("trending-down", "Comparação com a FIPE", "O comprador vê na hora quando o seu preço é bom."),
           ("chart-bar", "Você vê o resultado", "Relatório todo mês: quantas pessoas viram e chamaram."),
           ("shield-check", "Loja verificada", "Selo de confiança para lojas conferidas por nós.")]
for ic, tit, desc in motivos:
    c.append(bolinha(ic, xa + 4.5, y - 1.2, 4.5))
    c.append(texto(tit, xa + 12, y, 4.2, GRA, JAKB))
    t, y = paragrafo(desc, xa + 12, y + 5, 3.4, CIN, JAK, La - 12, 4.5)
    c.append(t)
    y += 10.5
fora = salvar("fora", "".join(c), BRA)

# ======================= LADO DE DENTRO =======================
c = []
c.append(f'<rect x="0" y="0" width="{W}" height="{S + 5}" fill="{LAR}"/>')
for xl in (S + 100, S + 200):
    c.append(f'<line x1="{xl}" y1="{S + 16}" x2="{xl}" y2="{H - S - 12}" stroke="#E4E2DE" stroke-width="0.3"/>')

# ---------- PAINEL 1: como funciona + comparação ----------
xa = S + PM
La = 100 - 2 * PM
y = S + 22
c.append(texto("Como funciona", xa, y, 7.6, GRA, EXO))
y += 12
passos = [("1", "Cadastre a loja", "Em 5 minutos: logo, fachada, endereço e horário."),
          ("2", "Anuncie seus carros", "Fotos pelo celular. A FIPE preenche marca, modelo e versão."),
          ("3", "Receba os clientes", "Direto no seu WhatsApp ou por ligação."),
          ("4", "Acompanhe os números", "Visualizações e contatos de cada carro.")]
for n, tit, desc in passos:
    c.append(f'<circle cx="{xa + 3.6}" cy="{y - 1.5}" r="3.6" fill="{LAR}"/>')
    c.append(texto(n, xa + 3.6, y, 4.4, BRA, EXO, "centro"))
    c.append(texto(tit, xa + 10, y - 0.4, 4.2, GRA, JAKB))
    t, y = paragrafo(desc, xa + 10, y + 4.8, 3.4, CIN, JAK, La - 10, 4.5)
    c.append(t)
    y += 9.5
y += 3
c.append(texto("Compare", xa, y, 6, GRA, EXO))
y += 4
linhas = ["Página própria da loja", "Busca por marca, preço e ano", "Comparação com a FIPE",
          "Relatório de visitas e contatos", "Anúncio não some no grupo"]
cab_h = 11
lin_h = 7.2
col1 = La - 32
c.append(f'<rect x="{xa}" y="{y}" width="{La}" height="{cab_h + lin_h * len(linhas)}" rx="3" fill="{CINZA_CLARO}"/>')
c.append(f'<rect x="{xa + col1 + 16}" y="{y}" width="16" height="{cab_h + lin_h * len(linhas)}" rx="3" fill="{LAR}"/>')
c.append(texto("Grupos e", xa + col1 + 8, y + 5, 2.6, CIN, JAKB, "centro"))
c.append(texto("redes", xa + col1 + 8, y + 8.4, 2.6, CIN, JAKB, "centro"))
c.append(texto("Auto", xa + col1 + 24, y + 5, 2.9, BRA, JAKB, "centro"))
c.append(texto("Região", xa + col1 + 24, y + 8.4, 2.9, BRA, JAKB, "centro"))
for k, l in enumerate(linhas):
    yl = y + cab_h + k * lin_h
    c.append(texto(l, xa + 3, yl + 4.8, 3.05, GRA, JAK))
    c.append(icone("x", xa + col1 + 5.8, yl + 1.6, 4.4, "#B9B4AC", 2.4))
    c.append(icone("check", xa + col1 + 21.8, yl + 1.6, 4.4, BRA, 2.8))

# ---------- PAINEL 2: como o comprador chega até você + painel ----------
xb = S + 100 + PM
Lb = 100 - 2 * PM
y = S + 22
c.append(texto("Como o comprador", xb, y, 7, GRA, EXO))
c.append(texto("chega até você", xb, y + 7.8, 7, LAR, EXO))
y += 15
wcel = 24
gap = (Lb - 3 * wcel) / 2
telas = [("tela-2.png", 0.0, 1.0, "1. Encontra", "na busca"), ("tela-4.png", 0.0, 1.0, "2. Vê o preço", "e a FIPE"),
         ("tela-5.png", 0.0, 1.0, "3. Chama no", "WhatsApp")]
hmax = 0
for k, (arq, ini, fim, l1, l2) in enumerate(telas):
    svg, hc = celular(os.path.join(TELAS, arq), xb + k * (wcel + gap), y + 4, wcel, ini, fim)
    c.append(svg)
    hmax = max(hmax, hc)
for k, (arq, ini, fim, l1, l2) in enumerate(telas):
    cx = xb + k * (wcel + gap) + wcel / 2
    c.append(texto(l1, cx, y + 4 + hmax + 4.5, 3.2, GRA, JAKB, "centro"))
    c.append(texto(l2, cx, y + 4 + hmax + 8.2, 3.2, CIN, JAK, "centro"))
y += 4 + hmax + 16
# painel do lojista (ilustração com números de exemplo)
c.append(texto("E você acompanha tudo no painel", xb, y, 4.4, GRA, JAKB))
y += 4
alt_p = 46
c.append(f'<rect x="{xb}" y="{y}" width="{Lb}" height="{alt_p}" rx="3" fill="{CINZA_CLARO}"/>')
cards = [("eye", "1.248", "visualizações"), ("brand-whatsapp", "87", "contatos"), ("building-store", "32", "anúncios ativos")]
cw = (Lb - 8 - 2 * 3) / 3
for k, (ic, num, rot) in enumerate(cards):
    xk = xb + 4 + k * (cw + 3)
    c.append(f'<rect x="{xk:.2f}" y="{y + 4}" width="{cw:.2f}" height="19" rx="2" fill="{BRA}"/>')
    c.append(icone(ic, xk + 2.5, y + 6.5, 4.2, LAR, 2.2))
    c.append(texto(num, xk + 2.5, y + 16, 5.6, GRA, EXO))
    c.append(texto(rot, xk + 2.5, y + 20.5, 2.6, CIN, JAK))
# gráfico de barras: visitas na semana
c.append(f'<rect x="{xb + 4}" y="{y + 26}" width="{Lb - 8}" height="{alt_p - 30}" rx="2" fill="{BRA}"/>')
c.append(texto("Visitas na semana", xb + 7, y + 31.5, 2.9, GRA, JAKB))
vals = [18, 26, 21, 34, 30, 45, 39]
dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
base = y + alt_p - 8.5
bw = (Lb - 22) / 7
for k, v in enumerate(vals):
    hb = v / 45 * 7.5
    bx = xb + 9 + k * (bw + 0.8)
    c.append(f'<rect x="{bx:.2f}" y="{base - hb:.2f}" width="{bw - 0.8:.2f}" height="{hb:.2f}" rx="0.6" fill="{LAR if k == 5 else "#FFC199"}"/>')
    c.append(texto(dias[k], bx + (bw - 0.8) / 2, base + 3.4, 2.2, CIN, JAK, "centro"))
c.append(texto("Ilustração com números de exemplo", xb + Lb / 2, y + alt_p + 4, 2.5, "#9A9A9A", JAK, "centro"))

# ---------- PAINEL 3: planos + chamada ----------
xc = S + 200 + PM
Lc = 97 - 2 * PM
y = S + 22
c.append(texto("Planos", xc, y, 7.6, GRA, EXO))
y += 6.5
c.append(texto("Depois dos 60 dias grátis", xc, y, 3.6, CIN, JAK))
y += 5.5
planos = [("Básico", "R$ 99", ["Até 15 anúncios ativos", "Página da loja e WhatsApp"], False),
          ("Profissional", "R$ 169", ["Até 40 anúncios ativos", "Destaque nas buscas", "Logo da loja nos anúncios"], True),
          ("Premium", "R$ 279", ["Até 80 anúncios ativos", "Primeiro nas buscas", "Vitrine na página inicial", "Selo \"Loja Premium\""], False)]
for nome, preco, itens, pop in planos:
    alt = 17.5 + 4.4 * len(itens)
    c.append(f'<rect x="{xc}" y="{y}" width="{Lc}" height="{alt}" rx="3" fill="{LAR if pop else CINZA_CLARO}"/>')
    cor = BRA if pop else GRA
    if pop:
        _mp = largura("MAIS POPULAR", 2.7, JAKB) + 5
        c.append(f'<rect x="{xc + Lc - _mp - 3}" y="{y + 3}" width="{_mp}" height="4.6" rx="2.3" fill="{GRA}"/>')
        c.append(texto("MAIS POPULAR", xc + Lc - _mp / 2 - 3, y + 6.2, 2.7, BRA, JAKB, "centro"))
    c.append(texto(nome, xc + 4, y + 6.8, 3.9, cor, JAKB))
    c.append(texto(preco, xc + 4, y + 14, 7, cor, EXO))
    c.append(texto("/mês", xc + 4 + largura(preco, 7, EXO) + 1, y + 14, 3.3, cor, JAK))
    for k, it in enumerate(itens):
        c.append(icone("check", xc + 3.6, y + 16.6 + k * 4.4, 3, BRA if pop else LAR, 3))
        c.append(texto(it, xc + 7.6, y + 19.2 + k * 4.4, 3.05, cor, JAK))
    y += alt + 3.2
y += 1
for l in ["Mais de 80 carros? Preço sob consulta.", "Sem fidelidade: cancelar é só não renovar."]:
    c.append(texto(l, xc, y, 3.1, CIN, JAK))
    y += 4.4
c.append(f'<rect x="{S + 200}" y="{H - S - 34}" width="{97 + S}" height="{34 + S}" fill="{GRA}"/>')
c.append(texto("Cadastre sua loja", xc, H - S - 22.5, 4.8, BRA, JAKB))
c.append(texto("60 dias grátis.", xc, H - S - 16.5, 4, LAR, JAKB))
c.append(texto("Aponte a câmera:", xc, H - S - 10.5, 3.4, "#D0D0D0"))
c.append(qr(xc + Lc - 22, H - S - 28, 22, LINK))
dentro = salvar("dentro", "".join(c), BRA)

doc = pymupdf.open()
doc.insert_pdf(fora)
doc.insert_pdf(dentro)
doc.set_metadata({"title": "Folder lojistas AutoRegião", "author": "AutoRegião"})
doc.save(os.path.join(SAIDA, "folder-lojistas_A4-2-dobras_com-sangria-3mm.pdf"), deflate=True)
for i, pg in enumerate(doc):
    pg.get_pixmap(dpi=110).save(os.path.join(SAIDA, f"previa-folder-{'fora' if i == 0 else 'dentro'}.png"))
print("ok")
