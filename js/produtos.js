/* ==========================================================================
   CATÁLOGO DA LOJA, textos dos produtos
   Este arquivo é SEU. Edite nome, descrição, ficha técnica e categoria à
   vontade; rodar o script de imagens nunca sobrescreve nada daqui.

   As fotos vêm de js/catalogo-imagens.js, que é gerado sozinho a partir da
   pasta "imagens/" pelo comando:
       python3 ferramentas/preparar-imagens.py
   A ligação entre os dois é o campo "slug".
   ========================================================================== */

/* ---------------------------------------------------------- DEPARTAMENTOS
   São os grandes grupos que aparecem no filtro e na home.
   "capa" é a chave da foto em CAPAS_DEP (js/catalogo-imagens.js).          */
const DEPARTAMENTOS = {
  poliamida: {
    nome: "Microfibras Poliamida",
    resumo: "Toque macio e alta cobertura",
    capa: "poliamida",
  },
  poliester: {
    nome: "Microfibras Poliéster",
    resumo: "Lisos e risca de giz",
    capa: "poliester",
  },
  estampados: {
    nome: "Estampados",
    resumo: "Padronagens femininas e masculinas",
    capa: "estampados",
  },
  dryfit: {
    nome: "Dry-Fit",
    resumo: "Leveza e secagem rápida",
    capa: "dryfit",
  },
  suplex: {
    nome: "Suplex",
    resumo: "Cobertura e recuperação elástica",
    capa: "suplex",
  },
  aviamentos: {
    nome: "Aviamentos",
    resumo: "Elásticos, viés e rendas",
    capa: "aviamentos",
  },
};

/* ------------------------------------------------------ NOSSAS CATEGORIAS
   Os 4 cartões grandes da home. Cada um leva à loja já filtrada.
   "grupos" aponta para as chaves de DEPARTAMENTOS acima.                   */
const VITRINE_CATEGORIAS = [
  {
    nome: "Microfibras Poliamida",
    resumo: "Toque macio e alta cobertura",
    frase: "A linha de poliamida da casa, com a cartela mais completa do estoque e caimento uniforme.",
    capa: "poliamida",
    grupos: ["poliamida"],
    /* carretel de linha */
    icone:
      '<path d="M5.4 2.4h13.2v2.7H5.4V2.4Zm2.7 4h7.8v11.2H8.1V6.4Zm-2.7 12.5h13.2v2.7H5.4v-2.7Z"/>' +
      '<path d="M9.6 8.2h4.8v.9H9.6v-.9Zm0 2.6h4.8v.9H9.6v-.9Zm0 2.6h4.8v.9H9.6v-.9Z" opacity=".45"/>',
  },
  {
    nome: "Microfibras Poliéster",
    resumo: "Lisos e risca de giz",
    frase: "Poliéster versátil e de alto giro, do liso ao risca de giz, pronto para sublimação e estampa.",
    capa: "poliester",
    grupos: ["poliester"],
    /* dobras de tecido */
    icone:
      '<path d="M2.4 6.4c3.1-2.6 6.3 2.6 9.4 0s6.3 2.6 9.4 0V10c-3.1 2.6-6.3-2.6-9.4 0s-6.3-2.6-9.4 0V6.4Z"/>' +
      '<path d="M2.4 13.6c3.1-2.6 6.3 2.6 9.4 0s6.3 2.6 9.4 0v3.6c-3.1 2.6-6.3-2.6-9.4 0s-6.3-2.6-9.4 0v-3.6Z"/>',
  },
  {
    nome: "Estampados",
    resumo: "Femininos e masculinos",
    frase: "Padronagens renovadas a cada temporada, em coleções separadas para o público feminino e masculino.",
    capa: "estampados",
    grupos: ["estampados"],
    /* flor, a estampa mais clássica do ramo */
    icone:
      '<circle cx="12" cy="5.6" r="2.7"/><circle cx="18.1" cy="10" r="2.7"/>' +
      '<circle cx="15.8" cy="17.2" r="2.7"/><circle cx="8.2" cy="17.2" r="2.7"/>' +
      '<circle cx="5.9" cy="10" r="2.7"/><circle cx="12" cy="12" r="2.3"/>',
  },
  {
    nome: "Dry-Fit",
    resumo: "Leveza e secagem rápida",
    frase: "Furadinho de alta performance, primeira escolha para uniformes e roupa de treino.",
    capa: "dryfit",
    grupos: ["dryfit"],
    /* gota: secagem rápida */
    icone:
      '<path d="M12 2.3c3.7 4.3 6.1 7.5 6.1 10.3a6.1 6.1 0 0 1-12.2 0C5.9 9.8 8.3 6.6 12 2.3Z"/>' +
      '<path d="M9.4 12.6a2.6 2.6 0 0 0 2.6 2.6v1.6a4.2 4.2 0 0 1-4.2-4.2h1.6Z" opacity=".5"/>',
  },
  {
    nome: "Suplex",
    resumo: "Cobertura e recuperação elástica",
    frase: "Suplex de poliamida para legging e moda fitness, com boa cobertura e retorno elástico.",
    capa: "suplex",
    grupos: ["suplex"],
    /* peça de treino: elasticidade nos dois sentidos */
    icone:
      '<path d="M7.4 2.6h9.2l-.9 6.1 1.5 12.7h-4.3L12 13.4l-.9 8h-4.3l1.5-12.7-.9-6.1Z"/>' +
      '<path d="M9.5 5.1h5v1.2h-5V5.1Z" opacity=".45"/>',
  },
  {
    nome: "Aviamentos",
    resumo: "Elásticos, viés e rendas",
    frase: "A linha completa para fechar a peça: elástico, viés, renda, cordão, zíper e etiqueta.",
    capa: "aviamentos",
    grupos: ["aviamentos"],
    /* botão de quatro furos */
    icone:
      '<path fill-rule="evenodd" d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8ZM9.8 9.1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-4.4 4.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>',
  },
];

/* ------------------------------------------------------- ATALHOS DO CELULAR
   Três botões que aparecem logo abaixo da migalha, só em tela de celular.
   "grupos" aponta para as chaves de DEPARTAMENTOS.                         */
const ATALHOS_CELULAR = [
  { nome: "Microfibras", grupos: ["poliamida", "poliester", "estampados"] },
  { nome: "Dry-fit",     grupos: ["dryfit"] },
  { nome: "Aviamentos",  grupos: ["aviamentos"] },
];

/* -------------------------------------------------------------- CATEGORIAS
   Subdivisões dentro de cada departamento.                                 */
const CATEGORIAS = {
  poliamida:  [
    { id: "liso", nome: "Lisos" },
  ],
  poliester:  [
    { id: "liso", nome: "Lisos" },
    { id: "risca", nome: "Risca de giz" },
  ],
  estampados: [
    { id: "feminino", nome: "Estampas femininas" },
    { id: "masculino", nome: "Estampas masculinas" },
  ],
  dryfit:     [{ id: "esportivo", nome: "Esportivos" }],
  suplex:     [{ id: "liso", nome: "Lisos" }],
  aviamentos: [
    { id: "elastico", nome: "Elásticos" },
    { id: "vies", nome: "Viés" },
    { id: "renda", nome: "Rendas" },
  ],
};

/* ------------------------------------------------------------ FAMÍLIAS DE COR
   Usadas no filtro lateral. A família de cada cor é descoberta sozinha a
   partir da própria foto do tecido.                                        */
const FAMILIAS_COR = [
  { id: "preto",    nome: "Preto",    hex: "#141414" },
  { id: "branco",   nome: "Branco",   hex: "#F4F4F0" },
  { id: "cinza",    nome: "Cinza",    hex: "#9A9AA2" },
  { id: "bege",     nome: "Bege",     hex: "#D8BE9C" },
  { id: "marrom",   nome: "Marrom",   hex: "#7A4B2A" },
  { id: "vermelho", nome: "Vermelho", hex: "#C62328" },
  { id: "rosa",     nome: "Rosa",     hex: "#DB4C86" },
  { id: "laranja",  nome: "Laranja",  hex: "#E8722B" },
  { id: "amarelo",  nome: "Amarelo",  hex: "#F2C40D" },
  { id: "verde",    nome: "Verde",    hex: "#2E7D46" },
  { id: "azul",     nome: "Azul",     hex: "#22509E" },
  { id: "roxo",     nome: "Roxo",     hex: "#6B3FA0" },
];

/* ----------------------------------------------------------------- PRODUTOS
   Campos:
     slug      liga o produto às fotos (js/catalogo-imagens.js), não mude
     sku       código que aparece na ficha
     grupo     chave de DEPARTAMENTOS
     categoria id dentro de CATEGORIAS[grupo]
     unidade   como é vendido (metro, rolo, peça…)
     preco     null = "Preço sob consulta"; ou um número, ex.: 18.90
     detalhes  ficha técnica, complete com composição e gramatura
     tags      selos no card
     destaque  entra na vitrine "Mais vendidos"
     novidade  entra na vitrine "Novidades"                                 */
const PRODUTOS = [
  /* --------------------------- MICROFIBRAS POLIAMIDA --------------------- */
  {
    nome: "Poliamida UV",
    slug: "poliamida-uv",
    sku: "PA-001",
    grupo: "poliamida",
    categoria: "liso",
    resumo: "A cartela mais completa da casa",
    unidade: "metro",
    preco: null,
    descricao:
      "Microfibra de poliamida com proteção UV e a maior variedade de cores do estoque. Toque macio, boa elasticidade e caimento uniforme: primeira escolha para moda praia e fitness.",
    detalhes: { Linha: "Poliamida UV", Tipo: "Microfibra de poliamida", Acabamento: "Liso" },
    tags: ["Mais vendido"],
    destaque: true,
  },
  {
    nome: "Max Premium",
    slug: "max-premium",
    sku: "PA-002",
    grupo: "poliamida",
    categoria: "liso",
    resumo: "A poliamida mais encorpada",
    unidade: "metro",
    preco: null,
    descricao:
      "A gramatura mais alta da casa em poliamida, para peças que pedem cobertura e estrutura.",
    detalhes: { Linha: "Max Premium", Tipo: "Microfibra de poliamida", Acabamento: "Liso" },
    destaque: true,
  },
  {
    nome: "Premium",
    slug: "premium",
    sku: "PA-003",
    grupo: "poliamida",
    categoria: "liso",
    resumo: "Poliamida de toque superior",
    unidade: "metro",
    preco: null,
    descricao:
      "Linha encorpada de poliamida, para peças que pedem melhor acabamento e cobertura.",
    detalhes: { Linha: "Premium", Tipo: "Microfibra de poliamida", Acabamento: "Liso" },
    destaque: true,
  },

  /* --------------------------------- SUPLEX ------------------------------ */
  {
    nome: "Suplex Blackout 290",
    slug: "suplex-blackout",
    sku: "SU-001",
    grupo: "suplex",
    categoria: "liso",
    resumo: "Não transparenta",
    unidade: "metro",
    preco: null,
    descricao:
      "Suplex de poliamida com 290 g de cobertura total, indicado para legging e peças claras que não podem transparecer.",
    detalhes: { Linha: "Blackout", Tipo: "Suplex de poliamida", Gramatura: "290" },
  },
  {
    nome: "Suplex Flex Fit 310",
    slug: "suplex-flex-fit",
    sku: "SU-002",
    grupo: "suplex",
    categoria: "liso",
    resumo: "Elasticidade nos dois sentidos",
    unidade: "metro",
    preco: null,
    descricao:
      "Suplex de poliamida com 310 g e boa recuperação elástica, para peças de treino que precisam voltar ao lugar depois do movimento.",
    detalhes: { Linha: "Flex Fit", Tipo: "Suplex de poliamida", Gramatura: "310" },
  },

  /* --------------------------- MICROFIBRAS POLIÉSTER --------------------- */
  {
    nome: "Madri",
    slug: "madri",
    sku: "PE-001",
    grupo: "poliester",
    categoria: "liso",
    resumo: "Poliéster liso de alto giro",
    unidade: "metro",
    preco: null,
    descricao:
      "Microfibra de poliéster lisa, versátil e com ótimo custo-benefício. Aceita bem sublimação e estampa.",
    detalhes: { Linha: "Madri", Tipo: "Microfibra de poliéster", Acabamento: "Liso" },
    tags: ["Mais vendido"],
    destaque: true,
  },
  {
    nome: "Romantik Liso",
    slug: "romantik-liso",
    sku: "PE-002",
    grupo: "poliester",
    categoria: "liso",
    resumo: "Caimento leve e fluido",
    unidade: "metro",
    preco: null,
    descricao:
      "Base lisa da linha Romantik, com caimento leve. Indicada para blusas, vestidos e conjuntos.",
    detalhes: { Linha: "Romantik", Tipo: "Microfibra de poliéster", Acabamento: "Liso" },
    destaque: true,
  },
  {
    nome: "Romantik Risca de Giz",
    slug: "romantik-risca",
    sku: "PE-004",
    grupo: "poliester",
    categoria: "risca",
    resumo: "Listra fina discreta",
    unidade: "metro",
    preco: null,
    descricao:
      "Padronagem risca de giz em base de poliéster, listra fina e discreta, ótima para peças de moda social e casual.",
    detalhes: { Linha: "Romantik", Tipo: "Microfibra de poliéster", Acabamento: "Risca de giz" },
    novidade: true,
  },
  {
    /* O carro-chefe da casa: aparece primeiro na loja, com selo no card e
       banner próprio na home. Para trocar de produto em destaque, basta
       mudar "emDestaque: true" para outro daqui. */
    nome: "Summersol",
    slug: "summersol",
    sku: "PE-005",
    grupo: "poliester",
    categoria: "liso",
    emDestaque: true,
    resumo: "Leve, para peças de verão",
    unidade: "metro",
    preco: null,
    descricao:
      "Microfibra de poliéster leve, pensada para roupa de verão e peças fluidas. Cartela ampla de cores.",
    detalhes: { Linha: "Summersol", Tipo: "Microfibra de poliéster", Acabamento: "Liso" },
  },

  /* -------------------------------- ESTAMPADOS --------------------------- */
  {
    nome: "Romantik Estampado Feminino",
    slug: "romantik-feminino",
    sku: "ES-001",
    grupo: "estampados",
    categoria: "feminino",
    resumo: "Estampas para o público feminino",
    unidade: "metro",
    preco: null,
    descricao:
      "Coleção de estampas femininas na base Romantik: florais, personagens e padronagens delicadas, renovadas a cada temporada.",
    detalhes: { Linha: "Romantik", Tipo: "Microfibra estampada", Coleção: "Renovada por temporada" },
    tags: ["Novidade"],
    destaque: true,
    novidade: true,
  },
  {
    nome: "Romantik Estampado Masculino",
    slug: "romantik-masculino",
    sku: "ES-002",
    grupo: "estampados",
    categoria: "masculino",
    resumo: "Estampas para o público masculino",
    unidade: "metro",
    preco: null,
    descricao:
      "Estampas masculinas na base Romantik: geométricas, esportivas e temáticas, para camisas, bermudas e conjuntos.",
    detalhes: { Linha: "Romantik", Tipo: "Microfibra estampada", Coleção: "Renovada por temporada" },
    novidade: true,
  },

  /* ---------------------------------- DRY-FIT ---------------------------- */
  {
    nome: "Dry Fit Prime",
    slug: "dry-fit-prime",
    sku: "DF-001",
    grupo: "dryfit",
    categoria: "esportivo",
    resumo: "Furadinho, secagem rápida",
    unidade: "metro",
    preco: null,
    descricao:
      "Dry-fit furadinho de alta performance: leve, respirável e de secagem rápida. Primeira escolha para uniformes e roupa de treino.",
    detalhes: { Linha: "Prime", Tipo: "Dry-fit furadinho", Indicação: "Uniformes e moda fitness" },
    tags: ["Mais vendido"],
    destaque: true,
  },

  /* -------------------------------- AVIAMENTOS --------------------------- */
  {
    nome: "Elástico Personalizado",
    slug: "elastico-personalizado",
    sku: "AV-001",
    grupo: "aviamentos",
    categoria: "elastico",
    resumo: "Com a marca da sua confecção",
    unidade: "rolo",
    preco: null,
    descricao:
      "Elástico produzido com o nome ou a logo da sua marca. Fechamento de cós com identidade própria, consulte prazo e quantidade mínima.",
    detalhes: { Tipo: "Elástico personalizado", Personalização: "Sob consulta" },
    tags: ["Sob encomenda"],
    destaque: true,
  },
  {
    nome: "Elástico Liso",
    slug: "elastico-liso",
    sku: "AV-002",
    grupo: "aviamentos",
    categoria: "elastico",
    resumo: "Larguras 25, 30 e 35 mm",
    unidade: "rolo",
    preco: null,
    descricao:
      "Elástico liso para cós e acabamentos, nas larguras mais pedidas pelas confecções.",
    detalhes: { Larguras: "25 mm, 30 mm e 35 mm", Tipo: "Liso" },
    tags: ["Mais vendido"],
    destaque: true,
  },
  {
    nome: "Elástico de Arte Pública",
    slug: "elastico-arte-publica",
    sku: "AV-003",
    grupo: "aviamentos",
    categoria: "elastico",
    resumo: "Estampados prontos, 25 a 35 mm",
    unidade: "rolo",
    preco: null,
    descricao:
      "Elásticos com arte já estampada, prontos para pronta entrega, sem precisar encomendar personalização.",
    detalhes: { Larguras: "25 mm, 30 mm e 35 mm", Tipo: "Arte pública (estampado)" },
    destaque: true,
  },
  {
    nome: "Elástico Fênix 7 mm",
    slug: "elastico-fenix",
    sku: "AV-004",
    grupo: "aviamentos",
    categoria: "elastico",
    resumo: "Fino, para acabamentos delicados",
    unidade: "rolo",
    preco: null,
    descricao: "Elástico fino de 7 mm, indicado para lingerie e acabamentos delicados.",
    detalhes: { Largura: "7 mm", Linha: "Fênix" },
  },
  {
    nome: "Elástico Jurerê 12 mm",
    slug: "elastico-jurere",
    sku: "AV-005",
    grupo: "aviamentos",
    categoria: "elastico",
    resumo: "Meio-termo entre fino e cós",
    unidade: "rolo",
    preco: null,
    descricao: "Elástico de 12 mm, largura versátil para punhos, alças e acabamentos.",
    detalhes: { Largura: "12 mm", Linha: "Jurerê" },
  },
  {
    nome: "Viés de Poliamida 7 Fios",
    slug: "vies-7-fios",
    sku: "AV-006",
    grupo: "aviamentos",
    categoria: "vies",
    resumo: "Linha própria, 16 e 25 mm",
    unidade: "rolo",
    preco: null,
    descricao:
      "Viés de poliamida da linha própria da 7 Fios, em duas larguras. Acabamento macio e boa recuperação elástica.",
    detalhes: { Larguras: "16 mm e 25 mm", Material: "Poliamida", Linha: "7 Fios" },
    tags: ["Mais vendido"],
    destaque: true,
  },
  {
    nome: "Viés de Poliamida Paraná",
    slug: "vies-parana",
    sku: "AV-007",
    grupo: "aviamentos",
    categoria: "vies",
    resumo: "Poliamida, 16 e 25 mm",
    unidade: "rolo",
    preco: null,
    descricao: "Viés de poliamida da linha Paraná, nas larguras 16 mm e 25 mm.",
    detalhes: { Larguras: "16 mm e 25 mm", Material: "Poliamida", Linha: "Paraná" },
  },
  {
    nome: "Viés de Poliéster Rubi",
    slug: "vies-rubi",
    sku: "AV-008",
    grupo: "aviamentos",
    categoria: "vies",
    resumo: "Poliéster, 16 e 25 mm",
    unidade: "rolo",
    preco: null,
    descricao:
      "Viés de poliéster da linha Rubi, opção econômica para arremates, em duas larguras.",
    detalhes: { Larguras: "16 mm e 25 mm", Material: "Poliéster", Linha: "Rubi" },
  },
  {
    nome: "Viés Noronha",
    slug: "vies-noronha",
    sku: "AV-009",
    grupo: "aviamentos",
    categoria: "vies",
    resumo: "Viés com desenho rendado",
    unidade: "rolo",
    preco: null,
    descricao:
      "Viés com desenho rendado na borda, para dar acabamento e detalhe na mesma peça.",
    detalhes: { Tipo: "Viés rendado", Linha: "Noronha" },
    novidade: true,
  },
  {
    nome: "Renda 7 Mares 17 cm",
    slug: "renda-7-mares",
    sku: "AV-010",
    grupo: "aviamentos",
    categoria: "renda",
    resumo: "Renda larga, 17 cm",
    unidade: "metro",
    preco: null,
    descricao:
      "Renda larga de 17 cm da linha 7 Mares, para barras, sobreposições e peças de destaque.",
    detalhes: { Largura: "17 cm", Linha: "7 Mares" },
    tags: ["Mais vendido"],
    destaque: true,
  },
];

/* ----------------------------------------------------------------- GERENTES
   Aparecem na página "Sobre". A foto vem da pasta imagens/gerentes; o campo
   "arquivo" precisa bater com o nome do arquivo processado.                */
const EQUIPE = [
  { arquivo: "Perfil Raianne Comercial", nome: "Raianne Oliveira",  cargo: "Dep. Comercial" },
  { arquivo: "Manassés Ferreira",        nome: "Manassés Ferreira", cargo: "Dep. Comercial" },
  { arquivo: "Hellen Aragão",            nome: "Hellen Aragão",     cargo: "Dep. Financeiro" },
];

/* ------------------------------------------------------------------- SOBRE
   Textos da página "Sobre". Edite à vontade.                              */
const SOBRE = {
  historia:
    "A Sete Fios nasceu da fé e da determinação. Com apenas um computador, um birô e uma mala de mostruário, os primeiros clientes surgiram entre idas e vindas em uma moto. O que parecia simples se tornou uma história de superação, gratidão e confiança no futuro. Durante a pandemia, vivemos momentos desafiadores, mas descobrimos a força da equipe e a fidelidade dos clientes que estiveram conosco desde o início. Hoje, muitos clientes deixaram de ser apenas compradores e se tornaram amigos, inspirando inovações e ajudando a moldar novos produtos.",
  missao:
    "Fornecer produtos têxteis e aviamentos de alta qualidade com excelente custo-benefício, atendendo o mercado de moda íntima com agilidade e inovação.",
  visao:
    "Ser referência nacional em distribuição de tecidos e aviamentos para o mercado de moda íntima, com parcerias estratégicas e crescimento sustentável.",
  valores: [
    { nome: "Qualidade",            texto: "Produtos que atendem aos mais altos padrões de durabilidade e conforto." },
    { nome: "Custo-benefício",      texto: "Excelência e preço justo, agregando valor ao seu investimento." },
    { nome: "Inteligência",         texto: "Conhecimento e tecnologia aplicados para inovar em cada processo." },
    { nome: "Agilidade",            texto: "Rapidez e eficiência para responder às demandas do mercado." },
    { nome: "Parceria e Confiança", texto: "Relações duradouras, lado a lado com nossos clientes." },
    { nome: "Ética e Transparência",texto: "Conduta íntegra e responsável em todas as negociações." },
  ],
};
