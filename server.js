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

// ─── Estado global ────────────────────────────────────────────────────────────
// salas[codigo] = { adm, jogadores, cartelas, numeros, sorteados, ativa, premio }
const salas = {};

// ─── Utilidades ───────────────────────────────────────────────────────────────
function gerarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums   = '23456789';
  let cod = '';
  for (let i = 0; i < 3; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  for (let i = 0; i < 3; i++) cod += nums[Math.floor(Math.random() * nums.length)];
  return cod;
}

function gerarCartela75() {
  // Bingo 75 bolas — colunas B(1-15) I(16-30) N(31-45) G(46-60) O(61-75)
  const faixas = [
    [1,  15],  // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75],  // O
  ];
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
  // cartela[col][row] — transpor para [row][col] pra facilitar UI
  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => (row === 2 && col === 2 ? 'FREE' : cartela[col][row]))
  );
  return grid;
}

function gerarBolão(sala, quantidade) {
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

  // marca automaticamente tudo que foi sorteado
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++)
      if (sorteados.includes(grid[r][c]) || (r === 2 && c === 2)) marcados[r][c] = true;

  // verifica linhas, colunas, diagonais
  for (let i = 0; i < 5; i++) {
    if (marcados[i].every(Boolean)) return true;                            // linha
    if (marcados.every(row => row[i])) return true;                         // coluna
  }
  if ([0,1,2,3,4].every(i => marcados[i][i])) return true;                 // diagonal \
  if ([0,1,2,3,4].every(i => marcados[i][4 - i])) return true;             // diagonal /
  return false;
}

function sorteiarNumero(sala) {
  const s = salas[sala];
  if (!s || !s.ativa) return null;

  const restantes = s.numeros.filter(n => !s.sorteados.includes(n));
  if (restantes.length === 0) return null;

  const num = restantes[Math.floor(Math.random() * restantes.length)];
  s.sorteados.push(num);

  // coluna do número
  const letras = 'BINGO';
  const coluna = letras[Math.floor((num - 1) / 15)];

  return { numero: num, coluna, sorteados: s.sorteados };
}

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] ${socket.id} conectado`);

  // ── ADM: criar sala ──────────────────────────────────────────────────────
  socket.on('criar_sala', ({ nomeAdm, premio, quantidadeCartelas }, cb) => {
    let codigo;
    do { codigo = gerarCodigo(); } while (salas[codigo]);

    const cartelas = gerarBolão(codigo, quantidadeCartelas || 30);

    salas[codigo] = {
      codigo,
      adm: { socketId: socket.id, nome: nomeAdm },
      jogadores: {},
      cartelas,              // pool de cartelas disponíveis
      cartelasVendidas: {},  // jogadorId → [cartela, ...]
      numeros: Array.from({ length: 75 }, (_, i) => i + 1),
      sorteados: [],
      ativa: false,
      premio,
      vencedor: null,
    };

    socket.join(codigo);
    socket.data.sala  = codigo;
    socket.data.papel = 'adm';

    console.log(`[SALA] ${codigo} criada por ${nomeAdm}`);
    cb({ ok: true, codigo, cartelas: cartelas.length });
  });

  // ── Jogador: entrar na sala ──────────────────────────────────────────────
  socket.on('entrar_sala', ({ codigo, nomeJogador }, cb) => {
    const s = salas[codigo?.toUpperCase()];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    if (s.vencedor) return cb({ ok: false, erro: 'Jogo já encerrado' });

    const jogadorId = socket.id;
    s.jogadores[jogadorId] = { nome: nomeJogador, socketId: socket.id };

    socket.join(codigo.toUpperCase());
    socket.data.sala  = codigo.toUpperCase();
    socket.data.papel = 'jogador';

    // informa o ADM que alguém entrou
    io.to(s.adm.socketId).emit('jogador_entrou', {
      jogadorId,
      nome: nomeJogador,
      total: Object.keys(s.jogadores).length,
    });

    console.log(`[SALA] ${nomeJogador} entrou em ${codigo}`);
    cb({ ok: true, sorteados: s.sorteados, ativa: s.ativa, premio: s.premio });
  });

  // ── ADM: distribuir cartela para jogador ─────────────────────────────────
  socket.on('distribuir_cartela', ({ codigo, jogadorId, quantidade }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false, erro: 'Não autorizado' });

    const disponíveis = s.cartelas.filter(c => !Object.values(s.cartelasVendidas).flat().find(v => v.id === c.id));
    const qtd = Math.min(quantidade || 1, disponíveis.length);
    if (qtd === 0) return cb({ ok: false, erro: 'Sem cartelas disponíveis' });

    const lote = disponíveis.slice(0, qtd);
    s.cartelasVendidas[jogadorId] = [...(s.cartelasVendidas[jogadorId] || []), ...lote];

    // envia cartelas ao jogador
    io.to(jogadorId).emit('receber_cartelas', { cartelas: lote, sorteados: s.sorteados });
    cb({ ok: true, distribuídas: qtd });
  });

  // ── Jogador: pegar cartela própria (auto-serve quando sala permite) ───────
  socket.on('pegar_cartela', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    if (s.ativa) return cb({ ok: false, erro: 'Jogo em andamento' });

    const jogadorId = socket.id;
    const disponíveis = s.cartelas.filter(c =>
      !Object.values(s.cartelasVendidas).flat().find(v => v.id === c.id)
    );
    if (!disponíveis.length) return cb({ ok: false, erro: 'Sem cartelas disponíveis' });

    const cartela = disponíveis[0];
    s.cartelasVendidas[jogadorId] = [...(s.cartelasVendidas[jogadorId] || []), cartela];

    cb({ ok: true, cartela, sorteados: s.sorteados });
  });

  // ── ADM: iniciar jogo ────────────────────────────────────────────────────
  socket.on('iniciar_jogo', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false });
    s.ativa = true;
    io.to(codigo).emit('jogo_iniciado', { premio: s.premio });
    console.log(`[JOGO] ${codigo} iniciado`);
    cb({ ok: true });
  });

  // ── ADM: sortear número ──────────────────────────────────────────────────
  socket.on('sortear', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id || !s.ativa) return cb({ ok: false });

    const resultado = sorteiarNumero(codigo);
    if (!resultado) return cb({ ok: false, erro: 'Sem números restantes' });

    io.to(codigo).emit('numero_sorteado', resultado);
    cb({ ok: true, ...resultado });
  });

  // ── Jogador: gritar BINGO ────────────────────────────────────────────────
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

    io.to(codigo).emit('bingo_confirmado', {
      vencedor: s.vencedor,
      sorteados: s.sorteados,
      premio: s.premio,
    });

    console.log(`[BINGO] ${s.vencedor.nome} venceu em ${codigo}`);
    cb({ ok: true });
  });

  // ── Status da sala ───────────────────────────────────────────────────────
  socket.on('status_sala', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s) return cb({ ok: false });
    cb({
      ok: true,
      jogadores: Object.values(s.jogadores).map(j => j.nome),
      sorteados: s.sorteados,
      ativa: s.ativa,
      vencedor: s.vencedor,
      cartelas_restantes: s.cartelas.filter(c =>
        !Object.values(s.cartelasVendidas).flat().find(v => v.id === c.id)
      ).length,
    });
  });

  // ── Desconexão ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { sala, papel } = socket.data || {};
    if (!sala || !salas[sala]) return;

    if (papel === 'adm') {
      // ADM sumiu — avisa jogadores mas mantém estado
      io.to(sala).emit('adm_desconectado');
      console.log(`[WARN] ADM de ${sala} desconectou`);
    } else {
      delete salas[sala]?.jogadores[socket.id];
    }
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`GeriBingo Server rodando na porta ${PORT} 🎱`));
