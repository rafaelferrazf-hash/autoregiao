import Link from "next/link";
import { EMAIL_CONTATO } from "@/lib/site";
import LinkDiagnostico from "@/components/LinkDiagnostico";

// Rodapé das páginas públicas: links + aviso de que a AutoRegião só divulga anúncios.
export default function Rodape() {
  const link = { color: "#7A7670", textDecoration: "none" } as const;
  return (
    <footer style={{ borderTop: "1px solid #E8E6E1", marginTop: 32, padding: "20px 16px 24px", textAlign: "center", fontSize: 12, color: "#7A7670" }}>
      <div className="toque-facil" style={{ display: "flex", columnGap: 16, rowGap: 0, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <span>© {new Date().getFullYear()} <span style={{ color: "#FF6600" }}>AutoRegião</span></span>
        <Link href="/veiculos" style={link}>Buscar veículos</Link>
        <Link href="/favoritos" style={link}>Favoritos</Link>
        <Link href="/lojas" style={link}>Lojas</Link>
        <Link href="/tabela-fipe" style={link}>Tabela FIPE</Link>
        <Link href="/anunciar" style={link}>Anunciar</Link>
        <Link href="/termos" style={link}>Termos de Uso</Link>
        <Link href="/privacidade" style={link}>Política de Privacidade</Link>
        <LinkDiagnostico estilo={link} />
        <a href={`mailto:${EMAIL_CONTATO}`} style={link}>{EMAIL_CONTATO}</a>
      </div>
      <p style={{ maxWidth: 720, margin: "0 auto", fontSize: 11, lineHeight: 1.5, color: "#A8A49D" }}>
        A AutoRegião é um espaço de divulgação: não vende veículos nem intermedeia pagamentos. As informações de cada
        anúncio são de responsabilidade do anunciante, e a negociação é feita diretamente entre comprador e vendedor.
        Antes de fechar negócio, veja o veículo pessoalmente e confira a documentação.
      </p>
    </footer>
  );
}
