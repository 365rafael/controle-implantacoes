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
    const mes = String(hoje.getMonth()+1).padStart(2,"0");
    const dia = String(hoje.getDate()).padStart(2,"0");
    const campo = document.getElementById("data");
    if(campo) campo.value = `${ano}-${mes}-${dia}`;
}

function formatarDataBR(dataISO){
    const partes = dataISO.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// =============================
// SALVAR
// =============================

function salvarImplantacao(){
    const data = document.getElementById("data").value;
    const cliente = document.getElementById("cliente").value;

    if(!data || !cliente) return alert("Preencha todos os campos");

    const lista = carregarImplantacoes();
    lista.push({data, cliente});
    salvarNoStorage(lista);

    alert("Salvo!");
    document.getElementById("cliente").value = "";
}

// =============================
// DASHBOARD
// =============================

function atualizarDashboard(){
    const lista = carregarImplantacoes();
    const hoje = new Date();
    const mesAtual = hoje.getMonth()+1;
    const anoAtual = hoje.getFullYear();

    const total = lista.filter(item=>{
        const partes = item.data.split("-");
        return Number(partes[1])===mesAtual && Number(partes[0])===anoAtual;
    }).length;

    const el = document.getElementById("resumoMes");
    if(el) el.innerText = `Total este mês: ${total}`;
}

// =============================
// RELATÓRIO
// =============================

function gerarRelatorio(){
    const lista = carregarImplantacoes();
    const filtro = document.getElementById("filtroMes")?.value;

    let filtrado = lista;

    if(filtro){
        filtrado = lista.filter(item=> item.data.startsWith(filtro));
    }

    filtrado.sort((a,b)=> a.data.localeCompare(b.data));

    const tabela = document.getElementById("tabelaRelatorio");
    if(!tabela) return;

    tabela.innerHTML = `
        <tr>
            <th>Data</th>
            <th>Cliente</th>
        </tr>
    `;

    filtrado.forEach(item=>{
        tabela.innerHTML += `
            <tr>
                <td>${formatarDataBR(item.data)}</td>
                <td>${item.cliente}</td>
            </tr>
        `;
    });
}

// =============================
// CALENDÁRIO SIMPLES
// =============================

function gerarCalendario(){
    const div = document.getElementById("calendario");
    if(!div) return;

    const lista = carregarImplantacoes();
    div.innerHTML = "";

    lista.forEach(item=>{
        div.innerHTML += `
            <p>${formatarDataBR(item.data)} - ${item.cliente}</p>
        `;
    });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}