const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.get('/', (_, res) => res.send('Lux Bingo Server online ✅'));
app.get('/health', (_, res) => res.json({ status: 'ok', salas: Object.keys(salas).length }));

// ─── PÁGINA DO JOGADOR ─────────────────────────────────────────────────────
app.get('/jogo/:codigo', (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Lux Bingo 🎰</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:'Segoe UI',sans-serif;background:linear-gradient(135deg,#1a55a5,#1e6fc0,#1a9ad0);min-height:100vh;color:#fff}
.wrap{max-width:420px;margin:0 auto;padding:20px 16px 40px}
.logo{text-align:center;padding:20px 0 10px}
.logo-icon{font-size:50px;display:block}
.logo-title{font-size:28px;font-weight:900;letter-spacing:4px;margin:4px 0 2px}
.logo-sub{font-size:11px;color:rgba(255,255,255,.6);letter-spacing:2px}
.card{background:#fff;border-radius:16px;padding:18px;margin-bottom:14px;box-shadow:0 4px 20px rgba(0,0,0,.15)}
.ct{font-size:11px;font-weight:900;color:#4a6080;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px}
.lbl{font-size:10px;color:#4a6080;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;display:block}
.inp{width:100%;background:#f4f6f9;border:2px solid #e0e4ea;border-radius:11px;padding:13px;color:#1a2a4a;font-size:15px;outline:none;margin-bottom:12px;font-family:inherit}
.inp:focus{border-color:#2060b0;background:#fff}
.btn-g{width:100%;padding:14px;background:linear-gradient(135deg,#2ecc71,#27ae60);border:none;border-radius:13px;font-size:15px;font-weight:900;color:#fff;letter-spacing:2px;cursor:pointer;margin-bottom:8px}
.btn-b{width:100%;padding:13px;background:linear-gradient(135deg,#2060b0,#1a4a8a);border:none;border-radius:13px;font-size:14px;font-weight:900;color:#fff;letter-spacing:2px;cursor:pointer;margin-bottom:8px}
.info-box{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:12px;padding:14px;margin-bottom:14px;text-align:center}
.info-cod{font-size:11px;color:rgba(255,255,255,.6);letter-spacing:2px}
.aguard{text-align:center;padding:30px 20px;background:rgba(255,215,0,.1);border:2px solid rgba(255,215,0,.3);border-radius:16px;margin-bottom:14px}
.aguard-icon{font-size:40px;display:block;margin-bottom:8px}
.aguard-title{font-size:18px;font-weight:900;color:#FFD700;letter-spacing:1px}
.aguard-sub{font-size:12px;color:rgba(255,255,255,.6);margin-top:6px;line-height:1.5}
.cartela-wrap{background:#fff;border-radius:16px;overflow:hidden;margin-bottom:14px;box-shadow:0 4px 20px rgba(0,0,0,.15)}
.cartela-header{background:linear-gradient(135deg,#667eea,#764ba2);padding:12px;text-align:center}
.cartela-titulo{font-size:16px;font-weight:900;color:#fff;letter-spacing:2px}
.letras{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:8px 8px 0}
.letra{text-align:center;font-size:18px;font-weight:900;color:#f39c12;padding:4px 0}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:4px 8px 8px}
.cel{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#f4f6f9;border:2px solid #e0e4ea;font-size:18px;font-weight:900;color:#1a2a4a;cursor:pointer;user-select:none}
.cel.marc{background:linear-gradient(135deg,#e74c3c,#c0392b);border-color:#e74c3c;color:#fff}
.cel.free{background:linear-gradient(135deg,#f39c12,#e67e22);border-color:#f39c12;color:#fff;cursor:default}
.numeros{background:#fff;border-radius:14px;padding:14px;margin-bottom:14px;box-shadow:0 4px 14px rgba(0,0,0,.12)}
.ng{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;margin-top:8px}
.nm{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:4px;background:#f0f2f5;font-size:9px;font-weight:700;color:#999}
.nm.s{background:#e74c3c;color:#fff}
.nm.u{background:#2ecc71;color:#fff}
.num-atual{text-align:center;padding:16px;background:rgba(255,255,255,.1);border-radius:14px;margin-bottom:14px}
.na-label{font-size:10px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.na-num{font-size:72px;font-weight:900;color:#fff;line-height:1}
.bingo-banner{background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:16px;padding:20px;text-align:center;margin-bottom:14px}
.bb-icon{font-size:48px;display:block;margin-bottom:6px}
.bb-title{font-size:24px;font-weight:900;color:#1a2a4a;letter-spacing:2px}
.bb-sub{font-size:13px;color:rgba(26,42,74,.7);margin-top:4px}
.toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#2ecc71;color:#fff;padding:10px 22px;border-radius:50px;font-weight:700;font-size:13px;z-index:999;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
.toast.on{opacity:1}
.toast.err{background:#e74c3c}
#t1,#t2,#t3,#t4{display:none}
#t1.ok,#t2.ok,#t3.ok,#t4.ok{display:block}
</style>
</head>
<body>
<div class="toast" id="toast"></div>
<div class="wrap">
  <div class="logo">
    <span class="logo-icon">🎰</span>
    <div class="logo-title">LUX BINGO</div>
    <div class="logo-sub">JOGO AO VIVO</div>
  </div>

  <div id="t1" class="ok">
    <div class="info-box"><div class="info-cod">SALA: ${codigo}</div></div>
    <div class="card">
      <div class="ct">📝 Seus Dados</div>
      <label class="lbl">Nome completo *</label>
      <input class="inp" id="iNome" type="text" placeholder="Seu nome...">
      <label class="lbl">CPF *</label>
      <input class="inp" id="iCpf" type="tel" placeholder="000.000.000-00" maxlength="14">
      <label class="lbl">Celular *</label>
      <input class="inp" id="iCel" type="tel" placeholder="(00) 00000-0000" maxlength="15">
      <label class="lbl">Sua Chave Pix *</label>
      <input class="inp" id="iPix" type="text" placeholder="CPF, email ou celular...">
      <label class="lbl">Email (opcional)</label>
      <input class="inp" id="iEmail" type="email" placeholder="seu@email.com">
      <button class="btn-g" id="btnConectar">SOLICITAR CARTELA →</button>
    </div>
  </div>

  <div id="t2">
    <div class="aguard">
      <span class="aguard-icon">⏳</span>
      <div class="aguard-title">AGUARDANDO APROVAÇÃO</div>
      <div class="aguard-sub">O sorteador está verificando seu pagamento.<br>Sua cartela será liberada em breve!</div>
    </div>
    <div class="card">
      <div class="ct" style="text-align:center">💳 REALIZE O PAGAMENTO</div>
      <div style="text-align:center">
        <div style="font-size:13px;color:#4a6080;margin-bottom:6px">Valor da cartela:</div>
        <div style="font-size:36px;font-weight:900;color:#2060b0" id="pValor">R$ --</div>
        <div style="font-size:13px;color:#4a6080;margin:10px 0 4px">Chave Pix do sorteador:</div>
        <div style="font-size:16px;font-weight:900;color:#1a2a4a;padding:10px;background:#f4f6f9;border-radius:10px;word-break:break-all" id="pChave">--</div>
        <div id="pHorario" style="display:none;font-size:14px;font-weight:700;color:#2060b0;margin-top:10px;padding:8px;background:#f4f6f9;border-radius:8px"></div>
        <div style="font-size:11px;color:#8099b0;margin-top:8px">Após pagar aguarde a confirmação</div>
      </div>
    </div>
  </div>

  <div id="t3">
    <div class="num-atual">
      <div class="na-label">Número Atual</div>
      <div class="na-num" id="nAtual">--</div>
    </div>
    <div class="cartela-wrap" id="cWrap" style="display:none">
      <div class="cartela-header">
        <div class="cartela-titulo">🎟️ SUA CARTELA — SALA ${codigo}</div>
      </div>
      <div class="letras">
        <div class="letra">B</div><div class="letra">I</div><div class="letra">N</div><div class="letra">G</div><div class="letra">O</div>
      </div>
      <div class="grid" id="cGrid"></div>
    </div>
    <div class="numeros">
      <div style="font-size:10px;font-weight:700;color:#4a6080;text-transform:uppercase;letter-spacing:1.5px">Números Sorteados</div>
      <div class="ng" id="nGrid"></div>
    </div>
    <button class="btn-b" id="btnBingo" style="display:none;font-size:18px;padding:16px">🎉 GRITAR BINGO!</button>
  </div>

  <div id="t4">
    <div class="card" style="text-align:center;padding:30px">
      <div style="font-size:48px;margin-bottom:12px">❌</div>
      <div style="font-size:18px;font-weight:900;color:#e74c3c;margin-bottom:8px">Solicitação Rejeitada</div>
      <div style="font-size:13px;color:#8099b0;margin-bottom:20px" id="motivo">Pagamento não confirmado.</div>
      <button class="btn-b" id="btnVoltar">Tentar Novamente</button>
    </div>
  </div>
</div>

<script>
var COD='${codigo}',SERVER=window.location.origin,sock=null,cart=null,marc=[],nums=[],cId=null;

document.getElementById('iCpf').oninput=function(){
  var v=this.value.replace(/\\D/g,'');
  v=v.replace(/(\\d{3})(\\d)/,'$1.$2').replace(/(\\d{3})(\\d)/,'$1.$2').replace(/(\\d{3})(\\d{1,2})$/,'$1-$2');
  this.value=v;
};
document.getElementById('iCel').oninput=function(){
  var v=this.value.replace(/\\D/g,'');
  v=v.replace(/^(\\d{2})(\\d)/,'($1) $2').replace(/(\\d{5})(\\d{1,4})$/,'$1-$2');
  this.value=v;
};

function tela(n){['t1','t2','t3','t4'].forEach(function(t){document.getElementById(t).className=t===('t'+n)?'ok':'';});}
function toast(m,e){var t=document.getElementById('toast');t.textContent=m;t.className='toast on'+(e?' err':'');setTimeout(function(){t.className='toast';},3000);}

document.getElementById('btnConectar').onclick=function(){
  var nome=document.getElementById('iNome').value.trim();
  var cpf=document.getElementById('iCpf').value.trim();
  var cel=document.getElementById('iCel').value.trim();
  var pix=document.getElementById('iPix').value.trim();
  var email=document.getElementById('iEmail').value.trim();
  if(!nome||!cpf||!cel||!pix){toast('❌ Preencha todos os campos obrigatórios!',true);return;}
  sock=io(SERVER,{transports:['websocket']});
  sock.on('connect',function(){
    sock.emit('entrar_sala',{codigo:COD,nomeJogador:nome},function(r){
      if(!r.ok){toast('❌ '+r.erro,true);sock.disconnect();return;}
    document.getElementById('pValor').textContent='R$ '+(r.valorCartela||'?');
      document.getElementById('pChave').textContent=r.chavePix||'--';
      if(r.horario){
        document.getElementById('pHorario').textContent='🕐 '+r.horario;
        document.getElementById('pHorario').style.display='block';
      }
      sock.emit('solicitar_cartela',{codigo:COD,dados:{nome:nome,cpf:cpf,celular:cel,chavePix:pix,email:email}},function(r2){
        if(!r2.ok){toast('❌ '+r2.erro,true);return;}
        tela(2);toast('✅ Solicitação enviada!');
      });
    });
  });
  sock.on('connect_error',function(){toast('❌ Erro de conexão!',true);});
  sock.on('cartela_aprovada',function(d){
    cart=d.cartela;cId=cart.id;nums=d.sorteados||[];marc=nums.slice();
    renderCart();renderGrid();tela(3);toast('🎉 Cartela liberada! Boa sorte!');
  });
  sock.on('cartela_rejeitada',function(d){
    document.getElementById('motivo').textContent=d.mensagem||'Pagamento não confirmado.';tela(4);
  });
  sock.on('numero_sorteado',function(d){
    nums=d.sorteados||nums;
    document.getElementById('nAtual').textContent=d.numero||d;
    if(marc.indexOf(d.numero)===-1) marc.push(d.numero);
    renderCart();renderGrid();verBingo();
    falarNumero(d.numero);
  });
  sock.on('bingo_confirmado',function(d){
    var b=document.createElement('div');b.className='bingo-banner';
    b.innerHTML='<span class="bb-icon">🎊</span><div class="bb-title">BINGO!</div><div class="bb-sub">Vencedor: '+d.vencedor.nome+'</div>';
    document.querySelector('.wrap').insertBefore(b,document.getElementById('t3'));
  });
  sock.on('adm_desconectado',function(){toast('⚠️ Sorteador desconectou. Jogo continua!');});
};

document.getElementById('btnVoltar').onclick=function(){tela(1);};

function renderCart(){
  if(!cart)return;
  document.getElementById('cWrap').style.display='block';
  var g=document.getElementById('cGrid');g.innerHTML='';
  for(var r=0;r<5;r++){
    for(var c=0;c<5;c++){
      var v=cart.grid[r][c];
      var el=document.createElement('div');
      if(v==='FREE'){el.className='cel free';el.innerHTML='⭐';}
      else{
        el.className='cel'+(marc.indexOf(v)!==-1?' marc':'');
        el.textContent=v;
        (function(val,e){e.onclick=function(){
          var i=marc.indexOf(val);
          if(i===-1)marc.push(val);else marc.splice(i,1);
          renderCart();verBingo();
        };})(v,el);
      }
      g.appendChild(el);
    }
  }
}

function renderGrid(){
  var g=document.getElementById('nGrid');g.innerHTML='';
  var u=nums[nums.length-1];
  for(var i=1;i<=75;i++){
    var d=document.createElement('div');
    d.className='nm'+(nums.indexOf(i)!==-1?(i===u?' u':' s'):'');
    d.textContent=i;g.appendChild(d);
  }
}

function verBingo(){
  if(!cart)return;
  var ok=true;
  for(var r=0;r<5;r++)for(var c=0;c<5;c++){var v=cart.grid[r][c];if(v!=='FREE'&&marc.indexOf(v)===-1){ok=false;break;}}
  document.getElementById('btnBingo').style.display=ok?'block':'none';
}

document.getElementById('btnBingo').onclick=function(){
  if(!sock||!cId)return;
  sock.emit('gritar_bingo',{codigo:COD,cartelaId:cId},function(r){
    if(r.ok)toast('🎉 BINGO confirmado!');
    else toast('❌ '+r.erro,true);
  });
};

renderGrid();

// ── ÁUDIO via Web Speech API (fala o número em português) ──
function falarNumero(num) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var msg1 = new SpeechSynthesisUtterance('Número ' + num);
  msg1.lang = 'pt-BR';
  msg1.rate = 0.9;
  msg1.pitch = 1;
  msg1.volume = 1;
  var msg2 = new SpeechSynthesisUtterance('Número ' + num);
  msg2.lang = 'pt-BR';
  msg2.rate = 0.9;
  msg2.pitch = 1;
  msg2.volume = 1;
  window.speechSynthesis.speak(msg1);
  msg1.onend = function() {
    setTimeout(function() {
      window.speechSynthesis.speak(msg2);
    }, 800);
  };
}
</script>
</body>
</html>`);
});

// ─── Estado global ─────────────────────────────────────────────────────────
const salas = {};

// ─── Utilidades ────────────────────────────────────────────────────────────
function gerarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums   = '23456789';
  let cod = '';
  for (let i = 0; i < 3; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  for (let i = 0; i < 3; i++) cod += nums[Math.floor(Math.random() * nums.length)];
  return cod;
}

function gerarCartela75() {
  const faixas = [[1,15],[16,30],[31,45],[46,60],[61,75]];
  const cartela = [];
  for (let col = 0; col < 5; col++) {
    const [min, max] = faixas[col];
    const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const escolhidos = [];
    for (let row = 0; row < 5; row++) {
      const idx = Math.floor(Math.random() * pool.length);
      escolhidos.push(pool.splice(idx, 1)[0]);
    }
    cartela.push(escolhidos);
  }
  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => (row === 2 && col === 2 ? 'FREE' : cartela[col][row]))
  );
  return grid;
}

function gerarBolao(sala, quantidade) {
  const cartelas = [];
  for (let i = 0; i < quantidade; i++) {
    cartelas.push({
      id: `${sala}-${i + 1}`,
      numero: i + 1,
      grid: gerarCartela75(),
      marcados: [[false,false,false,false,false],[false,false,false,false,false],
                 [false,false,true, false,false],[false,false,false,false,false],
                 [false,false,false,false,false]],
    });
  }
  return cartelas;
}

function validarBingo(cartela, sorteados) {
  const grid = cartela.grid;
  const marcados = cartela.marcados;
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++)
      if (sorteados.includes(grid[r][c]) || (r === 2 && c === 2)) marcados[r][c] = true;
  for (let i = 0; i < 5; i++) {
    if (marcados[i].every(Boolean)) return true;
    if (marcados.every(row => row[i])) return true;
  }
  if ([0,1,2,3,4].every(i => marcados[i][i])) return true;
  if ([0,1,2,3,4].every(i => marcados[i][4 - i])) return true;
  return false;
}

function sorteiarNumero(sala) {
  const s = salas[sala];
  if (!s || !s.ativa) return null;
  const restantes = s.numeros.filter(n => !s.sorteados.includes(n));
  if (restantes.length === 0) return null;
  const num = restantes[Math.floor(Math.random() * restantes.length)];
  s.sorteados.push(num);
  const letras = 'BINGO';
  const coluna = letras[Math.floor((num - 1) / 15)];
  return { numero: num, coluna, sorteados: s.sorteados };
}

// ─── Socket.io ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] ${socket.id} conectado`);

  // Reconexão do ADM — atualiza socketId
  socket.on('reconectar_adm', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s) return cb({ ok: false });
    s.adm.socketId = socket.id;
    socket.join(codigo);
    socket.data.sala  = codigo;
    socket.data.papel = 'adm';
    console.log(`[RECONEXAO] ADM de ${codigo} reconectado`);
    cb({ ok: true });
  });

  socket.on('criar_sala', ({ nomeAdm, valorCartela, chavePix, quantidadeCartelas, horario }, cb) => {
    let codigo;
    do { codigo = gerarCodigo(); } while (salas[codigo]);
    const cartelas = gerarBolao(codigo, quantidadeCartelas || 100);
    salas[codigo] = {
      codigo,
      adm: { socketId: socket.id, nome: nomeAdm },
      jogadores: {},
      cartelas,
      cartelasVendidas: {},
      solicitacoes: {},
      numeros: Array.from({ length: 75 }, (_, i) => i + 1),
      sorteados: [],
      ativa: false,
     valorCartela: valorCartela || 0,
      chavePix: chavePix || '',
      horario: horario || '',
      vencedor: null,
    };
    socket.join(codigo);
    socket.data.sala  = codigo;
    socket.data.papel = 'adm';
    console.log(`[SALA] ${codigo} criada por ${nomeAdm}`);
    cb({ ok: true, codigo, cartelas: cartelas.length });
  });

  socket.on('entrar_sala', ({ codigo, nomeJogador }, cb) => {
    const s = salas[codigo?.toUpperCase()];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    if (s.vencedor) return cb({ ok: false, erro: 'Jogo já encerrado' });
    const jogadorId = socket.id;
    s.jogadores[jogadorId] = { nome: nomeJogador, socketId: socket.id };
    socket.join(codigo.toUpperCase());
    socket.data.sala  = codigo.toUpperCase();
    socket.data.papel = 'jogador';
    io.to(s.adm.socketId).emit('jogador_entrou', {
      jogadorId, nome: nomeJogador, total: Object.keys(s.jogadores).length,
    });
    console.log(`[SALA] ${nomeJogador} entrou em ${codigo}`);
    cb({ ok: true, sorteados: s.sorteados, ativa: s.ativa, valorCartela: s.valorCartela, chavePix: s.chavePix, horario: s.horario });
  });

  socket.on('solicitar_cartela', ({ codigo, dados }, cb) => {
    const s = salas[codigo];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    if (s.ativa) return cb({ ok: false, erro: 'Jogo já em andamento' });
    const jogadorId = socket.id;
    const cartelasDoJogador = s.cartelasVendidas[jogadorId] || [];
    if (cartelasDoJogador.length >= 3) return cb({ ok: false, erro: 'Você já tem o máximo de 3 cartelas!' });
    const solAtual = s.solicitacoes[jogadorId];
    if (solAtual && solAtual.status === 'pendente') return cb({ ok: false, erro: 'Você já tem uma solicitação pendente.' });
    s.solicitacoes[jogadorId] = {
      jogadorId, nome: dados.nome || s.jogadores[jogadorId]?.nome || 'Jogador',
      cpf: dados.cpf, celular: dados.celular, chavePix: dados.chavePix,
      email: dados.email || '', status: 'pendente',
      timestamp: Date.now(), cartelasJaTem: cartelasDoJogador.length,
    };
    io.to(s.adm.socketId).emit('nova_solicitacao', {
      jogadorId, nome: s.solicitacoes[jogadorId].nome,
      cpf: dados.cpf, celular: dados.celular, chavePix: dados.chavePix,
      email: dados.email || '', cartelasJaTem: cartelasDoJogador.length, timestamp: Date.now(),
    });
    console.log(`[SOLICITACAO] ${dados.nome} solicitou cartela em ${codigo}`);
    cb({ ok: true, mensagem: 'Solicitação enviada!' });
  });

  socket.on('aprovar_cartela', ({ codigo, jogadorId }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false, erro: 'Não autorizado' });
    const solicitacao = s.solicitacoes[jogadorId];
    if (!solicitacao) return cb({ ok: false, erro: 'Solicitação não encontrada' });
    const disponiveis = s.cartelas.filter(c =>
      !Object.values(s.cartelasVendidas).flat().find(v => v.id === c.id)
    );
    if (!disponiveis.length) return cb({ ok: false, erro: 'Sem cartelas disponíveis' });
    const cartela = disponiveis[0];
    s.cartelasVendidas[jogadorId] = [...(s.cartelasVendidas[jogadorId] || []), cartela];
    s.solicitacoes[jogadorId].status = 'aprovado';
    io.to(jogadorId).emit('cartela_aprovada', {
      cartela, sorteados: s.sorteados, mensagem: '✅ Pagamento confirmado! Sua cartela foi liberada.',
    });
    console.log(`[APROVADO] Cartela liberada para ${solicitacao.nome} em ${codigo}`);
    cb({ ok: true });
  });

  socket.on('rejeitar_cartela', ({ codigo, jogadorId, motivo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false, erro: 'Não autorizado' });
    const solicitacao = s.solicitacoes[jogadorId];
    if (!solicitacao) return cb({ ok: false, erro: 'Solicitação não encontrada' });
    s.solicitacoes[jogadorId].status = 'rejeitado';
    io.to(jogadorId).emit('cartela_rejeitada', {
      mensagem: motivo || '❌ Pagamento não confirmado. Tente novamente.',
    });
    console.log(`[REJEITADO] Solicitação de ${solicitacao.nome} rejeitada em ${codigo}`);
    cb({ ok: true });
  });

  socket.on('iniciar_jogo', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false });
    s.ativa = true;
    io.to(codigo).emit('jogo_iniciado', { valorCartela: s.valorCartela });
    console.log(`[JOGO] ${codigo} iniciado`);
    cb({ ok: true });
  });

  socket.on('sortear', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false });
    if (!s.ativa) s.ativa = true;
    const resultado = sorteiarNumero(codigo);
    if (!resultado) return cb({ ok: false, erro: 'Sem números restantes' });
    io.to(codigo).emit('numero_sorteado', resultado);
    cb({ ok: true, ...resultado });
  });

  socket.on('gritar_bingo', ({ codigo, cartelaId }, cb) => {
    const s = salas[codigo];
    if (!s || !s.ativa || s.vencedor) return cb({ ok: false });
    const jogadorId = socket.id;
    const cartelasJogador = s.cartelasVendidas[jogadorId] || [];
    const cartela = cartelasJogador.find(c => c.id === cartelaId);
    if (!cartela) return cb({ ok: false, erro: 'Cartela não encontrada' });
    const valido = validarBingo(cartela, s.sorteados);
    if (!valido) return cb({ ok: false, erro: 'Bingo inválido' });
    s.vencedor = { jogadorId, nome: s.jogadores[jogadorId]?.nome, cartelaId };
    s.ativa = false;
    io.to(codigo).emit('bingo_confirmado', { vencedor: s.vencedor, sorteados: s.sorteados });
    console.log(`[BINGO] ${s.vencedor.nome} venceu em ${codigo}`);
    cb({ ok: true });
  });

  socket.on('status_sala', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s) return cb({ ok: false });
    cb({
      ok: true,
      jogadores: Object.values(s.jogadores).map(j => j.nome),
      sorteados: s.sorteados, ativa: s.ativa, vencedor: s.vencedor,
      solicitacoesPendentes: Object.values(s.solicitacoes).filter(sol => sol.status === 'pendente').length,
      cartelas_restantes: s.cartelas.filter(c =>
        !Object.values(s.cartelasVendidas).flat().find(v => v.id === c.id)
      ).length,
    });
  });

  socket.on('disconnect', () => {
    const { sala, papel } = socket.data || {};
    if (!sala || !salas[sala]) return;
    if (papel === 'adm') {
      io.to(sala).emit('adm_desconectado');
      console.log(`[WARN] ADM de ${sala} desconectou`);
    } else {
      const jogador = salas[sala]?.jogadores[socket.id];
      if (jogador) {
        const nomeJogador = jogador.nome;
        delete salas[sala].jogadores[socket.id];
        const s = salas[sala];
        if (s) {
          io.to(s.adm.socketId).emit('jogador_saiu', {
            nome: nomeJogador,
            total: Object.keys(s.jogadores).length,
          });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Lux Bingo Server rodando na porta ${PORT} 🎱`));