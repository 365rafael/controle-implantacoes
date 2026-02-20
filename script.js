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

function gerarRelatorio() {

    const lista = carregarImplantacoes();
    const filtro = document.getElementById("filtroMes")?.value;

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

    const dados = carregarImplantacoes();

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

                if (!Array.isArray(dados)) {
                    alert("Arquivo inválido!");
                    return;
                }

                localStorage.setItem("implantacoes", JSON.stringify(dados));

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

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}