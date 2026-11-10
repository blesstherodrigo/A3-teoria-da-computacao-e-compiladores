import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analisarLexico } from '../lexer.js';
import { analisarSintatico } from '../parser.js';

const pasta = path.dirname(fileURLToPath(import.meta.url));
let passou = 0;

function executar(codigo) {
  const resultado = analisarLexico(codigo);
  if (resultado.erros.length) return { tipo: 'erro-lexico', ...resultado };
  try {
    const ast = analisarSintatico(resultado.tokens);
    return { tipo: 'valido', ...resultado, ast };
  } catch (erro) {
    return { tipo: 'erro-sintatico', ...resultado, mensagem: erro.message };
  }
}

function teste(nome, callback) {
  callback();
  passou++;
  console.log(`OK ${String(passou).padStart(2, '0')} — ${nome}`);
}

const ler = (subpasta, nome) => fs.readFileSync(path.join(pasta, subpasta, nome), 'utf8');
const forma = (tipo, campos, estilo = {}) => ({ tipo, ...campos, estilo });
const reta = (x1, y1, x2, y2, estilo = {}) => forma('reta', { x1, y1, x2, y2 }, estilo);
const circulo = (cx, cy, raio, estilo = {}) => forma('circulo', { cx, cy, raio }, estilo);
const retangulo = (x, y, largura, altura, estilo = {}) => forma('retangulo', { x, y, largura, altura }, estilo);
const mover = (dx, dy) => ({ tipo: 'deslocamento', dx, dy });
const girar = (angulo) => ({ tipo: 'rotacao', angulo });
const grupo = (modificadores, corpo) => ({ tipo: 'grupo', modificadores, corpo });
const programa = (largura, altura, comandos) => ({ tipo: 'programa', tela: { tipo: 'tela', largura, altura }, comandos });

const validos = [
  ['01_casa.txt', programa(480, 320, [
    retangulo(90, 130, 210, 150, { preenchimento: 'amarelo', traco: 'preto', espessura: 3 }),
    reta(90, 130, 195, 50, { traco: 'vermelho', espessura: 4 }),
    reta(195, 50, 300, 130, { traco: 'vermelho', espessura: 4 }),
    circulo(385, 60, 32, { preenchimento: '#FFD700' }),
    grupo([mover(118, 195)], [
      retangulo(0, 0, 45, 85, { preenchimento: 'roxo' }),
      grupo([girar(30)], [reta(10, 15, 30, 15, { traco: 'branco', espessura: 2 })]),
    ]),
  ])],
  ['02_formas_modificadores.txt', programa(200, 160, [
    grupo([girar(90), mover(20, 10)], [
      circulo(0, 0, 15, { preenchimento: 'azul' }),
      reta(0, 0, 40, 0, { traco: '#FF8800', espessura: 2 }),
    ]),
    grupo([mover(10, 20), girar(45)], [
      retangulo(0, 0, 50, 25, { traco: 'verde' }),
    ]),
  ])],
  ['03_atributos_repetidos.txt', programa(100, 100, [
    circulo(0, 0, 0, { preenchimento: 'verde', traco: 'branco', espessura: 2 }),
  ])],
  ['04_aninhamento.txt', programa(250, 250, [
    grupo([], [grupo([mover(0, 0)], [grupo([girar(0)], [reta(0, 0, 0, 0)])])]),
  ])],
  ['05_zeros_e_hex.txt', programa(0, 0, [
    retangulo(0, 0, 0, 0, { traco: '#00FF88', preenchimento: '#A0B1C2', espessura: 0 }),
    circulo(10, 10, 0, { preenchimento: 'vermelho' }),
  ])],
];

for (const [nome, esperado] of validos) {
  teste(`válido: ${nome}`, () => {
    const resultado = executar(ler('validos', nome));
    assert.equal(resultado.tipo, 'valido');
    assert.deepEqual(resultado.ast, esperado);
    for (const token of resultado.tokens) {
      assert.equal(typeof token.lexema, 'string');
      assert.equal(typeof token.linha, 'number');
      assert.equal(typeof token.tipo, 'string');
    }
  });
}

const invalidos = [
  ['01_erro_lexico.txt', 'erro-lexico', { linha: 2, trecho: '#GG11AA' }],
  ['02_falta_numero.txt', 'erro-sintatico', 'Erro sintático na linha 2: esperado NUM, encontrado TRACO.'],
  ['03_grupo_vazio.txt', 'erro-sintatico', 'Erro sintático na linha 3: esperado RETA, CIRCULO, RETANGULO ou BLOCO, encontrado FECHA.'],
];
for (const [nome, tipo, esperado] of invalidos) {
  teste(`inválido: ${nome}`, () => {
    const resultado = executar(ler('invalidos', nome));
    assert.equal(resultado.tipo, tipo);
    if (tipo === 'erro-lexico') assert.deepEqual(resultado.erros, [esperado]);
    else assert.equal(resultado.mensagem, esperado);
    assert.equal(resultado.ast, undefined);
  });
}

const extras = [
  ['zero é aceito', () => assert.equal(executar('quadro 0 0\nreta 0 0 0 0').tipo, 'valido')],
  ['zero à esquerda é erro léxico', () => assert.deepEqual(executar('quadro 05 10\nreta 0 0 1 1').erros, [{ linha: 1, trecho: '05' }])],
  ['palavra-chave não casa prefixos', () => assert.deepEqual(executar('quadro 10 10\nretanguloExtra 0 0 10 10').erros, [{ linha: 2, trecho: 'retanguloExtra' }])],
  ['grupo vazio é erro', () => assert.equal(executar('quadro 1 1\nbloco {}').tipo, 'erro-sintatico')],
  ['modificador de grupo repetido é erro', () => assert.equal(executar('quadro 1 1\nbloco girar 3 girar 5 { reta 0 0 0 0 }').tipo, 'erro-sintatico')],
  ['modificador não é aceito em figura', () => assert.equal(executar('quadro 1 1\nreta 0 0 1 1 mover 2 3').tipo, 'erro-sintatico')],
  ['sem quadro obrigatório é erro', () => assert.equal(executar('reta 0 0 1 1').tipo, 'erro-sintatico')],
  ['comentário é ignorado, linha conta', () => {
    const resultado = executar('quadro 1 1\n// comentário à vontade\nreta 0 0 1 1');
    assert.equal(resultado.tipo, 'valido');
    assert.equal(resultado.tokens.find(t => t.tipo === 'RETA').linha, 3);
  }],
  ['erro léxico não gera AST', () => assert.equal(executar('quadro 1 1\nreta 0 0 1 1 @').tipo, 'erro-lexico')],
  ['números não representáveis são rejeitados', () => assert.equal(executar('quadro 9007199254740992 1\nreta 0 0 1 1').tipo, 'erro-sintatico')],
];
for (const [nome, funcao] of extras) teste(`extra: ${nome}`, funcao);

console.log(`\n${passou} testes passaram (${validos.length} válidos, ${invalidos.length} inválidos e ${extras.length} extras).`);
