"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Icone from "@/components/Icone";
import { formatarPreco } from "@/lib/formatar";
import { limparMarca, limparVersao, modeloBase } from "@/lib/nomesVeiculo";

// Consulta pública da Tabela FIPE (/tabela-fipe): tipo → marca → modelo → ano → valor.
// Usa a mesma rota do cadastro do anúncio (/api/fipe), que guarda as respostas em cache.
type Opcao = { codigo: string; nome: string };
type Valor = { valor: number; codigoFipe: string; mes: string; modelo: string; marca: string; anoModelo: number; combustivel: string };
type Tipo = "cars" | "motorcycles";

async function buscar<T>(query: string): Promise<T> {
  const r = await fetch(`/api/fipe?${query}`).catch(() => { throw new Error("Sem conexão. Confira a internet e tente de novo."); });
  const j = await r.json();
  if (!r.ok) throw new Error(j.erro || "A Tabela FIPE não respondeu agora. Tente de novo em instantes.");
  return j;
}

export default function ConsultaFipe({ inicial }: { inicial: { tipo?: Tipo; marca?: string; modelo?: string; ano?: string } }) {
  const [tipo, setTipo] = useState<Tipo>(inicial.tipo ?? "cars");
  const [marca, setMarca] = useState(inicial.marca ?? "");
  const [modelo, setModelo] = useState(inicial.modelo ?? "");
  const [ano, setAno] = useState(inicial.ano ?? "");
  const [marcas, setMarcas] = useState<Opcao[]>([]);
  const [modelos, setModelos] = useState<Opcao[]>([]);
  const [anos, setAnos] = useState<Opcao[]>([]);
  const [valor, setValor] = useState<Valor | null>(null);
  const [semValor, setSemValor] = useState(false);
  const [carregando, setCarregando] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    buscar<{ opcoes: Opcao[] }>(`tipo=${tipo}`)
      .then(j => { if (!cancelado) setMarcas(j.opcoes.sort((a, b) => limparMarca(a.nome).localeCompare(limparMarca(b.nome), "pt-BR"))); })
      .catch(e => { if (!cancelado) setErro(e.message); });
    return () => { cancelado = true; };
  }, [tipo]);

  useEffect(() => {
    if (!marca) return;
    let cancelado = false;
    buscar<{ opcoes: Opcao[] }>(`tipo=${tipo}&marca=${marca}`)
      .then(j => { if (!cancelado) setModelos(j.opcoes); })
      .catch(e => { if (!cancelado) setErro(e.message); });
    return () => { cancelado = true; };
  }, [tipo, marca]);

  useEffect(() => {
    if (!marca || !modelo) return;
    let cancelado = false;
    buscar<{ opcoes: Opcao[] }>(`tipo=${tipo}&marca=${marca}&modelo=${modelo}`)
      .then(j => { if (!cancelado) setAnos(j.opcoes); })
      .catch(e => { if (!cancelado) setErro(e.message); });
    return () => { cancelado = true; };
  }, [tipo, marca, modelo]);

  useEffect(() => {
    if (!marca || !modelo || !ano) return;
    let cancelado = false;
    buscar<{ valor: Valor | null }>(`tipo=${tipo}&marca=${marca}&modelo=${modelo}&ano=${ano}`)
      .then(j => { if (!cancelado) { setValor(j.valor); setSemValor(!j.valor); setCarregando(""); } })
      .catch(e => { if (!cancelado) { setErro(e.message); setCarregando(""); } });
    return () => { cancelado = true; };
  }, [tipo, marca, modelo, ano]);

  const trocarTipo = (t: Tipo) => { setTipo(t); setMarca(""); setModelo(""); setAno(""); setMarcas([]); setModelos([]); setAnos([]); setValor(null); setErro(""); };
  const trocarMarca = (m: string) => { setMarca(m); setModelo(""); setAno(""); setModelos([]); setAnos([]); setValor(null); setErro(""); };
  const trocarModelo = (m: string) => { setModelo(m); setAno(""); setAnos([]); setValor(null); setErro(""); };
  const trocarAno = (a: string) => { setAno(a); setValor(null); setSemValor(false); setErro(""); if (a) setCarregando("valor"); };

  const campo = { width: "100%", padding: "11px 12px", border: "1.5px solid #E8E6E1", borderRadius: 9, fontSize: 15, color: "#1A1917", background: "#fff", outline: "none", boxSizing: "border-box" } as const;
  const rotulo = { display: "block", fontSize: 11.5, fontWeight: 700, color: "#7A7670", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 } as const;

  // "Ver à venda": busca do site pela marca e pelo modelo "curto" (ex.: Chevrolet + Onix).
  const nomeMarca = marcas.find(m => m.codigo === marca)?.nome ?? valor?.marca ?? "";
  const nomeModelo = modelos.find(m => m.codigo === modelo)?.nome ?? valor?.modelo ?? "";
  const linkVenda = nomeMarca && nomeModelo
    ? `/veiculos?${new URLSearchParams({ tipo: tipo === "motorcycles" ? "moto" : "carro", marca: limparMarca(nomeMarca), q: modeloBase(nomeModelo) })}`
    : "/veiculos";

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {([["cars", "Carros e utilitários", "carro"], ["motorcycles", "Motos", "moto"]] as const).map(([t, nome, icone]) => (
          <button key={t} type="button" onClick={() => trocarTipo(t)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, border: "1.5px solid", borderColor: tipo === t ? "#FF6600" : "#E8E6E1", background: tipo === t ? "#FFF5F1" : "#fff", color: tipo === t ? "#FF6600" : "#1A1917", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            <Icone nome={icone} /> {nome}
          </button>
        ))}
      </div>

      <div className="fipe-campos">
        <div>
          <label style={rotulo} htmlFor="fipe-marca">Marca</label>
          <select id="fipe-marca" value={marca} onChange={e => trocarMarca(e.target.value)} style={campo} disabled={!marcas.length}>
            <option value="">{marcas.length ? "Escolha a marca" : "Carregando..."}</option>
            {marcas.map(m => <option key={m.codigo} value={m.codigo}>{limparMarca(m.nome)}</option>)}
          </select>
        </div>
        <div>
          <label style={rotulo} htmlFor="fipe-modelo">Modelo</label>
          <select id="fipe-modelo" value={modelo} onChange={e => trocarModelo(e.target.value)} style={campo} disabled={!marca || !modelos.length}>
            <option value="">{!marca ? "Escolha a marca antes" : modelos.length ? "Escolha o modelo" : "Carregando..."}</option>
            {modelos.map(m => <option key={m.codigo} value={m.codigo}>{limparVersao(m.nome)}</option>)}
          </select>
        </div>
        <div>
          <label style={rotulo} htmlFor="fipe-ano">Ano</label>
          <select id="fipe-ano" value={ano} onChange={e => trocarAno(e.target.value)} style={campo} disabled={!modelo || !anos.length}>
            <option value="">{!modelo ? "Escolha o modelo antes" : anos.length ? "Escolha o ano" : "Carregando..."}</option>
            {anos.map(a => <option key={a.codigo} value={a.codigo}>{a.nome}</option>)}
          </select>
        </div>
      </div>

      {erro && <div style={{ fontSize: 13, color: "#B91C1C" }}><Icone nome="atencao" /> {erro}</div>}
      {carregando && <div style={{ fontSize: 13, color: "#7A7670" }}>Consultando a Tabela FIPE...</div>}
      {semValor && !carregando && <div style={{ fontSize: 13, color: "#7A7670" }}><Icone nome="info" /> A Tabela FIPE ainda não tem preço para esse ano/versão. Escolha outro ano.</div>}

      {valor && (
        <div style={{ background: "#1A1A1A", color: "#fff", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{limparMarca(valor.marca)} · {limparVersao(valor.modelo)} · {valor.anoModelo === 32000 ? "0 km" : valor.anoModelo} · {valor.combustivel}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#FF6600", lineHeight: 1 }}>{formatarPreco(valor.valor)}</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>Tabela FIPE de <strong style={{ color: "#fff" }}>{valor.mes}</strong> · código FIPE <strong style={{ color: "#fff" }}>{valor.codigoFipe}</strong></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <Link href={linkVenda} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "#FF6600", color: "#fff", borderRadius: 9, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
              <Icone nome="buscar" /> Ver à venda na região
            </Link>
            <Link href="/anunciar" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 9, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
              <Icone nome="mais" /> Anunciar o meu
            </Link>
          </div>
        </div>
      )}
      <div style={{ fontSize: 11.5, color: "#A8A49D", lineHeight: 1.5 }}>
        A Tabela FIPE é o preço médio de mercado calculado pela Fundação Instituto de Pesquisas Econômicas, atualizado todo mês.
        Serve de referência: o preço de cada carro depende do estado, da quilometragem e dos opcionais.
      </div>
    </div>
  );
}
