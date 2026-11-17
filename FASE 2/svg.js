// svg.js · validar, mostrar e baixar SVG (PRONTO: faz parte da aula de SVG)

const NS_SVG = "http://www.w3.org/2000/svg";

// Confere se o texto é um SVG que a página aceita desenhar.
// Devolve { ok, aviso, mensagem }.
export function validarSvg(texto) {
    if (texto.trim() === "") {
        return { ok: false, aviso: false, mensagem: "A caixa de SVG está vazia." };
    }

    // Por segurança, não desenhamos SVG com script nem com eventos (onclick, onload...)
    if (/<script/i.test(texto) || /\son[a-z]+\s*=/i.test(texto)) {
        return { ok: false, aviso: false, mensagem: "Por segurança, a página não desenha SVG com script ou eventos (onclick, onload...)." };
    }

    // O DOMParser lê o texto como XML e avisa se ele estiver malformado
    const doc = new DOMParser().parseFromString(texto, "image/svg+xml");
    const erro = doc.querySelector("parsererror");
    if (erro) {
        const detalhe = erro.textContent.trim().replace(/\s+/g, " ").slice(0, 220);
        return { ok: false, aviso: false, mensagem: "SVG inválido: " + detalhe };
    }

    if (doc.documentElement.nodeName !== "svg") {
        return { ok: false, aviso: false, mensagem: "O texto precisa começar com <svg ...>." };
    }

    // Dentro do HTML o xmlns é dispensável, mas num arquivo .svg ele é obrigatório
    if (doc.documentElement.namespaceURI !== NS_SVG) {
        return { ok: true, aviso: true, mensagem: "O SVG foi desenhado, mas falta xmlns=\"" + NS_SVG + "\" no <svg>. Sem ele, o arquivo .svg não abre." };
    }

    return { ok: true, aviso: false, mensagem: "SVG válido." };
}

// Valida e, se estiver certo, desenha o SVG dentro do elemento "destino".
export function desenharSvg(texto, destino) {
    const resultado = validarSvg(texto);
    if (resultado.ok) {
        destino.innerHTML = texto;     // innerHTML interpreta o texto e cria os elementos SVG
    } else {
        destino.innerHTML = "";
    }
    return resultado;
}

// Baixa o texto como um arquivo desenho.svg
export function baixarSvg(texto) {
    const blob = new Blob([texto], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "desenho.svg";
    link.click();
    URL.revokeObjectURL(url);
}
