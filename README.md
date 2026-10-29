# MNEMOSINE // ARQUIVO ZERO

Gerador offline de casos investigativos para uso em sala de aula, combinando cartas físicas, criptografia, códigos, enigmas perceptivos e reconstrução de ocorrência.

## Como usar

1. Baixe o pack completo com os assets e extraia-o.
2. Abra `03_Gerador/Gerador_Casos_Mnemosine.html` em Edge/Chrome atual.
3. Clique em **Selecionar pasta do projeto** e escolha a pasta raiz extraída.
4. Clique em **GERAR PACK** para criar os documentos-base em `01_Documentos`.
5. Gere um caso e use **Salvar caso em PDF em 02_Casos**.

## Estrutura

- `01_Documentos/`: PDFs-base gerados localmente.
- `02_Casos/`: casos individuais e JSONs de reprodução.
- `02_Audio/`: áudio/painel auxiliar.
- `03_Gerador/`: aplicativo, guia de métodos e módulos JS.
- `04_Assets/`: imagens fixas (distribuídas no pack; não versionadas neste commit inicial).

## Técnicas implementadas

César, A1Z26, acróstico, amostragem periódica, ímpares/pares, Morse visual + áudio, Polybius, coordenadas, Vigenère com chave derivada, binário, posições primas, sequência temporal, ruído visual e ocultação por canais de cor.

Toda técnica que exija palavra-passe deve receber a chave por um **Fragmento K** anterior; a palavra-passe nunca é entregue diretamente.

## Técnicas avançadas / roadmap

Pigpen, Scytale, Base64, hexadecimal/ASCII, substituição monoalfabética, transposição colunar, book cipher, grade de Cardan e esteganografia em imagem.

## Fonte única de renderização

A partir da v2.2, os PDFs-base e os casos usam o mesmo motor Canvas/PDF no navegador. Isso evita divergências entre gráficos mostrados no gerador e gráficos impressos.

## Assets

Os assets binários não estão no commit inicial para manter o repositório leve. Copie a pasta `04_Assets` do pack completo para a raiz do projeto.
