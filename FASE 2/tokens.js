// tokens.js · a lista de tokens da SUA linguagem (Fase 1)
//
// Cada regra é um objeto com:
// tipo:    o nome do token (por exemplo, "CIRCULO")
// padrao:  a expressão regular, SEMPRE com a flag y (por exemplo, /circulo\b/y)
// ignorar: true para tokens que não vão para a lista (espaços, comentários)
//
// Atenção: a ordem importa quando dois padrões podem casar no mesmo ponto do texto.
//
// Exemplo do formato (apague e escreva os seus):
// { tipo: "ESPACO", padrao: /\s+/y, ignorar: true },

const FIM_PALAVRA = '(?=$|[\\s{}]|\\/\\/)';

function palavra(lexema) {
  return new RegExp(lexema + FIM_PALAVRA, 'y');
}

export const regras = [
  { tipo: 'COMENTARIO', padrao: /\/\/[^\r\n]*/y, ignorar: true },
  { tipo: 'ESPACO', padrao: /[ \t\r\n]+/y, ignorar: true },
  { tipo: 'QUADRO', padrao: palavra('quadro') },
  { tipo: 'RETA', padrao: palavra('reta') },
  { tipo: 'CIRCULO', padrao: palavra('circulo') },
  { tipo: 'RETANGULO', padrao: palavra('retangulo') },
  { tipo: 'BLOCO', padrao: palavra('bloco') },
  { tipo: 'GIRAR', padrao: palavra('girar') },
  { tipo: 'MOVER', padrao: palavra('mover') },
  { tipo: 'TRACO', padrao: palavra('traco') },
  { tipo: 'PREENCHER', padrao: palavra('preencher') },
  { tipo: 'ESPESSURA', padrao: palavra('espessura') },
  { tipo: 'COR_HEX', padrao: new RegExp('#[A-Fa-f0-9]{6}' + FIM_PALAVRA, 'y') },
  { tipo: 'COR_NOME', padrao: palavra('(?:vermelho|verde|azul|preto|branco|amarelo|roxo)') },
  { tipo: 'NUM', padrao: palavra('(?:0|[1-9][0-9]*)') },
  { tipo: 'ABRE', padrao: /\{/y },
  { tipo: 'FECHA', padrao: /\}/y },
];
