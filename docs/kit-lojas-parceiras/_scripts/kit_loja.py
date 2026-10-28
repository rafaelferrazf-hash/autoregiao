"""Kit de divulgação de UMA loja: Status/Stories (1080×1920), post quadrado (1080×1080) e cartaz A4 para o balcão.
Uso: python -I kit_loja.py <pasta_py> "<nome ou id da loja>"
Lê a loja no Supabase (só leitura, chave do .env.local) e salva em docs/kit-lojas-parceiras/<nome-da-loja>/.
"""
import sys, os, json, io, base64, re, unicodedata, urllib.request, urllib.parse
sys.path.insert(0, sys.argv[1])
import pymupdf, segno
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

RAIZ = r"C:/Users/rafae/autoregiao"
LAR, GRA, BRA, CLARO, CIN = "#FF6600", "#1A1A1A", "#FFFFFF", "#D0D0D0", "#5A5A5A"
L = json.load(open(os.path.join(RAIZ, "docs/plotagem-carro/_scripts/logo_camadas.json")))

# ---------- loja (Supabase, só leitura) ----------
env = {}
for linha in open(os.path.join(RAIZ, ".env.local"), encoding="utf-8"):
    if "=" in linha and not linha.startswith("#"):
        k, v = linha.strip().split("=", 1); env[k] = v.strip('"')
busca = sys.argv[2]
filtro = f"id=eq.{busca}" if re.fullmatch(r"[0-9a-f-]{36}", busca) else f"nome=ilike.*{urllib.parse.quote(busca)}*"
req = urllib.request.Request(f'{env["NEXT_PUBLIC_SUPABASE_URL"]}/rest/v1/lojas?select=id,nome,cidade,logo_url,capa_url&{filtro}',
                             headers={"apikey": env["SUPABASE_SERVICE_KEY"], "Authorization": "Bearer " + env["SUPABASE_SERVICE_KEY"]})
lojas = json.load(urllib.request.urlopen(req))
if len(lojas) != 1:
    sys.exit(f"Achei {len(lojas)} lojas para '{busca}': " + ", ".join(l["nome"] for l in lojas))
LOJA = lojas[0]
LINK = f'https://www.autoregiao.com.br/loja/{LOJA["id"]}?utm_source=kit-loja&utm_campaign=lojas'
pasta = re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", LOJA["nome"]).encode("ascii", "ignore").decode().lower()).strip("-")
SAIDA = os.path.join(RAIZ, "docs/kit-lojas-parceiras", pasta)
os.makedirs(SAIDA, exist_ok=True)


def baixar(url):
    # só imagens do nosso Storage (o site também só aceita essas)
    if not url or not url.startswith(env["NEXT_PUBLIC_SUPABASE_URL"] + "/storage/"):
        return None
    return Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert("RGB")


LOGO_LOJA, CAPA = baixar(LOJA["logo_url"]), baixar(LOJA["capa_url"])


# ---------- desenho ----------
def logo(x, y, larg, versao="neg"):
    s = larg / L["W"]
    cores = [("branco", BRA if versao == "neg" else GRA), ("laranja", LAR)]
    corpo = "".join(p.replace("{cor}", c) for k, c in cores for p in L["camadas"][k])
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


def texto(t, x, y, tam, cor, f=JAK, alinh="esq", max_larg=None):
    if max_larg and largura(t, tam, f) > max_larg:
        tam = tam * max_larg / largura(t, tam, f)  # nome comprido: encolhe para caber
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


def jpg(im, q=90):
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=q)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def png(im):
    buf = io.BytesIO(); im.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def fundo(x, y, w, h, escurecer=0.55):
    """Capa da loja (ou o showroom padrão), cortada e escurecida, esfumando para o grafite embaixo."""
    im = CAPA or Image.open(os.path.join(RAIZ, "docs/kit-lojistas/_scripts/capa-carros.jpg")).convert("RGB")
    esc = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
    x0 = (im.width - w) // 2; y0 = (im.height - h) // 3
    im = im.crop((x0, y0, x0 + w, y0 + h))
    escuro = Image.new("RGB", im.size, (26, 26, 26)); masc = Image.new("L", im.size)
    for yy in range(h):
        t = yy / h
        a = escurecer + (1 - escurecer) * max(0.0, (t - 0.5) / 0.5) ** 1.5
        masc.paste(int(255 * min(1, a)), (0, yy, w, yy + 1))
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="{jpg(Image.composite(escuro, im, masc))}"/>'


def selo_loja(cx, cy, r):
    """Logo da loja num círculo com borda branca; sem logo, a inicial do nome em laranja."""
    if LOGO_LOJA:
        lado = 600
        im = LOGO_LOJA.copy(); esc = max(lado / im.width, lado / im.height)
        im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
        im = im.crop(((im.width - lado) // 2, (im.height - lado) // 2, (im.width + lado) // 2, (im.height + lado) // 2)).convert("RGBA")
        m = Image.new("L", (lado, lado)); ImageDraw.Draw(m).ellipse((0, 0, lado - 1, lado - 1), fill=255); im.putalpha(m)
        miolo = f'<image x="{cx - r}" y="{cy - r}" width="{2 * r}" height="{2 * r}" href="{png(im)}"/>'
    else:
        miolo = (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{LAR}"/>'
                 + texto(LOJA["nome"].strip()[0].upper(), cx, cy + r * 0.36, r, BRA, EXO, "centro"))
    return f'<circle cx="{cx}" cy="{cy}" r="{r + r * 0.07}" fill="{BRA}"/>' + miolo


def qr(x, y, lado, borda_branca=True):
    q = segno.make(LINK, error="m")
    n = q.symbol_size(border=0)[0]; m = lado / n
    rects = "".join(f'<rect x="{x + c * m:.2f}" y="{y + r * m:.2f}" width="{m + 0.05:.2f}" height="{m + 0.05:.2f}"/>'
                    for r, lin in enumerate(q.matrix) for c, v in enumerate(lin) if v)
    b = 4 * m
    caixa = f'<rect x="{x - b:.1f}" y="{y - b:.1f}" width="{lado + 2 * b:.1f}" height="{lado + 2 * b:.1f}" rx="{b:.1f}" fill="{BRA}"/>' if borda_branca else ""
    return caixa + f'<g fill="{GRA}">{rects}</g>'


def png_final(nome, W, H, corpo):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" fill="{GRA}"/>{corpo}</svg>'
    pg = pymupdf.open("svg", svg.encode())[0]; z = W / pg.rect.width
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(z, z), alpha=False)
    Image.frombytes("RGB", (pix.w, pix.h), pix.samples).save(os.path.join(SAIDA, nome), quality=92)


cidade = (LOJA.get("cidade") or "").strip()

# ---------- 1. Status / Stories 1080×1920 ----------
W, H = 1080, 1920
c = [fundo(0, 0, W, 1150), logo((W - 300) / 2, 150, 300)]
c.append(selo_loja(W / 2, 560, 150))
c.append(texto(LOJA["nome"], W / 2, 830, 84, BRA, EXO, "centro", max_larg=W - 160))
if cidade:
    c.append(texto(cidade, W / 2, 895, 40, CLARO, JAK, "centro"))
c.append(texto("Nossos carros também", W / 2, 1060, 76, BRA, EXO, "centro"))
c.append(texto("estão no ", W / 2 - largura("AutoRegião", 76, EXO) / 2, 1150, 76, BRA, EXO, "centro"))
c.append(texto("AutoRegião", W / 2 + largura("estão no ", 76, EXO) / 2, 1150, 76, LAR, EXO, "centro"))
c.append(f'<rect x="90" y="1240" width="{W - 180}" height="470" rx="28" fill="{BRA}"/>')
c.append(qr(140, 1290, 370, borda_branca=False))
c.append(texto("Veja todo o", 560, 1390, 46, GRA, JAKB))
c.append(texto("nosso estoque", 560, 1448, 46, GRA, JAKB))
c.append(texto("Fotos, preços e", 560, 1530, 36, CIN))
c.append(texto("contato direto no", 560, 1576, 36, CIN))
c.append(texto("WhatsApp.", 560, 1622, 36, CIN))
c.append(texto("autoregiao.com.br", W / 2, 1810, 56, LAR, EXO, "centro"))
png_final("status-stories.jpg", W, H, "".join(c))

# ---------- 2. Post quadrado 1080×1080 ----------
W = H = 1080
c = [fundo(0, 0, W, 1080, 0.62), logo(70, 70, 260)]
c.append(selo_loja(170, 360, 100))
c.append(texto(LOJA["nome"], 300, 350, 64, BRA, EXO, max_larg=W - 370))
if cidade:
    c.append(texto(cidade, 300, 405, 34, CLARO))
c.append(texto("Nossos carros também", 70, 590, 70, BRA, EXO))
c.append(texto("estão no ", 70, 675, 70, BRA, EXO))
c.append(texto("AutoRegião", 70 + largura("estão no ", 70, EXO), 675, 70, LAR, EXO))
c.append(texto("Fotos, preços e contato direto no WhatsApp.", 70, 750, 34, CLARO))
c.append(f'<rect x="0" y="830" width="{W}" height="250" fill="{LAR}"/>')
c.append(texto("Veja o estoque:", 70, 925, 40, GRA, JAKB))
c.append(texto("autoregiao.com.br", 70, 995, 58, GRA, EXO))
c.append(qr(W - 70 - 200, 855, 200))
png_final("post-quadrado.jpg", W, H, "".join(c))

# ---------- 3. Cartaz A4 para o balcão (PDF, para imprimir em casa ou na gráfica) ----------
W, H = 210, 297
c = [f'<rect width="{W}" height="{H}" fill="{BRA}"/>', f'<rect width="{W}" height="62" fill="{GRA}"/>', logo((W - 80) / 2, 14, 80)]
c.append(texto("Veja todo o nosso estoque", W / 2, 90, 13, GRA, EXO, "centro"))
c.append(texto("no seu celular", W / 2, 106, 13, LAR, EXO, "centro"))
c.append(qr((W - 90) / 2, 122, 90))
c.append(texto("Aponte a câmera do celular para o código", W / 2, 232, 5.2, CIN, JAK, "centro"))
c.append(texto(LOJA["nome"], W / 2, 256, 11, GRA, EXO, "centro", max_larg=W - 40))
c.append(f'<rect y="{H - 22}" width="{W}" height="22" fill="{LAR}"/>')
c.append(texto("autoregiao.com.br", W / 2, H - 8.5, 8, GRA, EXO, "centro"))
PT = 72 / 25.4
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * PT:.2f}" height="{H * PT:.2f}" viewBox="0 0 {W} {H}">{"".join(c)}</svg>'
pymupdf.open("pdf", pymupdf.open("svg", svg.encode()).convert_to_pdf()).save(os.path.join(SAIDA, "cartaz-balcao-A4.pdf"), deflate=True)

# ---------- 4. Mensagem para mandar ao lojista ----------
link_curto = f'https://www.autoregiao.com.br/loja/{LOJA["id"]}'
open(os.path.join(SAIDA, "mensagem.txt"), "w", encoding="utf-8").write(
    f"""Oi! Segue o kit da {LOJA["nome"]} para divulgar que os seus carros estão no AutoRegião:

📱 status-stories.jpg: para o Status do WhatsApp e os Stories do Instagram
🟧 post-quadrado.jpg: para o feed do Instagram e do Facebook
🖨️ cartaz-balcao-A4.pdf: para imprimir e deixar no balcão (o cliente aponta a câmera e vê o estoque)

Texto para postar junto:
"Nossos carros também estão no AutoRegião! Veja fotos, preços e fale com a gente direto no WhatsApp: {link_curto}"

Coloque esse link também na bio do Instagram e na mensagem de saudação do WhatsApp. 😉
""")
print("ok", LOJA["nome"], "->", SAIDA)
