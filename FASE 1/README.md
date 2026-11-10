# Quadro — uma linguagem para desenhar (Fase 1)

Projeto de **Teoria da Computação e Compiladores**, baseado na estrutura didática do parser do Robô e da aula sobre AST. Nesta fase não há geração de SVG nem desenho: o resultado é uma **AST em JSON**.

## Entrega

- `Especificacao_Linguagem.pdf`: documentação solicitada no enunciado.
- `Especificacao_Linguagem.md`: a mesma especificação, em texto editável.
- `index.html`: página para digitar e testar programas.
- `main.js`: integração da interface, lexer, parser e AST.
- `tokens.js`: tabela de expressões regulares.
- `lexer.js`: separação em tokens, linhas e erros léxicos.
- `parser.js`: analisador descendente recursivo e geração de AST.
- `testes/validos`: cinco programas válidos.
- `testes/invalidos`: três programas inválidos.
- `testes/expectativas.md`: resultado esperado de cada programa.
- `testes/executar-testes.mjs`: testes automatizados (Node.js, sem pacotes externos).

## Como abrir a página

Como o JavaScript utiliza **módulos ES**, abra o projeto por um servidor HTTP local; não abra `index.html` por `file://`, que costuma impedir `import` nos navegadores.

No terminal, dentro da pasta do projeto:

```sh
python -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador. Em distribuições Linux que usam `python3`, execute `python3 -m http.server 8000`. Não é necessário instalar bibliotecas JavaScript nem ter acesso ao GitHub. Outro servidor estático local funciona igualmente.

Para executar testes automatizados com Node.js:

```sh
node testes/executar-testes.mjs
```

Resultado esperado: **18 testes passaram** (5 válidos, 3 inválidos e 10 testes adicionais).

## Exemplo

```text
quadro 200 160
bloco girar 90 mover 20 10 {
  circulo 0 0 15 preencher azul
  reta 0 0 40 0 traco #FF8800 espessura 2
}
```

O programa começa com `quadro largura altura`. Formas aceitam estilos opcionais; `bloco` aceita rotação e deslocamento opcionais, em qualquer ordem, mas sem repeti-los. Blocos devem conter pelo menos um elemento. Comentários começam com `//`.

Veja a especificação para a gramática completa, decisões sobre zeros, cores, atributos repetidos e estruturas da AST.
