const formulario = document.getElementById("formFrete");

const cepInput = document.getElementById("cep");

const resultado = document.getElementById("resultado");
const erro = document.getElementById("erro");
const loading = document.getElementById("loading");

const enderecoTexto = document.getElementById("enderecoTexto");
const cidadeTexto = document.getElementById("cidadeTexto");

const distanciaElemento = document.getElementById("distancia");
const valorKmElemento = document.getElementById("valorKm");
const freteElemento = document.getElementById("frete");


// ==========================================
// CONFIGURAÇÕES DO PROJETO
// ==========================================

// Coordenadas aproximadas da UNINASSAU Fortaleza
// Campus Aguanambi - Av. Aguanambi, 251

const UNINASSAU = {
    latitude: -3.7477,
    longitude: -38.5268
};


// Tarifa usada para a atividade acadêmica

const TAXA_BASE = 5.00;
const VALOR_POR_KM = 1.50;


// ==========================================
// FORMATAÇÃO DO CEP
// ==========================================

cepInput.addEventListener("input", function () {

    let valor = cepInput.value.replace(/\D/g, "");

    if (valor.length > 5) {

        valor = valor.substring(0, 5) + "-" + valor.substring(5, 8);

    }

    cepInput.value = valor;

});


// ==========================================
// FUNÇÃO PARA CALCULAR DISTÂNCIA
// Fórmula de Haversine
// ==========================================

function calcularDistancia(lat1, lon1, lat2, lon2) {

    const raioTerra = 6371;

    const diferencaLat =
        (lat2 - lat1) * Math.PI / 180;

    const diferencaLon =
        (lon2 - lon1) * Math.PI / 180;


    const a =
        Math.sin(diferencaLat / 2) *
        Math.sin(diferencaLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(diferencaLon / 2) *
        Math.sin(diferencaLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return raioTerra * c;

}


// ==========================================
// FORMULÁRIO
// ==========================================

formulario.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Limpa mensagens anteriores

    erro.classList.remove("mostrar");
    resultado.classList.remove("mostrar");

    loading.classList.add("mostrar");


    // Pega somente os números

    const cep = cepInput.value.replace(/\D/g, "");


    // Verifica o tamanho

    if (cep.length !== 8) {

        loading.classList.remove("mostrar");

        erro.textContent =
            "Digite um CEP válido com 8 números.";

        erro.classList.add("mostrar");

        return;

    }


    try {

        // ==========================================
        // CONSULTA A API
        // ==========================================

        const resposta = await fetch(
            `https://brasilapi.com.br/api/cep/v2/${cep}`
        );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível consultar esse CEP."
            );

        }


        const dados = await resposta.json();


        // ==========================================
        // VERIFICA COORDENADAS
        // ==========================================

        if (
            dados.location === undefined ||
            dados.location.coordinates === undefined
        ) {

            throw new Error(
                "Esse CEP não possui coordenadas disponíveis."
            );

        }


        const latitudeDestino =
            Number(dados.location.coordinates.latitude);

        const longitudeDestino =
            Number(dados.location.coordinates.longitude);


        // ==========================================
        // CALCULA DISTÂNCIA
        // ==========================================

        const distancia = calcularDistancia(

            UNINASSAU.latitude,
            UNINASSAU.longitude,

            latitudeDestino,
            longitudeDestino

        );


        const distanciaArredondada =
            Math.max(0.5, distancia);


        // ==========================================
        // CALCULA FRETE
        // ==========================================

        const valorFrete =
            TAXA_BASE +
            (distanciaArredondada * VALOR_POR_KM);


        // ==========================================
        // MOSTRA ENDEREÇO
        // ==========================================

        enderecoTexto.textContent =
            `${dados.street || "Endereço não informado"}`;

        cidadeTexto.textContent =
            `${dados.neighborhood || ""} - ${dados.city}/${dados.state}`;


        // ==========================================
        // MOSTRA DISTÂNCIA
        // ==========================================

        distanciaElemento.textContent =
            `${distanciaArredondada.toFixed(2)} km`;


        // ==========================================
        // MOSTRA VALOR POR KM
        // ==========================================

        valorKmElemento.textContent =
            `R$ ${VALOR_POR_KM.toFixed(2).replace(".", ",")}`;


        // ==========================================
        // MOSTRA FRETE
        // ==========================================

        freteElemento.textContent =
            valorFrete.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });


        // Mostra resultado

        resultado.classList.add("mostrar");

    }

    catch (erroApi) {

        erro.textContent =
            erroApi.message ||
            "Ocorreu um erro ao consultar o CEP.";

        erro.classList.add("mostrar");

    }

    finally {

        loading.classList.remove("mostrar");

    }

});