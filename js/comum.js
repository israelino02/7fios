/* ==========================================================================
   7 FIOS TÊXTIL, o que é igual em todas as páginas
   (cabeçalho, menu, links do WhatsApp, dados da empresa, contador do carrinho)
   Carregado em todas as páginas.
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

/* src de uma foto do catálogo, com width/height e, quando a capa tem versão
   estreita, o srcset para o celular baixar a menor. As medidas vêm de
   MEDIDAS (js/catalogo-imagens.js); foto sem medida sai só com o src.
   "tamanhos" é a largura que a foto ocupa na tela, no formato do sizes. */
function fotoAttrs(url, tamanhos) {
  const m =
    typeof MEDIDAS !== "undefined" && MEDIDAS[String(url).split("?")[0]];
  if (!m) return `src="${esc(url)}"`;
  let a = `src="${esc(url)}" width="${m[0]}" height="${m[1]}"`;
  if (m[2])
    a += ` srcset="${esc(m[2])} ${m[3]}w, ${esc(url)} ${m[0]}w" sizes="${esc(tamanhos)}"`;
  return a;
}

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

/* ==========================================================================
   ORÇAMENTO GUARDADO NO NAVEGADOR
   Todas as páginas leem por aqui. Antes, a loja descartava item de catálogo
   antigo mas não regravava, e as outras páginas contavam o que estava lá:
   dava contagem diferente em cada página. Agora a leitura valida e regrava.
   ========================================================================== */

function gravarCarrinho(itens) {
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  } catch (e) {
    /* navegador sem armazenamento: o orçamento vale só nesta visita */
  }
}

/* Devolve só o que ainda faz sentido: produto que existe, quantidade que é
   número inteiro e positivo, cor que é texto. O resto é descartado e o que
   sobra é regravado, para nenhuma página discordar da outra. */
function lerCarrinho() {
  let bruto = [];
  try {
    const guardado = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
    if (Array.isArray(guardado)) bruto = guardado;
  } catch (e) {
    bruto = [];
  }

  const existe = (sku) =>
    typeof PRODUTOS !== "undefined" && PRODUTOS.some((p) => p.sku === sku);

  const limpos = [];
  bruto.forEach((item) => {
    if (!item || typeof item !== "object") return;
    if (typeof item.sku !== "string" || !existe(item.sku)) return;
    const qtd = Math.floor(Number(item.qtd));
    if (!Number.isFinite(qtd) || qtd < 1) return;
    limpos.push({
      sku: item.sku,
      qtd: Math.min(qtd, 9999),
      cor: typeof item.cor === "string" ? item.cor : "",
    });
  });

  if (limpos.length !== bruto.length) gravarCarrinho(limpos);
  return limpos;
}

/* Contador do carrinho: aparece em todas as páginas. */
function contarCarrinho() {
  const badge = $("#badgeCarrinho");
  if (!badge) return;
  const total = lerCarrinho().reduce((s, i) => s + i.qtd, 0);
  badge.textContent = total;
  badge.hidden = total === 0;
}

/* ==========================================================================
   MEDIÇÃO (Google Tag Manager / Google Ads)
   Cada ação que vale dinheiro avisa o dataLayer com nome próprio. É daí que o
   Gerenciador de Tags puxa as conversões, em vez de mirar em classe de CSS:
   classe muda quando o layout muda, e leva a medição junto sem ninguém
   perceber. Sem o Tag Manager instalado isto não faz nada além de encher uma
   lista na memória, então pode ficar aqui desde já.
   ========================================================================== */
window.dataLayer = window.dataLayer || [];

function rastrear(evento, dados) {
  if (lerEscolhaCookies() === "recusado") return;
  window.dataLayer.push(Object.assign({ event: evento }, dados || {}));
}

/* ==========================================================================
   AVISO DE COOKIES
   O Tag Manager carrega Google Analytics, Google Ads, Pixel da Meta e
   Microsoft Clarity. O aviso informa e deixa recusar sem atrapalhar a loja.
   Quem recusa: a medição para na hora (abaixo) e, nas próximas páginas, o
   Tag Manager nem é carregado (o teste fica no <head> de cada página, com
   a mesma chave). O orçamento não depende disto: ele só existe no aparelho
   da pessoa e faz parte do funcionamento da loja.
   ========================================================================== */
const CHAVE_COOKIES = "7fios_cookies";

function lerEscolhaCookies() {
  try {
    return localStorage.getItem(CHAVE_COOKIES);
  } catch (e) {
    return null;
  }
}

function gravarEscolhaCookies(valor) {
  try {
    localStorage.setItem(CHAVE_COOKIES, valor);
  } catch (e) {
    /* navegador sem armazenamento: a escolha vale só nesta página */
  }
}

function pararMedicao() {
  function gtag() { window.dataLayer.push(arguments); }
  gtag("consent", "update", {
    ad_storage: "denied", analytics_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied",
  });
  try { if (window.fbq) window.fbq("consent", "revoke"); } catch (e) {}
  try {
    if (window.clarity) {
      window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
      window.clarity("consent", false);
    }
  } catch (e) {}

  /* apaga os cookies de medição que já tinham sido gravados nesta visita */
  const medicao = /^(_ga|_gid|_gat|_gcl|_fbp|_fbc|_clck|_clsk)/;
  const host = location.hostname;
  const dominios = ["", host, "." + host.replace(/^www\./, "")];
  document.cookie.split(";").forEach((par) => {
    const nome = par.split("=")[0].trim();
    if (!medicao.test(nome)) return;
    dominios.forEach((d) => {
      document.cookie = nome + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
    });
  });
}

/* Enquanto o aviso está aberto, o botão verde do WhatsApp sobe para cima
   dele: no celular o aviso ocupa justamente a faixa de baixo, e o botão é o
   caminho de compra mais usado. */
function espacoDoAviso() {
  const aviso = $("#avisoCookies");
  const aberto = !!aviso && !aviso.hidden;
  if (aberto)
    document.documentElement.style.setProperty("--aviso-altura", aviso.offsetHeight + "px");
  document.body.classList.toggle("com-aviso", aberto);
}
addEventListener("resize", espacoDoAviso);

function mostrarAvisoCookies(forcar) {
  if (!forcar && lerEscolhaCookies()) return;

  let aviso = $("#avisoCookies");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "avisoCookies";
    aviso.className = "cookies";
    aviso.setAttribute("role", "region");
    aviso.setAttribute("aria-label", "Aviso de cookies");
    aviso.innerHTML = `
      <p>Usamos cookies para medir as visitas e o resultado dos nossos anúncios.
         Você pode recusar sem prejuízo para usar o site.
         <a href="privacidade.html">Política de privacidade</a></p>
      <div class="cookies__acoes">
        <button type="button" class="btn btn--linha btn--sm" data-cookies="recusado">Recusar</button>
        <button type="button" class="btn btn--gold btn--sm" data-cookies="aceito">Aceitar</button>
      </div>`;
    document.body.appendChild(aviso);

    aviso.addEventListener("click", (e) => {
      const botao = e.target.closest("[data-cookies]");
      if (!botao) return;
      const antes = lerEscolhaCookies();
      const escolha = botao.dataset.cookies;
      gravarEscolhaCookies(escolha);
      aviso.hidden = true;
      espacoDoAviso();
      if (escolha === "recusado") pararMedicao();
      /* voltou a aceitar depois de ter recusado: o Tag Manager não foi
         carregado nesta página, então recarrega para a medição voltar */
      else if (antes === "recusado") location.reload();
    });
  }
  aviso.hidden = false;
  espacoDoAviso();
}

addEventListener("click", (e) => {
  if (e.target.closest("[data-preferencias-cookies]")) mostrarAvisoCookies(true);
});

/* De onde na página partiu o clique. Serve para saber se quem chama no
   WhatsApp vem do botão verde flutuante, do card do produto ou do rodapé. */
function ondeEsta(el) {
  if (el.closest(".fab")) return "botao-flutuante";
  if (el.closest(".header")) return "cabecalho";
  if (el.closest(".topo")) return "tarja-do-topo";
  if (el.closest(".card")) return "card-do-produto";
  if (el.closest(".linha")) return "pagina-do-departamento";
  if (el.closest(".modal")) return "ficha-do-produto";
  if (el.closest(".drawer")) return "carrinho";
  if (el.closest(".rodape")) return "rodape";
  const secao = el.closest("section");
  if (secao) {
    if (secao.id) return secao.id;
    /* as seções de Contato e Sobre se identificam pelo título, não por id */
    const titulo = secao.getAttribute("aria-labelledby");
    if (titulo) return titulo.replace(/^t-/, "");
    const h = secao.querySelector("h1, h2");
    if (h) return h.textContent.trim().toLowerCase().slice(0, 40);
  }
  return "pagina";
}

/* Um ouvinte só, no documento: pega também o que nasce depois (os cards e o
   conteúdo do carrinho são montados por JS). */
addEventListener("click", (e) => {
  const el = e.target.closest("a, button, summary");
  if (!el) return;
  const onde = { origem: ondeEsta(el), pagina: location.pathname.split("/").pop() || "index.html" };

  if (el.id === "enviarPedido") {
    const itens = lerCarrinho();
    return rastrear("enviar_pedido", Object.assign({
      itens: itens.reduce((s, i) => s + i.qtd, 0),
      produtos: itens.length,
    }, onde));
  }
  if (el.hasAttribute("data-wpp")) return rastrear("clique_whatsapp", onde);
  if (el.hasAttribute("data-wpp-produto")) return rastrear("clique_whatsapp", onde);
  if (el.hasAttribute("data-tel-link")) return rastrear("clique_telefone", onde);
  if (el.hasAttribute("data-email-link")) return rastrear("clique_email", onde);
  if (el.hasAttribute("data-rota") || el.hasAttribute("data-mapa"))
    return rastrear("clique_mapa", onde);
  if (el.hasAttribute("data-avaliar")) return rastrear("clique_avaliacao", onde);
  if (el.hasAttribute("data-insta-link")) return rastrear("clique_instagram", onde);
  if (el.classList.contains("card__wpp")) return rastrear("clique_whatsapp", onde);
  if (el.id === "abrirCarrinho") return rastrear("abrir_carrinho", onde);
  if (el.tagName === "SUMMARY" && el.closest(".faq__item")) {
    const item = el.closest(".faq__item");
    /* só quando abre; fechar não diz nada */
    if (!item.open) return rastrear("abrir_duvida", { pergunta: el.textContent.trim() });
  }
});

/* Menu do celular. Ele é fixo e precisa nascer logo abaixo do cabeçalho,
   que também é fixo. Como a altura do cabeçalho muda conforme a rolagem
   (a tarja do topo some), a posição é recalculada na hora de abrir. */
function montarMenu() {
  const botao = $("#navToggle");
  const nav = $("#nav");
  const header = $("#header");
  if (!botao || !nav || !header) return;

  const fundo = document.createElement("div");
  fundo.className = "nav-fundo";
  fundo.hidden = true;
  document.body.appendChild(fundo);

  function encaixar() {
    nav.style.top = Math.max(0, Math.round(header.getBoundingClientRect().bottom)) + "px";
  }

  function mostrar(abrir) {
    if (abrir) encaixar();
    nav.classList.toggle("is-open", abrir);
    fundo.hidden = !abrir;
    botao.setAttribute("aria-expanded", abrir);
    botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  }

  botao.addEventListener("click", () => mostrar(!nav.classList.contains("is-open")));
  fundo.addEventListener("click", () => mostrar(false));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") mostrar(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) mostrar(false);
  });

  /* enquanto está aberto, continua colado no cabeçalho */
  addEventListener("scroll", () => {
    if (nav.classList.contains("is-open")) encaixar();
  }, { passive: true });
  addEventListener("resize", () => {
    if (nav.classList.contains("is-open")) encaixar();
    else nav.style.top = "";
  });
}

/* Categorias do rodapé: iguais em todas as páginas. O gerar-paginas.py já
   escreve no HTML os links para as páginas de cada departamento; este é só
   o plano B, para página que ainda não passou pelo gerador. */
function montarRodape() {
  const alvo = $("#footerDeps");
  if (!alvo || alvo.children.length || typeof VITRINE_CATEGORIAS === "undefined") return;
  alvo.innerHTML = VITRINE_CATEGORIAS.map(
    (c) =>
      `<li><a href="index.html?grupos=${c.grupos.join(",")}#loja"
              data-ir-grupos="${esc(c.grupos.join(","))}">${esc(c.nome)}</a></li>`
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
mostrarAvisoCookies();
