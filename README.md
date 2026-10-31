# MNEMOSINE // ARQUIVO ZERO

Gerador de **casos de investigação cifrada** para imprimir e jogar (Print & Play): dossiês com evidências, 30 cartas, quadro de reconstrução, quadro de álibis, gabarito e ficha de dicas do mediador.

## Como usar

1. Abra o gerador (`03_Gerador/Gerador_Casos_Mnemosine.html`, ou o site publicado no Vercel).
2. Escolha a **dificuldade** (Iniciante · Intermediário · Avançado) ou marque as técnicas uma a uma.
3. Clique em **Gerar caso**; confira a pré-visualização (é o mesmo desenho do PDF final).
4. **Baixar PDF do caso** (300 DPI) e **Gerar PACK** (cartas, referência técnica, manual do mediador etc.).
5. Imprima a **100 %** (sem "ajustar à página"). Para cartas em gráfica use `07_Cartas_Para_Grafica_Sangria_3mm.pdf`.

A mesma *seed* com as mesmas opções gera sempre o mesmo caso. **Copiar link do caso** compartilha a configuração exata.

## O que há na v3.0

- **Impressão:** PDF em 300 DPI, cabeçalho compacto, tipografia real (Courier Prime, Libre Baskerville, Special Elite), papel com textura, carimbos, *skins* por técnica (telegrama, terminal, osciloscópio, polaroide, planta, relatório contínuo, linha do tempo, livro, Cardan), **modo econômico P&B** e cartas **sem deformação**, com versão para gráfica (sangria de 3 mm, `TrimBox`/`BleedBox`).
- **Jogo:** camada dedutiva (quadro de álibis com falso suspeito), código de verificação **único** para cada uma das 15.625 soluções, ficha de dicas em 3 níveis, mapa por trajetória em que o trajeto é obrigatório, chaves e deslocamentos variáveis por caso, narrativa de caso variável por seed.
- **Site:** novo visual, presets, progresso, avisos sem `alert()`, acessível por teclado, responsivo, e **download com fallback em ZIP** (funciona em Firefox, Safari e celular). A gravação em pastas (File System Access API) continua opcional no Chrome/Edge.
- **Engenharia:** código-fonte legível (fim do bundle gzip+base64), lógica pura testável, testes automatizados e CI.

Veja o [CHANGELOG](CHANGELOG.md) para o detalhe, incluindo mudanças que exigem **reimpressão das cartas**.

## Estrutura

```
01_Documentos/   PDFs-base (gerados pelo PACK; não versionados)
02_Casos/        casos salvos (PDF + JSON + anexos); não versionados
03_Gerador/      gerador, guia de métodos e analisador LSB (ver 03_Gerador/README.md)
04_Assets/       imagens e identidade visual
tests/           testes automatizados
```

## Desenvolvimento

```bash
npm install     # instala node-canvas e jsdom (apenas para testes)
npm test        # lógica (fuzz de 2.000 seeds), renderização (23 técnicas × 30 respostas) e UI
npx serve .     # servidor local (o gerador também abre direto do disco)
```

Não há etapa de build: o Vercel serve a raiz do repositório como site estático (`vercel.json` não define comando de build).

## Licenças

Código e conteúdo do projeto: todos os direitos reservados ao autor. Fontes em `03_Gerador/fonts/`: Courier Prime e Libre Baskerville (SIL OFL 1.1), Special Elite (Apache 2.0); licenças na mesma pasta.
O material é **ficcional e educacional**; não representa órgão ou documento oficial.
