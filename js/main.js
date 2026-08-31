/* ==========================================================================
   7 FIOS TÊXTIL, motor da loja
   Você normalmente NÃO precisa mexer neste arquivo.
   Textos e produtos: js/produtos.js  |  telefone e mensagens: js/config.js
   Fotos: js/catalogo-imagens.js (gerado por ferramentas/preparar-imagens.py)
   ========================================================================== */

(function () {
  "use strict";

  const dinheiro = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const plural = (n, palavra) => (n > 1 ? `${n} ${palavra}s` : `${n} ${palavra}`);

  const SVG_WPP =
    '<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5l1 2.4c.1.2.1.4 0 .6l-.4.6-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.7-.1l1-1.2c.2-.2.4-.2.6-.1l2.2 1c.3.1.5.2.5.4v1Z"/></svg>';
  const SVG_MAIS =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z"/></svg>';

  /* Junta cada produto às suas fotos (ligação pelo slug). */
  PRODUTOS.forEach((p) => {
    const im = (typeof IMAGENS !== "undefined" && IMAGENS[p.slug]) || {};
    const dep = DEPARTAMENTOS[p.grupo];
    const fotoDep = (typeof CAPAS_DEP !== "undefined" && dep && CAPAS_DEP[dep.capa]) || null;
    p._capa = im.capa || fotoDep;
    p._semFoto = !im.capa;
    p._cores = im.cores || [];
    p._galeria = im.galeria || [];
    p._capaPropria = !!im.capaPropria;
    p._familias = Array.from(new Set(p._cores.map((c) => c.familia)));
  });

  const acharProduto = (sku) => PRODUTOS.find((p) => p.sku === sku);
  const nomeDep = (g) => (DEPARTAMENTOS[g] ? DEPARTAMENTOS[g].nome : g);
  const nomeCategoria = (grupo, id) => {
    const c = (CATEGORIAS[grupo] || []).find((x) => x.id === id);
    return c ? c.nome : id;
  };
  const nomeFamilia = (id) => {
    const f = FAMILIAS_COR.find((x) => x.id === id);
    return f ? f.nome : id;
  };
  const temPronta = (p) => (p.tags || []).some((t) => semAcento(t).includes("pronta"));
  const precoTexto = (p) => (p.preco ? dinheiro(p.preco) : "Preço sob consulta");

  /* Todas as fotos do produto, na ordem em que a ficha mostra. */
  function slidesDe(p) {
    const lista = [];
    if (p._capa && (p._capaPropria || !p._cores.length)) {
      if (p._capaPropria || !p._galeria.length) lista.push({ img: p._capa, legenda: "" });
    }
    p._galeria.forEach((g) => lista.push({ img: g, legenda: "" }));
    p._cores.forEach((c) => lista.push({ img: c.img, legenda: c.nome, cor: c.hex }));
    if (!lista.length && p._capa) lista.push({ img: p._capa, legenda: "" });
    return lista;
  }

  /* ====================================================================== */
  /*  ESTADO DA VITRINE                                                     */
  /* ====================================================================== */
  const estado = {
    grupos: new Set(),
    categorias: new Set(),
    cores: new Set(),
    pronta: false,
    busca: "",
    ordem: "relevancia",
  };

  /* ====================================================================== */
  /*  CARRINHO DE ORÇAMENTO                                                 */
  /* ====================================================================== */
  let carrinho = [];

  /* A leitura e a gravação são as mesmas de todas as páginas (js/comum.js),
     para o número do carrinho nunca discordar entre a loja e as outras. */
  function carregarCarrinho() {
    carrinho = lerCarrinho();
  }

  function salvarCarrinho() {
    gravarCarrinho(carrinho);
  }

  function addCarrinho(sku, qtd = 1, cor = "") {
    const item = carrinho.find((i) => i.sku === sku && (i.cor || "") === cor);
    if (item) item.qtd += qtd;
    else carrinho.push({ sku, qtd, cor });
    salvarCarrinho();
    pintarCarrinho();
    const p = acharProduto(sku);
    aviso(`${p.nome}${cor ? " · " + cor : ""} no orçamento`);
  }

  function mudarQtd(indice, delta) {
    const item = carrinho[indice];
    if (!item) return;
    item.qtd = Math.min(9999, item.qtd + delta);
    if (item.qtd < 1) carrinho.splice(indice, 1);
    salvarCarrinho();
    pintarCarrinho();
  }

  function pintarCarrinho() {
    const total = carrinho.reduce((s, i) => s + i.qtd, 0);
    const badge = $("#badgeCarrinho");
    badge.textContent = total;
    badge.hidden = total === 0;

    const caixa = $("#drawerItens");
    if (!carrinho.length) {
      caixa.innerHTML = `
        <div class="drawer__vazio">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h14l-1.6 8.4a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L5.4 3H2V1h5l.6 3ZM9 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm9 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/></svg>
          <strong>Seu orçamento está vazio</strong>
          Adicione produtos e envie a lista completa para o vendedor.
        </div>`;
    } else {
      caixa.innerHTML = carrinho
        .map((i, n) => {
          const p = acharProduto(i.sku);
          const foto = i.cor
            ? (p._cores.find((c) => c.nome === i.cor) || {}).mini || p._capa
            : p._capa;
          return `
          <div class="item" data-n="${n}">
            <div class="item__media">
              ${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : ""}
            </div>
            <div class="item__info">
              <p class="item__nome">${esc(p.nome)}</p>
              <p class="item__meta">${esc(p.sku)}${i.cor ? " · " + esc(i.cor) : ""} · por ${esc(p.unidade)}</p>
              <div class="item__linha">
                <div class="qtd">
                  <button type="button" data-item-qtd="-1" aria-label="Diminuir">−</button>
                  <input type="number" value="${i.qtd}" min="1" data-item-input aria-label="Quantidade de ${esc(p.nome)}">
                  <button type="button" data-item-qtd="1" aria-label="Aumentar">+</button>
                </div>
                <button class="item__remover" data-item-remover>Remover</button>
              </div>
            </div>
          </div>`;
        })
        .join("");
    }

    const linhas = carrinho.map((i) => {
      const p = acharProduto(i.sku);
      return `• ${p.nome}${i.cor ? ", cor " + i.cor : ""} (${p.sku}), ${plural(i.qtd, p.unidade)}`;
    });
    $("#enviarPedido").href = carrinho.length ? linkPedido(linhas) : linkWhatsApp();
  }

  /* ====================================================================== */
  /*  CARD DE PRODUTO                                                       */
  /* ====================================================================== */
  /* Duas cores muito parecidas viram uma bolinha só, para a fileira de
     bolinhas do card mostrar sempre tons diferentes entre si. */
  function coresDistintas(cores, limite = 34) {
    const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const longe = (a, b) =>
      Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i])) > limite;
    const saida = [];
    cores.forEach((c) => {
      if (saida.every((j) => longe(c.hex, j.hex))) saida.push(c);
    });
    return saida;
  }

  function cardHTML(p) {
    const distintas = coresDistintas(p._cores);
    const bolinhas = distintas
      .slice(0, 7)
      .map((c) => `<span class="bolinha" style="background:${esc(c.hex)}" title="${esc(c.nome)}"></span>`)
      .join("");
    const sobra =
      p._cores.length > 7 ? `<span class="bolinha__mais">+${p._cores.length - 7}</span>` : "";

    const rodape = p._cores.length
      ? `<div class="card__cores">${bolinhas}${sobra}</div>`
      : p._galeria.length > 1
      ? `<p class="card__fotos">${p._galeria.length} fotos</p>`
      : "";

    return `
      <article class="card" data-sku="${esc(p.sku)}">
        <div class="card__media" data-abrir>
          ${p._capa ? `<img src="${esc(p._capa)}" alt="${esc(p.nome)}" loading="lazy">` : ""}
          ${p._semFoto ? '<span class="card__embreve">Foto em breve</span>' : ""}
          <button class="card__olho" type="button" data-abrir>Ver detalhes</button>
        </div>
        <div class="card__corpo">
          <p class="card__cat">${esc(nomeDep(p.grupo))}</p>
          <h3 class="card__nome"><button type="button" data-abrir>${esc(p.nome)}</button></h3>
          <p class="card__resumo">${esc(p.resumo)}</p>
          ${rodape}
        </div>
        <div class="card__preco">
          <strong>${esc(precoTexto(p))}</strong>
          <small>${p._cores.length ? p._cores.length + " cores · " : ""}por ${esc(p.unidade)}</small>
        </div>
        <div class="card__acoes">
          <a class="card__wpp" href="${linkWhatsApp(p.nome)}" target="_blank" rel="noopener"
             aria-label="Consultar ${esc(p.nome)} no WhatsApp">${SVG_WPP} Consultar</a>
          <button class="card__add" type="button" data-add
                  aria-label="Adicionar ${esc(p.nome)} ao orçamento">${SVG_MAIS}</button>
        </div>
      </article>`;
  }

  /* ====================================================================== */
  /*  FILTRAGEM E ORDENAÇÃO                                                 */
  /* ====================================================================== */
  function filtrados() {
    const termo = semAcento(estado.busca).trim();
    const palavras = termo ? termo.split(/\s+/) : [];

    let lista = PRODUTOS.filter((p) => {
      if (estado.grupos.size && !estado.grupos.has(p.grupo)) return false;
      if (estado.categorias.size && !estado.categorias.has(`${p.grupo}:${p.categoria}`)) return false;
      if (estado.cores.size && !p._familias.some((f) => estado.cores.has(f))) return false;
      if (estado.pronta && !temPronta(p)) return false;
      if (!palavras.length) return true;

      const alvo = semAcento(
        [
          p.nome, p.sku, p.resumo, p.descricao, p.unidade,
          (p.tags || []).join(" "),
          p._cores.map((c) => c.nome).join(" "),
          p._familias.map(nomeFamilia).join(" "),
          nomeCategoria(p.grupo, p.categoria),
          nomeDep(p.grupo),
          Object.values(p.detalhes || {}).join(" "),
        ].join(" ")
      );
      return palavras.every((w) => alvo.includes(w));
    });

    const ordens = {
      vendidos: (a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0),
      novidades: (a, b) => (b.novidade ? 1 : 0) - (a.novidade ? 1 : 0),
      cores: (a, b) => b._cores.length - a._cores.length,
      az: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
      za: (a, b) => b.nome.localeCompare(a.nome, "pt-BR"),
    };
    if (ordens[estado.ordem]) lista = lista.slice().sort(ordens[estado.ordem]);

    return lista;
  }

  function pintarProdutos() {
    const lista = filtrados();
    const grade = $("#produtos");
    /* sem paginação: o que o filtro devolve aparece inteiro */
    const mostrar = lista;

    if (!lista.length) {
      grade.innerHTML = `
        <div class="vazio">
          <strong>Nenhum produto encontrado</strong>
          Nosso estoque é maior que o site, pergunte ao vendedor pelo WhatsApp.
          <a class="btn btn--wpp" href="${linkWhatsApp()}" target="_blank" rel="noopener">${SVG_WPP} Falar com o vendedor</a>
        </div>`;
    } else {
      grade.innerHTML = mostrar.map(cardHTML).join("");
    }

    $("#contagem").innerHTML = lista.length
      ? `<strong>${lista.length}</strong> ${lista.length === 1 ? "produto" : "produtos"}`
      : "Nenhum produto encontrado";

    let atual = "Todos os produtos";
    if (estado.busca.trim()) atual = `Busca: "${estado.busca.trim()}"`;
    else if (estado.categorias.size === 1) {
      const [g, c] = Array.from(estado.categorias)[0].split(":");
      atual = `${nomeDep(g)} · ${nomeCategoria(g, c)}`;
    } else if (estado.grupos.size) {
      /* se a seleção bate com uma categoria ou com um atalho, usa o nome
         curto em vez de emendar os departamentos um a um */
      const combina = (lista) =>
        lista.find(
          (c) =>
            c.grupos.length === estado.grupos.size &&
            c.grupos.every((g) => estado.grupos.has(g))
        );
      const achou =
        combina(VITRINE_CATEGORIAS) ||
        (typeof ATALHOS_CELULAR !== "undefined" ? combina(ATALHOS_CELULAR) : null);
      atual = achou ? achou.nome : Array.from(estado.grupos).map(nomeDep).join(" e ");
    }
    $("#crumbAtual").textContent = atual;

    pintarTagsAtivas();
    marcarFiltros();
  }

  function pintarTagsAtivas() {
    const tags = [];
    estado.grupos.forEach((g) => tags.push({ tipo: "grupo", valor: g, rotulo: nomeDep(g) }));
    estado.categorias.forEach((k) => {
      const [g, c] = k.split(":");
      tags.push({ tipo: "categoria", valor: k, rotulo: nomeCategoria(g, c) });
    });
    estado.cores.forEach((c) =>
      tags.push({ tipo: "cor", valor: c, rotulo: `Cor: ${nomeFamilia(c)}` })
    );
    if (estado.pronta) tags.push({ tipo: "pronta", valor: "1", rotulo: "Pronta entrega" });
    if (estado.busca.trim())
      tags.push({ tipo: "busca", valor: "1", rotulo: `Busca: ${estado.busca.trim()}` });

    $("#tagsAtivas").innerHTML = tags
      .map(
        (t) =>
          `<button class="tag-ativa" data-tirar="${esc(t.tipo)}" data-valor="${esc(t.valor)}">
             <b>${esc(t.rotulo)}</b><i>×</i>
           </button>`
      )
      .join("");
  }

  function marcarFiltros() {
    $$("#fDepartamento input").forEach((i) => (i.checked = estado.grupos.has(i.value)));
    $$("#fCategoria input").forEach((i) => (i.checked = estado.categorias.has(i.value)));
    $$(".cor-btn").forEach((b) => {
      const ativo = estado.cores.has(b.dataset.cor);
      b.classList.toggle("is-active", ativo);
      b.setAttribute("aria-pressed", ativo);
    });
    $("#fPronta").checked = estado.pronta;

    if (typeof ATALHOS_CELULAR !== "undefined") {
      $$("#atalhosDep .atalho-dep").forEach((botao) => {
        const escolha = ATALHOS_CELULAR[Number(botao.dataset.atalho)];
        const ligado = mesmaSelecao(escolha.grupos);
        botao.classList.toggle("is-ativo", ligado);
        botao.setAttribute("aria-pressed", ligado);
      });
    }
  }

  function reiniciarPagina() {
    pintarProdutos();
  }

  /* ====================================================================== */
  /*  MONTAGEM DA PÁGINA                                                    */
  /* ====================================================================== */
  /* Atalhos que ficam logo abaixo da migalha no celular. Cada um troca o
     filtro de departamento; tocar no que já está ligado volta para todos. */
  function mesmaSelecao(grupos) {
    return (
      estado.grupos.size === grupos.length && grupos.every((g) => estado.grupos.has(g))
    );
  }

  function montarAtalhos() {
    const alvo = $("#atalhosDep");
    if (!alvo || typeof ATALHOS_CELULAR === "undefined") return;

    alvo.innerHTML = ATALHOS_CELULAR.map(
      (a, i) =>
        `<button class="atalho-dep" type="button" data-atalho="${i}" aria-pressed="false">${esc(a.nome)}</button>`
    ).join("");

    alvo.addEventListener("click", (e) => {
      const botao = e.target.closest("[data-atalho]");
      if (!botao) return;
      const escolha = ATALHOS_CELULAR[Number(botao.dataset.atalho)];
      estado.categorias.clear();
      const jaEstava = mesmaSelecao(escolha.grupos);
      estado.grupos.clear();
      if (!jaEstava) escolha.grupos.forEach((g) => estado.grupos.add(g));
      estado.busca = "";
      $("#inputBusca").value = "";
      $("#limparBusca").hidden = true;
      reiniciarPagina();
    });
  }

  function montarFiltros() {
    $("#fDepartamento").innerHTML = Object.keys(DEPARTAMENTOS)
      .map((g) => {
        const n = PRODUTOS.filter((p) => p.grupo === g).length;
        if (!n) return "";
        return `<label class="check">
                  <input type="checkbox" value="${esc(g)}" data-f="grupo">
                  <span>${esc(nomeDep(g))}</span><em>(${n})</em>
                </label>`;
      })
      .join("");

    $("#fCategoria").innerHTML = Object.keys(CATEGORIAS)
      .map((g) => {
        const itens = CATEGORIAS[g]
          .map((c) => {
            const n = PRODUTOS.filter((p) => p.grupo === g && p.categoria === c.id).length;
            if (!n) return "";
            return `<label class="check">
                      <input type="checkbox" value="${esc(g)}:${esc(c.id)}" data-f="categoria">
                      <span>${esc(c.nome)}</span><em>(${n})</em>
                    </label>`;
          })
          .join("");
        /* o nome do departamento evita dois "Lisos" iguais na lista */
        return itens ? `<p class="filtro__grupo">${esc(nomeDep(g))}</p>${itens}` : "";
      })
      .join("");

    const usadas = new Set();
    PRODUTOS.forEach((p) => p._familias.forEach((f) => usadas.add(f)));
    $("#fCores").innerHTML = FAMILIAS_COR.filter((c) => usadas.has(c.id))
      .map(
        (c) =>
          `<button class="cor-btn" type="button" data-cor="${esc(c.id)}" aria-pressed="false"
                   style="background:${esc(c.hex)}" title="${esc(c.nome)}"
                   aria-label="Filtrar pela cor ${esc(c.nome)}"></button>`
      )
      .join("");
  }

  /* ====================================================================== */
  /*  NOSSAS CATEGORIAS                                                     */
  /*  Painéis encostados: o ativo abre e mostra o selo, o nome e a frase;   */
  /*  os outros ficam como faixas só com o selo. Passar o mouse troca o     */
  /*  ativo; clicar leva para a loja já filtrada naquele departamento.      */
  /* ====================================================================== */
  let categoriaAtiva = 0;

  function pintarCategorias() {
    $$("#categorias .sel").forEach((painel, i) => {
      const ativo = i === categoriaAtiva;
      painel.style.flexGrow = ativo ? "6" : "1";
      painel.classList.toggle("is-ativo", ativo);
      painel.setAttribute("aria-selected", ativo);
      painel.tabIndex = ativo ? 0 : -1;
    });
  }

  function montarCategorias() {
    const alvo = $("#categorias");
    if (!alvo) return;

    alvo.innerHTML = VITRINE_CATEGORIAS.map((c, i) => {
      const foto = (typeof CAPAS_DEP !== "undefined" && CAPAS_DEP[c.capa]) || "";
      return `
        <button class="sel" type="button" role="tab" data-i="${i}"
                aria-selected="${i === 0}" aria-label="${esc(c.nome)}">
          ${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : ""}
          <span class="sel__veu"></span>
          <span class="sel__selo">
            <svg viewBox="0 0 24 24" aria-hidden="true">${c.icone || ""}</svg>
          </span>
          <span class="sel__txt">
            <strong>${esc(c.nome)}</strong>
            <small>${esc(c.resumo)}</small>
          </span>
        </button>`;
    }).join("");

    alvo.addEventListener("mousemove", (e) => {
      const painel = e.target.closest(".sel");
      if (!painel) return;
      const i = Number(painel.dataset.i);
      if (i !== categoriaAtiva) {
        categoriaAtiva = i;
        pintarCategorias();
      }
    });

    alvo.addEventListener("click", (e) => {
      const painel = e.target.closest(".sel");
      if (!painel) return;
      const i = Number(painel.dataset.i);
      if (i !== categoriaAtiva) {
        categoriaAtiva = i;
        pintarCategorias();
        return;
      }
      const cat = VITRINE_CATEGORIAS[i];
      estado.categorias.clear();
      estado.grupos.clear();
      cat.grupos.forEach((g) => estado.grupos.add(g));
      estado.busca = "";
      $("#inputBusca").value = "";
      $("#limparBusca").hidden = true;
      reiniciarPagina();
      irParaLoja();
    });

    alvo.addEventListener("keydown", (e) => {
      const passos = { ArrowRight: 1, ArrowLeft: -1 };
      if (passos[e.key] === undefined) return;
      e.preventDefault();
      const total = VITRINE_CATEGORIAS.length;
      categoriaAtiva = (categoriaAtiva + passos[e.key] + total) % total;
      pintarCategorias();
      $$("#categorias .sel")[categoriaAtiva].focus();
    });

    seguirRolagem(alvo);
    pintarCategorias();
  }

  /* No celular os painéis ficam empilhados e não há como passar o mouse.
     Então quem manda é a rolagem: o painel mais perto do meio da tela vai
     abrindo sozinho enquanto a pessoa desce a página. */
  function seguirRolagem(alvo) {
    const empilhado = () => window.matchMedia("(max-width: 760px)").matches;
    let pendente = false;

    function conferir() {
      pendente = false;
      if (!empilhado()) return;

      const caixa = alvo.getBoundingClientRect();
      const altura = window.innerHeight;
      /* fora da tela: não mexe em nada */
      if (caixa.bottom < 0 || caixa.top > altura) return;

      const total = VITRINE_CATEGORIAS.length;
      const cabecalho = $("#header");
      const teto = cabecalho ? cabecalho.getBoundingClientRect().bottom : 0;

      /* A troca começa cedo: assim que a faixa aparece na parte de baixo da
         tela já entra o primeiro departamento, e termina no último quando o
         fim dela passa pelo cabeçalho. Cada um ganha a sua vez. */
      const comeco = altura * 0.85;
      const trecho = comeco - teto + caixa.height;
      const andamento = Math.min(1, Math.max(0, (comeco - caixa.top) / trecho));
      const escolhido = Math.min(total - 1, Math.floor(andamento * total));

      if (escolhido !== categoriaAtiva) {
        categoriaAtiva = escolhido;
        pintarCategorias();
      }
    }

    addEventListener(
      "scroll",
      () => {
        if (pendente) return;
        pendente = true;
        requestAnimationFrame(conferir);
      },
      { passive: true }
    );
    addEventListener("resize", conferir);
    conferir();
  }

  function montarBanners() {
    if (typeof BANNERS === "undefined") return;
    const par = [
      ["#bannerHero", BANNERS.hero],
      ["#bannerMicrofibras", BANNERS.microfibras],
      ["#bannerAviamentos", BANNERS.aviamentos],
    ];
    par.forEach(([sel, url]) => {
      const el = $(sel);
      /* resolve contra a página: dentro do CSS o caminho valeria a partir de css/ */
      if (el && url) {
        el.style.setProperty("--foto", `url("${new URL(url, document.baseURI).href}")`);
      }
    });
  }

  /* ====================================================================== */
  /*  FICHA DO PRODUTO                                                      */
  /* ====================================================================== */
  const modal = $("#modal");
  let skuAberto = null;
  let focoAnterior = null;
  let slides = [];
  let slideAtual = 0;

  function mostrarSlide(i) {
    if (!slides.length) return;
    slideAtual = (i + slides.length) % slides.length;
    const s = slides[slideAtual];
    const img = $("#modalImg");
    img.src = s.img;
    img.alt = s.legenda || $("#modalTitulo").textContent;
    $("#modalLegenda").textContent = s.legenda || "";
    $("#modalLegenda").hidden = !s.legenda;
    $("#modalContador").textContent = `${slideAtual + 1}/${slides.length}`;
    $$("#modalCores .amostra").forEach((b) =>
      b.classList.toggle("is-active", Number(b.dataset.slide) === slideAtual)
    );
    const ativo = $("#modalCores .amostra.is-active");
    if (ativo) ativo.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function abrirFicha(sku) {
    const p = acharProduto(sku);
    if (!p) return;
    skuAberto = sku;
    focoAnterior = document.activeElement;

    $("#modalCat").textContent = `${nomeDep(p.grupo)} · ${nomeCategoria(p.grupo, p.categoria)}`;
    $("#modalTitulo").textContent = p.nome;
    $("#modalSku").textContent = `Código ${p.sku}`;
    $("#modalPreco").innerHTML = `${esc(precoTexto(p))}<small>vendido por ${esc(p.unidade)}</small>`;
    $("#modalDesc").textContent = p.descricao || p.resumo || "";

    slides = slidesDe(p);
    const galeriaVisivel = slides.length > 1;
    $$(".seta").forEach((s) => (s.hidden = !galeriaVisivel));
    $("#modalContador").hidden = !galeriaVisivel;

    $("#modalCoresTitulo").hidden = !p._cores.length;
    $("#modalCoresTitulo").textContent = `${p._cores.length} cores disponíveis`;
    const base = slides.length - p._cores.length;
    $("#modalCores").innerHTML = p._cores
      .map(
        (c, i) => `
        <button class="amostra" type="button" data-slide="${base + i}" title="${esc(c.nome)}">
          <img src="${esc(c.mini)}" alt="" loading="lazy">
          <span>${esc(c.nome)}</span>
        </button>`
      )
      .join("");

    const det = p.detalhes || {};
    const linhas = Object.keys(det).map(
      (k) => `<div><dt>${esc(k)}</dt><dd>${esc(det[k])}</dd></div>`
    );
    if (p._cores.length)
      linhas.push(`<div><dt>Cores em estoque</dt><dd>${p._cores.length}</dd></div>`);
    $("#modalSpecs").innerHTML = linhas.join("");

    $("#modalQtd").value = 1;
    $("#modalWpp").href = linkWhatsApp(p.nome);

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    mostrarSlide(0);
    $(".modal__x", modal).focus();
  }

  function fecharFicha() {
    modal.hidden = true;
    skuAberto = null;
    if (!$("#drawer").hidden) return;
    document.body.style.overflow = "";
    if (focoAnterior) focoAnterior.focus();
  }

  /* deslizar com o dedo na foto */
  (function arrastar() {
    const area = $("#modalMedia");
    let x0 = null;
    area.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    area.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) mostrarSlide(slideAtual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  })();

  /* ====================================================================== */
  /*  DRAWER DO ORÇAMENTO                                                   */
  /* ====================================================================== */
  const drawer = $("#drawer");
  function abrirDrawer() {
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    $(".drawer__x", drawer).focus();
  }
  function fecharDrawer() {
    drawer.hidden = true;
    if (modal.hidden) document.body.style.overflow = "";
  }

  /* ====================================================================== */
  /*  AVISO RÁPIDO                                                          */
  /* ====================================================================== */
  let timerAviso;
  function aviso(texto) {
    const el = $("#toast");
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => (el.hidden = true), 2600);
  }

  /* ====================================================================== */
  /*  EVENTOS                                                               */
  /* ====================================================================== */
  const irParaLoja = () => $("#loja").scrollIntoView({ behavior: "smooth", block: "start" });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-fechar]")) return fecharFicha();
    if (e.target.closest("[data-fechar-drawer]")) return fecharDrawer();

    const seta = e.target.closest("[data-seta]");
    if (seta) return mostrarSlide(slideAtual + Number(seta.dataset.seta));

    const amostra = e.target.closest(".amostra");
    if (amostra) return mostrarSlide(Number(amostra.dataset.slide));

    const abrir = e.target.closest("[data-abrir]");
    if (abrir) {
      const card = abrir.closest(".card");
      if (card) return abrirFicha(card.dataset.sku);
    }

    const add = e.target.closest("[data-add]");
    if (add) {
      const card = add.closest(".card");
      if (card) return addCarrinho(card.dataset.sku, 1);
    }

    const irDep = e.target.closest("[data-ir-dep], [data-ir-grupos]");
    if (irDep) {
      estado.categorias.clear();
      estado.grupos.clear();
      const grupos = irDep.dataset.irGrupos
        ? irDep.dataset.irGrupos.split(",")
        : [irDep.dataset.irDep];
      grupos.forEach((g) => estado.grupos.add(g));
      estado.busca = "";
      $("#inputBusca").value = "";
      $("#limparBusca").hidden = true;
      reiniciarPagina();
      irParaLoja();
      $("#nav").classList.remove("is-open");
      return;
    }

    const tirar = e.target.closest("[data-tirar]");
    if (tirar) {
      const { tirar: tipo, valor } = tirar.dataset;
      if (tipo === "grupo") estado.grupos.delete(valor);
      if (tipo === "categoria") estado.categorias.delete(valor);
      if (tipo === "cor") estado.cores.delete(valor);
      if (tipo === "pronta") estado.pronta = false;
      if (tipo === "busca") {
        estado.busca = "";
        $("#inputBusca").value = "";
        $("#limparBusca").hidden = true;
      }
      return reiniciarPagina();
    }

    const cor = e.target.closest(".cor-btn");
    if (cor) {
      const id = cor.dataset.cor;
      estado.cores.has(id) ? estado.cores.delete(id) : estado.cores.add(id);
      return reiniciarPagina();
    }

    const qtdItem = e.target.closest("[data-item-qtd]");
    if (qtdItem) {
      return mudarQtd(Number(qtdItem.closest(".item").dataset.n), Number(qtdItem.dataset.itemQtd));
    }
    const remover = e.target.closest("[data-item-remover]");
    if (remover) {
      carrinho.splice(Number(remover.closest(".item").dataset.n), 1);
      salvarCarrinho();
      return pintarCarrinho();
    }

    const qtdFicha = e.target.closest("[data-qtd]");
    if (qtdFicha) {
      const campo = $("#modalQtd");
      campo.value = Math.max(1, Number(campo.value || 1) + Number(qtdFicha.dataset.qtd));
    }
  });

  $("#modalAdd").addEventListener("click", () => {
    if (!skuAberto) return;
    const p = acharProduto(skuAberto);
    const s = slides[slideAtual] || {};
    const cor = p._cores.length && s.legenda ? s.legenda : "";
    const pedido = Math.floor(Number($("#modalQtd").value));
    const quantos = Number.isFinite(pedido) ? Math.min(9999, Math.max(1, pedido)) : 1;
    addCarrinho(skuAberto, quantos, cor);
    fecharFicha();
    abrirDrawer();
  });

  $("#drawerItens").addEventListener("change", (e) => {
    const campo = e.target.closest("[data-item-input]");
    if (!campo) return;
    const item = carrinho[Number(campo.closest(".item").dataset.n)];
    const digitado = Math.floor(Number(campo.value));
    const nova = Number.isFinite(digitado) ? Math.min(9999, Math.max(1, digitado)) : 1;
    if (item) item.qtd = nova;
    salvarCarrinho();
    pintarCarrinho();
  });

  $("#abrirCarrinho").addEventListener("click", abrirDrawer);
  $("#limparCarrinho").addEventListener("click", () => {
    carrinho = [];
    salvarCarrinho();
    pintarCarrinho();
    aviso("Orçamento esvaziado");
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.hidden) {
      if (e.key === "Escape") return fecharFicha();
      if (e.key === "ArrowRight") return mostrarSlide(slideAtual + 1);
      if (e.key === "ArrowLeft") return mostrarSlide(slideAtual - 1);
      return;
    }
    if (e.key !== "Escape") return;
    if (!drawer.hidden) fecharDrawer();
    else verFiltros(false);
  });

  let timerBusca;
  $("#inputBusca").addEventListener("input", (e) => {
    estado.busca = e.target.value;
    $("#limparBusca").hidden = !e.target.value;
    clearTimeout(timerBusca);
    timerBusca = setTimeout(reiniciarPagina, 140);
  });
  $("#inputBusca").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(timerBusca);
      reiniciarPagina();
      irParaLoja();
    }
  });
  $("#limparBusca").addEventListener("click", () => {
    estado.busca = "";
    $("#inputBusca").value = "";
    $("#limparBusca").hidden = true;
    reiniciarPagina();
  });

  $("#filtros").addEventListener("change", (e) => {
    const campo = e.target;
    if (campo.dataset.f === "grupo") {
      campo.checked ? estado.grupos.add(campo.value) : estado.grupos.delete(campo.value);
    } else if (campo.dataset.f === "categoria") {
      campo.checked ? estado.categorias.add(campo.value) : estado.categorias.delete(campo.value);
    } else if (campo.id === "fPronta") {
      estado.pronta = campo.checked;
    } else return;
    reiniciarPagina();
  });

  $("#limparFiltros").addEventListener("click", () => {
    estado.grupos.clear();
    estado.categorias.clear();
    estado.cores.clear();
    estado.pronta = false;
    estado.busca = "";
    $("#inputBusca").value = "";
    $("#limparBusca").hidden = true;
    reiniciarPagina();
  });

  $("#ordenar").addEventListener("change", (e) => {
    estado.ordem = e.target.value;
    reiniciarPagina();
  });

  function verFiltros(abrir) {
    $("#filtros").classList.toggle("is-open", abrir);
    $("#filtrosFundo").hidden = !abrir;
    document.body.style.overflow = abrir ? "hidden" : "";
  }
  $("#abrirFiltros").addEventListener("click", () => verFiltros(true));
  $("#fecharFiltros").addEventListener("click", () => verFiltros(false));
  $("#filtrosFundo").addEventListener("click", () => verFiltros(false));

  /* ====================================================================== */
  /*  INÍCIO                                                                */
  /* ====================================================================== */
  const alvoCores = $("#totalCores");
  if (alvoCores) {
    const cores = PRODUTOS.reduce((t, p) => t + p._cores.length, 0);
    alvoCores.textContent = `+${Math.floor(cores / 10) * 10}`;
  }
  montarBanners();
  montarFiltros();
  montarAtalhos();
  /* Se veio de outra página com filtro ou busca na URL, já aplica. */
  const parametros = new URLSearchParams(location.search);
  const buscaUrl = parametros.get("busca");
  if (buscaUrl) {
    estado.busca = buscaUrl;
    $("#inputBusca").value = buscaUrl;
    $("#limparBusca").hidden = false;
  }
  const gruposUrl = parametros.get("grupos");
  if (gruposUrl) gruposUrl.split(",").forEach((g) => estado.grupos.add(g));

  montarCategorias();
  carregarCarrinho();
  pintarCarrinho();
  pintarProdutos();
})();
