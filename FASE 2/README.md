# Linguagem de desenho: Página-base e Atividade · Fase 2: da AST ao SVG

**Compiladores**

Este repositório traz a **página-base** usada nas atividades de Compiladores: a aula de SVG, a Fase 1 (léxico, sintático e AST) e a Fase 2 (verificação semântica e gerador de SVG).

## Como abrir a página

A página usa módulos de JavaScript, que **não funcionam com duplo clique** no arquivo. Abra de um destes jeitos:

- **GitHub Pages** (se estiver ativo no repositório): acesse `https://<usuario>.github.io/<repositorio>/`.
- **VS Code:** extensão *Live Server*, botão direito em `index.html` e *Open with Live Server*.
- **Terminal:** dentro da pasta do projeto, `python3 -m http.server 8000` e abra `http://localhost:8000`.

O visual usa Tailwind por CDN, então é preciso internet. Sem ela a página continua funcionando, só sem o estilo.

## A página e os arquivos

| Coluna | Para que serve |
|---|---|
| Esquerda (Entrada, Erros e mensagens, Tokens, AST) | Fases 1 e 2: o programa na sua linguagem vira tokens, AST e, na Fase 2, SVG. |
| Direita (Saída SVG e Imagem) | Aula de SVG: escreva o SVG à mão e clique em **Desenhar**. Na Fase 2, recebe o SVG gerado pelo seu programa. |

| Arquivo | Quem escreve | O que faz |
|---|---|---|
| `tokens.js` | **você (Fase 1)** | A lista de tokens da sua linguagem, com expressões regulares. |
| `parser.js` | **você (Fase 1)** | O analisador sintático: recebe os tokens e devolve a AST. |
| `semantica.js` | **você (Fase 2)** | As verificações semânticas: recebe a AST e devolve um vetor de erros. |
| `gerador.js` | **você (Fase 2)** | Recebe a AST e devolve o texto SVG. |
| `lexer.js` | pronto | O analisador léxico, igual ao do tutorial. Usa as regras de `tokens.js`. |
| `svg.js` | pronto | Valida, desenha e baixa o SVG. |
| `main.js` | pronto | Liga a página aos módulos. |
| `index.html` | pronto | A página. |

Cada arquivo para completar traz, nos comentários, o que **recebe** e o que **devolve**. Enquanto ele não estiver pronto, a página mostra um aviso dizendo qual arquivo falta, e não quebra.

---

# Atividade · Fase 2: da AST ao SVG

**Compiladores**

## 1. Objetivo

Na Fase 1, vocês construíram o léxico, o parser e a AST da linguagem de desenho. Agora vocês **completam o compilador**: verificam a semântica do programa e **geram um SVG**, que a página desenha. No fim, o caminho completo funciona:

```text
programa → tokens → AST → verificação semântica → SVG
```

Vocês continuam no mesmo projeto, a página-base. Ela já traz o `svg.js` e o `main.js` prontos (desenham, validam e baixam o SVG). Vocês completam o `semantica.js` e o `gerador.js`.

## 2. Ponto de partida

| Arquivo | O que fazer nesta fase |
|---|---|
| `semantica.js` | **Escrever.** Recebe a AST e devolve o vetor de erros semânticos. |
| `gerador.js` | **Escrever.** Recebe a AST e devolve o texto SVG. |
| `parser.js` | **Ajustar.** Cada nó da AST que pode ter erro semântico precisa guardar a **linha** em que começa. |
| `svg.js`, `main.js`, `lexer.js` | Prontos. Não precisam de alteração. |

**Por que a linha?** Os erros semânticos informam em que linha do programa está o problema. Se a AST da Fase 1 não guarda a linha, o parser precisa passar a guardá-la (por exemplo, em um campo `linha`).

## 3. O que o SVG deve conter

A sintaxe e a AST são de vocês, mas **o significado é igual para todos**. Assim os desenhos podem ser comparados. A tabela abaixo é a semântica fixa que o gerador precisa seguir.

| Na linguagem | No SVG |
|---|---|
| Tela (largura L, altura A) | `<svg xmlns="http://www.w3.org/2000/svg" width="L" height="A" viewBox="0 0 L A">` |
| Reta, círculo e retângulo | `<line x1 y1 x2 y2>`, `<circle cx cy r>` e `<rect x y width height>` |
| Cor do traço, cor do preenchimento e espessura | `stroke`, `fill` e `stroke-width` |
| Estilo **ausente** | traço preto (`stroke="black"`), espessura 1 e **sem preenchimento** (`fill="none"`) |
| Atributo repetido na mesma forma | vale o **último** |
| Cores | o nome da linguagem vira um nome de cor do SVG (tabela de vocês); `#RRGGBB` passa direto |
| Grupo | `<g>` com os filhos dentro. Os filhos usam **coordenadas locais**, com a origem no ponto do grupo |
| Rotação N | `rotate(N)`: N graus, no sentido horário, em torno da origem atual |
| Deslocamento X Y | `translate(X Y)`: X para a direita e Y para baixo |
| Vários modificadores | todos no `transform` do grupo, **na ordem em que foram escritos** |
| Ordem dos elementos | a do programa: o que vem depois fica por cima |

**Os padrões importam.** No SVG, uma reta sem `stroke` fica invisível e uma forma sem `fill` sai preta. Por isso o gerador precisa aplicar os padrões acima. O jeito mais simples é escrever sempre os três atributos em toda forma.

**A ordem dos modificadores importa.** `rotate(90) translate(40 0)` e `translate(40 0) rotate(90)` desenham em posições diferentes. A ordem escrita na AST é a ordem do `transform`.

### Exemplo

O programa da Fase 1 (a sintaxe é só um exemplo; a de vocês é outra) e o SVG que o gerador deve produzir. A formatação do texto SVG é livre, desde que o desenho seja o mesmo.

**Programa**

```text
tela 400 300
// um carro simples
retangulo 50 150 200 60 preenchimento azul
grupo deslocamento 70 190 [
    circulo 0 0 25 preenchimento preto
    grupo rotacao 45 [
        linha 0 0 20 0 traco branco espessura 2
    ]
]
grupo deslocamento 200 190 [
    circulo 0 0 25 preenchimento preto
]
```

**SVG esperado**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect x="50" y="150" width="200" height="60" fill="blue" stroke="black" stroke-width="1"/>
  <g transform="translate(70 190)">
    <circle cx="0" cy="0" r="25" fill="black" stroke="black" stroke-width="1"/>
    <g transform="rotate(45)">
      <line x1="0" y1="0" x2="20" y2="0" fill="none" stroke="white" stroke-width="2"/>
    </g>
  </g>
  <g transform="translate(200 190)">
    <circle cx="0" cy="0" r="25" fill="black" stroke="black" stroke-width="1"/>
  </g>
</svg>
```

**Desenho**

<img src="docs/exemplo-carro.png" width="320" alt="Carro: um retângulo azul com duas rodas pretas, uma delas com um raio branco girado 45 graus">

Na tabela de cores do exemplo, `azul` virou `blue`, `preto` virou `black` e `branco` virou `white`. As cores de vocês serão outras.

## 4. Verificação semântica

A gramática aceita o zero, então alguns programas passam pelo parser mas não fazem sentido. Só a análise semântica os detecta. São três verificações obrigatórias:

| Verificação | Exemplo de mensagem |
|---|---|
| Tela com largura ou altura igual a zero | `linha 1: a tela precisa ter largura e altura maiores que zero` |
| Círculo com raio zero | `linha 2: o círculo precisa ter raio maior que zero` |
| Retângulo com largura ou altura zero | `linha 3: o retângulo precisa ter largura e altura maiores que zero` |

- `verificar(ast)` percorre a **AST inteira**, inclusive dentro de grupos e de grupos aninhados.
- Devolve **todos** os erros encontrados, cada um com a linha: `[ { linha, mensagem }, ... ]`. Um vetor vazio significa que não há erro semântico.
- Se houver erro, **nenhum SVG é gerado**, e a página mostra cada erro. A redação das mensagens é livre.

## 5. O que entregar

### 5.1 Documento de semântica (PDF ou Word, curto)

- A **tabela de mapeamento**: cada tipo de nó da AST de vocês e o SVG que ele gera.
- A **tabela de cores**: cada nome de cor da linguagem e a cor do SVG correspondente.
- As **decisões de projeto** desta fase (por exemplo, como o gerador trata um grupo sem modificadores).

### 5.2 Código

`semantica.js`, `gerador.js` e os ajustes no `parser.js`. Sem bibliotecas de desenho nem de geração de SVG.

### 5.3 Página funcionando

O caminho completo na página-base: ao clicar em **Analisar**, o SVG gerado aparece na coluna da direita e já vem desenhado.

### 5.4 Testes

- O **arquivo `.svg` e uma imagem** de cada um dos 5 programas válidos da Fase 1.
- **2 programas com erro semântico**, de verificações diferentes, com a mensagem que a página mostra.

### 5.5 Desenho final

Um programa na linguagem de vocês que desenha algo **reconhecível** (uma casa, um carro, um robô, um rosto...), usando as três formas e **grupos aninhados com os dois modificadores**. Entreguem o programa, o `.svg` e a imagem.

## 6. Regras de implementação

- **Gerador recursivo:** percorre a AST visitando cada nó e descendo nos filhos, como o `paraMermaid` da aula de AST.
- **SVG válido:** a página valida o texto antes de desenhar. Se o gerador produzir um SVG inválido, a página mostra o erro.
- **Ordem das fases:** léxico, sintático, semântico e gerador. Em cada fase com erro, as seguintes não rodam.
- **Texto legível:** recomendamos indentar o SVG gerado, o que facilita os testes de vocês. Não é exigido.

## 7. Roteiro sugerido

1. Ajustem o parser para guardar a linha nos nós da AST.
2. Gerem o SVG só da tela e de uma forma, e vejam o desenho na página.
3. Acrescentem as três formas, os atributos de estilo e os padrões.
4. Acrescentem os grupos e os modificadores: primeiro um grupo, depois grupos aninhados.
5. Escrevam a verificação semântica.
6. Rodem os 5 programas da Fase 1 e o desenho final.
7. Fechem o documento de semântica.

## 8. Cuidados que costumam dar problema

- **Reta invisível ou forma preta.** É o padrão do SVG. Aplique os padrões da tabela.
- **Ordem dos modificadores.** Trocar `rotate` e `translate` de lugar muda o desenho.
- **Grupos aninhados.** A recursão resolve. Cuidado para não tratar só o primeiro nível.
- **Coordenadas locais.** Desenhe o objeto em torno de `(0, 0)` dentro do grupo e deixe o `translate` posicioná-lo, como na aula de SVG.
- **xmlns.** Sem ele, o arquivo `.svg` não abre. A página avisa quando ele falta.
- **O zero.** A gramática o aceita, e é por isso que a verificação semântica existe.

## 9. Como será avaliado

| Critério | Peso |
|---|---|
| Documento de semântica: mapeamentos e tabela de cores | 1,0 |
| Verificação semântica: as três verificações, com a linha, em toda a AST | 2,0 |
| Gerador: formas, estilos e padrões corretos | 2,0 |
| Gerador: grupos aninhados e modificadores na ordem escrita | 2,0 |
| Página funcionando e mensagens de erro | 0,5 |
| Testes: 5 programas válidos e 2 com erro semântico | 1,0 |
| Desenho final | 1,5 |
| **Total** | **10,0** |