/* ==========================================================================
   7 FIOS TÊXTIL — motor da loja
   Você normalmente NÃO precisa mexer neste arquivo.
   Produtos ficam em js/produtos.js  |  telefone e textos em js/config.js
   ========================================================================== */

(function () {
  "use strict";

  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  const esc = (t) =>
    String(t == null ? "" : t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const semAcento = (t) =>
    String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const dinheiro = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const plural = (n, palavra) => (n > 1 ? `${n} ${palavra}s` : `${n} ${palavra}`);

  const GRUPOS = {
    tecidos: { nome: "Tecidos", sub: "Malhas, esportivos e planos" },
    outros:  { nome: "Aviamentos", sub: "Elásticos, rendas e acabamentos" },
  };

  const SVG_WPP =
    '<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5l1 2.4c.1.2.1.4 0 .6l-.4.6-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.7-.1l1-1.2c.2-.2.4-.2.6-.1l2.2 1c.3.1.5.2.5.4v1Z"/></svg>';
  const SVG_MAIS =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z"/></svg>';

  const acharProduto = (sku) => PRODUTOS.find((p) => p.sku === sku);
  const nomeCategoria = (grupo, id) => {
    const c = (CATEGORIAS[grupo] || []).find((x) => x.id === id);
    return c ? c.nome : id;
  };
  const corHex = (id) => {
    const c = CORES.find((x) => x.id === id);
    return c ? c.hex : "#CCC";
  };
  const nomeCor = (id) => {
    const c = CORES.find((x) => x.id === id);
    return c ? c.nome : id;
  };
  const temPronta = (p) => (p.tags || []).some((t) => semAcento(t).includes("pronta"));
  const precoTexto = (p) => (p.preco ? dinheiro(p.preco) : "Preço sob consulta");

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
    pagina: 1,
  };

  /* ====================================================================== */
  /*  CARRINHO DE ORÇAMENTO                                                 */
  /* ====================================================================== */
  const CHAVE = "7fios_orcamento";
  let carrinho = [];

  function carregarCarrinho() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      carrinho = bruto ? JSON.parse(bruto) : [];
    } catch (e) {
      carrinho = [];
    }
    carrinho = carrinho.filter((i) => acharProduto(i.sku));
  }

  function salvarCarrinho() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(carrinho));
    } catch (e) {
      /* navegador sem armazenamento: o orçamento vale só nesta visita */
    }
  }

  function addCarrinho(sku, qtd = 1) {
    const item = carrinho.find((i) => i.sku === sku);
    if (item) item.qtd += qtd;
    else carrinho.push({ sku, qtd });
    salvarCarrinho();
    pintarCarrinho();
    const p = acharProduto(sku);
    aviso(`${p.nome} adicionado ao orçamento`);
  }

  function mudarQtd(sku, delta) {
    const item = carrinho.find((i) => i.sku === sku);
    if (!item) return;
    item.qtd += delta;
    if (item.qtd < 1) carrinho = carrinho.filter((i) => i.sku !== sku);
    salvarCarrinho();
    pintarCarrinho();
  }

  function removerCarrinho(sku) {
    carrinho = carrinho.filter((i) => i.sku !== sku);
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
        .map((i) => {
          const p = acharProduto(i.sku);
          return `
          <div class="item" data-sku="${esc(p.sku)}" style="--swatch:${esc(p.cor || "#1D0E47")}">
            <div class="item__media${p.imagem ? "" : " card__media--swatch"}">
              ${p.imagem ? `<img src="${esc(p.imagem)}" alt="">` : ""}
            </div>
            <div class="item__info">
              <p class="item__nome">${esc(p.nome)}</p>
              <p class="item__meta">${esc(p.sku)} · vendido por ${esc(p.unidade)}</p>
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
      return `• ${p.nome} (${p.sku}) — ${plural(i.qtd, p.unidade)}`;
    });
    $("#enviarPedido").href = carrinho.length ? linkPedido(linhas) : linkWhatsApp();
  }

  /* ====================================================================== */
  /*  CARD DE PRODUTO                                                       */
  /* ====================================================================== */
  function cardHTML(p) {
    const rotulos = (p.tags || []).slice();
    if (p.novidade && !rotulos.some((t) => semAcento(t) === "novidade")) rotulos.push("Novidade");
    const selos = rotulos.map(
      (t) =>
        `<span class="selo${semAcento(t) === "novidade" ? " selo--novo" : ""}">${esc(t)}</span>`
    );

    const bolinhas = (p.cores || [])
      .slice(0, 6)
      .map((c) => `<span class="bolinha" style="background:${esc(corHex(c))}" title="${esc(nomeCor(c))}"></span>`)
      .join("");

    return `
      <article class="card" data-sku="${esc(p.sku)}" style="--swatch:${esc(p.cor || "#1D0E47")}">
        <div class="card__media${p.imagem ? "" : " card__media--swatch"}" data-abrir>
          ${selos.length ? `<div class="card__selos">${selos.join("")}</div>` : ""}
          ${p.imagem ? `<img src="${esc(p.imagem)}" alt="${esc(p.nome)}" loading="lazy">` : ""}
          <button class="card__olho" type="button" data-abrir>Ver detalhes</button>
        </div>
        <div class="card__corpo">
          <p class="card__cat">${esc(nomeCategoria(p.grupo, p.categoria))}</p>
          <h3 class="card__nome"><button type="button" data-abrir>${esc(p.nome)}</button></h3>
          <p class="card__resumo">${esc(p.resumo)}</p>
          <div class="card__cores">${bolinhas}</div>
        </div>
        <div class="card__preco">
          <strong>${esc(precoTexto(p))}</strong>
          <small>vendido por ${esc(p.unidade)}</small>
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
      if (estado.cores.size && !(p.cores || []).some((c) => estado.cores.has(c))) return false;
      if (estado.pronta && !temPronta(p)) return false;
      if (!palavras.length) return true;

      const alvo = semAcento(
        [
          p.nome, p.sku, p.resumo, p.descricao, p.unidade,
          (p.tags || []).join(" "),
          (p.cores || []).map(nomeCor).join(" "),
          nomeCategoria(p.grupo, p.categoria),
          GRUPOS[p.grupo].nome,
          Object.values(p.detalhes || {}).join(" "),
        ].join(" ")
      );
      return palavras.every((w) => alvo.includes(w));
    });

    const ordens = {
      vendidos: (a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0),
      novidades: (a, b) => (b.novidade ? 1 : 0) - (a.novidade ? 1 : 0),
      az: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
      za: (a, b) => b.nome.localeCompare(a.nome, "pt-BR"),
    };
    if (ordens[estado.ordem]) lista = lista.slice().sort(ordens[estado.ordem]);

    return lista;
  }

  function pintarProdutos() {
    const lista = filtrados();
    const grade = $("#produtos");
    const mostrar = lista.slice(0, estado.pagina * CONFIG.porPagina);

    if (!lista.length) {
      grade.innerHTML = `
        <div class="vazio">
          <strong>Nenhum produto encontrado</strong>
          Nosso estoque é maior que o site — pergunte ao vendedor pelo WhatsApp.
          <a class="btn btn--wpp" href="${linkWhatsApp()}" target="_blank" rel="noopener">${SVG_WPP} Falar com o vendedor</a>
        </div>`;
    } else {
      grade.innerHTML = mostrar.map(cardHTML).join("");
    }

    $("#contagem").innerHTML = lista.length
      ? `Mostrando <strong>${mostrar.length}</strong> de <strong>${lista.length}</strong> produtos`
      : "Nenhum produto encontrado";

    const botao = $("#carregarMais");
    botao.hidden = mostrar.length >= lista.length;

    /* Rótulo do caminho (breadcrumb) */
    let atual = "Todos os produtos";
    if (estado.busca.trim()) atual = `Busca: "${estado.busca.trim()}"`;
    else if (estado.categorias.size === 1) {
      const [g, c] = Array.from(estado.categorias)[0].split(":");
      atual = nomeCategoria(g, c);
    } else if (estado.grupos.size === 1) {
      atual = GRUPOS[Array.from(estado.grupos)[0]].nome;
    }
    $("#crumbAtual").textContent = atual;

    pintarTagsAtivas();
    marcarFiltros();
  }

  function pintarTagsAtivas() {
    const tags = [];
    estado.grupos.forEach((g) =>
      tags.push({ tipo: "grupo", valor: g, rotulo: GRUPOS[g].nome })
    );
    estado.categorias.forEach((k) => {
      const [g, c] = k.split(":");
      tags.push({ tipo: "categoria", valor: k, rotulo: nomeCategoria(g, c) });
    });
    estado.cores.forEach((c) =>
      tags.push({ tipo: "cor", valor: c, rotulo: `Cor: ${nomeCor(c)}` })
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
    $$(".cor-btn").forEach((b) =>
      b.classList.toggle("is-active", estado.cores.has(b.dataset.cor))
    );
    $("#fPronta").checked = estado.pronta;
  }

  function reiniciarPagina() {
    estado.pagina = 1;
    pintarProdutos();
  }

  /* ====================================================================== */
  /*  MONTAGEM DOS FILTROS                                                  */
  /* ====================================================================== */
  function montarFiltros() {
    $("#fDepartamento").innerHTML = Object.keys(GRUPOS)
      .map((g) => {
        const n = PRODUTOS.filter((p) => p.grupo === g).length;
        return `<label class="check">
                  <input type="checkbox" value="${esc(g)}" data-f="grupo">
                  <span>${esc(GRUPOS[g].nome)}</span><em>(${n})</em>
                </label>`;
      })
      .join("");

    $("#fCategoria").innerHTML = Object.keys(CATEGORIAS)
      .flatMap((g) =>
        CATEGORIAS[g].map((c) => {
          const n = PRODUTOS.filter((p) => p.grupo === g && p.categoria === c.id).length;
          if (!n) return "";
          return `<label class="check">
                    <input type="checkbox" value="${esc(g)}:${esc(c.id)}" data-f="categoria">
                    <span>${esc(c.nome)}</span><em>(${n})</em>
                  </label>`;
        })
      )
      .join("");

    $("#fCores").innerHTML = CORES.filter((c) =>
      PRODUTOS.some((p) => (p.cores || []).includes(c.id))
    )
      .map(
        (c) =>
          `<button class="cor-btn" type="button" data-cor="${esc(c.id)}"
                   style="background:${esc(c.hex)}" title="${esc(c.nome)}"
                   aria-label="Filtrar pela cor ${esc(c.nome)}"></button>`
      )
      .join("");
  }

  function montarDepartamentos() {
    const alvo = $("#deps");
    const blocos = [];

    Object.keys(CATEGORIAS).forEach((g) => {
      CATEGORIAS[g].forEach((c) => {
        const itens = PRODUTOS.filter((p) => p.grupo === g && p.categoria === c.id);
        if (!itens.length) return;
        blocos.push(`
          <button class="dep" type="button" data-dep-cat="${esc(g)}:${esc(c.id)}"
                  style="--swatch:${esc(itens[0].cor || "#1D0E47")}">
            <span class="dep__bolha card__media--swatch"></span>
            <strong>${esc(c.nome)}</strong>
            <small>${itens.length} ${itens.length === 1 ? "produto" : "produtos"}</small>
          </button>`);
      });
    });

    alvo.innerHTML = blocos.join("");

    $("#footerDeps").innerHTML = Object.keys(CATEGORIAS)
      .flatMap((g) =>
        CATEGORIAS[g]
          .filter((c) => PRODUTOS.some((p) => p.grupo === g && p.categoria === c.id))
          .map(
            (c) =>
              `<li><button type="button" data-dep-cat="${esc(g)}:${esc(c.id)}">${esc(c.nome)}</button></li>`
          )
      )
      .join("");
  }

  function montarVitrines() {
    const destaques = PRODUTOS.filter((p) => p.destaque);
    const novidades = PRODUTOS.filter((p) => p.novidade);
    $("#vitrineDestaques").innerHTML = destaques.map(cardHTML).join("");
    $("#vitrineNovidades").innerHTML = (novidades.length ? novidades : PRODUTOS.slice(0, 4))
      .map(cardHTML)
      .join("");
  }

  /* ====================================================================== */
  /*  FICHA DO PRODUTO                                                      */
  /* ====================================================================== */
  const modal = $("#modal");
  let skuAberto = null;
  let focoAnterior = null;

  function abrirFicha(sku) {
    const p = acharProduto(sku);
    if (!p) return;
    skuAberto = sku;
    focoAnterior = document.activeElement;

    const media = $("#modalMedia");
    media.style.setProperty("--swatch", p.cor || "#1D0E47");
    media.className = "modal__media" + (p.imagem ? "" : " card__media--swatch");
    media.innerHTML = p.imagem ? `<img src="${esc(p.imagem)}" alt="${esc(p.nome)}">` : "";

    $("#modalCat").textContent = `${GRUPOS[p.grupo].nome} · ${nomeCategoria(p.grupo, p.categoria)}`;
    $("#modalTitulo").textContent = p.nome;
    $("#modalSku").textContent = `Código ${p.sku}`;
    $("#modalPreco").innerHTML = `${esc(precoTexto(p))}<small>vendido por ${esc(p.unidade)}</small>`;
    $("#modalDesc").textContent = p.descricao || p.resumo || "";

    $("#modalCores").innerHTML = (p.cores || [])
      .map(
        (c) =>
          `<span class="bolinha" style="background:${esc(corHex(c))}" title="${esc(nomeCor(c))}"></span>`
      )
      .join("");

    const det = p.detalhes || {};
    $("#modalSpecs").innerHTML = Object.keys(det)
      .map((k) => `<div><dt>${esc(k)}</dt><dd>${esc(det[k])}</dd></div>`)
      .join("");

    $("#modalQtd").value = 1;
    $("#modalWpp").href = linkWhatsApp(p.nome);

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal__x", modal).focus();
  }

  function fecharFicha() {
    modal.hidden = true;
    skuAberto = null;
    if (!$("#drawer").hidden) return;
    document.body.style.overflow = "";
    if (focoAnterior) focoAnterior.focus();
  }

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
  function irParaLoja() {
    const loja = $("#loja");
    if (loja) loja.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", (e) => {
    /* --- fechar janelas --- */
    if (e.target.closest("[data-fechar]")) return fecharFicha();
    if (e.target.closest("[data-fechar-drawer]")) return fecharDrawer();

    /* --- abrir ficha do produto --- */
    const abrir = e.target.closest("[data-abrir]");
    if (abrir) {
      const card = abrir.closest(".card");
      if (card) return abrirFicha(card.dataset.sku);
    }

    /* --- adicionar ao orçamento pelo card --- */
    const add = e.target.closest("[data-add]");
    if (add) {
      const card = add.closest(".card");
      if (card) return addCarrinho(card.dataset.sku, 1);
    }

    /* --- atalhos de departamento --- */
    const dep = e.target.closest("[data-dep-cat]");
    if (dep) {
      estado.grupos.clear();
      estado.categorias.clear();
      estado.categorias.add(dep.dataset.depCat);
      estado.busca = "";
      $("#inputBusca").value = "";
      reiniciarPagina();
      irParaLoja();
      return;
    }

    const irDep = e.target.closest("[data-ir-dep]");
    if (irDep) {
      estado.categorias.clear();
      estado.grupos.clear();
      estado.grupos.add(irDep.dataset.irDep);
      reiniciarPagina();
      irParaLoja();
      $("#nav").classList.remove("is-open");
      return;
    }

    /* --- remover um filtro pela etiqueta --- */
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

    /* --- filtro de cor --- */
    const cor = e.target.closest(".cor-btn");
    if (cor) {
      const id = cor.dataset.cor;
      estado.cores.has(id) ? estado.cores.delete(id) : estado.cores.add(id);
      return reiniciarPagina();
    }

    /* --- quantidade dentro do carrinho --- */
    const qtdItem = e.target.closest("[data-item-qtd]");
    if (qtdItem) {
      const sku = qtdItem.closest(".item").dataset.sku;
      return mudarQtd(sku, Number(qtdItem.dataset.itemQtd));
    }
    const remover = e.target.closest("[data-item-remover]");
    if (remover) return removerCarrinho(remover.closest(".item").dataset.sku);

    /* --- quantidade dentro da ficha --- */
    const qtdFicha = e.target.closest("[data-qtd]");
    if (qtdFicha) {
      const campo = $("#modalQtd");
      campo.value = Math.max(1, Number(campo.value || 1) + Number(qtdFicha.dataset.qtd));
    }
  });

  $("#modalAdd").addEventListener("click", () => {
    if (!skuAberto) return;
    addCarrinho(skuAberto, Math.max(1, Number($("#modalQtd").value || 1)));
    fecharFicha();
    abrirDrawer();
  });

  $("#drawerItens").addEventListener("change", (e) => {
    const campo = e.target.closest("[data-item-input]");
    if (!campo) return;
    const sku = campo.closest(".item").dataset.sku;
    const item = carrinho.find((i) => i.sku === sku);
    const novo = Math.max(1, Math.floor(Number(campo.value) || 1));
    if (item) item.qtd = novo;
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
    if (e.key !== "Escape") return;
    if (!modal.hidden) fecharFicha();
    else if (!drawer.hidden) fecharDrawer();
    else verFiltros(false);
  });

  /* --- busca --- */
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

  /* --- filtros por checkbox --- */
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

  $("#carregarMais").addEventListener("click", () => {
    estado.pagina += 1;
    pintarProdutos();
  });

  /* --- filtros no celular --- */
  function verFiltros(abrir) {
    $("#filtros").classList.toggle("is-open", abrir);
    $("#filtrosFundo").hidden = !abrir;
    document.body.style.overflow = abrir ? "hidden" : "";
  }
  $("#abrirFiltros").addEventListener("click", () => verFiltros(true));
  $("#fecharFiltros").addEventListener("click", () => verFiltros(false));
  $("#filtrosFundo").addEventListener("click", () => verFiltros(false));

  /* --- menu no celular --- */
  const botaoMenu = $("#navToggle");
  botaoMenu.addEventListener("click", () => {
    const aberto = $("#nav").classList.toggle("is-open");
    botaoMenu.setAttribute("aria-expanded", aberto);
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
  $("#nav").addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      $("#nav").classList.remove("is-open");
      botaoMenu.setAttribute("aria-expanded", "false");
    }
  });

  /* ====================================================================== */
  /*  DADOS DA EMPRESA                                                      */
  /* ====================================================================== */
  function aplicarEmpresa() {
    const mapa = {
      endereco: CONFIG.empresa.endereco,
      telefone: CONFIG.empresa.telefoneExibicao,
      horario: CONFIG.empresa.horario,
    };
    $$("[data-empresa]").forEach((el) => {
      const v = mapa[el.dataset.empresa];
      if (v) el.textContent = v;
    });
    $$("[data-wpp]").forEach((el) => (el.href = linkWhatsApp()));
    $("#avisoTopo").textContent = CONFIG.avisoTopo;
    $("#ano").textContent = new Date().getFullYear();
  }

  /* ====================================================================== */
  /*  INÍCIO                                                                */
  /* ====================================================================== */
  aplicarEmpresa();
  montarFiltros();
  montarDepartamentos();
  montarVitrines();
  carregarCarrinho();
  pintarCarrinho();
  pintarProdutos();
})();
