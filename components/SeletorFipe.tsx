"use client";
import { useEffect, useState } from "react";

import { limparMarca, limparVersao } from "@/lib/nomesVeiculo";

// Escolha do veículo no cadastro do anúncio, pela Tabela FIPE: marca → modelo/versão → ano.
// A página usa a escolha para preencher marca/modelo/versão/ano/combustível do anúncio.
// O valor da FIPE e a comparação com o preço aparecem só para o lojista; no site, o comprador
// vê apenas o selo "Abaixo da FIPE" (quando for o caso).

export type EscolhaFipe = {
  tipo: string; marca: string; modelo: string; ano: string; nome: string;
  // Nomes (já limpos) — só presentes quando o lojista acabou de escolher.
  marcaNome?: string; modeloNome?: string; anoNome?: string;
};

// Marcas mais anunciadas aparecem primeiro na lista.
const POPULARES: Record<string, string[]> = {
  cars: ["Chevrolet", "Volkswagen", "Fiat", "Toyota", "Hyundai", "Honda", "Jeep", "Renault", "Ford", "Nissan"],
  motorcycles: ["Honda", "Yamaha", "Suzuki", "Kawasaki", "BMW"],
};
// `limpo`: nome que vai para o anúncio quando o rótulo da lista precisou de complemento.
type Opcao = { codigo: string; nome: string; limpo?: string };
type Valor = { valor: number; mes: string; modelo: string };
type Lista = { chave: string; opcoes: Opcao[] };

const TIPO_FIPE: Record<string, string> = { carro: "cars", utilitario: "cars", moto: "motorcycles" };
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
// A FIPE abrevia muito ("PREM." = Premier, "SED." = Sedan): a palavra digitada combina se aparece
// no nome ou se começa com uma abreviação dele (3+ letras).
function combina(nome: string, palavra: string) {
  const n = semAcento(nome);
  if (n.includes(palavra)) return true;
  return n.split(/[\s/]+/).some(t => {
    const abrev = t.replace(/\.$/, "");
    return t.endsWith(".") && abrev.length >= 3 && palavra.startsWith(abrev);
  });
}
const reais = (n: number) => `R$ ${n.toLocaleString("pt-BR")}`;

async function carregar<T>(query: string): Promise<T> {
  const r = await fetch(`/api/fipe?${query}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.erro || "Erro na FIPE");
  return j as T;
}

type Props = {
  tipoAnuncio: string;
  marcaSugerida: string;
  preco: number | null;
  inicial: EscolhaFipe | null;
  onChange: (escolha: EscolhaFipe | null) => void;
  onNaoEncontrei: () => void;
};

export default function SeletorFipe({ tipoAnuncio, marcaSugerida, preco, inicial, onChange, onNaoEncontrei }: Props) {
  const tipo = TIPO_FIPE[tipoAnuncio] ?? "cars";
  // Se o tipo do anúncio mudou (carro → moto), a escolha anterior não vale mais.
  const inicialValido = inicial && inicial.tipo === tipo ? inicial : null;
  const [marca, setMarca] = useState(inicialValido?.marca ?? "");
  const [modelo, setModelo] = useState(inicialValido?.modelo ?? "");
  const [ano, setAno] = useState(inicialValido?.ano ?? "");
  const [marcas, setMarcas] = useState<Lista>({ chave: "", opcoes: [] });
  const [modelos, setModelos] = useState<Lista>({ chave: "", opcoes: [] });
  const [anos, setAnos] = useState<Lista>({ chave: "", opcoes: [] });
  const [valor, setValor] = useState<{ chave: string; dado: Valor | null }>({ chave: "", dado: null });
  const [erro, setErro] = useState("");
  const [filtroModelo, setFiltroModelo] = useState("");

  const chaveMarcas = tipo;
  const chaveModelos = marca ? `${tipo}|${marca}` : "";
  const chaveAnos = marca && modelo ? `${tipo}|${marca}|${modelo}` : "";
  const chaveValor = marca && modelo && ano ? `${tipo}|${marca}|${modelo}|${ano}` : "";

  useEffect(() => {
    let cancelado = false;
    carregar<{ opcoes: Opcao[] }>(`tipo=${tipo}`).then(({ opcoes }) => {
      if (cancelado) return;
      const nomes = opcoes.map(o => limparMarca(o.nome));
      // Duas marcas da FIPE com o mesmo nome limpo ("Caoa Chery" e "Caoa Chery/Chery"): o rótulo
      // mostra o nome original para dar para diferenciar.
      const limpas: Opcao[] = opcoes.map((o, i) => nomes.indexOf(nomes[i]) !== nomes.lastIndexOf(nomes[i])
        ? { codigo: o.codigo, nome: `${nomes[i]} (${o.nome})`, limpo: nomes[i] }
        : { codigo: o.codigo, nome: nomes[i] })
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      setMarcas({ chave: chaveMarcas, opcoes: limpas });
      // Editando anúncio antigo (sem FIPE): já deixa marcada a marca dele, se existir na FIPE.
      if (!inicialValido && marcaSugerida) {
        const achada = limpas.find(o => semAcento(o.limpo ?? o.nome) === semAcento(marcaSugerida));
        if (achada) setMarca(m => m || achada.codigo);
      }
    }).catch(e => !cancelado && setErro(e.message));
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só recarrega quando o tipo muda
  }, [chaveMarcas]);

  useEffect(() => {
    if (!chaveModelos) return;
    let cancelado = false;
    carregar<{ opcoes: Opcao[] }>(`tipo=${tipo}&marca=${marca}`)
      .then(({ opcoes }) => !cancelado && setModelos({ chave: chaveModelos, opcoes: opcoes.map(o => ({ codigo: o.codigo, nome: limparVersao(o.nome) })) }))
      .catch(e => !cancelado && setErro(e.message));
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveModelos]);

  useEffect(() => {
    if (!chaveAnos) return;
    let cancelado = false;
    carregar<{ opcoes: Opcao[] }>(`tipo=${tipo}&marca=${marca}&modelo=${modelo}`)
      .then(({ opcoes }) => !cancelado && setAnos({ chave: chaveAnos, opcoes }))
      .catch(e => !cancelado && setErro(e.message));
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveAnos]);

  useEffect(() => {
    if (!chaveValor) return;
    let cancelado = false;
    carregar<{ valor: Valor | null }>(`tipo=${tipo}&marca=${marca}&modelo=${modelo}&ano=${ano}`)
      .then(({ valor }) => !cancelado && setValor({ chave: chaveValor, dado: valor }))
      .catch(e => !cancelado && setErro(e.message));
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveValor]);

  // Listas só valem para a seleção atual (evita mostrar modelos da marca anterior).
  const listaMarcas = marcas.chave === chaveMarcas ? marcas.opcoes : [];
  const listaModelos = modelos.chave === chaveModelos ? modelos.opcoes : [];
  const listaAnos = anos.chave === chaveAnos ? anos.opcoes : [];
  const dadoValor = valor.chave === chaveValor ? valor.dado : null;
  const populares = listaMarcas.filter(o => POPULARES[tipo]?.includes(o.nome));
  // Filtro do modelo: todas as palavras digitadas precisam aparecer ("onix premier").
  const palavras = semAcento(filtroModelo).split(/\s+/).filter(Boolean);
  const modelosFiltrados = palavras.length
    ? listaModelos.filter(o => palavras.every(p => combina(o.nome, p)))
    : listaModelos;

  function avisar(m: string, mo: string, a: string) {
    if (!m || !mo || !a) return onChange(null);
    const opcaoMarca = listaMarcas.find(o => o.codigo === m);
    const nomeMarca = opcaoMarca?.limpo ?? opcaoMarca?.nome ?? "";
    const nomeModelo = listaModelos.find(o => o.codigo === mo)?.nome ?? inicialValido?.nome ?? "";
    const nomeAno = listaAnos.find(o => o.codigo === a)?.nome ?? "";
    onChange({ tipo, marca: m, modelo: mo, ano: a, nome: [nomeMarca, nomeModelo, nomeAno].filter(Boolean).join(" · "), marcaNome: nomeMarca, modeloNome: nomeModelo, anoNome: nomeAno });
  }

  const escolherMarca = (v: string) => { setMarca(v); setModelo(""); setAno(""); setFiltroModelo(""); setErro(""); avisar(v, "", ""); };
  const escolherModelo = (v: string) => { setModelo(v); setAno(""); setErro(""); avisar(marca, v, ""); };
  const escolherAno = (v: string) => { setAno(v); setErro(""); avisar(marca, modelo, v); };

  const select = { width: "100%", padding: "9px 12px", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, color: "#1A1917", background: "#fff", outline: "none", boxSizing: "border-box" as const };
  const label = { fontSize: 12, fontWeight: 500, color: "#1A1917", marginBottom: 5, display: "block" } as const;

  const diferenca = dadoValor && preco ? preco - dadoValor.valor : null;
  const pct = dadoValor && diferenca !== null ? Math.round((Math.abs(diferenca) / dadoValor.valor) * 100) : 0;

  return (
    <div style={{ border: "1.5px solid #E8E6E1", borderRadius: 10, padding: 14, background: "#F7F6F3" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>🔎 Qual é o veículo? <span style={{ fontWeight: 500, color: "#7A7670" }}>(Tabela FIPE)</span></div>
      <div style={{ fontSize: 12, color: "#7A7670", lineHeight: 1.5, marginBottom: 12 }}>
        Escolha marca, modelo e ano: preenchemos o resto para você. Se o seu preço ficar <strong>abaixo da FIPE</strong>,
        o anúncio ganha o selo <strong>“💰 Abaixo da FIPE”</strong>. O valor da FIPE <strong>não aparece para o comprador</strong>.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <div>
          <label style={label}>Marca (FIPE)</label>
          <select value={marca} onChange={e => escolherMarca(e.target.value)} style={select}>
            <option value="">{listaMarcas.length ? "Selecione" : "Carregando..."}</option>
            {populares.length > 0 && (
              <optgroup label="Mais comuns">
                {populares.map(o => <option key={`p${o.codigo}`} value={o.codigo}>{o.nome}</option>)}
              </optgroup>
            )}
            <optgroup label="Todas as marcas">
              {listaMarcas.map(o => <option key={o.codigo} value={o.codigo}>{o.nome}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label style={label}>Modelo e versão (FIPE)</label>
          {marca && listaModelos.length > 8 && (
            <input value={filtroModelo} onChange={e => setFiltroModelo(e.target.value)} placeholder="Digite para filtrar (ex.: onix premier)"
              style={{ ...select, marginBottom: 6, background: "#FFFDF9" }} />
          )}
          <select value={modelo} onChange={e => escolherModelo(e.target.value)} disabled={!marca} style={{ ...select, opacity: marca ? 1 : 0.6 }}>
            <option value="">{!marca ? "Escolha a marca" : !listaModelos.length ? "Carregando..." : palavras.length ? `${modelosFiltrados.length} encontrado(s) — selecione` : "Selecione"}</option>
            {modelo && !modelosFiltrados.some(o => o.codigo === modelo) && listaModelos.filter(o => o.codigo === modelo).map(o => <option key={o.codigo} value={o.codigo}>{o.nome}</option>)}
            {modelosFiltrados.map(o => <option key={o.codigo} value={o.codigo}>{o.nome}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Ano e combustível (FIPE)</label>
          <select value={ano} onChange={e => escolherAno(e.target.value)} disabled={!modelo} style={{ ...select, opacity: modelo ? 1 : 0.6 }}>
            <option value="">{!modelo ? "Escolha o modelo" : listaAnos.length ? "Selecione" : "Carregando..."}</option>
            {listaAnos.map(o => <option key={o.codigo} value={o.codigo}>{o.nome}</option>)}
          </select>
        </div>
      </div>

      {erro && <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 10 }}>{erro}</div>}

      {chaveValor && !dadoValor && !erro && <div style={{ fontSize: 12, color: "#7A7670", marginTop: 12 }}>Consultando a FIPE...</div>}

      {dadoValor && (
        <div style={{ marginTop: 12, background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#1A1917", lineHeight: 1.5 }}>
          <div>FIPE ({dadoValor.mes}): <strong>{reais(dadoValor.valor)}</strong></div>
          {diferenca === null ? (
            <div style={{ color: "#7A7670", fontSize: 12 }}>Preencha o preço para comparar.</div>
          ) : diferenca < 0 ? (
            <div style={{ color: "#15803D", fontSize: 12.5, fontWeight: 600 }}>✅ Seu preço está {reais(-diferenca)} ({pct}%) abaixo da FIPE — o anúncio vai ganhar o selo 💰 Abaixo da FIPE.</div>
          ) : (
            <div style={{ color: "#7A7670", fontSize: 12.5 }}>
              Seu preço está {diferenca === 0 ? "igual à FIPE" : `${reais(diferenca)} (${pct}%) acima da FIPE`}. Isso fica só entre nós: o comprador não vê.
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={() => { setMarca(""); setModelo(""); setAno(""); onChange(null); onNaoEncontrei(); }}
        style={{ marginTop: 10, background: "none", border: "none", padding: 0, fontSize: 12, color: "#7A7670", textDecoration: "underline", cursor: "pointer" }}>
        Não encontrei meu veículo na lista
      </button>
    </div>
  );
}
