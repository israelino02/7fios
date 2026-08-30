#!/usr/bin/env python3
"""
Prepara as imagens da pasta "imagens/" para o site.

O que ele faz:
  1. reduz e comprime cada foto (as originais têm até 20 MB; as do site ficam em KB);
  2. tira a cor média de cada foto de cor, para pintar as bolinhas dos cards;
  3. escreve js/catalogo-imagens.js, que o site lê.

Como rodar (depois de mexer nas fotos):
    python3 ferramentas/preparar-imagens.py

Ele pula o que já foi convertido, então rodar de novo é rápido.
Os textos dos produtos ficam em js/produtos.js e NUNCA são tocados por aqui.
"""

import colorsys, io, json, os, re, struct, subprocess, sys, unicodedata, zlib

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEM = os.path.join(RAIZ, "imagens")
DESTINO = os.path.join(RAIZ, "assets")

# ---------------------------------------------------------------- tamanhos
LARGURA = {
    "banner": (1400, 62),
    "departamento": (1400, 72),
    "capa": (900, 72),
    "cor": (1300, 76),
    "cor_mini": (280, 62),
    "galeria": (1300, 74),
    "fita": (1600, 66),
    "gerente": (420, 70),
}

# --------------------------------------------------------- mapa de produtos
# (pasta de origem, slug, tipo) , tipo: "cores" ou "galeria"
PRODUTOS_IMG = [
    ("MICROFIBRAS POLIAMIDA/DARLYNG",                  "darlyng",              "cores"),
    ("MICROFIBRAS POLIAMIDA/DELITEX POLIAMIDA",        "delitex",              "cores"),
    ("MICROFIBRAS POLIAMIDA/POLIAMIDA PREMIUM",        "premium",              "cores"),
    ("MICROFIBRAS POLIESTER/MADRI ",                   "madri",                "cores"),
    ("MICROFIBRAS POLIESTER/ROMANTIK LISO",            "romantik-liso",        "cores"),
    ("MICROFIBRAS POLIESTER/ROMANTIK MESCLADO",        "romantik-mesclado",    "cores"),
    ("MICROFIBRAS POLIESTER/ROMANTIK RISCA DE GIZ",    "romantik-risca",       "cores"),
    ("MICROFIBRAS POLIESTER/SUMMERSOL",                "summersol",            "cores"),
    ("DRY-FIT/DRY FIT PRIME/Cores",                    "dry-fit-prime",        "cores"),
    ("ESTAMPADOS/ROMANTIK ESTAMPADO/FEMININO",         "romantik-feminino",    "galeria"),
    ("ESTAMPADOS/ROMANTIK ESTAMPADO/MASCULINO",        "romantik-masculino",   "galeria"),
    ("Outros produtos/Elásticos/Elastico Personalizado",
     "elastico-personalizado", "galeria"),
    ("Outros produtos/Elásticos/Elastico liso (largura 25 MM, 30MM e 35 MM)",
     "elastico-liso", "galeria"),
    ("Outros produtos/Elásticos/Elasticos de arte públicas (largura 25MM, 30MM e 35MM)",
     "elastico-arte-publica", "galeria"),
    ("Outros produtos/Viés/Elástico Fenix 7mm",        "elastico-fenix",       "galeria"),
    ("Outros produtos/Viés/Elástico Jurere(12MM)",     "elastico-jurere",      "galeria"),
    ("Outros produtos/Viés/Vies de poliamida paraná (LARGURA 16MM, 25MM)",
     "vies-parana", "galeria"),
    ("Outros produtos/Viés/Viés de poliamida 7 fios largura 16 MM  e 25 MM",
     "vies-7-fios", "galeria"),
    ("Outros produtos/Viés/Viés de poliester rubi (largura 16 MM e 25 MM",
     "vies-rubi", "galeria"),
    ("Outros produtos/Viés/Viés noronha",              "vies-noronha",         "galeria"),
    ("Outros produtos/Viés/RENDA 7 MARES (17 CM)",     "renda-7-mares",        "galeria"),
    ("Outros produtos/Viés/Renda Belle",               "renda-belle",          "galeria"),
    ("Outros produtos/Viés/renda 7 fios (largura 3,3cm)", "renda-7-fios",      "galeria"),
]

# Capa escolhida a dedo: aponta direto para um arquivo, quando a foto certa
# não é a pasta CAPA nem a cor mais viva.
CAPAS_ARQUIVO = {}

# A pasta de capa é descoberta sozinha. Vale qualquer nome que comece com
# "CAPA": dentro da pasta do produto (ex.: DARLYNG/CAPA) ou ao lado dela,
# desde que cite o nome do produto (ex.: CAPA ROMANTIK FEMININO, ao lado de
# FEMININO). Assim renomear a pasta não quebra nada.
CAPAS_PRODUTO = {
    "dry-fit-prime": "DRY-FIT/CAPA",
}

def pasta_de_capa(pasta):
    """Procura a pasta de capa do produto: primeiro dentro dele, depois ao lado."""
    dentro = resolver(pasta)
    if os.path.isdir(dentro):
        for nome in sorted(os.listdir(dentro)):
            if _chave(nome).startswith("capa") and os.path.isdir(os.path.join(dentro, nome)):
                return os.path.join(dentro, nome)

    pai, proprio = os.path.split(dentro)
    if os.path.isdir(pai):
        alvo = _chave(proprio)
        for nome in sorted(os.listdir(pai)):
            caminho = os.path.join(pai, nome)
            chave = _chave(nome)
            if os.path.isdir(caminho) and chave.startswith("capa") and alvo in chave:
                return caminho
    return None

# Se você colocar as fotos em "imagens/capas de categorias/" com estes nomes
# (poliamida, poliester, estampados, dryfit, aviamentos), elas têm preferência
# sobre as de baixo. Tamanho ideal: 1600 x 900 px, com o assunto no centro.
PASTA_CATEGORIAS = "capas de categorias"

DEPARTAMENTOS_IMG = {
    "poliamida":  "MICROFIBRAS POLIAMIDA/Capa/IMG_6035.jpg",
    "poliester":  "MICROFIBRAS POLIESTER/CAPA/_DSC1260.jpg",
    "dryfit":     "DRY-FIT/CAPA/IMG_5919.jpg",
    "estampados": "ESTAMPADOS/ROMANTIK ESTAMPADO/_DSC1219.jpg",
    "aviamentos": "capas de frente/aviamentos 2.jpg",
}

# Se existir "capas de frente/banner-inicio.jpg" (ou .png), ele vira o fundo do
# banner principal. Sem ele, entra a foto da fachada.
BANNERS_IMG = {
    "hero":        "capas de frente/Tecidos e aviamentos para sua confecção.jpg",
    "microfibras": "capas de frente/microfibras 7 fios.png",
    "aviamentos":  "capas de frente/aviamentos.jpg",
    "loja":        "capas de frente/nossa loja em scc.jpg",
    "mapa":        "capas de frente/mapa.png",
}

# A fita já vem com o texto desenhado dentro da imagem.
FITA = "fita"

# Fotos dos gerentes: o nome do arquivo vira o nome da pessoa.
GERENTES = "gerentes"

EXT_OK = (".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG")

# Miniatura de cor chapada comprime muito mais que foto de tecido. Abaixo
# disso tratamos como "quadradinho de cor", que não serve de capa.
LIMIAR_FOTO = 6000

def departamento_de(pasta):
    inicio = pasta.split("/")[0]
    return {
        "MICROFIBRAS POLIAMIDA": "poliamida",
        "MICROFIBRAS POLIESTER": "poliester",
        "ESTAMPADOS": "estampados",
        "DRY-FIT": "dryfit",
        "Outros produtos": "aviamentos",
    }.get(inicio)

# ------------------------------------------------------------------ apoio
def slug(txt):
    """Nome de arquivo sem acento. O macOS guarda o acento separado da letra
    (á = a + ~), por isso normalizamos antes de tirar os sinais."""
    t = unicodedata.normalize("NFKD", txt.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t or "item"

def titulo(txt):
    miudas = {"de","da","do","e","com"}
    palavras = re.split(r"\s+", txt.strip().lower())
    saida = []
    for i, p in enumerate(palavras):
        saida.append(p if (p in miudas and i) else p.capitalize())
    return " ".join(saida)

def _chave(txt):
    """Nome de pasta sem acento, sem espaço estranho e em minúsculas."""
    t = unicodedata.normalize("NFKD", txt)
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", t).strip().lower()

def resolver(pasta):
    """Acha a pasta mesmo se o nome tiver espaço duplo, acento ou espaço fixo."""
    caminho = os.path.join(ORIGEM, pasta)
    if os.path.isdir(caminho):
        return caminho
    pai, alvo = os.path.split(caminho)
    if not os.path.isdir(pai):
        return caminho
    chave_alvo = _chave(alvo)
    for nome in os.listdir(pai):
        if _chave(nome) == chave_alvo:
            return os.path.join(pai, nome)

    # nome parecido: "DELITEX" acha "DELITEX POLIAMIDA" e vice-versa
    parecidas = [
        nome for nome in sorted(os.listdir(pai))
        if os.path.isdir(os.path.join(pai, nome))
        and (chave_alvo in _chave(nome) or _chave(nome) in chave_alvo)
    ]
    # pasta vazia não pode ser o produto: fica com a que tem fotos
    com_foto = [
        nome for nome in parecidas
        if any(f.endswith(EXT_OK) for f in os.listdir(os.path.join(pai, nome)))
    ]
    escolha = com_foto or parecidas
    if len(escolha) == 1:
        return os.path.join(pai, escolha[0])
    return caminho

def por_nome(rel):
    """Acha o arquivo pelo nome, ignorando a extensão. Assim trocar um .jpg
    por um .png na pasta não quebra nada."""
    pasta, arquivo = os.path.split(rel)
    base = _chave(os.path.splitext(arquivo)[0])
    caminho = resolver(pasta)
    if not os.path.isdir(caminho):
        return None
    for nome in sorted(os.listdir(caminho)):
        if nome.endswith(EXT_OK) and _chave(os.path.splitext(nome)[0]) == base:
            return os.path.join(os.path.relpath(caminho, ORIGEM), nome)
    return None

def arquivos(pasta):
    caminho = resolver(pasta)
    if not os.path.isdir(caminho):
        return []
    return sorted(
        f for f in os.listdir(caminho)
        if f.endswith(EXT_OK) and not f.startswith(".")
    )

def web(caminho):
    """Caminho como o site enxerga, com a data do arquivo no fim. Assim, quando
    você troca uma foto, o endereço muda e o navegador não mostra a antiga."""
    rel = os.path.relpath(caminho, RAIZ)
    try:
        return f"{rel}?v={int(os.path.getmtime(caminho))}"
    except OSError:
        return rel

def converter(entrada, saida, largura, qualidade):
    """Reduz e comprime com o sips (já vem no macOS). Pula se já existir."""
    if os.path.exists(saida) and os.path.getmtime(saida) >= os.path.getmtime(entrada):
        return saida
    os.makedirs(os.path.dirname(saida), exist_ok=True)
    subprocess.run(
        ["sips", "-Z", str(largura), "-s", "format", "jpeg",
         "-s", "formatOptions", str(qualidade), entrada, "--out", saida],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    return saida

def cor_media(imagem):
    """Reduz a foto a 1 pixel e lê a cor, vira a bolinha de cor do card."""
    tmp = imagem + ".1px.png"
    try:
        subprocess.run(["sips", "-z", "1", "1", "-s", "format", "png", imagem, "--out", tmp],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        dados = open(tmp, "rb").read()
        pos, idat, canais = 8, b"", 3
        while pos < len(dados):
            tam = struct.unpack(">I", dados[pos:pos+4])[0]
            tipo = dados[pos+4:pos+8]
            if tipo == b"IHDR":
                canais = {0:1, 2:3, 3:1, 4:2, 6:4}[dados[pos+8+9]]
            elif tipo == b"IDAT":
                idat += dados[pos+8:pos+8+tam]
            pos += 12 + tam
        cru = zlib.decompress(idat)
        r, g, b = cru[1], cru[2 if canais > 1 else 1], cru[3 if canais > 2 else 1]
        return "#%02X%02X%02X" % (r, g, b)
    except Exception:
        return "#8A8598"
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

def vivacidade(hexa):
    """Quanto a cor "salta aos olhos", usada para escolher a capa do produto."""
    r, g, b = (int(hexa[i:i+2], 16) / 255 for i in (1, 3, 5))
    _, s, v = colorsys.rgb_to_hsv(r, g, b)
    return s * (0.45 + 0.55 * v)

def familia(hexa):
    r, g, b = (int(hexa[i:i+2], 16) / 255 for i in (1, 3, 5))
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h *= 360
    if v < 0.23: return "preto"
    if s < 0.16: return "branco" if v > 0.80 else "cinza"
    if s < 0.30 and v > 0.55 and 15 <= h < 60: return "bege"
    if h < 12 or h >= 348:
        return "rosa" if (v > 0.62 and s < 0.50) else "vermelho"
    if h < 42:  return "marrom" if v < 0.55 else ("bege" if s < 0.45 else "laranja")
    if h < 70:  return "amarelo"
    if h < 170: return "verde"
    if h < 255: return "azul"
    if h < 292: return "roxo"
    return "rosa"

# ------------------------------------------------------------------ execução
def main():
    total = {"feitas": 0}
    def conta(*a, **k):
        total["feitas"] += 1
        if total["feitas"] % 25 == 0:
            print(f"  … {total['feitas']} imagens", flush=True)
        return converter(*a, **k)

    imagens = {}

    print("Banners e departamentos…", flush=True)
    banners = {}
    for nome, rel in list(BANNERS_IMG.items()):
        if not os.path.exists(os.path.join(ORIGEM, rel)):
            achou = por_nome(rel)
            if achou:
                BANNERS_IMG[nome] = achou
    for extensao in (".jpg", ".jpeg", ".png"):
        preferida = "capas de frente/banner-inicio" + extensao
        if os.path.exists(os.path.join(ORIGEM, preferida)):
            BANNERS_IMG["hero"] = preferida
            break
    for nome, rel in BANNERS_IMG.items():
        origem = os.path.join(ORIGEM, rel)
        if os.path.exists(origem):
            destino = os.path.join(DESTINO, "banners", nome + ".jpg")
            conta(origem, destino, *LARGURA["banner"])
            banners[nome] = web(destino)

    for nome, rel in list(DEPARTAMENTOS_IMG.items()):
        # a pasta "capas de categorias" tem preferência
        escolhida = por_nome(PASTA_CATEGORIAS + "/" + nome + ".jpg")
        # senão, acha a original pelo nome, mesmo que a extensão tenha mudado
        if not escolhida and not os.path.exists(os.path.join(ORIGEM, rel)):
            escolhida = por_nome(rel)
        if escolhida:
            DEPARTAMENTOS_IMG[nome] = escolhida

    deps = {}
    for nome, rel in DEPARTAMENTOS_IMG.items():
        origem = os.path.join(ORIGEM, rel)
        if os.path.exists(origem):
            destino = os.path.join(DESTINO, "departamentos", nome + ".jpg")
            conta(origem, destino, *LARGURA["departamento"])
            deps[nome] = web(destino)

    fita = None
    for arq in arquivos(FITA):
        destino = os.path.join(DESTINO, "banners", "fita.jpg")
        conta(os.path.join(resolver(FITA), arq), destino, *LARGURA["fita"])
        fita = web(destino)
        break

    print("Gerentes…", flush=True)
    gerentes = []
    for arq in arquivos(GERENTES):
        nome = titulo(os.path.splitext(arq)[0])
        destino = os.path.join(DESTINO, "gerentes", slug(nome) + ".jpg")
        conta(os.path.join(resolver(GERENTES), arq), destino, *LARGURA["gerente"])
        gerentes.append({"arquivo": nome, "img": web(destino)})

    for pasta, sl, tipo in PRODUTOS_IMG:
        lista = arquivos(pasta)
        if not lista:
            print(f"  ! sem imagens em {pasta}", flush=True)
            continue
        print(f"{sl} ({len(lista)} arquivos)…", flush=True)
        registro = {"cores": [], "galeria": [], "capa": None, "capaPropria": False}
        base = os.path.join(DESTINO, "produtos", sl)

        if tipo == "cores":
            # nomes de arquivo de câmera/WhatsApp não são nomes de cor
            lista = [a for a in lista
                     if not re.match(r"^(IMG[_ ]|_?DSC|Imagem do WhatsApp)", a, re.I)]
            for arq in lista:
                nome = titulo(os.path.splitext(arq)[0].replace("(2)", "").strip())
                cs = slug(nome)
                origem = os.path.join(resolver(pasta), arq)
                grande = conta(origem, os.path.join(base, "cores", cs + ".jpg"), *LARGURA["cor"])
                mini = conta(origem, os.path.join(base, "cores", cs + "-mini.jpg"), *LARGURA["cor_mini"])
                hexa = cor_media(mini)
                registro["cores"].append({
                    "nome": nome, "hex": hexa, "familia": familia(hexa),
                    "img": web(grande),
                    "mini": web(mini),
                    "_origem": origem,
                    "_peso": os.path.getsize(mini),
                })
        else:
            for i, arq in enumerate(lista, 1):
                origem = os.path.join(resolver(pasta), arq)
                destino = conta(origem, os.path.join(base, "galeria", f"{i}.jpg"), *LARGURA["galeria"])
                registro["galeria"].append(web(destino))

        # capa: pasta CAPA própria; senão, a foto de cor mais viva do produto
        capa_origem = None
        se_escolhida = CAPAS_ARQUIVO.get(sl)
        if se_escolhida and os.path.exists(os.path.join(ORIGEM, se_escolhida)):
            capa_origem = os.path.join(ORIGEM, se_escolhida)
            registro["capaPropria"] = True
        if not capa_origem:
            propria = pasta_de_capa(pasta) or (
                resolver(CAPAS_PRODUTO[sl]) if sl in CAPAS_PRODUTO else None
            )
            if propria and os.path.isdir(propria):
                fotos = [f for f in sorted(os.listdir(propria)) if f.endswith(EXT_OK)]
                if fotos:
                    capa_origem = os.path.join(propria, fotos[0])
                    registro["capaPropria"] = True
        if not capa_origem and registro["cores"]:
            fotos = [c for c in registro["cores"] if c["_peso"] >= LIMIAR_FOTO]
            if fotos:
                capa_origem = max(fotos, key=lambda c: vivacidade(c["hex"]))["_origem"]
            else:
                # só há quadradinhos de cor: usa a foto do departamento
                dep = DEPARTAMENTOS_IMG.get(departamento_de(pasta))
                if dep and os.path.exists(os.path.join(ORIGEM, dep)):
                    capa_origem = os.path.join(ORIGEM, dep)
                    registro["capaGenerica"] = True
        if not capa_origem:
            capa_origem = os.path.join(resolver(pasta), lista[0])
        capa = conta(capa_origem, os.path.join(base, "capa.jpg"), *LARGURA["capa"])
        registro["capa"] = web(capa)
        for c in registro["cores"]:
            c.pop("_origem", None)
            c.pop("_peso", None)
        if not registro["cores"]:
            registro.pop("cores")
        if not registro["galeria"]:
            registro.pop("galeria")
        imagens[sl] = registro

    conhecidas = {os.path.abspath(resolver(pasta)) for pasta, _, _ in PRODUTOS_IMG}
    conhecidas |= {os.path.abspath(resolver(c)) for c in CAPAS_PRODUTO.values()}
    esquecidas = []
    for dep in ("MICROFIBRAS POLIAMIDA", "MICROFIBRAS POLIESTER", "DRY-FIT", "ESTAMPADOS"):
        base = os.path.join(ORIGEM, dep)
        if not os.path.isdir(base):
            continue
        for nome in sorted(os.listdir(base)):
            caminho = os.path.join(base, nome)
            if not os.path.isdir(caminho) or _chave(nome).startswith("capa"):
                continue
            atual = os.path.abspath(caminho)
            # a pasta que só guarda outras já cadastradas não está esquecida
            if atual in conhecidas or any(c.startswith(atual + os.sep) for c in conhecidas):
                continue
            tem_foto = any(f.endswith(EXT_OK) for f in os.listdir(caminho))
            esquecidas.append((os.path.join(dep, nome), tem_foto))

    if esquecidas:
        print("\nPastas fora do catálogo:")
        for rel, tem_foto in esquecidas:
            estado = "COM fotos, falta cadastrar" if tem_foto else "vazia, sem fotos ainda"
            print(f"  - {rel}  ({estado})")

    saida = os.path.join(RAIZ, "js", "catalogo-imagens.js")
    with io.open(saida, "w", encoding="utf-8") as fp:
        fp.write("/* ======================================================================\n")
        fp.write("   ARQUIVO GERADO AUTOMATICAMENTE, não edite à mão.\n")
        fp.write("   Para atualizar: python3 ferramentas/preparar-imagens.py\n")
        fp.write("   Os textos dos produtos ficam em js/produtos.js\n")
        fp.write("   ====================================================================== */\n\n")
        fp.write("const BANNERS = " + json.dumps(banners, ensure_ascii=False, indent=2) + ";\n\n")
        fp.write("const CAPAS_DEP = " + json.dumps(deps, ensure_ascii=False, indent=2) + ";\n\n")
        fp.write("const FITA = " + json.dumps(fita, ensure_ascii=False) + ";\n\n")
        fp.write("const GERENTES = " + json.dumps(gerentes, ensure_ascii=False, indent=2) + ";\n\n")
        fp.write("const IMAGENS = " + json.dumps(imagens, ensure_ascii=False, indent=2) + ";\n")

    print(f"\nPronto: {total['feitas']} imagens processadas.")
    print(f"Gerado: {os.path.relpath(saida, RAIZ)}")

if __name__ == "__main__":
    main()
