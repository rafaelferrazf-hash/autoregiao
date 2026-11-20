"""python apostila.py <py-libs> <md> <saida.pdf> <numero> <titulo> <subtitulo> [--sumario]"""
import sys, re, base64, subprocess, os
sys.path.insert(0, sys.argv[1]); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import markdown, pymupdf
md_path, saida, numero, titulo, subtitulo = sys.argv[2:7]
COM_SUMARIO = "--sumario" in sys.argv[7:]
APRESENTACAO = next((a.split("=", 1)[1] for a in sys.argv[7:] if a.startswith("--apresentacao=")), None)
AQUI = os.path.dirname(os.path.abspath(__file__))
TRAB = os.path.join(os.environ.get("TEMP", AQUI), "apostila-autoregiao")  # arquivos intermediários (fora do projeto)
os.makedirs(TRAB, exist_ok=True)
RAIZ = r"C:/Users/rafae/autoregiao"
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
logo_claro = b64(RAIZ + "/public/marca/logo-horizontal.svg")
logo_escuro = b64(RAIZ + "/docs/identidade-visual/_arquivos/logo-completo-fundo-escuro.svg")
foto = b64(RAIZ + "/docs/kit-lojistas/_scripts/capa-carros.jpg")

md = open(md_path, encoding='utf-8').read().replace('- [ ] ', '- ☐ ')
md = re.sub(r'\A# .*\n', '', md)  # o título vai para a capa
import telas
def limpar(t): return re.sub(r'[*`_]', '', t).strip()
titulos = [(len(m.group(1)), limpar(m.group(2))) for m in re.finditer(r'^(##|###) (.+)$', md, re.M)]
md = telas.aplicar(md, AQUI + "/prints-originais", os.path.join(os.path.dirname(os.path.abspath(md_path)), "prints"))
corpo = markdown.markdown(md, extensions=['tables', 'sane_lists'])
css = """
@page { size: A4; margin: 24mm 15mm 17mm; }
body { font: 10.3pt/1.45 Arial, Helvetica, sans-serif; color: #1A1A1A; margin: 0; }
h2 { font-size: 14.5pt; border-bottom: 2px solid #FF6600; padding-bottom: 3px; margin: 18px 0 8px; break-after: avoid; }
h2:first-child { margin-top: 0; }
h3 { font-size: 11.5pt; color: #FF6600; margin: 14px 0 5px; break-after: avoid; }
p, li { margin: 4px 0; } ul, ol { padding-left: 20px; }
blockquote { margin: 8px 0; padding: 7px 12px; background: #FFF4EC; border-left: 4px solid #FF6600; break-inside: avoid; }
blockquote p { margin: 2px 0; }
table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9.4pt; }
tr { break-inside: avoid; }
th { background: #1A1A1A; color: #fff; text-align: left; padding: 5px 7px; }
td { padding: 5px 7px; border-bottom: 1px solid #E2E2E2; vertical-align: top; }
tr:nth-child(even) td { background: #F7F7F7; }
code { font-family: Consolas, monospace; font-size: 9pt; background: #F2F2F2; padding: 0 3px; }
hr { border: 0; height: 0; margin: 4px 0; }
""" + telas.CSS + """
.telas { display: flex; justify-content: center; align-items: flex-start; gap: 7mm; margin: 10px 0 14px; break-inside: avoid; }
.tela { margin: 0; break-inside: avoid; }
.moldura { position: relative; border: 2px solid #1A1A1A; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.18); }
.moldura img { display: block; width: 100%; }
.marca { position: absolute; border: 2.5px solid #FF6600; border-radius: 7px; box-shadow: 0 0 0 2px rgba(255,255,255,.85); }
.marca span { position: absolute; left: -11px; top: -11px; width: 20px; height: 20px; border-radius: 50%; background: #FF6600; color: #fff; font: 700 11px/20px Arial; text-align: center; box-shadow: 0 0 0 2px #fff; }
figcaption { font-size: 8.6pt; color: #555; text-align: center; margin-top: 5px; line-height: 1.35; }
"""
open(TRAB + "/ap-corpo.html", 'w', encoding='utf-8').write(
    f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{css}</style></head><body>{corpo}</body></html>')

header = f"""<div style="width:100%;margin:0 15mm;padding:0 0 5px;border-bottom:1.5px solid #FF6600;display:flex;align-items:flex-end;justify-content:space-between;font-family:Arial;-webkit-print-color-adjust:exact">
<img src="data:image/svg+xml;base64,{logo_claro}" style="height:7mm">
<span style="font-size:8px;color:#777">Apostila {numero} · {titulo}</span></div>"""
footer = """<div style="width:100%;margin:0 15mm;font-family:Arial;font-size:8px;color:#888;display:flex;justify-content:space-between">
<span>www.autoregiao.com.br</span><span>página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>"""
open(TRAB + "/ap-header.html", 'w', encoding='utf-8').write(header)
open(TRAB + "/ap-footer.html", 'w', encoding='utf-8').write(footer)

capa = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 0; }} * {{ margin: 0; box-sizing: border-box; }}
body {{ width: 210mm; height: 297mm; background: #1A1A1A; color: #fff; font-family: Arial, Helvetica, sans-serif; position: relative; overflow: hidden; -webkit-print-color-adjust: exact; }}
.foto {{ position: absolute; inset: 0 0 auto 0; height: 128mm; background: url(data:image/jpeg;base64,{foto}) center/cover; }}
.foto::after {{ content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(26,26,26,.25) 0%, rgba(26,26,26,.55) 60%, #1A1A1A 100%); }}
.faixa {{ position: absolute; left: 0; top: 128mm; width: 100%; height: 4mm; background: #FF6600; }}
.logo {{ position: absolute; left: 50%; top: 22mm; transform: translateX(-50%); width: 120mm; }}
.texto {{ position: absolute; left: 22mm; right: 22mm; top: 152mm; }}
.etiqueta {{ display: inline-block; background: #FF6600; color: #fff; font-weight: 700; font-size: 12pt; letter-spacing: 2px; padding: 3mm 6mm; border-radius: 2mm; }}
h1 {{ font-size: 34pt; line-height: 1.12; margin-top: 10mm; font-weight: 800; }}
.sub {{ font-size: 15pt; color: #D9D9D9; margin-top: 6mm; line-height: 1.35; }}
.rodape {{ position: absolute; left: 22mm; right: 22mm; bottom: 18mm; display: flex; justify-content: space-between; font-size: 10.5pt; color: #BDBDBD; border-top: 1px solid #444; padding-top: 5mm; }}
.rodape b {{ color: #FF6600; }}
</style></head><body>
<div class="foto"></div><div class="faixa"></div>
<img class="logo" src="data:image/svg+xml;base64,{logo_escuro}">
<div class="texto"><span class="etiqueta">APOSTILA {numero}</span><h1>{titulo}</h1><div class="sub">{subtitulo}</div></div>
<div class="rodape"><span>Treinamento AutoRegião · uso interno</span><span><b>Novembro de 2026</b></span></div>
</body></html>"""
open(TRAB + "/ap-capa.html", 'w', encoding='utf-8').write(capa)

def imprimir(html, pdf, *extra):
    for tentativa in range(4):
        r = subprocess.run(["node", AQUI + "/imprimir.mjs", html, pdf, *extra], capture_output=True, text=True, cwd=TRAB, timeout=120)
        if "ok" in r.stdout: return
    raise SystemExit(r.stdout + r.stderr[-400:])
imprimir("ap-capa.html", "ap-capa.pdf")
imprimir("ap-corpo.html", "ap-corpo.pdf", "ap-header.html", "ap-footer.html")
d = pymupdf.open(TRAB + "/ap-capa.pdf"); c = pymupdf.open(TRAB + "/ap-corpo.pdf")
while len(d) > 1: d.delete_page(len(d) - 1)
for pg in c:
    lixo = [pymupdf.Rect(im["bbox"]) for im in pg.get_image_info() if im["bbox"][1] > 784]
    for r in lixo:  # pedaço de figura que o navegador desenha no fim da página antes de empurrar para a próxima
        pg.draw_rect(pymupdf.Rect(r.x0 - 4, r.y0 - 1, r.x1 + 4, 812), color=None, fill=(1, 1, 1), overlay=True)
    pg.draw_rect(pymupdf.Rect(0, 794.6, pg.rect.width, 812), color=None, fill=(1, 1, 1), overlay=True)
norm = lambda t: re.sub(r'\s+', ' ', t).strip()
def paginas_dos_titulos(doc):
    """Página (0 = 1ª do corpo) de cada título ## / ###, lendo os textos grandes/negritos do PDF, na ordem."""
    linhas = []
    for i, pg in enumerate(doc):
        for b in pg.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                sp = [x for x in l["spans"] if x["size"] >= 11 and x["text"].strip()]
                if sp: linhas.append((i, norm("".join(x["text"] for x in sp))))
    res, k = [], 0
    for nivel, t in titulos:
        alvo = norm(t)[:28]
        j = k
        while j < len(linhas) and not norm(alvo) in linhas[j][1] and not linhas[j][1].startswith(alvo[:20]):
            j += 1
        if j == len(linhas): raise SystemExit("titulo nao achado no PDF: " + t)
        res.append((nivel, t, linhas[j][0])); k = j + 1
    return res

sumario = None
if COM_SUMARIO:
    itens = paginas_dos_titulos(c)
    from html import escape
    li = "".join(
        f'<div class="n{nv}"><span class="t">{escape(t)}</span><span class="p">{pg + 1}</span></div>' for nv, t, pg in itens)
    html_sum = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 24mm 15mm 17mm; }}
body {{ font: 10pt/1.3 Arial, Helvetica, sans-serif; color: #1A1A1A; margin: 0; -webkit-print-color-adjust: exact; }}
h2 {{ font-size: 20pt; margin: 0 0 2px; }}
.sub {{ color: #777; font-size: 9.5pt; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #FF6600; }}
.n2, .n3 {{ display: flex; align-items: baseline; gap: 6px; }}
.n2 {{ font-weight: 700; font-size: 10.6pt; margin-top: 7px; padding: 3px 0; }}
.n3 {{ font-size: 9.2pt; color: #444; padding: 1.2px 0 1.2px 18px; }}
.t {{ flex: 0 1 auto; }}
.n2::after, .n3::after {{ content: ""; order: 1; flex: 1; border-bottom: 1.2px dotted #BBB; transform: translateY(-3px); }}
.p {{ order: 2; min-width: 18px; text-align: right; }}
.n2 .p {{ color: #FF6600; }}
</style></head><body><h2>Sumário</h2><div class="sub">O número é o da página, que aparece no rodapé. No celular ou computador, toque no título para ir direto à parte.</div>{li}</body></html>"""
    open(TRAB + "/ap-sumario.html", 'w', encoding='utf-8').write(html_sum)
    open(TRAB + "/ap-footer-sum.html", 'w', encoding='utf-8').write(
        '<div style="width:100%;margin:0 15mm;font-family:Arial;font-size:8px;color:#888"><span>www.autoregiao.com.br</span></div>')
    imprimir("ap-sumario.html", "ap-sumario.pdf", "ap-header.html", "ap-footer-sum.html")
    sumario = pymupdf.open(TRAB + "/ap-sumario.pdf")
    if len(sumario) > 1: raise SystemExit("sumario passou de 1 pagina: " + str(len(sumario)))
    d.insert_pdf(sumario)

if APRESENTACAO:  # página sem número (como o Sumário), para não mudar a numeração já impressa
    corpo_ap = markdown.markdown(open(APRESENTACAO, encoding='utf-8').read(), extensions=['sane_lists'])
    open(TRAB + "/ap-apresentacao.html", 'w', encoding='utf-8').write(
        f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{css}'
        ' body { font-size: 10.8pt; line-height: 1.55; } h2 { font-size: 20pt; border-bottom-width: 2px; margin-bottom: 12px; }'
        ' h3 { margin-top: 16px; } p { margin: 7px 0; } li { margin: 5px 0; }'
        f'</style></head><body>{corpo_ap}</body></html>')
    if not os.path.exists(TRAB + "/ap-footer-sum.html"):
        open(TRAB + "/ap-footer-sum.html", 'w', encoding='utf-8').write(
            '<div style="width:100%;margin:0 15mm;font-family:Arial;font-size:8px;color:#888"><span>www.autoregiao.com.br</span></div>')
    imprimir("ap-apresentacao.html", "ap-apresentacao.pdf", "ap-header.html", "ap-footer-sum.html")
    apr = pymupdf.open(TRAB + "/ap-apresentacao.pdf")
    if len(apr) > 1: raise SystemExit("apresentacao passou de 1 pagina: " + str(len(apr)))
    d.insert_pdf(apr)

inicio = len(d)
d.insert_pdf(c); d.set_metadata({"title": f"AutoRegião – Apostila {numero}: {titulo}", "author": "AutoRegião"})
if sumario is not None:
    ps = d[1]
    for nv, t, pg in itens:  # links clicáveis do sumário
        r = ps.search_for(t[:40])
        if r: ps.insert_link({"kind": pymupdf.LINK_GOTO, "from": pymupdf.Rect(r[0].x0, r[0].y0 - 1, ps.rect.width - 40, r[0].y1 + 1), "page": inicio + pg})
    d.set_toc([[1, "Capa", 1], [1, "Sumário", 2]] + ([[1, "Apresentação", 3]] if APRESENTACAO else []) + [[nv - 1, t, inicio + pg + 1] for nv, t, pg in itens])
d.save(saida, garbage=3, deflate=True); print("paginas", len(d))
