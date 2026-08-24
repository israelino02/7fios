/* ==========================================================================
   CATÁLOGO DA LOJA
   Para adicionar / remover / editar produtos, mexa APENAS neste arquivo.
   A loja inteira (vitrines, filtros, busca, contadores) é montada daqui.

   Campos de cada produto:
     nome      (obrigatório) — título do produto
     sku       (obrigatório) — código único, aparece na ficha
     grupo     (obrigatório) — "tecidos" ou "outros"
     categoria (obrigatório) — precisa existir na lista CATEGORIAS abaixo
     resumo    (obrigatório) — frase curta que aparece no card
     unidade   (obrigatório) — como é vendido: "metro", "rolo", "peça"…
     preco     (opcional)    — número, ex.: 18.90. Se ficar null → "sob consulta"
     descricao (opcional)    — texto da ficha do produto
     detalhes  (opcional)    — ficha técnica (rótulo: valor)
     cores     (opcional)    — famílias de cor, para o filtro de cores
     tags      (opcional)    — selos no card (ex.: "Pronta entrega")
     cor       (opcional)    — cor do card quando não houver foto (hex)
     imagem    (opcional)    — ex.: "assets/produtos/microfibra.jpg"
     destaque  (opcional)    — true entra na vitrine "Mais vendidos"
     novidade  (opcional)    — true entra na vitrine "Novidades"
   ========================================================================== */

const CATEGORIAS = {
  tecidos: [
    { id: "esportivo", nome: "Esportivos" },
    { id: "malha", nome: "Malhas" },
    { id: "estampado", nome: "Estampados" },
    { id: "plano", nome: "Tecidos planos" },
  ],
  outros: [
    { id: "aviamento", nome: "Aviamentos" },
    { id: "acabamento", nome: "Acabamentos" },
  ],
};

/* Famílias de cor usadas no filtro lateral. */
const CORES = [
  { id: "preto", nome: "Preto", hex: "#111827" },
  { id: "branco", nome: "Branco", hex: "#F3F4F6" },
  { id: "azul", nome: "Azul", hex: "#1E3A8A" },
  { id: "vermelho", nome: "Vermelho", hex: "#DC2626" },
  { id: "verde", nome: "Verde", hex: "#15803D" },
  { id: "rosa", nome: "Rosa", hex: "#DB2777" },
  { id: "roxo", nome: "Roxo", hex: "#7C3AED" },
  { id: "amarelo", nome: "Amarelo", hex: "#FFD801" },
  { id: "cinza", nome: "Cinza", hex: "#9CA3AF" },
  { id: "bege", nome: "Bege", hex: "#D6BFA3" },
];

const PRODUTOS = [
  /* ------------------------------ TECIDOS ------------------------------ */
  {
    nome: "Microfibra Poliamida",
    sku: "TEC-001",
    grupo: "tecidos",
    categoria: "esportivo",
    resumo: "Toque macio e caimento premium",
    unidade: "metro",
    preco: null,
    descricao:
      "A queridinha das confecções. Toque macio, ótimo caimento e alta durabilidade — ideal para moda fitness, praia e peças de alto giro.",
    detalhes: {
      Composição: "Poliamida com elastano",
      Largura: "1,60 m",
      Gramatura: "220 g/m²",
      Cores: "Mais de 30 opções em estoque",
      Rendimento: "Aprox. 3 peças por metro",
    },
    cores: ["preto", "azul", "vermelho", "rosa", "verde", "branco"],
    tags: ["Mais vendido"],
    cor: "#5B2333",
    destaque: true,
  },
  {
    nome: "Dry-fit Prime",
    sku: "TEC-002",
    grupo: "tecidos",
    categoria: "esportivo",
    resumo: "Secagem rápida, alta performance",
    unidade: "metro",
    preco: null,
    descricao:
      "Tecido leve com secagem rápida e boa respirabilidade. Indicado para uniformes, camisas esportivas e roupas de treino.",
    detalhes: {
      Composição: "100% poliéster",
      Largura: "1,60 m",
      Gramatura: "140 g/m²",
      Acabamento: "Antipilling",
      Sublimação: "Aceita muito bem",
    },
    cores: ["branco", "preto", "azul", "vermelho", "amarelo"],
    tags: ["Mais vendido"],
    cor: "#8B5CF6",
    destaque: true,
  },
  {
    nome: "Estampados da Estação",
    sku: "TEC-003",
    grupo: "tecidos",
    categoria: "estampado",
    resumo: "Padronagens renovadas todo mês",
    unidade: "metro",
    preco: null,
    descricao:
      "Coleção com estampas atualizadas a cada temporada, em diversas bases de malha e tecido plano.",
    detalhes: {
      Bases: "Malha, viscose e microfibra",
      Largura: "1,50 m a 1,60 m",
      Padrões: "Renovados todo mês",
      Mínimo: "Consulte o vendedor",
    },
    cores: ["verde", "azul", "vermelho", "amarelo"],
    tags: ["Novidade"],
    cor: "#1F6F4A",
    destaque: true,
    novidade: true,
  },
  {
    nome: "Suplex",
    sku: "TEC-004",
    grupo: "tecidos",
    categoria: "esportivo",
    resumo: "Compressão e elasticidade",
    unidade: "metro",
    preco: null,
    descricao:
      "Tecido encorpado com boa recuperação elástica. Muito usado em legging, top e short de academia.",
    detalhes: {
      Composição: "Poliamida com elastano",
      Largura: "1,50 m",
      Gramatura: "260 g/m²",
      Elasticidade: "Nos dois sentidos",
    },
    cores: ["preto", "azul", "cinza", "rosa"],
    tags: ["Pronta entrega"],
    cor: "#111827",
    destaque: true,
  },
  {
    nome: "Malha PV",
    sku: "TEC-005",
    grupo: "tecidos",
    categoria: "malha",
    resumo: "Ideal para camisaria e uniformes",
    unidade: "metro",
    preco: null,
    descricao:
      "Mistura de poliéster com viscose. Não amassa com facilidade e aceita bem sublimação e estampa.",
    detalhes: {
      Composição: "67% poliéster / 33% viscose",
      Largura: "1,80 m tubular",
      Gramatura: "160 g/m²",
    },
    cores: ["cinza", "branco", "preto", "azul"],
    tags: ["Pronta entrega"],
    cor: "#9CA3AF",
  },
  {
    nome: "Viscolycra",
    sku: "TEC-006",
    grupo: "tecidos",
    categoria: "malha",
    resumo: "Caimento fluido e confortável",
    unidade: "metro",
    preco: null,
    descricao:
      "Malha macia e confortável, com ótimo caimento para vestidos, blusas e conjuntos.",
    detalhes: {
      Composição: "Viscose com elastano",
      Largura: "1,60 m",
      Gramatura: "200 g/m²",
    },
    cores: ["vermelho", "preto", "bege", "verde"],
    cor: "#C2410C",
  },
  {
    nome: "Helanca Light",
    sku: "TEC-007",
    grupo: "tecidos",
    categoria: "esportivo",
    resumo: "Leve, resistente e econômica",
    unidade: "metro",
    preco: null,
    descricao:
      "Base econômica e resistente, muito procurada para uniformes escolares e peças promocionais.",
    detalhes: {
      Composição: "100% poliéster",
      Largura: "1,60 m",
      Gramatura: "130 g/m²",
    },
    cores: ["azul", "preto", "branco", "vermelho"],
    cor: "#1E3A8A",
  },
  {
    nome: "Moletom Flanelado",
    sku: "TEC-008",
    grupo: "tecidos",
    categoria: "malha",
    resumo: "Flanelado e peluciado",
    unidade: "metro",
    preco: null,
    descricao:
      "Disponível nas versões flanelada e peluciada, para blusas, jaquetas e conjuntos de inverno.",
    detalhes: {
      Composição: "Algodão com poliéster",
      Largura: "1,80 m",
      Gramatura: "280 g/m² a 320 g/m²",
    },
    cores: ["cinza", "preto", "bege", "azul"],
    cor: "#374151",
  },
  {
    nome: "Crepe",
    sku: "TEC-009",
    grupo: "tecidos",
    categoria: "plano",
    resumo: "Elegância no caimento",
    unidade: "metro",
    preco: null,
    descricao:
      "Superfície levemente texturizada, indicada para moda social, saias e vestidos.",
    detalhes: {
      Composição: "Poliéster",
      Largura: "1,50 m",
      Gramatura: "180 g/m²",
    },
    cores: ["roxo", "preto", "vermelho", "bege"],
    cor: "#4C1D95",
  },
  {
    nome: "Tricoline",
    sku: "TEC-010",
    grupo: "tecidos",
    categoria: "plano",
    resumo: "Lisos, listrados e xadrez",
    unidade: "metro",
    preco: null,
    descricao:
      "Tecido plano leve e fresco, muito usado em camisaria, aventais e vestuário infantil.",
    detalhes: {
      Composição: "Algodão com poliéster",
      Largura: "1,50 m",
      Padrões: "Lisos, listrados e xadrez",
    },
    cores: ["azul", "branco", "vermelho", "bege"],
    cor: "#0E7490",
  },
  {
    nome: "Liganete",
    sku: "TEC-011",
    grupo: "tecidos",
    categoria: "malha",
    resumo: "Alto giro e melhor custo",
    unidade: "metro",
    preco: null,
    descricao:
      "Malha fina e elástica, excelente custo-benefício para blusas e peças de verão.",
    detalhes: {
      Composição: "Poliéster com elastano",
      Largura: "1,50 m",
      Gramatura: "120 g/m²",
    },
    cores: ["rosa", "branco", "preto", "amarelo"],
    tags: ["Melhor preço"],
    cor: "#DB2777",
  },
  {
    nome: "Neoprene",
    sku: "TEC-012",
    grupo: "tecidos",
    categoria: "plano",
    resumo: "Estrutura e volume na peça",
    unidade: "metro",
    preco: null,
    descricao:
      "Tecido encorpado que dá estrutura à peça. Usado em vestidos, saias e jaquetas de modelagem marcada.",
    detalhes: {
      Composição: "Poliéster com espuma",
      Largura: "1,50 m",
      Gramatura: "320 g/m²",
    },
    cores: ["preto", "verde", "vermelho"],
    cor: "#0F766E",
    novidade: true,
  },

  /* --------------------------- OUTROS PRODUTOS -------------------------- */
  {
    nome: "Elástico",
    sku: "AVI-001",
    grupo: "outros",
    categoria: "aviamento",
    resumo: "Chato, roliço e embutido",
    unidade: "rolo",
    preco: null,
    descricao:
      "Elásticos em diversas larguras e cores, para cós, punhos e acabamentos de todo tipo de peça.",
    detalhes: {
      Larguras: "de 5 mm a 50 mm",
      Tipos: "Chato, roliço e embutido",
      Embalagem: "Rolo ou metro",
    },
    cores: ["branco", "preto"],
    tags: ["Mais vendido"],
    cor: "#111827",
    destaque: true,
  },
  {
    nome: "Viés",
    sku: "AVI-002",
    grupo: "outros",
    categoria: "acabamento",
    resumo: "Acabamento limpo e durável",
    unidade: "rolo",
    preco: null,
    descricao:
      "Viés em algodão e poliéster, liso ou estampado, para arremates de gola, cava e barra.",
    detalhes: {
      Larguras: "12 mm, 18 mm e 24 mm",
      Materiais: "Algodão e poliéster",
      Cores: "Cartela completa",
    },
    cores: ["verde", "rosa", "azul", "branco", "preto"],
    tags: ["Mais vendido"],
    cor: "#14B8A6",
    destaque: true,
  },
  {
    nome: "Rendas",
    sku: "AVI-003",
    grupo: "outros",
    categoria: "acabamento",
    resumo: "Guipir, chantilly e elástica",
    unidade: "metro",
    preco: null,
    descricao:
      "Rendas em vários modelos e larguras para lingerie, vestidos e detalhes de acabamento.",
    detalhes: {
      Modelos: "Guipir, chantilly e elástica",
      Larguras: "de 2 cm a 20 cm",
      Cores: "Diversas",
    },
    cores: ["vermelho", "branco", "preto", "bege"],
    cor: "#EF4444",
    destaque: true,
  },
  {
    nome: "Zíper",
    sku: "AVI-004",
    grupo: "outros",
    categoria: "aviamento",
    resumo: "Nylon, metal e invisível",
    unidade: "peça",
    preco: null,
    descricao:
      "Zíperes fixos e destacáveis, em vários comprimentos e cores, para calças, jaquetas e vestidos.",
    detalhes: {
      Tipos: "Nylon, metal e invisível",
      Comprimentos: "de 10 cm a 90 cm",
    },
    cores: ["preto", "cinza", "branco"],
    cor: "#6B7280",
  },
  {
    nome: "Linhas de Costura",
    sku: "AVI-005",
    grupo: "outros",
    categoria: "aviamento",
    resumo: "Reta, overloque e galoneira",
    unidade: "cone",
    preco: null,
    descricao:
      "Linhas de poliéster para costura reta, overloque e galoneira, com cartela ampla de cores.",
    detalhes: {
      Tipos: "Costura, overloque e galoneira",
      Cones: "Vários tamanhos",
      Cores: "Cartela completa",
    },
    cores: ["azul", "preto", "branco", "vermelho", "amarelo"],
    tags: ["Pronta entrega"],
    cor: "#2563EB",
  },
  {
    nome: "Botões",
    sku: "AVI-006",
    grupo: "outros",
    categoria: "aviamento",
    resumo: "Resina, metal e pressão",
    unidade: "cento",
    preco: null,
    descricao:
      "Botões de resina, metal e madeira, além de botões de pressão para todos os tipos de peça.",
    detalhes: {
      Materiais: "Resina, metal e madeira",
      Tamanhos: "Diversos",
    },
    cores: ["bege", "preto", "branco", "cinza"],
    cor: "#B45309",
  },
  {
    nome: "Cordão e Cadarço",
    sku: "AVI-007",
    grupo: "outros",
    categoria: "acabamento",
    resumo: "Redondo, chato e encerado",
    unidade: "rolo",
    preco: null,
    descricao:
      "Cordões e cadarços para capuz, moletom, short e bermuda, em várias espessuras e cores.",
    detalhes: {
      Tipos: "Redondo, chato e encerado",
      Espessuras: "de 3 mm a 12 mm",
    },
    cores: ["branco", "preto", "azul", "verde"],
    cor: "#65A30D",
  },
  {
    nome: "Etiquetas",
    sku: "AVI-008",
    grupo: "outros",
    categoria: "acabamento",
    resumo: "Composição, tamanho e marca",
    unidade: "cento",
    preco: null,
    descricao:
      "Etiquetas em cetim, nylon e tecido bordado. Personalização com a marca da sua confecção sob consulta.",
    detalhes: {
      Materiais: "Cetim, nylon e bordada",
      Personalização: "Sob consulta",
    },
    cores: ["branco", "preto"],
    cor: "#7C3AED",
    novidade: true,
  },
];
