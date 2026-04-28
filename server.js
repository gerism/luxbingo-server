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
app.get('/sala-adm/:admId', (req, res) => {
  const admId = req.params.admId.toUpperCase();
  const sala = salas[admId];
  if (!sala) return res.json({ ok: false });
  res.json({
    ok: true,
    nome: sala.adm.nome || '',
    valorCartela: sala.valorCartela || '',
    chavePix: sala.chavePix || '',
    horario: sala.horario || '',
    youtubeLink: sala.youtubeLink || '',
    quantidadeCartelas: sala.cartelas ? sala.cartelas.length : 100
  });
});

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
<meta property="og:title" content="Lux Bingo 🎰">
<meta property="og:description" content="Você foi convidado para jogar Bingo ao vivo! Clique para participar.">
<meta property="og:image" content="https://luxbingo-server-production.up.railway.app/logo.png">
<meta property="og:type" content="website">
<meta name="theme-color" content="#c9a227">
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
@media(min-width:600px){.cartelas-scroll{display:flex;justify-content:center;}.cartela-card{max-width:380px;width:100%}}
.yt-wrap{width:100%;background:#000;position:sticky;top:0;z-index:10;flex-shrink:0;max-height:35vh}
.yt-wrap iframe{width:100%;display:block;border:none;max-height:35vh}
.info-bar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(0,0,0,.5);border-bottom:1px solid rgba(201,162,39,.2);flex-shrink:0}
.num-atual{font-size:32px;font-weight:900;color:var(--gold2);min-width:44px;text-align:center;line-height:1}
.num-lbl{font-size:7px;color:var(--textl);text-transform:uppercase;letter-spacing:1px;display:block}
.ng90{display:grid;grid-template-columns:repeat(15,1fr);flex:1;gap:1px}
.nm90{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:2px;background:rgba(255,255,255,.04);font-size:6px;font-weight:700;color:rgba(232,213,163,.3)}
.nm90.s{background:rgba(201,162,39,.25);color:var(--gold)}
.nm90.u{background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--navy)}
.cartelas-area{flex:1;overflow:hidden;display:flex;flex-direction:column;max-width:500px;margin:0 auto;width:100%}
.cartelas-tabs{display:flex;gap:4px;padding:6px 10px 0;flex-shrink:0}
.tab-btn{padding:4px 12px;border-radius:20px;font-size:10px;font-weight:900;cursor:pointer;border:1.5px solid rgba(201,162,39,.3);background:transparent;color:var(--textl);font-family:inherit}
.tab-btn.ok{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:transparent;color:var(--navy)}
.cartelas-scroll{flex:1;overflow-y:auto;padding:6px 10px 10px;width:100%}
.cartela-card{background:var(--card);border:2px solid rgba(201,162,39,.3);border-radius:12px;overflow:hidden;margin-bottom:8px}
.cartela-header{background:linear-gradient(135deg,#0a1628,var(--navy2));border-bottom:2px solid var(--gold);padding:6px 10px;display:flex;align-items:center;justify-content:space-between}
.cartela-titulo{font-size:11px;font-weight:900;color:var(--gold2);letter-spacing:1px}
.cartela-num{font-size:10px;color:var(--textl)}
.letras-row{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:4px 6px 0}
.letra{text-align:center;font-size:14px;font-weight:900;color:var(--gold);padding:2px 0}
.grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:3px 6px 6px;width:100%}
.cel{aspect-ratio:1/0.85;display:flex;align-items:center;justify-content:center;border-radius:6px;background:rgba(255,255,255,.05);border:1.5px solid rgba(201,162,39,.2);font-size:clamp(14px,4vw,28px);font-weight:900;color:var(--text);cursor:pointer;user-select:none}
.cartela-card{background:var(--card);border:2px solid rgba(201,162,39,.3);border-radius:12px;overflow:hidden;margin-bottom:8px;max-width:420px;width:100%;margin-left:auto;margin-right:auto}
.cartelas-area{flex:1;overflow-y:auto;display:flex;flex-direction:column;width:100%}
.cartelas-scroll{flex:1;overflow-y:auto;padding:6px 10px 10px;display:flex;flex-direction:column;align-items:center}
.cel.marc{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold3);color:var(--navy)}
.cel.free{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold3);color:var(--navy);cursor:default}
.bingo-btn{width:100%;padding:10px;background:linear-gradient(135deg,#2ecc71,#27ae60);border:none;border-radius:0 0 10px 10px;font-size:14px;font-weight:900;color:#fff;letter-spacing:2px;cursor:pointer;display:none}
.alerta-quase{background:rgba(201,162,39,.15);border:2px solid var(--gold);color:var(--gold2);border-radius:10px;padding:8px 10px;text-align:center;font-weight:900;font-size:11px;margin:4px 10px}
.alerta-bingo{background:rgba(46,204,113,.15);border:2px solid #2ecc71;color:#2ecc71;border-radius:10px;padding:8px 10px;text-align:center;font-weight:900;font-size:11px;margin:4px 10px}
.bingo-banner{background:linear-gradient(135deg,var(--gold),var(--gold2));border-radius:10px;padding:12px;text-align:center;margin:4px 10px}
.bb-icon{font-size:28px;display:block;margin-bottom:2px}
.bb-title{font-size:15px;font-weight:900;color:var(--navy);letter-spacing:2px}
.bb-sub{font-size:10px;color:rgba(13,27,46,.7);margin-top:2px}
.bottom-bar{display:flex;gap:6px;padding:6px 10px 10px;flex-shrink:0;border-top:1px solid rgba(201,162,39,.15);padding-bottom:max(10px,env(safe-area-inset-bottom))}
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
  <div class="card" style="max-width:400px;text-align:center">
    <div class="ct" style="text-align:center">💳 PAGUE COM PIX</div>
    <div style="font-size:11px;color:var(--textl);margin-bottom:4px">Valor total:</div>
    <div class="pix-val" id="pValor">R$ --</div>
    <div id="pixQrBox" style="display:none;margin:12px 0">
      <div style="font-size:11px;color:var(--textl);margin-bottom:8px">Escaneie o QR Code ou copie o código:</div>
      <div style="background:#fff;padding:10px;border-radius:12px;display:inline-block;border:2px solid var(--gold);margin-bottom:8px">
        <img id="pixQrImg" src="" width="180" height="180" style="display:block;border-radius:4px">
      </div>
      <div id="pixCopiaECola" style="background:rgba(255,255,255,.05);border:1px solid rgba(201,162,39,.3);border-radius:8px;padding:8px;font-size:9px;color:var(--gold2);word-break:break-all;margin-bottom:8px;text-align:left"></div>
      <button onclick="copiarPix()" style="width:100%;padding:10px;background:linear-gradient(135deg,var(--gold),var(--gold2));border:none;border-radius:10px;font-size:13px;font-weight:900;color:var(--navy);cursor:pointer;margin-bottom:6px">📋 COPIAR CÓDIGO PIX</button>
    </div>
    <div id="pixCarregando" style="padding:20px;color:var(--textl);font-size:12px">⏳ Gerando QR Code...</div>
    <div id="pixTimer" style="font-size:13px;font-weight:700;color:var(--gold2);margin:8px 0"></div>
    <div id="pHorario" style="display:none;font-size:12px;font-weight:700;color:var(--gold2);margin-top:8px;padding:7px;background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.3);border-radius:8px;text-align:center"></div>
    <div style="font-size:10px;color:var(--textl);margin-top:8px">✅ Cartela liberada automaticamente após pagamento</div>
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
  <div id="jogoScroll" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;">
    <div class="yt-wrap" id="ytWrap" style="display:none">
      <iframe id="ytFrame" allowfullscreen allow="autoplay"></iframe>
    </div>
    <div class="info-bar">
      <div>
        <span class="num-lbl">Último</span>
        <div class="num-atual" id="nAtual">--</div>
      </div>
      <div id="premioJogBox" style="display:none;background:linear-gradient(135deg,var(--gold),var(--gold2));border-radius:10px;padding:6px 12px;text-align:center;margin-left:auto">
        <div style="font-size:8px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:1px">🏆 Prêmio</div>
        <div style="font-size:18px;font-weight:900;color:var(--navy)" id="premioJogVal">--</div>
      </div>
    </div>
    <div id="alertaBox" style="display:none"></div>
    <div id="bingoBox"></div>
    <div class="cartelas-tabs" id="cartTabs" style="padding:6px 10px 0;display:flex;gap:4px;flex-shrink:0"></div>
    <div id="cartScroll" style="padding:6px 10px 10px;display:flex;flex-direction:column;align-items:center">
      <div style="text-align:center;padding:30px 16px;color:var(--textl);font-size:12px" id="semCartela">
        ⏳ Aguardando cartela ser liberada...
      </div>
    </div>
  </div>
  <div class="bottom-bar">
    <button class="btn-audio" id="btnAudio">🔊 Áudio ON</button>
    <button id="btnCopiarCod" style="display:none;flex:1;padding:9px;background:linear-gradient(135deg,var(--gold),var(--gold2));border:none;border-radius:10px;font-size:11px;font-weight:900;color:var(--navy);cursor:pointer;font-family:inherit">📋 Copiar Código</button>
    <button class="btn-mais" id="btnMais" style="display:none"></button>
  </div>
</div>
<script>
var COD='${codigo}',SERVER=window.location.origin,sock=null;
var cartelas=[],marc={},nums=[],audioOn=true,tabAtiva=0;
var meuIdUnico = localStorage.getItem('luxbingo_id_'+COD) || null;
function gerarIdUnico() {
  return 'jog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
var qtdCartelas=1;
document.querySelectorAll('.qt-btn').forEach(function(b){
  b.onclick=function(){
    qtdCartelas=parseInt(this.dataset.q);
    document.querySelectorAll('.qt-btn').forEach(function(x){x.classList.remove('ok');});
    this.classList.add('ok');
  };
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
  var codCart=document.getElementById('iCodCart').value.trim().toUpperCase();
  if(!codCart){toast('❌ Digite o código da cartela!',true);return;}
  toast('⏳ Buscando cartela...');
  fetch(SERVER+'/cartela/'+COD+'/'+codCart)
    .then(function(r){return r.json();})
    .then(function(d){
      if(!d.ok){toast('❌ '+(d.erro||'Cartela não encontrada!'),true);return;}
      // Se a cartela é de outra sala, redireciona
      if(d.codigoSala && d.codigoSala !== COD){
        window.location.href=SERVER+'/jogo/'+d.codigoSala+'?recuperar='+encodeURIComponent(codCart);
        return;
      }
      cartelas=[d.cartela];
      nums=d.sorteados||[];
      marc={};
      marc[d.cartela.id]=[];
      nums.forEach(function(n){
        for(var r=0;r<5;r++)for(var c=0;c<5;c++){
          if(d.cartela.grid[r][c]===n && marc[d.cartela.id].indexOf(n)===-1)
            marc[d.cartela.id].push(n);
        }
      });
      meuIdUnico=d.idUnico;
      localStorage.setItem('luxbingo_id_'+COD,d.idUnico);
      var nome=localStorage.getItem('luxbingo_nome_'+COD)||'Jogador';
      if(!nome||nome==='Jogador'){
        var nomeInput=document.getElementById('iNome');
        nome=nomeInput&&nomeInput.value.trim()||'Jogador';
      }
      localStorage.setItem('luxbingo_nome_'+COD,nome);
      if(d.youtubeLink)setYoutube(d.youtubeLink);
      conectarJogo(nome);
      tela(3);
      renderCartelas();
      renderGrid();
      mostrarCodigosBar();
      if(d.youtubeLink)mostrarYoutube();
      toast('✅ Cartela recuperada!');
    })
    .catch(function(){toast('❌ Erro de conexão!',true);});
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
  if(sock){sock.off('connect_error');sock.disconnect();}
  sock=io(SERVER,{transports:['websocket']});
sock.on('connect',function(){
    localStorage.setItem('luxbingo_nome_'+COD,nome);
    registrarEventos(nome);
    sock.emit('entrar_sala',{codigo:COD,idUnico:meuIdUnico,nomeJogador:nome},function(r){
      if(!r.ok){toast('❌ '+(r.erro||'Erro'),true);sock.disconnect();return;}
      document.getElementById('pValor').textContent='R$ '+(r.valorCartela||'?');
      document.getElementById('pChave').textContent=r.chavePix||'--';
      if(r.horario){document.getElementById('pHorario').textContent='🕐 '+r.horario;document.getElementById('pHorario').style.display='block';}
      if(r.premioEstimado){
        var pb=document.getElementById('premioJogBox');var pv=document.getElementById('premioJogVal');
        if(pb&&pv){pb.style.display='block';pv.textContent='R$ '+r.premioEstimado.toLocaleString('pt-BR',{minimumFractionDigits:2});}
      }
      if(r.youtubeLink){setYoutube(r.youtubeLink);}
      if(r.cartelasExistentes && r.cartelasExistentes.length > 0) {
        cartelas = r.cartelasExistentes;
        nums = r.sorteados || [];
        cartelas.forEach(function(c) {
          if(!marc[c.id]) marc[c.id] = [];
          nums.forEach(function(n) {
            if(marc[c.id].indexOf(n) === -1) marc[c.id].push(n);
          });
        });
        renderCartelas();
        renderGrid();
        tela(3);
        toast('✅ Cartelas carregadas!');
        return;
      }
sock.emit('solicitar_cartela',{codigo:COD,idUnico:meuIdUnico,qtd:qtdCartelas,dados:{nome:nome,cpf:cpf,celular:cel,chavePix:pix,email:email}},function(r2){
  if(!r2.ok){toast('❌ '+(r2.erro||'Erro'),true);return;}
  tela(2);toast('✅ Solicitação enviada!');
  // Gerar QR Code Pix automático
  fetch(SERVER+'/criar-pagamento/'+COD, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({idUnico:meuIdUnico,nome:nome,cpf:cpf,email:email,qtd:qtdCartelas})
  }).then(function(r){return r.json();}).then(function(d){
    document.getElementById('pixCarregando').style.display='none';
    if(d.ok&&d.qrCode){
      pixCopiaCola=d.qrCode;
      document.getElementById('pValor').textContent='R$ '+d.valor.toLocaleString('pt-BR',{minimumFractionDigits:2});
      if(d.qrCodeBase64){
        document.getElementById('pixQrImg').src='data:image/png;base64,'+d.qrCodeBase64;
      }
      document.getElementById('pixCopiaECola').textContent=d.qrCode;
      document.getElementById('pixQrBox').style.display='block';
      iniciarTimerPix(d.expiracao||600);
    } else {
      document.getElementById('pixCarregando').textContent='❌ '+(d.erro||'Erro ao gerar Pix. Use a chave manual.');
    }
  }).catch(function(){
    document.getElementById('pixCarregando').textContent='❌ Erro de conexão.';
  });
});
    });
  });
 sock.once('connect_error',function(){if(!cartelas.length&&!meuIdUnico)toast('❌ Erro de conexão!',true);});
};
function registrarEventos(nome){
  sock.on('connect',function(){
    if(cartelas.length>0){
      sock.emit('entrar_sala',{codigo:COD,idUnico:meuIdUnico,nomeJogador:localStorage.getItem('luxbingo_nome_'+COD)||nome},function(){});
    }
  });
  sock.on('cartela_aprovada',function(d){
    var novas=d.cartelas||[d.cartela];
    novas.forEach(function(cart){
      cartelas.push(cart);
      if(!marc[cart.id])marc[cart.id]=[];
      nums=d.sorteados||nums;
      nums.forEach(function(n){if(marc[cart.id].indexOf(n)===-1)marc[cart.id].push(n);});
    });
  console.log('youtubeLink recebido:', d.youtubeLink);
if(d.youtubeLink)setYoutube(d.youtubeLink);
    mostrarYoutube();
    tela(3);
    document.getElementById('semCartela').style.display='none';
    salvarLocal(nome);renderCartelas();renderGrid();mostrarCodigosBar();
    if(cartelas.length<5)document.getElementById('btnMais').style.display='block';
    else document.getElementById('btnMais').style.display='none';
    toast('🎉 Cartela '+cartelas.length+' liberada! Boa sorte!');
  });
  sock.on('cartela_rejeitada',function(d){
    document.getElementById('motivo').textContent=d.mensagem||'Pagamento não confirmado.';tela(4);
  });
 sock.on('numero_sorteado',function(d){
    nums=d.sorteados||nums;
    if(d.premioEstimado){
      var pb=document.getElementById('premioJogBox');var pv=document.getElementById('premioJogVal');
      if(pb&&pv){pb.style.display='block';pv.textContent='R$ '+d.premioEstimado.toLocaleString('pt-BR',{minimumFractionDigits:2});}
    }
    document.getElementById('nAtual').textContent=d.numero;
    cartelas.forEach(function(c){
      if(marc[c.id].indexOf(d.numero)===-1)marc[c.id].push(d.numero);
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
    var old=document.getElementById('alertaJogador');if(old)document.body.removeChild(old);
    var div=document.createElement('div');div.id='alertaJogador';
    var cor=d.tipo==='bingo'?'rgba(46,204,113,.97)':'rgba(201,162,39,.97)';
    div.style.cssText='position:fixed;top:0;left:0;width:100%;z-index:998;background:'+cor+';padding:20px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.5)';
    div.innerHTML='<div style="font-size:36px">'+(d.tipo==='bingo'?'🎉':'🔥')+'</div>'
      +'<div style="font-size:20px;font-weight:900;color:#fff;margin:8px 0">'+d.texto+'</div>'
      +(d.tipo!=='bingo'?'<div style="font-size:11px;color:rgba(255,255,255,.7)">Toque para fechar</div>':'');
   if(d.tipo!=='bingo'){
      div.onclick=function(){if(document.body.contains(div))document.body.removeChild(div);};
      setTimeout(function(){if(document.body.contains(div))document.body.removeChild(div);},6000);
    } else {
      div.innerHTML+='<div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:8px">Aguarde o sorteador...</div>';
    }
    document.body.appendChild(div);
  });
 sock.on('fechar_alerta',function(){
    var div=document.getElementById('alertaJogador');
    if(div&&document.body.contains(div))document.body.removeChild(div);
  });
  sock.on('alerta_geral',function(d){
    var box=document.getElementById('alertasBox');
    if(!box){
      box=document.createElement('div');
      box.id='alertasBox';
      box.style.cssText='position:fixed;bottom:60px;left:0;right:0;z-index:990;display:flex;flex-direction:column;gap:4px;padding:0 8px;max-height:40vh;overflow-y:auto;pointer-events:none';
      document.body.appendChild(box);
    }
    var item=document.createElement('div');
    var cor=d.tipo==='bingo'?'rgba(46,204,113,.92)':'rgba(201,162,39,.92)';
    item.style.cssText='background:'+cor+';border-radius:10px;padding:6px 10px;display:flex;align-items:center;gap:8px;pointer-events:auto';
    item.innerHTML='<span style="font-size:18px">'+(d.tipo==='bingo'?'🎉':'🔥')+'</span>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:12px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+d.nome+'</div>'
      +'<div style="font-size:10px;color:rgba(255,255,255,.85)">'+d.texto+'</div>'
      +'</div>'
      +'<span style="font-size:14px;color:rgba(255,255,255,.6);cursor:pointer;padding:4px" onclick="this.parentElement.remove()">✕</span>';
    box.appendChild(item);
    if(d.tipo!=='bingo')setTimeout(function(){if(item.parentElement)item.remove();},8000);
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
    try{
      var n=localStorage.getItem('luxbingo_nome_'+COD)||'Jogador';
      var chave='luxbingo_'+COD+'_'+n.replace(/\s/g,'_');
      cartelas.forEach(function(c){localStorage.removeItem('luxbingo_cart_'+COD+'_'+c.id);});
      localStorage.removeItem(chave);
    }catch(e){}
    cartelas=[];marc={};nums=[];
    document.getElementById('nAtual').textContent='--';
    document.getElementById('semCartela').style.display='block';
    document.getElementById('cartTabs').innerHTML='';
    document.getElementById('cartScroll').innerHTML='<div style="text-align:center;padding:30px 16px;color:var(--textl);font-size:12px" id="semCartela">⏳ Aguardando cartela ser liberada...</div>';
    tela(1);toast('⚠️ Cartelas resetadas pelo ADM!');
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
  if(sock){sock.off();sock.disconnect();}
  sock=io(SERVER,{transports:['websocket']});
  sock.on('connect_error',function(){});
  sock.once('connect',function(){
    sock.emit('entrar_sala',{codigo:COD,idUnico:meuIdUnico,nomeJogador:nome},function(r){
      if(r&&r.ok){
        nums=r.sorteados||nums;
        if(r.youtubeLink){setYoutube(r.youtubeLink);mostrarYoutube();}
        if(r.cartelasExistentes&&r.cartelasExistentes.length>0){
          cartelas=r.cartelasExistentes;
          nums=r.sorteados||[];
          marc={};
          cartelas.forEach(function(c){
            marc[c.id]=[];
            nums.forEach(function(n){
              for(var row=0;row<5;row++)for(var col=0;col<5;col++){
                if(c.grid[row][col]===n&&marc[c.id].indexOf(n)===-1)
                  marc[c.id].push(n);
              }
            });
            if(marc[c.id].indexOf('FREE')===-1)marc[c.id].push('FREE');
          });
        }
       salvarLocal(nome);
        if(r.cartelasExistentes&&r.cartelasExistentes.length>0){
          renderCartelas();renderGrid();mostrarCodigosBar();verBingo();tela(3);
        } else if(cartelas.length>0){
          renderCartelas();renderGrid();mostrarCodigosBar();verBingo();
        }
      }
    });
  });
 sock.on('connect', function(){
    sock.emit('entrar_sala',{codigo:COD,idUnico:meuIdUnico,nomeJogador:nome},function(r){
      if(r&&r.ok){
        nums=r.sorteados||nums;
        cartelas.forEach(function(c){
          if(!marc[c.id])marc[c.id]=[];
          nums.forEach(function(n){
            for(var row=0;row<5;row++)for(var col=0;col<5;col++){
              if(c.grid[row][col]===n&&marc[c.id].indexOf(n)===-1)marc[c.id].push(n);
            }
          });
          if(marc[c.id].indexOf('FREE')===-1)marc[c.id].push('FREE');
        });
        renderCartelas();renderGrid();
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
  div.innerHTML='<div class="cartela-header"><div class="cartela-titulo">🎟️ CARTELA '+(tabAtiva+1)+'</div><div class="cartela-num">'+c.id+'</div><button onclick="printCartela('+tabAtiva+')" style="background:linear-gradient(135deg,var(--gold),var(--gold2));border:none;border-radius:6px;padding:3px 8px;font-size:9px;font-weight:900;color:var(--navy);cursor:pointer;margin-left:6px">📸 Print</button></div>';
  var letRow=document.createElement('div');letRow.className='letras-row';
  ['B','I','N','G','O'].forEach(function(l){var s=document.createElement('div');s.className='letra';s.textContent=l;letRow.appendChild(s);});
  div.appendChild(letRow);
  var grid=document.createElement('div');grid.className='grid5';
  for(var r=0;r<5;r++)for(var col=0;col<5;col++){
    var v=c.grid[r][col];var el=document.createElement('div');
    if(v==='FREE'){el.className='cel free';el.style.padding='0';el.style.overflow='hidden';el.innerHTML='<img src="${LOGO}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:6px;">';}
    else{
      el.className='cel'+(m.indexOf(v)!==-1?' marc':'');
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
function copiarCodigos(){
  var codigo=cartelas[tabAtiva]?cartelas[tabAtiva].id:cartelas[0].id;
  if(navigator.share){
    navigator.share({title:'Lux Bingo',text:codigo});
  } else if(navigator.clipboard){
    navigator.clipboard.writeText(codigo).then(function(){toast('📋 Código copiado!');});
  } else {
    var ta=document.createElement('textarea');ta.value=codigo;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('📋 Código copiado!');
  }
}
function mostrarCodigosBar(){
  if(!cartelas.length)return;
  var codigos=cartelas.map(function(c){return c.id;}).join(', ');
  var box=document.getElementById('codCartBox');
  var btn=document.getElementById('btnCopiarCod');
  if(box){box.textContent='🎟️ '+codigos;box.style.display='block';}
  if(btn){btn.style.display='block';}
  btn.onclick=function(){
    var txt=codigos;
    if(navigator.share){
      navigator.share({title:'Meus códigos Lux Bingo',text:'Meus códigos de cartela: '+txt});
    } else if(navigator.clipboard){
      navigator.clipboard.writeText(txt).then(function(){toast('📋 Código copiado!');});
    } else {
      var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
      toast('📋 Código copiado!');
    }
  };
}
function salvarLocal(nome){
  if(!cartelas.length)return;
  if(!cartelas.length)return;
  var chave='luxbingo_'+COD+'_'+nome.replace(/\\s/g,'_');
  localStorage.setItem(chave,JSON.stringify({cartelas:cartelas,marc:marc,nums:nums,nome:nome}));
  cartelas.forEach(function(c){
    localStorage.setItem('luxbingo_cart_'+COD+'_'+c.id,JSON.stringify({cartelas:cartelas,marc:marc,nums:nums,nome:nome}));
  });
}
function printCartela(idx){
  var c=cartelas[idx];
  if(!c)return;
  var m=marc[c.id]||[];
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8">'
    +'<style>'
    +'body{background:#0d1b2e;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:Segoe UI,sans-serif}'
    +'.card{background:#0f2240;border:3px solid #c9a227;border-radius:16px;padding:20px;width:340px}'
    +'.header{background:linear-gradient(135deg,#0a1628,#1a2d4e);border-bottom:3px solid #c9a227;border-radius:10px 10px 0 0;padding:10px;text-align:center;margin:-20px -20px 12px}'
    +'.titulo{font-size:18px;font-weight:900;color:#f0c040;letter-spacing:2px}'
    +'.cod{font-size:11px;color:rgba(232,213,163,.6);margin-top:4px}'
    +'.letras{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:4px}'
    +'.letra{text-align:center;font-size:18px;font-weight:900;color:#c9a227;padding:4px}'
    +'.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}'
    +'.cel{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,.07);border:2px solid rgba(201,162,39,.3);font-size:22px;font-weight:900;color:#e8d5a3}'
    +'.marc{background:linear-gradient(135deg,#c9a227,#f0c040);border-color:#ffd966;color:#0d1b2e}'
    +'.free{background:linear-gradient(135deg,#c9a227,#f0c040);border-color:#ffd966;padding:2px}'
    +'.footer{text-align:center;margin-top:12px;font-size:11px;color:rgba(232,213,163,.5)}'
    +'</style></head><body><div class="card">'
    +'<div class="header"><div class="titulo">🎰 LUX BINGO</div><div class="titulo" style="font-size:14px">CARTELA '+(idx+1)+'</div><div class="cod">'+c.id+'</div></div>'
    +'<div class="letras"><div class="letra">B</div><div class="letra">I</div><div class="letra">N</div><div class="letra">G</div><div class="letra">O</div></div>'
    +'<div class="grid">';
  for(var r=0;r<5;r++)for(var col=0;col<5;col++){
    var v=c.grid[r][col];
    if(v==='FREE'){
      html+='<div class="cel free"><img src="'+window.location.origin+'/logo.png" style="width:90%;height:90%;border-radius:50%;object-fit:cover;"></div>';
    } else {
      var isMarcado=m.indexOf(v)!==-1;
      html+='<div class="cel'+(isMarcado?' marc':'')+'">'+v+'</div>';
    }
  }
  html+='</div><div class="footer">'+window.location.origin+'</div></div></body></html>';
  var win=window.open('','_blank','width=400,height=600');
  if(win){
    win.document.write(html);
    win.document.close();
    setTimeout(function(){
      win.print();
      if(cartelas.length>1){
        var prox=idx+1;
        if(prox<cartelas.length){
          setTimeout(function(){printCartela(prox);},1000);
        }
      }
    },500);
  } else {
    toast('❌ Permita pop-ups para tirar print',true);
    copiarCodigos();
  }
}
var pixCopiaCola='';
var pixTimerInterval=null;
function copiarPix(){
  if(!pixCopiaCola)return;
  if(navigator.clipboard){
    navigator.clipboard.writeText(pixCopiaCola).then(function(){toast('📋 Código Pix copiado!');});
  } else {
    var ta=document.createElement('textarea');ta.value=pixCopiaCola;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('📋 Código Pix copiado!');
  }
}
function iniciarTimerPix(segundos){
  if(pixTimerInterval)clearInterval(pixTimerInterval);
  var restante=segundos;
  var el=document.getElementById('pixTimer');
  function atualizar(){
    if(!el)return;
    var m=Math.floor(restante/60);var s=restante%60;
    el.textContent='⏱️ Expira em: '+m+':'+(s<10?'0':'')+s;
    if(restante<=0){clearInterval(pixTimerInterval);el.textContent='❌ QR Code expirado. Recarregue a página.';}
    restante--;
  }
  atualizar();
  pixTimerInterval=setInterval(atualizar,1000);
}
window.onload=function(){
  renderGrid();
  var params=new URLSearchParams(window.location.search);
  var autoRec=params.get('recuperar');
  if(autoRec){
    document.getElementById('iCodCart').value=autoRec.toUpperCase();
    setTimeout(function(){document.getElementById('btnRecuperar').click();},500);
    return;
  }
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

const UPSTASH_URL = process.env.UPSTASH_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_TOKEN;

async function salvarSalas() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.log('[REDIS] Variáveis não configuradas! URL:', !!UPSTASH_URL, 'TOKEN:', !!UPSTASH_TOKEN);
    return;
  }
  try {
    const valor = JSON.stringify(salas);
    const resp = await fetch(`${UPSTASH_URL}/set/luxbingo_salas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(["luxbingo_salas", valor])
    });
    const result = await resp.json();
    console.log('[REDIS SAVE]', JSON.stringify(result));
  } catch(e) { console.log('[REDIS SAVE ERROR]', e.message); }
}

async function carregarSalas() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    const r = await fetch(`${UPSTASH_URL}/get/luxbingo_salas`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const d = await r.json();
    if (d.result) {
      const salvas = JSON.parse(d.result);
      Object.assign(salas, salvas);
      console.log('[REDIS RESTORE] Salas:', Object.keys(salas));
    }
  } catch(e) { console.log('[REDIS LOAD ERROR]', e.message); }
}

// carregarSalas será chamado dentro do listen
function gerarCodigo() {
  const l = 'ABCDEFGHJKLMNPQRSTUVWXYZ', n = '23456789';
  let c = '';
  for (let i = 0; i < 3; i++) c += l[Math.floor(Math.random() * l.length)];
  for (let i = 0; i < 3; i++) c += n[Math.floor(Math.random() * n.length)];
  return c;
}

function gerarCartela90(usados) {
  const faixas = [
    { start: 1,  end: 18 },
    { start: 19, end: 36 },
    { start: 37, end: 54 },
    { start: 55, end: 72 },
    { start: 73, end: 90 },
  ];
  const grid = [];
  for (let row = 0; row < 5; row++) grid.push([null,null,null,null,null]);
  for (let col = 0; col < 5; col++) {
    const { start, end } = faixas[col];
    const pool = [];
    for (let n = start; n <= end; n++) pool.push(n);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const need = (col === 2) ? 4 : 5;
    const sel = pool.slice(0, need).sort((a, b) => a - b);
    let si = 0;
    for (let row = 0; row < 5; row++) {
      if (row === 2 && col === 2) grid[row][col] = 'FREE';
      else grid[row][col] = sel[si++];
    }
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
app.get('/cartela/:codigo/:cartelaId', (req, res) => {
  const cartelaId = req.params.cartelaId.toUpperCase();
  for (const sala of Object.values(salas)) {
    if (!sala || !sala.cartelasVendidasPorIdUnico) continue;
    for (const [idUnico, carts] of Object.entries(sala.cartelasVendidasPorIdUnico)) {
      if (!carts) continue;
      const found = carts.find(c => c.id === cartelaId);
      if (found) return res.json({ ok: true, cartela: found, sorteados: sala.sorteados||[], idUnico, codigoSala: sala.codigo, youtubeLink: sala.youtubeLink||'' });
    }
  }
  res.json({ ok: false, erro: 'Cartela não encontrada' });
});

// ─── MERCADO PAGO ──────────────────────────────────────────
app.use(express.json());

app.post('/criar-pagamento/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const s = salas[codigo?.toUpperCase()];
  if (!s) return res.json({ ok: false, erro: 'Sala não encontrada' });
  const token = s.mpToken || process.env.MP_TOKEN_DEFAULT;
if (!token) return res.json({ ok: false, erro: 'Token MP não configurado' });

  console.log('[PAGAMENTO] sala:', codigo, 'mpToken:', s.mpToken ? 'OK' : 'VAZIO');
  const { idUnico, nome, cpf, email, qtd } = req.body;
  const valor = s.valorCartela * (qtd || 1);

  try {
    const r = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${s.mpToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${codigo}-${idUnico}-${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount: valor,
        description: `Lux Bingo - ${qtd||1} cartela(s) - Sala ${codigo}`,
        payment_method_id: 'pix',
        payer: {
          email: email || 'jogador@luxbingo.com',
          first_name: nome.split(' ')[0],
          last_name: nome.split(' ').slice(1).join(' ') || 'Jogador',
          identification: { type: 'CPF', number: cpf.replace(/\D/g,'') }
        },
        notification_url: `https://luxbingo-server-production.up.railway.app/webhook-mp`,
        metadata: { codigo, idUnico, qtd: qtd||1 }
      })
    });
    const d = await r.json();
   console.log('[MP] Resposta completa:', JSON.stringify(d));
    if (!d.id) return res.json({ ok: false, erro: d.message || 'Erro MP' });
    res.json({
      ok: true,
      paymentId: d.id,
      qrCode: d.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: d.point_of_interaction?.transaction_data?.qr_code_base64,
      valor,
      expiracao: 600
    });
  } catch(e) {
    console.log('[MP ERROR]', e.message);
    res.json({ ok: false, erro: e.message });
  }
});

app.post('/webhook-mp', async (req, res) => {
  res.sendStatus(200);
  const { type, data } = req.body;
  if (type !== 'payment') return;
  const paymentId = data?.id;
  if (!paymentId) return;

  try {
    // Busca o token MP da sala correta pelo metadata
    // Primeiro busca o pagamento sem token para pegar o metadata
    for (const [codigo, s] of Object.entries(salas)) {
      if (!s.mpToken) continue;
      const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${s.mpToken}` }
      });
      const payment = await r.json();
      if (payment.error) continue;
      if (payment.status !== 'approved') return;

      const { codigo: codPag, idUnico, qtd } = payment.metadata || {};
      if (!codPag || codPag !== codigo) continue;

      const sala = salas[codPag];
      if (!sala) return;

      // Libera cartela automaticamente
      const sol = sala.solicitacoes[idUnico];
      if (!sol || sol.status === 'aprovado') return;

      const vendidas = Object.values(sala.cartelasVendidasPorIdUnico).flat().map(c => c.id);
      const disp = sala.cartelas.filter(c => !vendidas.includes(c.id));
      if (!disp.length) return;

      const cartelas = disp.slice(0, qtd || 1);
      sala.cartelasVendidasPorIdUnico[idUnico] = [...(sala.cartelasVendidasPorIdUnico[idUnico] || []), ...cartelas];
      sala.solicitacoes[idUnico].status = 'aprovado';

      const jogador = sala.jogadoresPorIdUnico[idUnico];
      const socketDestino = jogador?.socketId;

      const payload = {
        cartelas, cartela: cartelas[0],
        sorteados: sala.sorteados,
        horario: sala.horario || '',
        youtubeLink: sala.youtubeLink || '',
        mensagem: '✅ Pagamento confirmado! Cartela liberada!'
      };

      if (socketDestino && io.sockets.sockets.has(socketDestino)) {
        io.to(socketDestino).emit('cartela_aprovada', payload);
      } else {
        sala.pendingCartelas = sala.pendingCartelas || {};
        sala.pendingCartelas[idUnico] = payload;
      }

      // Notifica ADM
      if (sala.adm?.socketId) {
        io.to(sala.adm.socketId).emit('pagamento_confirmado', {
          nome: sol.nome, idUnico, qtd: qtd||1, valor: payment.transaction_amount
        });
      }

      salvarSalas();
      console.log('[WEBHOOK] Cartela liberada automaticamente para', idUnico);
      break;
    }
  } catch(e) {
    console.log('[WEBHOOK ERROR]', e.message);
  }
});

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
    // Reenviar jogadores conectados
    const totalJogs = Object.keys(s.jogadoresPorIdUnico).length;
  Object.entries(s.jogadoresPorIdUnico).forEach(([idUnico, jog]) => {
      if (jog) {
        socket.emit('jogador_entrou', {
          idUnico,
          nome: jog.nome,
          total: totalJogs
        });
      }
    });
    // Reenviar solicitações pendentes
    const pendentes = Object.values(s.solicitacoes).filter(sol => sol.status === 'pendente');
    pendentes.forEach(sol => {
      setTimeout(() => {
        socket.emit('nova_solicitacao', {
          idUnico: sol.idUnico,
          nome: sol.nome,
          cpf: sol.cpf,
          celular: sol.celular,
          chavePix: sol.chavePix,
          email: sol.email,
          cartelasJaTem: sol.cartelasJaTem,
          qtdSolicitada: sol.qtdSolicitada || 1,
          timestamp: sol.timestamp
        });
      }, 500);
    });
    cb && cb({ ok: true });
  });

  socket.on('criar_sala', ({ nomeAdm, valorCartela, chavePix, quantidadeCartelas, horario, youtubeLink, mpToken }, cb) => {
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
    
    let codigo;
    do { codigo = gerarCodigo(); } while (salas[codigo]);
    
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
      mpToken: mpToken || '',
      vencedor: null
    };
    
    socket.join(codigo);
    socket.data.sala = codigo;
    socket.data.papel = 'adm';
    
    console.log(`✅ SALA CRIADA: ${codigo} por ${nomeAdm}`);
    salvarSalas();
    cb({ ok: true, codigo, cartelas: cartelas.length });
  });

  socket.on('entrar_sala', ({ codigo, idUnico, nomeJogador }, cb) => {
    const s = salas[codigo?.toUpperCase()];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    if (s.vencedor) return cb({ ok: false, erro: 'Jogo já encerrado' });
    
    const socketId = socket.id;
    
    const eraNovo = !s.jogadoresPorIdUnico[idUnico];
    if (s.jogadoresPorIdUnico[idUnico]) {
      const oldSocketId = s.jogadoresPorIdUnico[idUnico].socketId;
      if (oldSocketId) delete s.jogadoresPorSocket[oldSocketId];
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
    
    io.to(codigo.toUpperCase()).emit('jogador_entrou', {
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
    
    const totalCartelas = Object.values(s.cartelasVendidasPorIdUnico).reduce((t, c) => t + c.length, 0);
    const premioEstimado = totalCartelas * s.valorCartela;
    cb({
      ok: true,
      sorteados: s.sorteados,
      ativa: s.ativa,
      valorCartela: s.valorCartela,
      chavePix: s.chavePix,
      horario: s.horario,
      youtubeLink: s.youtubeLink,
      cartelasExistentes: cartelasExistentes,
      premioEstimado: premioEstimado
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
    
   salvarSalas();
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
    if (s.vencedor) return cb({ ok: false, erro: 'Jogo já encerrado' });
    if (!s.ativa) s.ativa = true;
    const res = sorteiarNumero(codigo);
    if (!res) return cb({ ok: false, erro: 'Sem números restantes' });
    const totalCartelas = Object.values(s.cartelasVendidasPorIdUnico).reduce((t, c) => t + c.length, 0);
    const premioEstimado = totalCartelas * s.valorCartela;
    io.to(codigo).emit('numero_sorteado', { ...res, premioEstimado });
    Object.entries(s.cartelasVendidasPorIdUnico).forEach(([idUnico, carts]) => {
		
      carts.forEach(cartela => {
        let marc = 0, tot = 0;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
          const v = cartela.grid[r][c];
          if (v === 'FREE') { marc++; tot++; }
          else { tot++; if (s.sorteados.includes(v)) marc++; }
        }
      const nome = s.jogadoresPorIdUnico[idUnico]?.nome || 'Jogador';
        const celular = s.solicitacoes[idUnico]?.celular || '';
        const celMask = celular.length>=4 ? '('+celular.slice(0,2)+')******'+celular.slice(-2) : '';
        const nomeExib = nome + (celMask ? ' '+celMask : '');
        const socketJogador = s.jogadoresPorIdUnico[idUnico]?.socketId;
        if (marc === tot - 1) {
          io.to(s.adm.socketId).emit('alerta_jogador', { nome: nomeExib, tipo: 'quase', texto: '🔥 '+nomeExib+' — falta 1!' });
          io.to(codigo).emit('alerta_geral', { nome: nomeExib, tipo: 'quase', texto: '🔥 Falta 1!' });
          if (socketJogador) io.to(socketJogador).emit('alerta_jogador', { nome: nomeExib, tipo: 'quase', texto: '🔥 Falta 1 número!' });
        }
        if (marc === tot) {
          io.to(s.adm.socketId).emit('alerta_jogador', { nome: nomeExib, tipo: 'bingo', texto: '🎉 '+nomeExib+' completou!' });
          io.to(codigo).emit('alerta_geral', { nome: nomeExib, tipo: 'bingo', texto: '🎉 BINGO!' });
          if (socketJogador) io.to(socketJogador).emit('alerta_jogador', { nome: nomeExib, tipo: 'bingo', texto: '🎉 Você completou a cartela!' });
        }
      });
    });
    cb({ ok: true, ...res });
  });
socket.on('zerar_sorteio', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb && cb({ ok: false });
    s.sorteados = [];
    s.ativa = false;
    s.numeros = Array.from({ length: 90 }, (_, i) => i + 1);
    salvarSalas();
    io.to(codigo).emit('sorteio_zerado');
    cb && cb({ ok: true });
  });

socket.on('limpar_cartelas', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb && cb({ ok: false });
    s.cartelasVendidasPorIdUnico = {};
    s.solicitacoes = {};
    s.pendingCartelas = {};
    s.sorteados = [];
    s.ativa = false;
    s.vencedor = null;
    s.jogadoresPorIdUnico = {};
    s.jogadoresPorSocket = {};
    s.numeros = Array.from({ length: 90 }, (_, i) => i + 1);
    salvarSalas();
    io.to(codigo).emit('cartelas_limpas');
    cb && cb({ ok: true });
  });
  socket.on('fechar_alerta_jogadores', ({ codigo }, cb) => {
    io.to(codigo).emit('fechar_alerta');
    cb && cb({ ok: true });
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
    salvarSalas();
    io.to(codigo).emit('bingo_confirmado', { vencedor: s.vencedor, sorteados: s.sorteados });
    io.to(s.adm.socketId).emit('parar_sorteio');
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
carregarSalas().then(() => {
  server.listen(PORT, () => {
    console.log(`Lux Bingo Server rodando na porta ${PORT} 🎱`);
  });
});
