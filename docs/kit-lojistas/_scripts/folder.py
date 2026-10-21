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


def foto(caminho, x, y, w, h, pos_y=0.3, escurecer=None):
    """Foto cortada na proporção w×h (mm); escurecer(t) dá a opacidade do grafite em cada altura (0..1)."""
    im = Image.open(caminho).convert("RGB")
    pw = 1400
    ph = round(pw * h / w)
    esc = max(pw / im.width, ph / im.height)
    im = im.resize((round(im.width * esc), round(im.height * esc)), Image.LANCZOS)
    x0 = (im.width - pw) // 2
    y0 = int((im.height - ph) * pos_y)
    im = im.crop((x0, y0, x0 + pw, y0 + ph))
    if escurecer:
        escuro = Image.new("RGB", im.size, (26, 26, 26))
        masc = Image.new("L", im.size)
        for yy in range(ph):
            masc.paste(int(255 * min(1.0, escurecer(yy / ph))), (0, yy, pw, yy + 1))
        im = Image.composite(escuro, im, masc)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=90)
    return f'<image x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" href="data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"/>'


def celular(caminho, x, y, w, corte=0.55):
    """Tela do site dentro de um celular desenhado (só a parte de cima da captura)."""
    im = Image.open(caminho).convert("RGB")
    im = im.crop((0, 0, im.width, int(im.height * corte)))
    h_tela = w * im.height / im.width
    im = im.resize((700, round(700 * im.height / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=88)
    b = 2.2
    return (f'<rect x="{x - b:.2f}" y="{y - b * 2.2:.2f}" width="{w + 2 * b:.2f}" height="{h_tela + b * 4.4:.2f}" rx="6" fill="{GRA}"/>'
            f'<image x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h_tela:.2f}" href="data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"/>'), h_tela


TELAS = os.path.join(RAIZ, "docs/app-store-capturas")
FOTO_CAPA = os.path.join(RAIZ, "public/banners/anuncie-revendedor.jpg")
# Painéis (sem a sangria). Por fora: aba que dobra para dentro (0..97) | contracapa (97..197) | capa (197..297).
# Por dentro: 1 (0..100) | 2 (100..200) | 3 (200..297). A aba é 3 mm mais estreita para fechar sem amassar.
S = SANG
PM = 9  # margem interna de cada painel

# ================= LADO DE FORA =================
c = []
# --- CAPA (direita) ---
x0 = S + 197
LP = 100
c.append(f'<rect x="{x0}" y="0" width="{LP + S}" height="{H}" fill="{GRA}"/>')
c.append(foto(FOTO_CAPA, x0, S + 30, LP + S, 92, 0.2,
              lambda t: max(0.0, 1 - t / 0.14) + min(1.0, max(0.0, (t - 0.62) / 0.38)) ** 1.2))
c.append(logo(x0 + (LP - 52) / 2, S + 6, 52, "neg"))
y = S + 130
_pl = largura("PRÉ-LANÇAMENTO", 3.8, JAKB) + 7
c.append(f'<rect x="{x0 + PM}" y="{y - 14}" width="{_pl}" height="6.8" rx="3.4" fill="{LAR}"/>')
c.append(texto("PRÉ-LANÇAMENTO", x0 + PM + 3.5, y - 9.1, 3.8, BRA, JAKB))
for l in ["Seus carros na", "vitrine de quem", "compra na região."]:
    c.append(texto(l, x0 + PM, y, 9.4, BRA, EXO))
    y += 10.3
t, y = paragrafo("O portal de veículos da sua cidade e região, no site e no app.", x0 + PM, y + 1.5, 4.1, "#D0D0D0", JAK, LP - 2 * PM, 5.5)
c.append(t)
c.append(f'<rect x="{x0}" y="{H - S - 30}" width="{LP + S}" height="{30 + S}" fill="{LAR}"/>')
c.append(texto("60 DIAS GRÁTIS", x0 + PM, H - S - 17.5, 9.5, GRA, EXO))
c.append(texto("Sem cartão. Sem compromisso.", x0 + PM, H - S - 10, 4.2, GRA, JAKB))

# --- CONTRACAPA (meio) ---
x0 = S + 97
LP = 100
y = S + 22
c.append(texto("Fale com a gente", x0 + PM, y, 7, GRA, EXO))
y += 9
t, y = paragrafo("Tiramos suas dúvidas e ajudamos no cadastro da sua loja, pelo WhatsApp ou pessoalmente.",
                 x0 + PM, y, 3.9, CIN, JAK, LP - 2 * PM, 5.2)
c.append(t)
y += 12
for rot, val in [("WhatsApp", WHATS), ("E-mail", "contato@autoregiao.com.br"), ("Site", "www.autoregiao.com.br")]:
    c.append(texto(rot, x0 + PM, y, 3.4, CIN, JAK))
    c.append(texto(val, x0 + PM, y + 6, 5.4 if rot == "WhatsApp" else 4.3, GRA, JAKB))
    y += 15
y += 2
c.append(f'<rect x="{x0 + PM}" y="{y}" width="{LP - 2 * PM}" height="40" rx="3" fill="{GRA}"/>')
c.append(texto("Baixe o app", x0 + PM + 5, y + 9, 5, BRA, JAKB))
c.append(texto("Android e iPhone.", x0 + PM + 5, y + 15, 3.5, "#D0D0D0"))
c.append(texto("Aponte a câmera:", x0 + PM + 5, y + 19.8, 3.5, "#D0D0D0"))
c.append(qr(x0 + LP - PM - 5 - 22, y + 9, 22, LINK_APP))
c.append(selos(x0 + PM + 5, y + 27, 6))
c.append(logo(x0 + (LP - 42) / 2, H - S - 27, 42, "pos"))

# --- ABA QUE DOBRA PARA DENTRO (esquerda) ---
c.append(f'<rect x="0" y="0" width="{97 + S}" height="{H}" fill="#FFF0E6"/>')
xa = S + PM
La = 97 - 2 * PM
y = S + 24
c.append(texto("Por que o", xa, y, 8, GRA, EXO))
c.append(texto("AutoRegião?", xa, y + 9, 8, LAR, EXO))
y += 23
motivos = [("Feito para a região", "Quem procura carro aqui encontra as lojas daqui, não de outro estado."),
           ("Sem comissão", "Você paga só o plano. O que vender é todo seu."),
           ("Cliente direto no seu WhatsApp", "Sem formulário e sem intermediário."),
           ("Comparação com a FIPE", "O comprador vê na hora quando o seu preço é bom."),
           ("Você vê o resultado", "Relatório todo mês com quantas pessoas viram e chamaram.")]
for tit, desc in motivos:
    c.append(icone_ok(xa + 2.6, y - 1.6))
    c.append(texto(tit, xa + 8, y, 4.3, GRA, JAKB))
    t, y = paragrafo(desc, xa + 8, y + 5.4, 3.6, CIN, JAK, La - 8, 4.8)
    c.append(t)
    y += 11
fora = salvar("fora", "".join(c), BRA)

# ================= LADO DE DENTRO =================
c = []
c.append(f'<rect x="0" y="0" width="{W}" height="{S + 5}" fill="{LAR}"/>')
c.append(f'<line x1="{S + 100}" y1="{S + 16}" x2="{S + 100}" y2="{H - S - 14}" stroke="#E2E2E2" stroke-width="0.3"/>')
c.append(f'<line x1="{S + 200}" y1="{S + 16}" x2="{S + 200}" y2="{H - S - 40}" stroke="#E2E2E2" stroke-width="0.3"/>')
# --- PAINEL 1: como funciona ---
xa = S + PM
La = 100 - 2 * PM
y = S + 24
c.append(texto("Como funciona", xa, y, 8, GRA, EXO))
y += 14
passos = [("1", "Cadastre a loja", "Em 5 minutos, pelo celular ou computador. Coloque logo, foto da fachada, endereço e horário."),
          ("2", "Anuncie seus carros", "Tire as fotos com o celular. A Tabela FIPE preenche marca, modelo e versão."),
          ("3", "Receba os clientes", "O comprador chama direto no seu WhatsApp ou liga. Sem intermediário."),
          ("4", "Acompanhe os números", "No painel e no relatório mensal: visualizações e contatos de cada carro.")]
for n, tit, desc in passos:
    c.append(f'<circle cx="{xa + 4}" cy="{y - 1.5}" r="4" fill="{LAR}"/>')
    c.append(texto(n, xa + 4, y, 5, BRA, EXO, "centro"))
    c.append(texto(tit, xa + 11, y - 0.6, 4.6, GRA, JAKB))
    t, y = paragrafo(desc, xa + 11, y + 5.2, 3.6, CIN, JAK, La - 11, 4.8)
    c.append(t)
    y += 12
y += 3
c.append(f'<rect x="{xa}" y="{y}" width="{La}" height="24" rx="3" fill="#FFF0E6"/>')
c.append(texto("Dúvida no cadastro?", xa + 5, y + 8.5, 4.6, LAR, JAKB))
t, _ = paragrafo("Chame no WhatsApp que a gente ajuda passo a passo.", xa + 5, y + 14.5, 3.7, GRA, JAK, La - 10, 4.8)
c.append(t)

# --- PAINEL 2: o que a loja ganha (telas reais do site) ---
xb = S + 100 + PM
Lb = 100 - 2 * PM
y = S + 24
c.append(texto("O que sua loja ganha", xb, y, 7.4, GRA, EXO))
y += 9
tel1, h1 = celular(os.path.join(TELAS, "tela-7.png"), xb + 3, y + 5, 35, 0.66)
tel2, h2 = celular(os.path.join(TELAS, "tela-4.png"), xb + Lb - 38, y + 5, 35, 0.66)
c.append(tel1)
c.append(tel2)
y += 5 + max(h1, h2) + 10
c.append(texto("Imagens ilustrativas", xb + Lb / 2, y - 2.5, 2.6, "#9A9A9A", JAK, "centro"))
y += 6
for item in ["Página da loja com logo, fotos, mapa e \"Como chegar\"",
             "Selo \"Bom preço\" quando o carro está abaixo da FIPE",
             "Botão de WhatsApp em cada anúncio",
             "Selo \"Loja verificada\" para lojas conferidas",
             "Destaque e vitrine na página inicial (conforme o plano)"]:
    c.append(icone_ok(xb + 2.6, y - 1.6))
    t, y = paragrafo(item, xb + 8, y, 3.6, GRA, JAK, Lb - 8, 4.6)
    c.append(t)
    y += 6.6

# --- PAINEL 3: planos ---
xc = S + 200 + PM
Lc = 97 - 2 * PM
y = S + 24
c.append(texto("Planos", xc, y, 8, GRA, EXO))
y += 6.5
c.append(texto("Depois dos 60 dias grátis", xc, y, 3.8, CIN, JAK))
y += 6
planos = [("Básico", "R$ 99", ["Até 15 anúncios ativos"], False),
          ("Profissional", "R$ 169", ["Até 40 anúncios ativos", "Destaque nas buscas", "Logo da loja nos anúncios"], True),
          ("Premium", "R$ 279", ["Até 80 anúncios ativos", "Primeiro nas buscas", "Vitrine na página inicial", "Selo \"Loja Premium\""], False)]
for nome, preco, itens, pop in planos:
    alt = 17.5 + 4.5 * len(itens)
    c.append(f'<rect x="{xc}" y="{y}" width="{Lc}" height="{alt}" rx="3" fill="{LAR if pop else "#F2F2F2"}"/>')
    cor = BRA if pop else GRA
    if pop:
        _mp = largura("MAIS POPULAR", 2.8, JAKB) + 5
        c.append(f'<rect x="{xc + Lc - _mp - 3}" y="{y + 3}" width="{_mp}" height="4.8" rx="2.4" fill="{GRA}"/>')
        c.append(texto("MAIS POPULAR", xc + Lc - _mp / 2 - 3, y + 6.4, 2.8, BRA, JAKB, "centro"))
    c.append(texto(nome, xc + 4, y + 6.8, 4, cor, JAKB))
    c.append(texto(preco, xc + 4, y + 14, 7, cor, EXO))
    c.append(texto("/mês", xc + 4 + largura(preco, 7, EXO) + 1, y + 14, 3.4, cor, JAK))
    for k, it in enumerate(itens):
        c.append(texto("• " + it, xc + 4, y + 19.5 + k * 4.5, 3.2, cor, JAK))
    y += alt + 3.5
y += 1.5
for l in ["Mais de 80 carros? Preço sob consulta.", "Sem fidelidade: cancelar é só não renovar."]:
    c.append(texto(l, xc, y, 3.2, CIN, JAK))
    y += 4.6
c.append(f'<rect x="{S + 200}" y="{H - S - 36}" width="{97 + S}" height="{36 + S}" fill="{GRA}"/>')
c.append(texto("Cadastre sua loja", xc, H - S - 24, 4.8, BRA, JAKB))
c.append(texto("60 dias grátis.", xc, H - S - 18, 4, LAR, JAKB))
c.append(texto("Aponte a câmera:", xc, H - S - 12, 3.4, "#D0D0D0"))
c.append(qr(xc + Lc - 23, H - S - 30, 23, LINK))
dentro = salvar("dentro", "".join(c), BRA)

doc = pymupdf.open()
doc.insert_pdf(fora)
doc.insert_pdf(dentro)
doc.set_metadata({"title": "Folder lojistas AutoRegião", "author": "AutoRegião"})
doc.save(os.path.join(SAIDA, "folder-lojistas_A4-2-dobras_com-sangria-3mm.pdf"), deflate=True)
for i, pg in enumerate(doc):
    pg.get_pixmap(dpi=110).save(os.path.join(SAIDA, f"previa-folder-{'fora' if i == 0 else 'dentro'}.png"))
print("ok")
