"""Folheto A5 (frente e verso) para COMPRADORES. Uso: python -I folheto.py <pasta_py> <pasta_saida> "<whatsapp>" <foto.jpg> (foto atual: Pexels 36729871, casal olhando carro; recorte vertical 0.2)."""
import sys, os, json
sys.path.insert(0, sys.argv[1])
import pymupdf, segno, base64, io
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

SAIDA, WHATS, FOTO = sys.argv[2], sys.argv[3], sys.argv[4]
FOTO_Y = float(sys.argv[5]) if len(sys.argv) > 5 else 0.3  # 0 = mostra o alto da foto, 1 = a parte de baixo
os.makedirs(SAIDA, exist_ok=True)
RAIZ = r"C:/Users/rafae/autoregiao"
LAR, GRA, BRA, CIN = "#FF6600", "#1A1A1A", "#FFFFFF", "#5A5A5A"
PT = 72 / 25.4
SANG = 3  # sangria
W, H = 148 + 2 * SANG, 210 + 2 * SANG  # A5 + sangria
LINK = "https://www.autoregiao.com.br/?utm_source=folheto&utm_campaign=compradores"

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
    return f'<rect x="{x - 2.5}" y="{y - 2.5}" width="{lado + 5}" height="{lado + 5}" rx="2" fill="{BRA}"/><g fill="{GRA}">{rects}</g>'


def icone_ok(x, y, cor=LAR):
    return (f'<circle cx="{x}" cy="{y}" r="2.6" fill="{cor}"/>'
            f'<path d="M{x - 1.3} {y} l0.9 0.9 l1.8 -1.9" stroke="{BRA}" stroke-width="0.6" fill="none" stroke-linecap="round"/>')


def salvar(nome, corpo, fundo):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * PT:.2f}" height="{H * PT:.2f}" viewBox="0 0 {W} {H}">'
           f'<rect width="{W}" height="{H}" fill="{fundo}"/>{corpo}</svg>')
    return pymupdf.open("pdf", pymupdf.open("svg", svg.encode()).convert_to_pdf())


def foto_topo(y_ini, alt):
    """Foto no topo da frente, cortada na proporção e escurecida (em cima para o logo, embaixo para o texto)."""
    im = Image.open(FOTO).convert("RGB")
    px_w = 1800; px_h = round(px_w * (alt - y_ini) / W)
    esc = max(px_w / im.width, px_h / im.height)
    im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
    x0 = (im.width - px_w) // 2; y0 = int((im.height - px_h) * FOTO_Y)
    im = im.crop((x0, y0, x0 + px_w, y0 + px_h))
    escuro = Image.new("RGB", im.size, (26, 26, 26))
    mascara = Image.new("L", im.size)
    for yy in range(px_h):
        t = yy / px_h
        topo = max(0.0, 1 - t / 0.16); baixo = min(1.0, max(0.0, (t - 0.62) / 0.36)); a = topo * topo * (3 - 2 * topo) + baixo * baixo * (3 - 2 * baixo)
        mascara.paste(int(255 * min(1, a)), (0, yy, px_w, yy + 1))
    im = Image.composite(escuro, im, mascara)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=90)
    return f'<image x="0" y="{y_ini}" width="{W}" height="{alt - y_ini}" href="data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"/>'


M = SANG + 10  # margem segura

# ---------------- FRENTE (foto + fundo grafite) ----------------
c = []
c.append(foto_topo(SANG + 19, SANG + 96))
c.append(f'<rect x="0" y="{H - 58}" width="{W}" height="58" fill="{LAR}"/>')
c.append(logo((W - 52) / 2, SANG + 5, 52, "neg"))
y = SANG + 93
for linha in ["Seu próximo carro", "está na região."]:
    c.append(texto(linha, M, y, 12.5, BRA, EXO)); y += 13
y += 1
c.append(texto("Carros, motos e utilitários da sua cidade e região.", M, y, 4.4, "#D0D0D0")); y += 8.5
for item in ["Busque por marca, preço, ano e cidade", "Compare o preço com a Tabela FIPE",
             "Fale direto com o vendedor no WhatsApp", "Receba aviso quando o seu carro aparecer"]:
    c.append(icone_ok(M + 2.6, y - 1.6)); c.append(texto(item, M + 8, y, 4.3, BRA)); y += 6.5
yb = H - 58
c.append(texto("BUSQUE GRÁTIS", M, yb + 16, 10.5, GRA, EXO))
c.append(texto("Sem cadastro para procurar.", M, yb + 24, 4.4, GRA, JAKB))
c.append(texto("Sem taxa para quem compra.", M, yb + 30, 3.9, GRA))
c.append(texto("Aponte a câmera e veja os carros:", M, yb + 40, 4, GRA))
c.append(texto("autoregiao.com.br", M, yb + 49.5, 6, GRA, EXO))
c.append(qr(W - M - 32, yb + 11, 32, LINK))
frente = salvar("frente", "".join(c), GRA)

# ---------------- VERSO (fundo branco) ----------------
c = []
c.append(f'<rect x="0" y="0" width="{W}" height="{SANG + 6}" fill="{LAR}"/>')
y = SANG + 22
c.append(texto("Como encontrar seu carro", M, y, 8.5, GRA, EXO)); y += 11
passos = [("1", "Busque", "por marca, preço, ano e cidade. Ou toque em \"Perto de mim\"."),
          ("2", "Compare", "preço x Tabela FIPE, km, IPVA pago, único dono e mais."),
          ("3", "Chame o vendedor", "direto no WhatsApp. Sem intermediário, sem taxa.")]
for n, tit, desc in passos:
    c.append(f'<circle cx="{M + 4}" cy="{y - 1.5}" r="4" fill="{LAR}"/>')
    c.append(texto(n, M + 4, y, 5, BRA, EXO, "centro"))
    c.append(texto(tit, M + 11, y - 1, 5, GRA, JAKB))
    c.append(texto(desc, M + 11, y + 4.6, 3.8, CIN)); y += 14
y += 1
c.append(f'<rect x="{M}" y="{y}" width="{W - 2 * M}" height="25" rx="3" fill="#FFF0E6"/>')
c.append(texto("Não achou o carro que procura?", M + 5, y + 8, 5, LAR, JAKB))
c.append(texto("Crie um alerta: a gente avisa quando ele aparecer,", M + 5, y + 14.5, 3.9, GRA))
c.append(texto("por e-mail ou no app do celular.", M + 5, y + 19.5, 3.9, GRA))
y += 32
cw = (W - 2 * M - 4) / 2
cards = [("Tabela FIPE grátis", ["Consulte o valor de qualquer", "carro ou moto antes de negociar."]),
         ("Vai vender o seu?", ["Pessoa física anuncia", "grátis por 60 dias."])]
for i, (tit, linhas) in enumerate(cards):
    x = M + i * (cw + 4)
    c.append(f'<rect x="{x}" y="{y}" width="{cw}" height="27" rx="3" fill="#F2F2F2"/>')
    c.append(texto(tit, x + 5, y + 8.5, 4.6, GRA, JAKB))
    for k, l in enumerate(linhas):
        c.append(texto(l, x + 5, y + 15 + k * 5, 3.5, CIN))
y += 38
c.append(texto("No site e no app AutoRegião para Android e iPhone.", M, y, 4, GRA, JAKB)); y += 5.5
c.append(texto("O AutoRegião não vende carros: aproxima você de quem vende.", M, y, 3.5, CIN))
y = H - SANG - 30
c.append(f'<line x1="{M}" y1="{y - 6}" x2="{W - M}" y2="{y - 6}" stroke="#DDD" stroke-width="0.3"/>')
c.append(logo(M, y - 1, 38, "pos"))
c.append(texto("Fale conosco", W - M, y + 5, 4.2, CIN, JAK, "dir"))
c.append(texto("WhatsApp " + WHATS, W - M, y + 12, 5.6, GRA, JAKB, "dir"))
c.append(texto("contato@autoregiao.com.br", W - M, y + 18, 3.9, CIN, JAK, "dir"))
verso = salvar("verso", "".join(c), BRA)

doc = pymupdf.open()
doc.insert_pdf(frente); doc.insert_pdf(verso)
doc.set_metadata({"title": "Folheto compradores AutoRegião", "author": "AutoRegião"})
doc.save(os.path.join(SAIDA, "folheto-compradores_A5_frente-e-verso_com-sangria-3mm.pdf"), deflate=True)
for i, pg in enumerate(doc):
    pg.get_pixmap(dpi=150).save(os.path.join(SAIDA, f"previa-folheto-{'frente' if i == 0 else 'verso'}.png"))
print("ok")
