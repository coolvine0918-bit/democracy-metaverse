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

  // 팩트체크 NPC 퀴즈 모달
  const quizModal = document.getElementById('quizModal');
  const btnCloseQuiz = document.getElementById('btnCloseQuiz');
  const quizStepBadge = document.getElementById('quizStepBadge');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const quizTopicBadge = document.getElementById('quizTopicBadge');
  const quizQuestionBox = document.getElementById('quizQuestionBox');
  const quizOptionsList = document.getElementById('quizOptionsList');
  const quizFeedbackBox = document.getElementById('quizFeedbackBox');

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
  const btnStartDiscussionTimer = document.getElementById('btnStartDiscussionTimer');
  const timerBtnTitle = document.getElementById('timerBtnTitle');
  const timerBtnDesc = document.getElementById('timerBtnDesc');
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
  const tallyTotalCount = document.getElementById('tallyTotalCount');
  const barAgree = document.getElementById('barAgree');
  const barNeutral = document.getElementById('barNeutral');
  const barDisagree = document.getElementById('barDisagree');
  const barAgreeText = document.getElementById('barAgreeText');
  const barNeutralText = document.getElementById('barNeutralText');
  const barDisagreeText = document.getElementById('barDisagreeText');
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
    quizNpc: { x: 1360, y: 840, w: 56, h: 64, name: '팩트체크 NPC 🤖' },
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

  // 글로벌 토론 타이머 & 텔레포트 상태
  const discussionTimerWidget = document.getElementById('discussionTimerWidget');
  const timerCountdown = document.getElementById('timerCountdown');
  let clientTimerInterval = null;
  let timerEndsAt = 0;
  let isTimerRunning = false;

  // 텔레포트 파동(Ripple) 및 빛무리 파티클 시스템
  const teleportRipples = [];
  const teleportParticles = [];

  // 실시간 떠오르는 말풍선(Speech Bubbles) & 퀵 리액션 파티클 시스템
  const speechBubbles = new Map();
  const reactionParticles = [];

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
    initSocket('민부영 선생님', 99, '교사');
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
      if (data.stanceTally) {
        updateStanceTallyUI(data.stanceTally);
      }
      updateCafeMonitoringUI(data.cafeStatus);
      updateSpeakerQueueUI(data.handRaiseQueue);
      updateStudentQuestMonitoringUI(data.questProgressList);
      updateAdminStudentList(data.connectedStudents);

      if (data.agenda && data.agenda.active && data.agenda.text) {
        showPinnedAgenda(data.agenda.text);
      }

      // 접속 시 이미 진행 중인 토론 타이머가 있으면 카운트다운 동기화
      if (data.discussionTimer && data.discussionTimer.active && data.discussionTimer.endsAt > Date.now()) {
        startClientTimer(data.discussionTimer.endsAt, data.discussionTimer.duration);
      }
    });

    // 소회의실 토론 3분 타이머 시작 브로드캐스트 수신
    socket.on('timerStarted', (data) => {
      startClientTimer(data.endsAt, data.duration);
      playAudio(audioPop, 0.9);
      showToast('⏱️ 소회의실 3분 토론이 시작되었습니다! 종료 시 광장으로 자동 소환됩니다.', '💬');
    });

    // 토론 타이머 취소 수신
    socket.on('timerCancelled', () => {
      stopClientTimer();
      showToast('⏱️ 소회의실 토론 타이머가 취소되었습니다.', 'ℹ️');
    });

    // 토론 타이머 종료 수신
    socket.on('timerEnded', () => {
      stopClientTimer();
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

    // 광장 소환 (수동 또는 타이머 종료 시 자동 소환)
    socket.on('summonedToPlaza', (data) => {
      playAudio(audioSuccess, 1.0);
      showToast(data.message, '🏛️');
      tapMove.active = false;

      // 타이머 즉시 종료 및 숨김
      stopClientTimer();

      data.players.forEach(pData => {
        if (pData.id === myId && myPlayer) {
          myPlayer.x = pData.x;
          myPlayer.y = pData.y;
          myPlayer.cafeId = null;
          camera.x = pData.x;
          camera.y = pData.y;
          handleStanceTransition(myPlayer.x, myPlayer.y);
          // 내 아바타 위치에 화려한 소환 빛무리 & 파동 이펙트 폭발
          triggerTeleportArrivalEffect(pData.x, pData.y);
        } else {
          const p = otherPlayers.get(pData.id);
          if (p) {
            p.x = pData.x;
            p.y = pData.y;
            p.targetX = pData.x;
            p.targetY = pData.y;
            p.cafeId = null;
            // 다른 급우들 위치에도 동시에 소환 이펙트 생성
            triggerTeleportArrivalEffect(pData.x, pData.y);
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

    // 팩트체크 NPC 퀴즈 보상 수령 (투표용지 3장)
    socket.on('quizRewardGranted', (data) => {
      playAudio(audioSuccess, 1.0);
      spawnConfettiBurst();
      if (myPlayer) {
        myPlayer.quizCompleted = data.quizCompleted;
        myPlayer.votingPaperCount = data.votingPaperCount;
        myPlayer.inventory = data.inventory;
        renderInventoryUI(myPlayer.inventory);
      }
      showToast(data.message, '📜');
    });

    // 투표용지 잔여 수량 갱신 (투표함 투입 시 차감)
    socket.on('votingPaperCountUpdated', (data) => {
      if (myPlayer) {
        myPlayer.votingPaperCount = data.votingPaperCount;
        myPlayer.inventory = data.inventory;
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
        myPlayer.quizCompleted = false;
        myPlayer.votingPaperCount = 0;
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

    // 실시간 아고라 진영 여론 집계 수신
    socket.on('stanceTallyUpdated', (tally) => {
      updateStanceTallyUI(tally);
    });

    socket.on('playerStanceChanged', (data) => {
      if (data.id === myId && myPlayer) {
        myPlayer.currentStance = data.stance;
      } else {
        const p = otherPlayers.get(data.id);
        if (p) p.currentStance = data.stance;
      }
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
      addSpeechBubble(msg.senderId, msg.text);
      if (chatDrawer.classList.contains('closed')) {
        chatBadge.classList.remove('hidden');
      }
    });

    // [퀵 리액션 이모티콘 브로드캐스트 수신]
    socket.on('reactionBroadcast', (data) => {
      const p = (data.playerId === myId) ? myPlayer : otherPlayers.get(data.playerId);
      const x = p ? p.x : data.x;
      const y = p ? p.y : data.y;
      spawnReactionParticle(x, y, data.emoji);
      if (data.playerId !== myId) {
        playAudio(audioPop, 0.5);
      }
    });

    // [교사 말씀/채팅 전체 대형 배너 수신]
    socket.on('teacherAnnouncement', (data) => {
      showBigTeacherBanner(data.text, data.sender || '민부영 선생님');
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

    // 3-1. 팩트체크 NPC (박스)
    if (mapConfig.quizNpc) {
      list.push({
        type: 'rect',
        x: mapConfig.quizNpc.x - mapConfig.quizNpc.w / 2,
        y: mapConfig.quizNpc.y - mapConfig.quizNpc.h / 2,
        w: mapConfig.quizNpc.w,
        h: mapConfig.quizNpc.h
      });
    }

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
    // 맵 외곽 경계 (공통 통과 불가)
    if (x - radius < 30 || x + radius > mapConfig.width - 30) return true;
    if (y - radius < 30 || y + radius > mapConfig.height - 30) return true;

    // 교사(Admin)는 전체 수업 지도 및 카페 순회를 위해 오브젝트/바리케이드에 끼이지 않고 자유 이동 가능
    if (isAdmin || (myPlayer && myPlayer.isAdmin)) return false;

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

      const countBadge = (item.count !== undefined) ? `<span class="slot-badge-count">x${item.count}</span>` : '';
      const isDepleted = item.type === 'ballot' && item.count === 0;
      const useButton = item.type === 'ballot'
        ? (isDepleted
            ? `<button class="btn-slot-use" disabled style="opacity:0.5; cursor:not-allowed; background:#475569;">소진됨</button>`
            : `<button class="btn-slot-use" data-vote="${item.voteChoice}">투표함 투입</button>`)
        : '';

      slot.innerHTML = `
        ${countBadge}
        <span class="slot-icon">${item.icon}</span>
        <span class="slot-name">${item.name}</span>
        <p class="slot-desc">${item.desc}</p>
        ${useButton}
      `;

      // 투표용지일 경우 터치/클릭으로 1-터치 투입도 지원 (소진되지 않았을 때만)
      const btnUse = slot.querySelector('.btn-slot-use:not([disabled])');
      if (btnUse) {
        btnUse.addEventListener('click', (e) => {
          e.stopPropagation();
          submitBallot(item.voteChoice);
          inventoryModal.classList.add('hidden');
        });
      }

      // 드래그 앤 드롭 시작 (터치 & 마우스, 잔여 수량이 있을 때만)
      if (item.type === 'ballot' && !isDepleted) {
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
    if (myPlayer && !myPlayer.isAdmin) {
      if (!myPlayer.quizCompleted || !myPlayer.votingPaperCount || myPlayer.votingPaperCount <= 0) {
        showToast('⚠️ 투표용지가 없습니다! 광장 우측의 [팩트체크 NPC 🤖] 퀴즈를 통과하고 투표용지 3장을 받아오세요.', 'warn');
        return;
      }
    }
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

  // --- 8-1. 🤖 팩트체크 NPC 퀴즈 5문항 시스템 (중학교 1학년 사회: 국민 주권과 시민 자치) ---
  const QUIZ_QUESTIONS = [
    {
      topic: 'Q1. 국민 주권의 원리',
      question: '대한민국 헌법 제1조 제2항: "대한민국의 주권은 (       )에게 있고, 모든 권력은 (       )(으)로부터 나온다." 괄호에 들어갈 가장 알맞은 말은?',
      options: ['① 대통령', '② 국민', '③ 국회의원'],
      answerIndex: 1,
      explanation: '대한민국의 주권은 모든 권력의 원천인 국민에게 있습니다.'
    },
    {
      topic: 'Q2. 민주 정치의 형태',
      question: '시민들이 선거를 통해 대표자를 선출하고, 선출된 대표자가 국가의 중요한 정책을 결정하는 민주 정치 제도는?',
      options: ['① 직접 민주 정치', '② 대의 민주 정치 (간접 민주제)', '③ 군주제'],
      answerIndex: 1,
      explanation: '현대 사회에서는 현실적인 여건을 고려하여 대부분 대의 민주 정치를 운영하고 있습니다.'
    },
    {
      topic: 'Q3. 민주 선거의 4대 원칙',
      question: '어떤 유권자가 어느 후보자나 안건에 표를 던졌는지 타인이 전혀 알 수 없도록 보장하는 선거 원칙은?',
      options: ['① 비밀 선거', '② 보통 선거', '③ 평등 선거'],
      answerIndex: 0,
      explanation: '비밀 선거는 외부 압력 없이 유권자가 자유롭게 소신 투표할 수 있도록 보장합니다.'
    },
    {
      topic: 'Q4. 시민 자치와 지방 자치',
      question: '지역 주민들이 자신이 거주하는 지역의 문제와 조례를 스스로 결정하고 처리하는 풀뿌리 민주주의 제도는?',
      options: ['① 중앙 집권 제도', '② 지방 자치 제도', '③ 사법 시험 제도'],
      answerIndex: 1,
      explanation: '지방 자치 제도는 주민이 직접 지역 문제를 협의하고 해결하는 시민 자치의 핵심입니다.'
    },
    {
      topic: 'Q5. 민주적 의사결정의 태도',
      question: '민주주의 사회에서 안건에 대한 찬반 의견이 팽팽히 맞설 때 가장 바람직한 문제 해결 원리는?',
      options: ['① 다수의 힘으로 소수 의견 묵살하기', '② 대화와 타협을 통한 소수 의견 존중', '③ 갈등을 피하기 위해 침묵하기'],
      answerIndex: 1,
      explanation: '다수결 원리를 취하더라도 대화와 타협을 거치고 소수 의견을 경청하는 것이 민주주의의 기본 정신입니다.'
    }
  ];

  let currentQuizIndex = 0;
  let isQuizSubmitting = false;

  if (btnCloseQuiz) {
    btnCloseQuiz.addEventListener('click', closeQuizModal);
  }

  function openQuizModal() {
    currentQuizIndex = 0;
    isQuizSubmitting = false;
    renderCurrentQuiz();
    if (quizFeedbackBox) quizFeedbackBox.classList.add('hidden');
    if (quizModal) quizModal.classList.remove('hidden');
    playAudio(audioPop, 0.7);
  }

  function closeQuizModal() {
    if (quizModal) quizModal.classList.add('hidden');
  }

  function renderCurrentQuiz() {
    const q = QUIZ_QUESTIONS[currentQuizIndex];
    if (!q) return;

    if (quizStepBadge) quizStepBadge.textContent = `진행도 ${currentQuizIndex + 1} / 5`;
    if (quizProgressBar) quizProgressBar.style.width = `${((currentQuizIndex + 1) / 5) * 100}%`;
    if (quizTopicBadge) quizTopicBadge.textContent = q.topic;
    if (quizQuestionBox) quizQuestionBox.textContent = q.question;
    if (quizFeedbackBox) {
      quizFeedbackBox.className = 'quiz-feedback-box hidden';
      quizFeedbackBox.textContent = '';
    }

    if (!quizOptionsList) return;
    quizOptionsList.innerHTML = '';
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-quiz-option';
      btn.innerHTML = `<span class="opt-text">${optText}</span>`;
      btn.addEventListener('click', () => handleQuizOptionClick(idx, btn));
      quizOptionsList.appendChild(btn);
    });
  }

  function handleQuizOptionClick(chosenIndex, btnElement) {
    if (isQuizSubmitting) return;
    const q = QUIZ_QUESTIONS[currentQuizIndex];
    const isCorrect = chosenIndex === q.answerIndex;

    if (isCorrect) {
      isQuizSubmitting = true;
      btnElement.classList.add('correct');
      if (quizFeedbackBox) {
        quizFeedbackBox.className = 'quiz-feedback-box correct';
        quizFeedbackBox.textContent = `정답입니다! 👏 ${q.explanation}`;
        quizFeedbackBox.classList.remove('hidden');
      }
      playAudio(audioSuccess, 0.8);

      setTimeout(() => {
        if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
          currentQuizIndex++;
          isQuizSubmitting = false;
          renderCurrentQuiz();
        } else {
          // 5문제 모두 정답 완료!
          finishQuizSuccessfully();
        }
      }, 550);
    } else {
      isQuizSubmitting = true;
      btnElement.classList.add('wrong');
      if (quizFeedbackBox) {
        quizFeedbackBox.className = 'quiz-feedback-box wrong';
        quizFeedbackBox.textContent = '다시 한번 생각해 보세요! ❌ (1.2초 후 1번 문제부터 다시 도전합니다)';
        quizFeedbackBox.classList.remove('hidden');
      }
      playAudio(audioPop, 0.6);

      setTimeout(() => {
        currentQuizIndex = 0;
        isQuizSubmitting = false;
        renderCurrentQuiz();
      }, 1200);
    }
  }

  function finishQuizSuccessfully() {
    closeQuizModal();
    isQuizSubmitting = false;

    // 축하 연출
    playAudio(audioSuccess, 1.0);
    spawnConfettiBurst();

    if (socket) {
      socket.emit('completeQuiz');
    }

    showToast('축하합니다! 3개의 안건에 투표할 수 있는 투표용지 3장(📜x3)을 획득했습니다.', '🎉');
  }

  function handleNpcInteract() {
    if (!myPlayer) return;
    const npc = mapConfig.quizNpc;
    if (!npc) return;

    const dist = Math.hypot(myPlayer.x - npc.x, myPlayer.y - npc.y);
    if (dist > 130) {
      showToast('⚠️ 팩트체크 NPC에게 조금 더 가까이 다가가서 터치해 주세요! (반경 130px 이내)', 'warn');
      return;
    }

    if (myPlayer.quizCompleted) {
      showToast(`이미 퀴즈를 통과했습니다. 중앙 투표함에서 안건에 투표하세요! (남은 투표용지: 📜x${myPlayer.votingPaperCount || 0})`, 'info');
      return;
    }

    openQuizModal();
  }

  // --- 9. 👥 MMO 학생 아바타 터치 상호작용 (하이파이브, 귓속말) ---
  canvas.addEventListener('click', (e) => {
    const worldClickX = e.clientX + camera.x - screenWidth / 2;
    const worldClickY = e.clientY + camera.y - screenHeight / 2;

    // 1. 게시판 터치 판정
    const b = mapConfig.noticeBoard;
    if (b && Math.abs(worldClickX - b.x) <= b.w / 2 && Math.abs(worldClickY - b.y) <= b.h / 2) {
      openNoticeBoard();
      return;
    }

    // 1-1. 팩트체크 NPC 터치 판정
    const npc = mapConfig.quizNpc;
    if (npc) {
      const clickDistToNpc = Math.hypot(worldClickX - npc.x, worldClickY - npc.y);
      if (clickDistToNpc <= 45 || (Math.abs(worldClickX - npc.x) <= npc.w / 2 + 10 && Math.abs(worldClickY - npc.y) <= npc.h / 2 + 10)) {
        tapMove.active = false;
        handleNpcInteract();
        return;
      }
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

    // 게시판 또는 NPC 터치 시 걸어가지 않고 즉시 상호작용
    const npc = mapConfig.quizNpc;
    if (npc && Math.hypot(worldX - npc.x, worldY - npc.y) <= 45) return;
    const b = mapConfig.noticeBoard;
    if (b && Math.abs(worldX - b.x) <= b.w / 2 && Math.abs(worldY - b.y) <= b.h / 2) return;

    tapMove.active = true;
    tapMove.targetX = worldX;
    tapMove.targetY = worldY;
  }, { passive: true });

  // [노트북/데스크톱 마우스 클릭 이동 지원]
  canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // 마우스 좌클릭만 반응
    const worldX = Math.round(e.clientX + camera.x - screenWidth / 2);
    const worldY = Math.round(e.clientY + camera.y - screenHeight / 2);

    // 게시판 또는 NPC 클릭 시 이동 무시 (클릭 이벤트로 모달 실행)
    const npc = mapConfig.quizNpc;
    if (npc && Math.hypot(worldX - npc.x, worldY - npc.y) <= 45) return;
    const b = mapConfig.noticeBoard;
    if (b && Math.abs(worldX - b.x) <= b.w / 2 && Math.abs(worldY - b.y) <= b.h / 2) return;

    tapMove.active = true;
    tapMove.targetX = worldX;
    tapMove.targetY = worldY;
  });

  // [노트북 키보드 조작 처리]: 방향키(↑↓←→), WASD, 한글 ㅈ/ㄴ/ㅁ/ㅇ 및 브라우저 스크롤 방지
  function handleKeyEvent(e, isDown) {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

    const code = e.code || '';
    const key = e.key || '';
    let handled = false;

    if (code === 'ArrowUp' || key === 'ArrowUp' || key === 'Up' || code === 'KeyW' || key === 'w' || key === 'W' || key === 'ㅈ') {
      keys.ArrowUp = isDown;
      keys.KeyW = isDown;
      handled = true;
    }
    if (code === 'ArrowDown' || key === 'ArrowDown' || key === 'Down' || code === 'KeyS' || key === 's' || key === 'S' || key === 'ㄴ') {
      keys.ArrowDown = isDown;
      keys.KeyS = isDown;
      handled = true;
    }
    if (code === 'ArrowLeft' || key === 'ArrowLeft' || key === 'Left' || code === 'KeyA' || key === 'a' || key === 'A' || key === 'ㅁ') {
      keys.ArrowLeft = isDown;
      keys.KeyA = isDown;
      handled = true;
    }
    if (code === 'ArrowRight' || key === 'ArrowRight' || key === 'Right' || code === 'KeyD' || key === 'd' || key === 'D' || key === 'ㅇ') {
      keys.ArrowRight = isDown;
      keys.KeyD = isDown;
      handled = true;
    }

    if (handled) {
      if (isDown) {
        tapMove.active = false;
        e.preventDefault(); // 방향키에 의한 브라우저 스크롤/버튼 이동 방지!
      }
    }
  }

  window.addEventListener('keydown', (e) => handleKeyEvent(e, true));
  window.addEventListener('keyup', (e) => handleKeyEvent(e, false));
  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
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

  // --- [태블릿 우측 엄지 퀵 리액션 버튼 (👍, 🤔, ❌) 이벤트 바인딩] ---
  const quickReactionButtons = document.querySelectorAll('.btn-reaction-float');
  quickReactionButtons.forEach(btn => {
    let lastTap = 0;
    const triggerQuickReaction = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTap < 300) return; // 300ms 탭 디바운스
      lastTap = now;

      const emoji = btn.getAttribute('data-emoji') || '👍';
      if (socket) {
        socket.emit('quickReaction', { emoji });
      }
      if (myPlayer) {
        spawnReactionParticle(myPlayer.x, myPlayer.y, emoji);
      }
      playAudio(audioPop, 0.7);
    };

    btn.addEventListener('click', triggerQuickReaction);
    btn.addEventListener('touchstart', triggerQuickReaction, { passive: false });
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
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        if (btnStartDiscussionTimer) btnStartDiscussionTimer.click();
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

  if (btnStartDiscussionTimer) {
    btnStartDiscussionTimer.addEventListener('click', () => {
      if (isTimerRunning) {
        if (confirm('현재 진행 중인 3분 소회의실 토론 타이머를 취소하시겠습니까?')) {
          if (socket) socket.emit('adminCancelTimer');
        }
      } else {
        if (confirm('소회의실 토론 시간제한(3분)을 시작하시겠습니까?\n\n- 28명 모든 학생 화면 상단에 실시간 카운트다운(03:00)이 표시됩니다.\n- 10초 미만 시 빨간색 깜빡임 경고가 켜집니다.\n- 3분 종료 시 모든 학생이 중앙 광장으로 자동 소환됩니다.')) {
          if (socket) socket.emit('adminStartTimer', { duration: 180 });
        }
      }
    });
  }

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

  // 실시간 3색 진영 여론 게이지 바 및 카운트 UI 업데이트
  function updateStanceTallyUI(tally) {
    if (!tally) return;
    const total = tally.total || 0;
    const pro = tally.pro || 0;
    const con = tally.con || 0;
    const neutral = tally.neutral || 0;
    const proPct = tally.proPercent || 0;
    const conPct = tally.conPercent || 0;
    const neutralPct = tally.neutralPercent || 0;

    if (tallyTotalCount) tallyTotalCount.textContent = total;
    if (tallyAgreeCount) tallyAgreeCount.textContent = `${pro}명`;
    if (tallyAgreePercent) tallyAgreePercent.textContent = `(${proPct}%)`;
    if (tallyUndecidedCount) tallyUndecidedCount.textContent = `${neutral}명`;
    if (tallyUndecidedPercent) tallyUndecidedPercent.textContent = `(${neutralPct}%)`;
    if (tallyDisagreeCount) tallyDisagreeCount.textContent = `${con}명`;
    if (tallyDisagreePercent) tallyDisagreePercent.textContent = `(${conPct}%)`;

    // 3색 가로형 프로그레스 바 너비 및 라벨 갱신
    if (barAgree) {
      barAgree.style.width = `${proPct}%`;
      if (barAgreeText) barAgreeText.textContent = proPct >= 8 ? `${proPct}%` : '';
    }
    if (barNeutral) {
      barNeutral.style.width = `${neutralPct}%`;
      if (barNeutralText) barNeutralText.textContent = neutralPct >= 8 ? `${neutralPct}%` : '';
    }
    if (barDisagree) {
      barDisagree.style.width = `${conPct}%`;
      if (barDisagreeText) barDisagreeText.textContent = conPct >= 8 ? `${conPct}%` : '';
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
  function showBigTeacherBanner(text, sender = '민부영 선생님') {
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

  // --- [글로벌 토론 타이머 동기화 제어 함수] ---
  function startClientTimer(endsAt, totalDuration = 180) {
    timerEndsAt = endsAt;
    isTimerRunning = true;

    if (discussionTimerWidget) {
      discussionTimerWidget.classList.remove('hidden');
    }
    if (btnStartDiscussionTimer) {
      btnStartDiscussionTimer.classList.add('running');
      if (timerBtnTitle) timerBtnTitle.textContent = '토론 진행 중 (취소)';
      if (timerBtnDesc) timerBtnDesc.textContent = '클릭하면 3분 타이머 즉시 취소';
    }

    if (clientTimerInterval) clearInterval(clientTimerInterval);

    updateTimerDisplay();

    clientTimerInterval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      updateTimerDisplay(remaining);

      if (remaining <= 0) {
        clearInterval(clientTimerInterval);
        clientTimerInterval = null;
      }
    }, 500);
  }

  function updateTimerDisplay(remainingSec = null) {
    if (remainingSec === null) {
      remainingSec = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
    }
    const min = String(Math.floor(remainingSec / 60)).padStart(2, '0');
    const sec = String(remainingSec % 60).padStart(2, '0');
    if (timerCountdown) timerCountdown.textContent = `${min}:${sec}`;

    // 남은 시간이 10초 미만이 되면 텍스트가 빨간색으로 변하고 깜빡임 (Urgent Pulse)
    if (remainingSec <= 10 && remainingSec > 0) {
      if (discussionTimerWidget) discussionTimerWidget.classList.add('urgent');
      if (audioPop) playAudio(audioPop, 0.4);
    } else {
      if (discussionTimerWidget) discussionTimerWidget.classList.remove('urgent');
    }
  }

  function stopClientTimer() {
    isTimerRunning = false;
    if (clientTimerInterval) {
      clearInterval(clientTimerInterval);
      clientTimerInterval = null;
    }
    if (discussionTimerWidget) {
      discussionTimerWidget.classList.add('hidden');
      discussionTimerWidget.classList.remove('urgent');
    }
    if (btnStartDiscussionTimer) {
      btnStartDiscussionTimer.classList.remove('running');
      if (timerBtnTitle) timerBtnTitle.textContent = '토론 시작 (3분)';
      if (timerBtnDesc) timerBtnDesc.textContent = '3분 후 전원 광장 자동 소환';
    }
  }

  // --- [시각적 연출: 아바타 순간이동 빛무리(Particle) & 파란색/황금색 원형 파동(Ripple) 이펙트] ---
  function triggerTeleportArrivalEffect(targetX, targetY) {
    // 1. 파란색 & 황금색 다중 원형 파동 (Ripple) 생성 (바깥으로 퍼져나가는 3중 링 효과, 1.5초 지속)
    teleportRipples.push(
      { x: targetX, y: targetY, radius: 10, maxRadius: 110, color: '#38bdf8', lineWidth: 4, life: 1.1, maxLife: 1.1, delay: 0 },
      { x: targetX, y: targetY, radius: 8, maxRadius: 130, color: '#fbbf24', lineWidth: 3.5, life: 1.35, maxLife: 1.35, delay: 0.15 },
      { x: targetX, y: targetY, radius: 5, maxRadius: 90, color: '#60a5fa', lineWidth: 2, life: 1.5, maxLife: 1.5, delay: 0.3 }
    );

    // 2. 사방으로 뿜어져 나오는 신비로운 빛무리 파티클 (Particles)
    const colors = ['#fbbf24', '#fef08a', '#38bdf8', '#93c5fd', '#ffffff'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      teleportParticles.push({
        x: targetX,
        y: targetY - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20, // 살짝 위로 솟구침
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.random() * 3.5,
        life: 0.8 + Math.random() * 0.7,
        maxLife: 1.5,
        isSparkle: Math.random() > 0.4
      });
    }

    // 3. 소환 빛기둥 (Vertical Light Pillar)
    teleportParticles.push({
      isPillar: true,
      x: targetX,
      y: targetY,
      width: 40,
      height: 180,
      life: 0.8,
      maxLife: 0.8
    });
  }

  function drawTeleportEffects() {
    if (teleportRipples.length === 0 && teleportParticles.length === 0) return;

    // 1. 소환 빛기둥 렌더링 (하늘에서 광장으로 내려앉는 신비로운 기둥)
    teleportParticles.filter(p => p.isPillar).forEach(pillar => {
      ctx.save();
      const alpha = Math.max(0, pillar.life / pillar.maxLife);
      const grad = ctx.createLinearGradient(pillar.x, pillar.y - pillar.height, pillar.x, pillar.y);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, `rgba(251, 191, 36, ${0.45 * alpha})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${0.85 * alpha})`);
      ctx.fillStyle = grad;
      ctx.fillRect(pillar.x - pillar.width / 2, pillar.y - pillar.height, pillar.width, pillar.height);
      ctx.restore();
    });

    // 2. 바닥 원형 파동 (Ripple) 렌더링
    teleportRipples.forEach(rp => {
      if (rp.delay > 0) return;
      ctx.save();
      const alpha = Math.max(0, rp.alpha || 0);
      ctx.globalAlpha = alpha;

      // 내부 은은한 반투명 글로우
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.fillStyle = rp.color === '#fbbf24' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(56, 189, 248, 0.18)';
      ctx.fill();

      // 외부 팽창 링 테두리
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = Math.max(1, rp.lineWidth * (rp.life / rp.maxLife));
      ctx.stroke();
      ctx.restore();
    });

    // 3. 빛무리 스파클 입자 (Particles) 렌더링
    teleportParticles.filter(p => !p.isPillar).forEach(pt => {
      ctx.save();
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;

      if (pt.isSparkle) {
        // 반짝이는 다이아몬드 별
        const s = pt.size * (0.8 + Math.sin(Date.now() / 90) * 0.4);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - s);
        ctx.lineTo(pt.x + s * 0.7, pt.y);
        ctx.lineTo(pt.x, pt.y + s);
        ctx.lineTo(pt.x - s * 0.7, pt.y);
        ctx.closePath();
        ctx.fill();
      } else {
        // 원형 빛방울
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // --- [14-1. 실시간 떠오르는 말풍선 (Speech Bubbles) 시스템] ---
  function addSpeechBubble(playerId, text) {
    if (!text || !text.trim()) return;
    speechBubbles.set(playerId, {
      playerId,
      text: text.trim(),
      createdAt: performance.now(),
      duration: 3800, // 3.8초 동안 유지
      offsetY: 0,
      alpha: 1.0
    });
  }

  function drawSpeechBubbles() {
    if (speechBubbles.size === 0) return;

    for (const [id, bubble] of speechBubbles.entries()) {
      const p = (id === myId) ? myPlayer : otherPlayers.get(id);
      if (!p) continue;

      const x = Math.round(p.x);
      const y = Math.round(p.y);
      const bob = p.isMoving ? Math.sin(p.walkCycle) * 3 : 0;
      const isTeacher = !!(p.isAdmin || p.characterIndex === 99);
      const baseBadgeY = isTeacher ? (y - 90 + bob * 2) : (y - 48 + bob);
      const bY = baseBadgeY - 32 + bubble.offsetY;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, bubble.alpha));

      ctx.font = 'bold 12px sans-serif';
      const rawText = bubble.text;

      // 텍스트 줄바꿈 또는 말줄임 처리 (최대 14자 2줄)
      let lines = [];
      if (rawText.length <= 14) {
        lines = [rawText];
      } else if (rawText.length <= 28) {
        lines = [rawText.slice(0, 14), rawText.slice(14)];
      } else {
        lines = [rawText.slice(0, 14), rawText.slice(14, 27) + '...'];
      }

      let maxLineW = 0;
      lines.forEach(line => {
        const w = ctx.measureText(line).width;
        if (w > maxLineW) maxLineW = w;
      });

      const padX = 14;
      const padY = 8;
      const lineH = 16;
      const bubbleW = Math.max(50, Math.min(240, maxLineW + padX * 2));
      const bubbleH = lines.length * lineH + padY * 2;
      const bX = Math.round(x - bubbleW / 2);

      // 말풍선 카드 (은은한 그림자 + 흰색 라운드 사각형)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = '#ffffff';
      drawRoundRect(ctx, bX, bY - bubbleH, bubbleW, bubbleH, 12);
      ctx.fill();

      // 그림자 해제 후 테두리 스트로크
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isTeacher ? '#f59e0b' : '#3b82f6';
      ctx.lineWidth = isTeacher ? 2 : 1.5;
      ctx.stroke();

      // 말풍선 하단 꼬리표 삼각형 (아바타 머리 방향)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x - 5, bY);
      ctx.lineTo(x + 5, bY);
      ctx.lineTo(x, bY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isTeacher ? '#f59e0b' : '#3b82f6';
      ctx.stroke();

      // 텍스트 출력
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      lines.forEach((line, idx) => {
        const textY = bY - bubbleH + padY + idx * lineH + lineH / 2;
        ctx.fillText(line, x, textY);
      });

      ctx.restore();
    }
  }

  // --- [14-2. 퀵 리액션 이모티콘 파티클 (Sin곡선 흔들림) 시스템] ---
  function spawnReactionParticle(x, y, emoji) {
    for (let i = 0; i < 2; i++) {
      reactionParticles.push({
        baseX: x + (Math.random() - 0.5) * 16,
        y: y - 35 + (Math.random() - 0.5) * 10,
        emoji: emoji,
        life: 2.0,
        maxLife: 2.0,
        vy: -60 - Math.random() * 35, // 퐁퐁 위로 솟구침
        swayFreq: 3.5 + Math.random() * 2, // 좌우 흔들림 주파수
        swayAmp: 12 + Math.random() * 8, // 좌우 흔들림 진폭
        swaySeed: Math.random() * Math.PI * 2,
        scale: 0.6,
        alpha: 1.0,
        delay: i * 0.12
      });
    }
  }

  function drawReactionParticles() {
    if (reactionParticles.length === 0) return;
    reactionParticles.forEach(rp => {
      if (rp.delay > 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, rp.alpha);
      ctx.translate(rp.x, rp.y);
      ctx.scale(rp.scale, rp.scale);
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 8;
      ctx.fillText(rp.emoji, 0, 0);
      ctx.restore();
    });
  }

  // --- [14-3. 아바타 좌표 기반 찬반 진영 판별 및 DB 부하 방지 상태 감지] ---
  let myCurrentStance = 'neutral'; // 'pro' | 'con' | 'neutral'

  function checkStanceZone(x, y) {
    const plaza = mapConfig.plaza;
    const dist = Math.hypot(x - plaza.centerX, y - plaza.centerY);

    // 아고라 광장 반경(300px) 내부인 경우에만 X좌표 기준 좌/우/중립 판별
    if (dist <= plaza.radius + 30) {
      if (x < plaza.centerX - 60) {
        return 'pro';     // 왼쪽: 찬성 구역 (PRO)
      } else if (x > plaza.centerX + 60) {
        return 'con';     // 오른쪽: 반대 구역 (CON)
      } else {
        return 'neutral'; // 중앙: 중립 구역 (NEUTRAL)
      }
    }
    return 'neutral'; // 광장 밖은 기본 중립
  }

  function handleStanceTransition(x, y) {
    if (!myPlayer || myPlayer.isAdmin) return;

    const newStance = checkStanceZone(x, y);

    // [핵심 - DB 부하 방지]: '이전 진영'과 '현재 진영'이 경계를 넘어 달라졌을 때만 1회 DB 업데이트!
    if (newStance !== myCurrentStance) {
      myCurrentStance = newStance;
      myPlayer.currentStance = newStance;

      // 1. 서버/DB로 진영 상태 1회 전송
      if (socket) {
        socket.emit('updateStance', { stance: newStance });
      }

      // 2. 태블릿 학생 화면에 즉각적인 피드백
      const stanceInfo = {
        pro: { text: '찬성 구역(✅)으로 이동했습니다.', icon: '✅' },
        con: { text: '반대 구역(❌)으로 이동했습니다.', icon: '❌' },
        neutral: { text: '중립/숙고 구역(⏳)으로 이동했습니다.', icon: '⏳' }
      };
      const info = stanceInfo[newStance] || stanceInfo.neutral;
      showToast(info.text, info.icon);
      if (audioPop) playAudio(audioPop, 0.4);
    }
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
  let lastSentX = null;
  let lastSentY = null;
  let lastSentFacing = null;
  let wasMoving = false;

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

      // [실시간 찬반 진영 이동 감지 및 조건부 DB 업데이트]
      handleStanceTransition(myPlayer.x, myPlayer.y);

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

    // 서버로 이동 동기화 (최적화: 18Hz ~ 55ms, 실제로 이동 중이거나 방금 멈춘 순간에만 전송하여 서버 부하 85% 이상 절감)
    syncTimer += dt;
    if (syncTimer >= 0.055) {
      syncTimer = 0;
      if (socket && myPlayer) {
        const curX = Math.round(myPlayer.x);
        const curY = Math.round(myPlayer.y);
        const curFacing = myPlayer.facing;
        const isMovingNow = !!myPlayer.isMoving;

        const posChanged = curX !== lastSentX || curY !== lastSentY || curFacing !== lastSentFacing;

        // 위치가 변경되었거나, 이동 중이거나, 방금 이동을 멈춘 마지막 정지 프레임인 경우에만 1회 전송
        if (posChanged || isMovingNow || wasMoving) {
          lastSentX = curX;
          lastSentY = curY;
          lastSentFacing = curFacing;
          wasMoving = isMovingNow;

          socket.emit('playerMove', {
            x: curX,
            y: curY,
            facing: curFacing
          });
        }
      }
    }

    // 다른 플레이어 보간 (부드러운 러프 이동)
    otherPlayers.forEach(p => {
      if (p.targetX !== undefined && p.targetY !== undefined) {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.x += dx * 0.25;
        p.y += dy * 0.25;
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

    // 텔레포트 파동(Ripple) 애니메이션 업데이트
    for (let i = teleportRipples.length - 1; i >= 0; i--) {
      const rp = teleportRipples[i];
      if (rp.delay > 0) {
        rp.delay -= dt;
        continue;
      }
      rp.life -= dt;
      if (rp.life <= 0) {
        teleportRipples.splice(i, 1);
        continue;
      }
      const progress = 1 - (rp.life / rp.maxLife);
      rp.radius = 10 + (rp.maxRadius - 10) * Math.sin(progress * Math.PI / 2);
      rp.alpha = (rp.life / rp.maxLife);
    }

    // 텔레포트 빛무리 파티클 애니메이션 업데이트
    for (let i = teleportParticles.length - 1; i >= 0; i--) {
      const pt = teleportParticles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        teleportParticles.splice(i, 1);
        continue;
      }
      if (!pt.isPillar) {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vx *= 0.94; // 물리 감속
        pt.vy *= 0.94;
      }
    }

    // 실시간 말풍선 수명 및 부드러운 상승 애니메이션 업데이트
    const nowPerf = performance.now();
    for (const [id, bubble] of speechBubbles.entries()) {
      const elapsed = nowPerf - bubble.createdAt;
      if (elapsed >= bubble.duration) {
        speechBubbles.delete(id);
        continue;
      }
      const progress = elapsed / bubble.duration;
      // 3~4초 동안 서서히 위로 떠오름 (0 -> -32px)
      bubble.offsetY = -32 * Math.sin(progress * Math.PI / 2);
      // 마지막 1초 동안 부드럽게 Fade-out
      if (progress > 0.72) {
        bubble.alpha = 1 - (progress - 0.72) / 0.28;
      } else {
        bubble.alpha = 1.0;
      }
    }

    // 퀵 리액션 이모티콘 파티클 애니메이션 업데이트 (Sin 곡선 좌우 스웨이)
    for (let i = reactionParticles.length - 1; i >= 0; i--) {
      const rp = reactionParticles[i];
      if (rp.delay > 0) {
        rp.delay -= dt;
        continue;
      }
      rp.life -= dt;
      if (rp.life <= 0) {
        reactionParticles.splice(i, 1);
        continue;
      }
      const progress = 1 - (rp.life / rp.maxLife);
      rp.y += rp.vy * dt;
      rp.vy *= 0.95; // 서서히 감속
      // x축 좌우 Sin 곡선 부드러운 흔들림 (Sway)
      rp.x = rp.baseX + Math.sin(progress * rp.swayFreq * Math.PI + rp.swaySeed) * rp.swayAmp;

      // 퐁! 팝업 스케일 연출
      if (progress < 0.2) {
        rp.scale = 0.6 + (progress / 0.2) * 0.6; // 0.6 -> 1.2
      } else if (progress < 0.35) {
        rp.scale = 1.2 - ((progress - 0.2) / 0.15) * 0.2; // 1.2 -> 1.0
      } else {
        rp.scale = 1.0;
      }

      // 마지막 0.7초간 페이드아웃
      if (rp.life < 0.7) {
        rp.alpha = rp.life / 0.7;
      } else {
        rp.alpha = 1.0;
      }
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

    // 7. 파티클 및 텔레포트 빛무리/파동 이펙트 & 퀵 리액션 & 말풍선
    drawTeleportEffects();
    drawReactionParticles();
    drawSpeechBubbles();
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

    // 1. 기본 원형 아고라 석조 바닥
    ctx.fillStyle = '#e8dec8';
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. [실시간 찬/반/중립 3색 진영 바닥 렌더링 (Visuals)]
    ctx.save();
    // 아고라 원형 바운더리 내부로 클리핑
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius, 0, Math.PI * 2);
    ctx.clip();

    const leftBoundaryX = plaza.centerX - 60;   // 1140
    const rightBoundaryX = plaza.centerX + 60;  // 1260
    const topY = plaza.centerY - plaza.radius;
    const zoneHeight = plaza.radius * 2;

    // [왼쪽 옅은 초록색]: 찬성 구역 (Pro Zone ✅)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.fillRect(plaza.centerX - plaza.radius, topY, plaza.radius - 60, zoneHeight);

    // [오른쪽 옅은 빨간색]: 반대 구역 (Con Zone ❌)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.fillRect(rightBoundaryX, topY, plaza.radius - 60, zoneHeight);

    // [중앙 옅은 회색]: 중립/숙고 구역 (Neutral Zone ⏳)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.fillRect(leftBoundaryX, topY, 120, zoneHeight);

    // 점선 구분 경계선 (Dashed Boundary Lines)
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2.5;

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
    ctx.beginPath();
    ctx.moveTo(leftBoundaryX, topY);
    ctx.lineTo(leftBoundaryX, topY + zoneHeight);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.beginPath();
    ctx.moveTo(rightBoundaryX, topY);
    ctx.lineTo(rightBoundaryX, topY + zoneHeight);
    ctx.stroke();

    ctx.setLineDash([]); // 점선 해제

    // 바닥 반투명 워터마크 텍스트
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1) 찬성 텍스트
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.fillText('찬성 ✅', plaza.centerX - 165, plaza.centerY - 30);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = 'rgba(5, 150, 105, 0.35)';
    ctx.fillText('PRO ZONE', plaza.centerX - 165, plaza.centerY + 12);

    // 2) 반대 텍스트
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.fillText('반대 ❌', plaza.centerX + 165, plaza.centerY - 30);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = 'rgba(220, 38, 38, 0.35)';
    ctx.fillText('CON ZONE', plaza.centerX + 165, plaza.centerY + 12);

    // 3) 중앙 상/하단 중립 텍스트
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = 'rgba(100, 116, 139, 0.55)';
    ctx.fillText('중립 / 숙고 ⏳', plaza.centerX, plaza.centerY - 160);
    ctx.fillText('중립 / 숙고 ⏳', plaza.centerX, plaza.centerY + 160);

    ctx.restore(); // 클리핑 복원

    // 3. 광장 석조 테두리 링
    ctx.strokeStyle = '#b8a98b';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#8c7b61';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(plaza.centerX, plaza.centerY, plaza.radius - 80, 0, Math.PI * 2);
    ctx.stroke();

    // 4. 분수대
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

    // 5. 광장 명판
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    drawRoundRect(ctx, plaza.centerX - 130, plaza.centerY - plaza.radius - 32, 260, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️ 시민 총회장 (찬·반 진영 광장)', plaza.centerX, plaza.centerY - plaza.radius - 14);
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

    // 3. [팩트체크 NPC 🤖]
    const npc = mapConfig.quizNpc;
    if (npc) {
      // 바닥 그림자
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(npc.x, npc.y + 24, 28, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 근접 시 빛나는 인터랙션 펄스 링 (130px 이내)
      if (myPlayer) {
        const dist = Math.hypot(myPlayer.x - npc.x, myPlayer.y - npc.y);
        if (dist <= 130) {
          ctx.save();
          const pulse = (Math.sin(Date.now() / 180) + 1) / 2;
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 + pulse * 0.45})`;
          ctx.lineWidth = 3 + pulse * 2;
          ctx.beginPath();
          ctx.arc(npc.x, npc.y + 8, 44 + pulse * 8, 0, Math.PI * 2);
          ctx.stroke();

          // 반짝이는 작은 파티클 점 2개
          const angle1 = (Date.now() / 400) % (Math.PI * 2);
          const angle2 = angle1 + Math.PI;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(npc.x + Math.cos(angle1) * (44 + pulse * 8), npc.y + 8 + Math.sin(angle1) * (44 + pulse * 8), 3, 0, Math.PI * 2);
          ctx.arc(npc.x + Math.cos(angle2) * (44 + pulse * 8), npc.y + 8 + Math.sin(angle2) * (44 + pulse * 8), 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 로봇 NPC 본체 (세련된 사이언 메탈릭 라운드 렉트)
      ctx.save();
      ctx.fillStyle = '#0284c7';
      drawRoundRect(ctx, npc.x - npc.w / 2, npc.y - npc.h / 2, npc.w, npc.h, 14);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 로봇 얼굴 모니터 (어두운 디스플레이 화면)
      ctx.fillStyle = '#0f172a';
      drawRoundRect(ctx, npc.x - npc.w / 2 + 7, npc.y - npc.h / 2 + 7, npc.w - 14, 26, 8);
      ctx.fill();
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 로봇 표정 (^ _ ^) - 깜빡임 애니메이션
      const blink = Math.sin(Date.now() / 350);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (blink > 0.94) {
        ctx.fillText('- _ -', npc.x, npc.y - npc.h / 2 + 20);
      } else {
        ctx.fillText('^ _ ^', npc.x, npc.y - npc.h / 2 + 20);
      }

      // 가슴 중앙 앰블럼 (번개/체크마크)
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('⚡', npc.x, npc.y + 14);

      // 머리 안테나 기둥 & 반짝이는 전구 구체
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(npc.x, npc.y - npc.h / 2);
      ctx.lineTo(npc.x, npc.y - npc.h / 2 - 9);
      ctx.stroke();

      const bulbPulse = (Math.sin(Date.now() / 220) + 1) / 2;
      ctx.fillStyle = `rgba(250, 204, 21, ${0.7 + bulbPulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(npc.x, npc.y - npc.h / 2 - 12, 5 + bulbPulse * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 상단 이름표 뱃지
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      drawRoundRect(ctx, npc.x - 56, npc.y - npc.h / 2 - 38, 112, 22, 11);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('팩트체크 NPC 🤖', npc.x, npc.y - npc.h / 2 - 27);
      ctx.restore();
    }
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

  // --- [교사 전용 고정 캐릭터 렌더링]: 학생 대비 2배(2x) 크기 + 네이비 정장 수트 + 넥타이 + 출석 태블릿 + 황금 아우라 ---
  function drawTeacherCharacter(p, isMe) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const bob = p.isMoving ? Math.sin(p.walkCycle) * 3 : 0;

    // 아바타 본체 2배 확대 (Scale 2.0x) 적용
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(2, 2);

    // 1. 발 밑 교사용 황금 단상 아우라 링 (Golden Podium Aura)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 2, 22, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.fill();

    // 2. 바닥 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. 교사 고정 수트 본체 (클래식 네이비 수트 & 레드 타이)
    ctx.fillStyle = '#1e3a8a'; // 네이비 자켓
    drawRoundRect(ctx, -12, -20 + bob, 24, 18, 6);
    ctx.fill();

    // 화이트 셔츠 깃
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-5, -20 + bob);
    ctx.lineTo(5, -20 + bob);
    ctx.lineTo(0, -13 + bob);
    ctx.closePath();
    ctx.fill();

    // 와인 레드 넥타이
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-2, -18 + bob);
    ctx.lineTo(2, -18 + bob);
    ctx.lineTo(3, -9 + bob);
    ctx.lineTo(0, -6 + bob);
    ctx.lineTo(-3, -9 + bob);
    ctx.closePath();
    ctx.fill();

    // 황금 단추
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -9 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 손에 든 교사용 출석 태블릿/클립보드 (📋)
    ctx.fillStyle = '#0f172a';
    drawRoundRect(ctx, 9, -16 + bob, 8, 12, 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(10, -14 + bob, 6, 8);

    // 얼굴 피부톤
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -26 + bob, 10, 0, Math.PI * 2);
    ctx.fill();

    // 단정한 선생님 헤어스타일
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, -29 + bob, 10, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // 지적인 검은 뿔테 안경 👓
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -28 + bob, 4, 3);
    ctx.strokeRect(2, -28 + bob, 4, 3);
    ctx.beginPath();
    ctx.moveTo(-2, -27 + bob);
    ctx.lineTo(2, -27 + bob);
    ctx.stroke();

    ctx.restore(); // 아바타 2x 스케일 복원

    // 4. 머리 위 교사 전용 명찰 (로열 퍼플 & 골드 테두리)
    // 2배 확대된 아바타 머리 최상단(y - 78 + bob*2) 위쪽에 명찰 배치
    const tagText = '👑 [교사] 민부영 선생님 🧑‍🏫';
    ctx.font = 'bold 13px sans-serif';
    const textWidth = ctx.measureText(tagText).width;
    const badgeW = textWidth + 20;
    const badgeH = 24;
    const badgeY = y - 90 + bob * 2;

    ctx.fillStyle = 'rgba(88, 28, 135, 0.95)'; // 로열 퍼플
    drawRoundRect(ctx, x - badgeW / 2, badgeY, badgeW, badgeH, 12);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24'; // 골드 테두리
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, x, badgeY + badgeH / 2);

    // 5. 교사 말풍선 및 상태 이모지
    const emoji = p.statusEmoji;
    if (emoji) {
      const emojiY = badgeY - 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(x, emojiY + 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, x, emojiY + 3);

      if (emoji === '💬' && p.speechText) {
        ctx.font = '13px sans-serif';
        const msgW = ctx.measureText(p.speechText).width;
        const bubbleW = Math.min(260, msgW + 20);
        const bubbleH = 28;
        const bX = x - bubbleW / 2;
        const bY = emojiY - 36;

        ctx.fillStyle = '#ffffff';
        drawRoundRect(ctx, bX, bY, bubbleW, bubbleH, 14);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.fillText(p.speechText.slice(0, 20) + (p.speechText.length > 20 ? '...' : ''), x, bY + bubbleH / 2);
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
