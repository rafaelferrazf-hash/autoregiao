"""Troca linhas  <!-- TELA arquivo.png | y0-y1 | legenda | 1:x,y,w,h; 2:... -->  por figuras.
Linhas seguidas viram uma fileira. Coordenadas em px do site (largura 390); o print tem escala 2."""
import os, re
import pymupdf

CSS = """
.telas { margin: 10px auto 14px; border-collapse: separate; border-spacing: 0; }
.telas, .telas tr, .telas td { break-inside: avoid; page-break-inside: avoid; }
.telas td { vertical-align: top; padding: 0 3.5mm; border: 0 !important; background: none !important; }
.tela { margin: 0; }
.moldura { position: relative; border: 2px solid #1A1A1A; border-radius: 10px; overflow: hidden; }
.moldura img { display: block; width: 100%; }
.marca { position: absolute; border: 2.5px solid #FF6600; border-radius: 7px; box-shadow: 0 0 0 2px rgba(255,255,255,.85); }
.marca span { position: absolute; left: -11px; top: -11px; width: 20px; height: 20px; border-radius: 50%; background: #FF6600; color: #fff; font: 700 11px/20px Arial; text-align: center; box-shadow: 0 0 0 2px #fff; }
figcaption { font-size: 8.6pt; color: #555; text-align: center; margin-top: 5px; line-height: 1.35; }
"""


def _figura(spec, originais, pasta_cortes):
    partes = [x.strip() for x in spec.split("|")]
    arq, faixa = partes[0], partes[1]
    legenda = partes[2] if len(partes) > 2 else ""
    marcas = partes[3] if len(partes) > 3 else ""
    y0, y1 = [int(v) for v in faixa.split("-")]
    destino = os.path.join(pasta_cortes, f"{arq.rsplit('.', 1)[0]}-{y0}-{y1}.jpg")
    origem = os.path.join(originais, arq)
    if os.path.exists(origem):  # recorta de novo só se o print original existir
        os.makedirs(pasta_cortes, exist_ok=True)
        pm = pymupdf.Pixmap(origem)
        if pm.alpha:
            pm = pymupdf.Pixmap(pm, 0)
        alto = min(y1 * 2, pm.height) - y0 * 2
        doc = pymupdf.open()
        pg = doc.new_page(width=pm.width, height=alto)
        pg.insert_image(pymupdf.Rect(0, -y0 * 2, pm.width, pm.height - y0 * 2), pixmap=pm)
        open(destino, "wb").write(pg.get_pixmap(dpi=72).tobytes("jpeg", jpg_quality=82))
    alt = y1 - y0
    caixas = ""
    for m in [m for m in marcas.split(";") if m.strip()]:
        num, xy = m.split(":")
        x, y, w, h = [float(v) for v in xy.split(",")]
        caixas += (f'<div class="marca" style="left:{x / 390 * 100:.2f}%;top:{(y - y0) / alt * 100:.2f}%;'
                   f'width:{w / 390 * 100:.2f}%;height:{h / alt * 100:.2f}%"><span>{num.strip()}</span></div>')
    src = "file:///" + destino.replace(os.sep, "/")
    largura = "110" if alt < 200 else "{L}"  # faixa baixinha: mostra maior
    return (f'<figure class="tela" style="width:{largura}mm"><div class="moldura"><img src="{src}">{caixas}</div>'
            f'<figcaption>{legenda}</figcaption></figure>')


def aplicar(md, originais, pasta_cortes):
    saida, grupo = [], []

    def fecha():
        if not grupo:
            return
        k = len(grupo)
        larg = min(62, (176 - 8 * (k - 1)) / k)
        saida.extend(["", '<table class="telas"><tr>' + "".join("<td>" + g.replace("{L}", f"{larg:.1f}") + "</td>" for g in grupo) + "</tr></table>", ""])
        grupo.clear()

    for ln in md.split("\n"):
        m = re.match(r"\s*<!-- TELA (.*) -->\s*$", ln)
        if m:
            grupo.append(_figura(m.group(1), originais, pasta_cortes))
        else:
            fecha()
            saida.append(ln)
    fecha()
    return "\n".join(saida)
