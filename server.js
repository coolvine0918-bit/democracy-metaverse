const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// 정적 파일 서빙: public 및 assets 폴더
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// 맵 & 소회의실(카페 7개) 구조 정의 (전체 맵 크기: 2400 x 1800)
const MAP_CONFIG = {
  width: 2400,
  height: 1800,
  plaza: {
    name: '중앙 광장 (민주 아고라)',
    centerX: 1200,
    centerY: 920,
    radius: 300
  },
  cafes: [
    { id: 1, name: '민주 카페', x: 600, y: 450, w: 260, h: 220, color: '#3B82F6', max: 4 },
    { id: 2, name: '참여 카페', x: 1200, y: 340, w: 260, h: 220, color: '#10B981', max: 4 },
    { id: 3, name: '공화 카페', x: 1800, y: 450, w: 260, h: 220, color: '#8B5CF6', max: 4 },
    { id: 4, name: '토론 카페', x: 1920, y: 1050, w: 260, h: 220, color: '#F59E0B', max: 4 },
    { id: 5, name: '평등 카페', x: 1600, y: 1520, w: 260, h: 220, color: '#EC4899', max: 4 },
    { id: 6, name: '정의 카페', x: 800, y: 1520, w: 260, h: 220, color: '#06B6D4', max: 4 },
    { id: 7, name: '자유 카페', x: 480, y: 1050, w: 260, h: 220, color: '#EF4444', max: 4 }
  ]
};

// 서버 상태
const players = new Map(); // socket.id -> player state
const gameState = {
  agenda: {
    id: 0,
    text: '',
    active: false,
    timestamp: null
  },
  voteActive: false,
  handRaiseQueue: [] // [{ socketId, nickname, time }]
};

// 카페 내 인원 수 확인 함수
function getCafeOccupants(cafeId, excludeSocketId = null) {
  let count = 0;
  for (const [id, p] of players.entries()) {
    if (id !== excludeSocketId && p.cafeId === cafeId) {
      count++;
    }
  }
  return count;
}

// 특정 좌표가 카페 안에 속하는지 판정
function findCafeAtPosition(x, y) {
  for (const cafe of MAP_CONFIG.cafes) {
    if (
      x >= cafe.x - cafe.w / 2 &&
      x <= cafe.x + cafe.w / 2 &&
      y >= cafe.y - cafe.h / 2 &&
      y <= cafe.y + cafe.h / 2
    ) {
      return cafe;
    }
  }
  return null;
}

// 실시간 집계 계산
function computeVoteTally() {
  let agree = 0;
  let disagree = 0;
  let totalStudents = 0;

  for (const p of players.values()) {
    if (!p.isAdmin) {
      totalStudents++;
      if (p.vote === 'agree') agree++;
      else if (p.vote === 'disagree') disagree++;
    }
  }

  const undecided = Math.max(0, totalStudents - (agree + disagree));
  return {
    agree,
    disagree,
    undecided,
    totalStudents,
    voteActive: gameState.voteActive
  };
}

// 카페별 현황 데이터 요약
function computeCafeStatus() {
  return MAP_CONFIG.cafes.map(cafe => {
    const occupants = [];
    for (const p of players.values()) {
      if (p.cafeId === cafe.id) {
        occupants.push({ id: p.id, nickname: p.nickname });
      }
    }
    return {
      id: cafe.id,
      name: cafe.name,
      current: occupants.length,
      max: cafe.max,
      occupants
    };
  });
}

// 소켓 연결 핸들러
io.on('connection', (socket) => {
  console.log(`[접속] 새 클라이언트 연결: ${socket.id}`);

  // 1. 플레이어 광장 입장
  socket.on('joinPlaza', (data) => {
    const { nickname, characterIndex, isAdmin } = data || {};
    const safeNick = (nickname || '학생_' + socket.id.slice(0, 4)).trim().slice(0, 12);
    const charIdx = Math.max(0, Math.min(4, parseInt(characterIndex) || 0));

    // 중앙 광장 내 무작위 스폰 위치 설정
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = Math.random() * 120;
    const spawnX = Math.round(MAP_CONFIG.plaza.centerX + Math.cos(spawnAngle) * spawnDist);
    const spawnY = Math.round(MAP_CONFIG.plaza.centerY + Math.sin(spawnAngle) * spawnDist);

    const newPlayer = {
      id: socket.id,
      nickname: safeNick,
      characterIndex: charIdx,
      x: spawnX,
      y: spawnY,
      facing: 'down',
      statusEmoji: '',
      speechText: '',
      speechUntil: 0,
      cafeId: null, // null = 중앙 광장
      vote: null,
      handRaised: false,
      isAdmin: !!isAdmin
    };

    players.set(socket.id, newPlayer);

    // 접속한 클라이언트에게 초기화 정보 전송
    socket.emit('initSuccess', {
      myId: socket.id,
      mapConfig: MAP_CONFIG,
      players: Array.from(players.values()),
      agenda: gameState.agenda,
      voteActive: gameState.voteActive,
      voteTally: computeVoteTally(),
      cafeStatus: computeCafeStatus(),
      handRaiseQueue: gameState.handRaiseQueue
    });

    // 다른 모든 플레이어에게 새 접속자 알림
    socket.broadcast.emit('playerJoined', newPlayer);
    io.emit('voteTallyUpdated', computeVoteTally());
    io.emit('cafeStatusUpdated', computeCafeStatus());
  });

  // 2. 플레이어 이동 및 카페 정원(최대 4명) 판정
  socket.on('playerMove', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const { x, y, facing } = data;
    const clampedX = Math.max(50, Math.min(MAP_CONFIG.width - 50, x));
    const clampedY = Math.max(50, Math.min(MAP_CONFIG.height - 50, y));

    // 진입하려는 위치의 카페 판정
    const targetCafe = findCafeAtPosition(clampedX, clampedY);

    if (targetCafe) {
      // 이미 해당 카페에 있던 플레이어가 아닐 경우 정원(4명) 체크
      if (player.cafeId !== targetCafe.id) {
        const currentCount = getCafeOccupants(targetCafe.id, socket.id);
        if (currentCount >= targetCafe.max) {
          // 정원 초과! 튕겨내기 (카페 입구 밖으로 밀어냄)
          const angleFromCenter = Math.atan2(clampedY - targetCafe.y, clampedX - targetCafe.x);
          const bounceDistance = Math.max(targetCafe.w, targetCafe.h) / 2 + 55;
          const bounceX = Math.round(targetCafe.x + Math.cos(angleFromCenter) * bounceDistance);
          const bounceY = Math.round(targetCafe.y + Math.sin(angleFromCenter) * bounceDistance);

          player.x = bounceX;
          player.y = bounceY;

          socket.emit('cafeEntryRejected', {
            cafeId: targetCafe.id,
            cafeName: targetCafe.name,
            max: targetCafe.max,
            current: currentCount,
            bounceX,
            bounceY,
            message: `[정원 초과] '${targetCafe.name}'은 이미 정원(${targetCafe.max}명)이 찼습니다!`
          });

          io.emit('playerMoved', {
            id: player.id,
            x: player.x,
            y: player.y,
            facing: player.facing,
            cafeId: player.cafeId
          });
          return;
        }

        // 정원 여유 있음 -> 카페 진입 처리
        player.cafeId = targetCafe.id;
        socket.emit('cafeEntered', {
          cafeId: targetCafe.id,
          cafeName: targetCafe.name,
          current: currentCount + 1,
          max: targetCafe.max
        });
        io.emit('cafeStatusUpdated', computeCafeStatus());
      }
    } else {
      // 카페 구역 밖으로 나온 경우 (중앙 광장)
      if (player.cafeId !== null) {
        player.cafeId = null;
        socket.emit('cafeExited');
        io.emit('cafeStatusUpdated', computeCafeStatus());
      }
    }

    player.x = clampedX;
    player.y = clampedY;
    if (facing) player.facing = facing;

    // 다른 클라이언트에 이동 브로드캐스트
    socket.broadcast.emit('playerMoved', {
      id: player.id,
      x: player.x,
      y: player.y,
      facing: player.facing,
      cafeId: player.cafeId
    });
  });

  // 3. 채팅 메시지 (소회의실/광장 분리)
  socket.on('chatMessage', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const text = (data.text || '').trim().slice(0, 80);
    if (!text) return;

    const now = Date.now();
    player.speechText = text;
    player.speechUntil = now + 4000;
    player.statusEmoji = '💬';

    const msgPayload = {
      senderId: player.id,
      nickname: player.nickname,
      characterIndex: player.characterIndex,
      text,
      cafeId: player.cafeId,
      timestamp: now
    };

    if (player.cafeId !== null) {
      // [소회의실 채팅]: 같은 카페에 있는 사람들에게만 전송
      const targetCafe = MAP_CONFIG.cafes.find(c => c.id === player.cafeId);
      msgPayload.cafeName = targetCafe ? targetCafe.name : '카페';
      
      for (const [id, p] of players.entries()) {
        if (p.cafeId === player.cafeId) {
          io.to(id).emit('chatBroadcast', msgPayload);
        }
      }
    } else {
      // [중앙 광장 전체 채팅]: 광장에 있는 모든 플레이어에게 전송
      msgPayload.cafeName = '중앙 광장';
      for (const [id, p] of players.entries()) {
        if (p.cafeId === null) {
          io.to(id).emit('chatBroadcast', msgPayload);
        }
      }
    }

    // 캐릭터 머리 위 💬 말풍선 표시 동기화
    io.emit('playerStatusChanged', {
      id: player.id,
      statusEmoji: '💬',
      speechText: text
    });

    // 4초 후 말풍선 닫기 (투표나 손들기 상태가 있다면 복원)
    setTimeout(() => {
      const curP = players.get(player.id);
      if (curP && curP.speechUntil <= Date.now()) {
        curP.speechText = '';
        if (curP.handRaised) curP.statusEmoji = '✋';
        else if (curP.vote === 'agree') curP.statusEmoji = '✅';
        else if (curP.vote === 'disagree') curP.statusEmoji = '❌';
        else curP.statusEmoji = '';

        io.emit('playerStatusChanged', {
          id: curP.id,
          statusEmoji: curP.statusEmoji,
          speechText: ''
        });
      }
    }, 4000);
  });

  // 4. 학생 찬반 표결 (✅ / ❌)
  socket.on('vote', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const { choice } = data; // 'agree' | 'disagree' | 'cancel'
    if (choice === 'agree') {
      player.vote = 'agree';
      player.statusEmoji = '✅';
    } else if (choice === 'disagree') {
      player.vote = 'disagree';
      player.statusEmoji = '❌';
    } else {
      player.vote = null;
      player.statusEmoji = player.handRaised ? '✋' : '';
    }

    io.emit('playerStatusChanged', {
      id: player.id,
      statusEmoji: player.statusEmoji,
      vote: player.vote
    });
    io.emit('voteTallyUpdated', computeVoteTally());
  });

  // 5. 학생 발언 신청 (✋ 토글)
  socket.on('raiseHand', () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.handRaised = !player.handRaised;
    if (player.handRaised) {
      player.statusEmoji = '✋';
      if (!gameState.handRaiseQueue.some(item => item.socketId === player.id)) {
        gameState.handRaiseQueue.push({
          socketId: player.id,
          nickname: player.nickname,
          time: Date.now()
        });
      }
    } else {
      // 손 내림
      gameState.handRaiseQueue = gameState.handRaiseQueue.filter(item => item.socketId !== player.id);
      if (player.vote === 'agree') player.statusEmoji = '✅';
      else if (player.vote === 'disagree') player.statusEmoji = '❌';
      else player.statusEmoji = '';
    }

    io.emit('playerStatusChanged', {
      id: player.id,
      statusEmoji: player.statusEmoji,
      handRaised: player.handRaised
    });
    io.emit('handRaiseQueueUpdated', gameState.handRaiseQueue);
  });

  // ================= 교사 관리자(Admin) 전용 이벤트 =================

  // [안건 송출 퀵 버튼 및 수동 안건]
  socket.on('adminSetAgenda', (data) => {
    const { text } = data;
    if (!text) return;

    gameState.agenda = {
      id: Date.now(),
      text: text.trim(),
      active: true,
      timestamp: Date.now()
    };

    io.emit('agendaAnnounced', gameState.agenda);
  });

  // [광장 소환 버튼]: 모든 학생을 즉시 중앙 광장 좌표로 텔레포트
  socket.on('adminSummonAll', () => {
    console.log('[교사 관리자] 모든 학생을 중앙 광장으로 소환합니다.');

    const summonedPositions = [];
    for (const [id, player] of players.entries()) {
      player.cafeId = null; // 카페에서 모두 퇴장

      // 광장 중심부에 방사형으로 고르게 재배치
      const angle = Math.random() * Math.PI * 2;
      const radius = 40 + Math.random() * 160;
      player.x = Math.round(MAP_CONFIG.plaza.centerX + Math.cos(angle) * radius);
      player.y = Math.round(MAP_CONFIG.plaza.centerY + Math.sin(angle) * radius);
      player.facing = 'down';

      summonedPositions.push({
        id: player.id,
        x: player.x,
        y: player.y,
        cafeId: null
      });
    }

    io.emit('summonedToPlaza', {
      message: '선생님이 모든 학생을 중앙 광장으로 소환했습니다! 🏛️',
      players: summonedPositions
    });
    io.emit('cafeStatusUpdated', computeCafeStatus());
  });

  // [투표 활성화 / 마감 토글]
  socket.on('adminToggleVote', (data) => {
    const { active } = data;
    gameState.voteActive = !!active;

    io.emit('voteStateChanged', {
      voteActive: gameState.voteActive,
      voteTally: computeVoteTally()
    });
  });

  // [투표 초기화]
  socket.on('adminResetVotes', () => {
    for (const player of players.values()) {
      player.vote = null;
      if (player.statusEmoji === '✅' || player.statusEmoji === '❌') {
        player.statusEmoji = player.handRaised ? '✋' : '';
      }
    }
    io.emit('votesReset');
    io.emit('voteTallyUpdated', computeVoteTally());
    io.emit('allPlayerStatusesReset');
  });

  // [발언 신청 대기열 단일 완료/삭제]
  socket.on('adminClearSpeaker', (data) => {
    const { socketId } = data;
    gameState.handRaiseQueue = gameState.handRaiseQueue.filter(item => item.socketId !== socketId);
    const targetPlayer = players.get(socketId);
    if (targetPlayer) {
      targetPlayer.handRaised = false;
      if (targetPlayer.vote === 'agree') targetPlayer.statusEmoji = '✅';
      else if (targetPlayer.vote === 'disagree') targetPlayer.statusEmoji = '❌';
      else targetPlayer.statusEmoji = '';

      io.emit('playerStatusChanged', {
        id: targetPlayer.id,
        statusEmoji: targetPlayer.statusEmoji,
        handRaised: false
      });
    }
    io.emit('handRaiseQueueUpdated', gameState.handRaiseQueue);
  });

  // 6. 연결 해제
  socket.on('disconnect', () => {
    console.log(`[퇴장] 클라이언트 연결 종료: ${socket.id}`);
    const player = players.get(socket.id);
    if (player) {
      gameState.handRaiseQueue = gameState.handRaiseQueue.filter(item => item.socketId !== socket.id);
      players.delete(socket.id);

      io.emit('playerLeft', { id: socket.id, nickname: player.nickname });
      io.emit('voteTallyUpdated', computeVoteTally());
      io.emit('cafeStatusUpdated', computeCafeStatus());
      io.emit('handRaiseQueueUpdated', gameState.handRaiseQueue);
    }
  });
});

// 서버 실행
server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log(`🏛️ 중학교 사회 수업용 2D 메타버스 서버 실행 완료!`);
  console.log(`🌐 학생 접속 주소: http://localhost:${PORT}`);
  console.log(`👨‍🏫 교사 관리자 주소: http://localhost:${PORT}/?admin=true`);
  console.log('========================================================');
});
