import { consultarValor, listarAnos, listarMarcas, listarModelos, tipoFipeValido } from "@/lib/fipe";

// Seletor da Tabela FIPE no cadastro do anúncio:
//   ?tipo=cars                         → marcas
//   ?tipo=cars&marca=25                → modelos
//   ?tipo=cars&marca=25&modelo=6613    → anos
//   ...&ano=2014-5                     → valor
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const tipo = p.get("tipo");
  const marca = p.get("marca") ?? "";
  const modelo = p.get("modelo") ?? "";
  const ano = p.get("ano") ?? "";
  if (!tipoFipeValido(tipo)) return Response.json({ erro: "tipo inválido" }, { status: 400 });

  try {
    if (ano) return Response.json({ valor: await consultarValor(tipo, marca, modelo, ano) });
    if (modelo) return Response.json({ opcoes: await listarAnos(tipo, marca, modelo) });
    if (marca) return Response.json({ opcoes: await listarModelos(tipo, marca) });
    return Response.json({ opcoes: await listarMarcas(tipo) });
  } catch (e) {
    console.error("fipe:", e);
    return Response.json({ erro: "A Tabela FIPE não respondeu agora. Tente de novo em instantes." }, { status: 502 });
  }
}
