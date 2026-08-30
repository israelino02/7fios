/* ==========================================================================
   CONFIGURAÇÃO DA LOJA
   Este é o único arquivo que você precisa editar para trocar telefone,
   endereço, textos do topo e as mensagens do WhatsApp.
   ========================================================================== */

const CONFIG = {
  /* --------------------------------------------------------------------
     WHATSAPP: (81) 99461-6071
     Formato: código do país + DDD + número, apenas dígitos, sem espaços.
     -------------------------------------------------------------------- */
  whatsapp: "5581994616071",

  /* Mensagens prontas. {produto} e {lista} são preenchidos automaticamente. */
  mensagemProduto:
    "Olá! Vim pelo site da 7 Fios Têxtil e quero saber o preço de: {produto}",
  mensagemGeral:
    "Olá! Vim pelo site da 7 Fios Têxtil e gostaria de falar com um vendedor.",
  mensagemPedido:
    "Olá! Montei um orçamento no site da 7 Fios Têxtil:\n\n{lista}\nPode me passar os preços e condições?",

  empresa: {
    nome: "7 Fios Têxtil",
    nomeCompleto: "Sete Fios Têxtil",
    endereco: "Av. Pref. Braz de Líra, 760 - Santa Cruz do Capibaribe - PE",
    email: "Comercial@setefios.com.br",
    telefoneExibicao: "(81) 99461-6071",
    horario: "Seg a Sex, 8h às 18h",
    horarios: [
      { dia: "Segunda a Sexta", valor: "08:00 às 18:00" },
      { dia: "Sábado", valor: "Fechado", fechado: true },
      { dia: "Domingo", valor: "Fechado", fechado: true },
    ],
    instagram: "https://instagram.com/7fiostextil",
    avaliacao: "https://g.page/r/CaTct8qnGWhbEAE/review",
    instagramNome: "@7fiostextil",
  },

  /* Frase que passa na tarja preta do topo. */
  avisoTopo: "Pronta entrega no Polo de Confecções • Atendimento direto pelo WhatsApp",
};

/* Monta o link do WhatsApp já com a mensagem pronta. */
function linkWhatsApp(produto) {
  const texto = produto
    ? CONFIG.mensagemProduto.replace("{produto}", produto)
    : CONFIG.mensagemGeral;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/* Monta o link do pedido completo (carrinho de orçamento). */
function linkPedido(linhas) {
  const texto = CONFIG.mensagemPedido.replace("{lista}", linhas.join("\n"));
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
}
