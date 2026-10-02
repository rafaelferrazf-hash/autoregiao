"use client";

// Reduz uma imagem no próprio aparelho antes de enviar (fotos de celular têm 3–8 MB).
// PNG continua PNG (mantém fundo transparente de logos); o resto vira JPEG.
export async function reduzirImagem(arquivo: File, ladoMaximo = 600): Promise<{ blob: Blob; extensao: string; tipo: string }> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala), altura = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura; canvas.height = altura;
  const ctx = canvas.getContext("2d")!;
  const png = arquivo.type === "image/png";
  if (!png) { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, largura, altura); }
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();
  const tipo = png ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((ok, erro) => canvas.toBlob(b => (b ? ok(b) : erro(new Error("imagem"))), tipo, 0.86));
  return { blob, extensao: png ? "png" : "jpg", tipo };
}
