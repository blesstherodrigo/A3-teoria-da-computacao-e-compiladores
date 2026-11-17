/**
 * Parser descendente recursivo da linguagem Quadro.
 * A AST contem somente significado: sem chaves, palavras-chave ou tokens.
 */
export function analisarSintatico(tokens) {
  let i = 0;

  function atual() {
    return tokens[i];
  }

  function falhar(esperado) {
    const token = atual();
    const linha = token?.linha ?? tokens.at(-1)?.linha ?? 1;
    const encontrado = token?.tipo ?? 'FIM_DO_PROGRAMA';
    throw new Error(`Erro sintático na linha ${linha}: esperado ${esperado}, encontrado ${encontrado}.`);
  }

  function esperar(tipo) {
    if (atual()?.tipo !== tipo) falhar(tipo);
    const token = atual();
    i++;
    return token;
  }

  function numero() {
    const token = esperar('NUM');
    const valor = Number(token.lexema);
    if (!Number.isSafeInteger(valor)) {
      throw new Error(`Erro sintático na linha ${token.linha}: esperado número inteiro representável, encontrado NUM (${token.lexema}).`);
    }
    return valor;
  }

  function cor() {
    if (atual()?.tipo === 'COR_NOME') return esperar('COR_NOME').lexema;
    if (atual()?.tipo === 'COR_HEX') return esperar('COR_HEX').lexema.toUpperCase();
    return falhar('COR_NOME ou COR_HEX');
  }

  function comecaElemento() {
    return ['RETA', 'CIRCULO', 'RETANGULO', 'BLOCO'].includes(atual()?.tipo);
  }

  function comecaEstilo() {
    return ['TRACO', 'PREENCHER', 'ESPESSURA'].includes(atual()?.tipo);
  }

  function estilos() {
    const estilo = {};
    while (comecaEstilo()) {
      switch (atual().tipo) {
        case 'TRACO':
          esperar('TRACO');
          estilo.traco = cor();
          break;
        case 'PREENCHER':
          esperar('PREENCHER');
          estilo.preenchimento = cor();
          break;
        case 'ESPESSURA':
          esperar('ESPESSURA');
          estilo.espessura = numero();
          break;
      }
    }
    return estilo;
  }

  function modificador() {
    if (atual()?.tipo === 'GIRAR') {
      esperar('GIRAR');
      return { tipo: 'rotacao', angulo: numero() };
    }
    if (atual()?.tipo === 'MOVER') {
      esperar('MOVER');
      return { tipo: 'deslocamento', dx: numero(), dy: numero() };
    }
    falhar('GIRAR ou MOVER');
  }

  function modificadores() {
    const lista = [];
    if (['GIRAR', 'MOVER'].includes(atual()?.tipo)) {
      const primeiro = atual().tipo;
      lista.push(modificador());
      const segundo = primeiro === 'GIRAR' ? 'MOVER' : 'GIRAR';
      if (atual()?.tipo === segundo) lista.push(modificador());
    }
    return lista;
  }

  function elemento() {
    switch (atual()?.tipo) {
      case 'RETA': {
        const tok = esperar('RETA');
        const [x1, y1, x2, y2] = [numero(), numero(), numero(), numero()];
        return { tipo: 'reta', linha: tok.linha, x1, y1, x2, y2, estilo: estilos() };
      }
      case 'CIRCULO': {
        const tok = esperar('CIRCULO');
        const [cx, cy, raio] = [numero(), numero(), numero()];
        return { tipo: 'circulo', linha: tok.linha, cx, cy, raio, estilo: estilos() };
      }
      case 'RETANGULO': {
        const tok = esperar('RETANGULO');
        const [x, y, largura, altura] = [numero(), numero(), numero(), numero()];
        return { tipo: 'retangulo', linha: tok.linha, x, y, largura, altura, estilo: estilos() };
      }
      case 'BLOCO': {
        const tok = esperar('BLOCO');
        const mods = modificadores();
        esperar('ABRE');
        const corpo = elementos();
        esperar('FECHA');
        return { tipo: 'grupo', linha: tok.linha, modificadores: mods, corpo };
      }
      default:
        return falhar('RETA, CIRCULO, RETANGULO ou BLOCO');
    }
  }

  function elementos() {
    if (!comecaElemento()) falhar('RETA, CIRCULO, RETANGULO ou BLOCO');
    const resultado = [elemento()];
    while (comecaElemento()) resultado.push(elemento());
    return resultado;
  }

  const tokQuadro = esperar('QUADRO');
  const largura = numero();
  const altura = numero();
  const comandos = elementos();

  if (i !== tokens.length) falhar('FIM_DO_PROGRAMA');

  return {
    tipo: 'programa',
    tela: { tipo: 'tela', linha: tokQuadro.linha, largura, altura },
    comandos
  };
}
