/**
 * 중학교 사회 직접민주주의 메타버스 클라이언트 (HTML5 Canvas + Tablet Touch 최적화)
 */

(function () {
  'use strict';

  // --- URL 파라미터 및 교사 관리자(Admin) 여부 판정 ---
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';

  // --- DOM 요소 참조 ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // 오디오 요소
  const audioBgm = document.getElementById('audioBgm');
  const audioSuccess = document.getElementById('audioSuccess');
  const audioError = document.getElementById('audioError');
  const audioPop = document.getElementById('audioPop');
  const btnSoundToggle = document.getElementById('btnSoundToggle');

  // 모달 및 UI
  const loginModal = document.getElementById('loginModal');
  const inputNickname = document.getElementById('inputNickname');
  const avatarOptions = document.querySelectorAll('.avatar-option');
  const btnEnterPlaza = document.getElementById('btnEnterPlaza');
  const topBarContainer = document.getElementById('topBarContainer');
  const locationBadge = document.getElementById('locationBadge');
  const locText = document.getElementById('locText');
  const locCapacityBadge = document.getElementById('locCapacityBadge');
  const agendaPinnedBar = document.getElementById('agendaPinnedBar');
  const pinnedAgendaText = document.getElementById('pinnedAgendaText');
  const agendaBigBanner = document.getElementById('agendaBigBanner');
  const bigAgendaText = document.getElementById('bigAgendaText');
  const agendaProgress = document.getElementById('agendaProgress');

  // 조작 및 액션 바
  const joystickZone = document.getElementById('joystickZone');
  const joystickBase = document.getElementById('joystickBase');
  const joystickKnob = document.getElementById('joystickKnob');
  const bottomActionBar = document.getElementById('bottomActionBar');
  const btnHand = document.getElementById('btnHand');
  const btnAgree = document.getElementById('btnAgree');
  const btnDisagree = document.getElementById('btnDisagree');
  const btnChatToggle = document.getElementById('btnChatToggle');
  const chatBadge = document.getElementById('chatBadge');

  // 채팅 서랍창
  const chatDrawer = document.getElementById('chatDrawer');
  const chatTitle = document.getElementById('chatTitle');
  const chatSubtitle = document.getElementById('chatSubtitle');
  const btnCloseChat = document.getElementById('btnCloseChat');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const quickChips = document.querySelectorAll('.quick-chips .chip');

  // 시스템 토스트
  const systemToast = document.getElementById('systemToast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  // 교사 관리자 요소
  const adminContainer = document.getElementById('adminContainer');
  const btnAdminToggle = document.getElementById('btnAdminToggle');
  const adminPanel = document.getElementById('adminPanel');
  const btnCloseAdmin = document.getElementById('btnCloseAdmin');
  const adminBadgeCount = document.getElementById('adminBadgeCount');
  const quickAgendaButtons = document.querySelectorAll('.btn-agenda-quick');
  const inputCustomAgenda = document.getElementById('inputCustomAgenda');
  const btnSendCustomAgenda = document.getElementById('btnSendCustomAgenda');
  const btnSummonAll = document.getElementById('btnSummonAll');
  const btnToggleVote = document.getElementById('btnToggleVote');
  const voteToggleDesc = document.getElementById('voteToggleDesc');
  const btnResetVotes = document.getElementById('btnResetVotes');
  const tallyAgreeCount = document.getElementById('tallyAgreeCount');
  const tallyAgreePercent = document.getElementById('tallyAgreePercent');
  const tallyDisagreeCount = document.getElementById('tallyDisagreeCount');
  const tallyDisagreePercent = document.getElementById('tallyDisagreePercent');
  const tallyUndecidedCount = document.getElementById('tallyUndecidedCount');
  const tallyUndecidedPercent = document.getElementById('tallyUndecidedPercent');
  const barAgree = document.getElementById('barAgree');
  const barDisagree = document.getElementById('barDisagree');
  const speakerQueueList = document.getElementById('speakerQueueList');
  const handCount = document.getElementById('handCount');
  const cafeMonitoringGrid = document.getElementById('cafeMonitoringGrid');

  // --- 에셋 이미지 로드 ---
  const townTilesImg = new Image();
  townTilesImg.src = 'assets/town tiles.png';
  let townTilesLoaded = false;
  townTilesImg.onload = () => { townTilesLoaded = true; };

  const charactersImg = new Image();
  charactersImg.src = 'assets/characters.png';
  let charactersLoaded = false;
  charactersImg.onload = () => { charactersLoaded = true; };

  // --- 게임 상태 변수 ---
  let socket = null;
  let myId = null;
  let myPlayer = null;
  const otherPlayers = new Map(); // id -> player object
  let mapConfig = {
    width: 2400,
    height: 1800,
    plaza: { centerX: 1200, centerY: 920, radius: 300 },
    cafes: []
  };

  let selectedCharacterIndex = 0;
  let isSoundMuted = false;
  let isJoined = false;
  let voteActive = false;
  let myVote = null;
  let myHandRaised = false;

  // 카메라 (월드 좌표)
  const camera = {
    x: 1200,
    y: 920,
    targetX: 1200,
    targetY: 920
  };

  // 터치 및 조작 변수
  const joystick = {
    active: false,
    touchId: null,
    baseX: 0,
    baseY: 0,
    knobX: 0,
    knobY: 0,
    vx: 0,
    vy: 0,
    maxRadius: 40
  };

  const tapMove = {
    active: false,
    targetX: 0,
    targetY: 0,
    pulseTime: 0
  };

  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false
  };

  // --- 1. 오디오 매니저 ---
  function playAudio(audioElem, volume = 1.0) {
    if (isSoundMuted || !audioElem) return;
    try {
      audioElem.currentTime = 0;
      audioElem.volume = volume;
      const promise = audioElem.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // 브라우저 정책으로 인한 재생 방지 무시
        });
      }
    } catch (e) {}
  }

  function startBgm() {
    if (!audioBgm) return;
    audioBgm.volume = 0.3; // 볼륨 30%
    audioBgm.loop = true;
    const p = audioBgm.play();
    if (p !== undefined) {
      p.catch(() => {
        // 자동 재생 제한 시 차후 터치로 활성화
      });
    }
  }

  btnSoundToggle.addEventListener('click', () => {
    isSoundMuted = !isSoundMuted;
    if (isSoundMuted) {
      btnSoundToggle.classList.add('muted');
      btnSoundToggle.textContent = '🔇';
      if (audioBgm) audioBgm.pause();
    } else {
      btnSoundToggle.classList.remove('muted');
      btnSoundToggle.textContent = '🔊';
      if (audioBgm) audioBgm.play().catch(() => {});
    }
  });

  // --- 2. 캔버스 해상도 조정 (Retina / 고해상도 지원) ---
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  let dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(screenWidth * dpr);
    canvas.height = Math.round(screenHeight * dpr);
    canvas.style.width = screenWidth + 'px';
    canvas.style.height = screenHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- 3. 로그인 및 아바타 선택 ---
  avatarOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      avatarOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedCharacterIndex = parseInt(opt.getAttribute('data-index')) || 0;
    });
  });

  btnEnterPlaza.addEventListener('click', joinGame);
  inputNickname.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinGame();
  });

  function joinGame() {
    const nick = (inputNickname.value || '').trim() || '시민 학생';
    startBgm();

    loginModal.classList.add('hidden');
    bottomActionBar.classList.remove('hidden');
    isJoined = true;

    if (isAdmin) {
      adminContainer.classList.remove('hidden');
    }

    initSocket(nick, selectedCharacterIndex);
  }

  // --- 4. Socket.io 연결 및 이벤트 수신 ---
  function initSocket(nickname, characterIndex) {
    socket = io();

    socket.on('connect', () => {
      console.log('서버에 연결되었습니다. ID:', socket.id);
      socket.emit('joinPlaza', {
        nickname,
        characterIndex,
        isAdmin
      });
    });

    // 접속 초기화 완료
    socket.on('initSuccess', (data) => {
      myId = data.myId;
      mapConfig = data.mapConfig;
      voteActive = data.voteActive;

      // 기존 플레이어 로드
      data.players.forEach(p => {
        if (p.id === myId) {
          myPlayer = {
            ...p,
            walkCycle: 0,
            isMoving: false
          };
          camera.x = p.x;
          camera.y = p.y;
          camera.targetX = p.x;
          camera.targetY = p.y;
        } else {
          otherPlayers.set(p.id, {
            ...p,
            targetX: p.x,
            targetY: p.y,
            walkCycle: 0,
            isMoving: false
          });
        }
      });

      updateVoteButtonsUI(voteActive);
      updateVoteTallyUI(data.voteTally);
      updateCafeMonitoringUI(data.cafeStatus);
      updateSpeakerQueueUI(data.handRaiseQueue);

      // 현재 진행 중인 안건이 있다면 표시
      if (data.agenda && data.agenda.active && data.agenda.text) {
        showPinnedAgenda(data.agenda.text);
      }
    });

    // 새 플레이어 입장
    socket.on('playerJoined', (p) => {
      otherPlayers.set(p.id, {
        ...p,
        targetX: p.x,
        targetY: p.y,
        walkCycle: 0,
        isMoving: false
      });
      playAudio(audioPop, 0.4);
    });

    // 플레이어 이동 동기화
    socket.on('playerMoved', (data) => {
      if (data.id === myId) return;
      const p = otherPlayers.get(data.id);
      if (p) {
        p.targetX = data.x;
        p.targetY = data.y;
        p.facing = data.facing;
        p.cafeId = data.cafeId;
        p.isMoving = true;
      }
    });

    // 상태 이모지 변경 동기화 (✅, ❌, ✋, 💬)
    socket.on('playerStatusChanged', (data) => {
      if (data.id === myId && myPlayer) {
        myPlayer.statusEmoji = data.statusEmoji;
        if (data.speechText !== undefined) myPlayer.speechText = data.speechText;
      } else {
        const p = otherPlayers.get(data.id);
        if (p) {
          p.statusEmoji = data.statusEmoji;
          if (data.speechText !== undefined) p.speechText = data.speechText;
        }
      }
    });

    // 플레이어 퇴장
    socket.on('playerLeft', (data) => {
      otherPlayers.delete(data.id);
    });

    // [카페 정원 초과] 튕겨나옴
    socket.on('cafeEntryRejected', (data) => {
      if (myPlayer) {
        myPlayer.x = data.bounceX;
        myPlayer.y = data.bounceY;
        tapMove.active = false;
      }
      playAudio(audioError, 0.8);
      showToast(data.message, '⛔');
      if (navigator.vibrate) navigator.vibrate(200);
    });

    // [카페 입장 완료]
    socket.on('cafeEntered', (data) => {
      locText.textContent = data.cafeName;
      locCapacityBadge.classList.remove('hidden');
      locCapacityBadge.textContent = `${data.current}/${data.max}명`;
      if (data.current >= data.max) locCapacityBadge.classList.add('full');
      else locCapacityBadge.classList.remove('full');

      chatTitle.textContent = `☕ [${data.cafeName}] 소회의실 채팅`;
      chatSubtitle.textContent = `이 카페의 4명 친구들과 소곤소곤 토론합니다.`;
      showToast(`'${data.cafeName}'에 입장했습니다. (소회의실 대화로 전환)`, '☕');
    });

    // [카페 퇴장 -> 중앙 광장 복귀]
    socket.on('cafeExited', () => {
      locText.textContent = '중앙 광장 (민주 아고라)';
      locCapacityBadge.classList.add('hidden');

      chatTitle.textContent = '중앙 광장 전체 채팅';
      chatSubtitle.textContent = '광장에 있는 모든 학생과 대화합니다.';
    });

    // [안건 송출 이벤트 수신]
    socket.on('agendaAnnounced', (agenda) => {
      playAudio(audioPop, 0.9);
      showBigAgendaBanner(agenda.text);
    });

    // [광장 소환 이벤트]
    socket.on('summonedToPlaza', (data) => {
      playAudio(audioPop, 1.0);
      showToast(data.message, '🚨');
      tapMove.active = false;

      data.players.forEach(pData => {
        if (pData.id === myId && myPlayer) {
          myPlayer.x = pData.x;
          myPlayer.y = pData.y;
          myPlayer.cafeId = null;
          camera.x = pData.x;
          camera.y = pData.y;
        } else {
          const p = otherPlayers.get(pData.id);
          if (p) {
            p.x = pData.x;
            p.y = pData.y;
            p.targetX = pData.x;
            p.targetY = pData.y;
            p.cafeId = null;
          }
        }
      });

      locText.textContent = '중앙 광장 (민주 아고라)';
      locCapacityBadge.classList.add('hidden');
      chatTitle.textContent = '중앙 광장 전체 채팅';
      chatSubtitle.textContent = '광장에 있는 모든 학생과 대화합니다.';
    });

    // [투표 상태 변경 (활성화/비활성화)]
    socket.on('voteStateChanged', (data) => {
      voteActive = data.voteActive;
      updateVoteButtonsUI(voteActive);
      updateVoteTallyUI(data.voteTally);
      if (voteActive) {
        showToast('투표가 시작되었습니다! 화면 하단 찬성/반대를 눌러주세요.', '🗳️');
        playAudio(audioPop, 0.7);
      } else {
        showToast('투표가 마감되었습니다.', '🔒');
      }
    });

    // [투표 초기화]
    socket.on('votesReset', () => {
      myVote = null;
      btnAgree.classList.remove('active');
      btnDisagree.classList.remove('active');
      showToast('투표 결과가 초기화되었습니다.', '🔄');
    });

    socket.on('allPlayerStatusesReset', () => {
      if (myPlayer) {
        if (!myHandRaised) myPlayer.statusEmoji = '';
      }
      otherPlayers.forEach(p => {
        if (!p.handRaised) p.statusEmoji = '';
      });
    });

    // [집계 데이터 실시간 갱신]
    socket.on('voteTallyUpdated', (tally) => {
      updateVoteTallyUI(tally);
    });

    // [카페 현황 갱신]
    socket.on('cafeStatusUpdated', (statusList) => {
      updateCafeMonitoringUI(statusList);
      if (myPlayer && myPlayer.cafeId) {
        const myCafe = statusList.find(c => c.id === myPlayer.cafeId);
        if (myCafe) {
          locCapacityBadge.textContent = `${myCafe.current}/${myCafe.max}명`;
          if (myCafe.current >= myCafe.max) locCapacityBadge.classList.add('full');
          else locCapacityBadge.classList.remove('full');
        }
      }
    });

    // [발언 신청 대기열 갱신]
    socket.on('handRaiseQueueUpdated', (queue) => {
      updateSpeakerQueueUI(queue);
    });

    // [채팅 메시지 브로드캐스트 수신]
    socket.on('chatBroadcast', (msg) => {
      appendChatMessage(msg);
      if (chatDrawer.classList.contains('closed')) {
        chatBadge.classList.remove('hidden');
      }
    });
  }

  // --- 5. 안건 배너 (5초 중앙 강조 후 상단 고정) ---
  let agendaTimer = null;
  function showBigAgendaBanner(text) {
    if (agendaTimer) clearTimeout(agendaTimer);

    bigAgendaText.textContent = text;
    agendaBigBanner.classList.remove('hidden');
    agendaPinnedBar.classList.add('hidden');

    // 5초 타이머 바 애니메이션
    agendaProgress.style.transition = 'none';
    agendaProgress.style.width = '100%';
    setTimeout(() => {
      agendaProgress.style.transition = 'width 5s linear';
      agendaProgress.style.width = '0%';
    }, 20);

    agendaTimer = setTimeout(() => {
      agendaBigBanner.classList.add('hidden');
      showPinnedAgenda(text);
    }, 5000);
  }

  function showPinnedAgenda(text) {
    pinnedAgendaText.textContent = text;
    agendaPinnedBar.classList.remove('hidden');
  }

  // --- 6. 태블릿 터치 조작 (가상 조이스틱 & 탭 이동) ---
  const joystickCenter = { x: 0, y: 0 };

  function initJoystick() {
    function getTouch(e, id) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === id) return e.changedTouches[i];
      }
      return null;
    }

    joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (joystick.active) return;
      const touch = e.changedTouches[0];
      joystick.active = true;
      joystick.touchId = touch.identifier;

      const rect = joystickBase.getBoundingClientRect();
      joystickCenter.x = rect.left + rect.width / 2;
      joystickCenter.y = rect.top + rect.height / 2;

      handleJoystickMove(touch.clientX, touch.clientY);
      // 조이스틱을 잡으면 목적지 탭 이동 취소
      tapMove.active = false;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!joystick.active) return;
      const touch = getTouch(e, joystick.touchId);
      if (touch) {
        handleJoystickMove(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    function endJoystick(e) {
      if (!joystick.active) return;
      const touch = getTouch(e, joystick.touchId);
      if (touch) {
        joystick.active = false;
        joystick.touchId = null;
        joystick.vx = 0;
        joystick.vy = 0;
        joystickKnob.style.transform = `translate(0px, 0px)`;
      }
    }

    window.addEventListener('touchend', endJoystick);
    window.addEventListener('touchcancel', endJoystick);
  }

  function handleJoystickMove(clientX, clientY) {
    const dx = clientX - joystickCenter.x;
    const dy = clientY - joystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const maxR = joystick.maxRadius;

    if (dist <= 0) {
      joystick.vx = 0;
      joystick.vy = 0;
      joystickKnob.style.transform = `translate(0px, 0px)`;
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxR);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    joystick.vx = kx / maxR;
    joystick.vy = ky / maxR;
    joystickKnob.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  // 화면 터치(Tap) 목적지 이동
  canvas.addEventListener('touchstart', (e) => {
    // 만약 조이스틱 영역이나 버튼 영역 터치면 제외
    const touch = e.changedTouches[0];
    if (touch.clientX < 170 && touch.clientY > screenHeight - 170) return;

    // 스크린 좌표 -> 월드 좌표 변환
    const worldX = Math.round(touch.clientX + camera.x - screenWidth / 2);
    const worldY = Math.round(touch.clientY + camera.y - screenHeight / 2);

    tapMove.active = true;
    tapMove.targetX = Math.max(50, Math.min(mapConfig.width - 50, worldX));
    tapMove.targetY = Math.max(50, Math.min(mapConfig.height - 50, worldY));
    tapMove.pulseTime = 1.0;
  }, { passive: true });

  // 키보드 조작 (데스크톱 보너스 지원)
  window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
  });

  initJoystick();

  // --- 7. 하단 액션 버튼 (찬성/반대/발언신청/채팅) ---
  btnHand.addEventListener('click', () => {
    myHandRaised = !myHandRaised;
    btnHand.classList.toggle('active', myHandRaised);
    playAudio(audioPop, 0.9);
    if (socket) socket.emit('raiseHand');
  });

  btnAgree.addEventListener('click', () => {
    if (!voteActive) return;
    if (myVote === 'agree') {
      myVote = null;
      btnAgree.classList.remove('active');
      if (socket) socket.emit('vote', { choice: 'cancel' });
    } else {
      myVote = 'agree';
      btnAgree.classList.add('active');
      btnDisagree.classList.remove('active');
      playAudio(audioSuccess, 0.9);
      if (socket) socket.emit('vote', { choice: 'agree' });
    }
  });

  btnDisagree.addEventListener('click', () => {
    if (!voteActive) return;
    if (myVote === 'disagree') {
      myVote = null;
      btnDisagree.classList.remove('active');
      if (socket) socket.emit('vote', { choice: 'cancel' });
    } else {
      myVote = 'disagree';
      btnDisagree.classList.add('active');
      btnAgree.classList.remove('active');
      playAudio(audioError, 0.9);
      if (socket) socket.emit('vote', { choice: 'disagree' });
    }
  });

  btnChatToggle.addEventListener('click', () => {
    chatDrawer.classList.toggle('closed');
    chatBadge.classList.add('hidden');
    if (!chatDrawer.classList.contains('closed')) {
      setTimeout(() => chatInput.focus(), 100);
    }
  });

  btnCloseChat.addEventListener('click', () => {
    chatDrawer.classList.add('closed');
  });

  // 빠른 의견 칩 클릭 시 즉시 입력
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.getAttribute('data-msg');
      if (msg) {
        sendChatMessage(msg);
      }
    });
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (chatInput.value || '').trim();
    if (text) {
      sendChatMessage(text);
      chatInput.value = '';
    }
  });

  function sendChatMessage(text) {
    if (!socket || !text) return;
    socket.emit('chatMessage', { text });
  }

  function appendChatMessage(msg) {
    const isMine = msg.senderId === myId;
    const row = document.createElement('div');
    row.className = `chat-bubble-row ${isMine ? 'mine' : 'other'}`;

    const senderInfo = document.createElement('div');
    senderInfo.className = 'chat-sender-info';
    senderInfo.textContent = `${msg.nickname} · ${msg.cafeName || '광장'}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = msg.text;

    row.appendChild(senderInfo);
    row.appendChild(bubble);
    chatMessages.appendChild(row);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- 8. 교사 관리자(Admin) 패널 로직 ---
  btnAdminToggle.addEventListener('click', () => {
    adminPanel.classList.toggle('closed');
  });

  btnCloseAdmin.addEventListener('click', () => {
    adminPanel.classList.add('closed');
  });

  // [안건 퀵 버튼 3종 송출]
  quickAgendaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const agendaText = btn.getAttribute('data-agenda');
      if (confirm(`다음 안건을 모든 학생 화면에 송출하시겠습니까?\n\n"${agendaText}"`)) {
        if (socket) socket.emit('adminSetAgenda', { text: agendaText });
      }
    });
  });

  btnSendCustomAgenda.addEventListener('click', () => {
    const text = (inputCustomAgenda.value || '').trim();
    if (text) {
      if (socket) socket.emit('adminSetAgenda', { text });
      inputCustomAgenda.value = '';
    }
  });

  // [광장 소환 버튼]
  btnSummonAll.addEventListener('click', () => {
    if (confirm('모든 학생을 중앙 광장으로 즉시 소환하시겠습니까? (소회의실 인원 전원 복귀)')) {
      if (socket) socket.emit('adminSummonAll');
    }
  });

  // [투표 활성화 / 마감 토글]
  btnToggleVote.addEventListener('click', () => {
    const nextState = !voteActive;
    if (socket) socket.emit('adminToggleVote', { active: nextState });
  });

  // [투표 초기화]
  btnResetVotes.addEventListener('click', () => {
    if (confirm('현재 투표 결과를 초기화하시겠습니까?')) {
      if (socket) socket.emit('adminResetVotes');
    }
  });

  function updateVoteButtonsUI(active) {
    if (active) {
      btnAgree.classList.remove('disabled-vote');
      btnDisagree.classList.remove('disabled-vote');
      btnToggleVote.classList.add('active');
      voteToggleDesc.textContent = '현재 투표 진행 중 (클릭 시 마감)';
    } else {
      btnAgree.classList.add('disabled-vote');
      btnDisagree.classList.add('disabled-vote');
      btnToggleVote.classList.remove('active');
      voteToggleDesc.textContent = '학생 태블릿에 투표 버튼 오픈';
    }
  }

  function updateVoteTallyUI(tally) {
    if (!tally) return;
    const total = tally.totalStudents || 0;
    const agree = tally.agree || 0;
    const disagree = tally.disagree || 0;
    const undecided = tally.undecided || 0;

    const agreePct = total > 0 ? Math.round((agree / total) * 100) : 0;
    const disagreePct = total > 0 ? Math.round((disagree / total) * 100) : 0;
    const undecidedPct = total > 0 ? Math.max(0, 100 - (agreePct + disagreePct)) : 0;

    tallyAgreeCount.textContent = `${agree}명`;
    tallyAgreePercent.textContent = `(${agreePct}%)`;
    tallyDisagreeCount.textContent = `${disagree}명`;
    tallyDisagreePercent.textContent = `(${disagreePct}%)`;
    tallyUndecidedCount.textContent = `${undecided}명`;
    tallyUndecidedPercent.textContent = `(${undecidedPct}%)`;

    barAgree.style.width = `${agreePct}%`;
    barDisagree.style.width = `${disagreePct}%`;

    adminBadgeCount.textContent = `${total}명`;
  }

  function updateSpeakerQueueUI(queue) {
    handCount.textContent = queue.length;
    speakerQueueList.innerHTML = '';

    if (queue.length === 0) {
      speakerQueueList.innerHTML = '<div class="empty-notice">현재 발언을 신청한 학생이 없습니다.</div>';
      return;
    }

    queue.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'speaker-item';
      row.innerHTML = `
        <span>${idx + 1}. ✋ ${item.nickname}</span>
        <button class="btn-speaker-clear" data-id="${item.socketId}">발언 완료</button>
      `;
      row.querySelector('.btn-speaker-clear').addEventListener('click', () => {
        if (socket) socket.emit('adminClearSpeaker', { socketId: item.socketId });
      });
      speakerQueueList.appendChild(row);
    });
  }

  function updateCafeMonitoringUI(statusList) {
    if (!statusList) return;
    cafeMonitoringGrid.innerHTML = '';

    statusList.forEach(c => {
      const isFull = c.current >= c.max;
      const card = document.createElement('div');
      card.className = 'cafe-card';

      const names = c.occupants && c.occupants.length > 0
        ? c.occupants.map(o => o.nickname).join(', ')
        : '비어 있음';

      card.innerHTML = `
        <div class="cafe-card-header">
          <span>${c.name}</span>
          <span class="cafe-card-badge ${isFull ? 'full' : ''}">${c.current}/${c.max}명</span>
        </div>
        <div class="cafe-occupant-names">${names}</div>
      `;
      cafeMonitoringGrid.appendChild(card);
    });
  }

  // --- 9. 시스템 토스트 표시 유틸리티 ---
  let toastTimer = null;
  function showToast(message, icon = '⚠️') {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = message;
    toastIcon.textContent = icon;
    systemToast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      systemToast.classList.add('hidden');
    }, 3500);
  }

  // --- 10. 메인 게임 루프 & 2D 캔버스 렌더링 ---
  let lastTime = performance.now();
  let syncTimer = 0;

  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);

  // 로컬 플레이어 물리 및 위치 갱신
  function update(dt) {
    if (!isJoined || !myPlayer) return;

    let moveX = 0;
    let moveY = 0;

    // 조이스틱 이동 입력
    if (joystick.active && (Math.abs(joystick.vx) > 0.05 || Math.abs(joystick.vy) > 0.05)) {
      moveX = joystick.vx;
      moveY = joystick.vy;
    }
    // 키보드 입력
    else if (keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS || keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD) {
      if (keys.ArrowUp || keys.KeyW) moveY -= 1;
      if (keys.ArrowDown || keys.KeyS) moveY += 1;
      if (keys.ArrowLeft || keys.KeyA) moveX -= 1;
      if (keys.ArrowRight || keys.KeyD) moveX += 1;
    }
    // 탭 목적지 이동
    else if (tapMove.active) {
      const dx = tapMove.targetX - myPlayer.x;
      const dy = tapMove.targetY - myPlayer.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        tapMove.active = false;
      } else {
        moveX = dx / dist;
        moveY = dy / dist;
      }
    }

    const speed = 200; // 초당 200 픽셀
    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const normX = moveX / len;
      const normY = moveY / len;

      myPlayer.x += normX * speed * dt;
      myPlayer.y += normY * speed * dt;

      // 맵 경계 제한
      myPlayer.x = Math.max(50, Math.min(mapConfig.width - 50, myPlayer.x));
      myPlayer.y = Math.max(50, Math.min(mapConfig.height - 50, myPlayer.y));

      // 걷기 애니메이션 및 방향 설정
      myPlayer.walkCycle = (myPlayer.walkCycle || 0) + dt * 10;
      myPlayer.isMoving = true;

      if (Math.abs(normX) > Math.abs(normY)) {
        myPlayer.facing = normX > 0 ? 'right' : 'left';
      } else {
        myPlayer.facing = normY > 0 ? 'down' : 'up';
      }
    } else {
      myPlayer.isMoving = false;
      myPlayer.walkCycle = 0;
    }

    // 서버로 이동 위치 동기화 (30Hz)
    syncTimer += dt;
    if (syncTimer >= 0.033) {
      syncTimer = 0;
      if (socket && myPlayer) {
        socket.emit('playerMove', {
          x: Math.round(myPlayer.x),
          y: Math.round(myPlayer.y),
          facing: myPlayer.facing
        });
      }
    }

    // 다른 플레이어들의 위치 보간(Lerp)
    otherPlayers.forEach(p => {
      if (p.targetX !== undefined && p.targetY !== undefined) {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.x += dx * 0.2;
        p.y += dy * 0.2;
        if (Math.hypot(dx, dy) > 2) {
          p.walkCycle = (p.walkCycle || 0) + dt * 10;
          p.isMoving = true;
        } else {
          p.isMoving = false;
          p.walkCycle = 0;
        }
      }
    });

    // 카메라 부드러운 추종 (Lerp)
    camera.targetX = myPlayer.x;
    camera.targetY = myPlayer.y;
    camera.x += (camera.targetX - camera.x) * 0.12;
    camera.y += (camera.targetY - camera.y) * 0.12;
  }

  // --- 11. 화면 그리기 (맵, 카페 7개, 광장, 캐릭터) ---
  function render() {
    ctx.clearRect(0, 0, screenWidth, screenHeight);

    ctx.save();
    // 카메라 좌표계 적용 (화면 중앙 정렬)
    ctx.translate(Math.round(screenWidth / 2 - camera.x), Math.round(screenHeight / 2 - camera.y));

    // 1. 배경 지형 (푸른 잔디밭 & 타일 패턴)
    drawTerrain();

    // 2. 중앙 광장 (민주 아고라 회의장)
    drawCentralPlaza();

    // 3. 7개 소회의실 (외곽 카페 구역)
    drawCafes();

    // 4. 목적지 터치 펄스 링
    if (tapMove.active) {
      drawTapTarget(tapMove.targetX, tapMove.targetY);
    }

    // 5. 모든 캐릭터 렌더링 (Y좌표 깊이 소팅)
    const renderList = [];
    if (myPlayer) renderList.push(myPlayer);
    otherPlayers.forEach(p => renderList.push(p));

    renderList.sort((a, b) => a.y - b.y);
    renderList.forEach(p => {
      drawCharacter(p, p.id === myId);
    });

    ctx.restore();
  }

  // 1. 푸른 잔디 및 돌길 도로망 그리기
  function drawTerrain() {
    // 잔디 기본색
    ctx.fillStyle = '#476e46';
    ctx.fillRect(0, 0, mapConfig.width, mapConfig.height);

    // 격자 장식 패턴 (부드러운 타일 느낌)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    const tileSize = 48;
    for (let x = 0; x < mapConfig.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapConfig.height);
      ctx.stroke();
    }
    for (let y = 0; y < mapConfig.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapConfig.width, y);
      ctx.stroke();
    }

    // 중앙 광장에서 각 7개 카페로 뻗어나가는 포장도로 길(Pathways)
    const plaza = mapConfig.plaza;
    ctx.strokeStyle = '#d6c7a1';
    ctx.lineWidth = 44;
    ctx.lineCap = 'round';
    mapConfig.cafes.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(plaza.centerX, plaza.centerY);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
    });

    // 도로 내부 밝은 하이라이트 선
    ctx.strokeStyle = '#f3ebd4';
    ctx.lineWidth = 32;
    mapConfig.cafes.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(plaza.centerX, plaza.centerY);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
    });
  }

  // 2. 중앙 광장 그리기
  function drawCentralPlaza() {
    const plaza = mapConfig.plaza;

    // 광장 원형 바닥 (고풍스러운 코블스톤 석판)
    ctx.fillStyle = '#e8dec8';
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius, 0, Math.PI * 2);
    ctx.fill();

    // 광장 테두리 돌 장식
    ctx.strokeStyle = '#b8a98b';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 광장 내부 원형 벤치(원형 토론장)
    ctx.strokeStyle = '#8c7b61';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius - 80, 0, Math.PI * 2);
    ctx.stroke();

    // 광장 중앙 분수대 & 연단
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 중앙 물결 애니메이션
    const wave = (Date.now() / 600) % (Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, 16 + Math.sin(wave) * 6, 0, Math.PI * 2);
    ctx.fill();

    // 중앙 광장 이름 명판
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    drawRoundRect(ctx, plaza.centerX - 120, plaza.centerY - plaza.radius - 30, 240, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️ 중앙 광장 (민주 아고라)', plaza.centerX, plaza.centerY - plaza.radius - 12);
  }

  // 3. 7개 소회의실(카페) 구역 그리기
  function drawCafes() {
    mapConfig.cafes.forEach(cafe => {
      const left = cafe.x - cafe.w / 2;
      const top = cafe.y - cafe.h / 2;

      // 카페 부지 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      drawRoundRect(ctx, left + 8, top + 10, cafe.w, cafe.h, 20);
      ctx.fill();

      // 카페 바닥 베이스
      ctx.fillStyle = '#f8fafc';
      drawRoundRect(ctx, left, top, cafe.w, cafe.h, 20);
      ctx.fill();

      // 카페 지붕 어닝(컬러 줄무늬)
      ctx.fillStyle = cafe.color;
      drawRoundRect(ctx, left, top, cafe.w, 54, 16);
      ctx.fill();

      // 카페 테두리
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      drawRoundRect(ctx, left, top, cafe.w, cafe.h, 20);
      ctx.stroke();

      // 내부 테이블 및 의자 디테일
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(cafe.x - 45, cafe.y + 20, 18, 0, Math.PI * 2);
      ctx.arc(cafe.x + 45, cafe.y + 20, 18, 0, Math.PI * 2);
      ctx.fill();

      // 의자들
      ctx.fillStyle = '#92400e';
      [-45, 45].forEach(cx => {
        [[-24, 0], [24, 0], [0, -24], [0, 24]].forEach(([ox, oy]) => {
          ctx.beginPath();
          ctx.arc(cafe.x + cx + ox, cafe.y + 20 + oy, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // 입구 표시 발판 매트
      ctx.fillStyle = cafe.color;
      drawRoundRect(ctx, cafe.x - 30, top + cafe.h - 14, 60, 14, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ENTRANCE', cafe.x, top + cafe.h - 4);

      // 카페 상단 이름 간판
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      drawRoundRect(ctx, cafe.x - 70, top - 32, 140, 26, 13);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`☕ ${cafe.name}`, cafe.x, top - 19);

      // 정원(최대 4명) 실시간 게이지 뱃지
      let count = 0;
      if (myPlayer && myPlayer.cafeId === cafe.id) count++;
      otherPlayers.forEach(p => { if (p.cafeId === cafe.id) count++; });

      const isFull = count >= cafe.max;
      ctx.fillStyle = isFull ? '#ef4444' : '#10b981';
      drawRoundRect(ctx, cafe.x - 36, top + 60, 72, 20, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`👥 ${count}/${cafe.max}명`, cafe.x, top + 70);
    });
  }

  // 4. 목적지 터치 펄스 애니메이션
  function drawTapTarget(x, y) {
    const pulse = (Date.now() / 250) % 4;
    ctx.strokeStyle = `rgba(59, 130, 246, ${Math.max(0, 1 - pulse / 4)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 8 + pulse * 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. 캐릭터 렌더링 (아바타 + 2줄 명찰 및 상태 이모지)
  const AVATAR_PALETTE = [
    { body: '#3b82f6', hat: '#1d4ed8', skin: '#fcd34d' }, // 0. 파랑
    { body: '#ef4444', hat: '#b91c1c', skin: '#fed7aa' }, // 1. 빨강
    { body: '#22c55e', hat: '#15803d', skin: '#fde68a' }, // 2. 초록
    { body: '#eab308', hat: '#a16207', skin: '#fed7aa' }, // 3. 노랑
    { body: '#a855f7', hat: '#7e22ce', skin: '#fcd34d' }  // 4. 보라
  ];

  function drawCharacter(p, isMe) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const cIdx = Math.max(0, Math.min(4, p.characterIndex || 0));
    const pal = AVATAR_PALETTE[cIdx];

    const bob = p.isMoving ? Math.sin(p.walkCycle) * 3 : 0;

    // 바닥 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 스프라이트시트(characters.png) 사용 또는 고품질 벡터 아바타 렌더링
    if (charactersLoaded && charactersImg.width >= 160) {
      // 5종 캐릭터: 각 32x32
      const sw = 32;
      const sh = 32;
      const sx = cIdx * 32;
      const sy = 0;
      ctx.drawImage(charactersImg, sx, sy, sw, sh, x - 18, y - 32 + bob, 36, 36);
    } else {
      // 벡터 아바타 절차적 렌더링
      // 몸통/옷
      ctx.fillStyle = pal.body;
      drawRoundRect(ctx, x - 10, y - 18 + bob, 20, 16, 6);
      ctx.fill();

      // 머리 / 얼굴
      ctx.fillStyle = pal.skin;
      ctx.beginPath();
      ctx.arc(x, y - 24 + bob, 9, 0, Math.PI * 2);
      ctx.fill();

      // 모자 / 헤어
      ctx.fillStyle = pal.hat;
      ctx.beginPath();
      ctx.arc(x, y - 27 + bob, 9, Math.PI, Math.PI * 2);
      ctx.fill();

      // 눈
      ctx.fillStyle = '#0f172a';
      if (p.facing === 'left') {
        ctx.fillRect(x - 6, y - 24 + bob, 2, 3);
      } else if (p.facing === 'right') {
        ctx.fillRect(x + 4, y - 24 + bob, 2, 3);
      } else {
        ctx.fillRect(x - 3, y - 24 + bob, 2, 3);
        ctx.fillRect(x + 3, y - 24 + bob, 2, 3);
      }
    }

    // ================= 머리 위 2줄 정보 표시 =================
    // 1줄: [학생 이름] 명찰
    ctx.font = isMe ? 'bold 12px sans-serif' : '11px sans-serif';
    const textWidth = ctx.measureText(p.nickname).width;
    const badgeW = textWidth + 14;
    const badgeH = 18;
    const badgeY = y - 48 + bob;

    ctx.fillStyle = isMe ? 'rgba(37, 99, 235, 0.9)' : 'rgba(15, 23, 42, 0.75)';
    drawRoundRect(ctx, x - badgeW / 2, badgeY, badgeW, badgeH, 9);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.nickname, x, badgeY + badgeH / 2);

    // 2줄: 상태 표시 유니코드 이모지 (✋, ✅, ❌, 💬)
    const emoji = p.statusEmoji;
    if (emoji) {
      const emojiY = badgeY - 18;

      // 귀여운 상태 플로팅 버블
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(x, emojiY + 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, x, emojiY + 3);

      // 만약 말풍선(💬)이고 speechText가 있으면 말풍선 꼬리표 텍스트 팝업 렌더링
      if (emoji === '💬' && p.speechText) {
        ctx.font = '12px sans-serif';
        const msgW = ctx.measureText(p.speechText).width;
        const bubbleW = Math.min(220, msgW + 16);
        const bubbleH = 24;
        const bX = x - bubbleW / 2;
        const bY = emojiY - 30;

        ctx.fillStyle = '#ffffff';
        drawRoundRect(ctx, bX, bY, bubbleW, bubbleH, 12);
        ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.fillText(p.speechText.slice(0, 16) + (p.speechText.length > 16 ? '...' : ''), x, bY + bubbleH / 2);
      }
    }
  }

  // 둥근 모서리 사각형 유틸리티
  function drawRoundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

})();
