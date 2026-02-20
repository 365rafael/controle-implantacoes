// ================================
// 📦 DADOS
// ================================

let dados = JSON.parse(localStorage.getItem("implantacoes")) || [];

// ================================
// 🔁 SALVAR NO LOCALSTORAGE
// ================================

function salvarLocal() {
    localStorage.setItem("implantacoes", JSON.stringify(dados));
}

// ================================
// 🔄 TROCAR SEÇÃO
// ================================

function mostrarSecao(id) {
    document.querySelectorAll(".card").forEach(sec => {
        sec.style.display = "none";
    });

    document.getElementById(id).style.display = "block";

    if (id === "secRelatorio") gerarRelatorio();
    if (id === "secAgenda") gerarCalendario();
    if (id === "secGrafico") gerarGrafico();
    if (id === "secInicio") atualizarDashboard();
}

// ================================
// ➕ SALVAR IMPLANTAÇÃO
// ================================

function salvar() {
    const cliente = document.getElementById("cliente").value;
    const data = document.getElementById("data").value;

    if (!cliente || !data) {
        alert("Preencha todos os campos!");
        return;
    }

    dados.push({ cliente, data });
    salvarLocal();

    document.getElementById("cliente").value = "";
    document.getElementById("data").value = "";

    alert("Implantação salva com sucesso!");
    atualizarDashboard();
}

// ================================
// 📊 DASHBOARD
// ================================

function atualizarDashboard() {
    const hoje = new Date().toISOString().split("T")[0];
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const mesDados = dados.filter(item => {
        const d = new Date(item.data);
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    const totalMes = mesDados.length;
    const totalHoje = dados.filter(item => item.data === hoje).length;

    // Melhor dia
    let contagemDias = {};
    mesDados.forEach(item => {
        contagemDias[item.data] = (contagemDias[item.data] || 0) + 1;
    });

    let melhorDia = "-";
    let maior = 0;

    for (let dia in contagemDias) {
        if (contagemDias[dia] > maior) {
            maior = contagemDias[dia];
            melhorDia = dia.split("-").reverse().join("/");
        }
    }

    document.getElementById("dashTotal").innerText = totalMes;
    document.getElementById("dashHoje").innerText = totalHoje;
    document.getElementById("dashMelhor").innerText = melhorDia;
}

// ================================
// 📊 RELATÓRIO
// ================================

function gerarRelatorio() {

    const lista = document.getElementById("lista");
    const total = document.getElementById("total");
    const selectMes = document.getElementById("relMes");
    const selectAno = document.getElementById("relAno");

    // Preencher selects apenas uma vez
    if (selectMes.options.length === 0) {

        const meses = [
            "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
            "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
        ];

        meses.forEach((mes, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.text = mes;
            selectMes.appendChild(option);
        });

        const anoAtual = new Date().getFullYear();

        for (let i = anoAtual - 5; i <= anoAtual + 5; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.text = i;
            selectAno.appendChild(option);
        }

        selectMes.value = new Date().getMonth();
        selectAno.value = anoAtual;
    }

    const mes = parseInt(selectMes.value);
    const ano = parseInt(selectAno.value);

    lista.innerHTML = "";

    // Filtrar por mês/ano
    const filtrado = dados.filter(item => {
        const d = new Date(item.data);
        return d.getMonth() === mes && d.getFullYear() === ano;
    });

    // Ordenar crescente
    const ordenado = filtrado.sort((a, b) => {
        return new Date(a.data) - new Date(b.data);
    });

    total.innerHTML = `<strong>Total do mês:</strong> ${ordenado.length}`;

    ordenado.forEach(item => {

        const div = document.createElement("div");
        div.className = "report-item";

        div.innerHTML = `
            ${item.data.split("-").reverse().join("/")} - ${item.cliente}
            <button onclick="remover(${dados.indexOf(item)})"
                    style="background:#e74c3c">X</button>
        `;

        lista.appendChild(div);
    });
}

function remover(index) {
    if (confirm("Deseja remover essa implantação?")) {
        dados.splice(index, 1);
        salvarLocal();
        gerarRelatorio();
        atualizarDashboard();
    }
}

// ================================
// 📆 CALENDÁRIO
// ================================

function gerarCalendario() {

    const selectMes = document.getElementById("mes");
    const selectAno = document.getElementById("ano");
    const calendar = document.getElementById("calendar");

    // Preencher selects apenas uma vez
    if (selectMes.options.length === 0) {

        const meses = [
            "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
            "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
        ];

        meses.forEach((mes, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.text = mes;
            selectMes.appendChild(option);
        });

        const anoAtual = new Date().getFullYear();

        for (let i = anoAtual - 5; i <= anoAtual + 5; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.text = i;
            selectAno.appendChild(option);
        }

        selectMes.value = new Date().getMonth();
        selectAno.value = anoAtual;
    }

    const mes = parseInt(selectMes.value);
    const ano = parseInt(selectAno.value);

    calendar.innerHTML = "";

    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= diasNoMes; dia++) {

        const dataFormatada =
            `${ano}-${String(mes + 1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;

        const div = document.createElement("div");
        div.className = "day";

        // Conta implantações naquele dia
        const totalDia = dados.filter(item => item.data === dataFormatada).length;

        if (totalDia > 0) {
            div.classList.add("has");
            div.innerHTML = `
                <strong>${dia}</strong>
                <div style="font-size:12px;margin-top:4px;">
                   ( ${totalDia} )
                </div>
            `;
        } else {
            div.innerHTML = `<strong>${dia}</strong>`;
        }

        calendar.appendChild(div);
    }
}

// ================================
// 📈 GRÁFICO
// ================================

function gerarGrafico() {
    const ctx = document.getElementById("grafico").getContext("2d");

    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

    let contagem = new Array(diasNoMes).fill(0);

    dados.forEach(item => {
        const d = new Date(item.data);
        if (d.getMonth() === mesAtual && d.getFullYear() === anoAtual) {
            contagem[d.getDate() - 1]++;
        }
    });

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: contagem.map((_, i) => i + 1),
            datasets: [{
                label: "Implantações",
                data: contagem
            }]
        }
    });
}

// ================================
// 📁 BACKUP JSON
// ================================

function exportar() {
    const blob = new Blob([JSON.stringify(dados)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "backup_implantacoes.json";
    link.click();
}

function restaurarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        dados = JSON.parse(e.target.result);
        salvarLocal();
        alert("Backup restaurado com sucesso!");
        atualizarDashboard();
    };
    reader.readAsText(file);
}

// ================================
// 📄 EXPORTAR PDF
// ================================

function exportarPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const selectMes = document.getElementById("relMes");
    const selectAno = document.getElementById("relAno");

    const mes = parseInt(selectMes.value);
    const ano = parseInt(selectAno.value);

    const meses = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    // Filtrar dados do mês selecionado
    const filtrado = dados
        .filter(item => {
            const d = new Date(item.data);
            return d.getMonth() === mes && d.getFullYear() === ano;
        })
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    doc.setFontSize(16);
    doc.text(`Relatório de Implantações`, 10, 15);

    doc.setFontSize(12);
    doc.text(`${meses[mes]} / ${ano}`, 10, 25);

    doc.text(`Total: ${filtrado.length}`, 10, 35);

    let y = 45;

    filtrado.forEach(item => {

        const dataBR = item.data.split("-").reverse().join("/");

        doc.text(`${dataBR} - ${item.cliente}`, 10, y);
        y += 8;

        // Criar nova página se passar do limite
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save(`relatorio_${meses[mes]}_${ano}.pdf`);
}

// ================================
// 🚀 INICIALIZAÇÃO
// ================================

mostrarSecao("secInicio");
atualizarDashboard();