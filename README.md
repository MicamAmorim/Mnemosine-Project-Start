# MNEMOSINE // ARQUIVO ZERO

Gerador de casos investigativos com criptografia, códigos, percepção visual, cartas PnP e reconstrução de cena.

## Abrir localmente

Abra `03_Gerador/Gerador_Casos_Mnemosine.html` em Edge/Chrome. Para `GERAR PACK` e salvar casos diretamente em pastas, selecione a pasta raiz do projeto quando o navegador solicitar.

## Vercel

O projeto é estático e está preparado para Vercel. Importe este repositório em **Add New > Project**, mantenha **Framework Preset: Other** e não configure comando de build. `index.html` encaminha para o gerador.

Em `https://` o gerador lê os assets publicados em `04_Assets` sem exigir uma cópia local. O botão **GERAR PACK** continua usando a File System Access API do Edge/Chrome para gravar `01_Documentos` e `02_Casos` no computador do usuário. Navegadores sem essa API ainda podem usar o gerador/HTML, mas não gravar automaticamente na estrutura de pastas.

## Estrutura

- `01_Documentos/`: PDFs-base reconstruídos por **GERAR PACK**.
- `02_Casos/`: casos salvos pelo gerador (PDF + JSON; PNG extra quando houver esteganografia LSB).
- `03_Gerador/`: gerador, guia de métodos e analisador LSB.
- `04_Assets/`: imagens e identidade visual.

## Técnicas

As técnicas essenciais vêm marcadas por padrão. As avançadas estão implementadas, mas desmarcadas: Pigpen, Scytale, Base64, Hex/ASCII, substituição monoalfabética, transposição colunar, Book cipher, Grade de Cardan e esteganografia LSB.
