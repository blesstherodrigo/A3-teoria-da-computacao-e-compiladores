// gerador.js · gera o texto SVG a partir da AST (Fase 2)
//
//  Recebe:  a AST do programa
//  Devolve: uma string com o SVG completo, começando em <svg ...> e terminando em </svg>

const TABELA_CORES = {
    vermelho: "red",
    verde: "green",
    azul: "blue",
    preto: "black",
    branco: "white",
    amarelo: "yellow",
    roxo: "purple"
};

function resolverCor(cor) {
    if (!cor) return null;
    return TABELA_CORES[cor] ?? cor;
}

function montarAtributosEstilo(estilo = {}) {
    const fill = resolverCor(estilo.preenchimento) ?? "none";
    const stroke = resolverCor(estilo.traco) ?? "black";
    const strokeWidth = estilo.espessura ?? 1;

    return `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"`;
}

function montarTransform(modificadores = []) {
    if (modificadores.length === 0) return "";

    const partes = modificadores.map((mod) => {
        if (mod.tipo === "rotacao") {
            return `rotate(${mod.angulo})`;
        }
        if (mod.tipo === "deslocamento") {
            return `translate(${mod.dx} ${mod.dy})`;
        }
        return "";
    }).filter(Boolean);

    return partes.length > 0 ? ` transform="${partes.join(" ")}"` : "";
}

export function gerarSVG(ast) {
    function gerarElemento(no, nivel) {
        const indent = "  ".repeat(nivel);

        if (no.tipo === "reta") {
            const estilo = montarAtributosEstilo(no.estilo);
            return `${indent}<line x1="${no.x1}" y1="${no.y1}" x2="${no.x2}" y2="${no.y2}" ${estilo}/>`;
        }

        if (no.tipo === "circulo") {
            const estilo = montarAtributosEstilo(no.estilo);
            return `${indent}<circle cx="${no.cx}" cy="${no.cy}" r="${no.raio}" ${estilo}/>`;
        }

        if (no.tipo === "retangulo") {
            const estilo = montarAtributosEstilo(no.estilo);
            return `${indent}<rect x="${no.x}" y="${no.y}" width="${no.largura}" height="${no.altura}" ${estilo}/>`;
        }

        if (no.tipo === "grupo") {
            const transform = montarTransform(no.modificadores);
            const filhos = no.corpo
                .map((filho) => gerarElemento(filho, nivel + 1))
                .join("\n");

            return `${indent}<g${transform}>\n${filhos}\n${indent}</g>`;
        }

        return "";
    }

    const { largura, altura } = ast.tela;
    const conteudo = ast.comandos
        .map((cmd) => gerarElemento(cmd, 1))
        .join("\n");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}">\n${conteudo}\n</svg>`;
}
