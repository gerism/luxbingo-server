const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 20000,
  pingInterval: 10000,
});

app.get('/', (_, res) => res.send('Lux Bingo Server online ✅'));
app.get('/health', (_, res) => res.json({ status: 'ok', salas: Object.keys(salas).length }));

const LOGO = 'https://luxbingo-server-production.up.railway.app/logo.png';

app.get('/jogo/:codigo', (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Lux Bingo 🎰</title>
<link rel="icon" type="image/png" href="/icon.png">
<link rel="apple-touch-icon" href="/icon.png">
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js"><\/script>
<style>
:root{--navy:#0d1b2e;--navy2:#1a2d4e;--gold:#c9a227;--gold2:#f0c040;--gold3:#ffd966;--card:#0f2240;--text:#e8d5a3;--textl:rgba(232,213,163,.6)}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:'Segoe UI',sans-serif;background:var(--navy);min-height:100vh;color:var(--text);overflow-x:hidden}
/* PORTRAIT */
.port-wrap{max-width:420px;margin:0 auto;padding:16px 14px 40px}
/* LANDSCAPE - tela do jogo */
.land-wrap{display:none}
@media (orientation:landscape){
  .port-wrap{display:none}
  .land-wrap{display:flex;height:100vh;width:100vw;overflow:hidden;gap:0}
  /* Coluna esquerda - número atual + grid */
  .land-esq{width:38%;background:rgba(0,0,0,.3);border-right:1px solid rgba(201,162,39,.2);display:flex;flex-direction:column;padding:10px;gap:8px;overflow-y:auto}
  /* Coluna direita - cartela */
  .land-dir{flex:1;display:flex;flex-direction:column;padding:10px;gap:8px;overflow-y:auto}
  /* Aviso girar em portrait nas telas de formulario */
  #t1,#t2,#t4{max-width:100%;padding:10px}
}
/* COMPONENTES */
.logo-area{text-align:center;padding:14px 0 8px}
.logo-img{width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);box-shadow:0 0 20px rgba(201,162,39,.4)}
.logo-title{font-size:22px;font-weight:900;color:var(--gold2);letter-spacing:4px;margin:5px 0 2px}
.logo-sub{font-size:10px;color:var(--textl);letter-spacing:2px}
.card{background:var(--card);border:1px solid rgba(201,162,39,.2);border-radius:14px;padding:14px;margin-bottom:10px}
.ct{font-size:10px;font-weight:900;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px}
.lbl{font-size:10px;color:var(--textl);font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;display:block}
.inp{width:100%;background:rgba(255,255,255,.05);border:1.5px solid rgba(201,162,39,.3);border-radius:11px;padding:11px;color:var(--gold2);font-size:14px;outline:none;margin-bottom:10px;font-family:inherit}
.inp:focus{border-color:var(--gold2)}
.inp::placeholder{color:var(--textl)}
.btn-g{width:100%;padding:13px;background:linear-gradient(135deg,var(--gold),var(--gold2));border:none;border-radius:12px;font-size:14px;font-weight:900;color:var(--navy);letter-spacing:2px;cursor:pointer;margin-bottom:8px}
.btn-b{width:100%;padding:11px;background:transparent;border:2px solid rgba(201,162,39,.4);border-radius:12px;font-size:13px;font-weight:900;color:var(--gold2);letter-spacing:2px;cursor:pointer;margin-bottom:8px}
.info-box{background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.3);border-radius:11px;padding:12px;margin-bottom:12px;text-align:center}
.info-cod{font-size:11px;color:var(--textl);letter-spacing:2px}
.aguard{text-align:center;padding:24px 16px;background:rgba(201,162,39,.08);border:2px solid rgba(201,162,39,.3);border-radius:14px;margin-bottom:12px}
.aguard-icon{font-size:36px;display:block;margin-bottom:8px}
.aguard-title{font-size:16px;font-weight:900;color:var(--gold2)}
.aguard-sub{font-size:11px;color:var(--textl);margin-top:5px;line-height:1.5}
/* NÚMERO ATUAL */
.num-atual{text-align:center;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(201,162,39,.2);border-radius:12px}
.na-label{font-size:9px;color:var(--textl);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px}
.na-num{font-size:64px;font-weight:900;color:var(--gold2);line-height:1;text-shadow:0 0 20px rgba(201,162,39,.5)}
/* CARTELA */
.cartela-wrap{background:var(--card);border:2px solid rgba(201,162,39,.3);border-radius:14px;overflow:hidden}
.cartela-header{background:linear-gradient(135deg,#0a1628,var(--navy2));border-bottom:2px solid var(--gold);padding:10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
.cartela-logo{width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold)}
.cartela-titulo{font-size:13px;font-weight:900;color:var(--gold2);letter-spacing:2px}
.cartela-sub{font-size:9px;color:var(--textl)}
.letras{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:6px 6px 0}
.letra{text-align:center;font-size:16px;font-weight:900;color:var(--gold);padding:3px 0}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:3px 6px 6px}
.cel{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,.05);border:1.5px solid rgba(201,162,39,.2);font-size:16px;font-weight:900;color:var(--text);cursor:pointer;user-select:none}
.cel.marc{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold3);color:var(--navy)}
.cel.free{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold3);color:var(--navy);cursor:default}
/* GRID NÚMEROS */
.numeros-box{background:var(--card);border:1px solid rgba(201,162,39,.15);border-radius:12px;padding:10px}
.ng{display:grid;grid-template-columns:repeat(10,1fr);gap:2px;margin-top:6px}
.nm{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:3px;background:rgba(255,255,255,.04);font-size:9px;font-weight:700;color:rgba(232,213,163,.3)}
.nm.s{background:rgba(201,162,39,.2);color:var(--gold)}
.nm.u{background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--navy)}
/* ALERTA */
.alerta-quase{background:rgba(201,162,39,.15);border:2px solid var(--gold);color:var(--gold2);border-radius:12px;padding:10px;text-align:center;font-weight:900;font-size:12px}
.alerta-bingo{background:rgba(46,204,113,.15);border:2px solid #2ecc71;color:#2ecc71;border-radius:12px;padding:10px;text-align:center;font-weight:900;font-size:12px}
/* PAGAMENTO */
.pix-val{font-size:32px;font-weight:900;color:var(--gold2);text-align:center;margin:6px 0}
.pix-chave{font-size:14px;font-weight:900;color:var(--gold2);padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(201,162,39,.3);border-radius:10px;word-break:break-all;text-align:center}
/* TOAST */
.toast{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--navy);padding:8px 20px;border-radius:50px;font-weight:900;font-size:12px;z-index:999;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
.toast.on{opacity:1}
.toast.err{background:#e74c3c;color:#fff}
/* BINGO BANNER */
.bingo-banner{background:linear-gradient(135deg,var(--gold),var(--gold2));border-radius:14px;padding:16px;text-align:center;margin-bottom:10px}
.bb-icon{font-size:40px;display:block;margin-bottom:4px}
.bb-title{font-size:20px;font-weight:900;color:var(--navy);letter-spacing:2px}
.bb-sub{font-size:12px;color:rgba(13,27,46,.7);margin-top:3px}
/* TELAS */
#t1,#t2,#t3,#t4{display:none}
#t1.ok,#t2.ok,#t3.ok,#t4.ok{display:block}
#t3.ok{display:flex !important;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;background:var(--navy)}
.land-esq{width:42%;background:rgba(0,0,0,.3);border-right:1px solid rgba(201,162,39,.2);display:flex;flex-direction:column;padding:10px;gap:8px;overflow-y:auto;height:100vh}
.land-dir{flex:1;display:flex;flex-direction:column;padding:10px;gap:8px;overflow-y:auto;height:100vh}
</style>
</head>
<body>
<div class="toast" id="toast"></div>

<!-- PORTRAIT: formulário, aguard, rejeitado -->
<div class="port-wrap">
  <div class="logo-area">
    <img src="https://luxbingo-server-production.up.railway.app/logo.png" class="logo-img">
    <div class="logo-title">LUX BINGO</div>
    <div class="logo-sub">JOGO AO VIVO</div>
  </div>

  <!-- T1: DADOS -->
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

  <!-- T2: AGUARDANDO -->
  <div id="t2">
    <div class="aguard">
      <span class="aguard-icon">⏳</span>
      <div class="aguard-title">AGUARDANDO APROVAÇÃO</div>
      <div class="aguard-sub">O sorteador está verificando seu pagamento.<br>Sua cartela será liberada em breve!</div>
    </div>
    <div class="card">
      <div class="ct" style="text-align:center">💳 REALIZE O PAGAMENTO</div>
      <div style="font-size:12px;color:var(--textl);text-align:center;margin-bottom:6px">Valor da cartela:</div>
      <div class="pix-val" id="pValor">R$ --</div>
      <div style="font-size:12px;color:var(--textl);text-align:center;margin:10px 0 6px">Chave Pix do sorteador:</div>
      <div class="pix-chave" id="pChave">--</div>
      <div id="pHorario" style="display:none;font-size:13px;font-weight:700;color:var(--gold2);margin-top:10px;padding:8px;background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.3);border-radius:8px;text-align:center"></div>
      <div style="font-size:11px;color:var(--textl);text-align:center;margin-top:8px">Após pagar aguarde a confirmação</div>
    </div>
  </div>

  <!-- T4: REJEITADO -->
  <div id="t4">
    <div class="card" style="text-align:center;padding:28px">
      <div style="font-size:44px;margin-bottom:10px">❌</div>
      <div style="font-size:17px;font-weight:900;color:#e74c3c;margin-bottom:8px">Solicitação Rejeitada</div>
      <div style="font-size:12px;color:var(--textl);margin-bottom:18px" id="motivo">Pagamento não confirmado.</div>
      <button class="btn-b" id="btnVoltar">Tentar Novamente</button>
    </div>
  </div>
</div>

<!-- T3: JOGO (landscape) -->
<div id="t3">
  <!-- COLUNA ESQUERDA -->
  <div class="land-esq">
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
      <img src="https://luxbingo-server-production.up.railway.app/logo.png" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold)">
      <div style="font-size:12px;font-weight:900;color:var(--gold2);letter-spacing:2px">LUX BINGO</div>
      <div style="margin-left:auto;font-size:10px;color:var(--textl)">${codigo}</div>
    </div>
    <div id="alertaBox" style="display:none"></div>
    <div class="num-atual">
      <div class="na-label">Número Atual</div>
      <div class="na-num" id="nAtual">--</div>
    </div>
    <div class="numeros-box">
      <div style="font-size:9px;font-weight:700;color:var(--textl);text-transform:uppercase;letter-spacing:1.5px">Números Sorteados</div>
      <div class="ng" id="nGrid"></div>
    </div>
    <button class="btn-g" id="btnBingo" style="display:none;padding:11px;font-size:14px">🎉 GRITAR BINGO!</button>
    <button class="btn-b" id="btnAudio" style="padding:9px;font-size:12px">🔊 Áudio ON</button>
  </div>
  <!-- COLUNA DIREITA -->
  <div class="land-dir">
    <div class="cartela-wrap" id="cWrap" style="display:none">
      <div class="cartela-header">
        <img src="https://luxbingo-server-production.up.railway.app/logo.png" class="cartela-logo">
        <div class="cartela-titulo">🎟️ SUA CARTELA</div>
        <div class="cartela-sub" id="cHorario">SALA: ${codigo}</div>
      </div>
      <div class="letras">
        <div class="letra">B</div><div class="letra">I</div><div class="letra">N</div><div class="letra">G</div><div class="letra">O</div>
      </div>
      <div class="grid" id="cGrid"></div>
    </div>
    <div style="font-size:11px;color:var(--textl);text-align:center;padding:20px" id="semCartela">Aguardando cartela ser liberada...</div>
  </div>
</div>

<script>
var COD='${codigo}',SERVER=window.location.origin,sock=null,cart=null,marc=[],nums=[],cId=null,audioOn=true;

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

function tela(n){
  ['t1','t2','t4'].forEach(function(t){document.getElementById(t).className='';});
  document.getElementById('t3').className='';
  if(n===3){document.getElementById('t3').className='ok';}
  else{document.getElementById('t'+n).className='ok';}
}
function toast(m,e){var t=document.getElementById('toast');t.textContent=m;t.className='toast on'+(e?' err':'');setTimeout(function(){t.className='toast';},3000);}

document.getElementById('btnConectar').onclick=function(){
  var nome=document.getElementById('iNome').value.trim();
  var cpf=document.getElementById('iCpf').value.trim();
  var cel=document.getElementById('iCel').value.trim();
  var pix=document.getElementById('iPix').value.trim();
  var email=document.getElementById('iEmail').value.trim();
  if(!nome||!cpf||!cel||!pix){toast('❌ Preencha todos os campos!',true);return;}
  sock=io(SERVER,{transports:['websocket']});
  sock.on('connect',function(){
    localStorage.setItem('luxbingo_nome_'+COD,nome);
    sock.emit('entrar_sala',{codigo:COD,nomeJogador:nome},function(r){
      if(!r.ok){toast('❌ '+r.erro,true);sock.disconnect();return;}
      document.getElementById('pValor').textContent='R$ '+(r.valorCartela||'?');
      document.getElementById('pChave').textContent=r.chavePix||'--';
      if(r.horario){document.getElementById('pHorario').textContent='🕐 '+r.horario;document.getElementById('pHorario').style.display='block';}
      sock.emit('solicitar_cartela',{codigo:COD,dados:{nome:nome,cpf:cpf,celular:cel,chavePix:pix,email:email}},function(r2){
        if(!r2.ok){toast('❌ '+r2.erro,true);return;}
        tela(2);toast('✅ Solicitação enviada!');
      });
    });
  });
  sock.on('connect_error',function(){toast('❌ Erro de conexão!',true);});
  sock.on('cartela_aprovada',function(d){
    cart=d.cartela;cId=cart.id;nums=d.sorteados||[];marc=nums.slice();
    if(d.horario){var h=document.getElementById('cHorario');if(h)h.textContent='SALA: ${codigo} · 🕐 '+d.horario;}
    document.getElementById('semCartela').style.display='none';
    salvarLocal();renderCart();renderGrid();tela(3);toast('🎉 Cartela liberada! Boa sorte!');
  });
  sock.on('cartela_rejeitada',function(d){document.getElementById('motivo').textContent=d.mensagem||'Pagamento não confirmado.';tela(4);});
  sock.on('numero_sorteado',function(d){
    nums=d.sorteados||nums;document.getElementById('nAtual').textContent=d.numero||d;
    if(marc.indexOf(d.numero)===-1)marc.push(d.numero);
    salvarLocal();renderCart();renderGrid();verBingo();falarNumero(d.numero);
  });
  sock.on('bingo_confirmado',function(d){
    var b=document.createElement('div');b.className='bingo-banner';
    b.innerHTML='<span class="bb-icon">🎊</span><div class="bb-title">BINGO!</div><div class="bb-sub">Vencedor: '+d.vencedor.nome+'</div>';
    document.getElementById('t3').insertBefore(b,document.getElementById('t3').firstChild);
  });
  sock.on('adm_desconectado',function(){toast('⚠️ Sorteador desconectou. Jogo continua!');});
  sock.on('alerta_jogador',function(d){
    var box=document.getElementById('alertaBox');
    box.textContent=d.texto;box.className=d.tipo==='bingo'?'alerta-bingo':'alerta-quase';box.style.display='block';
    if(d.tipo!=='bingo')setTimeout(function(){box.style.display='none';},5000);
  });
};

document.getElementById('btnVoltar').onclick=function(){tela(1);};
document.getElementById('btnAudio').onclick=function(){
  audioOn=!audioOn;
  this.textContent=audioOn?'🔊 Áudio ON':'🔇 Áudio OFF';
  this.style.borderColor=audioOn?'rgba(201,162,39,.4)':'rgba(231,76,60,.5)';
  this.style.color=audioOn?'var(--gold2)':'#e74c3c';
};
document.getElementById('btnBingo').onclick=function(){
  if(!sock||!cId)return;
  sock.emit('gritar_bingo',{codigo:COD,cartelaId:cId},function(r){
    if(r.ok)toast('🎉 BINGO confirmado!');else toast('❌ '+r.erro,true);
  });
};

function renderCart(){
  if(!cart)return;
  document.getElementById('cWrap').style.display='block';
  var g=document.getElementById('cGrid');g.innerHTML='';
  for(var r=0;r<5;r++)for(var c=0;c<5;c++){
    var v=cart.grid[r][c];var el=document.createElement('div');
    if(v==='FREE'){el.className='cel free';el.innerHTML='⭐';}
    else{
      el.className='cel'+(marc.indexOf(v)!==-1?' marc':'');el.textContent=v;
      (function(val,e){e.onclick=function(){
        var i=marc.indexOf(val);if(i===-1)marc.push(val);else marc.splice(i,1);
        salvarLocal();renderCart();verBingo();
      };})(v,el);
    }
    g.appendChild(el);
  }
}
function renderGrid(){
  var g=document.getElementById('nGrid');g.innerHTML='';var u=nums[nums.length-1];
  for(var i=1;i<=75;i++){var d=document.createElement('div');d.className='nm'+(nums.indexOf(i)!==-1?(i===u?' u':' s'):'');d.textContent=i;g.appendChild(d);}
}
function verBingo(){
  if(!cart)return;var ok=true;
  for(var r=0;r<5;r++)for(var c=0;c<5;c++){var v=cart.grid[r][c];if(v!=='FREE'&&marc.indexOf(v)===-1){ok=false;break;}}
  document.getElementById('btnBingo').style.display=ok?'block':'none';
}
function falarNumero(num){
  if(!audioOn||!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  var m1=new SpeechSynthesisUtterance('Número '+num);m1.lang='pt-BR';m1.rate=0.9;m1.pitch=1;m1.volume=1;
  var m2=new SpeechSynthesisUtterance('Número '+num);m2.lang='pt-BR';m2.rate=0.9;m2.pitch=1;m2.volume=1;
  window.speechSynthesis.speak(m1);m1.onend=function(){setTimeout(function(){window.speechSynthesis.speak(m2);},800);};
}
function salvarLocal(){
  if(!cart)return;localStorage.setItem('luxbingo_'+COD,JSON.stringify({cart:cart,cId:cId,marc:marc,nums:nums}));
}
function restaurarLocal(){
  try{
    var s=localStorage.getItem('luxbingo_'+COD);if(!s)return false;
    var d=JSON.parse(s);cart=d.cart;cId=d.cId;marc=d.marc;nums=d.nums;
    document.getElementById('semCartela').style.display='none';
    renderCart();renderGrid();verBingo();tela(3);toast('✅ Cartela restaurada!');return true;
  }catch(e){return false;}
}
window.onload=function(){
  var ok=restaurarLocal();
  if(ok){
    sock=io(SERVER,{transports:['websocket']});
    sock.on('connect',function(){
      var n=localStorage.getItem('luxbingo_nome_'+COD)||'Jogador';
      sock.emit('entrar_sala',{codigo:COD,nomeJogador:n},function(r){
        if(r&&r.ok){nums=r.sorteados||nums;r.sorteados.forEach(function(x){if(marc.indexOf(x)===-1)marc.push(x);});salvarLocal();renderCart();renderGrid();verBingo();}
      });
    });
    sock.on('numero_sorteado',function(d){
      nums=d.sorteados||nums;document.getElementById('nAtual').textContent=d.numero||d;
      if(marc.indexOf(d.numero)===-1)marc.push(d.numero);
      salvarLocal();renderCart();renderGrid();verBingo();falarNumero(d.numero);
    });
    sock.on('alerta_jogador',function(d){
      var box=document.getElementById('alertaBox');
      box.textContent=d.texto;box.className=d.tipo==='bingo'?'alerta-bingo':'alerta-quase';box.style.display='block';
      if(d.tipo!=='bingo')setTimeout(function(){box.style.display='none';},5000);
    });
    sock.on('bingo_confirmado',function(d){
      var b=document.createElement('div');b.className='bingo-banner';
      b.innerHTML='<span class="bb-icon">🎊</span><div class="bb-title">BINGO!</div><div class="bb-sub">Vencedor: '+d.vencedor.nome+'</div>';
      document.getElementById('t3').insertBefore(b,document.getElementById('t3').firstChild);
    });
  }
};
renderGrid();
<\/script>
</body>
</html>`);
});

const salas = {};

function gerarCodigo(){
  const l='ABCDEFGHJKLMNPQRSTUVWXYZ',n='23456789';let c='';
  for(let i=0;i<3;i++)c+=l[Math.floor(Math.random()*l.length)];
  for(let i=0;i<3;i++)c+=n[Math.floor(Math.random()*n.length)];
  return c;
}
function gerarCartela75(){
  const faixas=[[1,15],[16,30],[31,45],[46,60],[61,75]];const cartela=[];
  for(let col=0;col<5;col++){
    const[min,max]=faixas[col];const pool=Array.from({length:max-min+1},(_,i)=>i+min);const e=[];
    for(let row=0;row<5;row++){const idx=Math.floor(Math.random()*pool.length);e.push(pool.splice(idx,1)[0]);}
    cartela.push(e);
  }
  return Array.from({length:5},(_,row)=>Array.from({length:5},(_,col)=>(row===2&&col===2?'FREE':cartela[col][row])));
}
function gerarBolao(sala,qtd){
  return Array.from({length:qtd},(_,i)=>({
    id:`${sala}-${i+1}`,numero:i+1,grid:gerarCartela75(),
    marcados:[[false,false,false,false,false],[false,false,false,false,false],[false,false,true,false,false],[false,false,false,false,false],[false,false,false,false,false]],
  }));
}
function validarBingo(cartela,sorteados){
  const g=cartela.grid,m=cartela.marcados;
  for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(sorteados.includes(g[r][c])||(r===2&&c===2))m[r][c]=true;
  for(let i=0;i<5;i++){if(m[i].every(Boolean))return true;if(m.every(row=>row[i]))return true;}
  if([0,1,2,3,4].every(i=>m[i][i]))return true;
  if([0,1,2,3,4].every(i=>m[i][4-i]))return true;
  return false;
}
function sorteiarNumero(sala){
  const s=salas[sala];if(!s||!s.ativa)return null;
  const rest=s.numeros.filter(n=>!s.sorteados.includes(n));if(!rest.length)return null;
  const num=rest[Math.floor(Math.random()*rest.length)];s.sorteados.push(num);
  return{numero:num,coluna:'BINGO'[Math.floor((num-1)/15)],sorteados:s.sorteados};
}

io.on('connection',(socket)=>{
  console.log(`[+] ${socket.id}`);

  socket.on('reconectar_adm',({codigo},cb)=>{
    const s=salas[codigo];if(!s)return cb({ok:false});
    s.adm.socketId=socket.id;socket.join(codigo);socket.data.sala=codigo;socket.data.papel='adm';
    console.log(`[RECONEXAO] ADM ${codigo}`);cb({ok:true});
  });

  socket.on('criar_sala',({nomeAdm,valorCartela,chavePix,quantidadeCartelas,horario},cb)=>{
    let codigo;do{codigo=gerarCodigo();}while(salas[codigo]);
    const cartelas=gerarBolao(codigo,quantidadeCartelas||100);
    salas[codigo]={codigo,adm:{socketId:socket.id,nome:nomeAdm},jogadores:{},cartelas,cartelasVendidas:{},solicitacoes:{},
      numeros:Array.from({length:75},(_,i)=>i+1),sorteados:[],ativa:false,
      valorCartela:valorCartela||0,chavePix:chavePix||'',horario:horario||'',vencedor:null};
    socket.join(codigo);socket.data.sala=codigo;socket.data.papel='adm';
    console.log(`[SALA] ${codigo} por ${nomeAdm}`);cb({ok:true,codigo,cartelas:cartelas.length});
  });

  socket.on('entrar_sala',({codigo,nomeJogador},cb)=>{
    const s=salas[codigo?.toUpperCase()];
    if(!s)return cb({ok:false,erro:'Sala não encontrada'});
    if(s.vencedor)return cb({ok:false,erro:'Jogo já encerrado'});
    const jid=socket.id;s.jogadores[jid]={nome:nomeJogador,socketId:socket.id};
    socket.join(codigo.toUpperCase());socket.data.sala=codigo.toUpperCase();socket.data.papel='jogador';
    io.to(s.adm.socketId).emit('jogador_entrou',{jogadorId:jid,nome:nomeJogador,total:Object.keys(s.jogadores).length});
    cb({ok:true,sorteados:s.sorteados,ativa:s.ativa,valorCartela:s.valorCartela,chavePix:s.chavePix,horario:s.horario});
  });

  socket.on('solicitar_cartela',({codigo,dados},cb)=>{
    const s=salas[codigo];if(!s)return cb({ok:false,erro:'Sala não encontrada'});
    if(s.ativa)return cb({ok:false,erro:'Jogo já em andamento'});
    const jid=socket.id,cj=s.cartelasVendidas[jid]||[];
    if(cj.length>=3)return cb({ok:false,erro:'Máximo de 3 cartelas!'});
    const sol=s.solicitacoes[jid];
    if(sol&&sol.status==='pendente')return cb({ok:false,erro:'Você já tem uma solicitação pendente.'});
    s.solicitacoes[jid]={jogadorId:jid,nome:dados.nome||s.jogadores[jid]?.nome||'Jogador',
      cpf:dados.cpf,celular:dados.celular,chavePix:dados.chavePix,email:dados.email||'',
      status:'pendente',timestamp:Date.now(),cartelasJaTem:cj.length};
    io.to(s.adm.socketId).emit('nova_solicitacao',{jogadorId:jid,nome:s.solicitacoes[jid].nome,
      cpf:dados.cpf,celular:dados.celular,chavePix:dados.chavePix,email:dados.email||'',
      cartelasJaTem:cj.length,timestamp:Date.now()});
    cb({ok:true,mensagem:'Solicitação enviada!'});
  });

  socket.on('aprovar_cartela',({codigo,jogadorId},cb)=>{
    const s=salas[codigo];if(!s||s.adm.socketId!==socket.id)return cb({ok:false,erro:'Não autorizado'});
    const sol=s.solicitacoes[jogadorId];if(!sol)return cb({ok:false,erro:'Solicitação não encontrada'});
    const disp=s.cartelas.filter(c=>!Object.values(s.cartelasVendidas).flat().find(v=>v.id===c.id));
    if(!disp.length)return cb({ok:false,erro:'Sem cartelas disponíveis'});
    const cartela=disp[0];
    s.cartelasVendidas[jogadorId]=[...(s.cartelasVendidas[jogadorId]||[]),cartela];
    s.solicitacoes[jogadorId].status='aprovado';
    io.to(jogadorId).emit('cartela_aprovada',{cartela,sorteados:s.sorteados,horario:s.horario||'',mensagem:'✅ Cartela liberada!'});
    cb({ok:true});
  });

  socket.on('rejeitar_cartela',({codigo,jogadorId,motivo},cb)=>{
    const s=salas[codigo];if(!s||s.adm.socketId!==socket.id)return cb({ok:false,erro:'Não autorizado'});
    const sol=s.solicitacoes[jogadorId];if(!sol)return cb({ok:false,erro:'Solicitação não encontrada'});
    s.solicitacoes[jogadorId].status='rejeitado';
    io.to(jogadorId).emit('cartela_rejeitada',{mensagem:motivo||'❌ Pagamento não confirmado.'});
    cb({ok:true});
  });

  socket.on('sortear',({codigo},cb)=>{
    const s=salas[codigo];if(!s||s.adm.socketId!==socket.id)return cb({ok:false});
    if(!s.ativa)s.ativa=true;
    const res=sorteiarNumero(codigo);if(!res)return cb({ok:false,erro:'Sem números restantes'});
    io.to(codigo).emit('numero_sorteado',res);
    Object.entries(s.cartelasVendidas).forEach(([jid,cartelas])=>{
      cartelas.forEach(cartela=>{
        let marc=0,tot=0;
        for(let r=0;r<5;r++)for(let c=0;c<5;c++){const v=cartela.grid[r][c];if(v==='FREE'){marc++;tot++;}else{tot++;if(s.sorteados.includes(v))marc++;}}
        const nome=s.jogadores[jid]?.nome||'Jogador';
        if(marc===tot-1)io.to(codigo).emit('alerta_jogador',{nome,tipo:'quase',texto:'🔥 '+nome+' está quase ganhando!'});
        if(marc===tot)io.to(codigo).emit('alerta_jogador',{nome,tipo:'bingo',texto:'🎉 '+nome+' completou a cartela!'});
      });
    });
    cb({ok:true,...res});
  });

  socket.on('gritar_bingo',({codigo,cartelaId},cb)=>{
    const s=salas[codigo];if(!s||!s.ativa||s.vencedor)return cb({ok:false});
    const jid=socket.id,cj=s.cartelasVendidas[jid]||[];
    const cartela=cj.find(c=>c.id===cartelaId);if(!cartela)return cb({ok:false,erro:'Cartela não encontrada'});
    if(!validarBingo(cartela,s.sorteados))return cb({ok:false,erro:'Bingo inválido'});
    s.vencedor={jogadorId:jid,nome:s.jogadores[jid]?.nome,cartelaId};s.ativa=false;
    io.to(codigo).emit('bingo_confirmado',{vencedor:s.vencedor,sorteados:s.sorteados});
    cb({ok:true});
  });

  socket.on('iniciar_jogo',({codigo},cb)=>{
    const s=salas[codigo];if(!s||s.adm.socketId!==socket.id)return cb({ok:false});
    s.ativa=true;io.to(codigo).emit('jogo_iniciado',{valorCartela:s.valorCartela});cb({ok:true});
  });

  socket.on('status_sala',({codigo},cb)=>{
    const s=salas[codigo];if(!s)return cb({ok:false});
    cb({ok:true,jogadores:Object.values(s.jogadores).map(j=>j.nome),sorteados:s.sorteados,
      ativa:s.ativa,vencedor:s.vencedor,
      solicitacoesPendentes:Object.values(s.solicitacoes).filter(x=>x.status==='pendente').length});
  });

  socket.on('disconnect',()=>{
    const{sala,papel}=socket.data||{};if(!sala||!salas[sala])return;
    if(papel==='adm'){io.to(sala).emit('adm_desconectado');console.log(`[WARN] ADM ${sala} desconectou`);}
    else{
      const jog=salas[sala]?.jogadores[socket.id];
      if(jog){
        const nome=jog.nome;delete salas[sala].jogadores[socket.id];
        io.to(salas[sala].adm.socketId).emit('jogador_saiu',{nome,total:Object.keys(salas[sala].jogadores).length});
      }
    }
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Lux Bingo Server rodando na porta ${PORT} 🎱`));