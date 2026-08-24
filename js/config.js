/* ==========================================================================
   CONFIGURAÇÃO DA LOJA
   Este é o único arquivo que você precisa editar para trocar telefone,
   endereço, textos do topo e as mensagens do WhatsApp.
   ========================================================================== */

const CONFIG = {
  /* --------------------------------------------------------------------
     WHATSAPP  ←←←  TROQUE AQUI QUANDO TIVER O NÚMERO
     Formato: código do país + DDD + número, apenas dígitos, sem espaços.
     Exemplo para (81) 99461-6071  →  "5581994616071"
     -------------------------------------------------------------------- */
  whatsapp: "5581000000000",

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
    endereco: "Av. Pref. Braz de Lira, 760 — Santa Cruz do Capibaribe — PE",
    telefoneExibicao: "(81) 99461-6071",
    horario: "Seg a Sex, 8h às 18h",
    instagram: "", // ex.: "https://instagram.com/setefiostextil" (vazio esconde o link)
  },

  /* Frase que passa na tarja preta do topo. */
  avisoTopo: "Pronta entrega no Polo de Confecções • Atendimento direto pelo WhatsApp",

  /* Quantos produtos aparecem antes do botão "Carregar mais". */
  porPagina: 8,
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
