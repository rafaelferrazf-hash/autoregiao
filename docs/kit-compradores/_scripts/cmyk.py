"""Converte um PDF (RGB) em PDF CMYK para gráfica, uma imagem por página (achatada, sem transparência).
Uso: python -I cmyk.py <pasta_py> <entrada.pdf> <saida.pdf> [dpi] [sangria_mm]

Sai no padrão PDF/X-1a:2001 (pedido da Zap): imagens DeviceCMYK, sem transparência, OutputIntent SWOP
(U.S. Web Coated (SWOP) v2 / CGATS TR 001), TrimBox/BleedBox, cabeçalho %PDF-1.3, Trapped = False.

Como pedem as gráficas (ex.: Zap): cores em CMYK, tudo achatado num bitmap de 300+ dpi junto com o fundo,
textos já em curvas (os nossos PDFs não têm fonte, só desenho). Conversão sem perfil ICC:
- curva 1,2 nos tons médios (o laranja #FF6600 vira ~M67 Y100, mais próximo do laranja da marca no papel);
- o preto vai todo para o K (texto preto sai só com a chapa preta, sem borrar);
- áreas GRANDES escuras (fundo grafite) ganham "preto rico" (C40 M30 Y30 por baixo do K), senão saem cinza-chumbo;
  texto pequeno escuro sobre fundo claro não recebe (a média num raio de 5 mm mede se a área é grande).
"""
import sys
sys.path.insert(0, sys.argv[1])
import io
import numpy as np
import pymupdf
from PIL import Image, ImageFilter

entrada, saida = sys.argv[2], sys.argv[3]
dpi = int(sys.argv[4]) if len(sys.argv) > 4 else 350
sangria = float(sys.argv[5]) if len(sys.argv) > 5 else 1.5
MM = 72 / 25.4

src = pymupdf.open(entrada)
out = pymupdf.open()
for pg in src:
    pix = pg.get_pixmap(dpi=dpi, alpha=False)
    rgb = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, 3).astype(np.float32) / 255.0
    lin = rgb ** 1.2
    k = 1.0 - lin.max(axis=2)
    den = np.where(k < 1.0, 1.0 - k, 1.0)
    c = (1.0 - lin[..., 0] - k) / den
    m = (1.0 - lin[..., 1] - k) / den
    y = (1.0 - lin[..., 2] - k) / den
    raio = max(1, round(dpi / 25.4 * 5))
    k_area = np.asarray(Image.fromarray((k * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(raio)), dtype=np.float32) / 255.0
    rico = np.clip((k - 0.8) / 0.15, 0.0, 1.0) * np.clip((k_area - 0.35) / 0.2, 0.0, 1.0)
    c = np.maximum(c, 0.40 * rico)
    m = np.maximum(m, 0.30 * rico)
    y = np.maximum(y, 0.30 * rico)
    cmyk = np.clip(np.stack([c, m, y, k], axis=2) * 255.0 + 0.5, 0, 255).astype(np.uint8)
    im = Image.fromarray(cmyk, mode="CMYK")
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=95, dpi=(dpi, dpi))
    novo = out.new_page(width=pg.rect.width, height=pg.rect.height)
    novo.insert_image(novo.rect, stream=buf.getvalue())
# ---------- PDF/X-1a ----------
icc = None
for i, pg in enumerate(out):
    for img in out.get_page_images(i):
        x = img[0]
        tipo, val = out.xref_get_key(x, "ColorSpace")  # ('xref', '7 0 R') → objeto [/ICCBased 8 0 R]
        arr = out.xref_object(int(val.split()[0]), compressed=True) if tipo == "xref" else val
        if icc is None and "ICCBased" in arr:
            icc = int(arr.split("ICCBased")[1].split()[0])
        out.xref_set_key(x, "ColorSpace", "/DeviceCMYK")
    r = pg.rect
    s_pt = sangria * MM
    out.xref_set_key(pg.xref, "BleedBox", f"[0 0 {r.width:.3f} {r.height:.3f}]")
    out.xref_set_key(pg.xref, "TrimBox", f"[{s_pt:.3f} {s_pt:.3f} {r.width - s_pt:.3f} {r.height - s_pt:.3f}]")
    out.xref_set_key(pg.xref, "Group", "null")  # sem grupo de transparência
assert icc, "perfil ICC não encontrado"
intent = out.get_new_xref()
out.update_object(intent, "<< /Type /OutputIntent /S /GTS_PDFX /OutputConditionIdentifier (CGATS TR 001) "
                          "/OutputCondition (U.S. Web Coated SWOP v2) /RegistryName (http://www.color.org) "
                          f"/Info (U.S. Web Coated SWOP v2) /DestOutputProfile {icc} 0 R >>")
out.xref_set_key(out.pdf_catalog(), "OutputIntents", f"[{intent} 0 R]")
meta = dict(src.metadata or {})
import datetime
agora = datetime.datetime.now().strftime("D:%Y%m%d%H%M%S-03'00'")
meta.update({"producer": "AutoRegião (CMYK SWOP)", "creator": "AutoRegião", "format": "PDF 1.3",
             "creationDate": agora, "modDate": agora, "subject": "Impressão", "keywords": "AutoRegião"})
out.set_metadata(meta)
out.xref_set_key(out.pdf_catalog(), "Info", "null")  # o Info fica só no trailer
info = out.xref_get_key(-1, "Info")[1].split()[0]
out.xref_set_key(int(info), "GTS_PDFXVersion", "(PDF/X-1:2001)")
out.xref_set_key(int(info), "GTS_PDFXConformance", "(PDF/X-1a:2001)")
out.xref_set_key(int(info), "Trapped", "/False")
dados = out.tobytes(deflate=True, garbage=3, use_objstms=0)
assert dados[:8].startswith(b"%PDF-")
dados = b"%PDF-1.3" + dados[8:]
open(saida, "wb").write(dados)
print("ok", len(out), "páginas", dpi, "dpi")
