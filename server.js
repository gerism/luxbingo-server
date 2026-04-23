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
<title>Lux Bingo</title>
<link rel="icon" type="image/png" href="/icon.png">
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.min.js"><\/script>
<style>
:root{--navy:#0d1b2e;--navy2:#1a2d4e;--gold:#c9a227;--gold2:#f0c040;--gold3:#ffd966;--card:#0f2240;--text:#e8d5a3;--textl:rgba(232,213,163,.6)}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:'Segoe UI',sans-serif;background:var(--navy);color:var(--text);overflow:hidden;width:100vw;height:100vh}
.tela{display:none;flex-direction:column;align-items:center;width:100vw;height:100vh;overflow-y:auto;padding:20px 16px 40px}
.tela.ativo{display:flex}
.logo-img{width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);box-shadow:0 0 20px rgba(201,162,39,.4);margin-bottom:6px}
.logo-title{font-size:22px;font-weight:900;color:var(--gold2);letter-spacing:4px;margin-bottom:2px}
.logo-sub{font-size:10px;color:var(--textl);letter-spacing:2px;margin-bottom:16px}
.card{background:var(--card);border:1px solid rgba(201,162,39,.2);border-radius:14px;padding:16px;width:100%;max-width:400px;margin-bottom:10px}
.ct{font-size:10px;font-weight:900;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px}
.lbl{font-size:10px;color:var(--textl);font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;display:block}
.inp{width:100%;background:rgba(255,255,255,.05);border:1.5px solid rgba(201,162,39,.3);border-radius:10px;padding:11px;color:var(--gold2);font-size:14px;outline:none;margin-bottom:10px;font-family:inherit}
.inp::placeholder{color:var(--textl)}
.inp:focus{border-color:var(--gold2)}
.btn-g{width:100%;padding:13px;background:linear-gradient(135deg,var(--gold),var(--gold2));border:none;border-radius:12px;font-size:14px;font-weight:900;color:var(--navy);letter-spacing:2px;cursor:pointer;margin-bottom:8px}
.btn-b{width:100%;padding:11px;background:transparent;border:2px solid rgba(201,162,39,.4);border-radius:12px;font-size:13px;font-weight:900;color:var(--gold2);cursor:pointer;margin-bottom:8px}
.info-box{background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.3);border-radius:10px;padding:8px 14px;margin-bottom:12px;text-align:center;width:100%;max-width:400px}
.info-cod{font-size:11px;color:var(--textl);letter-spacing:2px}
.aguard{text-align:center;padding:20px 16px;background:rgba(201,162,39,.08);border:2px solid rgba(201,162,39,.3);border-radius:14px;margin-bottom:10px;width:100%;max-width:400px}
.aguard-icon{font-size:36px;display:block;margin-bottom:8px}
.aguard-title{font-size:16px;font-weight:900;color:var(--gold2)}
.aguard-sub{font-size:11px;color:var(--textl);margin-top:5px;line-height:1.5}
.pix-val{font-size:28px;font-weight:900;color:var(--gold2);text-align:center;margin:6px 0}
.pix-chave{font-size:13px;font-weight:900;color:var(--gold2);padding:8px;background:rgba(255,255,255,.05);border:1px solid rgba(201,162,39,.3);border-radius:8px;word-break:break-all;text-align:center}
.tela-jogo{display:none;flex-direction:column;width:100vw;height:100vh;overflow:hidden}
.tela-jogo.ativo{display:flex}
.yt-wrap{width:100%;background:#000;flex-shrink:0;position:relative}
.yt-wrap iframe{width:100%;display:block;border:none}
.info-bar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(0,0,0,.5);border-bottom:1px solid rgba(201,162,39,.2);flex-shrink:0}
.num-atual{font-size:32px;font-weight:900;color:var(--gold2);min-width:44px;text-align:center;line-height:1}
.num-lbl{font-size:7px;color:var(--textl);text-transform:uppercase;letter-spacing:1px;display:block}
.ng90{display:grid;grid-template-columns:repeat(15,1fr);flex:1;gap:1px}
.nm90{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:2px;background:rgba(255,255,255,.04);font-size:6px;font-weight:700;color:rgba(232,213,163,.3)}
.nm90.s{background:rgba(201,162,39,.25);color:var(--gold)}
.nm90.u{background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--navy)}
.cartelas-area{flex:1;overflow:hidden;display:flex;flex-direction:column}
.cartelas-tabs{display:flex;gap:4px;padding:6px 10px 0;flex-shrink:0}
.tab-btn{padding:4px 12px;border-radius:20px;font-size:10px;font-weight:900;cursor:pointer;border:1.5px solid rgba(201,162,39,.3);background:transparent;color:var(--textl);font-family:inherit}
.tab-btn.ok{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:transparent;color:var(--navy)}
.cartelas-scroll{flex:1;overflow-y:auto;padding:6px 10px 10px}
.cartela-card{background:var(--card);border:2px solid rgba(201,162,39,.3);border-radius:12px;overflow:hidden;margin-bottom:8px}
.cartela-header{background:linear-gradient(135deg,#0a1628,var(--navy2));border-bottom:2px solid var(--gold);padding:6px 10px;display:flex;align-items:center;justify-content:space-between}
.cartela-titulo{font-size:11px;font-weight:900;color:var(--gold2);letter-spacing:1px}
.cartela-num{font-size:10px;color:var(--textl)}
.letras-row{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:4px 6px 0}
.letra{text-align:center;font-size:14px;font-weight:900;color:var(--gold);padding:2px 0}
.grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:3px 6px 6px}
.cel{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px;background:rgba(255,255,255,.05);border:1.5px solid rgba(201,162,39,.2);font-size:14px;font-weight:900;color:var(--text);cursor:pointer;user-select:none}
.cel.marc{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold3);color:var(--navy)}
.cel.free{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold3);color:var(--navy);cursor:default}
.bingo-btn{width:100%;padding:10px;background:linear-gradient(135deg,#2ecc71,#27ae60);border:none;border-radius:0 0 10px 10px;font-size:14px;font-weight:900;color:#fff;letter-spacing:2px;cursor:pointer;display:none}
.alerta-quase{background:rgba(201,162,39,.15);border:2px solid var(--gold);color:var(--gold2);border-radius:10px;padding:8px 10px;text-align:center;font-weight:900;font-size:11px;margin:4px 10px}
.alerta-bingo{background:rgba(46,204,113,.15);border:2px solid #2ecc71;color:#2ecc71;border-radius:10px;padding:8px 10px;text-align:center;font-weight:900;font-size:11px;margin:4px 10px}
.bingo-banner{background:linear-gradient(135deg,var(--gold),var(--gold2));border-radius:10px;padding:12px;text-align:center;margin:4px 10px}
.bb-icon{font-size:28px;display:block;margin-bottom:2px}
.bb-title{font-size:15px;font-weight:900;color:var(--navy);letter-spacing:2px}
.bb-sub{font-size:10px;color:rgba(13,27,46,.7);margin-top:2px}
.bottom-bar{display:flex;gap:6px;padding:6px 10px 10px;flex-shrink:0;border-top:1px solid rgba(201,162,39,.15)}
.btn-audio{flex:1;padding:9px;background:transparent;border:1.5px solid rgba(201,162,39,.4);border-radius:10px;font-size:11px;font-weight:900;color:var(--gold2);cursor:pointer;font-family:inherit}
.btn-mais{flex:1;padding:9px;background:rgba(201,162,39,.1);border:1.5px solid rgba(201,162,39,.3);border-radius:10px;font-size:11px;font-weight:900;color:var(--gold2);cursor:pointer;font-family:inherit}
.toast{position:fixed;top:10px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--navy);padding:8px 18px;border-radius:50px;font-weight:900;font-size:11px;z-index:999;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
.toast.on{opacity:1}
.toast.err{background:#e74c3c;color:#fff}
.divider{display:flex;align-items:center;gap:8px;margin:4px 0 10px;width:100%;max-width:400px}
.divider-line{flex:1;height:1px;background:rgba(201,162,39,.2)}
.divider-txt{font-size:10px;color:var(--textl);font-weight:700;letter-spacing:1px}
.qt-btn{flex:1;padding:10px 4px;border:1.5px solid rgba(201,162,39,.3);border-radius:9px;font-size:13px;font-weight:900;color:var(--textl);background:transparent;cursor:pointer;font-family:inherit}
.qt-btn.ok{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:transparent;color:var(--navy)}
</style>
</head>
<body>
<div class="toast" id="toast"></div>
<div class="tela ativo" id="t1">
  <img src="${LOGO}" class="logo-img">
  <div class="logo-title">LUX BINGO</div>
  <div class="logo-sub">JOGO AO VIVO</div>
  <div class="info-box"><div class="info-cod">SALA: ${codigo}</div></div>
  <div class="card">
    <div class="ct">🔑 Já tem cartela?</div>
    <label class="lbl">Código da sua cartela</label>
    <input class="inp" id="iCodCart" type="text" placeholder="Ex: ABC123-1" style="text-transform:uppercase">
    <button class="btn-b" id="btnRecuperar">RECUPERAR CARTELA →</button>
  </div>
  <div class="divider"><div class="divider-line"></div><div class="divider-txt">OU SOLICITAR NOVA</div><div class="divider-line"></div></div>
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
    <label class="lbl">Quantidade de cartelas</label>
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button class="qt-btn ok" data-q="1">1</button>
      <button class="qt-btn" data-q="2">2</button>
      <button class="qt-btn" data-q="3">3</button>
      <button class="qt-btn" data-q="4">4</button>
      <button class="qt-btn" data-q="5">5</button>
    </div>
    <button class="btn-g" id="btnConectar">SOLICITAR CARTELA →</button>
  </div>
</div>
<div class="tela" id="t2">
  <img src="${LOGO}" class="logo-img">
  <div class="logo-title">LUX BINGO</div>
  <div class="logo-sub">JOGO AO VIVO</div>
  <div class="aguard">
    <span class="aguard-icon">⏳</span>
    <div class="aguard-title">AGUARDANDO APROVAÇÃO</div>
    <div class="aguard-sub">O sorteador está verificando seu pagamento.<br>Sua cartela será liberada em breve!</div>
  </div>
  <div class="card" style="max-width:400px">
    <div class="ct" style="text-align:center">💳 REALIZE O PAGAMENTO</div>
    <div style="font-size:11px;color:var(--textl);text-align:center;margin-bottom:4px">Valor da cartela:</div>
    <div class="pix-val" id="pValor">R$ --</div>
    <div style="font-size:11px;color:var(--textl);text-align:center;margin:8px 0 6px">Chave Pix do sorteador:</div>
    <div class="pix-chave" id="pChave">--</div>
    <div id="pHorario" style="display:none;font-size:12px;font-weight:700;color:var(--gold2);margin-top:8px;padding:7px;background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.3);border-radius:8px;text-align:center"></div>
    <div style="font-size:10px;color:var(--textl);text-align:center;margin-top:8px">Após pagar aguarde a confirmação</div>
  </div>
</div>
<div class="tela" id="t4">
  <img src="${LOGO}" class="logo-img">
  <div class="card" style="max-width:400px;text-align:center;padding:24px">
    <div style="font-size:44px;margin-bottom:10px">❌</div>
    <div style="font-size:16px;font-weight:900;color:#e74c3c;margin-bottom:8px">Solicitação Rejeitada</div>
    <div style="font-size:12px;color:var(--textl);margin-bottom:16px" id="motivo">Pagamento não confirmado.</div>
    <button class="btn-b" id="btnVoltar">Tentar Novamente</button>
  </div>
</div>
<div class="tela-jogo" id="t3">
  <div class="yt-wrap" id="ytWrap" style="display:none">
    <iframe id="ytFrame" allowfullscreen allow="autoplay"></iframe>
  </div>
  <div class="info-bar">
    <div>
      <span class="num-lbl">Último</span>
      <div class="num-atual" id="nAtual">--</div>
    </div>
  </div>
  <div id="alertaBox" style="display:none"></div>
  <div id="bingoBox"></div>
  <div class="cartelas-area">
    <div class="cartelas-tabs" id="cartTabs"></div>
    <div class="cartelas-scroll" id="cartScroll">
      <div style="text-align:center;padding:30px 16px;color:var(--textl);font-size:12px" id="semCartela">
        ⏳ Aguardando cartela ser liberada...
      </div>
    </div>
  </div>
  <div class="bottom-bar">
    <button class="btn-audio" id="btnAudio">🔊 Áudio ON</button>
    <button class="btn-mais" id="btnMais" style="display:none"></button>
  </div>
</div>
<script>
var COD='${codigo}',SERVER=window.location.origin,sock=null;
var cartelas=[],marc={},nums=[],audioOn=true,tabAtiva=0;
var meuIdUnico = null;
try{meuIdUnico=localStorage.getItem('luxbingo_id_'+COD);}catch(e){}
function gerarIdUnico() {
  return 'jog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
var qtdCartelas=1;
document.addEventListener('click',function(e){
  if(e.target.classList.contains('qt-btn')){
    qtdCartelas=parseInt(e.target.dataset.q);
    document.querySelectorAll('.qt-btn').forEach(function(x){x.classList.remove('ok');});
    e.target.classList.add('ok');
  }
});
function tela(n){
  document.querySelectorAll('.tela,.tela-jogo').forEach(function(el){el.classList.remove('ativo');});
  document.getElementById('t'+n).classList.add('ativo');
}
function toast(m,e){
  var t=document.getElementById('toast');t.textContent=m;t.className='toast on'+(e?' err':'');
  setTimeout(function(){t.className='toast';},3000);
}
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
document.getElementById('iCodCart').oninput=function(){
  this.value=this.value.toUpperCase();
};
document.getElementById('btnRecuperar').onclick=function(){
  var cod=document.getElementById('iCodCart').value.trim().toUpperCase();
  if(!cod){toast('❌ Digite o código da cartela!',true);return;}
  var salvo=localStorage.getItem('luxbingo_cart_'+COD+'_'+cod);
  if(!salvo){toast('❌ Cartela não encontrada!',true);return;}
  try{
    var d=JSON.parse(salvo);
    cartelas=d.cartelas;marc=d.marc;nums=d.nums||[];
    conectarJogo(d.nome);
    tela(3);toast('✅ Cartela recuperada!');
  }catch(e){toast('❌ Erro ao recuperar!',true);}
};
document.getElementById('btnConectar').onclick=function(){
  var nome=document.getElementById('iNome').value.trim();
  var cpf=document.getElementById('iCpf').value.trim();
  var cel=document.getElementById('iCel').value.trim();
  var pix=document.getElementById('iPix').value.trim();
  var email=document.getElementById('iEmail').value.trim();
  if(!nome||!cpf||!cel||!pix){toast('❌ Preencha todos os campos!',true);return;}
  if(!meuIdUnico){
    meuIdUnico=gerarIdUnico();
    localStorage.setItem('luxbingo_id_'+COD,meuIdUnico);
  }
  // Se já conectado, só solicita cartela
  if(sock&&sock.connected){
    sock.emit('solicitar_cartela',{codigo:COD,idUnico:meuIdUnico,qtd:qtdCartelas,dados:{nome:nome,cpf:cpf,celular:cel,chavePix:pix,email:email}},function(r2){
      if(!r2.ok){toast('❌ '+(r2.erro||'Erro'),true);return;}
      tela(2);toast('✅ Solicitação enviada!');
    });
    return;
  }
  if(!meuIdUnico) {
    meuIdUnico = gerarIdUnico();
    localStorage.setItem('luxbingo_id_'+COD, meuIdUnico);
  }
 if(sock)sock.disconnect();
  sock=io(SERVER,{transports:['websocket']});
  registrarEventos(nome);
  sock.on('connect',function(){
    try{localStorage.setItem('luxbingo_nome_'+COD,nome);}catch(e){}
    sock.emit('entrar_sala',{codigo:COD,idUnico:meuIdUnico,nomeJogador:nome},function(r){
      if(!r.ok){toast('❌ '+(r.erro||'Erro'),true);sock.disconnect();return;}
      document.getElementById('pValor').textContent='R$ '+(r.valorCartela||'?');
      document.getElementById('pChave').textContent=r.chavePix||'--';
      if(r.horario){document.getElementById('pHorario').textContent='🕐 '+r.horario;document.getElementById('pHorario').style.display='block';}
      if(r.youtubeLink)setYoutube(r.youtubeLink);
      if(r.cartelasExistentes&&r.cartelasExistentes.length>0){
        cartelas=r.cartelasExistentes;
        nums=r.sorteados||[];
        cartelas.forEach(function(c){
          if(!marc[c.id])marc[c.id]=[];
          nums.forEach(function(n){if(marc[c.id].indexOf(Number(n))===-1)marc[c.id].push(Number(n));});
        });
        renderCartelas();renderGrid();tela(3);
        toast('✅ Cartelas carregadas!');return;
      }
      sock.emit('solicitar_cartela',{codigo:COD,idUnico:meuIdUnico,qtd:qtdCartelas,dados:{nome:nome,cpf:cpf,celular:cel,chavePix:pix,email:email}},function(r2){
        if(!r2.ok){toast('❌ '+(r2.erro||'Erro'),true);return;}
        tela(2);toast('✅ Solicitação enviada!');
      });
    });
  });
  sock.on('connect_error',function(){toast('❌ Erro de conexão!',true);});
};
function registrarEventos(nome){
  sock.on('cartela_aprovada',function(d){
    var novas=d.cartelas||[d.cartela];
    novas.forEach(function(cart){
      cartelas.push(cart);
      if(!marc[cart.id])marc[cart.id]=[];
      nums=d.sorteados||nums;
      nums.forEach(function(n){if(marc[cart.id].indexOf(n)===-1)marc[cart.id].push(n);});
    });
    // mostra códigos antes de abrir
    var codigos=novas.map(function(c){return c.id;}).join(', ');
    var msg='🎟️ Sua(s) cartela(s) foi liberada!\n\n';
    msg+='📋 CÓDIGO(S): '+codigos+'\n\n';
    msg+='⚠️ SALVE ESSE CÓDIGO! Você precisará dele para recuperar sua cartela caso saia do jogo.\n\nToque OK para abrir sua cartela.';
    alert(msg);
    if(d.youtubeLink)setYoutube(d.youtubeLink);
    mostrarYoutube();
    tela(3);
    document.getElementById('semCartela').style.display='none';
    salvarLocal(nome);renderCartelas();renderGrid();
    if(cartelas.length<5)document.getElementById('btnMais').style.display='block';
    else document.getElementById('btnMais').style.display='none';
    toast('🎉 Cartela '+cartelas.length+' liberada! Boa sorte!');
  });
  sock.on('cartela_rejeitada',function(d){
    document.getElementById('motivo').textContent=d.mensagem||'Pagamento não confirmado.';tela(4);
  });
  sock.on('numero_sorteado',function(d){
    nums=(d.sorteados||nums).map(Number);
    document.getElementById('nAtual').textContent=d.numero;
    cartelas.forEach(function(c){
      if(!marc[c.id])marc[c.id]=[];
      if(marc[c.id].indexOf(Number(d.numero))===-1)marc[c.id].push(Number(d.numero));
    });
    salvarLocal(localStorage.getItem('luxbingo_nome_'+COD)||'Jogador');
    renderCartelas();renderGrid();verBingo();falarNumero(d.numero);
  });
  sock.on('bingo_confirmado',function(d){
    var b=document.createElement('div');b.className='bingo-banner';
    b.innerHTML='<span class="bb-icon">🎊</span><div class="bb-title">BINGO!</div><div class="bb-sub">Vencedor: '+d.vencedor.nome+'</div>';
    document.getElementById('bingoBox').innerHTML='';document.getElementById('bingoBox').appendChild(b);
  });
  sock.on('alerta_jogador',function(d){
    var box=document.getElementById('alertaBox');
    box.textContent=d.texto;box.className=d.tipo==='bingo'?'alerta-bingo':'alerta-quase';box.style.display='block';
    if(d.tipo!=='bingo')setTimeout(function(){box.style.display='none';},5000);
  });
 sock.on('adm_desconectado',function(){toast('⚠️ Sorteador desconectou!');});
  sock.on('sorteio_zerado',function(){
    nums=[];marc={};
    cartelas.forEach(function(c){marc[c.id]=[];});
    document.getElementById('nAtual').textContent='--';
    var nome=localStorage.getItem('luxbingo_nome_'+COD)||'Jogador';
    salvarLocal(nome);
    renderCartelas();renderGrid();
    toast('🔄 Sorteio zerado pelo ADM!');
  });
  sock.on('cartelas_limpas',function(){
    var nome=localStorage.getItem('luxbingo_nome_'+COD)||'Jogador';
    var chave='luxbingo_'+COD+'_'+nome.replace(/\s/g,'_');
    cartelas.forEach(function(c){
      localStorage.removeItem('luxbingo_cart_'+COD+'_'+c.id);
    });
    localStorage.removeItem(chave);
    cartelas=[];marc={};nums=[];
    document.getElementById('nAtual').textContent='--';
    document.getElementById('semCartela').style.display='block';
    document.getElementById('cartTabs').innerHTML='';
    document.getElementById('cartScroll').innerHTML='';
    tela(1);
    toast('⚠️ Cartelas resetadas pelo ADM!');
  });
}
function conectarJogo(nome){
  if(!meuIdUnico) {
    meuIdUnico = localStorage.getItem('luxbingo_id_'+COD);
    if(!meuIdUnico) {
      meuIdUnico = gerarIdUnico();
      localStorage.setItem('luxbingo_id_'+COD, meuIdUnico);
    }
  }
  if(sock)sock.disconnect();
  sock=io(SERVER,{transports:['websocket']});
  sock.on('connect',function(){
    sock.emit('entrar_sala',{codigo:COD,idUnico:meuIdUnico,nomeJogador:nome},function(r){
      if(r&&r.ok){
        nums=r.sorteados||nums;
        if(r.youtubeLink)setYoutube(r.youtubeLink);
        if(r.cartelasExistentes && r.cartelasExistentes.length > 0) {
          cartelas = r.cartelasExistentes;
          cartelas.forEach(function(c){
            if(!marc[c.id]) marc[c.id] = [];
            nums.forEach(function(n){if(marc[c.id].indexOf(n)===-1)marc[c.id].push(n);});
          });
        }
        salvarLocal(nome);renderCartelas();renderGrid();verBingo();
      }
    });
  });
  registrarEventos(nome);
}
document.getElementById('btnMais').onclick=function(){
  if(!sock||cartelas.length>=5){toast('❌ Máximo de 5 cartelas!',true);return;}
  var nome=localStorage.getItem('luxbingo_nome_'+COD)||'Jogador';
  sock.emit('solicitar_cartela',{codigo:COD,idUnico:meuIdUnico,dados:{nome:nome,cpf:'',celular:'',chavePix:'',email:''}},function(r){
    if(!r.ok){toast('❌ '+(r.erro||'Erro'),true);return;}
    toast('✅ Solicitação de cartela '+(cartelas.length+1)+' enviada!');
  });
};
document.getElementById('btnVoltar').onclick=function(){tela(1);};
document.getElementById('btnAudio').onclick=function(){
  audioOn=!audioOn;this.textContent=audioOn?'🔊 Áudio ON':'🔇 Áudio OFF';
  this.style.borderColor=audioOn?'rgba(201,162,39,.4)':'rgba(231,76,60,.5)';
  this.style.color=audioOn?'var(--gold2)':'#e74c3c';
};
var ytVid='';
function setYoutube(link){
  if(!link)return;
  var m=link.match(/(?:youtu\\.be\\/|v=|live\\/|shorts\\/)([\\w-]{11})/);
  if(!m){var m2=link.match(/youtube\\.com\\/([\\w-]{11})/);if(m2)m=m2;}
  if(m)ytVid=m[1];
}
function mostrarYoutube(){
  if(!ytVid)return;
  var wrap=document.getElementById('ytWrap');
  var frame=document.getElementById('ytFrame');
  var h=Math.round(window.innerWidth*9/16);
  wrap.style.display='block';
  frame.style.height=h+'px';
  frame.src='https://www.youtube.com/embed/'+ytVid+'?autoplay=1&mute=0';
}
function renderGrid(){
  var g=document.getElementById('nGrid');g.innerHTML='';var u=nums[nums.length-1];
  for(var i=1;i<=90;i++){
    var d=document.createElement('div');
    d.className='nm90'+(nums.indexOf(i)!==-1?(i===u?' u':' s'):'');
    d.textContent=i;g.appendChild(d);
  }
}
function renderCartelas(){
  if(!cartelas.length)return;
  var tabs=document.getElementById('cartTabs');tabs.innerHTML='';
  cartelas.forEach(function(c,i){
    var b=document.createElement('button');b.className='tab-btn'+(i===tabAtiva?' ok':'');
    b.textContent='Cartela '+(i+1);
    (function(idx){b.onclick=function(){tabAtiva=idx;renderCartelas();};})(i);
    tabs.appendChild(b);
  });
  var scroll=document.getElementById('cartScroll');scroll.innerHTML='';
  var c=cartelas[tabAtiva];
  var m=marc[c.id]||[];
  var div=document.createElement('div');div.className='cartela-card';
  div.innerHTML='<div class="cartela-header"><div class="cartela-titulo">🎟️ CARTELA '+(tabAtiva+1)+'</div><div class="cartela-num">'+c.id+'</div></div>';
  var letRow=document.createElement('div');letRow.className='letras-row';
  ['B','I','N','G','O'].forEach(function(l){var s=document.createElement('div');s.className='letra';s.textContent=l;letRow.appendChild(s);});
  div.appendChild(letRow);
  var grid=document.createElement('div');grid.className='grid5';
  for(var r=0;r<5;r++)for(var col=0;col<5;col++){
    var v=c.grid[r][col];var el=document.createElement('div');
    if(v==='FREE'){el.className='cel free';el.innerHTML='⭐';}
    else{
      el.className='cel'+(m.indexOf(v)!==-1||m.indexOf(String(v))!==-1||m.indexOf(Number(v))!==-1?' marc':'');
      el.textContent=v;
      (function(val,cid,e){e.onclick=function(){
        var arr=marc[cid]||[];var i=arr.indexOf(val);
        if(i===-1)arr.push(val);else arr.splice(i,1);
        marc[cid]=arr;renderCartelas();verBingo();
        salvarLocal(localStorage.getItem('luxbingo_nome_'+COD)||'Jogador');
      };})(v,c.id,el);
    }
    grid.appendChild(el);
  }
  div.appendChild(grid);
  var btnB=document.createElement('button');btnB.className='bingo-btn';btnB.textContent='🎉 GRITAR BINGO!';
  btnB.id='bBtn_'+tabAtiva;
  (function(cid){btnB.onclick=function(){
    if(!sock)return;
    sock.emit('gritar_bingo',{codigo:COD,cartelaId:cid},function(r){
      if(r.ok)toast('🎉 BINGO confirmado!');else toast('❌ '+r.erro,true);
    });
  };})(c.id);
  div.appendChild(btnB);
  scroll.appendChild(div);
  verBingoCartela(c,m,btnB);
  document.getElementById('semCartela').style.display='none';
}
function verBingoCartela(c,m,btn){
  var ok=true;
  for(var r=0;r<5;r++)for(var col=0;col<5;col++){
    var v=c.grid[r][col];if(v!=='FREE'&&m.indexOf(v)===-1){ok=false;break;}
  }
  if(btn)btn.style.display=ok?'block':'none';
}
function verBingo(){
  cartelas.forEach(function(c,i){
    var m=marc[c.id]||[];
    var btn=document.getElementById('bBtn_'+i);
    if(btn)verBingoCartela(c,m,btn);
  });
}
function falarNumero(num){
  if(!audioOn||!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  var m1=new SpeechSynthesisUtterance('Número '+num);m1.lang='pt-BR';m1.rate=0.9;m1.volume=1;
  var m2=new SpeechSynthesisUtterance('Número '+num);m2.lang='pt-BR';m2.rate=0.9;m2.volume=1;
  window.speechSynthesis.speak(m1);m1.onend=function(){setTimeout(function(){window.speechSynthesis.speak(m2);},800);};
}
function salvarLocal(nome){
  if(!cartelas.length)return;
  try{
    var chave='luxbingo_'+COD+'_'+nome.replace(/\\s/g,'_');
    var dados=JSON.stringify({cartelas:cartelas,marc:marc,nums:nums,nome:nome});
    localStorage.setItem(chave,dados);
    cartelas.forEach(function(c){
      localStorage.setItem('luxbingo_cart_'+COD+'_'+c.id,dados);
    });
  }catch(e){console.log('salvarLocal erro:',e.message);}
}
window.onload=function(){
  renderGrid();
  var nome=localStorage.getItem('luxbingo_nome_'+COD);
  if(nome){
    var chave='luxbingo_'+COD+'_'+nome.replace(/\\s/g,'_');
    var salvo=localStorage.getItem(chave);
    if(salvo){
      try{
        var d=JSON.parse(salvo);
        cartelas=d.cartelas||[];marc=d.marc||{};nums=d.nums||[];
        if(cartelas.length){
          conectarJogo(nome);
          renderCartelas();renderGrid();tela(3);
          toast('✅ Sessão restaurada!');return;
        }
      }catch(e){}
    }
  }
};
<\/script>
</body>
</html>`);
});

const salas = {};
const fs = require('fs');
const SALAS_FILE = '/tmp/salas.json';
function salvarSalas(){
  try{fs.writeFileSync(SALAS_FILE,JSON.stringify(salas));}catch(e){console.log('[SAVE ERROR]',e.message);}
}
try{
  if(fs.existsSync(SALAS_FILE)){
    const d=JSON.parse(fs.readFileSync(SALAS_FILE,'utf8'));
    Object.assign(salas,d);
    console.log('[RESTORE] Salas:',Object.keys(salas));
  }
}catch(e){console.log('[LOAD ERROR]',e.message);}

function gerarCodigo() {
  const l = 'ABCDEFGHJKLMNPQRSTUVWXYZ', n = '23456789';
  let c = '';
  for (let i = 0; i < 3; i++) c += l[Math.floor(Math.random() * l.length)];
  for (let i = 0; i < 3; i++) c += n[Math.floor(Math.random() * n.length)];
  return c;
}

function gerarCartela90(usados) {
  const grid = [];
  const numeros = [];
  let tentativas = 0;
  while (numeros.length < 24 && tentativas < 1000) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (numeros.indexOf(n) === -1 && usados.indexOf(n) === -1) numeros.push(n);
    tentativas++;
  }
  while (numeros.length < 24) {
    const n = Math.floor(Math.random() * 90) + 1;
    if (numeros.indexOf(n) === -1) numeros.push(n);
  }
  for (let i = numeros.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
  }
  let idx = 0;
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 5; c++) {
      if (r === 2 && c === 2) row.push('FREE');
      else row.push(numeros[idx++]);
    }
    grid.push(row);
  }
  return grid;
}

function gerarBolao(sala, qtd) {
  const cartelas = [];
  const usados = [];
  for (let i = 0; i < qtd; i++) {
    const grid = gerarCartela90(usados);
    grid.forEach(row => row.forEach(v => { if (v !== 'FREE' && usados.indexOf(v) === -1) usados.push(v); }));
    cartelas.push({ id: `${sala}-${i + 1}`, numero: i + 1, grid });
  }
  return cartelas;
}

function validarBingo(cartela, sorteados) {
  const g = cartela.grid;
  const m = g.map(row => row.map(v => v === 'FREE' || sorteados.includes(v)));
  for (let i = 0; i < 5; i++) {
    if (m[i].every(Boolean)) return true;
    if (m.every(row => row[i])) return true;
  }
  if ([0, 1, 2, 3, 4].every(i => m[i][i])) return true;
  if ([0, 1, 2, 3, 4].every(i => m[i][4 - i])) return true;
  return false;
}

function sorteiarNumero(sala) {
  const s = salas[sala];
  if (!s || !s.ativa) return null;
  const rest = s.numeros.filter(n => !s.sorteados.includes(n));
  if (!rest.length) return null;
  const num = rest[Math.floor(Math.random() * rest.length)];
  s.sorteados.push(num);
  return { numero: num, sorteados: s.sorteados };
}

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('reconectar_adm', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s) return cb && cb({ ok: false });
    s.adm.socketId = socket.id;
    socket.join(codigo);
    socket.data.sala = codigo;
    socket.data.papel = 'adm';
    console.log(`[RECONEXAO] ADM ${codigo}`);
    cb && cb({ ok: true });
  });

  socket.on('criar_sala', ({ nomeAdm, admId, valorCartela, chavePix, quantidadeCartelas, horario, youtubeLink }, cb) => {
    console.log('[DEBUG] criar_sala recebido:', { nomeAdm, valorCartela, chavePix, quantidadeCartelas, horario, youtubeLink });
    
    if (!nomeAdm) {
      return cb({ ok: false, erro: 'Nome do administrador é obrigatório' });
    }
    if (!valorCartela && valorCartela !== 0) {
      return cb({ ok: false, erro: 'Valor da cartela é obrigatório' });
    }
    if (!chavePix) {
      return cb({ ok: false, erro: 'Chave Pix é obrigatória' });
    }
    
    // usa admId como código fixo, ou gera novo se não tiver
    let codigo = admId || gerarCodigo();
    // se sala já existe, atualiza configurações mantendo cartelas vendidas
    if (salas[codigo]) {
      salas[codigo].valorCartela = parseFloat(valorCartela) || 0;
      salas[codigo].chavePix = chavePix || '';
      salas[codigo].horario = horario || '';
      salas[codigo].youtubeLink = youtubeLink || '';
      salas[codigo].adm.socketId = socket.id;
      salas[codigo].adm.nome = nomeAdm;
      socket.join(codigo);
      socket.data.sala = codigo;
      socket.data.papel = 'adm';
      salvarSalas();
      cb({ ok: true, codigo, cartelas: salas[codigo].cartelas.length });
      return;
    }
    
    const cartelas = gerarBolao(codigo, quantidadeCartelas || 100);
    
    salas[codigo] = {
      codigo, 
      adm: { socketId: socket.id, nome: nomeAdm },
      jogadoresPorIdUnico: {},
      jogadoresPorSocket: {},
      cartelas, 
      cartelasVendidasPorIdUnico: {},
      solicitacoes: {},
      numeros: Array.from({ length: 90 }, (_, i) => i + 1),
      sorteados: [], 
      ativa: false,
      valorCartela: parseFloat(valorCartela) || 0, 
      chavePix: chavePix || '',
      horario: horario || '', 
      youtubeLink: youtubeLink || '',
      vencedor: null
    };
    
    socket.join(codigo);
    socket.data.sala = codigo;
    socket.data.papel = 'adm';
    
    console.log(`✅ SALA CRIADA: ${codigo} por ${nomeAdm}`);
    cb({ ok: true, codigo, cartelas: cartelas.length });
  });

  socket.on('entrar_sala', ({ codigo, idUnico, nomeJogador }, cb) => {
    const s = salas[codigo?.toUpperCase()];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    if (s.vencedor) return cb({ ok: false, erro: 'Jogo já encerrado' });
    
    const socketId = socket.id;
    
    if (s.jogadoresPorIdUnico[idUnico]) {
      const oldSocketId = s.jogadoresPorIdUnico[idUnico].socketId;
      delete s.jogadoresPorSocket[oldSocketId];
      s.jogadoresPorIdUnico[idUnico].socketId = socketId;
      s.jogadoresPorSocket[socketId] = idUnico;
    } else {
      s.jogadoresPorIdUnico[idUnico] = { socketId, nome: nomeJogador };
      s.jogadoresPorSocket[socketId] = idUnico;
    }
    
    socket.join(codigo.toUpperCase());
    socket.data.sala = codigo.toUpperCase();
    socket.data.papel = 'jogador';
    socket.data.idUnico = idUnico;
    
    io.to(s.adm.socketId).emit('jogador_entrou', {
      idUnico: idUnico,
      nome: nomeJogador,
      total: Object.keys(s.jogadoresPorIdUnico).length
    });
    
    // Entregar cartela pendente se existir
    if (s.pendingCartelas && s.pendingCartelas[idUnico]) {
      const payload = s.pendingCartelas[idUnico];
      delete s.pendingCartelas[idUnico];
      setTimeout(() => socket.emit('cartela_aprovada', payload), 500);
      console.log('[ENTRAR] entregando pendente para idUnico:',idUnico);
    }
    const cartelasExistentes = s.cartelasVendidasPorIdUnico[idUnico] || [];
    
    cb({
      ok: true,
      sorteados: s.sorteados,
      ativa: s.ativa,
      valorCartela: s.valorCartela,
      chavePix: s.chavePix,
      horario: s.horario,
      youtubeLink: s.youtubeLink,
      cartelasExistentes: cartelasExistentes
    });
  });

  socket.on('solicitar_cartela', ({ codigo, idUnico, qtd, dados }, cb) => {
    const s = salas[codigo];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    
    const cj = s.cartelasVendidasPorIdUnico[idUnico] || [];
    if (cj.length >= 5) return cb({ ok: false, erro: 'Máximo de 5 cartelas!' });
    
  const sol = s.solicitacoes[idUnico];
    if (sol && sol.status === 'pendente') return cb({ ok: false, erro: 'Você já tem uma solicitação pendente.' });
    if (sol && sol.status === 'aprovado') {
      // Permite nova solicitação se já tem cartelas mas quer mais
    }
    
    s.solicitacoes[idUnico] = {
      idUnico: idUnico,
      nome: dados.nome || s.jogadoresPorIdUnico[idUnico]?.nome || 'Jogador',
      cpf: dados.cpf || '',
      celular: dados.celular || '',
      chavePix: dados.chavePix || '',
      email: dados.email || '',
      status: 'pendente',
      timestamp: Date.now(),
       cartelasJaTem: cj.length,
     qtdSolicitada: qtd || dados.qtd || 1
    };
    
    console.log('[SOLICITACAO] emitindo para adm socketId:',s.adm.socketId);
    io.to(s.adm.socketId).emit('nova_solicitacao', {
  idUnico: idUnico,
  nome: s.solicitacoes[idUnico].nome,
  cpf: dados.cpf || '',
  celular: dados.celular || '',
  chavePix: dados.chavePix || '',
  email: dados.email || '',
  cartelasJaTem: cj.length,
  qtdSolicitada: s.solicitacoes[idUnico].qtdSolicitada || 1,
  timestamp: Date.now()
});
    
    cb({ ok: true, mensagem: 'Solicitação enviada!' });
  });

socket.on('aprovar_cartela', ({ codigo, idUnico }, cb) => {
    console.log('[APROVAR_RECEBIDO] codigo:',codigo,'idUnico:',idUnico,'jogadores:',JSON.stringify(Object.keys(salas[codigo]?.jogadoresPorIdUnico||{})));
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false, erro: 'Não autorizado' });
    
    // Buscar pelo idUnico ou qualquer pendente
    let sol = s.solicitacoes[idUnico];
    let solKey = idUnico;
    if (!sol) {
      for (const [key, s2] of Object.entries(s.solicitacoes)) {
        if (s2.status === 'pendente') { sol = s2; solKey = key; break; }
      }
    }
    if (!sol) return cb({ ok: false, erro: 'Solicitação não encontrada' });
    
    const vendidas = Object.values(s.cartelasVendidasPorIdUnico).flat().map(c => c.id);
    const disp = s.cartelas.filter(c => !vendidas.includes(c.id));
    if (!disp.length) return cb({ ok: false, erro: 'Sem cartelas disponíveis' });
    
    const qtd = s.solicitacoes[solKey].qtdSolicitada || 1;
    const cartelas = disp.slice(0, qtd);
    s.cartelasVendidasPorIdUnico[solKey] = [...(s.cartelasVendidasPorIdUnico[solKey] || []), ...cartelas];
    s.solicitacoes[solKey].status = 'aprovado';
    
   const jogador = s.jogadoresPorIdUnico[solKey];
const socketDestino = jogador?.socketId;
console.log('[APROVAR] solKey:',solKey,'socketDestino:',socketDestino,'socketExiste:',socketDestino ? io.sockets.sockets.has(socketDestino) : false);
    if (socketDestino && io.sockets.sockets.has(socketDestino)) {
setTimeout(()=>{
     io.to(socketDestino).emit('cartela_aprovada', {
          cartelas: cartelas,
          cartela: cartelas[0],
          sorteados: s.sorteados,
          horario: s.horario || '',
          youtubeLink: s.youtubeLink || '',
          mensagem: '✅ Cartela liberada!'
        });
        console.log('[SUCESSO] Cartela enviada para socket:',socketDestino);
      }, 1000);
    } else {
      // Socket offline — guardar pendente pelo idUnico
      s.pendingCartelas = s.pendingCartelas || {};
      s.pendingCartelas[solKey] = {cartelas:cartelas,cartela:cartelas[0],sorteados:s.sorteados,horario:s.horario||'',youtubeLink:s.youtubeLink||'',mensagem:'✅ Cartela liberada!'};
      console.log('[APROVAR] socket offline, pendente para idUnico:',solKey);
    }
    
    cb({ ok: true });
  });

  socket.on('rejeitar_cartela', ({ codigo, idUnico, motivo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false, erro: 'Não autorizado' });
    const sol = s.solicitacoes[idUnico];
    if (!sol) return cb({ ok: false, erro: 'Solicitação não encontrada' });
    s.solicitacoes[idUnico].status = 'rejeitado';
    
    const jogador = s.jogadoresPorIdUnico[idUnico];
    if (jogador && jogador.socketId) {
      io.to(jogador.socketId).emit('cartela_rejeitada', { mensagem: motivo || '❌ Pagamento não confirmado.' });
    }
    cb({ ok: true });
  });

  socket.on('sortear', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false });
    if (!s.ativa) s.ativa = true;
    const res = sorteiarNumero(codigo);
    if (!res) return cb({ ok: false, erro: 'Sem números restantes' });
    io.to(codigo).emit('numero_sorteado', res);
    Object.entries(s.cartelasVendidasPorIdUnico).forEach(([idUnico, carts]) => {
      carts.forEach(cartela => {
        let marc = 0, tot = 0;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
          const v = cartela.grid[r][c];
          if (v === 'FREE') { marc++; tot++; }
          else { tot++; if (s.sorteados.includes(v)) marc++; }
        }
        const nome = s.jogadoresPorIdUnico[idUnico]?.nome || 'Jogador';
        if (marc === tot - 1) io.to(codigo).emit('alerta_jogador', { nome, tipo: 'quase', texto: '🔥 ' + nome + ' está quase!' });
        if (marc === tot && !s.vencedor) {
          io.to(codigo).emit('alerta_jogador', { nome, tipo: 'bingo', texto: '🎉 ' + nome + ' completou!' });
          // bingo automático pelo servidor
          s.vencedor = { idUnico, nome, cartelaId: cartela.id, automatico: true };
          s.ativa = false;
          io.to(codigo).emit('bingo_confirmado', { vencedor: s.vencedor, sorteados: s.sorteados });
          // avisa ADM especificamente
          io.to(s.adm.socketId).emit('bingo_automatico', { nome, cartelaId: cartela.id, idUnico });
        }
      });
    });
    cb({ ok: true, ...res });
  });

  socket.on('gritar_bingo', ({ codigo, cartelaId }, cb) => {
    const s = salas[codigo];
    if (!s || !s.ativa || s.vencedor) return cb({ ok: false });
    const idUnico = socket.data.idUnico;
    if (!idUnico) return cb({ ok: false, erro: 'Identificador não encontrado' });
    
    const cj = s.cartelasVendidasPorIdUnico[idUnico] || [];
    const cartela = cj.find(c => c.id === cartelaId);
    if (!cartela) return cb({ ok: false, erro: 'Cartela não encontrada' });
    if (!validarBingo(cartela, s.sorteados)) return cb({ ok: false, erro: 'Bingo inválido' });
    
    s.vencedor = { idUnico: idUnico, nome: s.jogadoresPorIdUnico[idUnico]?.nome, cartelaId };
    s.ativa = false;
    io.to(codigo).emit('bingo_confirmado', { vencedor: s.vencedor, sorteados: s.sorteados });
    cb({ ok: true });
  });

  socket.on('disconnect', () => {
    const { sala, papel, idUnico } = socket.data || {};
    if (!sala || !salas[sala]) return;
    
    if (papel === 'adm') {
      io.to(sala).emit('adm_desconectado');
      console.log(`[WARN] ADM ${sala} desconectou`);
    } else if (idUnico) {
      const s = salas[sala];
      if (s && s.jogadoresPorIdUnico[idUnico]) {
        const nome = s.jogadoresPorIdUnico[idUnico].nome;
        s.jogadoresPorIdUnico[idUnico].socketId = null;
        delete s.jogadoresPorSocket[socket.id];
        io.to(s.adm.socketId).emit('jogador_saiu', { nome, total: Object.keys(s.jogadoresPorIdUnico).length });
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Lux Bingo Server rodando na porta ${PORT} 🎱`));