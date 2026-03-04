// =============================
// STORAGE
// =============================

function carregarImplantacoes() {
    return JSON.parse(localStorage.getItem("implantacoes")) || [];
}

function salvarNoStorage(lista) {
    localStorage.setItem("implantacoes", JSON.stringify(lista));
}

// =============================
// DATA
// =============================

function definirDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    const campo = document.getElementById("data");
    if (campo) campo.value = `${ano}-${mes}-${dia}`;
}

function formatarDataBR(dataISO) {
    const partes = dataISO.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// =============================
// SALVAR
// =============================

function salvarImplantacao() {
    const data = document.getElementById("data").value;
    const cliente = document.getElementById("cliente").value;

    if (!data || !cliente) return alert("Preencha todos os campos");

    const lista = carregarImplantacoes();
    lista.push({ data, cliente });
    salvarNoStorage(lista);

    alert("Salvo!");
    document.getElementById("cliente").value = "";
}

// =============================
// DASHBOARD
// =============================

function atualizarDashboard() {
    const lista = carregarImplantacoes();
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const total = lista.filter(item => {
        const partes = item.data.split("-");
        return Number(partes[1]) === mesAtual && Number(partes[0]) === anoAtual;
    }).length;

    const el = document.getElementById("resumoMes");
    if (el) el.innerText = `Total este mês: ${total}`;
}

// =============================
// RELATÓRIO
// =============================

function definirMesAtualNoFiltro() {

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    const campo = document.getElementById("filtroMes");

    if (campo) {
        campo.value = `${ano}-${mes}`;
    }
}

function gerarRelatorio() {

    const lista = carregarImplantacoes();
    const filtro = document.getElementById("filtroMes")?.value;

    // =============================
    // TÍTULO DO RELATÓRIO
    // =============================

    if (filtro) {

        const [ano, mes] = filtro.split("-");

        const nomesMeses = [
            "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL",
            "MAIO", "JUNHO", "JULHO", "AGOSTO",
            "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
        ];

        const nomeMes = nomesMeses[Number(mes) - 1];

        const titulo = document.getElementById("tituloRelatorio");

        if (titulo) {
            titulo.innerText = `RELATÓRIO DE IMPLANTAÇÕES – ${nomeMes} ${ano}`;
        }
    }

    let filtrado = lista.map((item, index) => ({
        ...item,
        indexOriginal: index
    }));

    if (filtro) {
        filtrado = filtrado.filter(item => item.data.startsWith(filtro));
    }

    filtrado.sort((a, b) => a.data.localeCompare(b.data));

    const tabela = document.getElementById("tabelaRelatorio");
    const totalEl = document.getElementById("totalMes");

    if (!tabela) return;

    tabela.innerHTML = `
        <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Ações</th>
        </tr>
    `;

    filtrado.forEach(item => {
        tabela.innerHTML += `
            <tr>
                <td>${formatarDataBR(item.data)}</td>
                <td>${item.cliente}</td>
                <td class="acoes">
  <button class="btn-editar" onclick="editarRegistro(${item.indexOriginal})">✏</button>
  <button class="btn-excluir" onclick="excluirRegistro(${item.indexOriginal})">🗑</button>
</td>
            </tr>
        `;
    });

    if (totalEl) {
        totalEl.innerText = `Total no mês: ${filtrado.length}`;
    }

    // =============================
    // RODAPÉ DO RELATÓRIO
    // =============================

    const rodape = document.getElementById("rodapeRelatorio");

    if (rodape) {

        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, "0");
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const ano = hoje.getFullYear();

        rodape.innerText = `Rafael Arantes da Silva`;
    }
}

function exportarPDF() {

    const filtro = document.getElementById("filtroMes")?.value;

    if (!filtro) {
        alert("Selecione um mês primeiro.");
        return;
    }

    const [ano, mes] = filtro.split("-");

    const nomesMeses = [
        "Janeiro", "Fevereiro", "Marco", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const nomeMes = nomesMeses[Number(mes) - 1];

    const nomeArquivo = `Relatorio-${nomeMes}-${ano}`;

    // Guarda título atual
    const tituloOriginal = document.title;

    // Altera título temporariamente
    document.title = nomeArquivo;

    // Imprime
    window.print();

    // Restaura título
    document.title = tituloOriginal;
}

// =============================
// Excluir e Editar
// =============================

function editarRegistro(index) {

    const lista = carregarImplantacoes();
    const item = lista[index];

    const novaData = prompt("Editar data (YYYY-MM-DD):", item.data);
    if (!novaData) return;

    const novoCliente = prompt("Editar cliente:", item.cliente);
    if (!novoCliente) return;

    lista[index] = {
        data: novaData,
        cliente: novoCliente
    };

    salvarNoStorage(lista);

    gerarRelatorio();
}

function excluirRegistro(index) {

    if (!confirm("Deseja realmente excluir este registro?")) return;

    const lista = carregarImplantacoes();
    lista.splice(index, 1);
    salvarNoStorage(lista);

    gerarRelatorio();
}

// =============================
// BACKUP
// =============================

function exportarBackup() {

    const dados = {
        implantacoes: carregarImplantacoes(),
        anotacoes: carregarAnotacao()
    };

    const blob = new Blob(
        [JSON.stringify(dados, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-implantacoes.json";
    a.click();

    URL.revokeObjectURL(url);
}

function importarBackup() {

    const input = document.getElementById("inputBackup");

    input.click();

    input.onchange = function (event) {

        const arquivo = event.target.files[0];

        if (!arquivo) return;

        const leitor = new FileReader();

        leitor.onload = function (e) {

            try {

                const dados = JSON.parse(e.target.result);

                // Novo formato (implantacoes + anotacoes)
                if (dados.implantacoes) {
                    localStorage.setItem("implantacoes", JSON.stringify(dados.implantacoes));
                }

                if (dados.anotacoes !== undefined) {
                    localStorage.setItem("anotacoes", dados.anotacoes);
                }

                // Compatibilidade com backup antigo (somente lista)
                if (Array.isArray(dados)) {
                    localStorage.setItem("implantacoes", JSON.stringify(dados));
                }

                alert("Backup restaurado com sucesso!");

                location.reload();

            } catch (erro) {
                alert("Erro ao restaurar backup.");
            }

        };

        leitor.readAsText(arquivo);
    };
}

// =============================
// CALENDÁRIO SIMPLES
// =============================

function gerarCalendario() {
    const div = document.getElementById("calendario");
    if (!div) return;

    const lista = carregarImplantacoes();
    div.innerHTML = "";

    lista.forEach(item => {
        div.innerHTML += `
            <p>${formatarDataBR(item.data)} - ${item.cliente}</p>
        `;
    });
}

// =============================
// ANOTAÇÕES
// =============================

function carregarAnotacao() {
    return localStorage.getItem("anotacoes") || "";
}

function salvarAnotacao() {
    const texto = document.getElementById("textoAnotacao").value;
    localStorage.setItem("anotacoes", texto);

    atualizarAnotacao();
    toggleEdicaoAnotacao();
}

function atualizarAnotacao() {
    const texto = carregarAnotacao();
    const div = document.getElementById("visualizacaoAnotacao");

    if (!div) return;

    if (texto.trim() === "") {
        div.innerHTML = "<p style='color:gray;'>Nenhuma anotação cadastrada.</p>";
    } else {
        div.innerHTML = texto.replace(/\n/g, "<br>");
    }
}

function toggleEdicaoAnotacao() {

    const areaEdicao = document.getElementById("edicaoAnotacao");
    const areaVisualizacao = document.getElementById("visualizacaoAnotacao");
    const textarea = document.getElementById("textoAnotacao");

    if (areaEdicao.style.display === "none") {
        textarea.value = carregarAnotacao();
        areaEdicao.style.display = "block";
        areaVisualizacao.style.display = "none";
    } else {
        areaEdicao.style.display = "none";
        areaVisualizacao.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", atualizarAnotacao);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
