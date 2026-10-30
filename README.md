# MNEMOSINE // ARQUIVO ZERO v2.2

## Início rápido
1. Extraia esta pasta inteira.
2. Abra `03_Gerador/Gerador_Casos_Mnemosine.html` no Microsoft Edge ou Google Chrome atual.
3. Clique em **Selecionar pasta do projeto** e escolha a pasta raiz `Mnemosine_ArquivoZero_v2.2_Completo`.
4. Clique em **GERAR PACK**. O gerador cria/atualiza automaticamente `01_Documentos` com:
   - Dossiê de Ambientação
   - Casos de Exemplo
   - Cartas PnP + Quadro de Reconstrução
   - Arquivo de Referência Técnica
   - Manual do Mediador
   - Modelo de Caso em Branco
5. Gere um caso e clique em **Salvar PDF em 02_Casos**. O PDF e um JSON de reprodução ficam organizados nessa pasta.

## Importante
- Os PDFs-base não vêm pré-gerados: o próprio gerador é a fonte única de renderização.
- Os arquivos de `01_Documentos` usam nomes estáveis, sem número de versão, evitando links quebrados.
- O Morse continua interativo no HTML e é convertido para evidência visual no PDF.
- A ocultação por canais de cor usa dithering vermelho/ciano de baixo contraste; para recuperar a palavra, isole o canal vermelho/filtro equivalente.
- Técnicas avançadas aparecem no gerador como roadmap e ficam desmarcadas/desabilitadas por padrão.

## Técnicas implementadas
César; A1Z26; acróstico; amostragem periódica; ímpares/pares; Morse visual + áudio; Polybius; coordenadas; Vigenère com Fragmento K; binário; posições primas; sequência temporal; ruído visual; ocultação por canais de cor.

## Técnicas avançadas listadas
Pigpen; Scytale; Base64; hexadecimal/ASCII; substituição monoalfabética; transposição colunar; book cipher; grade de Cardan; esteganografia em imagem.

## GitHub
https://github.com/MicamAmorim/Mnemosine-Project-Start
