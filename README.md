# MNEMOSINE // ARQUIVO ZERO v2.2

Gerador offline de casos investigativos para uso em sala de aula.

## Fluxo recomendado

1. Extraia o pack completo.
2. Abra `03_Gerador/Gerador_Casos_Mnemosine.html` no Edge/Chrome.
3. Clique em **Selecionar pasta do projeto** e escolha a pasta raiz.
4. Clique em **GERAR PACK** para criar/atualizar `01_Documentos` usando o mesmo motor de renderização dos casos.
5. Gere casos e salve-os em `02_Casos`.

## Estrutura

- `01_Documentos/` — gerada pelo próprio app; não é fonte de verdade.
- `02_Casos/` — PDFs/JSONs de casos gerados.
- `03_Gerador/` — aplicação e módulos JS.
- `04_Assets/` — imagens fixas; fornecidas no ZIP completo, mas omitidas do GitHub para manter o repositório leve.

## Técnicas implementadas por padrão

César, A1Z26, acróstico, amostragem periódica, ímpares/pares, Morse visual + áudio, Polybius, coordenadas, Vigenère com palavra-passe derivada por Fragmento K, binário, posições primas, sequência temporal, ruído visual e ocultação por canais de cor.

## Técnicas avançadas / roadmap

Pigpen, Scytale, Base64, hexadecimal/ASCII, substituição monoalfabética, transposição colunar, book cipher, grade de Cardan e esteganografia em imagem.

## Regra de chave

Nenhuma técnica que exija palavra-passe recebe a chave diretamente. A chave deve vir de um Fragmento K anterior, mais simples.

## v2.2

- botão **GERAR PACK**;
- PDFs-base e casos usando a mesma fonte de renderização;
- nomes estáveis dos documentos para evitar links quebrados;
- pasta `02_Casos` para organização dos casos;
- listagem de casos gerados;
- ocultação por canais de cor refeita com dithering estatístico;
- técnicas avançadas listadas, mas desmarcadas por padrão;
- assets ficam fora do commit principal e dentro do ZIP distribuído.
