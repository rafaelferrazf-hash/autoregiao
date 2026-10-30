"""Imagens para o Status do WhatsApp (1080×1920). Uso: python -I status.py <pasta_py> <pasta_saida>"""
import sys, os, json, io, base64
sys.path.insert(0, sys.argv[1])
import pymupdf
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

SAIDA = sys.argv[2]
os.makedirs(SAIDA, exist_ok=True)
RAIZ = r"C:/Users/rafae/autoregiao"
LAR, GRA, BRA, CLARO = "#FF6600", "#1A1A1A", "#FFFFFF", "#D0D0D0"
W, H = 1080, 1920
M = 80  # margem (o WhatsApp cobre o topo com o nome e a barra de progresso)
L = json.load(open(os.path.join(RAIZ, "docs/plotagem-carro/_scripts/logo_camadas.json")))


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


def foto(arq, y_ini, alt, foco=0.3):
    """Foto na largura toda, esfumada para o grafite em cima e embaixo."""
    im = Image.open(os.path.join(RAIZ, arq)).convert("RGB")
    esc = max(W / im.width, alt / im.height)
    im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
    x0 = (im.width - W) // 2; y0 = int((im.height - alt) * foco)
    im = im.crop((x0, y0, x0 + W, y0 + alt))
    escuro = Image.new("RGB", im.size, (26, 26, 26)); masc = Image.new("L", im.size)
    for yy in range(alt):
        t = yy / alt
        topo = max(0.0, 1 - t / 0.22); baixo = min(1.0, max(0.0, (t - 0.55) / 0.43))
        a = topo * topo * (3 - 2 * topo) + baixo * baixo * (3 - 2 * baixo)
        masc.paste(int(255 * min(1, a)), (0, yy, W, yy + 1))
    im = Image.composite(escuro, im, masc)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=90)
    return f'<image x="0" y="{y_ini}" width="{W}" height="{alt}" href="data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"/>'


def ok(x, y):
    return (f'<circle cx="{x}" cy="{y}" r="22" fill="{LAR}"/>'
            f'<path d="M{x - 10} {y} l7 7 l13 -14" stroke="{BRA}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')


def selos(x, y, alt):
    """Selos oficiais Google Play e App Store lado a lado (altura alt)."""
    arq_gp = os.path.join(RAIZ, "public/banners/google-play.png")
    gp = Image.open(arq_gp)
    alt_gp = alt / 0.68; larg_gp = alt_gp * gp.width / gp.height
    svg = pymupdf.open("svg", open(os.path.join(RAIZ, "public/banners/app-store.svg"), "rb").read())
    pix = svg[0].get_pixmap(dpi=600); larg_as = alt * pix.width / pix.height
    b = lambda d: base64.b64encode(d).decode()
    return (f'<image x="{x - larg_gp * 0.06:.1f}" y="{y - (alt_gp - alt) / 2:.1f}" width="{larg_gp:.1f}" height="{alt_gp:.1f}" href="data:image/png;base64,{b(open(arq_gp, "rb").read())}"/>'
            f'<image x="{x + larg_gp * 0.88 + 24:.1f}" y="{y:.1f}" width="{larg_as:.1f}" height="{alt:.1f}" href="data:image/png;base64,{b(pix.tobytes("png"))}"/>')


def salvar(nome, corpo):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" fill="{GRA}"/>{corpo}</svg>'
    pg = pymupdf.open("svg", svg.encode())[0]
    z = W / pg.rect.width
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(z, z), alpha=False)
    Image.frombytes("RGB", (pix.w, pix.h), pix.samples).save(os.path.join(SAIDA, nome + ".jpg"), quality=92)
    print("ok", nome)


def peca(nome, arq_foto, foco, titulo, sub, itens, faixa_tit, faixa_linhas, rodape, app=False):
    # logo na faixa escura do alto (o WhatsApp cobre só uns 130 px do topo); a foto começa abaixo dele
    c = [foto(arq_foto, 330, 720, foco), logo((W - 340) / 2, 150, 340)]
    y = 1010
    for linha in titulo:
        c.append(texto(linha, M, y, 92, BRA, EXO)); y += 100
    if sub:
        c.append(texto(sub, M, y + 6, 38, CLARO)); y += 70
    y += 30
    for item in itens:
        c.append(ok(M + 22, y - 13)); c.append(texto(item, M + 66, y, 40, BRA)); y += 68
    yf = H - 330
    c.append(f'<rect x="0" y="{yf}" width="{W}" height="330" fill="{LAR}"/>')
    c.append(texto(faixa_tit, M, yf + 100, 76, GRA, EXO))
    yy = yf + 160
    for i, l in enumerate(faixa_linhas):
        c.append(texto(l, M, yy, 40, GRA, JAKB if i == 0 else JAK)); yy += 52
    c.append(texto(rodape, M, H - 40, 50, GRA, EXO))
    if app:
        c.append(selos(W - M - 330, H - 88, 56))
    salvar(nome, "".join(c))


peca("status-lojistas-1", "docs/divulgacao-whatsapp/_scripts/fotos/anuncie-revendedor.jpg", 0.35,
     ["Seus carros no", "app da região."], "Para lojas e revendas de Teixeira e região.",
     ["Quem procura carro aqui acha a sua loja", "O cliente chama direto no seu WhatsApp",
      "Sem comissão e sem intermediário", "Relatório de visitas e contatos"],
     "60 DIAS GRÁTIS", ["Contados a partir do seu cadastro.", "Sem cartão de crédito. Cadastro em 5 minutos."],
     "autoregiao.com.br/anunciar")

peca("status-lojistas-2", "docs/kit-lojistas/_scripts/capa-carros.jpg", 0.25,
     ["Sua vitrine", "aberta 24 horas."], "O estoque da sua loja no site e no app AutoRegião.",
     ["Página própria da loja, com logo e endereço", "Anúncio com fotos, FIPE e situação do carro",
      "Destaque e vitrine nos planos maiores", "Funciona no celular, sem complicação"],
     "ENTRE AGORA", ["Toda loja nova ganha 60 dias grátis.", "Dúvidas? Chama a gente aqui no WhatsApp."],
     "autoregiao.com.br/anunciar")

peca("status-compradores-1", "docs/divulgacao-whatsapp/_scripts/fotos/comprar-casal.jpg", 0.3,
     ["Seu próximo carro", "está na região."], "Carros, motos e utilitários da sua cidade e região.",
     ["Busque por marca, preço, ano e cidade", "Compare o preço com a Tabela FIPE",
      "Fale direto com o vendedor no WhatsApp", "Receba aviso quando o seu carro aparecer"],
     "BUSQUE GRÁTIS", ["Sem cadastro e sem taxa para quem compra.", "Também no app para Android e iPhone."],
     "autoregiao.com.br", app=True)

peca("status-compradores-2", "docs/divulgacao-whatsapp/_scripts/fotos/fipe-em-casa.jpg", 0.3,
     ["Não pague caro.", "Confira a FIPE."], "Consulte a Tabela FIPE grátis no AutoRegião.",
     ["Valor FIPE de carros e motos", "Selo \"Abaixo da FIPE\" nos anúncios",
      "IPVA pago, único dono, revisões em dia", "Contato direto com o vendedor"],
     "TABELA FIPE GRÁTIS", ["Veja o valor antes de negociar.", "Sem cadastro, direto no celular."],
     "autoregiao.com.br/tabela-fipe")
