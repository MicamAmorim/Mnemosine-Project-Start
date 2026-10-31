# Gerador Mnemosine v3.0 — código-fonte

Tudo é HTML/CSS/JS estático e legível (sem bundle, sem etapa de build).

| Arquivo | Papel |
|---|---|
| `Gerador_Casos_Mnemosine.html` + `css/mnemosine.css` | Interface (design system noir, acessível e responsiva) |
| `js/mnemosine_app.js` | UI: presets, pré-visualização, exportações (PDF, ZIP, HTML), link compartilhável |
| `js/mnemosine_data.js` | Baralho de 30 cartas, catálogo de técnicas, RNG determinístico, código de verificação |
| `js/mnemosine_core.js` | **Lógica pura** (roda no Node): 23 técnicas, compatibilidade, geração de caso, álibis, dicas |
| `js/mnemosine_visuals.js` | Imagens dos enigmas de ruído, cor, Pigpen e LSB |
| `js/mnemosine_render.js` | Kit de desenho em **mm** (300 DPI), papel, cabeçalho, layout |
| `js/mnemosine_evidence.js` | Um "skin" visual por família de técnica |
| `js/mnemosine_docs.js` | Dossiê do caso, cartas (folha caseira e arquivo de gráfica), ambientação, referência, mediador |
| `js/mnemosine_pdf.js` | Gravador de PDF (TrimBox/BleedBox, metadados) |
| `js/mnemosine_zip.js` | ZIP sem dependências (fallback de download) |
| `js/mnemosine_fs.js` | File System Access API (opcional, só Chrome/Edge) |
| `js/mnemosine_morse_audio.js` | Áudio e WAV do Morse |
| `fonts/` | Courier Prime, Libre Baskerville, Special Elite (licenças OFL/Apache incluídas) |

`Metodos_Mnemosine.html` é o guia de técnicas e `Analisador_Esteganografia.html` extrai o LSB de um PNG.

Testes: `npm test` na raiz (lógica, renderização e interface).
