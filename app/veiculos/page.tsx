"use client";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buscarVeiculosFiltrados, opcoesDeFiltro } from "@/lib/dados/veiculos";
import { formatarPreco, formatarKm } from "@/lib/formatar";
import BarraBusca, { ANOS } from "@/components/BarraBusca";
import { lerFiltros, filtrosParaQuery, temFiltroAtivo, paraNumero, type Filtros, type Ordem, type TipoVeiculo } from "@/lib/busca";
import type { VeiculoComLoja } from "@/lib/tipos";

type Opcoes = Awaited<ReturnType<typeof opcoesDeFiltro>>;


// useSearchParams exige uma fronteira de Suspense no Next 16.
export default function PaginaVeiculos() {
  return (
    <Suspense fallback={null}>
      <Veiculos />
    </Suspense>
  );
}

function Veiculos() {
  const router = useRouter();
  const params = useSearchParams();
  const filtros = lerFiltros(new URLSearchParams(params.toString()));
  const chave = params.toString();

  const [menuAberto, setMenuAberto] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [veiculos, setVeiculos] = useState<VeiculoComLoja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [total, setTotal] = useState(0);
  const [opcoes, setOpcoes] = useState<Opcoes>({ marcas: [], cidades: [], cambios: [], combustiveis: [] });
  // Rascunho: o que o visitante está digitando antes de clicar em Buscar/Aplicar.
  const [rascunho, setRascunho] = useState<Filtros>(filtros);

  useEffect(() => { opcoesDeFiltro().then(setOpcoes); }, []);

  // URL mudou (busca, voltar do navegador): formulário acompanha e a lista recarrega.
  const [chaveAnterior, setChaveAnterior] = useState(chave);
  if (chave !== chaveAnterior) {
    setChaveAnterior(chave);
    setRascunho(filtros);
    setCarregando(true);
  }

  useEffect(() => {
    buscarVeiculosFiltrados(lerFiltros(new URLSearchParams(chave))).then(({ veiculos, total, error }) => {
      setErro(!!error);
      setVeiculos(error ? [] : veiculos);
      setTotal(error ? 0 : total);
      setCarregando(false);
    });
  }, [chave]);

  const aplicar = (f: Filtros) => {
    setFiltrosAbertos(false);
    router.push(`/veiculos${filtrosParaQuery(f)}`, { scroll: false });
  };
  const muda = (campo: keyof Filtros, valor: string) => setRascunho(r => ({ ...r, [campo]: valor || undefined }));
  const mudaNumero = (campo: keyof Filtros, valor: string) => setRascunho(r => ({ ...r, [campo]: paraNumero(valor) }));

  const estiloSelect = { width: "100%", padding: "8px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13, color: "#1A1917", background: "#F7F6F3", outline: "none" } as const;
  const estiloTitulo = { fontSize: 11, fontWeight: 600, color: "#7A7670", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 } as const;

  // Mesmo formulário na lateral (computador) e no painel que abre no celular.
  const formularioFiltros = (
    <>
      {([
        ["Marca", "marca", opcoes.marcas, "Todas"],
        ["Câmbio", "cambio", opcoes.cambios, "Qualquer"],
        ["Combustível", "combustivel", opcoes.combustiveis, "Qualquer"],
      ] as [string, keyof Filtros, string[], string][]).map(([titulo, campo, lista, vazio]) => (
        <div key={campo} style={{ marginBottom: 16 }}>
          <div style={estiloTitulo}>{titulo}</div>
          <select value={(rascunho[campo] as string) ?? ""} onChange={e => muda(campo, e.target.value)} style={estiloSelect}>
            <option value="">{vazio}</option>
            {lista.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      ))}
      <div style={{ marginBottom: 16 }}>
        <div style={estiloTitulo}>Ano</div>
        <select value={rascunho.ano_min ?? ""} onChange={e => mudaNumero("ano_min", e.target.value)} style={estiloSelect}>
          {ANOS.map(([v, rotulo]) => <option key={v} value={v}>{rotulo}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={estiloTitulo}>Faixa de preço (R$)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input inputMode="numeric" placeholder="Mín" value={rascunho.preco_min ?? ""} onChange={e => mudaNumero("preco_min", e.target.value)} style={{ ...estiloSelect, padding: "8px 10px", boxSizing: "border-box" }} />
          <input inputMode="numeric" placeholder="Máx" value={rascunho.preco_max ?? ""} onChange={e => mudaNumero("preco_max", e.target.value)} style={{ ...estiloSelect, padding: "8px 10px", boxSizing: "border-box" }} />
        </div>
      </div>
      <button onClick={() => aplicar(rascunho)} style={{ width: "100%", padding: "10px", background: "#E85D26", color: "#fff", border: "none", borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Aplicar filtros</button>
      {temFiltroAtivo(filtros) && (
        <button onClick={() => aplicar({ tipo: filtros.tipo, ordem: filtros.ordem })} style={{ width: "100%", padding: "8px", background: "transparent", color: "#7A7670", border: "none", fontSize: 12, cursor: "pointer", marginTop: 8 }}>Limpar filtros</button>
      )}
    </>
  );

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F3", minHeight: "100vh" }}>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile { display: none !important; }
        .content-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; }
        .cars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .filtros-sidebar { display: block; }
        .filtros-mobile-btn { display: none !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
          .content-grid { grid-template-columns: 1fr !important; }
          .cars-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .filtros-sidebar { display: none !important; }
          .filtros-mobile-btn { display: flex !important; }
        }
        @media (max-width: 480px) {
          .cars-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E8E6E1" }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="AutoRegião" width={32} height={32} style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1A1917" }}>
              <span style={{ color: "#E85D26" }}>Auto</span>Região
            </span>
          </Link>
          <div style={{ display: "flex", gap: 24 }} className="nav-desktop">
            {[["Buscar veículos", "/veiculos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#7A7670", fontSize: 13.5, fontWeight: 500 }}>{item}</Link>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }} className="nav-desktop">
            <Link href="/login" style={{ padding: "7px 16px", border: "1.5px solid #E8E6E1", borderRadius: 7, background: "transparent", fontSize: 13, fontWeight: 500, color: "#1A1917", textDecoration: "none", display: "flex", alignItems: "center" }}>Entrar</Link>
            <Link href="/cadastro" style={{ padding: "7px 16px", background: "#E85D26", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center" }}>Cadastrar loja</Link>
          </div>
          <button className="nav-mobile" onClick={() => setMenuAberto(!menuAberto)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, opacity: menuAberto ? 0 : 1 }}></span>
            <span style={{ display: "block", width: 24, height: 2, background: "#1A1917", borderRadius: 2, transition: "all 0.2s", transform: menuAberto ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
          </button>
        </div>
        {menuAberto && (
          <div className="nav-mobile" style={{ borderTop: "1px solid #E8E6E1", background: "#fff", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Buscar veículos", "/veiculos"], ["Anunciar", "/anunciar"]].map(([item, href]) => (
              <Link key={item} href={href} style={{ textDecoration: "none", color: "#1A1917", fontSize: 15, fontWeight: 500 }}>{item}</Link>
            ))}
            <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
              <Link href="/login" style={{ flex: 1, padding: "10px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 14, fontWeight: 500, color: "#1A1917", textDecoration: "none", textAlign: "center" }}>Entrar</Link>
              <Link href="/cadastro" style={{ flex: 1, padding: "10px", background: "#E85D26", borderRadius: 7, color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none", textAlign: "center" }}>Cadastrar loja</Link>
            </div>
          </div>
        )}
      </nav>

      <BarraBusca filtros={filtros} cidades={opcoes.cidades} onBuscar={aplicar} />

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px" }}>

        <button className="filtros-mobile-btn" onClick={() => setFiltrosAbertos(!filtrosAbertos)}
          style={{ width: "100%", padding: "10px", background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#1A1917", cursor: "pointer", marginBottom: 12, alignItems: "center", justifyContent: "center", gap: 8 }}>
          🔧 {filtrosAbertos ? "Fechar filtros" : "Filtrar veículos"}
        </button>

        {filtrosAbertos && (
          <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "18px", marginBottom: 14 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Filtros</div>
            {formularioFiltros}
          </div>
        )}

        <div className="content-grid">

          {/* FILTROS DESKTOP */}
          <aside className="filtros-sidebar">
            <div style={{ background: "#fff", border: "1.5px solid #E8E6E1", borderRadius: 12, padding: "18px", marginBottom: 14 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#1A1917", marginBottom: 16 }}>Filtros</div>
              {formularioFiltros}
            </div>
            {/* "Criar alerta" escondido até existir serviço de e-mail próprio (pendente, não esquecer). */}
          </aside>

          {/* LISTA */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 800, color: "#1A1917" }}>
                  {carregando ? "..." : total}
                </span>
                <span style={{ fontSize: 12, color: "#7A7670", marginLeft: 6 }}>
                  {carregando ? "carregando..." : `veículo${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
                </span>
              </div>
              <select value={filtros.ordem ?? "recentes"} onChange={e => aplicar({ ...filtros, ordem: e.target.value as Ordem })} style={{ padding: "6px 12px", border: "1.5px solid #E8E6E1", borderRadius: 7, fontSize: 13, color: "#1A1917", background: "#fff", outline: "none" }}>
                <option value="recentes">Mais recentes</option>
                <option value="menor_preco">Menor preço</option>
                <option value="maior_preco">Maior preço</option>
                <option value="menor_km">Menor km</option>
              </select>
            </div>

            {carregando ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1.5px solid #E8E6E1" }}>
                    <div style={{ height: 150, background: "#F7F6F3" }}></div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ height: 14, background: "#F7F6F3", borderRadius: 4, marginBottom: 8 }}></div>
                      <div style={{ height: 10, background: "#F7F6F3", borderRadius: 4, width: "60%" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : veiculos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1.5px solid #E8E6E1" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#1A1917", marginBottom: 6 }}>{erro ? "Não foi possível buscar agora" : "Nenhum veículo encontrado"}</div>
                <div style={{ fontSize: 13, color: "#7A7670" }}>{erro ? "Tente de novo em instantes." : temFiltroAtivo(filtros) ? "Tente ajustar ou limpar os filtros." : "Volte mais tarde."}</div>
              </div>
            ) : (
              <div className="cars-grid">
                {veiculos.map(car => (
                  <Link key={car.id} href={`/veiculo/${car.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: car.destaque ? "1.5px solid #E85D26" : "1.5px solid #E8E6E1", position: "relative" }}>
                      {car.destaque && <span style={{ position: "absolute", top: 8, left: 8, background: "#E85D26", color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 20, zIndex: 2 }}>⭐ Destaque</span>}
                      <div style={{ position: "relative", height: 150, width: "100%", background: "#F7F6F3" }}>
                        {car.fotos && car.fotos.length > 0 ? (
                          <img src={car.fotos[0]} alt={car.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Image src="/sem-foto.png" alt={car.nome} fill style={{ objectFit: "cover" }} sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw" />
                        )}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1A1917", marginBottom: 4 }}>{car.nome}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
                          {[car.ano, formatarKm(car.km), car.combustivel].filter(Boolean).map(tag => (
                            <span key={tag} style={{ fontSize: 10, color: "#7A7670", background: "#F7F6F3", padding: "2px 5px", borderRadius: 4 }}>{tag}</span>
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #E8E6E1" }}>
                          <div>
                            <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, color: "#1A1917" }}>{formatarPreco(car.preco)}</div>
                          </div>
                        </div>
                        {car.lojas && (
                          <div style={{ fontSize: 10.5, color: "#7A7670", marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                            <span style={{ width: 5, height: 5, background: "#E85D26", borderRadius: "50%", display: "inline-block", flexShrink: 0 }}></span>
                            {car.lojas.nome} · {car.lojas.cidade}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}