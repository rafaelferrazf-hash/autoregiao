"""ESBOÇO da arte "Ofertas da semana" (4 veículos da loja). Uso: python -I ofertas_semana.py <pasta_py> "<nome da loja>"
Pega 4 carros ativos da loja (prioriza os abaixo da FIPE) e salva em docs/kit-lojas-parceiras/esboco-ofertas-semana/.
Quando virar recurso do painel, o site gera a mesma arte no servidor (ver ROTEIRO, "Página Divulgar").
"""
import sys, os, json, io, base64, re, urllib.request, urllib.parse
sys.path.insert(0, sys.argv[1])
import pymupdf
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

RAIZ = r"C:/Users/rafae/autoregiao"
LAR, GRA, BRA, CLARO, CIN, VERDE = "#FF6600", "#1A1A1A", "#FFFFFF", "#CFCFCF", "#6B6B6B", "#16A34A"
SAIDA = os.path.join(RAIZ, "docs/kit-lojas-parceiras/esboco-ofertas-semana")
os.makedirs(SAIDA, exist_ok=True)
L = json.load(open(os.path.join(RAIZ, "docs/plotagem-carro/_scripts/logo_camadas.json")))

env = {}
for linha in open(os.path.join(RAIZ, ".env.local"), encoding="utf-8"):
    if "=" in linha and not linha.startswith("#"):
        k, v = linha.strip().split("=", 1); env[k] = v.strip('"')
H_API = {"apikey": env["SUPABASE_SERVICE_KEY"], "Authorization": "Bearer " + env["SUPABASE_SERVICE_KEY"]}


def api(q):
    return json.load(urllib.request.urlopen(urllib.request.Request(f'{env["NEXT_PUBLIC_SUPABASE_URL"]}/rest/v1/{q}', headers=H_API)))


LOJA = api(f"lojas?select=id,nome,cidade,logo_url&nome=ilike.*{urllib.parse.quote(sys.argv[2])}*")[0]
vs = api(f"veiculos?select=marca,modelo,versao,ano,km,preco,fipe_valor,fotos&loja_id=eq.{LOJA['id']}&status=eq.ativo&tipo=eq.carro&limit=50")
vs = [v for v in vs if v["fotos"]]
vs.sort(key=lambda v: (not (v["fipe_valor"] and v["preco"] < v["fipe_valor"]), -v["preco"]))
CARROS = vs[:4]


def imagem(url):
    if url.startswith("https://www.autoregiao.com.br/demo/"):  # fotos de demonstração ficam no próprio projeto
        return Image.open(os.path.join(RAIZ, "public/demo", url.rsplit("/", 1)[1])).convert("RGB")
    if url.startswith(env["NEXT_PUBLIC_SUPABASE_URL"] + "/storage/"):
        return Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert("RGB")
    return None


def logo(x, y, larg):
    s = larg / L["W"]
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


def texto(t, x, y, tam, cor, f=JAK, alinh="esq", max_larg=None):
    if max_larg and largura(t, tam, f) > max_larg:
        tam = tam * max_larg / largura(t, tam, f)
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


def foto(im, x, y, w, h, raio):
    esc = max(w * 2 / im.width, h * 2 / im.height)
    im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
    im = im.crop(((im.width - w * 2) // 2, (im.height - h * 2) // 2, (im.width + w * 2) // 2, (im.height + h * 2) // 2))
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=88)
    cid = f"c{x}{y}"
    return (f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{raio}"/></clipPath>'
            f'<image x="{x}" y="{y}" width="{w}" height="{h}" clip-path="url(#{cid})" href="data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"/>')


def preco(v):
    return "R$ " + f'{v:,.0f}'.replace(",", ".")


def km(v):
    return f'{int(v):,}'.replace(",", ".") + " km"


def selo_loja(cx, cy, r):
    im = imagem(LOJA["logo_url"]) if LOJA["logo_url"] else None
    if im:
        lado = 400; esc = max(lado / im.width, lado / im.height)
        im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
        im = im.crop(((im.width - lado) // 2, (im.height - lado) // 2, (im.width + lado) // 2, (im.height + lado) // 2)).convert("RGBA")
        m = Image.new("L", (lado, lado)); ImageDraw.Draw(m).ellipse((0, 0, lado - 1, lado - 1), fill=255); im.putalpha(m)
        buf = io.BytesIO(); im.save(buf, "PNG")
        miolo = f'<image x="{cx - r}" y="{cy - r}" width="{2 * r}" height="{2 * r}" href="data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}"/>'
    else:
        miolo = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{LAR}"/>' + texto(LOJA["nome"][0].upper(), cx, cy + r * 0.36, r, BRA, EXO, "centro")
    return f'<circle cx="{cx}" cy="{cy}" r="{r + 5}" fill="{BRA}"/>' + miolo


def cartao(v, x, y, w, h_foto, compacto=False):
    """Cartão de um veículo: foto, selo FIPE (só se abaixo), modelo, ano · km e preço."""
    c = [f'<rect x="{x}" y="{y}" width="{w}" height="{h_foto + (150 if compacto else 190)}" rx="22" fill="{BRA}"/>']
    im = imagem(v["fotos"][0])
    if im:
        c.append(foto(im, x, y, w, h_foto, 22))
        c.append(f'<rect x="{x}" y="{y + h_foto - 22}" width="{w}" height="22" fill="{BRA}"/>')  # cantos de baixo retos
    if v["fipe_valor"] and v["preco"] < v["fipe_valor"]:
        t = "Abaixo da FIPE"; tw = largura(t, 24, JAKB) + 32
        c.append(f'<rect x="{x + 14}" y="{y + 14}" width="{tw}" height="42" rx="21" fill="{VERDE}"/>')
        c.append(texto(t, x + 14 + 16, y + 43, 24, BRA, JAKB))
    ty = y + h_foto + (44 if compacto else 52)
    c.append(texto(f'{v["marca"]} {v["modelo"]}'.upper(), x + 22, ty, 30 if compacto else 34, GRA, EXO, max_larg=w - 44))
    c.append(texto(f'{v["ano"]} · {km(v["km"])}', x + 22, ty + (38 if compacto else 46), 24 if compacto else 27, CIN))
    c.append(texto(preco(v["preco"]), x + 22, ty + (88 if compacto else 112), 40 if compacto else 50, LAR, EXO))
    return "".join(c)


def salvar(nome, W, H, corpo):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" fill="{GRA}"/>{corpo}</svg>'
    pg = pymupdf.open("svg", svg.encode())[0]; z = W / pg.rect.width
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(z, z), alpha=False)
    Image.frombytes("RGB", (pix.w, pix.h), pix.samples).save(os.path.join(SAIDA, nome), quality=92)


PERIODO = "02/11 a 08/11"

# ---------- Status / Stories 1080×1920 ----------
W, H = 1080, 1920
c = [f'<rect width="{W}" height="12" fill="{LAR}"/>']
c.append(selo_loja(140, 230, 70))
c.append(texto(LOJA["nome"], 240, 222, 46, BRA, EXO, max_larg=W - 300))
c.append(texto(LOJA["cidade"] or "", 240, 270, 30, CLARO))
c.append(texto("OFERTAS", 60, 430, 120, BRA, EXO))
c.append(texto("DA SEMANA", 60, 540, 120, LAR, EXO))
c.append(f'<rect x="60" y="580" width="{largura(PERIODO, 34, JAKB) + 44}" height="58" rx="29" fill="#2E2E2E"/>')
c.append(texto(PERIODO, 82, 620, 34, BRA, JAKB))
cw, hf = (W - 60 * 2 - 30) / 2, 300
for i, v in enumerate(CARROS):
    x = 60 + (i % 2) * (cw + 30); y = 680 + (i // 2) * (hf + 190 + 30)
    c.append(cartao(v, x, y, cw, hf))
c.append(texto("Veja estes e outros no", W / 2, 1740, 36, CLARO, JAK, "centro"))
c.append(logo((W - 330) / 2, 1765, 330))
salvar("ofertas-semana-status.jpg", W, H, "".join(c))

# ---------- Feed 1080×1350 (formato retrato do Instagram) ----------
W, H = 1080, 1350
c = [f'<rect width="{W}" height="12" fill="{LAR}"/>']
c.append(selo_loja(110, 110, 55))
c.append(texto(LOJA["nome"], 190, 102, 38, BRA, EXO, max_larg=440))
c.append(texto(LOJA["cidade"] or "", 190, 142, 26, CLARO))
c.append(texto("OFERTAS", W - 50, 102, 58, BRA, EXO, "dir"))
c.append(texto("DA SEMANA", W - 50, 158, 58, LAR, EXO, "dir"))
cw, hf = (W - 50 * 2 - 24) / 2, 280
for i, v in enumerate(CARROS):
    x = 50 + (i % 2) * (cw + 24); y = 210 + (i // 2) * (hf + 150 + 24)
    c.append(cartao(v, x, y, cw, hf, compacto=True))
c.append(texto(PERIODO + "  ·  Veja no", 50, 1300, 30, CLARO))
c.append(logo(50 + largura(PERIODO + "  ·  Veja no ", 30, JAK), 1262, 230))
salvar("ofertas-semana-feed.jpg", W, H, "".join(c))
print("ok", LOJA["nome"], [f'{v["marca"]} {v["modelo"]}' for v in CARROS])
