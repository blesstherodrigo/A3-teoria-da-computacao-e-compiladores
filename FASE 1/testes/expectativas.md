# Casos de teste e resultados esperados

Os cinco arquivos válidos devem apresentar a mensagem `Análise sintática: programa válido.` e uma AST em JSON. Os tokens também devem ser listados com `tipo`, `lexema` e `linha`.

| Arquivo | Classificação | Resultado esperado |
|---|---|---|
| `validos/01_casa.txt` | Válido | Tela 480×320; AST com cinco elementos no topo: retângulo, duas retas, círculo e grupo. Grupo com retângulo e outro grupo, contendo uma reta. |
| `validos/02_formas_modificadores.txt` | Válido | Tela 200×160; dois grupos. No primeiro a ordem dos modificadores é `rotacao` → `deslocamento`; no segundo é `deslocamento` → `rotacao`. AST completa em `AST_exemplo_2.json`. |
| `validos/03_atributos_repetidos.txt` | Válido | Tela 100×100; círculo (0,0,0); os últimos estilos prevalecem: preenchimento `verde`, traço `branco`, espessura `2`. |
| `validos/04_aninhamento.txt` | Válido | Tela 250×250; três grupos aninhados, um sem modificadores, um com deslocamento (0,0) e um com rotação 0, contendo uma reta. |
| `validos/05_zeros_e_hex.txt` | Válido | Tela 0×0; retângulo com dimensões 0, espessura 0 e traço `#00FF88` normalizado para maiúsculas; círculo de raio 0. |
| `invalidos/01_erro_lexico.txt` | Erro léxico | `Erro léxico na linha 2: trecho inválido "#GG11AA".` O parser não é executado e não há AST. |
| `invalidos/02_falta_numero.txt` | Erro sintático | `Erro sintático na linha 2: esperado NUM, encontrado TRACO.` Não há AST. |
| `invalidos/03_grupo_vazio.txt` | Erro sintático | `Erro sintático na linha 3: esperado RETA, CIRCULO, RETANGULO ou BLOCO, encontrado FECHA.` Não há AST. |

Também há dez verificações de borda no teste automatizado: número zero, zero à esquerda, prefixos de palavras-chave, grupo vazio, repetição de modificadores, modificador usado em forma, ausência de declaração de tela, comentários e linha correta, bloqueio do parser por erro léxico, e limite de inteiros representáveis em JavaScript.

Execução: `node testes/executar-testes.mjs` (18 testes passaram).
