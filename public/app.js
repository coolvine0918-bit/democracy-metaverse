/**
 * 중학교 사회 직접민주주의 메타버스 클라이언트 (MMO, 물리 충돌, 인벤토리, 퀘스트 시스템 완비)
 */

(function () {
  'use strict';

  // --- URL 파라미터 및 교사 관리자(Admin) 여부 판정 ---
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';

  // --- DOM 요소 참조 ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // 오디오
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
  const locationBadge = document.getElementById('locationBadge');
  const locText = document.getElementById('locText');
  const locCapacityBadge = document.getElementById('locCapacityBadge');
  const agendaPinnedBar = document.getElementById('agendaPinnedBar');
  const pinnedAgendaText = document.getElementById('pinnedAgendaText');
  const agendaBigBanner = document.getElementById('agendaBigBanner');
  const bigAgendaText = document.getElementById('bigAgendaText');
  const agendaProgress = document.getElementById('agendaProgress');

  // 대형 교사 공지 배너
  const teacherBigBanner = document.getElementById('teacherBigBanner');
  const teacherBigText = document.getElementById('teacherBigText');
  const teacherProgress = document.getElementById('teacherProgress');

  // 툴 버튼 (퀘스트, 인벤토리, 자료)
  const btnQuestToggle = document.getElementById('btnQuestToggle');
  const questBadgeCount = document.getElementById('questBadgeCount');
  const btnInventoryToggle = document.getElementById('btnInventoryToggle');
  const btnBoardToggle = document.getElementById('btnBoardToggle');

  // 인벤토리 & 드래그 고스트
  const inventoryModal = document.getElementById('inventoryModal');
  const btnCloseInventory = document.getElementById('btnCloseInventory');
  const inventorySlots = document.getElementById('inventorySlots');
  const dragItemGhost = document.getElementById('dragItemGhost');
  const ghostIcon = document.getElementById('ghostIcon');
  const ghostName = document.getElementById('ghostName');

  // 퀘스트 모달
  const questModal = document.getElementById('questModal');
  const btnCloseQuest = document.getElementById('btnCloseQuest');
  const questProgressBarFill = document.getElementById('questProgressBarFill');
  const questProgressPercentText = document.getElementById('questProgressPercentText');
  const questItem1 = document.getElementById('questItem1');
  const questItem2 = document.getElementById('questItem2');
  const questItem3 = document.getElementById('questItem3');
  const questItem4 = document.getElementById('questItem4');
  const btnQuestAction1 = document.getElementById('btnQuestAction1');
  const btnQuestAction2 = document.getElementById('btnQuestAction2');
  const questTalkCountBadge = document.getElementById('questTalkCountBadge');
  const questVoteBadge = document.getElementById('questVoteBadge');

  // 게시판 모달
  const noticeBoardModal = document.getElementById('noticeBoardModal');
  const btnCloseBoard = document.getElementById('btnCloseBoard');
  const boardTopicTitle = document.getElementById('boardTopicTitle');
  const boardTopicContent = document.getElementById('boardTopicContent');
  const btnConfirmBoardRead = document.getElementById('btnConfirmBoardRead');

  // 투표함 근접 퀵 버튼
  const ballotBoxActionZone = document.getElementById('ballotBoxActionZone');
  const btnBallotQuickVoteAgree = document.getElementById('btnBallotQuickVoteAgree');
  const btnBallotQuickVoteDisagree = document.getElementById('btnBallotQuickVoteDisagree');

  // 학생 상호작용 팝업 (MMO)
  const playerInteractMenu = document.getElementById('playerInteractMenu');
  const interactAvatarPreview = document.getElementById('interactAvatarPreview');
  const interactNick = document.getElementById('interactNick');
  const interactBadgeTag = document.getElementById('interactBadgeTag');
  const btnCloseInteract = document.getElementById('btnCloseInteract');
  const btnHighFive = document.getElementById('btnHighFive');
  const btnWhisper = document.getElementById('btnWhisper');
  let selectedTargetPlayerId = null;

  // 배지 축하 오버레이
  const badgeCelebrationOverlay = document.getElementById('badgeCelebrationOverlay');
  const btnCloseCelebration = document.getElementById('btnCloseCelebration');

  // 조이스틱 & 액션 바
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

  // 교사 관리자(Admin)
  const adminContainer = document.getElementById('adminContainer');
  const btnAdminToggle = document.getElementById('btnAdminToggle');
  const adminPanel = document.getElementById('adminPanel');
  const btnCloseAdmin = document.getElementById('btnCloseAdmin');
  const adminBadgeCount = document.getElementById('adminBadgeCount');
  const adminBadgeAwardCount = document.getElementById('adminBadgeAwardCount');
  const currentAdminClassName = document.getElementById('currentAdminClassName');
  const btnExportClassResults = document.getElementById('btnExportClassResults');
  const btnStartNewClassSession = document.getElementById('btnStartNewClassSession');
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
  const studentQuestMonitoringList = document.getElementById('studentQuestMonitoringList');
  const adminStudentCount = document.getElementById('adminStudentCount');
  const adminStudentList = document.getElementById('adminStudentList');

  // --- 에셋 이미지 로드 ---
  const townTilesImg = new Image();
  townTilesImg.src = 'assets/town tiles.png';
  let townTilesLoaded = false;
  townTilesImg.onload = () => { townTilesLoaded = true; };

  const charactersImg = new Image();
  charactersImg.src = 'assets/characters.png';
  let charactersLoaded = false;
  charactersImg.onload = () => { charactersLoaded = true; };

  // --- 상태 관리 변수 ---
  let socket = null;
  let myId = null;
  let myPlayer = null;
  const otherPlayers = new Map();
  let mapConfig = {
    width: 2400,
    height: 1800,
    plaza: { centerX: 1200, centerY: 920, radius: 300 },
    ballotBox: { x: 1200, y: 840, w: 56, h: 56 },
    noticeBoard: { x: 1040, y: 840, w: 64, h: 44 },
    fountain: { x: 1200, y: 960, radius: 46 },
    cafes: []
  };
  let noticeMaterials = {};

  let selectedCharacterIndex = 0;
  let isSoundMuted = false;
  let isJoined = false;
  let voteActive = false;
  let myVote = null;
  let myHandRaised = false;

  // 이펙트 파티클 리스트 (컨페티, 하이파이브 스파크)
  const particles = [];

  // 카메라
  const camera = {
    x: 1200,
    y: 920,
    targetX: 1200,
    targetY: 920
  };

  // 조작
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
    targetY: 0
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
      const p = audioElem.play();
      if (p !== undefined) p.catch(() => {});
    } catch (e) {}
  }

  function startBgm() {
    if (!audioBgm) return;
    audioBgm.volume = 0.3;
    audioBgm.loop = true;
    audioBgm.play().catch(() => {});
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

  // --- 2. 캔버스 리사이즈 (High-DPI) ---
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  let dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 노트북 교사 모드일 때: 우측 사이드바(440px) 공간 분할 적용
    if (isAdmin && window.innerWidth >= 1024 && adminPanel && !adminPanel.classList.contains('closed')) {
      width = Math.max(600, window.innerWidth - 440);
    }

    screenWidth = width;
    screenHeight = height;
    dpr = Math.min(window.devicePixelRatio || 1, 2); // 고해상도 태블릿 60fps 부드러운 성능 보장
    canvas.width = Math.round(screenWidth * dpr);
    canvas.height = Math.round(screenHeight * dpr);
    canvas.style.width = screenWidth + 'px';
    canvas.style.height = screenHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 150));
  resizeCanvas();

  // --- 3. 로그인 및 광장 입장 ---
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
    const selectClassElem = document.getElementById('selectClass');
    const userClass = selectClassElem ? selectClassElem.value : '1반';
    startBgm();

    loginModal.classList.add('hidden');
    bottomActionBar.classList.remove('hidden');
    isJoined = true;

    if (isAdmin) {
      adminContainer.classList.remove('hidden');
    }

    initSocket(nick, selectedCharacterIndex, userClass);
  }

  // --- [교사 관리자 (?admin=true) 전용]: 노트북 최적화 모드 & 즉시 다이렉트 입장! ---
  if (isAdmin) {
    document.body.classList.add('teacher-laptop-mode');
    loginModal.classList.add('hidden');
    bottomActionBar.classList.remove('hidden');
    adminContainer.classList.remove('hidden');
    adminPanel.classList.remove('closed'); // 관리자 콘솔 바로 오픈
    isJoined = true;
    startBgm();
    initSocket('선생님', 99, '교사');
    setTimeout(resizeCanvas, 50);
  }

  // --- 4. Socket.io 통신 및 이벤트 등록 ---
  function initSocket(nickname, characterIndex, className) {
    if (socket) return; // 중복 연결 방지
    socket = io();

    socket.on('connect', () => {
      socket.emit('joinPlaza', {
        nickname,
        characterIndex,
        className,
        isAdmin
      });
    });

    socket.on('initSuccess', (data) => {
      myId = data.myId;
      mapConfig = data.mapConfig;
      voteActive = data.voteActive;
      noticeMaterials = data.noticeMaterials || {};

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
          updateQuestUI(myPlayer.quest);
          renderInventoryUI(myPlayer.inventory);
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
      updateStudentQuestMonitoringUI(data.questProgressList);
      updateAdminStudentList(data.connectedStudents);

      if (data.agenda && data.agenda.active && data.agenda.text) {
        showPinnedAgenda(data.agenda.text);
      }
    });

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

    socket.on('playerStatusChanged', (data) => {
      if (data.id === myId && myPlayer) {
        if (data.statusEmoji !== undefined) myPlayer.statusEmoji = data.statusEmoji;
        if (data.speechText !== undefined) myPlayer.speechText = data.speechText;
        if (data.vote !== undefined) myPlayer.vote = data.vote;
        if (data.hasBadge !== undefined) myPlayer.hasBadge = data.hasBadge;
      } else {
        const p = otherPlayers.get(data.id);
        if (p) {
          if (data.statusEmoji !== undefined) p.statusEmoji = data.statusEmoji;
          if (data.speechText !== undefined) p.speechText = data.speechText;
          if (data.vote !== undefined) p.vote = data.vote;
          if (data.hasBadge !== undefined) p.hasBadge = data.hasBadge;
        }
      }
    });

    socket.on('playerLeft', (data) => {
      otherPlayers.delete(data.id);
    });

    // 카페 정원 초과
    socket.on('cafeEntryRejected', (data) => {
      if (myPlayer) {
        myPlayer.x = data.bounceX;
        myPlayer.y = data.bounceY;
        tapMove.active = false;
      }
      playAudio(audioError, 0.9);
      showToast(data.message, '⛔');
      if (navigator.vibrate) navigator.vibrate(200);
    });

    socket.on('cafeEntered', (data) => {
      locText.textContent = data.cafeName;
      locCapacityBadge.classList.remove('hidden');
      locCapacityBadge.textContent = `${data.current}/${data.max}명`;
      if (data.current >= data.max) locCapacityBadge.classList.add('full');
      else locCapacityBadge.classList.remove('full');

      chatTitle.textContent = `☕ [${data.cafeName}] 소회의실 채팅`;
      chatSubtitle.textContent = `이 카페의 4명 친구들과 소곤소곤 토론합니다.`;
      showToast(`'${data.cafeName}'에 입장했습니다. (소회의실 토론으로 전환)`, '☕');
    });

    socket.on('cafeExited', () => {
      locText.textContent = '중앙 광장 (민주 아고라)';
      locCapacityBadge.classList.add('hidden');
      chatTitle.textContent = '중앙 광장 전체 채팅';
      chatSubtitle.textContent = '광장에 있는 모든 학생과 대화합니다.';
    });

    // 안건 송출
    socket.on('agendaAnnounced', (agenda) => {
      playAudio(audioPop, 0.9);
      showBigAgendaBanner(agenda.text);
      if (myPlayer) {
        socket.emit('completeQuestStep', { step: 'm1' });
      }
    });

    // 광장 소환
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

    // 투표 상태 변경
    socket.on('voteStateChanged', (data) => {
      voteActive = data.voteActive;
      updateVoteButtonsUI(voteActive);
      updateVoteTallyUI(data.voteTally);
      if (voteActive) {
        showToast('투표가 시작되었습니다! 인벤토리(🎒)의 투표용지를 광장 투표함에 넣어주세요.', '🗳️');
        playAudio(audioPop, 0.7);
      } else {
        showToast('투표가 마감되었습니다.', '🔒');
      }
    });

    // 투표함 투입 이펙트 수신
    socket.on('ballotSubmittedEffect', (effect) => {
      playAudio(audioSuccess, 0.9);
      spawnBallotParticles(effect.x, effect.y, effect.choice);
      showToast(`🗳️ ${effect.nickname} 학생이 투표용지를 투표함에 넣었습니다!`, '✨');
    });

    // 퀘스트 업데이트
    socket.on('questUpdated', (data) => {
      if (myPlayer) {
        myPlayer.quest = data.quest;
        updateQuestUI(myPlayer.quest);
      }
      if (data.message) showToast(data.message, '📜');
    });

    // 배지 수여
    socket.on('badgeAwarded', (data) => {
      playAudio(audioSuccess, 1.0);
      badgeCelebrationOverlay.classList.remove('hidden');
      spawnConfettiBurst();
      if (myPlayer) {
        myPlayer.hasBadge = true;
        renderInventoryUI(myPlayer.inventory);
      }
    });

    // 학생 상호작용 알림 수신 (MMO 하이파이브)
    socket.on('interactionReceived', (data) => {
      playAudio(audioSuccess, 0.8);
      showToast(data.message, '🙌');
      spawnEmojiParticles(myPlayer.x, myPlayer.y - 40, '👋');
    });

    socket.on('whisperReceived', (data) => {
      playAudio(audioPop, 0.8);
      showToast(`[귓속말 from ${data.fromNickname}]: ${data.text}`, '🔒');
      appendChatMessage({
        senderId: data.fromId,
        nickname: `[귓속말] ${data.fromNickname}`,
        text: data.text,
        cafeName: '비밀 대화'
      });
    });

    socket.on('spawnEmojiEffect', (data) => {
      spawnEmojiParticles(data.x, data.y, data.emoji);
    });

    socket.on('systemNotification', (data) => {
      showToast(data.message, data.type === 'warn' ? '⚠️' : '✨');
    });

    socket.on('classSessionReset', (data) => {
      myVote = null;
      myHandRaised = false;
      btnAgree.classList.remove('active');
      btnDisagree.classList.remove('active');
      btnHand.classList.remove('active');

      if (myPlayer) {
        myPlayer.className = data.newClassName;
        myPlayer.vote = null;
        myPlayer.statusEmoji = '';
        myPlayer.hasBadge = false;
        myPlayer.quest = { m1: false, m2: false, m3: 0, m4: false };
        updateQuestUI(myPlayer.quest);
        renderInventoryUI(myPlayer.inventory);
      }

      if (currentAdminClassName) {
        currentAdminClassName.textContent = data.newClassName;
      }

      playAudio(audioPop, 1.0);
      showToast(data.message, '🧹');
    });

    socket.on('votesReset', () => {
      myVote = null;
      btnAgree.classList.remove('active');
      btnDisagree.classList.remove('active');
      if (myPlayer) myPlayer.quest.m4 = false;
      showToast('투표 결과가 초기화되었습니다.', '🔄');
    });

    socket.on('allPlayerStatusesReset', () => {
      if (myPlayer && !myHandRaised) myPlayer.statusEmoji = '';
      otherPlayers.forEach(p => {
        if (!p.handRaised) p.statusEmoji = '';
      });
    });

    socket.on('voteTallyUpdated', (tally) => {
      updateVoteTallyUI(tally);
    });

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

    socket.on('handRaiseQueueUpdated', (queue) => {
      updateSpeakerQueueUI(queue);
    });

    socket.on('questProgressUpdated', (list) => {
      updateStudentQuestMonitoringUI(list);
    });

    socket.on('studentListUpdated', (list) => {
      updateAdminStudentList(list);
    });

    socket.on('kickedByTeacher', (data) => {
      alert(data.message || '선생님에 의해 접속이 정리되었습니다. 다시 입장해 주세요!');
      isJoined = false;
      loginModal.classList.remove('hidden');
      bottomActionBar.classList.add('hidden');
    });

    socket.on('chatBroadcast', (msg) => {
      appendChatMessage(msg);
      if (chatDrawer.classList.contains('closed')) {
        chatBadge.classList.remove('hidden');
      }
    });

    // [교사 말씀/채팅 전체 대형 배너 수신]
    socket.on('teacherAnnouncement', (data) => {
      showBigTeacherBanner(data.text, data.sender || '선생님');
    });
  }

  // --- 5. 물리 엔진 및 미끄러짐 충돌 판정 (Collision Engine) ---
  function getObstacles() {
    const list = [];

    // 1. 중앙 분수대 (원형)
    list.push({
      type: 'circle',
      x: mapConfig.fountain.x,
      y: mapConfig.fountain.y,
      r: mapConfig.fountain.radius
    });

    // 2. 중앙 투표함 (박스)
    list.push({
      type: 'rect',
      x: mapConfig.ballotBox.x - mapConfig.ballotBox.w / 2,
      y: mapConfig.ballotBox.y - mapConfig.ballotBox.h / 2,
      w: mapConfig.ballotBox.w,
      h: mapConfig.ballotBox.h
    });

    // 3. 자치 게시판 (박스)
    list.push({
      type: 'rect',
      x: mapConfig.noticeBoard.x - mapConfig.noticeBoard.w / 2,
      y: mapConfig.noticeBoard.y - mapConfig.noticeBoard.h / 2,
      w: mapConfig.noticeBoard.w,
      h: mapConfig.noticeBoard.h
    });

    // 4. 7개 카페 벽면 (지붕 및 좌우/상단 벽)
    mapConfig.cafes.forEach(c => {
      const left = c.x - c.w / 2;
      const right = c.x + c.w / 2;
      const top = c.y - c.h / 2;
      const bottom = c.y + c.h / 2;

      // 상단 지붕 벽 (통과 불가)
      list.push({ type: 'rect', x: left, y: top, w: c.w, h: 48 });
      // 좌측 벽
      list.push({ type: 'rect', x: left, y: top + 48, w: 16, h: c.h - 48 });
      // 우측 벽
      list.push({ type: 'rect', x: right - 16, y: top + 48, w: 16, h: c.h - 48 });
      // 하단 좌측/우측 벽 (중앙 입구 70px은 제외)
      const doorGapHalf = 36;
      list.push({ type: 'rect', x: left, y: bottom - 16, w: c.w / 2 - doorGapHalf, h: 16 });
      list.push({ type: 'rect', x: c.x + doorGapHalf, y: bottom - 16, w: c.w / 2 - doorGapHalf, h: 16 });

      // [핵심] 정원이 4명 찼는데 본인이 안에 없는 경우 -> 입구 문 차단벽 활성화!
      let count = 0;
      if (myPlayer && myPlayer.cafeId === c.id) count++;
      otherPlayers.forEach(p => { if (p.cafeId === c.id) count++; });

      if (count >= c.max && (!myPlayer || myPlayer.cafeId !== c.id)) {
        list.push({
          type: 'rect',
          x: c.x - doorGapHalf,
          y: bottom - 20,
          w: doorGapHalf * 2,
          h: 20,
          isLockedDoor: true
        });
      }
    });

    return list;
  }

  function isColliding(x, y, radius = 14) {
    // 맵 외곽 경계
    if (x - radius < 30 || x + radius > mapConfig.width - 30) return true;
    if (y - radius < 30 || y + radius > mapConfig.height - 30) return true;

    const obstacles = getObstacles();
    for (const obs of obstacles) {
      if (obs.type === 'circle') {
        const dist = Math.hypot(x - obs.x, y - obs.y);
        if (dist < radius + obs.r) return true;
      } else if (obs.type === 'rect') {
        const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.w));
        const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.h));
        const dist = Math.hypot(x - closestX, y - closestY);
        if (dist < radius) return true;
      }
    }
    return false;
  }

  // --- 6. 🎒 인벤토리 & 드래그 앤 드롭 투표함 투입 ---
  btnInventoryToggle.addEventListener('click', () => {
    inventoryModal.classList.toggle('hidden');
    if (myPlayer) renderInventoryUI(myPlayer.inventory);
  });

  btnCloseInventory.addEventListener('click', () => {
    inventoryModal.classList.add('hidden');
  });

  function renderInventoryUI(items) {
    if (!items || !inventorySlots) return;
    inventorySlots.innerHTML = '';

    items.forEach(item => {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.setAttribute('data-id', item.id);

      slot.innerHTML = `
        <span class="slot-icon">${item.icon}</span>
        <span class="slot-name">${item.name}</span>
        <p class="slot-desc">${item.desc}</p>
        ${item.type === 'ballot' ? `<button class="btn-slot-use" data-vote="${item.voteChoice}">투표함 투입</button>` : ''}
      `;

      // 투표용지일 경우 터치/클릭으로 1-터치 투입도 지원
      const btnUse = slot.querySelector('.btn-slot-use');
      if (btnUse) {
        btnUse.addEventListener('click', (e) => {
          e.stopPropagation();
          submitBallot(item.voteChoice);
          inventoryModal.classList.add('hidden');
        });
      }

      // 드래그 앤 드롭 시작 (터치 & 마우스)
      if (item.type === 'ballot') {
        slot.addEventListener('pointerdown', (e) => {
          startDragItem(item, e.clientX, e.clientY);
        });
      }

      inventorySlots.appendChild(slot);
    });
  }

  let draggingItem = null;
  function startDragItem(item, startX, startY) {
    draggingItem = item;
    ghostIcon.textContent = item.icon;
    ghostName.textContent = item.name;
    dragItemGhost.style.left = startX + 'px';
    dragItemGhost.style.top = startY + 'px';
    dragItemGhost.classList.remove('hidden');

    function onPointerMove(e) {
      if (!draggingItem) return;
      dragItemGhost.style.left = e.clientX + 'px';
      dragItemGhost.style.top = e.clientY + 'px';
    }

    function onPointerUp(e) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dragItemGhost.classList.add('hidden');

      if (!draggingItem) return;

      // 캔버스 상 투표함 좌표와 드롭된 스크린 좌표 판정
      const worldDropX = e.clientX + camera.x - screenWidth / 2;
      const worldDropY = e.clientY + camera.y - screenHeight / 2;

      const distToBox = Math.hypot(worldDropX - mapConfig.ballotBox.x, worldDropY - mapConfig.ballotBox.y);
      if (distToBox <= 80) {
        submitBallot(draggingItem.voteChoice);
        inventoryModal.classList.add('hidden');
      }

      draggingItem = null;
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function submitBallot(choice) {
    if (!socket) return;
    socket.emit('submitBallotToBox', { choice });
  }

  // 투표함 근접 퀵 버튼 이벤트
  btnBallotQuickVoteAgree.addEventListener('click', () => submitBallot('agree'));
  btnBallotQuickVoteDisagree.addEventListener('click', () => submitBallot('disagree'));

  // --- 7. 📜 퀘스트 & 미션 시스템 UI ---
  btnQuestToggle.addEventListener('click', () => {
    questModal.classList.toggle('hidden');
    if (myPlayer) updateQuestUI(myPlayer.quest);
  });

  btnCloseQuest.addEventListener('click', () => {
    questModal.classList.add('hidden');
  });

  btnQuestAction1.addEventListener('click', () => {
    if (socket) socket.emit('completeQuestStep', { step: 'm1' });
    showToast('미션 1: 상정된 안건을 확인했습니다!', '✅');
  });

  btnQuestAction2.addEventListener('click', () => {
    openNoticeBoard();
  });

  function updateQuestUI(q) {
    if (!q) return;

    let count = 0;
    // 미션 1
    if (q.m1) {
      questItem1.classList.add('done');
      questItem1.querySelector('.quest-status-icon').textContent = '✅';
      btnQuestAction1.textContent = '완료됨';
      btnQuestAction1.disabled = true;
      count++;
    } else {
      questItem1.classList.remove('done');
      questItem1.querySelector('.quest-status-icon').textContent = '⬜';
    }

    // 미션 2
    if (q.m2) {
      questItem2.classList.add('done');
      questItem2.querySelector('.quest-status-icon').textContent = '✅';
      btnQuestAction2.textContent = '열람완료';
      count++;
    } else {
      questItem2.classList.remove('done');
      questItem2.querySelector('.quest-status-icon').textContent = '⬜';
    }

    // 미션 3
    questTalkCountBadge.textContent = `${q.m3 || 0}/2회`;
    if (q.m3 >= 2) {
      questItem3.classList.add('done');
      questItem3.querySelector('.quest-status-icon').textContent = '✅';
      count++;
    } else {
      questItem3.classList.remove('done');
      questItem3.querySelector('.quest-status-icon').textContent = '⬜';
    }

    // 미션 4
    if (q.m4) {
      questItem4.classList.add('done');
      questItem4.querySelector('.quest-status-icon').textContent = '✅';
      questVoteBadge.textContent = '투표완료 🗳️';
      count++;
    } else {
      questItem4.classList.remove('done');
      questItem4.querySelector('.quest-status-icon').textContent = '⬜';
      questVoteBadge.textContent = '투표 대기';
    }

    const pct = Math.round((count / 4) * 100);
    questBadgeCount.textContent = `${count}/4`;
    questProgressPercentText.textContent = `${count}/4 (${pct}%)`;
    questProgressBarFill.style.width = `${pct}%`;
  }

  // --- 8. 📋 마을 자치 게시판 자료 열람 ---
  btnBoardToggle.addEventListener('click', openNoticeBoard);
  btnCloseBoard.addEventListener('click', () => noticeBoardModal.classList.add('hidden'));

  btnConfirmBoardRead.addEventListener('click', () => {
    noticeBoardModal.classList.add('hidden');
    if (socket) socket.emit('completeQuestStep', { step: 'm2' });
  });

  function openNoticeBoard() {
    boardTopicTitle.textContent = '📋 중학교 직접민주주의 자치 안건 자료';
    boardTopicContent.textContent =
      `[안건 1: 촉법소년 폐지 쟁점]\n${noticeMaterials[1]?.content || ''}\n\n` +
      `[안건 2: 교내 스마트폰 반입 금지 쟁점]\n${noticeMaterials[2]?.content || ''}\n\n` +
      `[안건 3: 노키즈존 운영 금지 쟁점]\n${noticeMaterials[3]?.content || ''}`;
    noticeBoardModal.classList.remove('hidden');
  }

  // --- 9. 👥 MMO 학생 아바타 터치 상호작용 (하이파이브, 귓속말) ---
  canvas.addEventListener('click', (e) => {
    const worldClickX = e.clientX + camera.x - screenWidth / 2;
    const worldClickY = e.clientY + camera.y - screenHeight / 2;

    // 1. 게시판 터치 판정
    const b = mapConfig.noticeBoard;
    if (Math.abs(worldClickX - b.x) <= b.w / 2 && Math.abs(worldClickY - b.y) <= b.h / 2) {
      openNoticeBoard();
      return;
    }

    // 2. 다른 학생 아바타 터치 판정
    for (const [id, p] of otherPlayers.entries()) {
      const dist = Math.hypot(worldClickX - p.x, worldClickY - p.y);
      if (dist <= 30) {
        openPlayerInteractMenu(p, e.clientX, e.clientY);
        return;
      }
    }

    // 빈 공간 클릭 시 상호작용 메뉴 닫기
    playerInteractMenu.classList.add('hidden');
  });

  function openPlayerInteractMenu(targetPlayer, screenX, screenY) {
    selectedTargetPlayerId = targetPlayer.id;
    interactNick.textContent = targetPlayer.nickname;
    interactAvatarPreview.textContent = targetPlayer.hasBadge ? '🏅' : '👤';
    interactBadgeTag.textContent = targetPlayer.hasBadge ? '🏅 성숙한 민주시민' : '참여 학생';

    playerInteractMenu.style.left = Math.min(screenWidth - 240, Math.max(10, screenX - 110)) + 'px';
    playerInteractMenu.style.top = Math.min(screenHeight - 180, Math.max(70, screenY - 140)) + 'px';
    playerInteractMenu.classList.remove('hidden');
  }

  btnCloseInteract.addEventListener('click', () => playerInteractMenu.classList.add('hidden'));

  btnHighFive.addEventListener('click', () => {
    if (!socket || !selectedTargetPlayerId) return;
    socket.emit('interactPlayer', { targetId: selectedTargetPlayerId, action: 'highfive' });
    playerInteractMenu.classList.add('hidden');
  });

  btnWhisper.addEventListener('click', () => {
    if (!socket || !selectedTargetPlayerId) return;
    const text = prompt('보낼 1:1 비밀 귓속말 메시지를 입력하세요:');
    if (text) {
      socket.emit('interactPlayer', { targetId: selectedTargetPlayerId, action: 'whisper', text });
    }
    playerInteractMenu.classList.add('hidden');
  });

  btnCloseCelebration.addEventListener('click', () => {
    badgeCelebrationOverlay.classList.add('hidden');
  });

  // --- 10. 조작 (가상 조이스틱 & 탭 이동) ---
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
      tapMove.active = false;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!joystick.active) return;
      const touch = getTouch(e, joystick.touchId);
      if (touch) handleJoystickMove(touch.clientX, touch.clientY);
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

  canvas.addEventListener('touchstart', (e) => {
    const touch = e.changedTouches[0];
    // [태블릿 터치 오동작 방지]: 좌측 하단 조이스틱, 우측 하단 액션 버튼 바, 상단 바 터치 시 캔버스 이동 무시
    if (touch.clientX < 220 && touch.clientY > screenHeight - 220) return;
    if (touch.clientX > screenWidth - 320 && touch.clientY > screenHeight - 160) return;
    if (touch.clientY < 80) return;

    const worldX = Math.round(touch.clientX + camera.x - screenWidth / 2);
    const worldY = Math.round(touch.clientY + camera.y - screenHeight / 2);

    tapMove.active = true;
    tapMove.targetX = worldX;
    tapMove.targetY = worldY;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
  });

  initJoystick();

  // --- 11. 하단 액션 버튼 & 채팅 ---
  btnHand.addEventListener('click', () => {
    myHandRaised = !myHandRaised;
    btnHand.classList.toggle('active', myHandRaised);
    playAudio(audioPop, 0.9);
    if (socket) socket.emit('raiseHand');
  });

  btnAgree.addEventListener('click', () => {
    if (!voteActive) return;
    submitBallot('agree');
  });

  btnDisagree.addEventListener('click', () => {
    if (!voteActive) return;
    submitBallot('disagree');
  });

  btnChatToggle.addEventListener('click', () => {
    chatDrawer.classList.toggle('closed');
    chatBadge.classList.add('hidden');
    if (!chatDrawer.classList.contains('closed')) {
      setTimeout(() => chatInput.focus(), 100);
    }
  });

  btnCloseChat.addEventListener('click', () => chatDrawer.classList.add('closed'));

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.getAttribute('data-msg');
      if (msg) sendChatMessage(msg);
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
    const isTeacher = !!msg.isTeacher;
    const row = document.createElement('div');
    row.className = `chat-bubble-row ${isMine ? 'mine' : 'other'} ${isTeacher ? 'teacher-chat-row' : ''}`;

    const senderInfo = document.createElement('div');
    senderInfo.className = `chat-sender-info ${isTeacher ? 'teacher-sender-info' : ''}`;
    senderInfo.textContent = `${isTeacher ? '👑 [교사] ' : (msg.hasBadge ? '🏅 ' : '')}${msg.nickname} · ${msg.cafeName || '광장'}`;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isTeacher ? 'teacher-chat-bubble' : ''}`;
    bubble.textContent = msg.text;

    row.appendChild(senderInfo);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- 12. 교사 관리자(Admin) 패널 ---
  btnAdminToggle.addEventListener('click', () => {
    adminPanel.classList.toggle('closed');
    resizeCanvas();
  });
  btnCloseAdmin.addEventListener('click', () => {
    adminPanel.classList.toggle('closed');
    resizeCanvas();
  });

  // --- [노트북 교사 모드 전용 키보드 단축키 (Keyboard Hotkeys)] ---
  if (isAdmin) {
    window.addEventListener('keydown', (e) => {
      // 텍스트 입력창 포커스 중에는 단축키 비활성화
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.code === 'Digit1') {
        e.preventDefault();
        const btn1 = document.querySelector('.btn-agenda-quick[data-id="1"]');
        if (btn1) btn1.click();
      } else if (e.code === 'Digit2') {
        e.preventDefault();
        const btn2 = document.querySelector('.btn-agenda-quick[data-id="2"]');
        if (btn2) btn2.click();
      } else if (e.code === 'Digit3') {
        e.preventDefault();
        const btn3 = document.querySelector('.btn-agenda-quick[data-id="3"]');
        if (btn3) btn3.click();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (btnSummonAll) btnSummonAll.click();
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        if (btnToggleVote) btnToggleVote.click();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (btnResetVotes) btnResetVotes.click();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        btnChatToggle.click();
      }
    });
  }

  // [수업 결과 엑셀(CSV) 다운로드]
  if (btnExportClassResults) {
    btnExportClassResults.addEventListener('click', () => {
      const targetClass = currentAdminClassName ? currentAdminClassName.textContent : '1반';
      window.open(`/api/export-results?class=${encodeURIComponent(targetClass)}`, '_blank');
      showToast(`[${targetClass}] 수업 결과 엑셀(CSV) 다운로드가 시작되었습니다!`, '📥');
    });
  }

  // [새 학급 수업 시작 (원터치 전체 리셋)]
  if (btnStartNewClassSession) {
    btnStartNewClassSession.addEventListener('click', () => {
      const currentClass = currentAdminClassName ? currentAdminClassName.textContent : '1반';
      const newClass = prompt(`현재 [${currentClass}] 수업을 마치고 새 학급 수업을 시작합니다.\n다음 반 이름을 입력하세요 (예: 2반, 3반):`, '2반');
      if (newClass && newClass.trim()) {
        if (confirm(`[${currentClass}]의 투표 및 퀘스트 기록이 아카이브에 저장되고, 모든 접속 상태가 [${newClass.trim()}] 수업으로 깨끗하게 초기화됩니다. 진행하시겠습니까?`)) {
          if (socket) socket.emit('adminStartNewClass', { newClassName: newClass.trim() });
        }
      }
    });
  }

  quickAgendaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const agendaText = btn.getAttribute('data-agenda');
      const agendaId = parseInt(btn.getAttribute('data-id')) || 1;
      if (confirm(`다음 안건을 모든 학생 화면에 송출하시겠습니까?\n\n"${agendaText}"`)) {
        if (socket) socket.emit('adminSetAgenda', { text: agendaText, agendaId });
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

  btnSummonAll.addEventListener('click', () => {
    if (confirm('모든 학생을 중앙 광장으로 즉시 소환하시겠습니까? (소회의실 인원 전원 복귀)')) {
      if (socket) socket.emit('adminSummonAll');
    }
  });

  btnToggleVote.addEventListener('click', () => {
    const nextState = !voteActive;
    if (socket) socket.emit('adminToggleVote', { active: nextState });
  });

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
    adminBadgeAwardCount.textContent = tally.badgeCount || 0;
    if (currentAdminClassName && tally.currentClassName) {
      currentAdminClassName.textContent = tally.currentClassName;
    }
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
        ? c.occupants.map(o => `${o.hasBadge ? '🏅' : ''}${o.nickname}`).join(', ')
        : '비어 있음';

      card.innerHTML = `
        <div class="cafe-card-header">
          <span>${c.name}</span>
          <span class="cafe-card-badge ${isFull ? 'full' : ''}">${c.current}/${c.max}명 ${isFull ? '🔒' : ''}</span>
        </div>
        <div class="cafe-occupant-names">${names}</div>
      `;
      cafeMonitoringGrid.appendChild(card);
    });
  }

  function updateStudentQuestMonitoringUI(list) {
    if (!list || !studentQuestMonitoringList) return;
    studentQuestMonitoringList.innerHTML = '';

    list.forEach(item => {
      const row = document.createElement('div');
      row.className = 'student-quest-row';
      row.innerHTML = `
        <span>${item.hasBadge ? '🏅 ' : ''}${item.nickname}</span>
        <span style="color: ${item.hasBadge ? '#f59e0b' : '#94a3b8'};">
          ${item.hasBadge ? '🏅 배지 획득' : `미션 ${item.completedCount}/4 완료`}
          ${item.vote ? (item.vote === 'agree' ? ' (찬성✅)' : ' (반대❌)') : ''}
        </span>
      `;
      studentQuestMonitoringList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function updateAdminStudentList(list) {
    if (!list || !adminStudentList) return;
    if (adminStudentCount) adminStudentCount.textContent = list.length;
    adminStudentList.innerHTML = '';

    if (list.length === 0) {
      adminStudentList.innerHTML = '<div class="empty-notice">현재 접속 중인 학생이 없습니다.</div>';
      return;
    }

    list.forEach(student => {
      const row = document.createElement('div');
      row.className = 'admin-student-row';

      let voteLabel = '미투표 ⏳';
      let voteClass = 'undecided';
      if (student.vote === 'agree') {
        voteLabel = '찬성 ✅';
        voteClass = 'agree';
      } else if (student.vote === 'disagree') {
        voteLabel = '반대 ❌';
        voteClass = 'disagree';
      }

      row.innerHTML = `
        <div class="admin-student-info">
          <span style="font-size: 1.1rem;">${student.hasBadge ? '🏅' : '👤'}</span>
          <div>
            <div class="admin-student-name">[${escapeHtml(student.className)}] ${escapeHtml(student.nickname)}</div>
            <div class="admin-student-meta">
              <span class="meta-loc-tag">${escapeHtml(student.location)}</span>
              <span class="meta-vote-tag ${voteClass}">${voteLabel}</span>
            </div>
          </div>
        </div>
        <button class="btn-student-kick" data-id="${student.id}" data-name="${escapeHtml(student.nickname)}" title="튕김/중복 학생 퇴장 및 세션 삭제">
          🗑️ 삭제
        </button>
      `;

      const btnKick = row.querySelector('.btn-student-kick');
      btnKick.addEventListener('click', () => {
        const targetId = btnKick.getAttribute('data-id');
        const targetName = btnKick.getAttribute('data-name');
        if (confirm(`'${targetName}' 학생을 퇴장 및 삭제하시겠습니까?\n(튕겨서 중복되었거나 비정상 세션인 경우 정리되며, 학생은 다시 정상 입장할 수 있습니다)`)) {
          if (socket) {
            socket.emit('adminKickStudent', { studentId: targetId });
            showToast(`'${targetName}' 학생을 퇴장 및 삭제 처리했습니다.`, '🗑️');
          }
        }
      });

      adminStudentList.appendChild(row);
    });
  }

  // --- 13. 안건 배너 & 토스트 ---
  let agendaTimer = null;
  function showBigAgendaBanner(text) {
    if (agendaTimer) clearTimeout(agendaTimer);
    bigAgendaText.textContent = text;
    agendaBigBanner.classList.remove('hidden');
    agendaPinnedBar.classList.add('hidden');

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

  // --- [선생님 말씀 대형 배너 송출] ---
  let teacherBannerTimer = null;
  function showBigTeacherBanner(text, sender = '선생님') {
    if (teacherBannerTimer) clearTimeout(teacherBannerTimer);
    if (!teacherBigBanner || !teacherBigText) return;

    teacherBigText.textContent = text;
    teacherBigBanner.classList.remove('hidden');

    playAudio(audioPop, 1.0);

    if (teacherProgress) {
      teacherProgress.style.transition = 'none';
      teacherProgress.style.width = '100%';
      setTimeout(() => {
        teacherProgress.style.transition = 'width 5s linear';
        teacherProgress.style.width = '0%';
      }, 20);
    }

    teacherBannerTimer = setTimeout(() => {
      teacherBigBanner.classList.add('hidden');
    }, 5000);
  }

  if (teacherBigBanner) {
    teacherBigBanner.addEventListener('click', () => {
      if (teacherBannerTimer) clearTimeout(teacherBannerTimer);
      teacherBigBanner.classList.add('hidden');
    });
  }

  let toastTimer = null;
  function showToast(message, icon = '⚠️') {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = message;
    toastIcon.textContent = icon;
    systemToast.classList.remove('hidden');
    toastTimer = setTimeout(() => systemToast.classList.add('hidden'), 3500);
  }

  // --- 14. 파티클 이펙트 시스템 ---
  function spawnBallotParticles(x, y, choice) {
    const color = choice === 'agree' ? '#10b981' : '#ef4444';
    for (let i = 0; i < 20; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: -40 - Math.random() * 90,
        color,
        size: 4 + Math.random() * 4,
        life: 1.0
      });
    }
  }

  function spawnEmojiParticles(x, y, emoji) {
    particles.push({
      x,
      y,
      vx: 0,
      vy: -40,
      emoji,
      life: 1.2
    });
  }

  function spawnConfettiBurst() {
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: myPlayer.x,
        y: myPlayer.y - 40,
        vx: (Math.random() - 0.5) * 200,
        vy: -80 - Math.random() * 140,
        color: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
        size: 5 + Math.random() * 5,
        life: 1.8
      });
    }
  }

  // --- 15. 메인 게임 루프 & 렌더링 ---
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

  function update(dt) {
    if (!isJoined || !myPlayer) return;

    let moveX = 0;
    let moveY = 0;

    if (joystick.active && (Math.abs(joystick.vx) > 0.05 || Math.abs(joystick.vy) > 0.05)) {
      moveX = joystick.vx;
      moveY = joystick.vy;
    } else if (keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS || keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD) {
      if (keys.ArrowUp || keys.KeyW) moveY -= 1;
      if (keys.ArrowDown || keys.KeyS) moveY += 1;
      if (keys.ArrowLeft || keys.KeyA) moveX -= 1;
      if (keys.ArrowRight || keys.KeyD) moveX += 1;
    } else if (tapMove.active) {
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

    const speed = 200;
    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const stepX = (moveX / len) * speed * dt;
      const stepY = (moveY / len) * speed * dt;

      // 물리 미끄러짐 충돌 판정 (Sliding Collision)
      const newX = myPlayer.x + stepX;
      const newY = myPlayer.y + stepY;

      // X축 단독 이동 검사
      if (!isColliding(newX, myPlayer.y)) {
        myPlayer.x = newX;
      }
      // Y축 단독 이동 검사 (벽을 만나도 비스듬히 미끄러짐)
      if (!isColliding(myPlayer.x, newY)) {
        myPlayer.y = newY;
      }

      myPlayer.walkCycle = (myPlayer.walkCycle || 0) + dt * 10;
      myPlayer.isMoving = true;

      if (Math.abs(stepX) > Math.abs(stepY)) {
        myPlayer.facing = stepX > 0 ? 'right' : 'left';
      } else {
        myPlayer.facing = stepY > 0 ? 'down' : 'up';
      }
    } else {
      myPlayer.isMoving = false;
      myPlayer.walkCycle = 0;
    }

    // 투표함 근접(거리 180 이내) 시 하단 투표함 퀵 액션 바 노출
    const distToBallotBox = Math.hypot(myPlayer.x - mapConfig.ballotBox.x, myPlayer.y - mapConfig.ballotBox.y);
    if (distToBallotBox <= 180 && voteActive) {
      ballotBoxActionZone.classList.remove('hidden');
    } else {
      ballotBoxActionZone.classList.add('hidden');
    }

    // 서버로 이동 동기화 (30Hz)
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

    // 다른 플레이어 보간
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

    // 파티클 업데이트
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += (pt.vx || 0) * dt;
      pt.y += (pt.vy || 0) * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    // 카메라 부드러운 추종
    camera.targetX = myPlayer.x;
    camera.targetY = myPlayer.y;
    camera.x += (camera.targetX - camera.x) * 0.12;
    camera.y += (camera.targetY - camera.y) * 0.12;
  }

  // --- 16. 캔버스 2D 렌더링 ---
  function render() {
    ctx.clearRect(0, 0, screenWidth, screenHeight);

    ctx.save();
    ctx.translate(Math.round(screenWidth / 2 - camera.x), Math.round(screenHeight / 2 - camera.y));

    // 1. 잔디 & 길
    drawTerrain();

    // 2. 중앙 광장 & 분수대
    drawCentralPlaza();

    // 3. 광장 투표함 & 자치 게시판
    drawAgoraObjects();

    // 4. 7개 카페 (정원 마감 시 차단 바리케이드 표시)
    drawCafes();

    // 5. 탭 이동 펄스 링
    if (tapMove.active) {
      drawTapTarget(tapMove.targetX, tapMove.targetY);
    }

    // 6. 캐릭터들 (Y좌표 깊이 소팅)
    const renderList = [];
    if (myPlayer) renderList.push(myPlayer);
    otherPlayers.forEach(p => renderList.push(p));
    renderList.sort((a, b) => a.y - b.y);

    renderList.forEach(p => drawCharacter(p, p.id === myId));

    // 7. 파티클 이펙트
    drawParticles();

    ctx.restore();
  }

  function drawTerrain() {
    ctx.fillStyle = '#476e46';
    ctx.fillRect(0, 0, mapConfig.width, mapConfig.height);

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

    // 도로망
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

    ctx.strokeStyle = '#f3ebd4';
    ctx.lineWidth = 32;
    mapConfig.cafes.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(plaza.centerX, plaza.centerY);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
    });
  }

  function drawCentralPlaza() {
    const plaza = mapConfig.plaza;
    ctx.fillStyle = '#e8dec8';
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#b8a98b';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.strokeStyle = '#8c7b61';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius - 80, 0, Math.PI * 2);
    ctx.stroke();

    // 분수대
    const f = mapConfig.fountain;
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    const wave = (Date.now() / 600) % (Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(f.x, f.y, 16 + Math.sin(wave) * 6, 0, Math.PI * 2);
    ctx.fill();

    // 광장 명판
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    drawRoundRect(ctx, plaza.centerX - 120, plaza.centerY - plaza.radius - 30, 240, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️ 중앙 광장 (민주 아고라)', plaza.centerX, plaza.centerY - plaza.radius - 12);
  }

  // 광장 핵심 오브젝트 (투표함 & 자치 게시판)
  function drawAgoraObjects() {
    const box = mapConfig.ballotBox;
    const board = mapConfig.noticeBoard;

    // 1. [비밀 투표함 🗳️]
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(box.x, box.y + 24, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 투표함 본체 (골든 우드)
    ctx.fillStyle = '#d97706';
    drawRoundRect(ctx, box.x - box.w / 2, box.y - box.h / 2, box.w, box.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 투표 슬롯 구멍
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(box.x - 16, box.y - 12, 32, 6);

    // 투표함 아이콘 & 라벨
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗳️', box.x, box.y + 14);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    drawRoundRect(ctx, box.x - 45, box.y - box.h / 2 - 24, 90, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('비밀 투표함', box.x, box.y - box.h / 2 - 14);

    // 2. [마을 자치 게시판 📋]
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(board.x, board.y + 20, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    drawRoundRect(ctx, board.x - board.w / 2, board.y - board.h / 2, board.w, board.h, 8);
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(board.x - board.w / 2 + 6, board.y - board.h / 2 + 6, board.w - 12, board.h - 12);

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('📋', board.x, board.y + 6);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    drawRoundRect(ctx, board.x - 50, board.y - board.h / 2 - 24, 100, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('자치 게시판 (터치)', board.x, board.y - board.h / 2 - 14);
  }

  function drawCafes() {
    mapConfig.cafes.forEach(cafe => {
      const left = cafe.x - cafe.w / 2;
      const top = cafe.y - cafe.h / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      drawRoundRect(ctx, left + 8, top + 10, cafe.w, cafe.h, 20);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      drawRoundRect(ctx, left, top, cafe.w, cafe.h, 20);
      ctx.fill();

      // 지붕
      ctx.fillStyle = cafe.color;
      drawRoundRect(ctx, left, top, cafe.w, 54, 16);
      ctx.fill();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      drawRoundRect(ctx, left, top, cafe.w, cafe.h, 20);
      ctx.stroke();

      // 테이블 & 의자
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(cafe.x - 45, cafe.y + 20, 18, 0, Math.PI * 2);
      ctx.arc(cafe.x + 45, cafe.y + 20, 18, 0, Math.PI * 2);
      ctx.fill();

      // 인원 계산
      let count = 0;
      if (myPlayer && myPlayer.cafeId === cafe.id) count++;
      otherPlayers.forEach(p => { if (p.cafeId === cafe.id) count++; });
      const isFull = count >= cafe.max;

      // [물리 충돌 시각화] 정원 4명 마감 시 입구 바리케이드 차단선 렌더링!
      if (isFull) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        drawRoundRect(ctx, cafe.x - 38, top + cafe.h - 18, 76, 18, 8);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⛔ 정원 마감', cafe.x, top + cafe.h - 6);
      } else {
        ctx.fillStyle = cafe.color;
        drawRoundRect(ctx, cafe.x - 30, top + cafe.h - 14, 60, 14, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ENTRANCE', cafe.x, top + cafe.h - 4);
      }

      // 상단 간판
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      drawRoundRect(ctx, cafe.x - 70, top - 32, 140, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`☕ ${cafe.name}`, cafe.x, top - 19);

      // 게이지 뱃지
      ctx.fillStyle = isFull ? '#ef4444' : '#10b981';
      drawRoundRect(ctx, cafe.x - 36, top + 60, 72, 20, 10);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`👥 ${count}/${cafe.max}명`, cafe.x, top + 70);
    });
  }

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

  const AVATAR_PALETTE = [
    { body: '#3b82f6', hat: '#1d4ed8', skin: '#fcd34d' },
    { body: '#ef4444', hat: '#b91c1c', skin: '#fed7aa' },
    { body: '#22c55e', hat: '#15803d', skin: '#fde68a' },
    { body: '#eab308', hat: '#a16207', skin: '#fed7aa' },
    { body: '#a855f7', hat: '#7e22ce', skin: '#fcd34d' }
  ];

  function drawCharacter(p, isMe) {
    if (p.isAdmin || p.characterIndex === 99) {
      drawTeacherCharacter(p, isMe);
      return;
    }

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

    // 스프라이트 또는 벡터 캐릭터
    if (charactersLoaded && charactersImg.width >= 160) {
      const sw = 32;
      const sh = 32;
      const sx = cIdx * 32;
      ctx.drawImage(charactersImg, sx, 0, sw, sh, x - 18, y - 32 + bob, 36, 36);
    } else {
      ctx.fillStyle = pal.body;
      drawRoundRect(ctx, x - 10, y - 18 + bob, 20, 16, 6);
      ctx.fill();

      ctx.fillStyle = pal.skin;
      ctx.beginPath();
      ctx.arc(x, y - 24 + bob, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.hat;
      ctx.beginPath();
      ctx.arc(x, y - 27 + bob, 9, Math.PI, Math.PI * 2);
      ctx.fill();

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

    // ================= 머리 위 명찰 & 배지 & 이모지 =================
    // 1줄: [학생 이름] + [🏅 배지]
    ctx.font = isMe ? 'bold 12px sans-serif' : '11px sans-serif';
    const tagText = `${p.hasBadge ? '🏅 ' : ''}${p.className ? '[' + p.className + '] ' : ''}${p.nickname}`;
    const textWidth = ctx.measureText(tagText).width;
    const badgeW = textWidth + 14;
    const badgeH = 18;
    const badgeY = y - 48 + bob;

    ctx.fillStyle = isMe ? 'rgba(37, 99, 235, 0.9)' : 'rgba(15, 23, 42, 0.75)';
    drawRoundRect(ctx, x - badgeW / 2, badgeY, badgeW, badgeH, 9);
    ctx.fill();

    ctx.fillStyle = p.hasBadge ? '#fef08a' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, x, badgeY + badgeH / 2);

    // 2줄: 상태 표시 유니코드 이모지 (✋, ✅, ❌, 💬)
    const emoji = p.statusEmoji;
    if (emoji) {
      const emojiY = badgeY - 18;
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

  // --- [교사 전용 고정 캐릭터 렌더링]: 네이비 정장 수트 + 넥타이 + 출석 태블릿 + 황금 아우라 ---
  function drawTeacherCharacter(p, isMe) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const bob = p.isMoving ? Math.sin(p.walkCycle) * 3 : 0;

    // 1. 발 밑 교사용 황금 단상 아우라 링 (Golden Podium Aura)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 22, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.fill();

    // 2. 바닥 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. 교사 고정 수트 본체 (클래식 네이비 수트 & 레드 타이)
    ctx.fillStyle = '#1e3a8a'; // 네이비 자켓
    drawRoundRect(ctx, x - 12, y - 20 + bob, 24, 18, 6);
    ctx.fill();

    // 화이트 셔츠 깃
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 20 + bob);
    ctx.lineTo(x + 5, y - 20 + bob);
    ctx.lineTo(x, y - 13 + bob);
    ctx.closePath();
    ctx.fill();

    // 와인 레드 넥타이
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 18 + bob);
    ctx.lineTo(x + 2, y - 18 + bob);
    ctx.lineTo(x + 3, y - 9 + bob);
    ctx.lineTo(x, y - 6 + bob);
    ctx.lineTo(x - 3, y - 9 + bob);
    ctx.closePath();
    ctx.fill();

    // 황금 단추
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, y - 9 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 손에 든 교사용 출석 태블릿/클립보드 (📋)
    ctx.fillStyle = '#0f172a';
    drawRoundRect(ctx, x + 9, y - 16 + bob, 8, 12, 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 10, y - 14 + bob, 6, 8);

    // 얼굴 피부톤
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(x, y - 26 + bob, 10, 0, Math.PI * 2);
    ctx.fill();

    // 단정한 선생님 헤어스타일
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(x, y - 29 + bob, 10, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // 지적인 검은 뿔테 안경 👓
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 6, y - 28 + bob, 4, 3);
    ctx.strokeRect(x + 2, y - 28 + bob, 4, 3);
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 27 + bob);
    ctx.lineTo(x + 2, y - 27 + bob);
    ctx.stroke();

    // 4. 머리 위 교사 전용 명찰 (로열 퍼플 & 골드 테두리)
    const tagText = '👑 [교사] 선생님 🧑‍🏫';
    ctx.font = 'bold 12px sans-serif';
    const textWidth = ctx.measureText(tagText).width;
    const badgeW = textWidth + 18;
    const badgeH = 22;
    const badgeY = y - 56 + bob;

    ctx.fillStyle = 'rgba(88, 28, 135, 0.95)'; // 로열 퍼플
    drawRoundRect(ctx, x - badgeW / 2, badgeY, badgeW, badgeH, 11);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24'; // 골드 테두리
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, x, badgeY + badgeH / 2);

    // 5. 교사 말풍선 및 상태 이모지
    const emoji = p.statusEmoji;
    if (emoji) {
      const emojiY = badgeY - 18;
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

      if (emoji === '💬' && p.speechText) {
        ctx.font = '12px sans-serif';
        const msgW = ctx.measureText(p.speechText).width;
        const bubbleW = Math.min(240, msgW + 16);
        const bubbleH = 26;
        const bX = x - bubbleW / 2;
        const bY = emojiY - 32;

        ctx.fillStyle = '#ffffff';
        drawRoundRect(ctx, bX, bY, bubbleW, bubbleH, 13);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.fillText(p.speechText.slice(0, 18) + (p.speechText.length > 18 ? '...' : ''), x, bY + bubbleH / 2);
      }
    }
  }

  function drawParticles() {
    particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life);
      if (pt.emoji) {
        ctx.font = '24px sans-serif';
        ctx.fillText(pt.emoji, pt.x, pt.y);
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

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
