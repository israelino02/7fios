# 7 Fios Têxtil — loja virtual

Site estático (HTML, CSS e JavaScript puros). Não precisa de servidor, banco de
dados nem instalação: é só abrir o `index.html` ou subir a pasta em qualquer
hospedagem.

---

## 1. Colocar o número do WhatsApp  ← faça isso primeiro

Abra `js/config.js` e troque a linha:

```js
whatsapp: "5581000000000",
```

Formato: **código do país + DDD + número, só dígitos**.
Exemplo — para (81) 99461-6071 fica `"5581994616071"`.

Esse número passa a valer em **todos** os botões do site de uma vez:
topo, banner, cada produto, ficha do produto, carrinho, rodapé e botão flutuante.

No mesmo arquivo você também ajusta endereço, horário, telefone que aparece
escrito na tela, a frase da tarja preta do topo e as mensagens que já vêm
digitadas no WhatsApp.

---

## 2. Mexer nos produtos

Tudo fica em `js/produtos.js`. Copie um bloco existente e altere:

```js
{
  nome: "Microfibra Poliamida",
  sku: "TEC-001",              // código único do produto
  grupo: "tecidos",            // "tecidos" ou "outros"
  categoria: "esportivo",      // precisa existir na lista CATEGORIAS do topo do arquivo
  resumo: "Toque macio e caimento premium",
  unidade: "metro",            // metro, rolo, peça, cone, cento…
  preco: null,                 // null = "Preço sob consulta"; ou 18.90
  descricao: "Texto que aparece na ficha do produto.",
  detalhes: { Composição: "Poliamida com elastano", Largura: "1,60 m" },
  cores: ["preto", "azul"],    // ids da lista CORES (alimenta o filtro de cor)
  tags: ["Mais vendido"],      // selos no card
  cor: "#5B2333",              // cor do card quando não há foto
  destaque: true,              // aparece na vitrine "Mais vendidos"
  novidade: true,              // aparece na vitrine "Novidades"
}
```

Ao salvar, o site se atualiza sozinho: vitrines, filtros laterais, contadores,
departamentos, busca e rodapé são todos gerados dessa lista.

### Colocar fotos nos produtos

1. Salve a imagem em `assets/produtos/` (ex.: `microfibra.jpg`, quadrada fica melhor);
2. Adicione a linha no produto: `imagem: "assets/produtos/microfibra.jpg",`

Sem foto, o card mostra um retângulo com a cor e a textura de tecido — por isso
o site já fica apresentável antes de você tirar as fotos.

---

## 3. Como o cliente compra

Não existe pagamento nem formulário no site. O caminho é:

- **Botão verde "Consultar"** no card → abre o WhatsApp já perguntando por aquele produto;
- **Botão `+`** no card → joga o item no **orçamento** (o carrinho da loja);
- **"Meu orçamento"** no topo → lista os itens, permite mudar a quantidade e
  manda tudo numa única mensagem para o vendedor, assim:

```
Olá! Montei um orçamento no site da 7 Fios Têxtil:

• Microfibra Poliamida (TEC-001) — 3 metros
• Elástico (AVI-001) — 2 rolos

Pode me passar os preços e condições?
```

O orçamento fica salvo no navegador do cliente, então ele não perde a lista se
sair e voltar depois.

---

## 4. Publicar o site

Suba a pasta inteira (mantendo a estrutura) em qualquer hospedagem de site
estático — Hostinger, Vercel, Netlify, GitHub Pages, cPanel, etc. O arquivo de
entrada é o `index.html`.

**Depois de atualizar o catálogo**, abra o `index.html` e troque o `?v=1` das
últimas linhas e do CSS para `?v=2` (depois `?v=3`, e assim por diante). Isso
força quem já visitou o site a enxergar a versão nova na hora, em vez da
guardada no navegador.

---

## 5. Estrutura dos arquivos

```
index.html            página da loja
css/styles.css        aparência (cores da logo: índigo #1D0E47 e dourado #FFD801)
js/config.js          WhatsApp, endereço, horário e mensagens   ← você edita
js/produtos.js        catálogo                                   ← você edita
js/main.js            motor da loja (filtros, busca, carrinho)   ← não precisa mexer
assets/logo.jpg       logotipo
assets/produtos/      fotos dos produtos
```

---

## 6. O que ainda dá para acrescentar

- Vídeo institucional: já existe um bloco pronto e comentado dentro do
  `index.html` — basta colocar `assets/video.mp4` e apagar as marcas de comentário;
- Instagram no rodapé: preencha `instagram` em `js/config.js`;
- Preços na tela: troque `preco: null` pelo valor (ex.: `preco: 18.90`) nos
  produtos em que quiser mostrar o valor.
