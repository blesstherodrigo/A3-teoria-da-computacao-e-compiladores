import { regrasTokens } from './tokens.js';

/** Devolve { tokens, erros }. Havendo erros, o parser NAO deve ser executado. */
export function analisarLexico(codigo) {
  const tokens = [];
  const erros = [];
  let posicao = 0;
  let linha = 1;

  function consumir(texto) {
    const quebras = texto.match(/\r\n|\r|\n/g);
    if (quebras !== null) linha += quebras.length;
    posicao += texto.length;
  }

  while (posicao < codigo.length) {
    let encontrado = false;

    for (const regra of regrasTokens) {
      regra.padrao.lastIndex = posicao;
      const match = regra.padrao.exec(codigo);
      if (!match) continue;

      const lexema = match[0];
      if (!regra.ignorar) {
        tokens.push({ tipo: regra.tipo, lexema, linha });
      }
      consumir(lexema);
      encontrado = true;
      break;
    }

    if (!encontrado) {
      // A tarefa exige reportar toda a palavra invalida ate o proximo espaco.
      let fim = posicao;
      while (fim < codigo.length && !/\s/.test(codigo[fim])) fim++;
      const trecho = codigo.slice(posicao, fim);
      erros.push({ linha, trecho });
      consumir(trecho);
    }
  }

  return { tokens, erros };
}
