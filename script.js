const STORAGE='implantacoes';
const hoje=new Date();
document.getElementById('data').value=hoje.toISOString().substr(0,10);

function formatarDataBR(dataISO){

  const dt = new Date(dataISO);

  const dia = String(dt.getDate()).padStart(2,'0');
  const mes = String(dt.getMonth()+1).padStart(2,'0');
  const ano = dt.getFullYear();

  return `${dia}-${mes}-${ano}`;
}

function dados(){return JSON.parse(localStorage.getItem(STORAGE)||'[]')}
function salvar(){
 const cliente=document.getElementById('cliente').value.trim();
 const data=document.getElementById('data').value;
 if(!cliente||!data) return alert('Preencha os dados');
 const arr=dados();
 arr.push({cliente,data});
 localStorage.setItem(STORAGE,JSON.stringify(arr));
 document.getElementById('cliente').value='';
 gerarCalendario();
}

function exportar(){
 const blob=new Blob([JSON.stringify(dados(),null,2)],{type:'application/json'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download='backup_implantacoes.json';
 a.click();
}

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

    }catch(erro){
      alert("Erro ao restaurar backup. Arquivo inválido.");
    }
  };

  reader.readAsText(arquivo);

  // limpa input para poder importar o mesmo arquivo novamente
  event.target.value = "";
}

function remover(indexGlobal){

  if(!confirm("Deseja realmente remover este lançamento?")) return;

  const arr = dados();
  arr.splice(indexGlobal, 1);

  localStorage.setItem(STORAGE, JSON.stringify(arr));

  gerarCalendario();
}

function popularSelects(){
 const mes=document.getElementById('mes');
 const ano=document.getElementById('ano');
 for(let i=0;i<12;i++){
  const op=document.createElement('option');
  op.value=i;op.text=i+1;
  if(i===hoje.getMonth())op.selected=true;
  mes.appendChild(op);
 }
 for(let a=2024;a<=2030;a++){
  const op=document.createElement('option');
  op.value=a;op.text=a;
  if(a===hoje.getFullYear())op.selected=true;
  ano.appendChild(op);
 }
}

function gerarCalendario(){
 const mes=parseInt(document.getElementById('mes').value);
 const ano=parseInt(document.getElementById('ano').value);
 const cal=document.getElementById('calendar');
 cal.innerHTML='';
 const totalDias=new Date(ano,mes+1,0).getDate();
 const arr=dados();
 for(let d=1;d<=totalDias;d++){
  const data=`${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const count=arr.filter(x=>x.data===data).length;
  const div=document.createElement('div');
  div.className='day'+(count?' has':'');
  div.innerHTML=`${d}<br>${count?count+' impl.':''}`;
  cal.appendChild(div);
 }
gerarRelatorio(mes,ano);
gerarGrafico(mes,ano);
}

function gerarRelatorio(mes,ano){

  const arrCompleto = dados();

  const arrFiltrado = arrCompleto
    .map((item,index)=>({ ...item, index }))
    .filter(x=>{
      const dt=new Date(x.data);
      return dt.getMonth()===mes && dt.getFullYear()===ano;
    })
    .sort((a,b)=> new Date(a.data) - new Date(b.data));

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

function gerarGrafico(mes,ano){

  const arr = dados()
    .filter(x=>{
      const dt=new Date(x.data);
      return dt.getMonth()===mes && dt.getFullYear()===ano;
    });

  // Agrupa por dia
  const mapa = {};

  arr.forEach(x=>{
    const dia = new Date(x.data).getDate();
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

    // Barra
    ctx.fillStyle = '#2e86de';
    ctx.fillRect(
      i * larguraBarra + 10,
      yBarra,
      larguraBarra - 20,
      altura
    );

    // Quantidade acima
    ctx.fillStyle = "#000";
    ctx.fillText(valor, xCentro, yBarra - 5);

    // Dia abaixo
ctx.fillStyle = "#000";
ctx.fillText(valor, xCentro, yBarra - 5);

const mesFormatado = String(mes + 1).padStart(2,'0');
const diaFormatado = String(dia).padStart(2,'0');

ctx.fillText(`${diaFormatado}/${mesFormatado}`, xCentro, canvas.height - 15);
  });
}

function exportarPDF(){

  const mesIndex = parseInt(document.getElementById('mes').value);
  const ano = parseInt(document.getElementById('ano').value);
  const mes = mesIndex + 1;

  const arr = dados()
    .filter(x=>{
      const dt=new Date(x.data);
      return dt.getMonth()===mesIndex && dt.getFullYear()===ano;
    })
    .sort((a,b)=> new Date(a.data) - new Date(b.data));

  const tela = window.open('', '', 'width=800,height=600');

  tela.document.write('<html>');
  tela.document.write('<head>');
  tela.document.write('<title>Relatório de Implantações</title>');
  tela.document.write('<style>');
  tela.document.write('body{font-family:Arial;padding:30px}');
  tela.document.write('h2{text-align:center}');
  tela.document.write('.item{border-bottom:1px solid #ccc;padding:6px 0}');
  tela.document.write('.total{margin-top:15px;font-size:18px;font-weight:bold}');
  tela.document.write('</style>');
  tela.document.write('</head>');
  tela.document.write('<body>');

  tela.document.write('<h2>Relatório de Implantações</h2>');
  tela.document.write('<p>Mês: '+ mes +'/'+ ano +'</p>');
  tela.document.write('<div class="total">Total no mês: '+ arr.length +'</div>');
  tela.document.write('<hr>');

  arr.forEach(x=>{
    tela.document.write('<div class="item">'+ x.data +' - '+ x.cliente +'</div>');
  });

  tela.document.write('</body></html>');

  tela.document.close();
  tela.print();
}

popularSelects();
gerarCalendario();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker registrado"))
    .catch(err => console.log("Erro SW:", err));
}