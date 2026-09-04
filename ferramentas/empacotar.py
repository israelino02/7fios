#!/usr/bin/env python3
"""Junta o site inteiro num arquivo só, para o link de visualização.

As três páginas viram três telas com roteamento por âncora (#/loja, #/sobre,
#/contato) e todas as fotos entram embutidas, em tamanho menor: o link de
visualização aceita no máximo 16 MB e o site de verdade tem quase 60 MB de
imagem. O vídeo fica de fora pelo mesmo motivo.

Uso:  python3 ferramentas/empacotar.py
Sai:  _bundle.html na raiz do projeto (fora do git, pelo .gitignore)
"""

import base64, io, os, re, subprocess, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "_bundle.html")

# (pedaço do caminho, largura, qualidade) — a primeira regra que casar vence
REGRAS = [
    ("-mini",           150, 52),
    ("banners/",       1000, 58),
    ("departamentos/", 1100, 66),
    ("gerentes/",       300, 62),
    ("video/",          900, 60),
]
PADRAO = (520, 56)

# links de página que, dentro do arquivo único, viram rota de tela
ROTAS = [
    (re.compile(r'href="index\.html\?[^"]*"'), 'href="#/loja"'),
    ('href="contato.html#faq"', 'href="#/contato"'),
    ('href="sobre.html"', 'href="#/sobre"'),
    ('href="contato.html"', 'href="#/contato"'),
    ('href="index.html#loja"', 'href="#/loja"'),
    ('href="index.html"', 'href="#/loja"'),
]


def ler(rel):
    with io.open(os.path.join(RAIZ, rel), encoding="utf-8") as fp:
        return fp.read()


def rotear(t):
    for de, para in ROTAS:
        t = de.sub(para, t) if hasattr(de, "sub") else t.replace(de, para)
    return t


def regra(rel):
    for chave, larg, qual in REGRAS:
        if chave in rel:
            return larg, qual
    return PADRAO


embutidas = [0]


def embutir(rel):
    """Reduz a foto e devolve como data: URI."""
    limpo = rel.split("?")[0]
    origem = os.path.join(RAIZ, limpo)
    if not os.path.exists(origem):
        return rel
    larg, qual = regra(limpo)
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        destino = tmp.name
    subprocess.run(
        ["sips", "-s", "format", "jpeg", "-s", "formatOptions", str(qual),
         "-Z", str(larg), origem, "--out", destino],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    with open(destino, "rb") as fp:
        dados = base64.b64encode(fp.read()).decode()
    os.unlink(destino)
    embutidas[0] += 1
    if embutidas[0] % 100 == 0:
        print(f"  … {embutidas[0]} fotos", flush=True)
    return "data:image/jpeg;base64," + dados


def sem_iframe(t):
    """O link de visualização bloqueia conteúdo de fora; o mapa não abriria."""
    return re.sub(r"<iframe.*?</iframe>", "", t, flags=re.S)


def miolo(arquivo):
    s = ler(arquivo)
    i = s.index("<main")
    return sem_iframe(s[i:s.index("</main>") + len("</main>")])


def main():
    print("montando o pacote…", flush=True)

    html = ler("index.html")
    css = ler("css/styles.css")

    dados = re.sub(r'"(assets/[^"]+\.(?:jpg|jpeg|png)(?:\?v=\d+)?)"',
                   lambda m: '"' + embutir(m.group(1)) + '"',
                   ler("js/catalogo-imagens.js"))

    # O vídeo tem 8 MB e o limite é 16 MB com as 412 fotos embutidas junto.
    # Aqui ele fica de fora e a página mostra o quadro da fachada; no site de
    # verdade o vídeo toca na própria página.
    dados = re.sub(r'"historia": "assets/video/[^"]+"', '"historia": ""', dados)

    js = "\n".join([ler("js/config.js"), dados, ler("js/produtos.js"),
                    ler("js/comum.js"), ler("js/main.js"), ler("js/pagina.js")])

    # o rodapé monta os links por JS; ali eles também viram rota
    js = js.replace('href="index.html?grupos=${c.grupos.join(",")}#loja"',
                    'href="#/loja"')

    logo = "data:image/jpeg;base64," + base64.b64encode(
        open(os.path.join(RAIZ, "assets/logo.jpg"), "rb").read()).decode()

    corpo = html.split("<body>", 1)[1].split("</body>", 1)[0]
    corpo = re.sub(r'\s*<script src="js/[^"]+"></script>', "", corpo)
    corpo = rotear(sem_iframe(corpo)).replace("assets/logo.jpg", logo)

    # as outras duas telas entram como irmãs da loja, escondidas até serem pedidas
    telas = []
    for nome, arquivo in (("sobre", "sobre.html"), ("contato", "contato.html")):
        m = rotear(miolo(arquivo)).replace("assets/logo.jpg", logo)
        telas.append(f'<div class="tela" id="tela-{nome}" hidden>{m}</div>')

    corpo = corpo.replace("<main>", '<div class="tela" id="tela-loja"><main>', 1)
    corpo = corpo.replace("</main>", "</main></div>", 1)

    roteador = """
<script>
/* Três telas num arquivo só. O endereço depois do # diz qual aparece. */
(function () {
  var telas = ["loja", "sobre", "contato"];
  function mostrar() {
    var alvo = (location.hash.replace("#/", "") || "loja");
    if (telas.indexOf(alvo) < 0) alvo = "loja";
    telas.forEach(function (t) {
      var el = document.getElementById("tela-" + t);
      if (el) el.hidden = t !== alvo;
    });
    scrollTo(0, 0);
  }
  addEventListener("hashchange", mostrar);
  addEventListener("DOMContentLoaded", mostrar);
  mostrar();
})();
</script>
"""

    final = (
        '<meta charset="utf-8">\n'
        "<title>7 Fios Têxtil</title>\n"
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f"<style>\n{css}\n.tela[hidden]{{display:none!important}}\n</style>\n"
        + corpo
        + "\n".join(telas)
        + f"<script>\n{js}\n</script>\n"
        + roteador
    )

    with io.open(SAIDA, "w", encoding="utf-8") as fp:
        fp.write(final)

    print(f"fotos embutidas: {embutidas[0]}")
    print(f"tamanho final:  {os.path.getsize(SAIDA) / (1024 * 1024):.1f} MB")
    print(f"arquivo:        {SAIDA}")


if __name__ == "__main__":
    main()
