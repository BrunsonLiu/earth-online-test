(function () {
  'use strict';

  var currentQ = 0;
  var scores = {};
  var activeQuestions = [];
  var latestResult = null;
  var introReady = false;
  var SITE_URL = 'https://brunsonliu.github.io/earth-online-test/';
  var LEVEL_COLORS = {
    '同频共振': '#F0C75E',
    '天生互补': '#81C784',
    '相互点亮': '#5DADE2',
    '需要翻译': '#D4A5C9',
    '平行线': '#7B8FA1'
  };

  var inviteFaction = (function () {
    var m = /[?&]f=([a-z]+)/.exec(window.location.search);
    if (!m) return null;
    var found = null;
    Object.keys(FACTIONS).forEach(function (name) {
      if (FACTIONS[name].id === m[1]) found = name;
    });
    return found;
  })();

  function factionByOrderIndex(a, b) {
    return Object.keys(FACTIONS).indexOf(a) - Object.keys(FACTIONS).indexOf(b);
  }

  function compatOf(a, b) {
    if (a === b) {
      return { level: '同频共振', text: COMPAT_SELF[a], self: true };
    }
    var key = [a, b].sort(factionByOrderIndex).join('|');
    return COMPAT_PAIRS[key];
  }

  function shareUrl(f) {
    return SITE_URL + '?f=' + f.id;
  }

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
    var finaleId = 20;
    var pool = QUESTION_POOL.filter(function (q) { return q.id !== finaleId; });
    var shuffled = shuffle(pool);
    var picked = shuffled.slice(0, QUIZ_LENGTH - 1);
    var finale = QUESTION_POOL.filter(function (q) { return q.id === finaleId; })[0];
    return picked.concat([finale]);
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
    introReady = false;
    document.getElementById('intro').classList.remove('ready');

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
      introReady = true;
      document.getElementById('intro').classList.add('ready');
    }, 3000);
  }

  function enterFromIntro() {
    if (!introReady) return;
    introReady = false;
    document.getElementById('intro').classList.remove('ready');
    switchScreen('intro', 'quiz');
    setTimeout(function () {
      showQuestion(0);
    }, 400);
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

      shuffle(q.options).forEach(function (opt, i) {
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
    var maxScore = 0;
    Object.keys(scores).forEach(function (name) {
      if (scores[name] > maxScore) maxScore = scores[name];
    });
    var tied = Object.keys(FACTIONS).filter(function (name) {
      return scores[name] === maxScore;
    });
    return tied[Math.floor(Math.random() * tied.length)];
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
    var exact = factionOrder.map(function (name) {
      return { name: name, raw: (scores[name] || 0) / total * 100 };
    });
    var flooredSum = 0;
    exact.forEach(function (item) {
      item.floor = Math.floor(item.raw);
      item.frac = item.raw - item.floor;
      flooredSum += item.floor;
    });
    exact
      .slice()
      .sort(function (a, b) { return b.frac - a.frac; })
      .slice(0, 100 - flooredSum)
      .forEach(function (item) { item.floor += 1; });
    var pctMap = {};
    exact.forEach(function (item) { pctMap[item.name] = item.floor; });

    factionOrder.forEach(function (name) {
      var f = FACTIONS[name];
      var pct = pctMap[name];
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

  function levelChip(level) {
    var color = LEVEL_COLORS[level];
    var chip = document.createElement('span');
    chip.className = 'compat-item-level';
    chip.textContent = level;
    chip.style.color = color;
    chip.style.borderColor = hexAlpha(color, 0.5);
    chip.style.background = hexAlpha(color, 0.1);
    return chip;
  }

  function renderCompatibility(f) {
    var inviteEl = document.getElementById('compatInvite');
    inviteEl.classList.remove('show');
    inviteEl.innerHTML = '';
    if (inviteFaction) {
      var inv = FACTIONS[inviteFaction];
      var pair = compatOf(f.name, inviteFaction);
      var from = document.createElement('div');
      from.className = 'compat-invite-from';
      from.textContent = '邀请你入局的玩家：' + inv.emoji + ' ' + inv.title + '（' + inv.name + '门派）';
      var lv = document.createElement('div');
      lv.className = 'compat-invite-level';
      lv.textContent = '你们的契合度 · ' + pair.level;
      lv.style.color = LEVEL_COLORS[pair.level];
      var tx = document.createElement('div');
      tx.className = 'compat-invite-text';
      tx.textContent = pair.text;
      inviteEl.appendChild(from);
      inviteEl.appendChild(lv);
      inviteEl.appendChild(tx);
      inviteEl.classList.add('show');
    }

    var bestName = BEST_PARTNER[f.name];
    var bestF = FACTIONS[bestName];
    var bestPair = compatOf(f.name, bestName);
    var bestEl = document.getElementById('compatBest');
    bestEl.innerHTML = '';
    var bestEmoji = document.createElement('span');
    bestEmoji.className = 'compat-best-emoji';
    bestEmoji.textContent = bestF.emoji;
    var bestText = document.createElement('span');
    bestText.className = 'compat-best-name';
    bestText.innerHTML = '最佳搭档 · ' + bestF.name + '<small>' + bestF.title + '</small>';
    bestEl.appendChild(bestEmoji);
    bestEl.appendChild(bestText);
    bestEl.appendChild(levelChip(bestPair.level));

    var listEl = document.getElementById('compatList');
    listEl.innerHTML = '';
    Object.keys(FACTIONS).forEach(function (name) {
      var other = FACTIONS[name];
      var info = compatOf(f.name, name);
      var item = document.createElement('div');
      item.className = 'compat-item' + (name === f.name ? ' is-self' : '');

      var head = document.createElement('button');
      head.className = 'compat-item-head';
      head.type = 'button';
      var emojiSpan = document.createElement('span');
      emojiSpan.className = 'compat-item-emoji';
      emojiSpan.textContent = other.emoji;
      var nameSpan = document.createElement('span');
      nameSpan.className = 'compat-item-name';
      nameSpan.textContent = name + (name === f.name ? '（同门派）' : '');

      head.appendChild(emojiSpan);
      head.appendChild(nameSpan);
      head.appendChild(levelChip(info.level));

      var detail = document.createElement('div');
      detail.className = 'compat-item-detail';
      detail.textContent = info.text;

      head.addEventListener('click', function () {
        item.classList.toggle('open');
      });

      item.appendChild(head);
      item.appendChild(detail);
      listEl.appendChild(item);
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

  function buildResultText(result) {
    var f = result.faction;
    var lines = [
      '我的地球 Online 玩家档案',
      '',
      '称号：' + f.title,
      '门派：' + f.name + ' ' + f.emoji,
      '稀有度：全服 ' + f.rarity.percent + '% · ' + f.rarity.tier,
      '签名：「' + f.signature + '」',
      '',
      '天赋：' + f.talent,
      '短板：' + f.weakness,
      '',
      '能量来源：' + f.energySource,
      '能量黑洞：' + f.energyDrain,
      '',
      '同频信号：' + f.signal,
      '出没地点：' + f.footprint,
      '',
      '流派独白：',
      f.narrative,
      '',
      '来测你的门派（链接已带上我的门派，测完可直接看契合度）：',
      shareUrl(f)
    ];
    return lines.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();

    try {
      document.execCommand('copy');
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    } finally {
      document.body.removeChild(ta);
    }
  }

  function copyResult() {
    var btn = document.getElementById('copyBtn');
    if (!latestResult) return;

    copyText(buildResultText(latestResult)).then(function () {
      var oldText = btn.textContent;
      btn.textContent = '已复制';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = oldText;
        btn.classList.remove('copied');
      }, 1600);
    }).catch(function () {
      btn.textContent = '复制失败';
      setTimeout(function () {
        btn.textContent = '复制玩家档案';
      }, 1600);
    });
  }

  function hexAlpha(hex, alpha) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substr(0, 2), 16);
    var g = parseInt(h.substr(2, 2), 16);
    var b = parseInt(h.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawSpacedText(ctx, text, cx, y, spacing) {
    var chars = Array.prototype.slice.call(text);
    var widths = chars.map(function (ch) { return ctx.measureText(ch).width; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + spacing * (chars.length - 1);
    var x = cx - total / 2;
    var prevAlign = ctx.textAlign;
    ctx.textAlign = 'left';
    chars.forEach(function (ch, i) {
      ctx.fillText(ch, x, y);
      x += widths[i] + spacing;
    });
    ctx.textAlign = prevAlign;
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    var lines = [];
    var line = '';
    Array.prototype.slice.call(text).forEach(function (ch) {
      if (line && ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function loadShareFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('700 92px "Noto Serif SC"'),
      document.fonts.load('400 40px "Noto Serif SC"'),
      document.fonts.load('400 30px "JetBrains Mono"')
    ]).catch(function () {});
  }

  function drawQRCode(ctx, text, x, y, size) {
    if (typeof qrcode !== 'function') return false;
    var qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount();
    var pad = 4;
    var cell = size / (n + pad * 2);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    roundRectPath(ctx, x - 16, y - 16, size + 32, size + 32, 14);
    ctx.fill();
    ctx.fillStyle = '#0a0e17';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(
            Math.floor(x + (c + pad) * cell),
            Math.floor(y + (r + pad) * cell),
            Math.ceil(cell) + 1,
            Math.ceil(cell) + 1
          );
        }
      }
    }
    ctx.restore();
    return true;
  }

  function generateShareImage(f) {
    return loadShareFonts().then(function () {
      var W = 1080;
      var H = 1440;
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      var glow = ctx.createRadialGradient(W / 2, 340, 0, W / 2, 340, 720);
      glow.addColorStop(0, hexAlpha(f.color, 0.16));
      glow.addColorStop(1, hexAlpha(f.color, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth = 2;
      roundRectPath(ctx, 36, 36, W - 72, H - 72, 28);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      ctx.font = '30px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(226,232,240,0.45)';
      drawSpacedText(ctx, 'EARTH ONLINE · PLAYER PROFILE', W / 2, 130, 6);

      ctx.font = '150px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", serif';
      ctx.fillText(f.emoji, W / 2, 320);

      ctx.font = '34px "JetBrains Mono", "Noto Serif SC", monospace';
      ctx.fillStyle = 'rgba(226,232,240,0.5)';
      drawSpacedText(ctx, f.name + '门派', W / 2, 450, 12);

      ctx.font = '700 92px "Noto Serif SC", serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(f.title, W / 2, 580);

      var rarityText = '全服 ' + f.rarity.percent + '% · ' + f.rarity.tier;
      ctx.font = '30px "JetBrains Mono", "Noto Serif SC", monospace';
      var rarityW = ctx.measureText(rarityText).width + 56;
      var rarityX = W / 2 - rarityW / 2;
      var rarityY = 618;
      ctx.fillStyle = hexAlpha(f.color, 0.14);
      roundRectPath(ctx, rarityX, rarityY, rarityW, 54, 27);
      ctx.fill();
      ctx.strokeStyle = hexAlpha(f.color, 0.55);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = f.color;
      ctx.textBaseline = 'middle';
      ctx.fillText(rarityText, W / 2, rarityY + 27);
      ctx.textBaseline = 'alphabetic';

      ctx.font = '40px "Noto Serif SC", serif';
      ctx.fillStyle = 'rgba(226,232,240,0.78)';
      wrapCanvasText(ctx, '「' + f.signature + '」', W - 200).slice(0, 2).forEach(function (line, i) {
        ctx.fillText(line, W / 2, 730 + i * 60);
      });

      var topAttr = ATTRIBUTE_LABELS[0];
      ATTRIBUTE_LABELS.forEach(function (attr) {
        if (f.attributes[attr.key] > f.attributes[topAttr.key]) topAttr = attr;
      });
      ctx.font = '150px "JetBrains Mono", monospace';
      ctx.fillStyle = f.color;
      ctx.fillText(String(f.attributes[topAttr.key]), W / 2, 970);
      ctx.font = '34px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "JetBrains Mono", "Noto Serif SC", monospace';
      ctx.fillStyle = 'rgba(226,232,240,0.6)';
      ctx.fillText(topAttr.emoji + ' ' + topAttr.label, W / 2, 1036);

      var signalCx = 470;
      ctx.font = '28px "JetBrains Mono", "Noto Serif SC", monospace';
      ctx.fillStyle = f.color;
      drawSpacedText(ctx, '同 频 信 号', signalCx, 1098, 4);
      ctx.font = '38px "Noto Serif SC", serif';
      ctx.fillStyle = 'rgba(203,213,225,0.92)';
      wrapCanvasText(ctx, f.signal, 620).slice(0, 2).forEach(function (line, i) {
        ctx.fillText(line, signalCx, 1158 + i * 56);
      });

      var bestImgName = BEST_PARTNER[f.name];
      var bestImgF = FACTIONS[bestImgName];
      var bestImgPair = compatOf(f.name, bestImgName);
      ctx.textAlign = 'left';
      ctx.font = '30px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Noto Serif SC", serif';
      ctx.fillStyle = hexAlpha(LEVEL_COLORS[bestImgPair.level], 0.95);
      ctx.fillText('最佳搭档 ' + bestImgF.emoji + ' ' + bestImgF.name + ' · ' + bestImgPair.level, 88, 1250);

      ctx.font = '46px "Noto Serif SC", serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('扫码入局', 86, 1322);
      ctx.font = '28px "JetBrains Mono", "Noto Serif SC", monospace';
      ctx.fillStyle = 'rgba(148,163,184,0.9)';
      ctx.fillText('回答 12 题 · 测你我的契合度', 88, 1374);
      ctx.font = '24px "JetBrains Mono", monospace';
      ctx.fillStyle = f.color;
      ctx.fillText('brunsonliu.github.io/earth-online-test', 88, 1416);
      ctx.textAlign = 'center';

      drawQRCode(ctx, shareUrl(f), 856, 1212, 176);

      return canvas;
    });
  }

  function saveShareImage() {
    var btn = document.getElementById('saveImgBtn');
    if (!latestResult) return;
    var oldText = btn.textContent;
    var resetBtn = function () {
      btn.disabled = false;
      btn.textContent = oldText;
    };

    btn.disabled = true;
    btn.textContent = '生成中...';

    generateShareImage(latestResult.faction).then(function (canvas) {
      canvas.toBlob(function (blob) {
        if (!blob) {
          btn.textContent = '生成失败';
          setTimeout(resetBtn, 1600);
          return;
        }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'earth-online-' + latestResult.faction.id + '.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        btn.textContent = '图片已保存';
        setTimeout(resetBtn, 1600);
      }, 'image/png');
    }).catch(function () {
      btn.textContent = '生成失败';
      setTimeout(resetBtn, 1600);
    });
  }

  function showResult() {
    var topType = getTopFaction();
    var f = FACTIONS[topType];
    latestResult = {
      faction: f,
      scores: Object.assign({}, scores)
    };

    document.getElementById('progressFill').style.width = '100%';

    setTimeout(function () {
      switchScreen('quiz', 'result');
      document.documentElement.style.setProperty('--accent', f.color);

      document.getElementById('resultEmoji').textContent = f.emoji;
      document.getElementById('resultFaction').textContent = f.title;
      document.getElementById('resultTitle').textContent = f.name + '门派';
      document.getElementById('resultRarity').textContent = '全服 ' + f.rarity.percent + '% · ' + f.rarity.tier + '门派';
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
      renderCompatibility(f);

      document.getElementById('resultScroll').scrollTop = 0;

      setTimeout(function () { document.getElementById('resultCard').classList.add('show'); }, 200);

      var sections = document.querySelectorAll('.result-section');
      sections.forEach(function (sec, i) {
        setTimeout(function () {
          sec.classList.add('show');
        }, 500 + i * 200);
      });

      setTimeout(function () {
        document.getElementById('saveImgBtn').classList.add('show');
        document.getElementById('copyBtn').classList.add('show');
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
    document.getElementById('saveImgBtn').classList.remove('show');
    document.getElementById('saveImgBtn').textContent = '保存结果图';
    document.getElementById('saveImgBtn').disabled = false;
    document.getElementById('copyBtn').classList.remove('show', 'copied');
    document.getElementById('copyBtn').textContent = '复制玩家档案';
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

  document.getElementById('intro').addEventListener('click', enterFromIntro);
  document.getElementById('saveImgBtn').addEventListener('click', saveShareImage);
  document.getElementById('copyBtn').addEventListener('click', copyResult);
  document.getElementById('restartBtn').addEventListener('click', restart);

  initParticles();
  startIntro();
})();
