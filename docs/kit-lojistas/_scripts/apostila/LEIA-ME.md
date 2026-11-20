# Gerador das apostilas (PDF)

Transforma os `.md` de `docs/kit-lojistas/` nas apostilas em PDF: capa, Sumário e Apresentação (sem número de
página), e o conteúdo com o logo no topo e "página X de Y" no rodapé.

## O que precisa
- Python 3 com `markdown` e `pymupdf` (`pip install --target <pasta-libs> markdown pymupdf`, ou instalado normal).
- Node 22+ e o Microsoft Edge (o Edge "imprime" o HTML em PDF, sem abrir janela).

## Arquivos
- `apostila.py`: monta tudo. Capa usa `docs/kit-lojistas/_scripts/capa-carros.jpg` e os logos do projeto.
- `telas.py`: troca as linhas `<!-- TELA arquivo.png | y0-y1 | legenda | 1:x,y,w,h; ... -->` pelos prints com
  marcações numeradas. Usa os recortes já salvos em `docs/kit-lojistas/prints/`. Só recorta de novo se o print
  original (tela inteira) estiver em `prints-originais/` aqui nesta pasta.
- `imprimir.mjs`: abre o Edge escondido e salva o PDF.
- Os arquivos intermediários vão para a pasta temporária do Windows (`%TEMP%\apostila-autoregiao`).

## Comandos (rodar nesta pasta; `<libs>` = pasta das bibliotecas Python, ou `.` se instaladas normalmente)
```
python -I apostila.py <libs> ../../TREINAMENTO-VENDAS.md ../../TREINAMENTO-VENDAS.pdf 1 "Treinamento de vendas" "Como apresentar, convencer e fechar com o lojista" --sumario --apresentacao=../../APRESENTACAO-TREINAMENTO.md
python -I apostila.py <libs> ../../MENSAGENS-E-ROTEIRO.md ../../MENSAGENS-E-ROTEIRO.pdf 2 "Mensagens e roteiro de visita" "O que falar no WhatsApp e na loja" --sumario --apresentacao=../../APRESENTACAO-MENSAGENS.md
python -I apostila.py <libs> ../../CADASTRO-LOJA-E-VEICULOS.md ../../CADASTRO-LOJA-E-VEICULOS.pdf 4 "Cadastro da loja e dos veículos" "Passo a passo, com prints, para o lojista criar a conta e anunciar os carros" --sumario --apresentacao=../../APRESENTACAO-CADASTRO.md
```
A Apostila 3 (`docs/ROTEIRO-LANCAMENTO.md`) foi gerada sem Sumário/Apresentação.

## Folha avulsa (Sumário + Apresentação, frente e verso)
São as páginas 2 e 3 do PDF. Separar com pymupdf:
`e = pymupdf.open(); e.insert_pdf(pymupdf.open("X.pdf"), from_page=1, to_page=2); e.save("X_FOLHA-...pdf")`

## Cuidados
- Se o conteúdo do `.md` mudar, a numeração das páginas pode mudar: avisar o Rafael antes de reimprimir só uma parte.
- O sumário precisa caber em 1 página e a apresentação também (o script para com erro se passar).
- A data da capa ("Novembro de 2026") está fixa no `apostila.py`.
