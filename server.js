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

  // ── ADM: criar sala ────────────────────────────────────────────────────
  // Agora recebe: nomeAdm, valorCartela, chavePix, quantidadeCartelas
  socket.on('criar_sala', ({ nomeAdm, valorCartela, chavePix, quantidadeCartelas }, cb) => {
    let codigo;
    do { codigo = gerarCodigo(); } while (salas[codigo]);

    const cartelas = gerarBolao(codigo, quantidadeCartelas || 100);

    salas[codigo] = {
      codigo,
      adm: { socketId: socket.id, nome: nomeAdm },
      jogadores: {},
      cartelas,
      cartelasVendidas: {},
      solicitacoes: {},      // jogadorId → { dados, status: 'pendente'|'aprovado'|'rejeitado' }
      numeros: Array.from({ length: 75 }, (_, i) => i + 1),
      sorteados: [],
      ativa: false,
      valorCartela: valorCartela || 0,
      chavePix: chavePix || '',
      vencedor: null,
    };

    socket.join(codigo);
    socket.data.sala  = codigo;
    socket.data.papel = 'adm';

    console.log(`[SALA] ${codigo} criada por ${nomeAdm} — Pix: ${chavePix} — R$${valorCartela}`);
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

    io.to(s.adm.socketId).emit('jogador_entrou', {
      jogadorId,
      nome: nomeJogador,
      total: Object.keys(s.jogadores).length,
    });

    console.log(`[SALA] ${nomeJogador} entrou em ${codigo}`);
    cb({
      ok: true,
      sorteados: s.sorteados,
      ativa: s.ativa,
      valorCartela: s.valorCartela,
      chavePix: s.chavePix,
    });
  });

  // ── Jogador: solicitar cartela (envia dados pessoais + pagamento) ────────
  socket.on('solicitar_cartela', ({ codigo, dados }, cb) => {
    // dados = { nome, cpf, celular, chavePix, email? }
    const s = salas[codigo];
    if (!s) return cb({ ok: false, erro: 'Sala não encontrada' });
    if (s.ativa) return cb({ ok: false, erro: 'Jogo já em andamento' });

    const jogadorId = socket.id;

    // Verifica se já tem 3 cartelas aprovadas
    const cartelasDoJogador = s.cartelasVendidas[jogadorId] || [];
    if (cartelasDoJogador.length >= 3) {
      return cb({ ok: false, erro: 'Você já tem o máximo de 3 cartelas!' });
    }

    // Verifica se já tem solicitação pendente
    const solicitacaoAtual = s.solicitacoes[jogadorId];
    if (solicitacaoAtual && solicitacaoAtual.status === 'pendente') {
      return cb({ ok: false, erro: 'Você já tem uma solicitação pendente. Aguarde o sorteador aprovar.' });
    }

    // Registra solicitação
    s.solicitacoes[jogadorId] = {
      jogadorId,
      nome: dados.nome || s.jogadores[jogadorId]?.nome || 'Jogador',
      cpf: dados.cpf,
      celular: dados.celular,
      chavePix: dados.chavePix,
      email: dados.email || '',
      status: 'pendente',
      timestamp: Date.now(),
      cartelasJaTem: cartelasDoJogador.length,
    };

    // Avisa o ADM
    io.to(s.adm.socketId).emit('nova_solicitacao', {
      jogadorId,
      nome: s.solicitacoes[jogadorId].nome,
      cpf: dados.cpf,
      celular: dados.celular,
      chavePix: dados.chavePix,
      email: dados.email || '',
      cartelasJaTem: cartelasDoJogador.length,
      timestamp: Date.now(),
    });

    console.log(`[SOLICITACAO] ${dados.nome} solicitou cartela em ${codigo}`);
    cb({ ok: true, mensagem: 'Solicitação enviada! Aguarde o sorteador aprovar.' });
  });

  // ── ADM: aprovar solicitação ─────────────────────────────────────────────
  socket.on('aprovar_cartela', ({ codigo, jogadorId }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false, erro: 'Não autorizado' });

    const solicitacao = s.solicitacoes[jogadorId];
    if (!solicitacao) return cb({ ok: false, erro: 'Solicitação não encontrada' });

    // Verifica cartelas disponíveis
    const disponiveis = s.cartelas.filter(c =>
      !Object.values(s.cartelasVendidas).flat().find(v => v.id === c.id)
    );
    if (!disponiveis.length) return cb({ ok: false, erro: 'Sem cartelas disponíveis' });

    const cartela = disponiveis[0];
    s.cartelasVendidas[jogadorId] = [...(s.cartelasVendidas[jogadorId] || []), cartela];
    s.solicitacoes[jogadorId].status = 'aprovado';

    // Envia cartela ao jogador
    io.to(jogadorId).emit('cartela_aprovada', {
      cartela,
      sorteados: s.sorteados,
      mensagem: '✅ Pagamento confirmado! Sua cartela foi liberada.',
    });

    console.log(`[APROVADO] Cartela liberada para ${solicitacao.nome} em ${codigo}`);
    cb({ ok: true });
  });

  // ── ADM: rejeitar solicitação ────────────────────────────────────────────
  socket.on('rejeitar_cartela', ({ codigo, jogadorId, motivo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false, erro: 'Não autorizado' });

    const solicitacao = s.solicitacoes[jogadorId];
    if (!solicitacao) return cb({ ok: false, erro: 'Solicitação não encontrada' });

    s.solicitacoes[jogadorId].status = 'rejeitado';

    // Avisa o jogador
    io.to(jogadorId).emit('cartela_rejeitada', {
      mensagem: motivo || '❌ Pagamento não confirmado. Tente novamente.',
    });

    console.log(`[REJEITADO] Solicitação de ${solicitacao.nome} rejeitada em ${codigo}`);
    cb({ ok: true });
  });

  // ── ADM: iniciar jogo ────────────────────────────────────────────────────
  socket.on('iniciar_jogo', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s || s.adm.socketId !== socket.id) return cb({ ok: false });
    s.ativa = true;
    io.to(codigo).emit('jogo_iniciado', { valorCartela: s.valorCartela });
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
    });
    console.log(`[BINGO] ${s.vencedor.nome} venceu em ${codigo}`);
    cb({ ok: true });
  });

  // ── Status da sala ────────────────────────────────────────────────────────
  socket.on('status_sala', ({ codigo }, cb) => {
    const s = salas[codigo];
    if (!s) return cb({ ok: false });
    cb({
      ok: true,
      jogadores: Object.values(s.jogadores).map(j => j.nome),
      sorteados: s.sorteados,
      ativa: s.ativa,
      vencedor: s.vencedor,
      solicitacoesPendentes: Object.values(s.solicitacoes).filter(sol => sol.status === 'pendente').length,
      cartelas_restantes: s.cartelas.filter(c =>
        !Object.values(s.cartelasVendidas).flat().find(v => v.id === c.id)
      ).length,
    });
  });

  // ── Desconexão ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { sala, papel } = socket.data || {};
    if (!sala || !salas[sala]) return;
    if (papel === 'adm') {
      io.to(sala).emit('adm_desconectado');
      console.log(`[WARN] ADM de ${sala} desconectou`);
    } else {
      delete salas[sala]?.jogadores[socket.id];
    }
  });
});

// ─── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Lux Bingo Server rodando na porta ${PORT} 🎱`));