// main.js · liga a página aos módulos (PRONTO: não precisa alterar)

import { analisarLexico } from "./lexer.js";
import { analisarSintatico } from "./parser.js";
import { verificar } from "./semantica.js";
import { gerarSVG } from "./gerador.js";
import { desenharSvg, baixarSvg } from "./svg.js";

const ESTILO = {
    erro: "rounded-md border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-800",
    aviso: "rounded-md border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-800",
    ok: "rounded-md border-l-4 border-emerald-500 bg-emerald-50 px-3 py-2 text-sm text-emerald-800",
};

// Mostra uma lista de mensagens { nivel, etapa, texto } dentro de um elemento
function mostrar(elemento, lista) {
    elemento.innerHTML = "";
    for (const m of lista) {
        const p = document.createElement("p");
        p.className = ESTILO[m.nivel];
        p.textContent = m.etapa ? m.etapa + ": " + m.texto : m.texto;     // textContent: nunca interpreta o texto
        elemento.appendChild(p);
    }
}

// ---------------------- coluna da direita: SVG ----------------------

function desenhar() {
    const texto = document.getElementById("saida").value;
    const resultado = desenharSvg(texto, document.getElementById("figura"));

    let nivel = "ok";
    if (!resultado.ok) {
        nivel = "erro";
    } else if (resultado.aviso) {
        nivel = "aviso";
    }
    mostrar(document.getElementById("msg-svg"), [{ nivel: nivel, etapa: "", texto: resultado.mensagem }]);
}

// ---------------------- coluna da esquerda: Fases 1 e 2 ----------------------

function analisar() {
    const texto = document.getElementById("entrada").value;
    const area = document.getElementById("mensagens");
    const mensagens = [];
    document.getElementById("tokens").textContent = "";
    document.getElementById("ast").textContent = "";

    // 1) léxico
    let resultado;
    try {
        resultado = analisarLexico(texto);
    } catch (falha) {
        mensagens.push({ nivel: "aviso", etapa: "Léxico", texto: falha.message });
        mostrar(area, mensagens);
        return;
    }

    const linhasTokens = [];
    for (const token of resultado.tokens) {
        linhasTokens.push("linha " + token.linha + "  " + token.tipo.padEnd(14) + '"' + token.lexema + '"');
    }
    document.getElementById("tokens").textContent = linhasTokens.join("\n");

    if (resultado.erros.length > 0) {                        // com erro léxico, o sintático não roda
        for (const erro of resultado.erros) {
            mensagens.push({ nivel: "erro", etapa: "Erro léxico", texto: 'linha ' + erro.linha + ': "' + erro.lexema + '" não forma nenhum token' });
        }
        mostrar(area, mensagens);
        return;
    }

    // 2) sintático
    let ast;
    try {
        ast = analisarSintatico(resultado.tokens);
    } catch (falha) {
        mensagens.push({ nivel: "erro", etapa: "", texto: falha.message });          // a mensagem do parser já diz "Erro sintático..."
        mostrar(area, mensagens);
        return;
    }
    if (ast === undefined) {
        mensagens.push({ nivel: "aviso", etapa: "Sintático", texto: "parser.js ainda não devolve a AST: complete analisarSintatico()." });
        mostrar(area, mensagens);
        return;
    }
    document.getElementById("ast").textContent = JSON.stringify(ast, null, 2);
    mensagens.push({ nivel: "ok", etapa: "Sintático", texto: "programa válido." });

    // 3) semântico (Fase 2)
    let errosSemanticos;
    try {
        errosSemanticos = verificar(ast);
    } catch (falha) {
        mensagens.push({ nivel: "erro", etapa: "Semântico", texto: falha.message });
        mostrar(area, mensagens);
        return;
    }
    if (errosSemanticos === undefined) {
        mensagens.push({ nivel: "aviso", etapa: "Semântico", texto: "verificar() ainda não foi implementada (Fase 2)." });
    } else if (errosSemanticos.length > 0) {
        for (const erro of errosSemanticos) {
            mensagens.push({ nivel: "erro", etapa: "Erro semântico", texto: "linha " + erro.linha + ": " + erro.mensagem });
        }
        mostrar(area, mensagens);
        return;
    }

    // 4) gerador de SVG (Fase 2)
    let svg;
    try {
        svg = gerarSVG(ast);
    } catch (falha) {
        mensagens.push({ nivel: "erro", etapa: "Gerador", texto: falha.message });
        mostrar(area, mensagens);
        return;
    }
    if (svg === undefined) {
        mensagens.push({ nivel: "aviso", etapa: "Gerador", texto: "gerarSVG() ainda não foi implementada (Fase 2)." });
        mostrar(area, mensagens);
        return;
    }
    document.getElementById("saida").value = svg;
    mensagens.push({ nivel: "ok", etapa: "Gerador", texto: "SVG gerado." });
    mostrar(area, mensagens);
    desenhar();
}

document.getElementById("btn-analisar").addEventListener("click", analisar);
document.getElementById("btn-desenhar").addEventListener("click", desenhar);
document.getElementById("btn-baixar").addEventListener("click", function () {
    baixarSvg(document.getElementById("saida").value);
});

desenhar();      // já mostra o SVG que vem na caixa da direita
