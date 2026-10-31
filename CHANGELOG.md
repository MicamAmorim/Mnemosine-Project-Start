# Changelog

## v3.0.0 — "Arquivo Legível"

### Correções de jogo (quebravam ou vazavam enigmas)
- **Acróstico/coluna oculta** não é mais cortado no PDF: 17 das 30 respostas tinham mais de 11 letras e perdiam o final. O novo layout comporta 24 linhas.
- **Horário não vaza mais em claro:** Vigenère e Scytale (que deixavam "2045" legível) não são mais sorteados para HORÁRIO.
- **Mapa por trajetória** agora mostra as outras cartas de LOCAL como distratores; antes bastava achar a única célula que era nome de carta. Trajetos têm no mínimo 3 passos.
- **Código de verificação único:** os fragmentos de 5 cartas mudaram (P5 `C→T`, I3 `R→E`, M5 `V→L`, R4 `S→E`, R5 `S→N`). Antes havia 4.800 códigos para 15.625 soluções. **Reimprima as cartas.** O texto agora diz "código", não "palavra".
- **Posições primas:** removida a letra de ruído extra que podia aparecer no fim da leitura.
- **Casos de exemplo** usam a mesma geração do gerador (antes mostravam pares categoria/técnica impossíveis).
- César com deslocamento variável por caso (antes sempre +3); banco de 40 chaves (antes 6); *Book cipher* sem vazamento de vocabulário.
- Ruído visual recalibrado (as 150 linhas brancas escondiam o texto) e canais de cor menos legíveis a olho nu.
- ID do caso por hash da seed (sem colisões nem `DICC-AZ--ARQUIVO`); mesmo ID em cabeçalho e rodapé.

### Novidades
- Camada dedutiva: **quadro de álibis** com falso suspeito; **ficha de dicas** em 3 níveis e sugestão de pontuação no gabarito.
- Presets de dificuldade; metadados de caso (agente, data, protocolo, classificação) por seed.
- **Impressão:** 300 DPI, layout por fluxo em milímetros, cabeçalho de ~35 mm (antes ~125 mm), fontes mínimas de 8–9 pt no corpo, textura de papel real, *skins* por técnica, modo econômico, cartas com recorte sem distorção e arquivo de gráfica com sangria de 3 mm.
- **Site:** novo design system, progresso real, acessibilidade (rótulos, foco, `aria-live`), link compartilhável, fallback de download em ZIP (PDF, kit e PACK) sem File System Access API.
- Referência técnica e manual do mediador reescritos para a v3.0; guia de métodos atualizado.

### Engenharia
- Fim do bundle gzip+base64: HTML/CSS/JS legíveis; removidos `build-static.mjs`, `generator_bundle/` e código morto (`paper_bg.png`).
- `mnemosine_core.js` (lógica pura) separado da renderização; testes de ida e volta por técnica, fuzz de 2.000 seeds, layout de 23 técnicas × 30 respostas, PDF/ZIP e fumaça da UI; CI no GitHub Actions.
- `vercel.json` sem etapa de build e com cache adequado (antes `no-store` em tudo).

## v2.4 e anteriores
- v2.4: acróstico por coluna oculta e mapa por trajetória codificada.
- v2.3: Morse com quebra física; Quadro de Reconstrução no A4 paisagem; técnicas avançadas (Pigpen, Scytale, Base64, Hex/ASCII, monoalfabética, colunar, Book cipher, Cardan, LSB); Fragmento K; analisador LSB; hospedagem estática no Vercel.
- v2.2: GERAR PACK, documentos-base e casos pelo mesmo motor, pasta `02_Casos`, canais de cor refeitos.
