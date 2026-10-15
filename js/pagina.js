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

  /* O ferramentas/gerar-paginas.py já escreve os mesmos cartões no HTML;
     aqui eles são refeitos para valer o que estiver em produtos.js agora. */
  const valores = $("#valores");
  if (valores) {
    valores.innerHTML = SOBRE.valores
      .map(
        (v) => `
      <article class="valor">
        <span class="valor__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${esc(v.icone || "")}"/></svg></span>
        <h3>${esc(v.nome)}</h3>
        <p>${esc(v.texto)}</p>
      </article>`
      )
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
  const filmeWebm = typeof VIDEOS !== "undefined" && VIDEOS.historiaWebm;
  const capaVideo =
    (typeof VIDEOS !== "undefined" && VIDEOS.historiaCapa) || fotoLoja || "";

  if (historiaFoto && filme) {
    historiaFoto.classList.add("historia__foto--video");
    historiaFoto.innerHTML = `
      <video controls playsinline preload="none"${
        capaVideo ? ` poster="${esc(capaVideo)}"` : ""
      }>
        ${filmeWebm ? `<source src="${esc(filmeWebm)}" type="video/webm">` : ""}
        <source src="${esc(filme)}" type="video/mp4">
        Seu navegador não abre vídeo.
      </video>`;

    /* o Tag Manager não enxerga vídeo que não seja do YouTube, então o play e
       o fim do filme são avisados daqui */
    const player = historiaFoto.querySelector("video");
    player.addEventListener("play", () => rastrear("play_video", { video: "historia" }), {
      once: true,
    });
    player.addEventListener("ended", () => rastrear("video_ate_o_fim", { video: "historia" }));
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
