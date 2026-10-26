"""Folheto A5 (frente e verso) para lojistas. Uso: python -I folheto.py <pasta_py> <pasta_saida> "<whatsapp>"."""
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
W, H = 148 + 2 * SANG, 210 + 2 * SANG  # A5 + sangria
LINK = "https://www.autoregiao.com.br/anunciar?utm_source=folheto&utm_campaign=lojistas"
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


M = SANG + 10  # margem segura

# ---------------- FRENTE (fundo grafite) ----------------
c = []
c.append(f'<rect x="0" y="{H - 62}" width="{W}" height="62" fill="{LAR}"/>')
c.append(logo((W - 80) / 2, SANG + 9, 80, "neg"))
# Selo de pré-lançamento
_pl = largura("PRÉ-LANÇAMENTO", 4.2, JAKB) + 8
c.append(f'<rect x="{M}" y="{SANG + 51}" width="{_pl}" height="7.5" rx="3.75" fill="{LAR}"/>')
c.append(texto("PRÉ-LANÇAMENTO", M + 4, SANG + 56.4, 4.2, BRA, JAKB))
c.append(texto("Lançamento oficial em novembro", M + _pl + 3, SANG + 56.4, 4, "#D0D0D0"))
y = SANG + 72
for linha in ["Seus carros no", "app da região."]:
    c.append(texto(linha, M, y, 13.5, BRA, EXO)); y += 14
y += 2
c.append(texto("Quem procura carro na sua cidade e região", M, y, 4.6, "#D0D0D0")); y += 6
c.append(texto("encontra a sua loja — e chama no seu WhatsApp.", M, y, 4.6, "#D0D0D0")); y += 11
for item in ["Página da loja com logo, fotos e mapa", "Cliente fala direto com você no WhatsApp",
             "Comparação com a Tabela FIPE em cada carro", "Relatório mensal: quantos viram e chamaram",
             "No site e no app de celular"]:
    c.append(icone_ok(M + 2.6, y - 1.6)); c.append(texto(item, M + 8, y, 4.4, BRA)); y += 7.2
# faixa laranja: oferta + QR
yb = H - 62
c.append(texto("60 DIAS GRÁTIS", M, yb + 17, 11, GRA, EXO))
c.append(texto("Sem cartão. Sem compromisso.", M, yb + 25, 4.4, GRA, JAKB))
c.append(texto("Contam só a partir do lançamento.", M, yb + 31, 3.8, GRA))
c.append(texto("Para lojas cadastradas até 30/11.", M, yb + 36, 3.8, GRA))
c.append(texto("Aponte a câmera para cadastrar:", M, yb + 44.5, 4, GRA))
c.append(texto("autoregiao.com.br", M, yb + 53.5, 6, GRA, EXO))
c.append(qr(W - M - 34, yb + 12, 34, LINK))
frente = salvar("frente", "".join(c), GRA)

# ---------------- VERSO (fundo branco) ----------------
c = []
c.append(f'<rect x="0" y="0" width="{W}" height="{SANG + 6}" fill="{LAR}"/>')
y = SANG + 22
c.append(texto("Como funciona", M, y, 9, GRA, EXO)); y += 11
passos = [("1", "Cadastre a loja", "em 5 minutos, pelo celular ou pelo computador."),
          ("2", "Anuncie seus carros", "com fotos. A Tabela FIPE preenche marca, modelo e versão."),
          ("3", "Receba os clientes", "direto no seu WhatsApp. Sem intermediário, sem comissão.")]
for n, tit, desc in passos:
    c.append(f'<circle cx="{M + 4}" cy="{y - 1.5}" r="4" fill="{LAR}"/>')
    c.append(texto(n, M + 4, y, 5, BRA, EXO, "centro"))
    c.append(texto(tit, M + 11, y - 1, 5, GRA, JAKB))
    c.append(texto(desc, M + 11, y + 4.6, 3.9, CIN)); y += 14
y += 4
c.append(texto("Depois dos 60 dias grátis", M, y, 7, GRA, EXO)); y += 9
cols = [("Básico", "R$ 149", "até 15 anúncios", False), ("Profissional", "R$ 219", "até 40 + destaque", True),
        ("Premium", "R$ 329", "até 80 + vitrine", False)]
cw = (W - 2 * M - 6) / 3
for i, (nome, preco, desc, pop) in enumerate(cols):
    x = M + i * (cw + 3)
    c.append(f'<rect x="{x}" y="{y}" width="{cw}" height="27" rx="3" fill="{LAR if pop else "#F2F2F2"}"/>')
    cor = BRA if pop else GRA
    c.append(texto(nome, x + cw / 2, y + 7, 4.2, cor, JAKB, "centro"))
    c.append(texto(preco, x + cw / 2, y + 15.5, 7.5, cor, EXO, "centro"))
    c.append(texto("/mês · " + desc, x + cw / 2, y + 22, 2.9, cor, JAK, "centro"))
y += 33
c.append(texto("Mais de 80 carros? Preço sob consulta.", M, y, 3.9, CIN)); y += 5.5
c.append(texto("Você só continua se gostar. Cancelar é só não renovar.", M, y, 3.9, CIN)); y += 6
# Caixa "Baixe o app": QR (abre a loja certa do celular) + selos oficiais das lojas.
c.append(f'<rect x="{M}" y="{y}" width="{W - 2 * M}" height="34" rx="3" fill="{GRA}"/>')
c.append(texto("Sua loja também no app", M + 5, y + 9, 5.2, BRA, JAKB))
c.append(texto("Anuncie e acompanhe pelo celular.", M + 5, y + 15, 3.8, "#D0D0D0"))
c.append(texto("Aponte a câmera para baixar:", M + 5, y + 20.5, 3.8, "#D0D0D0"))
c.append(selos(M + 5, y + 23.5, 7))
c.append(qr(W - M - 4.5 - 23, y + 5.5, 23, LINK_APP))
y = H - SANG - 30
c.append(f'<line x1="{M}" y1="{y - 6}" x2="{W - M}" y2="{y - 6}" stroke="#DDD" stroke-width="0.3"/>')
c.append(logo(M, y - 1, 38, "pos"))
c.append(texto("Dúvidas? Fale conosco", W - M, y + 5, 4.2, CIN, JAK, "dir"))
c.append(texto("WhatsApp " + WHATS, W - M, y + 12, 5.6, GRA, JAKB, "dir"))
c.append(texto("contato@autoregiao.com.br", W - M, y + 18, 3.9, CIN, JAK, "dir"))
verso = salvar("verso", "".join(c), BRA)

doc = pymupdf.open()
doc.insert_pdf(frente); doc.insert_pdf(verso)
doc.set_metadata({"title": "Folheto lojistas AutoRegião", "author": "AutoRegião"})
doc.save(os.path.join(SAIDA, "folheto-lojistas_A5_frente-e-verso_com-sangria-3mm.pdf"), deflate=True)
for i, pg in enumerate(doc):
    pg.get_pixmap(dpi=150).save(os.path.join(SAIDA, f"previa-folheto-{'frente' if i == 0 else 'verso'}.png"))
print("ok")
