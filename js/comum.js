/* ==========================================================================
   7 FIOS TÊXTIL, o que é igual nas três páginas
   (cabeçalho, menu, links do WhatsApp, dados da empresa, contador do carrinho)
   Carregado em index.html, sobre.html e contato.html.
   ========================================================================== */

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

const esc = (t) =>
  String(t == null ? "" : t).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const semAcento = (t) =>
  String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const CHAVE_CARRINHO = "7fios_orcamento";

/* Link do Google Maps com rota a partir de onde a pessoa está. */
function linkRota() {
  return (
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(CONFIG.empresa.endereco + ", Brasil")
  );
}
function linkMapa() {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(CONFIG.empresa.endereco + ", Brasil")
  );
}

/* Preenche telefone, endereço, horário e os links do WhatsApp. */
function aplicarEmpresa() {
  const e = CONFIG.empresa;
  const mapa = {
    endereco: e.endereco,
    telefone: e.telefoneExibicao,
    horario: e.horario,
    email: e.email,
    instagram: e.instagramNome,
  };
  $$("[data-empresa]").forEach((el) => {
    const v = mapa[el.dataset.empresa];
    if (v) el.textContent = v;
  });
  $$("[data-wpp]").forEach((el) => (el.href = linkWhatsApp()));
  $$("[data-rota]").forEach((el) => (el.href = linkRota()));
  $$("[data-mapa]").forEach((el) => (el.href = linkMapa()));
  $$("[data-email-link]").forEach((el) => (el.href = "mailto:" + e.email));
  $$("[data-tel-link]").forEach(
    (el) => (el.href = "tel:+" + CONFIG.whatsapp)
  );
  $$("[data-insta-link]").forEach((el) => (el.href = e.instagram || "#"));
  $$("[data-avaliar]").forEach((el) => (el.href = e.avaliacao || "#"));

  const aviso = $("#avisoTopo");
  if (aviso) aviso.textContent = CONFIG.avisoTopo;
  const ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();
}

/* Contador do orçamento: aparece em todas as páginas. */
function contarCarrinho() {
  const badge = $("#badgeCarrinho");
  if (!badge) return;
  let itens = [];
  try {
    itens = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
  } catch (e) {
    itens = [];
  }
  const total = itens.reduce((s, i) => s + (Number(i.qtd) || 0), 0);
  badge.textContent = total;
  badge.hidden = total === 0;
}

/* Menu do celular. */
function montarMenu() {
  const botao = $("#navToggle");
  const nav = $("#nav");
  if (!botao || !nav) return;
  botao.addEventListener("click", () => {
    const aberto = nav.classList.toggle("is-open");
    botao.setAttribute("aria-expanded", aberto);
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      botao.setAttribute("aria-expanded", "false");
    }
  });
}

/* Categorias do rodapé: iguais em todas as páginas. */
function montarRodape() {
  const alvo = $("#footerDeps");
  if (!alvo || typeof VITRINE_CATEGORIAS === "undefined") return;
  alvo.innerHTML = VITRINE_CATEGORIAS.map(
    (c) =>
      `<li><a href="index.html?grupos=${encodeURIComponent(c.grupos.join(","))}#loja">${esc(c.nome)}</a></li>`
  ).join("");
}

/* Nas páginas Sobre e Contato a busca leva para a loja já procurando. */
function buscaForaDaLoja() {
  const campo = $("#inputBusca");
  const form = $("#formBusca");
  if (!campo || !form || $("#produtos")) return;
  const ir = () => {
    const termo = campo.value.trim();
    if (termo) location.href = "index.html?busca=" + encodeURIComponent(termo) + "#loja";
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ir();
  });
  campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ir();
    }
  });
}

aplicarEmpresa();
montarRodape();
buscaForaDaLoja();
contarCarrinho();
montarMenu();
