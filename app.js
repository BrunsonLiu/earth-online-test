(function () {
  'use strict';

  var currentQ = 0;
  var scores = {};
  var activeQuestions = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function pickQuestions() {
    var shuffled = shuffle(QUESTION_POOL);
    return shuffled.slice(0, QUIZ_LENGTH);
  }

  function initScores() {
    scores = {};
    Object.keys(FACTIONS).forEach(function (k) {
      scores[k] = 0;
    });
  }

  function initParticles() {
    var c = document.getElementById('particles');
    c.innerHTML = '';
    for (var i = 0; i < 30; i++) {
      var p = document.createElement('div');
      p.className = 'bg-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 4 + 's';
      p.style.animationDuration = (3 + Math.random() * 3) + 's';
      c.appendChild(p);
    }
  }

  function switchScreen(from, to) {
    document.getElementById(from).classList.remove('active');
    setTimeout(function () {
      document.getElementById(to).classList.add('active');
    }, 100);
  }

  function startIntro() {
    initScores();
    activeQuestions = pickQuestions();
    currentQ = 0;

    var title = document.getElementById('introTitle');
    var bar = document.getElementById('introBar');
    var hint = document.getElementById('introHint');
    var status = document.getElementById('introStatus');

    title.classList.remove('show');
    bar.classList.remove('done');
    bar.style.width = '0%';
    hint.classList.remove('show');
    status.textContent = '灵魂接入中...';

    setTimeout(function () {
      title.classList.add('show');
    }, 300);

    setTimeout(function () {
      bar.style.width = '';
      bar.classList.add('done');
    }, 600);

    var statusTexts = ['灵魂接入中...', '校准维度坐标...', '读取意识流...', '同步完成'];
    var si = 0;
    var statusTimer = setInterval(function () {
      si++;
      if (si < statusTexts.length) {
        status.textContent = statusTexts[si];
      }
      if (si >= statusTexts.length - 1) {
        clearInterval(statusTimer);
      }
    }, 800);

    setTimeout(function () {
      hint.classList.add('show');
    }, 3000);

    hint.onclick = function () {
      switchScreen('intro', 'quiz');
      setTimeout(function () {
        showQuestion(0);
      }, 400);
    };
  }

  function showQuestion(idx) {
    currentQ = idx;
    var q = activeQuestions[idx];
    var qEl = document.getElementById('questionText');
    var oWrap = document.getElementById('optionsWrap');
    var fill = document.getElementById('progressFill');
    var num = document.getElementById('progressNum');

    qEl.classList.remove('show');
    oWrap.innerHTML = '';

    fill.style.width = (idx / activeQuestions.length * 100) + '%';
    num.textContent = String(idx + 1).padStart(2, '0') + '/' + String(activeQuestions.length).padStart(2, '0');

    setTimeout(function () {
      qEl.textContent = q.question;
      qEl.classList.add('show');

      q.options.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt.text;
        btn.addEventListener('click', function () {
          selectOption(btn, opt.type);
        });
        oWrap.appendChild(btn);
        setTimeout(function () {
          btn.classList.add('show');
        }, 150 + i * 100);
      });
    }, 200);
  }

  function selectOption(btn, type) {
    var allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach(function (b) {
      b.style.pointerEvents = 'none';
    });
    btn.classList.add('selected');

    scores[type] = (scores[type] || 0) + 1;

    setTimeout(function () {
      if (currentQ < activeQuestions.length - 1) {
        showQuestion(currentQ + 1);
      } else {
        showResult();
      }
    }, 400);
  }

  function getTopFaction() {
    var maxType = Object.keys(FACTIONS)[0];
    var maxScore = 0;
    Object.entries(scores).forEach(function (entry) {
      if (entry[1] > maxScore) {
        maxScore = entry[1];
        maxType = entry[0];
      }
    });
    return maxType;
  }

  function renderAttributes(f) {
    var wrap = document.getElementById('attrsWrap');
    wrap.innerHTML = '';
    ATTRIBUTE_LABELS.forEach(function (attr) {
      var val = f.attributes[attr.key];
      var row = document.createElement('div');
      row.className = 'attr-row';
      row.innerHTML =
        '<span class="attr-emoji">' + attr.emoji + '</span>' +
        '<span class="attr-label">' + attr.label + '</span>' +
        '<div class="attr-bar-wrap"><div class="attr-bar-fill" data-width="' + val + '"></div></div>' +
        '<span class="attr-val">' + val + '</span>';
      wrap.appendChild(row);
    });
  }

  function renderDistribution() {
    var wrap = document.getElementById('distWrap');
    wrap.innerHTML = '';
    var total = 0;
    Object.values(scores).forEach(function (s) { total += s; });
    if (total === 0) total = 1;

    var factionOrder = Object.keys(FACTIONS);
    factionOrder.forEach(function (name) {
      var f = FACTIONS[name];
      var s = scores[name] || 0;
      var pct = Math.round((s / total) * 100);
      var row = document.createElement('div');
      row.className = 'dist-row';
      row.innerHTML =
        '<span class="dist-emoji">' + f.emoji + '</span>' +
        '<span class="dist-name">' + name + '</span>' +
        '<div class="dist-bar-wrap"><div class="dist-bar-fill" data-width="' + pct + '" style="background:' + f.color + '"></div></div>' +
        '<span class="dist-pct">' + pct + '%</span>';
      wrap.appendChild(row);
    });
  }

  function animateBars() {
    setTimeout(function () {
      document.querySelectorAll('.attr-bar-fill').forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
    }, 200);
    setTimeout(function () {
      document.querySelectorAll('.dist-bar-fill').forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
    }, 400);
  }

  function showResult() {
    var topType = getTopFaction();
    var f = FACTIONS[topType];

    document.getElementById('progressFill').style.width = '100%';

    setTimeout(function () {
      switchScreen('quiz', 'result');
      document.documentElement.style.setProperty('--accent', f.color);

      document.getElementById('resultEmoji').textContent = f.emoji;
      document.getElementById('resultFaction').textContent = f.name;
      document.getElementById('resultTitle').textContent = f.title;
      document.getElementById('resultLine').style.background = f.color;
      document.getElementById('resultSignature').textContent = '「' + f.signature + '」';

      document.getElementById('talentText').textContent = f.talent;
      document.getElementById('weaknessText').textContent = f.weakness;

      document.getElementById('energySource').textContent = f.energySource;
      document.getElementById('energyDrain').textContent = f.energyDrain;

      document.getElementById('signalText').textContent = f.signal;
      document.getElementById('footprintText').textContent = '📍 ' + f.footprint;

      document.getElementById('narrativeText').textContent = f.narrative;

      renderAttributes(f);
      renderDistribution();

      document.getElementById('resultScroll').scrollTop = 0;

      setTimeout(function () { document.getElementById('resultCard').classList.add('show'); }, 200);

      var sections = document.querySelectorAll('.result-section');
      sections.forEach(function (sec, i) {
        setTimeout(function () {
          sec.classList.add('show');
        }, 500 + i * 200);
      });

      setTimeout(function () {
        document.getElementById('restartBtn').classList.add('show');
      }, 500 + sections.length * 200 + 200);

      animateBars();
    }, 500);
  }

  function resetResultUI() {
    document.getElementById('resultCard').classList.remove('show');
    document.querySelectorAll('.result-section').forEach(function (sec) {
      sec.classList.remove('show');
    });
    document.getElementById('restartBtn').classList.remove('show');
    document.querySelectorAll('.attr-bar-fill').forEach(function (bar) {
      bar.style.width = '0%';
    });
    document.querySelectorAll('.dist-bar-fill').forEach(function (bar) {
      bar.style.width = '0%';
    });
  }

  function restart() {
    document.documentElement.style.setProperty('--accent', DEFAULT_ACCENT);
    resetResultUI();

    setTimeout(function () {
      switchScreen('result', 'intro');
      setTimeout(function () {
        startIntro();
      }, 300);
    }, 300);
  }

  document.getElementById('restartBtn').addEventListener('click', restart);

  initParticles();
  startIntro();
})();
