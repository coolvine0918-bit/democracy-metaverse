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

// 맵 & 소회의실(카페 7개) 및 광장 오브젝트 구조 정의 (전체 맵 크기: 2400 x 1800)
const MAP_CONFIG = {
  width: 2400,
  height: 1800,
  plaza: {
    name: '중앙 광장 (민주 아고라)',
    centerX: 1200,
    centerY: 920,
    radius: 300
  },
  ballotBox: {
    x: 1200,
    y: 840,
    w: 56,
    h: 56,
    name: '비밀 투표함 🗳️'
  },
  noticeBoard: {
    x: 1040,
    y: 840,
    w: 64,
    h: 44,
    name: '마을 자치 게시판 📋'
  },
  fountain: {
    x: 1200,
    y: 960,
    radius: 46
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

// 게시판 학습자료 (안건별 찬반 쟁점)
const NOTICE_MATERIALS = {
  1: {
    title: '촉법소년 제도 폐지 찬반 쟁점',
    content: '▶ 찬성: 흉악 소년범죄 증가 및 피해자 인권 보호를 위해 엄벌 필요.\n▶ 반대: 처벌보다 교화와 사회 복귀 기회 부여가 청소년 범죄 예방에 더 효과적임.'
  },
  2: {
    title: '교내 스마트폰 반입/사용 금지 쟁점',
    content: '▶ 찬성: 수업 집중도 향상, 사이버 폭력 예방, 대면 소통 증진.\n▶ 반대: 학생의 통신의 자유 및 자율성 침해, 디지털 학습 도구 활용 제한.'
  },
  3: {
    title: '노키즈존(노틴존) 운영 금지 쟁점',
    content: '▶ 찬성: 나이를 이유로 한 차별 행위 금지 및 아동·청소년 권리 보장.\n▶ 반대: 사업자의 영업의 자유 및 다른 손님들의 조용히 쉴 권리 보장.'
  }
};

// 서버 상태 및 학급(Class) 관리
const players = new Map(); // socket.id -> player state
const classSessionHistory = []; // 지난 학급 수업 결과 아카이브 목록

const gameState = {
  currentClassName: '1반', // 현재 진행 중인 학급명
  agenda: {
    id: 1,
    text: "안건 1: 소년범죄 증가에 따라 '촉법소년' 제도를 완전히 폐지하고 성인과 동일하게 처벌해야 하는가?",
    active: true,
    timestamp: Date.now()
  },
  voteActive: false,
  handRaiseQueue: [],
  discussionTimer: {
    active: false,
    duration: 180, // 3분 (180초)
    endsAt: 0,
    timerId: null
  }
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
  let badgeCount = 0;

  for (const p of players.values()) {
    if (!p.isAdmin) {
      totalStudents++;
      if (p.vote === 'agree') agree++;
      else if (p.vote === 'disagree') disagree++;
      if (p.hasBadge) badgeCount++;
    }
  }

  const undecided = Math.max(0, totalStudents - (agree + disagree));
  return {
    agree,
    disagree,
    undecided,
    totalStudents,
    badgeCount,
    voteActive: gameState.voteActive,
    currentClassName: gameState.currentClassName
  };
}

// 실시간 아고라 진영(찬성/반대/중립) 여론 집계 계산
function computeStanceTally() {
  let pro = 0;
  let con = 0;
  let neutral = 0;
  let total = 0;

  for (const p of players.values()) {
    if (!p.isAdmin) {
      total++;
      if (p.currentStance === 'pro') pro++;
      else if (p.currentStance === 'con') con++;
      else neutral++;
    }
  }

  const proPercent = total > 0 ? Math.round((pro / total) * 100) : 0;
  const conPercent = total > 0 ? Math.round((con / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.max(0, 100 - (proPercent + conPercent)) : 0;

  return {
    pro,
    con,
    neutral,
    total,
    proPercent,
    conPercent,
    neutralPercent
  };
}

// 카페별 현황 데이터 요약
function computeCafeStatus() {
  return MAP_CONFIG.cafes.map(cafe => {
    const occupants = [];
    for (const p of players.values()) {
      if (p.cafeId === cafe.id) {
        occupants.push({ id: p.id, nickname: p.nickname, hasBadge: p.hasBadge });
      }
    }
    return {
      id: cafe.id,
      name: cafe.name,
      current: occupants.length,
      max: cafe.max,
      occupants,
      isLocked: occupants.length >= cafe.max
    };
  });
}

// 학생별 퀘스트 진행도 및 투표 결과 데이터 요약
function getQuestProgressSummary() {
  const list = [];
  for (const p of players.values()) {
    if (!p.isAdmin) {
      const q = p.quest;
      let completedCount = 0;
      if (q.m1) completedCount++;
      if (q.m2) completedCount++;
      if (q.m3 >= 2) completedCount++;
      if (q.m4) completedCount++;

      list.push({
        id: p.id,
        className: p.className || gameState.currentClassName,
        nickname: p.nickname,
        completedCount,
        hasBadge: p.hasBadge,
        vote: p.vote,
        quest: p.quest,
        joinedAt: p.joinedAt
      });
    }
  }
  return list;
}

// 접속 학생 목록 요약 (교사 관리자용 모니터링 & 학생 삭제 기능)
function getConnectedStudentsList() {
  const list = [];
  for (const p of players.values()) {
    if (!p.isAdmin) {
      const cafe = p.cafeId ? MAP_CONFIG.cafes.find(c => c.id === p.cafeId) : null;
      list.push({
        id: p.id,
        nickname: p.nickname,
        className: p.className || gameState.currentClassName,
        location: cafe ? cafe.name : '중앙 광장',
        cafeId: p.cafeId,
        vote: p.vote,
        handRaised: p.handRaised,
        hasBadge: p.hasBadge,
        joinedAt: p.joinedAt
      });
    }
  }
  return list;
}

// ================= [수업 결과 엑셀(CSV) 다운로드 API] =================
app.get('/api/export-results', (req, res) => {
  const targetClass = req.query.class || gameState.currentClassName || '1반';
  const rows = [
    ['학급', '학생이름', '최종투표', '미션1(안건확인)', '미션2(자료조사)', '미션3(카페토론회수)', '미션4(비밀투표)', '배지획득여부', '안건내용', '접속일시']
  ];

  for (const p of players.values()) {
    if (!p.isAdmin) {
      if (targetClass === 'all' || p.className === targetClass || !p.className) {
        rows.push([
          p.className || targetClass,
          p.nickname,
          p.vote === 'agree' ? '찬성' : (p.vote === 'disagree' ? '반대' : '미투표'),
          p.quest.m1 ? '완료' : '미완료',
          p.quest.m2 ? '완료' : '미완료',
          `${p.quest.m3 || 0}회`,
          p.quest.m4 ? '완료' : '미완료',
          p.hasBadge ? '🏅 획득' : '미획득',
          gameState.agenda.text,
          new Date(p.joinedAt || Date.now()).toLocaleTimeString('ko-KR')
        ]);
      }
    }
  }

  // UTF-8 BOM (\uFEFF) 추가로 엑셀 한글 깨짐 방지
  const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const filename = encodeURIComponent(`직접민주주의_수업결과_${targetClass}_${new Date().toISOString().slice(0, 10)}.csv`);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
  res.send(csvContent);
});

// 소켓 연결 핸들러
io.on('connection', (socket) => {
  console.log(`[접속] 새 클라이언트 연결: ${socket.id}`);

  // 1. 플레이어 광장 입장 (학급 정보 포함)
  socket.on('joinPlaza', (data) => {
    const { nickname, characterIndex, className, isAdmin } = data || {};
    
    // 교사 관리자인 경우: 닉네임과 학급, 캐릭터를 전용 '선생님'으로 고정
    let safeNick = (nickname || '학생_' + socket.id.slice(0, 4)).trim().slice(0, 12);
    let safeClass = (className || gameState.currentClassName || '1반').trim();
    let charIdx = Math.max(0, Math.min(4, parseInt(characterIndex) || 0));

    if (isAdmin) {
      safeNick = '민부영 선생님';
      safeClass = '교사';
      charIdx = 99; // 교사용 전용 캐릭터 고정 번호
    } else {
      // [학생 재접속/튕김 자동 정리]: 동일 닉네임의 기존 학생 세션이 남아있다면 중복 아바타 즉시 삭제
      for (const [existingId, p] of players.entries()) {
        if (existingId !== socket.id && !p.isAdmin && p.nickname === safeNick) {
          console.log(`[중복/재접속 감지] 기존 세션(${existingId}, ${safeNick})을 새 세션(${socket.id})으로 교체합니다.`);
          players.delete(existingId);
          gameState.handRaiseQueue = gameState.handRaiseQueue.filter(i => i.socketId !== existingId);
          const oldSock = io.sockets.sockets.get(existingId);
          if (oldSock) {
            try { oldSock.disconnect(true); } catch (e) {}
          }
          io.emit('playerLeft', { id: existingId, nickname: p.nickname });
        }
      }
    }

    // 중앙 광장 내 스폰 위치 설정 (교사는 북쪽 단상 앞 넓고 트인 위치)
    let spawnX, spawnY;
    if (isAdmin) {
      spawnX = MAP_CONFIG.plaza.centerX; // 1200
      spawnY = 740; // 투표함(840)과 충분히 떨어진 넓은 단상 위치 (충돌 방지)
    } else {
      const spawnAngle = Math.random() * Math.PI * 2;
      const spawnDist = 50 + Math.random() * 110;
      spawnX = Math.round(MAP_CONFIG.plaza.centerX + Math.cos(spawnAngle) * spawnDist);
      spawnY = Math.round(MAP_CONFIG.plaza.centerY + Math.sin(spawnAngle) * spawnDist);
    }

    const newPlayer = {
      id: socket.id,
      className: safeClass,
      nickname: safeNick,
      characterIndex: charIdx,
      x: spawnX,
      y: spawnY,
      facing: 'down',
      statusEmoji: '',
      speechText: '',
      speechUntil: 0,
      cafeId: null,
      vote: null,
      currentStance: 'neutral', // 'pro' | 'con' | 'neutral'
      handRaised: false,
      hasBadge: false,
      joinedAt: Date.now(),
      quest: {
        m1: false,
        m2: false,
        m3: 0,
        m4: false
      },
      inventory: [
        { id: 'id_card', name: '시민 신분증', icon: '🪪', desc: `${safeClass} 소속 시민 신분증` },
        { id: 'agree_ballot', name: '찬성 투표용지', icon: '📜', type: 'ballot', voteChoice: 'agree', desc: '안건 찬성 표결용 용지 (투표함에 드래그 투입)' },
        { id: 'disagree_ballot', name: '반대 투표용지', icon: '📜', type: 'ballot', voteChoice: 'disagree', desc: '안건 반대 표결용 용지 (투표함에 드래그 투입)' },
        { id: 'debate_notes', name: '토론 노트', icon: '📔', desc: '조례안 쟁점 요약 수첩' }
      ],
      isAdmin: !!isAdmin
    };

    players.set(socket.id, newPlayer);

    socket.emit('initSuccess', {
      myId: socket.id,
      currentClassName: gameState.currentClassName,
      mapConfig: MAP_CONFIG,
      players: Array.from(players.values()),
      agenda: gameState.agenda,
      voteActive: gameState.voteActive,
      voteTally: computeVoteTally(),
      stanceTally: computeStanceTally(),
      cafeStatus: computeCafeStatus(),
      handRaiseQueue: gameState.handRaiseQueue,
      noticeMaterials: NOTICE_MATERIALS,
      discussionTimer: {
        active: gameState.discussionTimer.active,
        duration: gameState.discussionTimer.duration,
        endsAt: gameState.discussionTimer.endsAt
      },
      questProgressList: getQuestProgressSummary(),
      connectedStudents: getConnectedStudentsList()
    });

    socket.broadcast.emit('playerJoined', newPlayer);
    io.emit('voteTallyUpdated', computeVoteTally());
    io.emit('stanceTallyUpdated', computeStanceTally());
    io.emit('cafeStatusUpdated', computeCafeStatus());
    io.emit('questProgressUpdated', getQuestProgressSummary());
    io.emit('studentListUpdated', getConnectedStudentsList());
  });

  // 2. 플레이어 이동 및 카페 정원(최대 4명) 판정
  socket.on('playerMove', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const { x, y, facing } = data;
    const clampedX = Math.max(50, Math.min(MAP_CONFIG.width - 50, x));
    const clampedY = Math.max(50, Math.min(MAP_CONFIG.height - 50, y));

    const targetCafe = findCafeAtPosition(clampedX, clampedY);

    if (targetCafe) {
      if (player.cafeId !== targetCafe.id) {
        const currentCount = getCafeOccupants(targetCafe.id, socket.id);
        if (currentCount >= targetCafe.max) {
          const angleFromCenter = Math.atan2(clampedY - targetCafe.y, clampedX - targetCafe.x);
          const bounceDistance = Math.max(targetCafe.w, targetCafe.h) / 2 + 60;
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
            message: `[정원 초과] '${targetCafe.name}'은 이미 4명이 모두 입장하여 입구가 차단되었습니다!`
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
      if (player.cafeId !== null) {
        player.cafeId = null;
        socket.emit('cafeExited');
        io.emit('cafeStatusUpdated', computeCafeStatus());
      }
    }

    player.x = clampedX;
    player.y = clampedY;
    if (facing) player.facing = facing;

    socket.broadcast.emit('playerMoved', {
      id: player.id,
      x: player.x,
      y: player.y,
      facing: player.facing,
      cafeId: player.cafeId
    });
  });

  // 2-1. [아바타 진영 이동] 구역 경계선 통과 시에만 클라이언트에서 1회 전송
  socket.on('updateStance', (data) => {
    const player = players.get(socket.id);
    if (!player || player.isAdmin) return;

    const stance = data && data.stance ? data.stance : 'neutral';
    if (['pro', 'con', 'neutral'].includes(stance)) {
      player.currentStance = stance;

      // 1. 유저 진영 상태 변경 알림
      io.emit('playerStanceChanged', {
        id: player.id,
        stance: player.currentStance
      });

      // 2. 전체 여론 집계 브로드캐스트 (교사 콘솔 & 실시간 게이지)
      io.emit('stanceTallyUpdated', computeStanceTally());
    }
  });

  // 3. 채팅 메시지 및 카페 토론 미션 카운트
  socket.on('chatMessage', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const text = (data.text || '').trim().slice(0, 80);
    if (!text) return;

    const now = Date.now();
    player.speechText = text;
    player.speechUntil = now + 4000;
    player.statusEmoji = '💬';

    if (player.cafeId !== null && player.quest.m3 < 2) {
      player.quest.m3++;
      socket.emit('questUpdated', {
        quest: player.quest,
        message: `[미션 3 소회의실 토론] 발언 완료 (${player.quest.m3}/2회)!`
      });
      checkBadgeAward(player, socket);
      io.emit('questProgressUpdated', getQuestProgressSummary());
    }

    const isTeacher = !!player.isAdmin;
    const msgPayload = {
      senderId: player.id,
      className: player.className,
      nickname: player.nickname,
      characterIndex: player.characterIndex,
      text,
      cafeId: player.cafeId,
      timestamp: now,
      hasBadge: player.hasBadge,
      isTeacher
    };

    if (isTeacher) {
      msgPayload.cafeName = '선생님 공지 📢';
      // 교사의 채팅은 광장과 모든 소회의실(카페)의 전교생 전체 화면으로 송출!
      io.emit('chatBroadcast', msgPayload);
      // [학생 화면 중앙 대형 배너 송출]
      io.emit('teacherAnnouncement', {
        text,
        sender: player.nickname,
        timestamp: now
      });
    } else if (player.cafeId !== null) {
      const targetCafe = MAP_CONFIG.cafes.find(c => c.id === player.cafeId);
      msgPayload.cafeName = targetCafe ? targetCafe.name : '카페';
      
      for (const [id, p] of players.entries()) {
        if (p.cafeId === player.cafeId || p.isAdmin) {
          io.to(id).emit('chatBroadcast', msgPayload);
        }
      }
    } else {
      msgPayload.cafeName = '중앙 광장';
      for (const [id, p] of players.entries()) {
        if (p.cafeId === null || p.isAdmin) {
          io.to(id).emit('chatBroadcast', msgPayload);
        }
      }
    }

    io.emit('playerStatusChanged', {
      id: player.id,
      statusEmoji: '💬',
      speechText: text
    });

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

  // 3-1. 태블릿 퀵 리액션 이모티콘 파티클 이벤트 (👍, 🤔, ❌ 등)
  socket.on('quickReaction', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const emoji = (data && data.emoji ? data.emoji : '👍').slice(0, 4);
    const now = Date.now();
    player.statusEmoji = emoji;

    const payload = {
      playerId: player.id,
      nickname: player.nickname,
      x: player.x,
      y: player.y,
      emoji,
      timestamp: now
    };

    // 광장 또는 소회의실 전체에 브로드캐스트
    if (player.cafeId !== null) {
      for (const [id, p] of players.entries()) {
        if (p.cafeId === player.cafeId || p.isAdmin) {
          io.to(id).emit('reactionBroadcast', payload);
        }
      }
    } else {
      io.emit('reactionBroadcast', payload);
    }

    // 2.5초 후 기본 상태 이모지로 복원
    setTimeout(() => {
      const curP = players.get(player.id);
      if (curP && curP.statusEmoji === emoji) {
        if (curP.speechText) curP.statusEmoji = '💬';
        else if (curP.handRaised) curP.statusEmoji = '✋';
        else if (curP.vote === 'agree') curP.statusEmoji = '✅';
        else if (curP.vote === 'disagree') curP.statusEmoji = '❌';
        else curP.statusEmoji = '';

        io.emit('playerStatusChanged', {
          id: curP.id,
          statusEmoji: curP.statusEmoji
        });
      }
    }, 2500);
  });

  // 4. 인벤토리 투표용지 -> 투표함 투입 로직
  socket.on('submitBallotToBox', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    if (!gameState.voteActive) {
      socket.emit('systemNotification', { message: '선생님이 투표를 활성화할 때까지 기다려 주세요!', type: 'warn' });
      return;
    }

    const dist = Math.hypot(player.x - MAP_CONFIG.ballotBox.x, player.y - MAP_CONFIG.ballotBox.y);
    if (dist > 220) {
      socket.emit('systemNotification', { message: '광장 중앙의 [투표함 🗳️] 앞으로 다가가서 투표용지를 넣어주세요!', type: 'warn' });
      return;
    }

    const { choice } = data;
    if (choice === 'agree') {
      player.vote = 'agree';
      player.statusEmoji = '✅';
    } else if (choice === 'disagree') {
      player.vote = 'disagree';
      player.statusEmoji = '❌';
    }

    player.quest.m4 = true;
    checkBadgeAward(player, socket);

    io.emit('ballotSubmittedEffect', {
      studentId: player.id,
      nickname: player.nickname,
      x: MAP_CONFIG.ballotBox.x,
      y: MAP_CONFIG.ballotBox.y,
      choice: player.vote
    });

    io.emit('playerStatusChanged', {
      id: player.id,
      statusEmoji: player.statusEmoji,
      vote: player.vote
    });
    io.emit('voteTallyUpdated', computeVoteTally());
    io.emit('questProgressUpdated', getQuestProgressSummary());

    socket.emit('systemNotification', {
      message: `🗳️ 투표용지가 성공적으로 투표함에 들어갔습니다! (${choice === 'agree' ? '찬성' : '반대'})`,
      type: 'success'
    });
  });

  // 5. 일반 찬반 버튼 투표
  socket.on('vote', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const { choice } = data;
    if (choice === 'agree') {
      player.vote = 'agree';
      player.statusEmoji = '✅';
      player.quest.m4 = true;
    } else if (choice === 'disagree') {
      player.vote = 'disagree';
      player.statusEmoji = '❌';
      player.quest.m4 = true;
    } else {
      player.vote = null;
      player.statusEmoji = player.handRaised ? '✋' : '';
      player.quest.m4 = false;
    }

    checkBadgeAward(player, socket);

    io.emit('playerStatusChanged', {
      id: player.id,
      statusEmoji: player.statusEmoji,
      vote: player.vote
    });
    io.emit('voteTallyUpdated', computeVoteTally());
    io.emit('questProgressUpdated', getQuestProgressSummary());
  });

  // 6. 퀘스트 단계 완료
  socket.on('completeQuestStep', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const { step } = data;
    if (step === 'm1') {
      player.quest.m1 = true;
      socket.emit('questUpdated', { quest: player.quest, message: '미션 1 [안건 확인 완료] 달성!' });
    } else if (step === 'm2') {
      player.quest.m2 = true;
      socket.emit('questUpdated', { quest: player.quest, message: '미션 2 [마을 자료 열람 완료] 달성!' });
    }

    checkBadgeAward(player, socket);
    io.emit('questProgressUpdated', getQuestProgressSummary());
  });

  function checkBadgeAward(player, pSocket) {
    if (player.hasBadge) return;
    const q = player.quest;
    if (q.m1 && q.m2 && q.m3 >= 2 && q.m4) {
      player.hasBadge = true;
      player.inventory.push({
        id: 'citizen_badge',
        name: '민주 시민 배지',
        icon: '🏅',
        desc: '모든 민주주의 토론과 표결 미션을 완수한 성숙한 민주시민 증표'
      });

      pSocket.emit('badgeAwarded', {
        title: '성숙한 민주 시민 배지 획득! 🏅',
        message: '토론과 비밀투표를 모두 완수하여 자랑스러운 민주 시민 배지를 수여받았습니다!'
      });

      io.emit('playerStatusChanged', {
        id: player.id,
        hasBadge: true
      });
      io.emit('voteTallyUpdated', computeVoteTally());
    }
  }

  // 7. 실시간 멀티플레이어 MMO 인터랙션
  socket.on('interactPlayer', (data) => {
    const sender = players.get(socket.id);
    if (!sender) return;

    const { targetId, action, text } = data;
    const target = players.get(targetId);
    if (!target) return;

    if (action === 'highfive') {
      io.to(targetId).emit('interactionReceived', {
        fromId: sender.id,
        fromNickname: sender.nickname,
        action: 'highfive',
        message: `🙌 ${sender.nickname}님이 하이파이브를 건넸습니다! 짝!`
      });
      socket.emit('systemNotification', {
        message: `${target.nickname}님과 하이파이브를 나눴습니다! 짝! 👏`,
        type: 'info'
      });
      io.emit('spawnEmojiEffect', { x: target.x, y: target.y - 30, emoji: '👋' });
    } else if (action === 'whisper') {
      const cleanText = (text || '').trim().slice(0, 60);
      if (!cleanText) return;

      io.to(targetId).emit('whisperReceived', {
        fromId: sender.id,
        fromNickname: sender.nickname,
        text: cleanText
      });
      socket.emit('whisperSent', {
        toNickname: target.nickname,
        text: cleanText
      });
    }
  });

  // 8. 발언 신청
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

  // [새 학급 수업 시작 (원터치 전체 리셋) 🧹]
  socket.on('adminStartNewClass', (data) => {
    const newClass = (data.newClassName || '다음 반').trim();
    console.log(`[교사 관리자] 새 학급 수업 시작: ${newClass}`);

    // 이전 반 결과 아카이브 보관
    classSessionHistory.push({
      className: gameState.currentClassName,
      agenda: gameState.agenda.text,
      timestamp: Date.now(),
      students: getQuestProgressSummary()
    });

    gameState.currentClassName = newClass;
    gameState.voteActive = false;
    gameState.handRaiseQueue = [];

    // 접속 중인 모든 학생 상태 리셋
    for (const player of players.values()) {
      player.className = newClass;
      player.vote = null;
      player.statusEmoji = '';
      player.handRaised = false;
      player.hasBadge = false;
      player.speechText = '';
      player.quest = { m1: false, m2: false, m3: 0, m4: false };
    }

    io.emit('classSessionReset', {
      newClassName: newClass,
      message: `선생님이 새 학급 [${newClass}] 수업을 시작하여 전체가 초기화되었습니다! 🔔`
    });
    io.emit('voteTallyUpdated', computeVoteTally());
    io.emit('allPlayerStatusesReset');
    io.emit('questProgressUpdated', getQuestProgressSummary());
    io.emit('handRaiseQueueUpdated', gameState.handRaiseQueue);
  });

  // [안건 송출]
  socket.on('adminSetAgenda', (data) => {
    const { text, agendaId } = data;
    if (!text) return;

    gameState.agenda = {
      id: agendaId || Date.now(),
      text: text.trim(),
      active: true,
      timestamp: Date.now()
    };

    io.emit('agendaAnnounced', gameState.agenda);
  });

  // [중앙 광장 소환 로직 공통 함수]
  function performSummonAll(message = '선생님이 모든 학생을 중앙 광장으로 소환했습니다! 🏛️', triggerEffect = true) {
    const summonedPositions = [];
    for (const [id, player] of players.entries()) {
      if (player.isAdmin) continue; // 교사는 소환 위치 이동에서 제외

      player.cafeId = null; // 소회의실 상태 해제 -> 중앙 광장 (room: 'plaza')
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 150;
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
      message,
      triggerEffect,
      players: summonedPositions
    });
    io.emit('cafeStatusUpdated', computeCafeStatus());
    io.emit('studentListUpdated', getConnectedStudentsList());
  }

  // [광장 즉시 소환 버튼]
  socket.on('adminSummonAll', () => {
    console.log('[교사 관리자] 모든 학생을 중앙 광장으로 즉시 소환합니다.');
    performSummonAll('선생님이 모든 학생을 중앙 광장으로 소환했습니다! 🏛️', true);
  });

  // [소회의실 3분 토론 타이머 시작]
  socket.on('adminStartTimer', (data) => {
    const duration = parseInt(data && data.duration) || 180; // 기본 180초 (3분)
    const endsAt = Date.now() + duration * 1000;

    if (gameState.discussionTimer.timerId) {
      clearTimeout(gameState.discussionTimer.timerId);
    }

    gameState.discussionTimer.active = true;
    gameState.discussionTimer.duration = duration;
    gameState.discussionTimer.endsAt = endsAt;

    gameState.discussionTimer.timerId = setTimeout(() => {
      console.log('[타이머 종료] 3분 토론 종료 -> 학생 전원 중앙 광장으로 자동 소환 실행');
      performSummonAll('⏱️ 소회의실 토론 시간(3분)이 종료되어 전원 중앙 광장으로 자동 소환되었습니다! 🏛️✨', true);
      gameState.discussionTimer.active = false;
      gameState.discussionTimer.timerId = null;
      io.emit('timerEnded', { reason: 'timeout' });
    }, duration * 1000);

    console.log(`[교사 관리자] 소회의실 토론 타이머 시작: ${duration}초`);
    io.emit('timerStarted', {
      active: true,
      duration,
      endsAt
    });
  });

  // [소회의실 토론 타이머 수동 취소]
  socket.on('adminCancelTimer', () => {
    if (gameState.discussionTimer.timerId) {
      clearTimeout(gameState.discussionTimer.timerId);
    }
    gameState.discussionTimer.active = false;
    gameState.discussionTimer.timerId = null;
    gameState.discussionTimer.endsAt = 0;
    console.log('[교사 관리자] 소회의실 토론 타이머가 취소되었습니다.');
    io.emit('timerCancelled');
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
      player.quest.m4 = false;
      if (player.statusEmoji === '✅' || player.statusEmoji === '❌') {
        player.statusEmoji = player.handRaised ? '✋' : '';
      }
    }
    io.emit('votesReset');
    io.emit('voteTallyUpdated', computeVoteTally());
    io.emit('allPlayerStatusesReset');
    io.emit('questProgressUpdated', getQuestProgressSummary());
  });

  // [발언 완료 처리]
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
    io.emit('studentListUpdated', getConnectedStudentsList());
  });

  // [학생 강제 퇴장 및 세션 삭제 (교사 전용) 🗑️]
  socket.on('adminKickStudent', (data) => {
    const { studentId } = data || {};
    const target = players.get(studentId);
    if (target && !target.isAdmin) {
      console.log(`[교사 관리자] 학생 강제 삭제 및 퇴장 처리: ${target.nickname} (${studentId})`);
      players.delete(studentId);
      gameState.handRaiseQueue = gameState.handRaiseQueue.filter(item => item.socketId !== studentId);

      // 대상 학생 소켓에 퇴장 이벤트 전송 후 연결 정리
      const targetSocket = io.sockets.sockets.get(studentId);
      if (targetSocket) {
        targetSocket.emit('kickedByTeacher', {
          message: '선생님에 의해 접속이 정리되었습니다. 다시 입장해 주세요!'
        });
        try { targetSocket.disconnect(true); } catch (e) {}
      }

      io.emit('playerLeft', { id: studentId, nickname: target.nickname });
      io.emit('voteTallyUpdated', computeVoteTally());
      io.emit('stanceTallyUpdated', computeStanceTally());
      io.emit('cafeStatusUpdated', computeCafeStatus());
      io.emit('handRaiseQueueUpdated', gameState.handRaiseQueue);
      io.emit('questProgressUpdated', getQuestProgressSummary());
      io.emit('studentListUpdated', getConnectedStudentsList());
    }
  });

  // 9. 연결 해제
  socket.on('disconnect', () => {
    console.log(`[퇴장] 클라이언트 연결 종료: ${socket.id}`);
    const player = players.get(socket.id);
    if (player) {
      gameState.handRaiseQueue = gameState.handRaiseQueue.filter(item => item.socketId !== socket.id);
      players.delete(socket.id);

      io.emit('playerLeft', { id: socket.id, nickname: player.nickname });
      io.emit('voteTallyUpdated', computeVoteTally());
      io.emit('stanceTallyUpdated', computeStanceTally());
      io.emit('cafeStatusUpdated', computeCafeStatus());
      io.emit('handRaiseQueueUpdated', gameState.handRaiseQueue);
      io.emit('questProgressUpdated', getQuestProgressSummary());
      io.emit('studentListUpdated', getConnectedStudentsList());
    }
  });
});

// 서버 실행
server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log(`🏛️ 중학교 사회 수업용 2D 메타버스 서버 실행 완료!`);
  console.log(`🌐 학생 접속 주소: http://localhost:${PORT}`);
  console.log(`👨‍🏫 교사 관리자 주소: http://localhost:${PORT}/?admin=true`);
  console.log(`📊 수업 결과 엑셀 다운로드: http://localhost:${PORT}/api/export-results`);
  console.log('========================================================');
});
