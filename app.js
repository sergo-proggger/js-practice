// JS-практика: экраны приложения, редактор и запуск проверок.
(function () {
  'use strict';

  const COURSE = window.JSP_COURSE;
  const STORE_KEY = 'jsp-progress-v1';
  const RUN_TIMEOUT = 2500;
  const TRAINER_URL = 'https://sergo-proggger.github.io/trener/';
  const app = document.getElementById('app');

  // Панель символов над редактором: на телефоне их долго искать на клавиатуре
  const SYMBOLS = [
    { label: 'Tab', text: '  ' }, { label: '{' }, { label: '}' }, { label: '(' }, { label: ')' },
    { label: '[' }, { label: ']' }, { label: ';' }, { label: '=' }, { label: '=>' }, { label: '===' },
    { label: '!' }, { label: '<' }, { label: '>' }, { label: '+' }, { label: '-' }, { label: '*' },
    { label: '/' }, { label: '%' }, { label: "'" }, { label: '"' }, { label: '`' }, { label: '$' },
    { label: '.' }, { label: ',' }, { label: ':' }, { label: '?' }, { label: '&&' }, { label: '||' },
    { label: '←', move: -1 }, { label: '→', move: 1 }
  ];

  // ---------- прогресс ----------

  function loadState() {
    const base = { solved: {}, attempts: {}, code: {}, hints: {}, days: {}, quiz: {} };
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        for (const k of Object.keys(base)) {
          if (saved[k] && typeof saved[k] === 'object') base[k] = saved[k];
        }
      }
    } catch (e) { /* хранилище недоступно: работаем без сохранения */ }
    return base;
  }

  const state = loadState();

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* без сохранения */ }
  }

  // ---------- вспомогательное ----------

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);
  const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const paragraphs = s => s.split('\n\n').map(p => '<p>' + inline(p) + '</p>').join('');
  const trunc = s => (s.length > 300 ? s.slice(0, 300) + '…' : s);
  const key = (lid, tid) => lid + '/' + tid;

  function plural(n, one, few, many) {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Сколько дней подряд решались задачи (сегодняшний день засчитывается, если уже что-то решено)
  function streak() {
    const d = new Date();
    if (!state.days[dateKey(d)]) d.setDate(d.getDate() - 1);
    let n = 0;
    while (state.days[dateKey(d)]) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  // Подсветка комментариев в примерах кода
  function highlightLine(line) {
    let quote = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quote) {
        if (ch === '\\') { i++; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
      if (ch === '/' && line[i + 1] === '/') {
        return esc(line.slice(0, i)) + '<span class="c-com">' + esc(line.slice(i)) + '</span>';
      }
    }
    return esc(line);
  }

  const codeBlock = lines => '<pre class="code"><code>' + lines.map(highlightLine).join('\n') + '</code></pre>';

  function renderBlock(b) {
    if (b.h) return '<h2 class="t-h">' + inline(b.h) + '</h2>';
    if (b.p) return '<p>' + inline(b.p) + '</p>';
    if (b.code) return codeBlock(b.code);
    if (b.list) return '<ul class="t-list">' + b.list.map(i => '<li>' + inline(i) + '</li>').join('') + '</ul>';
    if (b.note) return '<div class="note">' + inline(b.note) + '</div>';
    return '';
  }

  const allLessons = () => COURSE.modules.flatMap(m => m.lessons || []).filter(id => COURSE.lessons[id]);

  function lessonProgress(lid) {
    const tasks = COURSE.lessons[lid].tasks;
    return { done: tasks.filter(t => state.solved[key(lid, t.id)]).length, total: tasks.length };
  }

  function nextUnsolved() {
    for (const lid of allLessons()) {
      for (const t of COURSE.lessons[lid].tasks) {
        if (!state.solved[key(lid, t.id)]) return { lid, task: t };
      }
    }
    return null;
  }

  // Пояснения к частым ошибкам: формулировки Chrome и Safari
  const ERROR_HINTS = [
    [/Unexpected end of input|Unexpected EOF/, 'Похоже, не хватает закрывающей скобки } или ) в конце кода.'],
    [/missing \) after argument list/, 'Не закрыта круглая скобка при вызове функции.'],
    [/Invalid or unexpected token|Unterminated string|Unexpected character/, 'В коде недопустимый символ. Чаще всего это незакрытая кавычка.'],
    [/Illegal return statement|Return statements are only valid inside functions/, '`return` стоит вне функции. Он работает только внутри её фигурных скобок.'],
    [/Unexpected identifier|Unexpected keyword/, 'Два слова стоят рядом без оператора между ними: возможно, пропущена запятая, точка, скобка или точка с запятой.'],
    [/Unexpected token|Unexpected string|Unexpected number/, 'Лишний или пропущенный символ рядом с указанным местом: проверь скобки, запятые и кавычки.'],
    [/has already been declared|Cannot declare a .* twice/, 'Переменная с таким именем уже объявлена выше.'],
    [/Assignment to constant variable|Attempted to assign to readonly property/, 'Код пытается изменить переменную, объявленную через `const`. Для меняющихся значений нужен `let`.'],
    [/is not defined|Can't find variable/, 'Используется имя, которое нигде не объявлено. Проверь опечатки и регистр букв.'],
    [/Cannot read properties of (undefined|null)|(undefined|null) is not an object/, 'Код обращается к свойству у `undefined` или `null`. Проверь, что значение существует, например при пустой строке или пустом массиве.'],
    [/is not a function/, 'Вызывается то, что не является функцией. Проверь название метода и что переменная хранит функцию.'],
    [/Maximum call stack size exceeded|call stack/i, 'Функция бесконечно вызывает сама себя.']
  ];
  function errorHint(message) {
    const found = ERROR_HINTS.find(([re]) => re.test(message));
    return found ? found[1] : '';
  }

  const callLabel = (task, t) => t.code || task.fn + '(' + (t.args || []).map(a => window.jspShow(a)).join(', ') + ')';

  function insertText(ta, text) {
    ta.focus();
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // ---------- главная ----------

  function renderHome() {
    const lessons = allLessons();
    let total = 0;
    let solved = 0;
    for (const lid of lessons) {
      const p = lessonProgress(lid);
      total += p.total;
      solved += p.done;
    }
    const days = streak();
    const next = nextUnsolved();

    let html = '<header class="top"><a class="brand" href="#/">JS-практика</a>' +
      '<a class="top-link" href="' + TRAINER_URL + '">Тренажёр по теории</a></header><main>';

    html += '<section class="intro"><h1>JavaScript с нуля до задач Яндекс Контеста</h1>' +
      '<p class="lead">В каждом уроке теория с примерами, вопросы для самопроверки и задачи. Код проверяют тесты, часть из них скрыта, как на контесте. Если застрял, возьми подсказку.</p>' +
      '<p class="stats">Решено ' + solved + ' из ' + total + ' ' + plural(total, 'задачи', 'задач', 'задач') +
      (days ? ' · ' + days + ' ' + plural(days, 'день', 'дня', 'дней') + ' подряд' : '') + '</p>';

    if (next) {
      const started = lessonProgress(next.lid).done > 0;
      const href = started ? '#/t/' + next.lid + '/' + next.task.id : '#/l/' + next.lid;
      const label = solved === 0 ? 'Начать с первого урока' : started ? 'Продолжить: ' + next.task.title : 'Следующий урок: ' + COURSE.lessons[next.lid].title;
      html += '<a class="btn primary" href="' + href + '">' + esc(label) + '</a>';
    } else {
      html += '<p>Все задачи открытых уроков решены. Новые уроки появятся по плану.</p>';
    }
    html += '</section>';

    for (const m of COURSE.modules) {
      if (m.lessons) {
        html += '<section class="module"><div class="module-head"><h2>' + esc(m.title) + '</h2><span class="muted">' + esc(m.period) + '</span></div><ol class="row-list">';
        for (const lid of m.lessons) {
          const lesson = COURSE.lessons[lid];
          if (!lesson) continue;
          const p = lessonProgress(lid);
          const done = p.done === p.total;
          html += '<li class="' + (done ? 'done' : '') + '"><a class="row" href="#/l/' + lid + '">' +
            '<span class="row-num">' + (lessons.indexOf(lid) + 1) + '</span>' +
            '<span class="row-title">' + esc(lesson.title) + '</span>' +
            '<span class="row-meta">' + (done ? 'пройден' : p.done + ' из ' + p.total) + '</span></a></li>';
        }
        html += '</ol></section>';
      } else {
        html += '<section class="module locked"><div class="module-head"><h2>' + esc(m.title) + '</h2><span class="muted">' + esc(m.period) + '</span></div>' +
          '<ul class="topics">' + m.topics.map(t => '<li>' + inline(t) + '</li>').join('') + '</ul>' +
          '<p class="muted small">Уроки появятся к началу этапа.</p></section>';
      }
    }

    html += '<footer class="foot">' +
      '<p>Прогресс хранится в этом браузере на этом устройстве.</p>' +
      '<p>Поставить иконку на телефон: в Safari «Поделиться», затем «На экран „Домой“»; в Chrome меню, затем «Установить приложение».</p>' +
      '</footer></main>';

    app.innerHTML = html;
    document.title = 'JS-практика';
  }

  // ---------- урок ----------

  function explainText(q, chosen) {
    return '<b>' + (chosen === q.answer ? 'Верно.' : 'Не совсем.') + '</b> ' + inline(q.explain);
  }

  function renderQuestion(lid, q, i) {
    const answered = state.quiz[lid + '#' + i];
    const isAnswered = answered !== undefined;
    let html = '<div class="q" data-q="' + i + '"><p class="q-text">' + inline(q.q) + '</p>';
    if (q.code) html += codeBlock(q.code);
    html += '<div class="q-options">';
    q.options.forEach((o, j) => {
      let cls = 'q-opt';
      if (isAnswered && j === q.answer) cls += ' right';
      else if (isAnswered && j === answered) cls += ' wrong';
      html += '<button type="button" class="' + cls + '" data-opt="' + j + '"' + (isAnswered ? ' disabled' : '') + '>' + inline(o) + '</button>';
    });
    html += '</div><p class="q-explain"' + (isAnswered ? '' : ' hidden') + '>' + (isAnswered ? explainText(q, answered) : '') + '</p></div>';
    return html;
  }

  function renderLesson(lid) {
    const lesson = COURSE.lessons[lid];
    if (!lesson) return renderHome();
    const list = allLessons();
    const idx = list.indexOf(lid);

    let html = '<header class="top"><a class="back" href="#/">← Все уроки</a><span class="top-meta">Урок ' + (idx + 1) + ' из ' + list.length + '</span></header>';
    html += '<main><article class="lesson"><h1>' + esc(lesson.title) + '</h1>';
    html += '<div class="theory">' + lesson.theory.map(renderBlock).join('') + '</div>';

    if (lesson.quiz && lesson.quiz.length) {
      html += '<section class="quiz"><h2 class="section-h">Проверь себя</h2>';
      lesson.quiz.forEach((q, i) => { html += renderQuestion(lid, q, i); });
      html += '</section>';
    }

    html += '<section><h2 class="section-h">Задачи</h2><ol class="row-list">';
    lesson.tasks.forEach((t, i) => {
      const solved = !!state.solved[key(lid, t.id)];
      html += '<li class="' + (solved ? 'done' : '') + '"><a class="row" href="#/t/' + lid + '/' + t.id + '">' +
        '<span class="row-num">' + (i + 1) + '</span><span class="row-title">' + esc(t.title) + '</span>' +
        '<span class="row-meta">' + (solved ? 'решена' : '') + '</span></a></li>';
    });
    html += '</ol></section>';

    const prev = idx > 0 ? list[idx - 1] : null;
    const next = idx < list.length - 1 ? list[idx + 1] : null;
    html += '<nav class="pager">' +
      (prev ? '<a href="#/l/' + prev + '">← ' + esc(COURSE.lessons[prev].title) + '</a>' : '<span></span>') +
      (next ? '<a href="#/l/' + next + '">' + esc(COURSE.lessons[next].title) + ' →</a>' : '') +
      '</nav></article></main>';

    app.innerHTML = html;
    document.title = lesson.title + ' · JS-практика';

    app.querySelectorAll('.q').forEach(box => {
      const i = Number(box.dataset.q);
      const q = lesson.quiz[i];
      box.addEventListener('click', e => {
        const btn = e.target.closest('.q-opt');
        if (!btn || btn.disabled) return;
        const chosen = Number(btn.dataset.opt);
        state.quiz[lid + '#' + i] = chosen;
        save();
        box.querySelectorAll('.q-opt').forEach((b, j) => {
          b.disabled = true;
          if (j === q.answer) b.classList.add('right');
          else if (j === chosen) b.classList.add('wrong');
        });
        const ex = box.querySelector('.q-explain');
        ex.innerHTML = explainText(q, chosen);
        ex.hidden = false;
      });
    });
  }

  // ---------- задача ----------

  function testItem(r) {
    const n = r.index + 1;
    const title = r.hidden ? 'Скрытый тест ' + n : '<code>' + esc(r.label) + '</code>';
    if (r.pass) {
      return '<li class="t-ok"><span class="mark" aria-hidden="true">✓</span><span class="t-label">' + title + '<span class="sr"> пройден</span></span></li>';
    }
    let body = '';
    if (r.hidden) body += '<div class="t-line"><span>Вызов</span><code>' + esc(r.label) + '</code></div>';
    body += '<div class="t-line"><span>Ожидалось</span><code>' + esc(trunc(r.expected)) + '</code></div>';
    if (r.error) {
      body += '<div class="t-line"><span>Ошибка</span><code>' + esc(r.error) + '</code></div>';
      const hint = errorHint(r.error);
      if (hint) body += '<p class="t-hint">' + inline(hint) + '</p>';
    } else {
      body += '<div class="t-line"><span>Получено</span><code>' + esc(trunc(r.got)) + '</code></div>';
    }
    if (r.note) body += '<p class="t-note">' + esc(r.note) + '</p>';
    return '<li class="t-fail"><span class="mark" aria-hidden="true">✗</span><span class="t-label">' + title + '<span class="sr"> не пройден</span></span><div class="t-body">' + body + '</div></li>';
  }

  function logsBlock(logs) {
    if (!logs || !logs.length) return '';
    return '<details class="logs" open><summary>Вывод console.log</summary><pre>' + esc(logs.join('\n')) + '</pre></details>';
  }

  function renderTask(lid, tid) {
    const lesson = COURSE.lessons[lid];
    const tIndex = lesson ? lesson.tasks.findIndex(t => t.id === tid) : -1;
    if (tIndex === -1) return renderHome();
    const task = lesson.tasks[tIndex];
    const k = key(lid, tid);
    const visible = task.tests.filter(t => !t.hidden);
    const hiddenCount = task.tests.length - visible.length;
    const list = allLessons();
    const nextTask = lesson.tasks[tIndex + 1] || null;
    const prevTask = lesson.tasks[tIndex - 1] || null;
    const nextLesson = list[list.indexOf(lid) + 1] || null;
    const nextHref = nextTask ? '#/t/' + lid + '/' + nextTask.id : nextLesson ? '#/l/' + nextLesson : '#/';
    const nextLabel = nextTask ? 'Следующая задача' : nextLesson ? 'Следующий урок' : 'К списку уроков';

    let html = '<header class="top"><a class="back" href="#/l/' + lid + '">← ' + esc(lesson.title) + '</a>' +
      '<span class="top-meta">Задача ' + (tIndex + 1) + ' из ' + lesson.tasks.length + '</span></header>';
    html += '<main><article class="task"><h1 id="task-title">' + esc(task.title) + (state.solved[k] ? '<span class="badge">решена</span>' : '') + '</h1>';
    html += '<div class="statement">' + paragraphs(task.text) + '</div>';
    html += '<div class="examples"><h2 class="small-h">Примеры</h2><ul>' +
      visible.map(t => '<li><code>' + esc(callLabel(task, t)) + '</code><span class="ex-res"><span class="muted">→</span><code>' + esc(window.jspShow(t.expected)) + '</code></span></li>').join('') +
      '</ul>' + (hiddenCount ? '<p class="muted small">И ещё ' + hiddenCount + ' ' + plural(hiddenCount, 'скрытый тест', 'скрытых теста', 'скрытых тестов') + ' на крайние случаи.</p>' : '') + '</div>';
    html += '<div class="editor-box"><div class="symbols" role="toolbar" aria-label="Символы для кода">' +
      SYMBOLS.map((s, i) => '<button type="button" tabindex="-1" data-sym="' + i + '">' + esc(s.label) + '</button>').join('') + '</div>' +
      '<textarea id="code" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Код решения"></textarea></div>';
    html += '<div class="actions"><button type="button" class="btn primary" id="run">Проверить</button>' +
      '<button type="button" class="btn" id="hint-btn">Подсказка</button>' +
      '<button type="button" class="btn ghost" id="solution-btn">Решение</button>' +
      '<button type="button" class="btn ghost" id="reset">Сбросить код</button></div>';
    html += '<p class="kbd-hint">Ctrl + Enter или ⌘ + Enter запускает проверку.</p>';
    html += '<div id="hints" class="hints"></div><div id="solution"></div><div id="result" class="result" aria-live="polite"></div>';
    html += '<nav class="pager">' +
      (prevTask ? '<a href="#/t/' + lid + '/' + prevTask.id + '">← ' + esc(prevTask.title) + '</a>' : '<a href="#/l/' + lid + '">← К теории</a>') +
      '<a href="' + nextHref + '">' + nextLabel + ' →</a></nav></article></main>';

    app.innerHTML = html;
    document.title = task.title + ' · JS-практика';

    const editor = document.getElementById('code');
    editor.value = state.code[k] !== undefined ? state.code[k] : task.starter.join('\n');

    let saveTimer = null;
    const saveCode = () => { state.code[k] = editor.value; save(); };
    editor.addEventListener('input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveCode, 400);
    });
    editor.addEventListener('blur', saveCode);

    editor.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCheck();
        return;
      }
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        insertText(editor, '  ');
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing) {
        // перенос строки с тем же отступом, после открывающей скобки отступ больше
        const v = editor.value;
        const pos = editor.selectionStart;
        const lineStart = v.lastIndexOf('\n', pos - 1) + 1;
        const before = v.slice(lineStart, pos);
        const indent = before.match(/^[ \t]*/)[0];
        const last = before.trimEnd().slice(-1);
        const closer = { '{': '}', '[': ']', '(': ')' }[last];
        e.preventDefault();
        if (closer) {
          const after = v.slice(editor.selectionEnd).match(/^[ \t]*(.)/);
          if (after && after[1] === closer) {
            insertText(editor, '\n' + indent + '  \n' + indent);
            const p = editor.selectionStart - indent.length - 1;
            editor.setSelectionRange(p, p);
            return;
          }
          insertText(editor, '\n' + indent + '  ');
          return;
        }
        insertText(editor, '\n' + indent);
      }
    });

    const bar = app.querySelector('.symbols');
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) e.preventDefault(); // не забирать фокус у редактора
    });
    bar.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const s = SYMBOLS[Number(btn.dataset.sym)];
      if (s.move) {
        editor.focus();
        const p = Math.max(0, Math.min(editor.value.length, editor.selectionStart + s.move));
        editor.setSelectionRange(p, p);
        return;
      }
      insertText(editor, s.text || s.label);
    });

    // подсказки
    const hintBtn = document.getElementById('hint-btn');
    function renderHints() {
      const shown = Math.min(state.hints[k] || 0, task.hints.length);
      document.getElementById('hints').innerHTML = shown
        ? '<ol class="hint-list">' + task.hints.slice(0, shown).map(h => '<li>' + inline(h) + '</li>').join('') + '</ol>'
        : '';
      if (shown >= task.hints.length) {
        hintBtn.textContent = 'Подсказок больше нет';
        hintBtn.disabled = true;
      } else {
        hintBtn.textContent = shown ? 'Ещё подсказка' : 'Подсказка';
        hintBtn.disabled = false;
      }
    }
    hintBtn.addEventListener('click', () => {
      state.hints[k] = Math.min((state.hints[k] || 0) + 1, task.hints.length);
      save();
      renderHints();
    });
    renderHints();

    // решение: сначала просим попробовать самому
    const solutionBox = document.getElementById('solution');
    function showSolution() {
      solutionBox.innerHTML = '<div class="res solution-box"><p class="res-title">Вариант решения</p>' + codeBlock(task.solution) +
        '<p>' + inline(task.explain) + '</p><p class="muted">Лучший способ запомнить: сотри код и напиши решение сам, не подглядывая.</p></div>';
    }
    document.getElementById('solution-btn').addEventListener('click', () => {
      if (state.solved[k]) { showSolution(); return; }
      const tried = (state.attempts[k] || 0) > 0;
      solutionBox.innerHTML = '<div class="confirm"><p>' + (tried
        ? 'Перед тем как смотреть, попробуй следующую подсказку. Если всё же откроешь решение, потом напиши его сам по памяти.'
        : 'Сначала попробуй написать решение и проверить его. Если не получается, возьми подсказку: так задача лучше запомнится.') +
        '</p><div class="actions"><button type="button" class="btn small" id="sol-yes">Показать решение</button>' +
        '<button type="button" class="btn small ghost" id="sol-no">Попробую сам</button></div></div>';
      document.getElementById('sol-yes').addEventListener('click', showSolution);
      document.getElementById('sol-no').addEventListener('click', () => { solutionBox.innerHTML = ''; });
    });

    document.getElementById('reset').addEventListener('click', () => {
      editor.focus();
      editor.select();
      insertText(editor, task.starter.join('\n'));
    });

    // проверка
    const runBtn = document.getElementById('run');
    const resultBox = document.getElementById('result');
    runBtn.addEventListener('click', runCheck);

    function runCheck() {
      if (runBtn.disabled) return;
      saveCode();
      state.attempts[k] = (state.attempts[k] || 0) + 1;
      save();
      resultBox.innerHTML = '<p class="muted">Проверяю…</p>';
      runBtn.disabled = true;

      let worker;
      try {
        worker = new Worker('runner.js');
      } catch (e) {
        runBtn.disabled = false;
        resultBox.innerHTML = '<div class="res res-bad"><p class="res-title">Не удалось запустить проверку</p><p>Открой приложение по его адресу в интернете, а не как файл с диска.</p></div>';
        return;
      }
      let finished = false;
      let timer = null;
      const finish = res => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        worker.terminate();
        runBtn.disabled = false;
        showResult(res);
      };
      timer = setTimeout(() => finish({ status: 'timeout', logs: [] }), RUN_TIMEOUT);
      worker.onmessage = e => finish(e.data);
      worker.onerror = e => {
        e.preventDefault();
        finish({ status: 'compile', message: e.message || 'Ошибка при запуске кода', logs: [] });
      };
      worker.postMessage({ code: editor.value, fnName: task.fn, tests: task.tests });
    }

    function showResult(res) {
      const logs = logsBlock(res.logs);
      if (res.status === 'timeout') {
        resultBox.innerHTML = '<div class="res res-bad"><p class="res-title">Код работал дольше двух секунд, и проверка его остановила</p>' +
          '<p>Похоже, цикл никогда не заканчивается. Проверь условие и шаг цикла. Чтобы найти место, выведи значения через <code>console.log</code> и временно ограничь число повторов.</p></div>';
        return;
      }
      if (res.status === 'compile') {
        const hint = errorHint(res.message);
        resultBox.innerHTML = '<div class="res res-bad"><p class="res-title">Код не запустился</p><pre class="err">' + esc(res.message) + '</pre>' +
          '<p>' + (hint ? inline(hint) : 'Частые причины: незакрытая скобка или кавычка, опечатка в имени, лишняя запятая.') + '</p>' + logs + '</div>';
        return;
      }
      if (res.status === 'nofn') {
        resultBox.innerHTML = '<div class="res res-bad"><p class="res-title">Не найдена функция ' + esc(task.fn) + '</p>' +
          '<p>Проверь, что функция называется именно <code>' + esc(task.fn) + '</code> и строка с её объявлением на месте.</p>' + logs + '</div>';
        return;
      }

      const results = res.results;
      const passed = results.filter(r => r.pass).length;
      const all = passed === results.length;
      let html = '<div class="res ' + (all ? 'res-ok' : 'res-bad') + '"><p class="res-title">' +
        (all ? 'Все тесты пройдены' : 'Пройдено ' + passed + ' из ' + results.length) + '</p>' +
        '<ul class="tests">' + results.map(testItem).join('') + '</ul>' + logs;

      if (all) {
        const today = dateKey(new Date());
        state.solved[k] = today;
        state.days[today] = true;
        save();
        const titleEl = document.getElementById('task-title');
        if (titleEl && !titleEl.querySelector('.badge')) titleEl.insertAdjacentHTML('beforeend', '<span class="badge">решена</span>');
        html += '<div class="success"><p>' + inline(task.explain) + '</p>' +
          '<details><summary>Вариант решения для сравнения</summary>' + codeBlock(task.solution) + '</details>' +
          '<a class="btn primary" href="' + nextHref + '">' + nextLabel + '</a></div>';
      }
      html += '</div>';
      resultBox.innerHTML = html;
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ---------- маршруты ----------

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    if (parts[0] === 'l' && parts[1]) renderLesson(parts[1]);
    else if (parts[0] === 't' && parts[1] && parts[2]) renderTask(parts[1], parts[2]);
    else renderHome();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* офлайн-режим просто не включится */ });
    });
  }
})();
