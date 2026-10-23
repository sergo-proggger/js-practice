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
    const base = { solved: {}, attempts: {}, code: {}, hints: {}, days: {}, quiz: {}, exams: {}, plan: {} };
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

  const callLabel = (task, t) => t.label || t.code || task.fn + '(' + (t.args || []).map(a => window.jspShow(a)).join(', ') + ')';

  function insertText(ta, text) {
    ta.focus();
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // ---------- редактор и проверка (общие для задач и экзамена) ----------

  const editorHtml = () => '<div class="editor-box"><div class="symbols" role="toolbar" aria-label="Символы для кода">' +
    SYMBOLS.map((s, i) => '<button type="button" tabindex="-1" data-sym="' + i + '">' + esc(s.label) + '</button>').join('') + '</div>' +
    '<textarea id="code" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Код решения"></textarea></div>';

  // Клавиши и панель символов. onSave — сохранить код, onRun — проверка по Ctrl/⌘ + Enter.
  function setupEditor(editor, onSave, onRun) {
    let saveTimer = null;
    editor.addEventListener('input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(onSave, 400);
    });
    editor.addEventListener('blur', onSave);

    editor.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
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
  }

  // Запуск тестов в отдельном воркере: бесконечный или слишком медленный код обрывается через RUN_TIMEOUT
  function runInWorker(code, fnName, tests) {
    return new Promise(resolve => {
      let worker;
      try {
        worker = new Worker('runner.js');
      } catch (e) {
        resolve({ status: 'noworker', logs: [] });
        return;
      }
      let finished = false;
      let timer = null;
      const finish = res => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        worker.terminate();
        resolve(res);
      };
      timer = setTimeout(() => finish({ status: 'timeout', logs: [] }), RUN_TIMEOUT);
      worker.onmessage = e => finish(e.data);
      worker.onerror = e => {
        e.preventDefault();
        finish({ status: 'compile', message: e.message || 'Ошибка при запуске кода', logs: [] });
      };
      worker.postMessage({ code, fnName, tests });
    });
  }

  function logsBlock(logs) {
    if (!logs || !logs.length) return '';
    return '<details class="logs" open><summary>Вывод console.log</summary><pre>' + esc(logs.join('\n')) + '</pre></details>';
  }

  // Ответ, когда тесты не запустились. Для обычного результата возвращает ''.
  function failedRunHtml(res, fnName) {
    const logs = logsBlock(res.logs);
    if (res.status === 'noworker') {
      return '<div class="res res-bad"><p class="res-title">Не удалось запустить проверку</p><p>Открой приложение по его адресу в интернете, а не как файл с диска.</p></div>';
    }
    if (res.status === 'timeout') {
      return '<div class="res res-bad"><p class="res-title">Код работал дольше двух секунд, и проверка его остановила</p>' +
        '<p>Либо цикл никогда не заканчивается, либо решение слишком медленное для больших данных. Проверь условие и шаг цикла и оцени сложность: перебор всех пар на 100 000 элементов не успеет.</p></div>';
    }
    if (res.status === 'compile') {
      const hint = errorHint(res.message);
      return '<div class="res res-bad"><p class="res-title">Код не запустился</p><pre class="err">' + esc(res.message) + '</pre>' +
        '<p>' + (hint ? inline(hint) : 'Частые причины: незакрытая скобка или кавычка, опечатка в имени, лишняя запятая.') + '</p>' + logs + '</div>';
    }
    if (res.status === 'nofn') {
      return '<div class="res res-bad"><p class="res-title">Не найдена функция ' + esc(fnName) + '</p>' +
        '<p>Проверь, что функция называется именно <code>' + esc(fnName) + '</code> и строка с её объявлением на месте.</p>' + logs + '</div>';
    }
    return '';
  }

  // examMode: у скрытых тестов не показываем входные данные и ответ, как на контесте
  function testItem(r, examMode) {
    const n = r.index + 1;
    const title = r.hidden ? 'Скрытый тест ' + n : '<code>' + esc(r.label) + '</code>';
    if (r.pass) {
      return '<li class="t-ok"><span class="mark" aria-hidden="true">✓</span><span class="t-label">' + title + '<span class="sr"> пройден</span></span></li>';
    }
    if (examMode && r.hidden) {
      const verdict = r.error ? 'ошибка во время выполнения' : 'неверный ответ';
      return '<li class="t-fail"><span class="mark" aria-hidden="true">✗</span><span class="t-label">' + title + ': ' + verdict + '</span></li>';
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

  const examplesHtml = (task, visible, hiddenCount) => '<div class="examples"><h2 class="small-h">Примеры</h2><ul>' +
    visible.map(t => '<li><code>' + esc(callLabel(task, t)) + '</code><span class="ex-res"><span class="muted">→</span><code>' + esc('expectedError' in t ? 'ошибка ' + window.jspShow(t.expectedError) : window.jspShow(t.expected)) + '</code></span></li>').join('') +
    '</ul>' + (hiddenCount ? '<p class="muted small">И ещё ' + hiddenCount + ' ' + plural(hiddenCount, 'скрытый тест', 'скрытых теста', 'скрытых тестов') + ' на крайние случаи.</p>' : '') + '</div>';

  // ---------- справочник ----------

  const refButton = () => (COURSE.reference ? '<button type="button" class="top-link ref-btn" data-ref>Справочник</button>' : '');

  function referenceHtml() {
    return COURSE.reference.map((sec, i) => '<details class="ref-sec"' + (i < 2 ? ' open' : '') + '><summary>' + esc(sec.title) + '</summary>' +
      '<div class="theory">' + sec.blocks.map(renderBlock).join('') + '</div></details>').join('');
  }

  // Справочник поверх задачи: код в редакторе и таймер экзамена не теряются
  function openReference() {
    if (document.querySelector('.ref-sheet')) return;
    const wrap = document.createElement('div');
    wrap.className = 'ref-sheet';
    wrap.innerHTML = '<div class="ref-panel" role="dialog" aria-modal="true" aria-label="Справочник">' +
      '<div class="ref-head"><h2>Справочник</h2><button type="button" class="btn small ghost" data-ref-close>Закрыть</button></div>' +
      '<p class="muted small">Приёмы и синтаксис, как документация. Готовых решений задач здесь нет.</p>' + referenceHtml() + '</div>';
    const close = () => {
      wrap.remove();
      document.removeEventListener('keydown', onKey);
    };
    const onKey = e => { if (e.key === 'Escape') close(); };
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('[data-ref-close]')) close();
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    wrap.querySelector('[data-ref-close]').focus();
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-ref]')) openReference();
  });

  // ---------- план по дням ----------

  function stepDate(step) {
    if (step.lesson) {
      const lesson = COURSE.lessons[step.lesson];
      if (!lesson || !lesson.tasks.every(t => state.solved[key(step.lesson, t.id)])) return null;
      return lesson.tasks.map(t => state.solved[key(step.lesson, t.id)]).sort().pop();
    }
    if (step.exam) {
      const st = state.exams[step.exam];
      return st && st.history && st.history.length ? st.history[st.history.length - 1].date : null;
    }
    return state.plan['done:' + step.id] || null;
  }

  function stepTitle(step) {
    if (step.lesson) return COURSE.lessons[step.lesson].title;
    if (step.exam) return findExam(step.exam).title;
    return step.title;
  }

  function renderToday() {
    const plan = COURSE.plan;
    if (!plan) return '';
    const steps = plan.steps.filter(s => (s.lesson ? COURSE.lessons[s.lesson] : s.exam || s.review ? findExam(s.exam || s.review) : true));
    const today = dateKey(new Date());
    const idx = steps.findIndex(s => !stepDate(s));
    const doneToday = steps.filter(s => stepDate(s) === today);
    let html = '<section class="today"><div class="today-head"><h2>Сегодня</h2>' +
      '<span class="muted small">' + steps.filter(s => stepDate(s)).length + ' из ' + steps.length + ' шагов плана</span></div>';

    if (idx === -1) {
      return html + '<p>План до экзамена пройден целиком. Перед отбором пройди один пробный экзамен ещё раз и полистай справочник. Удачи!</p></section>';
    }
    const step = steps[idx];

    // Шаг на сегодня уже сделан: хвалим и показываем завтрашний, но даём взять его сразу
    if (doneToday.length && state.plan.ahead !== today) {
      const left = goalDaysLeft();
      const behind = left !== null && steps.length - idx > left;
      html += '<p class="today-done">Сегодня пройдено: ' + doneToday.map(s => esc(stepTitle(s))).join(', ') + ' ✓</p>' +
        '<p>Завтра: <b>' + esc(stepTitle(step)) + '</b>. Отдохни, мозгу нужно время, чтобы всё улеглось.</p>' +
        (behind ? '<p class="muted small">До экзамена ' + left + ' ' + plural(left, 'день', 'дня', 'дней') + ', а шагов осталось ' + (steps.length - idx) + '. Если есть силы, возьми следующий шаг сегодня.</p>' : '') +
        '<div class="actions"><button type="button" class="btn ghost small" id="plan-ahead">Взять следующий шаг сейчас</button></div></section>';
      return html;
    }

    html += '<p class="today-step">День ' + (idx + 1) + ' из ' + steps.length + ': <b>' + esc(stepTitle(step)) + '</b></p><ol class="today-list">';
    if (step.lesson) {
      const prev = steps[idx - 1];
      if (prev && prev.lesson) {
        const pl = COURSE.lessons[prev.lesson];
        const warmTask = pl.tasks[pl.tasks.length - 1];
        const warmKey = 'warm:' + step.id;
        html += '<li class="' + (state.plan[warmKey] ? 'done' : '') + '"><label class="today-check"><input type="checkbox" data-warm="' + warmKey + '"' + (state.plan[warmKey] ? ' checked' : '') + '>' +
          '<span><b>Разминка, 10 минут.</b> Сотри код и реши заново <a href="#/t/' + prev.lesson + '/' + warmTask.id + '">«' + esc(warmTask.title) + '»</a> из прошлого урока, без подсказок. Так вчерашнее закрепится.</span></label></li>';
      }
      const lesson = COURSE.lessons[step.lesson];
      const quizDone = (lesson.quiz || []).every((q, i) => state.quiz[step.lesson + '#' + i] !== undefined);
      const p = lessonProgress(step.lesson);
      const firstOpen = lesson.tasks.find(t => !state.solved[key(step.lesson, t.id)]);
      html += '<li class="' + (quizDone ? 'done' : '') + '"><span><b>Теория, 20–30 минут.</b> Прочитай <a href="#/l/' + step.lesson + '">урок</a> не спеша, примеры кода разбери строчка за строчкой. В конце ответь на вопросы «Проверь себя».</span></li>';
      html += '<li class="' + (p.done === p.total ? 'done' : '') + '"><span><b>Задачи: ' + p.done + ' из ' + p.total + '.</b> Решай по порядку, они от простой к сложной. Застрял на 15 минут: возьми подсказку или открой справочник. ' +
        (firstOpen ? '<a href="#/t/' + step.lesson + '/' + firstOpen.id + '">Следующая: «' + esc(firstOpen.title) + '»</a>' : '') + '</span></li>';
      html += '<li><span><b>Закрепи.</b> Когда все задачи решены, скажи себе вслух в двух фразах: что это за приём и по какому признаку в условии его узнать. Сверься с таблицей в справочнике.</span></li>';
      html += '</ol><a class="btn primary" href="' + (quizDone ? '#/t/' + step.lesson + '/' + (firstOpen ? firstOpen.id : lesson.tasks[0].id) : '#/l/' + step.lesson) + '">' + (quizDone ? 'К задачам' : 'Начать урок') + '</a>';
    } else if (step.exam) {
      const ex = findExam(step.exam);
      html += '<li><span>Выдели ' + Math.round(ex.minutes / 60 * 10) / 10 + ' часа подряд, когда никто не отвлечёт. Телефон в беззвучный.</span></li>' +
        '<li><span>Начни с задач A и B, они самые простые. Застрял — переходи к следующей и возвращайся потом.</span></li>' +
        '<li><span>Справочником пользоваться можно, готовые ответы искать нельзя.</span></li></ol>' +
        '<a class="btn primary" href="#/exam/' + ex.id + '">Перейти к экзамену</a>';
    } else {
      html += '<li><span>' + inline(step.text) + '</span></li></ol>' +
        '<div class="actions"><a class="btn" href="#/exam/' + step.review + '">Открыть результат и разбор</a>' +
        '<button type="button" class="btn primary" id="plan-review-done">Готово, ошибки разобраны</button></div>';
    }
    return html + '</section>';
  }

  function goalDaysLeft() {
    if (!COURSE.goal) return null;
    const [y, m, d] = COURSE.goal.examStart.split('-').map(Number);
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - today0) / 86400000);
  }

  function bindToday() {
    const ahead = document.getElementById('plan-ahead');
    if (ahead) ahead.addEventListener('click', () => { state.plan.ahead = dateKey(new Date()); save(); renderHome(); });
    const reviewDone = document.getElementById('plan-review-done');
    if (reviewDone) {
      reviewDone.addEventListener('click', () => {
        const step = COURSE.plan.steps.find(s => s.review && !state.plan['done:' + s.id]);
        if (step) state.plan['done:' + step.id] = dateKey(new Date());
        state.days[dateKey(new Date())] = true;
        save();
        renderHome();
      });
    }
    app.querySelectorAll('[data-warm]').forEach(box => box.addEventListener('change', () => {
      state.plan[box.dataset.warm] = box.checked;
      save();
      box.closest('li').classList.toggle('done', box.checked);
    }));
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
      '<span class="top-links">' + refButton() + '<a class="top-link" href="' + TRAINER_URL + '">Тренажёр по теории</a></span></header><main>';

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
    html += renderToday();

    if (COURSE.goal) {
      const g = COURSE.goal;
      const [y, m, d] = g.examStart.split('-').map(Number);
      const today0 = new Date();
      today0.setHours(0, 0, 0, 0);
      const left = Math.round((new Date(y, m - 1, d) - today0) / 86400000);
      const leftText = left > 0
        ? 'До начала экзамена ' + left + ' ' + plural(left, 'день', 'дня', 'дней') + '.'
        : left === 0 ? 'Экзамен начинается сегодня.' : 'Отбор уже идёт или закончился.';
      html += '<section class="goal"><h2>' + esc(g.title) + '</h2><p>' + inline(g.text) + '</p>' +
        '<p class="goal-left">' + leftText + '</p><p class="muted small">' + inline(g.daily) + '</p>' +
        '<a href="' + g.url + '" target="_blank" rel="noopener">Страница стажировки ↗</a></section>';
    }

    if (COURSE.exams && COURSE.exams.length) {
      html += '<section class="module"><div class="module-head"><h2>Пробные экзамены</h2><span class="muted">с таймером, как на контесте</span></div>' +
        '<p class="muted small exam-lead">Шесть задач от простой к сложной, общее время, без подсказок. Разбор откроется после завершения.</p><ol class="row-list">';
      COURSE.exams.forEach((ex, i) => {
        html += '<li><a class="row" href="#/exam/' + ex.id + '"><span class="row-num">' + (i + 1) + '</span>' +
          '<span class="row-title">' + esc(ex.title) + '</span><span class="row-meta">' + esc(examMeta(ex)) + '</span></a></li>';
      });
      html += '</ol></section>';
    }

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
    bindToday();
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

    let html = '<header class="top"><a class="back" href="#/">← Все уроки</a><span class="top-links">' + refButton() + '<span class="top-meta">Урок ' + (idx + 1) + ' из ' + list.length + '</span></span></header>';
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
      '<span class="top-links">' + refButton() + '<span class="top-meta">Задача ' + (tIndex + 1) + ' из ' + lesson.tasks.length + '</span></span></header>';
    html += '<main><article class="task"><h1 id="task-title">' + esc(task.title) + (state.solved[k] ? '<span class="badge">решена</span>' : '') + '</h1>';
    html += '<div class="statement">' + paragraphs(task.text) + '</div>';
    html += examplesHtml(task, visible, hiddenCount);
    html += editorHtml();
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
    const saveCode = () => { state.code[k] = editor.value; save(); };
    setupEditor(editor, saveCode, () => runCheck());

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
      runInWorker(editor.value, task.fn, task.tests).then(res => {
        runBtn.disabled = false;
        showResult(res);
      });
    }

    function showResult(res) {
      const failed = failedRunHtml(res, task.fn);
      if (failed) {
        resultBox.innerHTML = failed;
        return;
      }
      const results = res.results;
      const passed = results.filter(r => r.pass).length;
      const all = passed === results.length;
      let html = '<div class="res ' + (all ? 'res-ok' : 'res-bad') + '"><p class="res-title">' +
        (all ? 'Все тесты пройдены' : 'Пройдено ' + passed + ' из ' + results.length) + '</p>' +
        '<ul class="tests">' + results.map(r => testItem(r, false)).join('') + '</ul>' + logsBlock(res.logs);

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

  // ---------- пробный экзамен ----------
  // Состояние в state.exams[id]: start и end (мс), code, best (лучшее число пройденных тестов),
  // attempts по задачам и history с прошлыми результатами. Время считается от start,
  // поэтому таймер не сбивается при перезагрузке страницы или закрытии приложения.

  let examTimer = null;
  const findExam = id => (COURSE.exams || []).find(e => e.id === id);
  const examLimit = ex => ex.minutes * 60000;

  function examState(ex) {
    const st = state.exams[ex.id];
    if (st && st.start && !st.end && Date.now() >= st.start + examLimit(ex)) {
      st.end = st.start + examLimit(ex); // время вышло, пока приложение было закрыто
      finishExamRecord(ex, st);
    }
    return st;
  }

  const taskPoints = (task, passed) => Math.round(100 * (passed || 0) / task.tests.length);
  const examScore = (ex, st) => ex.tasks.reduce((s, t) => s + taskPoints(t, st.best[t.id]), 0);

  function finishExamRecord(ex, st) {
    st.history = st.history || [];
    st.history.push({ date: dateKey(new Date(st.end)), score: examScore(ex, st), minutes: Math.max(1, Math.round((st.end - st.start) / 60000)) });
    state.days[dateKey(new Date(st.end))] = true;
    save();
  }

  function examMeta(ex) {
    const st = examState(ex);
    if (st && st.start && !st.end) return 'идёт, осталось ' + clock(st.start + examLimit(ex) - Date.now());
    const hist = st && st.history && st.history.length ? st.history : null;
    if (hist) return 'лучший результат ' + Math.max(...hist.map(h => h.score)) + ' из ' + ex.tasks.length * 100;
    return ex.tasks.length + ' задач · ' + String(Math.round(ex.minutes / 60 * 10) / 10).replace('.', ',') + ' ч';
  }

  function clock(ms) {
    const t = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor(t / 60) % 60;
    const s = t % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }

  function renderExam(id, n) {
    const ex = findExam(id);
    if (!ex) return renderHome();
    const st = examState(ex);
    if (!st || !st.start) return renderExamIntro(ex, st);
    if (!st.end) return renderExamTask(ex, st, Math.min(Math.max(Number(n) || 0, 0), ex.tasks.length - 1));
    if (n !== undefined) return renderExamReview(ex, st, Math.min(Math.max(Number(n) || 0, 0), ex.tasks.length - 1));
    return renderExamResult(ex, st);
  }

  function renderExamIntro(ex, st) {
    const hist = st && st.history ? st.history : [];
    let html = '<header class="top"><a class="back" href="#/">← Все уроки</a><span class="top-meta">Пробный экзамен</span></header>';
    html += '<main><article class="lesson"><h1>' + esc(ex.title) + '</h1><div class="theory">';
    html += '<p>' + ex.tasks.length + ' задач от простой к сложной и ' + ex.minutes + ' минут на всё. Решать можно в любом порядке и отправлять сколько угодно раз, засчитывается лучшая попытка.</p>';
    html += '<ul class="t-list">' +
      '<li>Подсказок и готовых решений во время экзамена нет. Разбор каждой задачи откроется после завершения.</li>' +
      '<li>Справочником пользоваться можно, как документацией: там приёмы и синтаксис, но не ответы.</li>' +
      '<li>У скрытых тестов видно только «пройден» или «неверный ответ», без входных данных, как на контесте.</li>' +
      '<li>За задачу до 100 баллов: доля пройденных тестов. Медленное решение не успевает за 2 секунды на больших данных и теряет баллы.</li>' +
      '<li>Таймер идёт, даже если закрыть приложение. Решай честно, без поиска ответов: так экзамен покажет реальный уровень.</li>' +
      '</ul>';
    if (COURSE.examInput) {
      html += '<div class="note">На настоящем контесте функцию часто не дают: данные приходят на вход программы, а ответ нужно вывести. В JavaScript это обычно выглядит так:</div>' + codeBlock(COURSE.examInput);
    }
    if (hist.length) {
      html += '<h2 class="t-h">Прошлые попытки</h2><ul class="t-list">' +
        hist.map(h => '<li>' + esc(h.date) + ': ' + h.score + ' из ' + ex.tasks.length * 100 + ' за ' + h.minutes + ' мин</li>').join('') + '</ul>';
    }
    html += '</div><div class="actions"><button type="button" class="btn primary" id="exam-start">Начать экзамен</button>' +
      (st && st.end ? '<a class="btn ghost" href="#/exam/' + ex.id + '/0">Разбор прошлой попытки</a>' : '') + '</div></article></main>';
    app.innerHTML = html;
    document.title = ex.title + ' · JS-практика';
    document.getElementById('exam-start').addEventListener('click', () => {
      state.exams[ex.id] = { start: Date.now(), end: null, code: {}, best: {}, attempts: {}, history: hist };
      save();
      location.hash = '#/exam/' + ex.id + '/0';
    });
  }

  function examTabs(ex, st, n, base) {
    return '<nav class="exam-tabs" aria-label="Задачи экзамена">' + ex.tasks.map((t, i) => {
      const passed = st.best[t.id] || 0;
      const cls = passed === t.tests.length ? 'full' : passed ? 'part' : (st.attempts[t.id] ? 'zero' : '');
      return '<a href="' + base + i + '" class="' + cls + (i === n ? ' on' : '') + '"' + (i === n ? ' aria-current="page"' : '') + '>' +
        '<b>' + String.fromCharCode(65 + i) + '</b><span>' + (st.attempts[t.id] || st.end ? taskPoints(t, passed) : '—') + '</span></a>';
    }).join('') + '</nav>';
  }

  function finishExam(ex, st) {
    if (st.end) return;
    st.end = Math.min(Date.now(), st.start + examLimit(ex));
    finishExamRecord(ex, st);
    location.hash = '#/exam/' + ex.id;
  }

  function renderExamTask(ex, st, n) {
    const task = ex.tasks[n];
    const visible = task.tests.filter(t => !t.hidden);
    let html = '<header class="top exam-top"><a class="back" href="#/">← Выйти</a>' +
      '<span class="exam-clock" id="exam-clock" role="timer">' + clock(st.start + examLimit(ex) - Date.now()) + '</span>' +
      '<span class="top-links">' + refButton() + '<button type="button" class="btn small ghost" id="exam-finish">Завершить</button></span></header>';
    html += '<main>' + examTabs(ex, st, n, '#/exam/' + ex.id + '/');
    html += '<article class="task"><h1>' + String.fromCharCode(65 + n) + '. ' + esc(task.title) + '</h1>';
    html += '<div class="statement">' + paragraphs(task.text) + '</div>';
    html += examplesHtml(task, visible, task.tests.length - visible.length);
    html += editorHtml();
    html += '<div class="actions"><button type="button" class="btn primary" id="run">Отправить решение</button></div>';
    html += '<p class="kbd-hint">Ctrl + Enter или ⌘ + Enter отправляет решение. Лучшая попытка: ' +
      (st.best[task.id] || 0) + ' из ' + task.tests.length + ' тестов.</p>';
    html += '<div id="result" class="result" aria-live="polite"></div>';
    const prev = n > 0 ? n - 1 : null;
    const next = n < ex.tasks.length - 1 ? n + 1 : null;
    html += '<nav class="pager">' + (prev !== null ? '<a href="#/exam/' + ex.id + '/' + prev + '">← Задача ' + String.fromCharCode(65 + prev) + '</a>' : '<span></span>') +
      (next !== null ? '<a href="#/exam/' + ex.id + '/' + next + '">Задача ' + String.fromCharCode(65 + next) + ' →</a>' : '') + '</nav></article></main>';

    app.innerHTML = html;
    document.title = clock(st.start + examLimit(ex) - Date.now()) + ' · ' + ex.title;

    const clockEl = document.getElementById('exam-clock');
    const tick = () => {
      const left = st.start + examLimit(ex) - Date.now();
      if (left <= 0) {
        clearInterval(examTimer);
        examTimer = null;
        finishExam(ex, st);
        return;
      }
      clockEl.textContent = clock(left);
      clockEl.classList.toggle('low', left < 10 * 60000);
      document.title = clock(left) + ' · ' + ex.title;
    };
    tick();
    examTimer = setInterval(tick, 1000);

    document.getElementById('exam-finish').addEventListener('click', () => {
      const left = ex.tasks.filter(t => (st.best[t.id] || 0) < t.tests.length).length;
      if (confirm(left ? 'Не решено полностью: ' + left + ' ' + plural(left, 'задача', 'задачи', 'задач') + '. Завершить экзамен?' : 'Завершить экзамен?')) finishExam(ex, st);
    });

    const editor = document.getElementById('code');
    editor.value = st.code[task.id] !== undefined ? st.code[task.id] : task.starter.join('\n');
    const saveCode = () => { st.code[task.id] = editor.value; save(); };
    setupEditor(editor, saveCode, () => submit());

    const runBtn = document.getElementById('run');
    const resultBox = document.getElementById('result');
    runBtn.addEventListener('click', submit);

    function submit() {
      if (runBtn.disabled || st.end) return;
      saveCode();
      st.attempts[task.id] = (st.attempts[task.id] || 0) + 1;
      save();
      resultBox.innerHTML = '<p class="muted">Проверяю…</p>';
      runBtn.disabled = true;
      runInWorker(editor.value, task.fn, task.tests).then(res => {
        runBtn.disabled = false;
        if (st.end) return; // время вышло во время проверки
        const failed = failedRunHtml(res, task.fn);
        if (failed) {
          resultBox.innerHTML = failed;
          return;
        }
        const passed = res.results.filter(r => r.pass).length;
        if (passed > (st.best[task.id] || 0)) st.best[task.id] = passed;
        save();
        const all = passed === res.results.length;
        resultBox.innerHTML = '<div class="res ' + (all ? 'res-ok' : 'res-bad') + '"><p class="res-title">' +
          (all ? 'Принято: все тесты пройдены, 100 баллов' : 'Пройдено ' + passed + ' из ' + res.results.length + ' · ' + taskPoints(task, passed) + ' баллов') + '</p>' +
          '<ul class="tests">' + res.results.map(r => testItem(r, true)).join('') + '</ul>' + logsBlock(res.logs) +
          (all && n < ex.tasks.length - 1 ? '<a class="btn primary" href="#/exam/' + ex.id + '/' + (n + 1) + '">Следующая задача</a>' : '') + '</div>';
        app.querySelector('.exam-tabs').outerHTML = examTabs(ex, st, n, '#/exam/' + ex.id + '/');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  function renderExamResult(ex, st) {
    const score = examScore(ex, st);
    const max = ex.tasks.length * 100;
    const minutes = Math.max(1, Math.round((st.end - st.start) / 60000));
    const full = ex.tasks.filter(t => (st.best[t.id] || 0) === t.tests.length).length;
    let verdict;
    if (full >= 5) verdict = 'Отличный результат. На настоящем экзамене с таким уровнем шансы пройти высокие.';
    else if (full >= 3) verdict = 'Хорошая база. Разбери задачи, где не хватило баллов: обычно это одна идея (префиксные суммы, BFS, бинарный поиск), которую надо один раз понять.';
    else verdict = 'Пока тяжело, и это нормально для первого раза. Разбери каждую задачу, реши её заново сам и через пару дней пройди экзамен ещё раз.';

    let html = '<header class="top"><a class="back" href="#/">← Все уроки</a><span class="top-meta">Результат</span></header>';
    html += '<main><article class="lesson"><h1>' + esc(ex.title) + ': ' + score + ' из ' + max + '</h1>';
    html += '<p class="lead">Полностью решено ' + full + ' из ' + ex.tasks.length + ' за ' + minutes + ' мин. ' + verdict + '</p>';
    html += '<ol class="row-list">' + ex.tasks.map((t, i) => {
      const passed = st.best[t.id] || 0;
      return '<li class="' + (passed === t.tests.length ? 'done' : '') + '"><a class="row" href="#/exam/' + ex.id + '/' + i + '">' +
        '<span class="row-num">' + String.fromCharCode(65 + i) + '</span><span class="row-title">' + esc(t.title) + '</span>' +
        '<span class="row-meta">' + taskPoints(t, passed) + ' · ' + (st.attempts[t.id] || 0) + ' ' + plural(st.attempts[t.id] || 0, 'попытка', 'попытки', 'попыток') + '</span></a></li>';
    }).join('') + '</ol>';
    html += '<p class="muted small exam-lead">Нажми на задачу, чтобы открыть разбор, подсказки и решение. Свой код там сохранён, его можно доделать.</p>';
    html += '<div class="actions"><a class="btn primary" href="#/exam/' + ex.id + '/0">Разбор задач</a>' +
      '<button type="button" class="btn ghost" id="exam-again">Пройти заново</button></div></article></main>';
    app.innerHTML = html;
    document.title = 'Результат · ' + ex.title;
    document.getElementById('exam-again').addEventListener('click', () => {
      if (!confirm('Начать экзамен заново? Код этой попытки сотрётся, результат останется в истории.')) return;
      state.exams[ex.id] = { history: st.history || [] };
      save();
      renderExamIntro(ex, state.exams[ex.id]);
    });
  }

  // Разбор после экзамена: условие, свой код с повторной проверкой, подсказки, решение и объяснение
  function renderExamReview(ex, st, n) {
    const task = ex.tasks[n];
    const visible = task.tests.filter(t => !t.hidden);
    let html = '<header class="top"><a class="back" href="#/exam/' + ex.id + '">← Результат</a><span class="top-links">' + refButton() + '<span class="top-meta">Разбор</span></span></header>';
    html += '<main>' + examTabs(ex, st, n, '#/exam/' + ex.id + '/');
    html += '<article class="task"><h1>' + String.fromCharCode(65 + n) + '. ' + esc(task.title) + '</h1>';
    html += '<div class="statement">' + paragraphs(task.text) + '</div>';
    html += examplesHtml(task, visible, task.tests.length - visible.length);
    html += editorHtml();
    html += '<div class="actions"><button type="button" class="btn primary" id="run">Проверить</button></div>';
    html += '<div id="result" class="result" aria-live="polite"></div>';
    const topic = COURSE.examTopics && COURSE.examTopics[ex.id + '/' + task.id];
    if (topic && COURSE.lessons[topic]) html += '<p class="review-topic">Теория к задаче: <a href="#/l/' + topic + '">' + esc(COURSE.lessons[topic].title) + '</a></p>';
    html += '<section class="review"><h2 class="section-h">Подсказки</h2><ol class="hint-list">' + task.hints.map(h => '<li>' + inline(h) + '</li>').join('') + '</ol>' +
      '<details class="review-sol"><summary>Показать решение и разбор</summary>' + codeBlock(task.solution) + '<p>' + inline(task.explain) + '</p></details></section>';
    html += '<nav class="pager">' + (n > 0 ? '<a href="#/exam/' + ex.id + '/' + (n - 1) + '">← Задача ' + String.fromCharCode(64 + n) + '</a>' : '<span></span>') +
      (n < ex.tasks.length - 1 ? '<a href="#/exam/' + ex.id + '/' + (n + 1) + '">Задача ' + String.fromCharCode(66 + n) + ' →</a>' : '<a href="#/exam/' + ex.id + '">К результату →</a>') + '</nav></article></main>';
    app.innerHTML = html;
    document.title = 'Разбор: ' + task.title;

    const editor = document.getElementById('code');
    editor.value = st.code[task.id] !== undefined ? st.code[task.id] : task.starter.join('\n');
    const saveCode = () => { st.code[task.id] = editor.value; save(); };
    setupEditor(editor, saveCode, () => check());
    const runBtn = document.getElementById('run');
    const resultBox = document.getElementById('result');
    runBtn.addEventListener('click', check);

    function check() {
      if (runBtn.disabled) return;
      saveCode();
      resultBox.innerHTML = '<p class="muted">Проверяю…</p>';
      runBtn.disabled = true;
      runInWorker(editor.value, task.fn, task.tests).then(res => {
        runBtn.disabled = false;
        const failed = failedRunHtml(res, task.fn);
        if (failed) {
          resultBox.innerHTML = failed;
          return;
        }
        const passed = res.results.filter(r => r.pass).length;
        const all = passed === res.results.length;
        resultBox.innerHTML = '<div class="res ' + (all ? 'res-ok' : 'res-bad') + '"><p class="res-title">' +
          (all ? 'Все тесты пройдены' : 'Пройдено ' + passed + ' из ' + res.results.length) + '</p>' +
          '<ul class="tests">' + res.results.map(r => testItem(r, false)).join('') + '</ul>' + logsBlock(res.logs) +
          '<p class="muted small">В разборе результат экзамена уже не меняется.</p></div>';
      });
    }
  }

  // ---------- маршруты ----------

  function route() {
    clearInterval(examTimer);
    examTimer = null;
    const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    if (parts[0] === 'l' && parts[1]) renderLesson(parts[1]);
    else if (parts[0] === 't' && parts[1] && parts[2]) renderTask(parts[1], parts[2]);
    else if (parts[0] === 'exam' && parts[1]) renderExam(parts[1], parts[2]);
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
