/* ==========================================================================
   7 FIOS TÊXTIL, conteúdo das páginas Sobre e Contato
   Os textos ficam em js/produtos.js (SOBRE e EQUIPE) e js/config.js.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------ SOBRE */
  const historia = $("#historia");
  if (historia) historia.textContent = SOBRE.historia;

  const missao = $("#missao");
  if (missao) missao.textContent = SOBRE.missao;

  const visao = $("#visao");
  if (visao) visao.textContent = SOBRE.visao;

  const ICONES = [
    'M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4Zm-1 13-3-3 1.4-1.4L11 12.2l4.6-4.6L17 9l-6 6Z',
    'M12 21s-8-4.4-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 11c0 5.6-8 10-8 10Z',
    'M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2ZM9 19h6v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1Z',
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V6h-2v8h6v-2h-4Z',
    'M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.7 0-6 1.3-6 4v2h12v-2c0-2.7-3.3-4-6-4Zm8 0c-.6 0-1.3.1-1.9.2 1.2.9 1.9 2 1.9 3.8v2h6v-2c0-2.7-3.3-4-6-4Z',
    'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 5a2 2 0 0 1 2 2c0 .9-.6 1.4-1 1.8-.4.3-.5.5-.5 1.2h-1c0-1.1.4-1.6.9-2 .3-.3.6-.5.6-1a1 1 0 0 0-2 0h-1a2 2 0 0 1 2-2Zm-.5 6h1v1h-1v-1Z',
  ];

  /* Cada valor tem o seu par de cores; elas giram no fundo do cartão. */
  const TONS_VALOR = [
    ["#6D28D9", "#DB2777"],
    ["#0E7490", "#22D3EE"],
    ["#15803D", "#84CC16"],
    ["#B45309", "#F59E0B"],
    ["#312E81", "#818CF8"],
    ["#9D174D", "#FB7185"],
  ];

  const valores = $("#valores");
  if (valores) {
    valores.innerHTML = SOBRE.valores
      .map((v, i) => {
        const [a, b] = TONS_VALOR[i % TONS_VALOR.length];
        return `
        <article class="valor" style="--tom-a:${a}; --tom-b:${b}; --giro:${18 + i * 3}s">
          <span class="valor__fundo" aria-hidden="true"></span>
          <span class="valor__vidro">
            <span class="valor__ico">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONES[i % ICONES.length]}"/></svg>
            </span>
            <h3>${esc(v.nome)}</h3>
            <p>${esc(v.texto)}</p>
          </span>
        </article>`;
      })
      .join("");
  }

  const gerentes = $("#gerentes");
  if (gerentes && typeof GERENTES !== "undefined") {
    gerentes.innerHTML = EQUIPE.map((pessoa) => {
      const foto = GERENTES.find(
        (g) => semAcento(g.arquivo) === semAcento(pessoa.arquivo)
      );
      return `
        <article class="gerente">
          ${foto ? `<img src="${esc(foto.img)}" alt="${esc(pessoa.nome)}" loading="lazy">` : ""}
          <strong>${esc(pessoa.nome)}</strong>
          <small>${esc(pessoa.cargo)}</small>
        </article>`;
    }).join("");
  }

  /* ---------------------------------------------------------- CONTATO */
  const horarios = $("#horarios");
  if (horarios && CONFIG.empresa.horarios) {
    horarios.innerHTML = CONFIG.empresa.horarios
      .map(
        (h) => `
        <div>
          <dt>${esc(h.dia)}</dt>
          <dd${h.fechado ? ' class="fechado"' : ""}>${esc(h.valor)}</dd>
        </div>`
      )
      .join("");
  }

  /* No lugar da foto da loja entra o vídeo da história, servido pelo próprio
     site. Nada de player de fora: o do YouTube carrega o título e o botão
     dele por cima do filme, e os dois tiram a pessoa da página.

     A página mostra primeiro um quadro da fachada tirado do próprio vídeo e
     só baixa os megabytes quando alguém aperta o play, para quem passa pela
     Sobre não pagar por um filme que não pediu. */
  const historiaFoto = $("#historiaFoto");
  const fotoLoja = typeof BANNERS !== "undefined" && (BANNERS.loja || BANNERS.hero);
  const filme = typeof VIDEOS !== "undefined" && VIDEOS.historia;
  const capaVideo =
    (typeof VIDEOS !== "undefined" && VIDEOS.historiaCapa) || fotoLoja || "";

  if (historiaFoto && filme) {
    historiaFoto.classList.add("historia__foto--video");
    historiaFoto.innerHTML = `
      <video controls playsinline preload="none"${
        capaVideo ? ` poster="${esc(capaVideo)}"` : ""
      }>
        <source src="${esc(filme)}" type="video/mp4">
        Seu navegador não abre vídeo.
      </video>`;
  } else if (historiaFoto && capaVideo) {
    /* sem o arquivo do vídeo (é o caso do link de visualização, que tem
       limite de peso): fica o quadro da fachada tirado dele */
    historiaFoto.style.setProperty(
      "--foto",
      `url("${new URL(capaVideo, document.baseURI).href}")`
    );
  }

  /* Foto da fachada por trás do mapa, caso ele não carregue. */
  const mapaFoto = $("#mapaFoto");
  const fotoMapa = typeof BANNERS !== "undefined" && (BANNERS.mapa || BANNERS.loja);
  if (mapaFoto && fotoMapa) {
    mapaFoto.style.setProperty(
      "--foto",
      `url("${new URL(fotoMapa, document.baseURI).href}")`
    );
  }
})();
