/* Mnemosine // Arquivo Zero — dados do jogo (v3.0)
 * Baralho fixo de 30 cartas, catálogo de técnicas, RNG determinístico e código de verificação.
 * Funciona no navegador (window.MnemosineData) e no Node (require). */
(function(global){
  const cards={
    pessoa:[
      {id:'P1',name:'Noah Ferraz',asset:'P1_portrait.jpg',frag:'A',role:'TI / ex-aluno de Aurora'},
      {id:'P2',name:'Helena Barros',asset:'P2_portrait.jpg',frag:'S',role:'Gestão administrativa'},
      {id:'P3',name:'Tomás Albuquerque',asset:'P3_portrait.jpg',frag:'C',role:'Curadoria / gestão financeira'},
      {id:'P4',name:'Lígia Sampaio',asset:'P4_portrait.jpg',frag:'N',role:'Jornalista / investigadora externa'},
      {id:'P5',name:'Mateus Diniz',asset:'P5_portrait.jpg',frag:'T',role:'Segurança patrimonial'}
    ],
    local:[
      {id:'L1',name:'Arquivo Central',asset:'L1_arquivo.jpg',frag:'O'},
      {id:'L2',name:'Biblioteca',asset:'L2_biblioteca.jpg',frag:'I'},
      {id:'L3',name:'Laboratório 2',asset:'L3_laboratorio.jpg',frag:'U'},
      {id:'L4',name:'Curadoria',asset:'L4_curadoria.jpg',frag:'T'},
      {id:'L5',name:'Sala de Servidores',asset:'L5_servidores.jpg',frag:'H'}
    ],
    instrumento:[
      {id:'I1',name:'Abridor de cartas',asset:'I1_abridor.jpg',frag:'R'},
      {id:'I2',name:'Estatueta metálica',asset:'I2_estatueta.jpg',frag:'G'},
      {id:'I3',name:'Frasco químico',asset:'I3_frasco.jpg',frag:'E'},
      {id:'I4',name:'Cabo de energia',asset:'I4_cabo.jpg',frag:'A'},
      {id:'I5',name:'Chave inglesa',asset:'I5_chave.jpg',frag:'M'}
    ],
    motivo:[
      {id:'M1',name:'Encobrir fraude',asset:'M1_fraude.jpg',frag:'V'},
      {id:'M2',name:'Recuperar um arquivo',asset:'M2_arquivo.jpg',frag:'O'},
      {id:'M3',name:'Vingança pessoal',asset:'M3_vinganca.jpg',frag:'D'},
      {id:'M4',name:'Silenciar uma testemunha',asset:'M4_testemunha.jpg',frag:'I'},
      {id:'M5',name:'Sabotar o projeto',asset:'M5_sabotagem.jpg',frag:'L'}
    ],
    horario:[
      {id:'H1',name:'20:45',asset:'H1_timestamp.jpg',frag:'K'},
      {id:'H2',name:'21:00',asset:'H2_timestamp.jpg',frag:'R'},
      {id:'H3',name:'21:15',asset:'H3_timestamp.jpg',frag:'U'},
      {id:'H4',name:'21:30',asset:'H4_timestamp.jpg',frag:'L'},
      {id:'H5',name:'21:45',asset:'H5_timestamp.jpg',frag:'E'}
    ],
    rota:[
      {id:'R1',name:'Escada Norte',asset:'R1_escada_norte.jpg',frag:'A'},
      {id:'R2',name:'Elevador',asset:'R2_elevador.jpg',frag:'O'},
      {id:'R3',name:'Escada Sul',asset:'R3_escada_sul.jpg',frag:'S'},
      {id:'R4',name:'Corredor de Manutenção',asset:'R4_manutencao.jpg',frag:'E'},
      {id:'R5',name:'Saída Leste',asset:'R5_saida_leste.jpg',frag:'N'}
    ]
  };
  const categories=['pessoa','local','instrumento','motivo','horario','rota'];
  const labels={pessoa:'PESSOA',local:'LOCAL',instrumento:'INSTRUMENTO',motivo:'MOTIVO',horario:'HORÁRIO',rota:'ROTA'};
  const implemented=[
    {id:'caesar',name:'Cifra de César',family:'Cifras'},
    {id:'a1z26',name:'A1Z26',family:'Códigos'},
    {id:'acrostic',name:'Leitura por coluna oculta',family:'Estrutura textual'},
    {id:'periodic',name:'Amostragem periódica',family:'Estrutura textual'},
    {id:'oddEven',name:'Ímpares / pares',family:'Estrutura textual'},
    {id:'morse',name:'Morse visual + áudio',family:'Códigos'},
    {id:'polybius',name:'Quadrado de Polybius',family:'Códigos'},
    {id:'coords',name:'Mapa por trajetória codificada',family:'Raciocínio espacial'},
    {id:'vigenere',name:'Vigenère com chave derivada',family:'Cifras',needsKey:true},
    {id:'binary',name:'Binário / ASCII',family:'Códigos'},
    {id:'prime',name:'Posições primas',family:'Estrutura textual'},
    {id:'time',name:'Sequência temporal',family:'Raciocínio'},
    {id:'noise',name:'Ruído visual',family:'Percepção visual'},
    {id:'color',name:'Ocultação por canais de cor',family:'Percepção visual'}
  ];
  const advanced=[
    {id:'pigpen',name:'Pigpen',family:'Criptografia visual',implemented:true},
    {id:'scytale',name:'Scytale',family:'Transposição',implemented:true},
    {id:'base64',name:'Base64',family:'Codificação digital',implemented:true},
    {id:'hexascii',name:'Hexadecimal / ASCII',family:'Codificação digital',implemented:true},
    {id:'mono',name:'Substituição monoalfabética',family:'Cifras',implemented:true,needsKey:true},
    {id:'columnar',name:'Transposição colunar',family:'Transposição',implemented:true,needsKey:true},
    {id:'book',name:'Book cipher',family:'Cifras por referência',implemented:true},
    {id:'cardan',name:'Grade de Cardan',family:'Criptografia visual',implemented:true},
    {id:'stegimage',name:'Esteganografia em imagem (LSB)',family:'Esteganografia',implemented:true,digital:true}
  ];
  const allTechniques=[...implemented,...advanced];
  const presets={
    iniciante:['caesar','a1z26','morse','polybius','coords','time','periodic','oddEven'],
    intermediario:implemented.map(t=>t.id),
    avancado:allTechniques.map(t=>t.id)
  };
  /* Bancos de chaves: ampliados na v3.0 (antes eram só 6 palavras). */
  const KEYS=['ORION','LIMA','NEXO','FAROL','BRAVO','CANTO','SOMBRA','LACRE','PRISMA','TRAMA','VIGIA','CODIGO','AGULHA','TUNEL','MARFIM','ALIBI','CORAL','ONIX','RELOGIO','PAUTA','ECLIPSE','FRESTA','LANTERNA','MOSAICO','PENDULO','RASTRO','TIMBRE','VERNIZ','ZENITE','ABISMO','BUSSOLA','CINZA','DOSSIE','ENIGMA','FAISCA','GRAFITE','HELICE','ILUSAO','JANELA','LEGADO'];
  const AGENTS=['Insp. R. Valente','Insp. C. Moreira','Agt. T. Brandão','Agt. M. Siqueira','Insp. L. Cardoso','Agt. P. Nogueira','Insp. A. Teixeira','Agt. D. Freitas'];
  function hash(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rngFrom(seed){let a=hash(String(seed));return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function choose(a,r){return a[Math.floor(r()*a.length)]}
  function norm(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,'').replace(/\s+/g,' ').trim()}
  /* Código de verificação: 1 fragmento por categoria. Desde a v3.0 os 5 fragmentos de cada
   * categoria são distintos, então cada uma das 15.625 soluções tem um código único. */
  function verification(solution){return categories.map(c=>solution[c].frag).join('')}
  /* ID do caso derivado de hash da seed (evita colisões e IDs como "DICC-AZ--ARQUIVO"). */
  function caseId(seed){return 'DICC-AZ-'+hash('id|'+seed).toString(16).toUpperCase().padStart(8,'0')}
  const API={cards,categories,labels,implemented,advanced,allTechniques,presets,KEYS,AGENTS,hash,rngFrom,shuffle,choose,norm,verification,caseId};
  global.MnemosineData=API;global.rngFrom=rngFrom;
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
