// semantica.js · verificações semânticas (Fase 2)
//
// Recebe:  a AST do programa
// Devolve: um vetor de erros: [ { linha, mensagem }, ... ]
// (vetor vazio = nenhum erro encontrado)

export function verificar(ast) {
    const erros = [];

    // 1. Verificação da tela (quadro)
    if (ast.tela.largura <= 0 || ast.tela.altura <= 0) {
        erros.push({
            linha: ast.tela.linha ?? 1,
            mensagem: "o quadro precisa ter largura e altura maiores que zero"
        });
    }

    // Função recursiva para percorrer os comandos e os blocos aninhados
    function verificarLista(lista) {
        for (const cmd of lista) {
            if (cmd.tipo === "circulo") {
                if (cmd.raio <= 0) {
                    erros.push({
                        linha: cmd.linha,
                        mensagem: "o círculo precisa ter raio maior que zero"
                    });
                }
            } else if (cmd.tipo === "retangulo") {
                if (cmd.largura <= 0 || cmd.altura <= 0) {
                    erros.push({
                        linha: cmd.linha,
                        mensagem: "o retângulo precisa ter largura e altura maiores que zero"
                    });
                }
            } else if (cmd.tipo === "grupo") {
                // Desce recursivamente nos filhos do bloco
                verificarLista(cmd.corpo);
            }
        }
    }

    verificarLista(ast.comandos);

    return erros;
}
