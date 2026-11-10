/**
 * Regras lexicas da linguagem de desenho Quadro.
 * A flag y obriga o casamento exatamente na posicao atual do cursor.
 * A lookahead FIM_PALAVRA impede que palavras-chave reconhecam prefixos.
 */
const FIM_PALAVRA = '(?=$|[\\s{}]|\\/\\/)';

function palavra(lexema) {
  return new RegExp(lexema + FIM_PALAVRA, 'y');
}

export const regrasTokens = [
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
