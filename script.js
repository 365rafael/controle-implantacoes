const STORAGE = 'implantacoes';

// =========================
// DATA ATUAL (input)
// =========================
const hoje = new Date();
const anoHoje = hoje.getFullYear();
const mesHoje = String(hoje.getMonth() + 1).padStart(2,'0');
const diaHoje = String(hoje.getDate()).padStart(2,'0');

document.getElementById('data').value = `${anoHoje}-${mesHoje}-${diaHoje}`;


// =========================
// FORMATAR DATA BR (SEM TIMEZONE)
// =========================
function formatarDataBR(dataISO){
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}-${mes}-${ano}`;
}


// =========================
// LOCAL STORAGE
// =========================
function dados(){
  return JSON.parse(localStorage.getItem(STORAGE) || '[]');
}


// =========================
// SALVAR
// =========================
function salvar(){

  const cliente = document.getElementById('cliente').value.trim();
  const data = document.getElementById('data').value;

  if(!cliente || !data){
    alert('Preencha os dados');
    return;
  }

  const arr = dados();
  arr.push({cliente, data});

  localStorage.setItem(STORAGE, JSON.stringify(arr));

  document.getElementById('cliente').value='';

  gerarCalendario();
}


// =========================
// EXPORTAR BACKUP
// =========================
function exportar(){

  const blob = new Blob([JSON.stringify(dados(),null,2)],{
    type:'application/json'
  });

  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='backup_implantacoes.json';
  a.click();
}


// =========================
// RESTAURAR BACKUP
// =========================
function restaurarBackup(event){

  const arquivo = event.target.files[0];
  if(!arquivo) return;

  const reader = new FileReader();

  reader.onload = function(e){

    try{
      const dadosImportados = JSON.parse(e.target.result);

      if(!Array.isArray(dadosImportados)){
        alert("Arquivo inválido!");
        return;
      }

      localStorage.setItem(STORAGE, JSON.stringify(dadosImportados));

      alert("Backup restaurado com sucesso!");

      gerarCalendario();

    }catch{
      alert("Erro ao restaurar backup.");
    }
  };

  reader.readAsText(arquivo);
  event.target.value = "";
}


// =========================
// REMOVER LANÇAMENTO
// =========================
function remover(indexGlobal){

  if(!confirm("Deseja realmente remover este lançamento?")) return;

  const arr = dados();
  arr.splice(indexGlobal, 1);

  localStorage.setItem(STORAGE, JSON.stringify(arr));

  gerarCalendario();
}


// =========================
// SELECTS MÊS / ANO
// =========================
function popularSelects(){

  const mes = document.getElementById('mes');
  const ano = document.getElementById('ano');

  for(let i=0;i<12;i++){
    const op=document.createElement('option');
    op.value=i;
    op.text=i+1;
    if(i===hoje.getMonth()) op.selected=true;
    mes.appendChild(op);
  }

  for(let a=2024;a<=2030;a++){
    const op=document.createElement('option');
    op.value=a;
    op.text=a;
    if(a===hoje.getFullYear()) op.selected=true;
    ano.appendChild(op);
  }
}


// =========================
// CALENDÁRIO
// =========================
function gerarCalendario(){

  const mes = parseInt(document.getElementById('mes').value);
  const ano = parseInt(document.getElementById('ano').value);

  const cal=document.getElementById('calendar');
  cal.innerHTML='';

  const totalDias=new Date(ano,mes+1,0).getDate();
  const arr=dados();

  for(let d=1;d<=totalDias;d++){

    const data = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const count = arr.filter(x=>x.data===data).length;

    const div=document.createElement('div');
    div.className='day'+(count?' has':'');
    div.innerHTML=`${d}<br>${count?count+' impl.':''}`;

    cal.appendChild(div);
  }

  gerarRelatorio(mes,ano);
  gerarGrafico(mes,ano);
}


// =========================
// RELATÓRIO
// =========================
function gerarRelatorio(mes,ano){

  const arrCompleto = dados();

  const arrFiltrado = arrCompleto
    .map((item,index)=>({ ...item, index }))
    .filter(x=>{
      const [anoItem, mesItem] = x.data.split('-');
      return parseInt(mesItem)-1 === mes && parseInt(anoItem) === ano;
    })
    .sort((a,b)=> a.data.localeCompare(b.data));

  document.getElementById('total').innerHTML=
    `<b>Total no mês: ${arrFiltrado.length}</b>`;

  const lista=document.getElementById('lista');
  lista.innerHTML='';

  arrFiltrado.forEach(x=>{

    const d=document.createElement('div');
    d.className='report-item';

    d.innerHTML=`
      ${formatarDataBR(x.data)} - ${x.cliente}
      <button onclick="remover(${x.index})"
              style="background:#e74c3c;
                     margin-left:10px;
                     padding:5px 8px;
                     font-size:12px">
        ❌
      </button>
    `;

    lista.appendChild(d);
  });
}


// =========================
// GRÁFICO
// =========================
function gerarGrafico(mes,ano){

  const arr = dados()
    .filter(x=>{
      const [anoItem, mesItem] = x.data.split('-');
      return parseInt(mesItem)-1 === mes && parseInt(anoItem) === ano;
    });

  const mapa = {};

  arr.forEach(x=>{
    const dia = parseInt(x.data.split('-')[2]);
    mapa[dia] = (mapa[dia] || 0) + 1;
  });

  const dias = Object.keys(mapa).map(Number).sort((a,b)=>a-b);
  const valores = dias.map(d=>mapa[d]);

  const canvas = document.getElementById('grafico');
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = 300;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(dias.length === 0){
    ctx.font = "16px Arial";
    ctx.fillText("Sem implantações no mês", 20, 50);
    return;
  }

  const larguraBarra = canvas.width / dias.length;
  const max = Math.max(...valores);

  ctx.font = "12px Arial";
  ctx.textAlign = "center";

  dias.forEach((dia,i)=>{

    const valor = mapa[dia];
    const alturaMax = 200;
    const altura = (valor / max) * alturaMax;

    const xCentro = i * larguraBarra + larguraBarra/2;
    const yBarra = canvas.height - altura - 40;

    ctx.fillStyle = '#2e86de';
    ctx.fillRect(
      i * larguraBarra + 10,
      yBarra,
      larguraBarra - 20,
      altura
    );

    ctx.fillStyle = "#000";
    ctx.fillText(valor, xCentro, yBarra - 5);

    const mesFormatado = String(mes + 1).padStart(2,'0');
    const diaFormatado = String(dia).padStart(2,'0');

    ctx.fillText(`${diaFormatado}/${mesFormatado}`, xCentro, canvas.height - 15);
  });
}


// =========================
// EXPORTAR PDF
// =========================
function exportarPDF(){

  const mesIndex = parseInt(document.getElementById('mes').value);
  const ano = parseInt(document.getElementById('ano').value);
  const mes = mesIndex + 1;

  const arr = dados()
    .filter(x=>{
      const [anoItem, mesItem] = x.data.split('-');
      return parseInt(mesItem)-1 === mesIndex && parseInt(anoItem) === ano;
    })
    .sort((a,b)=> a.data.localeCompare(b.data));

  const tela = window.open('', '', 'width=800,height=600');

  tela.document.write('<html><head>');
  tela.document.write('<title>Relatório</title>');
  tela.document.write('<style>');
  tela.document.write('body{font-family:Arial;padding:30px}');
  tela.document.write('.item{border-bottom:1px solid #ccc;padding:6px 0}');
  tela.document.write('</style>');
  tela.document.write('</head><body>');

  tela.document.write('<h2>Relatório de Implantações</h2>');
  tela.document.write('<p>Mês: '+ mes +'/'+ ano +'</p>');
  tela.document.write('<b>Total no mês: '+ arr.length +'</b><hr>');

  arr.forEach(x=>{
    tela.document.write('<div class="item">'+
      formatarDataBR(x.data)+' - '+ x.cliente +
      '</div>');
  });

  tela.document.write('</body></html>');

  tela.document.close();
  tela.print();
}


// =========================
// INICIALIZAÇÃO
// =========================
popularSelects();
gerarCalendario();


// =========================
// SERVICE WORKER (PWA)
// =========================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker registrado"))
    .catch(err => console.log("Erro SW:", err));
}