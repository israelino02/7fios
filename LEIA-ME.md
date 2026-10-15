# 7 Fios Têxtil

Site estático (HTML, CSS e JavaScript puros). Não precisa de servidor, banco de
dados nem instalação: é só subir a pasta em qualquer hospedagem.

---

## 1. O número do WhatsApp

Já está configurado: **(81) 99461-6071**.

Para trocar, abra `js/config.js` e mude a linha:

```js
whatsapp: "5581994616071",
```

Formato: **código do país + DDD + número, só dígitos**. Esse número vale em
**todos** os botões de uma vez: topo, banner, botão "Ligar agora", cada
produto, ficha, carrinho, rodapé e botão flutuante.

No mesmo arquivo ficam endereço, horário, a frase da tarja preta do topo e as
mensagens que já vêm digitadas no WhatsApp.

---

## 2. Como as fotos viram catálogo

Você mexe só na pasta `imagens/`, organizada assim:

```
imagens/
  MICROFIBRAS POLIAMIDA/
    Capa/              ← foto do departamento
    DELITEX/           ← um produto
      PRETO.png        ← cada arquivo é uma cor (o nome vira o nome da cor)
      CAPA/            ← opcional: foto de capa só desse produto
  Outros produtos/
    Viés/
      Viés noronha/    ← produto com várias fotos (vira galeria de arrastar)
  capas de frente/     ← as 3 fotos dos banners da home
```

Depois de mexer nas fotos, rode:

```bash
python3 ferramentas/preparar-imagens.py
```

O script faz isto:

1. **Reduz e comprime tudo**. As originais têm até 20 MB cada; no site elas
   ficam com dezenas de KB. Suas fotos originais **não são alteradas**;
2. **Gera a versão WebP** de cada foto, com no máximo 280 KB, e é ela que o
   site usa. O JPG continua em `assets/` só como arquivo de trabalho e não
   sobe para a hospedagem. A capa de cada produto ganha também uma versão
   estreita (`capa-p.webp`, 480 px), que é a que o celular baixa;
3. **Lê a cor média de cada foto**, e é daí que saem as bolinhas coloridas dos
   cards e o filtro de cor;
4. **Gera o vídeo da história em WebM**, menor que o MP4 (precisa do ffmpeg:
   `brew install ffmpeg`);
5. **Escreve `js/catalogo-imagens.js`**, que o site lê sozinho, e a foto do
   banner principal direto no `index.html`, para ela carregar primeiro;
6. **Refaz as páginas em HTML puro** (seção 9), chamando o
   `ferramentas/gerar-paginas.py`.

Precisa do Pillow (`pip3 install pillow`) e do Node. Rodar de novo é rápido:
ele pula o que já converteu.

**Regras que ele segue para a capa de cada produto:**

- existe uma pasta começando com `CAPA` dentro do produto → usa a foto dela;
- ou uma pasta ao lado que cite o nome do produto (ex.: `CAPA ROMANTIK
  FEMININO` ao lado de `FEMININO`) → usa essa;
- não achou nenhuma → escolhe a foto de cor mais viva do próprio produto;
- só tem quadradinho de cor chapada → usa a foto do departamento.

O nome da pasta de capa é livre, desde que comece com "CAPA". Renomear não
quebra nada.

**Trocar uma foto:** basta substituir o arquivo e rodar o script. Ele carimba a
data no endereço da imagem, então o navegador de quem já visitou mostra a nova
na hora, sem precisar limpar cache. A extensão também pode mudar (jpg → png)
que ele continua achando pelo nome.

---

## 3. Mexer nos textos dos produtos

Ficam em `js/produtos.js`: nome, descrição, ficha técnica, categoria e unidade.
Esse arquivo é seu; o script de imagens **nunca** encosta nele.

A ligação entre texto e foto é o campo `slug`, que precisa bater com o nome da
pasta processada (ex.: `"delitex"`). No mesmo arquivo estão os
**departamentos** e as **categorias** do filtro.

O que vale a pena completar quando tiver os dados: `detalhes` de cada produto
(composição, gramatura, largura) e a `unidade`. Deixei tudo em "metro" para
tecido e "rolo" para aviamento; se você vende por quilo, é uma palavra por
produto.

---

## 4. Como o cliente compra

Não existe pagamento nem formulário. O caminho é:

- **Botão verde "Consultar"** no card → abre o WhatsApp perguntando por aquele produto;
- **Botão `+`** → joga o item no **orçamento**;
- Dentro da ficha, o cliente escolhe **a cor** e a cor vai junto no pedido;
- **"Meu orçamento"** no topo → manda tudo numa mensagem só:

```
Olá! Montei um orçamento no site da 7 Fios Têxtil:

• Delitex, cor Burgundy (PA-002), 3 metros
• Renda 7 Mares 17 cm (AV-010), 2 metros

Pode me passar os preços e condições?
```

O orçamento fica salvo no navegador do cliente: ele pode sair e voltar depois.

---

## 5. Publicar o site

O site fica na Hostinger, em `public_html`. O pacote sai do que está guardado
no git, já sem o que não precisa ir para o ar:

```bash
git archive --format=zip -o 7fios-site.zip HEAD
```

O `.gitattributes` diz o que fica fora: a pasta `ferramentas/`, este LEIA-ME
e os JPG de trabalho de `assets/` (o site usa os WebP). O zip tem uns 38 MB.
No Gerenciador de Arquivos da Hostinger, suba o zip em `public_html` e
extraia por cima. O `.htaccess` é arquivo oculto: ligue "Mostrar arquivos
ocultos" para conferir que ele está lá.

**Não precisa subir a pasta `imagens/`**: ela é só a fonte, tem 1,5 GB.

Depois de publicar uma página nova, mande o `sitemap.xml` de novo no Search
Console.

**Depois de atualizar o catálogo**, abra o `index.html` e troque o `?v=3` das
últimas linhas e do CSS para `?v=4`. Isso força quem já visitou a enxergar a
versão nova na hora, em vez da guardada no navegador.

---

## 6. Estrutura dos arquivos

```
index.html                      a loja
sobre.html                      história, missão, valores e gerentes
contato.html                    canais, mapa, horários e dúvidas frequentes
privacidade.html                política de privacidade (escrita à mão)
microfibra-poliamida.html …     uma página por departamento ← gerada
404.html                        página de endereço que não existe ← gerada
sitemap.xml, llms.txt           mapa do site e resumo para as I.As ← gerados
css/styles.css                  aparência (índigo #1D0E47 e dourado #FFD801, da logo)
js/config.js                    WhatsApp, endereço, e-mail, horários  ← você edita
js/produtos.js                  textos, categorias, valores, gerentes ← você edita
js/catalogo-imagens.js          fotos e cores             ← gerado, não edite à mão
js/comum.js                     cabeçalho e rodapé das 3 páginas
js/main.js                      motor da loja
js/pagina.js                    conteúdo das páginas Sobre e Contato
ferramentas/preparar-imagens.py script que prepara as fotos
ferramentas/gerar-paginas.py    escreve as páginas em HTML puro (seção 9)
ferramentas/empacotar.py        arquivo único para o link de visualização
imagens/                        suas fotos originais (não sobe pro site)
assets/                         fotos já otimizadas (essa sobe)
```

O cabeçalho e o rodapé estão repetidos nos três HTML. Se mudar um item do
menu, lembre de mudar nos três arquivos.

---

## 7. O que ainda dá para acrescentar

- **Vídeo institucional**: já existe um bloco pronto e comentado dentro do
  `index.html`. Coloque `assets/video.mp4` e apague as marcas de comentário;
- **Instagram** no rodapé: preencha `instagram` em `js/config.js`;
- **Preços na tela**: troque `preco: null` pelo valor (ex.: `preco: 18.90`) nos
  produtos em que quiser mostrar o valor;
- **Novos produtos**: crie a pasta em `imagens/` com as fotos, adicione a linha
  correspondente em `PRODUTOS_IMG` dentro do script e o bloco de texto em
  `js/produtos.js`. Ao rodar o script, ele **avisa** quais pastas têm foto e
  ainda não estão no catálogo, então é só olhar o aviso no fim.

Hoje estão esperando fotos: `DELITEX CANELADA`, `DELITEX CONFORT`,
`MAX PREMIUM`, `SUPLEX BLACKOUT` e `SUPLEX FLEX FIT`. Esses cinco já estão no
site com nome e descrição, usando a foto do departamento e um selo
"Foto em breve". Quando você colocar as fotos na pasta e acrescentar a linha
em `PRODUTOS_IMG`, o selo some sozinho e a foto de verdade entra no lugar.

---

## 8. Dúvidas frequentes (FAQ) e busca no Google

A seção "Perguntas de quem compra para revender" fica na página de Contato.
Editar é no próprio `contato.html`, procurando por `faq__item`. Escreva como
o vendedor responderia, sem repetir palavra-chave: o Google e as I.As
penalizam texto que só empilha termos. O `gerar-paginas.py` lê essas
perguntas e escreve os dados estruturados (FAQPage) da página sozinho.

Junto com ela há um bloco de dados estruturados (`application/ld+json`) no fim
do `index.html`, que informa ao Google o nome da loja, telefone, endereço e
horário.

---

## 9. Páginas por departamento, e o que o Google e as I.As leem

A loja é montada pelo JavaScript. O Google nem sempre roda JavaScript e os
robôs das I.As quase nunca rodam, então para eles a loja parecia vazia. O
`ferramentas/gerar-paginas.py` escreve em HTML puro:

- **uma página por departamento**: `microfibra-poliamida.html`,
  `microfibra-poliester.html`, `tecidos-estampados.html`,
  `tecido-dry-fit.html`, `tecido-suplex.html` e `aviamentos.html`. Cada uma
  tem texto, os produtos com foto, ficha e lista de cores, perguntas
  frequentes e os dados estruturados (Product, BreadcrumbList e FAQPage). O
  botão "Ver cores e orçamento" abre a loja já filtrada e com a ficha do
  produto aberta (`index.html?grupos=suplex&produto=SU-001`);
- **endereço, telefone, horário e links de contato** dentro do HTML de todas
  as páginas, e o rodapé apontando para os departamentos;
- os textos do **Sobre** e os horários do **Contato**;
- a **404**, o **sitemap.xml** e o **llms.txt**.

O texto de cada página de departamento (título, abertura e perguntas) fica
no começo do próprio script, em `PAGINAS`. Nome, descrição, ficha e cores
dos produtos continuam vindo de `js/produtos.js` e das fotos. Mudou alguma
coisa, rode:

```bash
python3 ferramentas/gerar-paginas.py
```

O `preparar-imagens.py` já chama ele no fim. Os links com `?grupos=` (os do
Google Ads e do Perfil da Empresa) continuam funcionando como antes.

---

## 10. Privacidade e aviso de cookies

O site usa Tag Manager, Analytics, Google Ads, Pixel da Meta e Clarity. Por
isso tem a `privacidade.html` (link no rodapé de todas as páginas) e o aviso
de cookies, que está em `js/comum.js`. Quem recusa não carrega o Tag Manager
nas páginas seguintes, e a medição para na hora. A escolha fica guardada no
navegador com a chave `7fios_cookies`.

Se entrar ferramenta nova no Tag Manager, acrescente na lista da política e
troque a data do topo dela.
