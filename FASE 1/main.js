import { analisarLexico } from './lexer.js';
import { analisarSintatico } from './parser.js';

const entrada = document.querySelector('#entrada');
const saidaTokens = document.querySelector('#tokens');
const saidaAnalise = document.querySelector('#resultado');

function analisar() {
  const { tokens, erros } = analisarLexico(entrada.value);
  saidaTokens.textContent = JSON.stringify(tokens, null, 2);

  if (erros.length > 0) {
    saidaAnalise.textContent = erros.map(e =>
      `Erro léxico na linha ${e.linha}: trecho inválido "${e.trecho}".`
    ).join('\n');
    return; // NUNCA executar sintatico se existir erro lexico.
  }

  try {
    const ast = analisarSintatico(tokens);
    saidaAnalise.textContent = 'Análise sintática: programa válido.\n\n'
      + JSON.stringify(ast, null, 2);
  } catch (erro) {
    saidaAnalise.textContent = erro.message;
  }
}

document.querySelector('#analisar').addEventListener('click', analisar);
analisar();
