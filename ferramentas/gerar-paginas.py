#!/usr/bin/env python3
"""
Escreve em HTML puro o que o site só mostrava depois do JavaScript.

A loja é montada na hora, pelo JavaScript. O Google nem sempre roda
JavaScript e os robôs das I.As quase nunca rodam: para eles a loja aparecia
vazia, sem produto, sem endereço e sem telefone. Este script resolve isso:

  1. uma página por departamento (tecido-suplex.html, aviamentos.html…), com
     texto, produtos, cores, ficha técnica, perguntas frequentes e os dados
     estruturados (schema.org) que o Google lê;
  2. endereço, telefone, horário e links de contato escritos dentro do HTML
     de todas as páginas, e o rodapé apontando para os departamentos;
  3. os textos do Sobre e os horários do Contato;
  4. a página 404, o sitemap.xml e o llms.txt (o resumo para as I.As);
  5. o menu do topo com o endereço de cada departamento (no clique, a loja
     da home continua filtrando na hora; o robô segue o link), e a migalha
     (visível e em dados estruturados) no Sobre, no Contato e na Privacidade.

Os textos dos produtos continuam em js/produtos.js e as fotos em
js/catalogo-imagens.js. Mudou lá, rode de novo; o preparar-imagens.py já
chama este script no fim. Os textos próprios de cada página de departamento
ficam aqui embaixo, em PAGINAS.

O JavaScript do site continua preenchendo as mesmas coisas por cima, com os
mesmos valores: para quem visita, nada muda.

Precisa do Node (para ler os arquivos .js).
Como rodar:
    python3 ferramentas/gerar-paginas.py
"""

import html, io, json, os, re, subprocess, unicodedata
from datetime import date
from urllib.parse import quote

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://setefios.com.br/"
# cabeçalho e rodapé das páginas novas saem desta, que é a mais simples
MOLDE = "privacidade.html"
IMAGEM_COMPARTILHAR = SITE + "assets/compartilhar.jpg"

# ------------------------------------------------------------------ textos
# Uma entrada por departamento (a chave é a de DEPARTAMENTOS, em produtos.js).
# Nos textos, {total} é o total de cores do departamento, {c[slug]} as cores
# de um produto e {lista[slug]} os nomes dessas cores. Nada de hífen ou
# travessão no texto que aparece: separe com vírgula ou ponto.
FECHO_TECIDO = (
    "Tudo é vendido por metro, com pronta entrega na loja de Santa Cruz do "
    "Capibaribe, no Polo de Confecções de Pernambuco. Escolha as cores aqui, "
    "monte o orçamento e envie ao vendedor pelo WhatsApp: ele responde com "
    "preço e condições."
)

PAGINAS = {
    "poliamida": {
        "arquivo": "microfibra-poliamida.html",
        "titulo": "Microfibra de Poliamida para Confecção | 7 Fios Têxtil",
        "h1": "Microfibra de poliamida",
        "sub": "Toque macio, boa elasticidade e a maior cartela de cores da loja.",
        "descricao": (
            "Microfibra de poliamida por metro em Santa Cruz do Capibaribe: "
            "Poliamida UV, Premium e Max Premium, {total} cores. Veja as cores "
            "e peça o orçamento no WhatsApp."
        ),
        "texto": [
            "A microfibra de poliamida é uma malha de toque macio, que estica, "
            "volta ao lugar e cobre bem. Por isso é a base de muita peça de moda "
            "praia, fitness e moda íntima.",
            "São três linhas. A Poliamida UV tem proteção UV e a cartela mais "
            "completa da casa, com {c[poliamida-uv]} cores. A Premium, com "
            "{c[premium]} cores, e a Max Premium, com {c[max-premium]}, são mais "
            "encorpadas, para peças que pedem cobertura e estrutura. A Max "
            "Premium tem a gramatura mais alta entre as poliamidas da loja.",
            FECHO_TECIDO,
        ],
        "titulo_linhas": "As três linhas de poliamida",
        "perguntas": [
            ("Qual a diferença entre a Poliamida UV, a Premium e a Max Premium?",
             "A Poliamida UV tem proteção UV e a maior variedade de cores. A "
             "Premium é uma poliamida encorpada, de toque superior. A Max Premium "
             "é a mais encorpada das três, para peças que pedem cobertura e "
             "estrutura."),
            ("Quantas cores de poliamida vocês têm?",
             "Hoje são {total} cores no site, somando as três linhas. O estoque "
             "muda: se a cor que você procura não aparece, pergunte ao vendedor "
             "pelo WhatsApp."),
            ("Poliamida serve para moda praia e fitness?",
             "Serve. A Poliamida UV é a primeira escolha da casa para moda praia e "
             "fitness, pela elasticidade e pelo caimento uniforme."),
        ],
    },
    "poliester": {
        "arquivo": "microfibra-poliester.html",
        "titulo": "Microfibra de Poliéster para Confecção | 7 Fios Têxtil",
        "h1": "Microfibra de poliéster",
        "sub": "Lisos e risca de giz, para sublimação, estampa e peças de verão.",
        "descricao": (
            "Microfibra de poliéster por metro em Santa Cruz do Capibaribe: "
            "Summersol, Madri e Romantik, lisos e risca de giz, {total} cores. "
            "Orçamento pelo WhatsApp."
        ),
        "texto": [
            "O poliéster é a microfibra versátil da loja: vai bem em blusa, "
            "vestido, conjunto e peça de verão, e a base lisa aceita sublimação e "
            "estampa.",
            "A Summersol é a mais procurada: leve, pensada para roupa de verão e "
            "peças fluidas, com {c[summersol]} cores. A Madri é lisa, de bom preço "
            "e alto giro, com {c[madri]} cores, e aceita bem sublimação e estampa. "
            "A Romantik tem duas versões: a lisa, de caimento leve, com "
            "{c[romantik-liso]} cores, e a risca de giz, de listra fina e discreta, "
            "para moda social e casual, com {c[romantik-risca]} cores.",
            FECHO_TECIDO,
        ],
        "perguntas": [
            ("Qual poliéster serve para sublimação?",
             "A Madri é a indicada: microfibra de poliéster lisa, que aceita bem "
             "sublimação e estampa."),
            ("Vocês têm tecido risca de giz?",
             "Temos. A Romantik Risca de Giz tem listra fina e discreta em base de "
             "poliéster, para peças de moda social e casual, em {c[romantik-risca]} "
             "cores."),
            ("Qual é o poliéster mais procurado?",
             "A Summersol, microfibra de poliéster leve para roupa de verão e "
             "peças fluidas, com {c[summersol]} cores."),
        ],
    },
    "estampados": {
        "arquivo": "tecidos-estampados.html",
        "titulo": "Tecidos Estampados para Confecção | 7 Fios Têxtil",
        "h1": "Tecidos estampados",
        "sub": "Estampas femininas e masculinas na base Romantik, renovadas a cada temporada.",
        "descricao": (
            "Microfibra estampada Romantik por metro em Santa Cruz do Capibaribe: "
            "estampas femininas e masculinas renovadas a cada temporada. "
            "Orçamento pelo WhatsApp."
        ),
        "texto": [
            "Os estampados da 7 Fios são microfibras na base Romantik, em coleções "
            "separadas para o público feminino e o masculino.",
            "Na linha feminina entram florais, personagens e padronagens "
            "delicadas. Na masculina, estampas geométricas, esportivas e "
            "temáticas, para camisas, bermudas e conjuntos. As coleções mudam a "
            "cada temporada: para saber se uma estampa das fotos ainda está na "
            "loja, pergunte ao vendedor.",
            FECHO_TECIDO.replace("Escolha as cores aqui", "Veja as estampas aqui"),
        ],
        "perguntas": [
            ("As estampas mudam?",
             "Mudam. As coleções são renovadas a cada temporada. Se gostou de uma "
             "estampa das fotos, mande a foto para o vendedor no WhatsApp e ele "
             "confirma se ainda tem."),
            ("Tem estampa masculina?",
             "Tem. A Romantik Estampado Masculino traz estampas geométricas, "
             "esportivas e temáticas, usadas em camisas, bermudas e conjuntos."),
        ],
    },
    "dryfit": {
        "arquivo": "tecido-dry-fit.html",
        "titulo": "Tecido Dry Fit para Uniforme e Treino | 7 Fios Têxtil",
        "h1": "Tecido dry fit",
        "sub": "Furadinho, leve e de secagem rápida, para uniforme e roupa de treino.",
        "descricao": (
            "Tecido dry fit furadinho por metro em Santa Cruz do Capibaribe: Dry "
            "Fit Prime em {total} cores, para uniforme, camiseta esportiva e "
            "roupa de treino. Orçamento pelo WhatsApp."
        ),
        "texto": [
            "O dry fit é a malha furadinha de quem faz uniforme e roupa de treino: "
            "leve, respirável e de secagem rápida.",
            "Na 7 Fios a linha é o Dry Fit Prime, em {c[dry-fit-prime]} cores, a "
            "primeira escolha da casa para uniformes, camisetas esportivas e "
            "roupa de treino.",
            FECHO_TECIDO,
        ],
        "titulo_linhas": "Dry Fit Prime",
        "perguntas": [
            ("Dry fit serve para uniforme?",
             "Serve, e é o uso mais comum. O Dry Fit Prime é a primeira escolha da "
             "casa para uniformes, camisetas esportivas e roupa de treino."),
            ("Quais cores de dry fit vocês têm?",
             "Hoje são {total} cores no site: {lista[dry-fit-prime]}."),
        ],
    },
    "suplex": {
        "arquivo": "tecido-suplex.html",
        "titulo": "Tecido Suplex para Legging e Moda Fitness | 7 Fios Têxtil",
        "h1": "Tecido suplex",
        "sub": "Suplex de poliamida para legging e moda fitness, com boa cobertura e retorno elástico.",
        "descricao": (
            "Tecido suplex de poliamida por metro em Santa Cruz do Capibaribe: "
            "Blackout 290, que não transparenta, e Flex Fit 310. Veja as cores e "
            "peça o orçamento no WhatsApp."
        ),
        "texto": [
            "O suplex é a malha de poliamida da legging e da roupa de academia: "
            "cobre bem e volta ao lugar depois do movimento.",
            "O Suplex Blackout 290 não transparenta e é o indicado para legging e "
            "peças claras, com {c[suplex-blackout]} cores. O Suplex Flex Fit 310 "
            "tem elasticidade nos dois sentidos e boa recuperação, para peças de "
            "treino, com {c[suplex-flex-fit]} cores.",
            FECHO_TECIDO,
        ],
        "titulo_linhas": "As duas linhas de suplex",
        "perguntas": [
            ("Qual suplex não transparenta?",
             "O Suplex Blackout 290. É o indicado para legging e para peças claras, "
             "que não podem transparecer."),
            ("Qual a diferença entre o Blackout 290 e o Flex Fit 310?",
             "O Blackout 290 é o de cobertura total, que não transparenta. O Flex "
             "Fit 310 é o mais elástico, nos dois sentidos, para peças de treino "
             "que precisam voltar ao lugar depois do movimento. Os números são a "
             "gramatura de cada um."),
        ],
    },
    "aviamentos": {
        "arquivo": "aviamentos.html",
        "titulo": "Elásticos, Viés e Renda para Confecção | 7 Fios Têxtil",
        "h1": "Aviamentos para confecção",
        "sub": "Elásticos, viés e renda para fechar a peça.",
        "descricao": (
            "Elástico liso, estampado e personalizado, viés de poliamida e "
            "poliéster e renda larga em Santa Cruz do Capibaribe. Veja os modelos "
            "e peça o orçamento no WhatsApp."
        ),
        "texto": [
            "Na mesma loja dos tecidos ficam os aviamentos que fecham a peça: "
            "elástico, viés e renda.",
            "Os elásticos vêm por rolo. O liso tem as larguras mais pedidas, 25, "
            "30 e 35 mm. O de arte pública já vem estampado, também de 25 a 35 mm, "
            "e sai sem encomenda. Para acabamento fino há o Fênix, de 7 mm, "
            "indicado para lingerie, e o Jurerê, de 12 mm, para punhos e alças. O "
            "elástico personalizado leva o nome ou a logo da sua marca e é feito "
            "sob encomenda.",
            "O viés de poliamida 7 Fios é da linha própria da loja, em 16 e 25 mm. "
            "Ao lado dele ficam o viés de poliamida Paraná e o viés de poliéster "
            "Rubi, nas mesmas larguras, e o Noronha, que tem desenho rendado na "
            "borda. A renda 7 Mares tem 17 cm de largura e é vendida por metro, "
            "para barras e sobreposições.",
            "Escolha os modelos aqui, monte o orçamento e envie ao vendedor pelo "
            "WhatsApp: ele responde com preço, prazo e condições.",
        ],
        "perguntas": [
            ("Vocês fazem elástico com a marca da confecção?",
             "Fazemos. O Elástico Personalizado leva o nome ou a logo da sua marca "
             "e é produzido sob encomenda. Prazo e quantidade mínima são "
             "combinados com o vendedor."),
            ("Quais as larguras do viés?",
             "O viés de poliamida 7 Fios, o de poliamida Paraná e o de poliéster "
             "Rubi vêm em 16 e 25 mm."),
            ("Elástico é vendido por metro ou por rolo?",
             "Por rolo. Entre os aviamentos, só a renda 7 Mares é vendida por "
             "metro."),
        ],
    },
}

# Valem para todo departamento, depois das perguntas próprias.
PERGUNTAS_GERAIS = [
    ("Como faço o orçamento?",
     "Pela loja do site: escolha os produtos, e as cores quando houver, e "
     "envie a lista pelo WhatsApp. O vendedor responde com preço, "
     "disponibilidade e condições. Se preferir, chame direto no {telefone}."),
    ("Onde fica a loja?",
     "Na {endereco}, no Polo de Confecções de Pernambuco. Atendimento: "
     "{horario}."),
]


# ------------------------------------------------------------------ apoio
def esc(t):
    return html.escape(str(t if t is not None else ""), quote=True)


def ler(rel):
    with io.open(os.path.join(RAIZ, rel), encoding="utf-8") as fp:
        return fp.read()


def gravar(rel, conteudo):
    """Só grava se mudou: a data do arquivo continua dizendo quando ele mudou."""
    caminho = os.path.join(RAIZ, rel)
    if os.path.exists(caminho) and ler(rel) == conteudo:
        return False
    with io.open(caminho, "w", encoding="utf-8") as fp:
        fp.write(conteudo)
    return True


def sem_acento(t):
    t = unicodedata.normalize("NFD", str(t).lower())
    return "".join(c for c in t if not unicodedata.combining(c))


def uri(t):
    """Igual ao encodeURIComponent do JavaScript."""
    return quote(t, safe="!*'()~")


def juntar(nomes):
    """Preto, Branco e Azul."""
    nomes = list(nomes)
    if len(nomes) < 2:
        return "".join(nomes)
    return ", ".join(nomes[:-1]) + " e " + nomes[-1]


def ler_dados():
    """Roda os .js do site no Node e devolve os dados como dicionário."""
    codigo = r"""
    const fs = require("fs"), vm = require("vm");
    const ctx = {};
    vm.createContext(ctx);
    for (const f of ["js/config.js", "js/produtos.js", "js/catalogo-imagens.js"])
      vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
    process.stdout.write(vm.runInContext(`JSON.stringify({
      CONFIG, DEPARTAMENTOS, CATEGORIAS, PRODUTOS, VITRINE_CATEGORIAS, SOBRE,
      EQUIPE, IMAGENS, GERENTES,
      MEDIDAS: typeof MEDIDAS === "undefined" ? {} : MEDIDAS })`, ctx));
    """
    saida = subprocess.run(["node", "-e", codigo], cwd=RAIZ, check=True,
                           capture_output=True, text=True)
    return json.loads(saida.stdout)


def foto(url, alt, tamanhos, medidas, carregar="lazy"):
    """<img> com width/height e, quando a capa tem versão estreita, srcset."""
    m = medidas.get(url.split("?")[0])
    a = f'src="{esc(url)}"'
    if m:
        a += f' width="{m[0]}" height="{m[1]}"'
        if len(m) > 2:
            a += f' srcset="{esc(m[2])} {m[3]}w, {esc(url)} {m[0]}w" sizes="{tamanhos}"'
    return f'<img {a} alt="{esc(alt)}" loading="{carregar}" decoding="async">'


# ------------------------------------------------------- contato da empresa
class Empresa:
    def __init__(self, cfg):
        e = cfg["empresa"]
        self.e = e
        self.whatsapp = cfg["whatsapp"]
        self.wpp_geral = f"https://wa.me/{self.whatsapp}?text={uri(cfg['mensagemGeral'])}"
        self.msg_produto = cfg["mensagemProduto"]
        destino = uri(e["endereco"] + ", Brasil")
        self.links = {
            "data-wpp": self.wpp_geral,
            "data-tel-link": "tel:+" + self.whatsapp,
            "data-rota": "https://www.google.com/maps/dir/?api=1&destination=" + destino,
            "data-mapa": "https://www.google.com/maps/search/?api=1&query=" + destino,
            "data-email-link": "mailto:" + e["email"],
            "data-insta-link": e.get("instagram") or "#",
            "data-avaliar": e.get("avaliacao") or "#",
        }
        self.textos = {
            "endereco": e["endereco"],
            "telefone": e["telefoneExibicao"],
            "horario": e["horario"],
            "email": e["email"],
            "instagram": e.get("instagramNome", ""),
        }
        self.aviso = cfg.get("avisoTopo", "")
        self.avaliacoes = e.get("avaliacoes")

    def wpp_produto(self, nome):
        texto = self.msg_produto.replace("{produto}", nome)
        return f"https://wa.me/{self.whatsapp}?text={uri(texto)}"


# --------------------------------------------- o que vale em toda página
ICONES = (
    '<link rel="icon" href="favicon.ico" sizes="48x48">\n'
    '<link rel="icon" href="assets/icone-192.png" type="image/png" sizes="192x192">\n'
    '<link rel="apple-touch-icon" href="assets/icone-180.png">\n'
)


def trocar_dentro(h, id_, conteudo):
    """Troca o miolo do elemento com aquele id. O miolo não pode ter outro
    elemento com a mesma tag por dentro (é o caso de todos os usados aqui)."""
    padrao = re.compile(
        r'(<(?P<tag>[a-z0-9]+)\b[^>]*\bid="' + re.escape(id_) + r'"[^>]*>)(.*?)(</(?P=tag)>)',
        re.S)
    return padrao.sub(lambda m: m.group(1) + conteudo + m.group(4), h, count=1)


def menu_dos_departamentos(h, atual=None):
    """No menu do topo, cada departamento aponta para a sua página. Na home o
    JavaScript intercepta o clique e filtra a loja sem recarregar (o que vale
    é o data-ir-grupos); em qualquer outra página o clique abre a página do
    departamento, e é esse endereço que o Google e as I.As seguem."""
    def troca_link(m):
        grupo = m.group("grupo")
        pag = PAGINAS.get(grupo)
        if not pag:
            return m.group(0)
        tag = re.sub(r'\s+class="[^"]*is-active"', "", m.group(0))
        tag = re.sub(r'href="[^"]*"', f'href="{pag["arquivo"]}"', tag, count=1)
        if atual == pag["arquivo"]:
            tag = tag.replace("<a ", '<a class="is-active" ', 1)
        return tag
    return re.sub(r'<a\b[^>]*data-ir-grupos="(?P<grupo>\w+)"[^>]*>', troca_link, h)


MIGALHAS = {
    "sobre.html": "Sobre",
    "contato.html": "Contato",
    "privacidade.html": "Política de privacidade",
}


def migalha(h, arquivo):
    """Migalha visível no topo da página e BreadcrumbList nos dados
    estruturados (mesclado ao bloco que já existir, como o FAQPage)."""
    nome = MIGALHAS[arquivo]
    h = re.sub(r'\s*<nav class="breadcrumb breadcrumb--claro" data-migalha.*?</nav>', "",
               h, flags=re.S)
    topo = '<section class="pagina-topo">\n  <div class="container">'
    h = h.replace(topo, topo + (
        '\n    <nav class="breadcrumb breadcrumb--claro" data-migalha aria-label="Você está em">'
        f'\n      <a href="index.html">Início</a> <span>/</span> <strong>{esc(nome)}</strong>'
        '\n    </nav>'), 1)

    url = SITE + arquivo
    lista = {"@type": "BreadcrumbList", "@id": url + "#migalha", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Início", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": nome, "item": url}]}
    achou = re.search(r'<script type="application/ld\+json" data-gerado>(.*?)</script>', h, re.S)
    itens = []
    if achou:
        antigo = json.loads(achou.group(1))
        itens = antigo.get("@graph") or [{k: v for k, v in antigo.items() if k != "@context"}]
        itens = [i for i in itens if i.get("@type") != "BreadcrumbList"]
    return com_dados(h, {"@context": "https://schema.org", "@graph": itens + [lista]})


def preencher(h, emp, deps_links, atual=None):
    # textos de contato: <span data-empresa="telefone"></span>
    def texto(m):
        v = emp.textos.get(m.group("campo"))
        return m.group("abre") + (esc(v) if v else m.group("miolo")) + m.group("fecha")
    h = re.sub(
        r'(?P<abre><(?P<tag>[a-z0-9]+)\b[^>]*\bdata-empresa="(?P<campo>\w+)"[^>]*>)'
        r'(?P<miolo>[^<]*)(?P<fecha></(?P=tag)>)', texto, h)

    # links de contato: <a data-wpp href="#">
    for atributo, url in emp.links.items():
        padrao = re.compile(r'<a\b[^>]*(?<![\w-])' + atributo + r'(?![\w-])[^>]*>')
        h = padrao.sub(
            lambda m: re.sub(r'href="[^"]*"', f'href="{esc(url)}"', m.group(0), count=1), h)

    h = menu_dos_departamentos(h, atual)
    h = trocar_dentro(h, "avisoTopo", esc(emp.aviso))
    if emp.avaliacoes:
        a = emp.avaliacoes
        h = trocar_dentro(
            h, "avaliacaoNota",
            f'<strong>{esc(a["nota"])}</strong> no Google, com {a["total"]} avaliações de clientes')
    h = trocar_dentro(h, "ano", str(date.today().year))
    h = trocar_dentro(h, "footerDeps", deps_links)

    # imagem que aparece quando o link é compartilhado (WhatsApp, Facebook)
    h = re.sub(
        r'<meta property="og:image" content="[^"]*">(\n<meta property="og:image:[^>]*>)*',
        f'<meta property="og:image" content="{IMAGEM_COMPARTILHAR}">\n'
        '<meta property="og:image:width" content="1200">\n'
        '<meta property="og:image:height" content="630">', h, count=1)

    # ícones da aba e da tela inicial do celular
    padrao = re.compile(r'<link rel="(?:icon|apple-touch-icon)"[^>]*>\n?')
    achou = padrao.search(h)
    if achou:
        pos = achou.start()
        h = padrao.sub("", h)
        h = h[:pos] + ICONES + h[pos:]
    return h


def com_dados(h, dados):
    """Põe (ou troca) o bloco de dados estruturados gerado por este script."""
    h = re.sub(r'<script type="application/ld\+json" data-gerado>.*?</script>\n?', "",
               h, flags=re.S)
    if not dados:
        return h
    bloco = ('<script type="application/ld+json" data-gerado>\n'
             + json.dumps(dados, ensure_ascii=False, indent=1) + "\n</script>\n")
    return h.replace("</head>", bloco + "</head>", 1)


def trocar_cabeca(h, titulo, descricao, url, robots=None):
    h = re.sub(r"<title>.*?</title>", f"<title>{esc(titulo)}</title>", h, count=1, flags=re.S)
    h = re.sub(r'<meta name="description" content="[^"]*">',
               f'<meta name="description" content="{esc(descricao)}">', h, count=1)
    h = re.sub(r'<meta property="og:title" content="[^"]*">',
               f'<meta property="og:title" content="{esc(titulo)}">', h, count=1)
    h = re.sub(r'<meta property="og:description" content="[^"]*">',
               f'<meta property="og:description" content="{esc(descricao)}">', h, count=1)
    if url:
        h = re.sub(r'<link rel="canonical" href="[^"]*">',
                   f'<link rel="canonical" href="{url}">', h, count=1)
        h = re.sub(r'<meta property="og:url" content="[^"]*">',
                   f'<meta property="og:url" content="{url}">', h, count=1)
    else:
        h = re.sub(r'<link rel="canonical" href="[^"]*">\n?', "", h, count=1)
        h = re.sub(r'<meta property="og:url" content="[^"]*">\n?', "", h, count=1)
    if robots:
        h = h.replace("</title>", f'</title>\n<meta name="robots" content="{robots}">', 1)
    return h


# ------------------------------------------------- página de departamento
def montar_departamento(chave, pag, D, emp):
    dep = D["DEPARTAMENTOS"][chave]
    img = D["IMAGENS"]
    medidas = D["MEDIDAS"]
    url = SITE + pag["arquivo"]

    produtos = [p for p in D["PRODUTOS"] if p["grupo"] == chave]
    # o carro-chefe vem primeiro, como na loja
    produtos.sort(key=lambda p: not p.get("maisProcurado"))

    cores = {p["slug"]: len(img.get(p["slug"], {}).get("cores", [])) for p in produtos}
    lista = {p["slug"]: juntar(c["nome"] for c in img.get(p["slug"], {}).get("cores", []))
             for p in produtos}
    total = sum(cores.values())
    campos = {"c": cores, "lista": lista, "total": total,
              "telefone": emp.textos["telefone"], "endereco": emp.textos["endereco"],
              "horario": emp.textos["horario"]}
    fmt = lambda t: t.format(**campos)

    categorias = D["CATEGORIAS"].get(chave, [])

    def produto_html(p, primeiro):
        i = img.get(p["slug"], {})
        capa = i.get("capa")
        foto_html = (foto(capa, p["nome"], "(max-width:760px) 92vw, 340px", medidas,
                          "eager" if primeiro else "lazy")
                     if capa else "")
        ficha = [("Código", p["sku"]), ("Vendido por", p["unidade"])]
        ficha += list((p.get("detalhes") or {}).items())
        ficha_html = "".join(
            f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>" for k, v in ficha)
        nomes = [c["nome"] for c in i.get("cores", [])]
        if nomes:
            cores_html = (f'<p class="linha__cores"><strong>{len(nomes)} cores:</strong> '
                          f"{esc(juntar(nomes))}.</p>")
        else:
            cores_html = ""
        loja = (f"index.html?grupos={chave}&amp;produto={uri(p['sku'])}#loja")
        rotulo = "Ver cores e orçamento" if nomes else "Ver fotos e orçamento"
        selo = ('<span class="linha__selo">Mais procurado</span>'
                if p.get("maisProcurado") else "")
        return f"""
      <article class="linha" id="{esc(p['slug'])}">
        <div class="linha__foto">{foto_html}{selo}</div>
        <div class="linha__txt">
          <h3>{esc(p['nome'])}</h3>
          <p class="linha__resumo">{esc(p.get('resumo', ''))}</p>
          <p>{esc(p.get('descricao', ''))}</p>
          <dl class="linha__ficha">{ficha_html}</dl>
          {cores_html}
          <div class="linha__acoes">
            <a class="btn btn--navy btn--sm" href="{loja}">{rotulo}</a>
            <a class="btn btn--wpp btn--sm" data-wpp-produto href="{esc(emp.wpp_produto(p['nome']))}" target="_blank" rel="noopener">Pedir preço no WhatsApp</a>
          </div>
        </div>
      </article>"""

    # produtos agrupados por categoria, quando o departamento tem mais de uma
    grupos = []
    if len(categorias) > 1:
        for c in categorias:
            itens = [p for p in produtos if p.get("categoria") == c["id"]]
            if itens:
                grupos.append((c["nome"], itens))
    else:
        grupos.append((pag.get("titulo_linhas") or "Linhas de " + dep["nome"].lower(), produtos))

    secoes, primeiro = [], True
    for n, (titulo, itens) in enumerate(grupos, 1):
        blocos = []
        for p in itens:
            blocos.append(produto_html(p, primeiro))
            primeiro = False
        fundo = " section--clara" if n % 2 else ""
        secoes.append(f"""
<section class="section section--curta{fundo}" aria-labelledby="t-grupo-{n}">
  <div class="container">
    <header class="section__head">
      <h2 class="section__titulo" id="t-grupo-{n}">{esc(titulo)}</h2>
    </header>
    <div class="linhas">{''.join(blocos)}
    </div>
  </div>
</section>""")

    perguntas = [(fmt(q), fmt(r)) for q, r in pag["perguntas"] + PERGUNTAS_GERAIS]
    faq_html = "".join(f"""
      <details class="faq__item">
        <summary>{esc(q)}</summary>
        <p>{esc(r)}</p>
      </details>""" for q, r in perguntas)

    texto_html = "".join(f"\n    <p>{esc(fmt(t))}</p>" for t in pag["texto"])
    loja_dep = f"index.html?grupos={chave}#loja"

    miolo = f"""<main id="conteudo">

<section class="pagina-topo">
  <div class="container">
    <nav class="breadcrumb breadcrumb--claro" aria-label="Você está em">
      <a href="index.html">Início</a> <span>/</span> <strong>{esc(dep['nome'])}</strong>
    </nav>
    <h1>{esc(pag['h1'])}</h1>
    <p class="pagina-topo__sub">{esc(fmt(pag['sub']))}</p>
    <div class="pagina-topo__acoes">
      <a class="btn btn--gold" href="{loja_dep}">Ver na loja e montar orçamento</a>
      <a class="btn btn--ghost" data-wpp href="#" target="_blank" rel="noopener">Falar com o vendedor</a>
    </div>
  </div>
</section>

<section class="section section--curta">
  <div class="container dep-texto">{texto_html}
  </div>
</section>
{''.join(secoes)}

<section class="section section--curta faq" aria-labelledby="t-faq">
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">Dúvidas frequentes</p>
      <h2 class="section__titulo" id="t-faq">Perguntas sobre {esc(pag['h1'].lower())}</h2>
    </header>
    <div class="faq__lista">{faq_html}
    </div>
  </div>
</section>

<section class="cta">
  <div class="container">
    <h2>Quer saber o preço?</h2>
    <p>Monte o orçamento na loja ou chame o vendedor. O estoque é maior que o site.</p>
    <a class="btn btn--navy btn--lg" data-wpp href="#" target="_blank" rel="noopener">
      Conversar no WhatsApp
    </a>
  </div>
</section>

</main>"""

    # dados estruturados: a página, a migalha, os produtos e as perguntas
    def produto_ld(p):
        i = img.get(p["slug"], {})
        ld = {
            "@type": "Product",
            "name": p["nome"],
            "sku": p["sku"],
            "description": p.get("descricao") or p.get("resumo", ""),
            "category": dep["nome"],
            "url": f"{url}#{p['slug']}",
        }
        if i.get("capa"):
            ld["image"] = SITE + i["capa"].split("?")[0]
        props = [{"@type": "PropertyValue", "name": "Vendido por", "value": p["unidade"]}]
        props += [{"@type": "PropertyValue", "name": k, "value": v}
                  for k, v in (p.get("detalhes") or {}).items()]
        nomes = [c["nome"] for c in i.get("cores", [])]
        if nomes:
            props.append({"@type": "PropertyValue", "name": "Cores", "value": ", ".join(nomes)})
        ld["additionalProperty"] = props
        return ld

    descricao = fmt(pag["descricao"])
    dados = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": url + "#pagina",
                "url": url,
                "name": pag["titulo"],
                "description": descricao,
                "inLanguage": "pt-BR",
                "about": {"@id": SITE + "#loja"},
                "breadcrumb": {"@id": url + "#migalha"},
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": len(produtos),
                    "itemListElement": [
                        {"@type": "ListItem", "position": n, "item": produto_ld(p)}
                        for n, p in enumerate(produtos, 1)
                    ],
                },
            },
            {
                "@type": "BreadcrumbList",
                "@id": url + "#migalha",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Início", "item": SITE},
                    {"@type": "ListItem", "position": 2, "name": dep["nome"], "item": url},
                ],
            },
            {
                "@type": "FAQPage",
                "@id": url + "#perguntas",
                "mainEntity": [
                    {"@type": "Question", "name": q,
                     "acceptedAnswer": {"@type": "Answer", "text": r}}
                    for q, r in perguntas
                ],
            },
        ],
    }
    return miolo, descricao, dados, total, produtos


def montar_404(deps):
    itens = "".join(
        f'\n        <li><a class="btn btn--linha" href="{esc(arq)}">{esc(nome)}</a></li>'
        for arq, nome in deps)
    return f"""<main id="conteudo">

<section class="pagina-topo">
  <div class="container">
    <p class="eyebrow">Erro 404</p>
    <h1>Página não encontrada</h1>
    <p class="pagina-topo__sub">Este endereço mudou ou não existe mais. Os tecidos continuam aqui.</p>
  </div>
</section>

<section class="section">
  <div class="container nao-achou">
    <ul class="nao-achou__lista">{itens}
    </ul>
    <div class="pagina-topo__acoes">
      <a class="btn btn--navy" href="index.html#loja">Ver todos os produtos</a>
      <a class="btn btn--wpp" data-wpp href="#" target="_blank" rel="noopener">Falar com o vendedor</a>
    </div>
  </div>
</section>

</main>"""


# ------------------------------------------------- Sobre e Contato
def preencher_sobre(h, D):
    s = D["SOBRE"]
    h = trocar_dentro(h, "historia", esc(s["historia"]))
    h = trocar_dentro(h, "missao", esc(s["missao"]))
    h = trocar_dentro(h, "visao", esc(s["visao"]))
    valores = "".join(f"""
      <article class="valor">
        <span class="valor__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="{esc(v.get('icone', ''))}"/></svg></span>
        <h3>{esc(v['nome'])}</h3>
        <p>{esc(v['texto'])}</p>
      </article>""" for v in s["valores"])
    h = trocar_dentro(h, "valores", valores + "\n    ")

    gerentes = []
    for pessoa in D["EQUIPE"]:
        f = next((g for g in D["GERENTES"]
                  if sem_acento(g["arquivo"]) == sem_acento(pessoa["arquivo"])), None)
        img = (f'<img src="{esc(f["img"])}" alt="{esc(pessoa["nome"])}" loading="lazy">'
               if f else "")
        gerentes.append(f"""
      <article class="gerente">
        {img}
        <strong>{esc(pessoa['nome'])}</strong>
        <small>{esc(pessoa['cargo'])}</small>
      </article>""")
    return trocar_dentro(h, "gerentes", "".join(gerentes) + "\n    ")


def preencher_contato(h, D):
    horarios = "".join(f"""
        <div>
          <dt>{esc(x['dia'])}</dt>
          <dd{' class="fechado"' if x.get('fechado') else ''}>{esc(x['valor'])}</dd>
        </div>""" for x in D["CONFIG"]["empresa"].get("horarios", []))
    h = trocar_dentro(h, "horarios", horarios + "\n      ")

    # as dúvidas da página viram FAQPage, lidas do próprio HTML
    perguntas = []
    for q, r in re.findall(
            r'<details class="faq__item">\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>',
            h, re.S):
        limpa = lambda t: html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", t))).strip()
        perguntas.append({"@type": "Question", "name": limpa(q),
                          "acceptedAnswer": {"@type": "Answer", "text": limpa(r)}})
    dados = {"@context": "https://schema.org", "@type": "FAQPage",
             "@id": SITE + "contato.html#perguntas", "mainEntity": perguntas} if perguntas else None
    return com_dados(h, dados)


# ------------------------------------------------- sitemap e llms.txt
def data_de(arquivos):
    """Quando o conteúdo mudou pela última vez: o último commit que mexeu
    nesses arquivos, ou hoje, se há mudança ainda não guardada no git."""
    try:
        sujo = subprocess.run(["git", "status", "--porcelain", "--"] + arquivos,
                              cwd=RAIZ, capture_output=True, text=True, check=True).stdout
        if sujo.strip():
            return date.today().isoformat()
        dia = subprocess.run(["git", "log", "-1", "--format=%cs", "--"] + arquivos,
                             cwd=RAIZ, capture_output=True, text=True, check=True).stdout.strip()
        if dia:
            return dia
    except (OSError, subprocess.CalledProcessError):
        pass
    return date.today().isoformat()


def montar_sitemap(entradas):
    linhas = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for caminho, prioridade, arquivos in entradas:
        linhas += ["  <url>",
                   f"    <loc>{SITE}{caminho}</loc>",
                   f"    <lastmod>{data_de(arquivos)}</lastmod>",
                   f"    <priority>{prioridade}</priority>",
                   "  </url>"]
    linhas.append("</urlset>")
    return "\n".join(linhas) + "\n"


def montar_llms(D, emp, resumo_deps):
    e = D["CONFIG"]["empresa"]
    img = D["IMAGENS"]
    t = [
        "# 7 Fios Têxtil",
        "",
        "> Loja de tecidos e aviamentos para confecção em Santa Cruz do Capibaribe, "
        "no Polo de Confecções de Pernambuco. Vende malhas de microfibra de poliamida "
        "e de poliéster, suplex, dry fit, tecidos estampados, elásticos, viés e renda. "
        "O preço é sob consulta: o orçamento é feito pelo WhatsApp.",
        "",
        f"- Nome: {e['nome']} ({e.get('nomeCompleto', '')}), razão social D Vicente Tavares Tecidos Ltda",
        f"- Endereço: {e['endereco']}",
        f"- WhatsApp e telefone: {e['telefoneExibicao']} ({emp.links['data-wpp'].split('?')[0]})",
        f"- E-mail: {e['email']}",
        f"- Horário: {e['horario']}",
        *([f"- Avaliações no Google: nota {e['avaliacoes']['nota']}, "
           f"{e['avaliacoes']['total']} avaliações (conferido em {e['avaliacoes']['conferido']})"]
          if e.get("avaliacoes") else []),
        f"- Instagram: {e.get('instagram', '')}",
        "- Como comprar: escolha os produtos e as cores no site, monte o orçamento "
        "e envie pelo WhatsApp. O vendedor responde com preço, disponibilidade e condições.",
        "",
        "## Departamentos",
        "",
    ]
    for arquivo, nome, frase in resumo_deps:
        t.append(f"- [{nome}]({SITE}{arquivo}): {frase}")

    t += ["", "## Produtos", ""]
    for arquivo, nome, _ in resumo_deps:
        chave = next(k for k, p in PAGINAS.items() if p["arquivo"] == arquivo)
        t += [f"### {nome}", ""]
        for p in [p for p in D["PRODUTOS"] if p["grupo"] == chave]:
            i = img.get(p["slug"], {})
            nomes = [c["nome"] for c in i.get("cores", [])]
            det = "; ".join(f"{k}: {v}" for k, v in (p.get("detalhes") or {}).items())
            linha = (f"- [{p['nome']}]({SITE}{arquivo}#{p['slug']}) ({p['sku']}): "
                     f"{p.get('descricao') or p.get('resumo', '')} Vendido por {p['unidade']}.")
            if det:
                linha += f" {det}."
            if nomes:
                linha += f" {len(nomes)} cores: {', '.join(nomes)}."
            t.append(linha)
        t.append("")

    t += [
        "## Outras páginas",
        "",
        f"- [Loja]({SITE}): catálogo completo com filtro por cor e o carrinho de orçamento.",
        f"- [Sobre]({SITE}sobre.html): história da empresa, missão, visão, valores e equipe.",
        f"- [Contato]({SITE}contato.html): canais, endereço, mapa, horários e perguntas frequentes.",
        f"- [Política de privacidade]({SITE}privacidade.html)",
        "",
    ]
    return "\n".join(t)


# ------------------------------------------------------------------ execução
def main():
    D = ler_dados()
    emp = Empresa(D["CONFIG"])
    feitos = []

    deps = []  # (arquivo, nome) na ordem da vitrine
    for v in D["VITRINE_CATEGORIAS"]:
        for g in v["grupos"]:
            if g in PAGINAS and g not in [d[2] for d in deps]:
                deps.append((PAGINAS[g]["arquivo"], D["DEPARTAMENTOS"][g]["nome"], g))
    for g in PAGINAS:  # departamento fora da vitrine também ganha página
        if g in D["DEPARTAMENTOS"] and g not in [d[2] for d in deps]:
            deps.append((PAGINAS[g]["arquivo"], D["DEPARTAMENTOS"][g]["nome"], g))
    rodape = "".join(f'\n        <li><a href="{esc(a)}">{esc(n)}</a></li>' for a, n, _ in deps)
    rodape += "\n      "

    # 1. as páginas que já existem
    for arquivo in ("index.html", "sobre.html", "contato.html", "privacidade.html"):
        h = preencher(ler(arquivo), emp, rodape)
        if arquivo == "sobre.html":
            h = preencher_sobre(h, D)
        if arquivo == "contato.html":
            h = preencher_contato(h, D)
        if arquivo in MIGALHAS:
            h = migalha(h, arquivo)
        if gravar(arquivo, h):
            feitos.append(arquivo)

    # 2. as páginas de departamento, com a casca da página molde
    molde = ler(MOLDE)
    antes = molde[:molde.index("<main")]
    depois = molde[molde.index("</main>") + len("</main>"):]
    antes = com_dados(antes, None)

    resumo_deps = []
    for arquivo, nome, chave in deps:
        pag = PAGINAS[chave]
        miolo, descricao, dados, total, produtos = montar_departamento(chave, pag, D, emp)
        cabeca = trocar_cabeca(antes, pag["titulo"], descricao, SITE + arquivo)
        h = preencher(com_dados(cabeca, dados) + miolo + depois, emp, rodape, atual=arquivo)
        if gravar(arquivo, h):
            feitos.append(arquivo)
        frase = ", ".join(p["nome"] for p in produtos)
        frase += f". {total} cores." if total else "."
        resumo_deps.append((arquivo, nome, frase))

    # 3. a 404. Ela aparece em qualquer endereço, até /catalogo/x/y: por isso
    #    os caminhos dela começam na raiz do site (/css/…, /assets/…)
    cabeca = trocar_cabeca(antes, "Página não encontrada | 7 Fios Têxtil",
                           "Este endereço não existe mais no site da 7 Fios Têxtil.",
                           None, robots="noindex")
    h = preencher(cabeca + montar_404([(a, n) for a, n, _ in deps]) + depois, emp, rodape)
    h = re.sub(r'\b(href|src)="(?!https?:|#|/|mailto:|tel:|data:)', r'\1="/', h)
    if gravar("404.html", h):
        feitos.append("404.html")

    # 4. sitemap e llms.txt
    dados_js = ["js/produtos.js", "js/catalogo-imagens.js", "js/config.js"]
    entradas = [("", "1.0", ["index.html"] + dados_js)]
    entradas += [(a, "0.9", [a] + dados_js) for a, _, _ in deps]
    entradas += [("contato.html", "0.8", ["contato.html", "js/config.js"]),
                 ("sobre.html", "0.6", ["sobre.html", "js/produtos.js"]),
                 ("privacidade.html", "0.3", ["privacidade.html"])]
    if gravar("sitemap.xml", montar_sitemap(entradas)):
        feitos.append("sitemap.xml")
    if gravar("llms.txt", montar_llms(D, emp, resumo_deps)):
        feitos.append("llms.txt")

    print("Páginas: " + (", ".join(feitos) if feitos else "nada mudou"))


if __name__ == "__main__":
    main()
