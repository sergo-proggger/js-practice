// Курс «JS-практика»: этап «Асинхронность» (уроки 11–13) и «Задачи к экзамену Т-Банка» (уроки 14–16).
// В асинхронных задачах функция возвращает промис, проверка ждёт его результат.
// expectedError — тест ждёт, что промис отклонится с ошибкой с таким message.
// label — как тест показан ученику, если код теста длинный.

JSP_COURSE.lessons['event-loop'] = {
  title: 'Event loop и таймеры',
  theory: [
    { h: 'Почему JavaScript ждёт по-особому' },
    { p: "JavaScript в браузере выполняет код в одном потоке, то есть делает одно дело за раз. Если бы запрос к серверу блокировал поток на секунду, страница бы на эту секунду замерла: не нажать кнопку, не прокрутить. Поэтому долгие операции (таймеры, запросы, чтение файлов) запускаются «в фоне», а код, который должен выполниться после них, ставится в очередь." },
    { p: "Порядок выполнения определяет event loop, цикл событий. Его правило простое: пока выполняется текущий код, ничего другого не происходит. Когда стек вызовов опустел, цикл берёт следующую задачу из очереди." },

    { h: 'setTimeout и setInterval' },
    { code: [
      "console.log('раз');",
      "setTimeout(() => console.log('три'), 1000); // через секунду",
      "console.log('два');",
      "// раз, два, три"
    ] },
    { p: "`setTimeout(fn, ms)` ставит функцию в очередь не раньше чем через `ms` миллисекунд. Даже `setTimeout(fn, 0)` не выполнится сразу: сначала доработает весь текущий код." },
    { code: [
      "const id = setTimeout(() => console.log('не увидим'), 500);",
      "clearTimeout(id); // отменили таймер",
      "",
      "let n = 0;",
      "const timer = setInterval(() => {",
      "  n++;",
      "  if (n === 3) clearInterval(timer); // остановить повторы",
      "}, 100);"
    ] },

    { h: 'Микрозадачи и макрозадачи' },
    { p: "Очередей на самом деле две. Колбэки промисов (`.then`, код после `await`) попадают в очередь микрозадач. Таймеры, события и сетевые ответы попадают в очередь макрозадач. После каждой макрозадачи event loop выполняет все накопившиеся микрозадачи и только потом берёт следующую макрозадачу." },
    { code: [
      "console.log('A');",
      "setTimeout(() => console.log('B'), 0);",
      "Promise.resolve().then(() => console.log('C'));",
      "console.log('D');",
      "// A, D, C, B"
    ] },
    { list: [
      "сначала весь синхронный код: `A` и `D`;",
      "потом микрозадачи: `C` из промиса;",
      "потом макрозадачи: `B` из таймера, хотя у него задержка 0."
    ] },
    { note: "Задачи «что выведет код» про порядок `setTimeout` и `Promise` любят на экзаменах и собеседованиях. Решай их по шагам: выпиши синхронные строки, потом микрозадачи, потом таймеры по возрастанию задержки." },

    { h: 'Обещание значения: промис через setTimeout' },
    { p: "Таймер можно обернуть в промис. Тогда паузу удобно ждать через `await`, это пригодится в следующих уроках." },
    { code: [
      "function wait(ms) {",
      "  return new Promise(resolve => setTimeout(resolve, ms));",
      "}",
      "",
      "async function demo() {",
      "  console.log('старт');",
      "  await wait(500);",
      "  console.log('прошло полсекунды');",
      "}"
    ] },

    { h: 'Debounce и throttle' },
    { p: "Две частые задачи фронтенда. Пользователь печатает в поиске, и на каждую букву отправлять запрос дорого. **Debounce** откладывает вызов, пока события идут подряд, и вызывает функцию один раз, когда пауза длится дольше заданного времени. **Throttle** пропускает вызов не чаще одного раза за период: например, обработчик прокрутки срабатывает раз в 100 мс, даже если событий сотни." },
    { code: [
      "// debounce: каждый новый вызов отменяет старый таймер и ставит новый",
      "let timer;",
      "input.addEventListener('input', () => {",
      "  clearTimeout(timer);",
      "  timer = setTimeout(() => search(input.value), 300);",
      "});"
    ] },
    { p: "В задачах ниже ты напишешь их как функции высшего порядка: они принимают функцию и возвращают её «обёрнутую» версию. Здесь работает замыкание: переменная с таймером живёт внутри и общая для всех вызовов обёртки." }
  ],
  quiz: [
    {
      q: "Что выведет код?",
      code: ["setTimeout(() => console.log(1), 0);", "console.log(2);", "Promise.resolve().then(() => console.log(3));"],
      options: ["`1 2 3`", "`2 3 1`", "`2 1 3`"],
      answer: 1,
      explain: "Синхронный `2` первым, затем микрозадача промиса `3`, а таймер `1` в самом конце."
    },
    {
      q: "Что выведет код?",
      code: ["setTimeout(() => console.log('a'), 100);", "setTimeout(() => console.log('b'), 0);", "console.log('c');"],
      options: ["`c b a`", "`a b c`", "`c a b`"],
      answer: 0,
      explain: "Сначала синхронный `c`. Таймеры срабатывают в порядке готовности: `b` через 0 мс, `a` через 100 мс."
    },
    {
      q: "Что выведет код?",
      code: [
        "console.log(1);",
        "setTimeout(() => console.log(2));",
        "Promise.resolve().then(() => {",
        "  console.log(3);",
        "  setTimeout(() => console.log(4));",
        "});",
        "console.log(5);"
      ],
      options: ["`1 5 3 2 4`", "`1 3 5 2 4`", "`1 5 2 3 4`"],
      answer: 0,
      explain: "Синхронно `1` и `5`. Микрозадача печатает `3` и ставит новый таймер `4`, он встаёт в очередь после таймера `2`."
    },
    {
      q: "Пользователь быстро набрал 5 букв в поиске с debounce на 300 мс. Сколько раз вызовется поиск?",
      options: ["5 раз", "1 раз, через 300 мс после последней буквы", "1 раз, сразу после первой буквы"],
      answer: 1,
      explain: "Каждая буква сбрасывает таймер. Поиск сработает один раз, когда пользователь сделает паузу."
    }
  ],
  tasks: [
    {
      id: 'delay',
      title: 'Пауза на промисе',
      text: "Напиши функцию `delay(ms, value)`, которая возвращает промис. Промис выполняется через `ms` миллисекунд со значением `value`.",
      fn: 'delay',
      starter: ['function delay(ms, value) {', '  // твой код', '}'],
      tests: [
        { code: "delay(10, 'ок')", expected: 'ок' },
        { code: "delay(0, 42)", expected: 42 },
        { code: "(async () => { const t = Date.now(); await delay(120); return Date.now() - t >= 100; })()", label: "await delay(120) ждёт не меньше 100 мс", expected: true, hidden: true },
        { code: "delay(5, [1, 2])", expected: [1, 2], hidden: true }
      ],
      hints: [
        "Верни `new Promise(resolve => ...)`. Внутри запусти таймер.",
        "Когда таймер сработает, вызови `resolve(value)`: `setTimeout(() => resolve(value), ms)`."
      ],
      solution: ['function delay(ms, value) {', '  return new Promise(resolve => setTimeout(() => resolve(value), ms));', '}'],
      explain: "Это стандартный способ превратить колбэк-API в промис. Так же оборачивают старые библиотеки, которые принимают колбэк вместо возврата промиса."
    },
    {
      id: 'debounce',
      title: 'Debounce',
      text: "Напиши функцию `debounce(fn, ms)`. Она возвращает новую функцию. Если новую функцию вызывают подряд, `fn` должна вызваться один раз, через `ms` мс после последнего вызова, с аргументами последнего вызова.",
      fn: 'debounce',
      starter: ['function debounce(fn, ms) {', '  // твой код', '}'],
      tests: [
        { code: "(async () => { const calls = []; const d = debounce(x => calls.push(x), 30); d(1); d(2); d(3); await new Promise(r => setTimeout(r, 80)); return calls; })()", label: "d(1); d(2); d(3) подряд, через 80 мс fn вызвана один раз с 3", expected: [3] },
        { code: "(async () => { const calls = []; const d = debounce(x => calls.push(x), 30); d('а'); await new Promise(r => setTimeout(r, 70)); d('б'); await new Promise(r => setTimeout(r, 70)); return calls; })()", label: "два вызова с паузой 70 мс, debounce 30 мс", expected: ['а', 'б'] },
        { code: "(async () => { const calls = []; const d = debounce(x => calls.push(x), 50); d(1); await new Promise(r => setTimeout(r, 20)); return calls; })()", label: "через 20 мс при debounce 50 мс fn ещё не вызвана", expected: [], hidden: true },
        { code: "(async () => { const calls = []; const d = debounce((a, b) => calls.push(a + b), 20); d(1, 2); d(10, 20); await new Promise(r => setTimeout(r, 60)); return calls; })()", label: "передаёт все аргументы последнего вызова", expected: [30], hidden: true }
      ],
      hints: [
        "Объяви переменную `timer` внутри `debounce`, но снаружи возвращаемой функции. Тогда она общая для всех вызовов.",
        "Возвращаемая функция: `(...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }`."
      ],
      solution: [
        'function debounce(fn, ms) {',
        '  let timer;',
        '  return (...args) => {',
        '    clearTimeout(timer);',
        '    timer = setTimeout(() => fn(...args), ms);',
        '  };',
        '}'
      ],
      explain: "`clearTimeout` с `undefined` ничего не делает, поэтому первый вызов проверять отдельно не нужно. `...args` собирает все аргументы в массив и снова раскладывает их при вызове `fn`."
    },
    {
      id: 'throttle',
      title: 'Throttle',
      text: "Напиши функцию `throttle(fn, ms)`. Она возвращает новую функцию, которая вызывает `fn` сразу при первом вызове, а следующие вызовы в течение `ms` мс игнорирует. После паузы снова срабатывает первый вызов.",
      fn: 'throttle',
      starter: ['function throttle(fn, ms) {', '  // твой код', '}'],
      tests: [
        { code: "(() => { const calls = []; const t = throttle(x => calls.push(x), 50); t(1); t(2); t(3); return calls; })()", label: "t(1); t(2); t(3) подряд", expected: [1] },
        { code: "(async () => { const calls = []; const t = throttle(x => calls.push(x), 30); t(1); t(2); await new Promise(r => setTimeout(r, 60)); t(3); t(4); return calls; })()", label: "t(1); t(2), пауза 60 мс, t(3); t(4) при throttle 30 мс", expected: [1, 3] },
        { code: "(() => { const calls = []; const t = throttle((a, b) => calls.push(a * b), 50); t(2, 5); return calls; })()", label: "передаёт все аргументы", expected: [10], hidden: true }
      ],
      hints: [
        "Храни флаг `waiting`. Если он `true`, вызов игнорируется.",
        "При срабатывании вызови `fn`, поставь `waiting = true` и запусти таймер, который через `ms` вернёт `waiting = false`."
      ],
      solution: [
        'function throttle(fn, ms) {',
        '  let waiting = false;',
        '  return (...args) => {',
        '    if (waiting) return;',
        '    fn(...args);',
        '    waiting = true;',
        '    setTimeout(() => { waiting = false; }, ms);',
        '  };',
        '}'
      ],
      explain: "Это самый простой throttle. В библиотеках вроде lodash есть ещё вариант, который вызывает `fn` и в конце периода с последними аргументами, чтобы не потерять последнее событие."
    }
  ]
};

JSP_COURSE.lessons.promises = {
  title: 'Промисы',
  theory: [
    { h: 'Что такое промис' },
    { p: "Промис (`Promise`) хранит результат, которого ещё нет: ответ сервера, окончание таймера. У промиса три состояния: `pending` (ждём), `fulfilled` (выполнен со значением) и `rejected` (отклонён с ошибкой). Из ожидания он переходит в одно из двух других состояний один раз и навсегда." },
    { code: [
      "const p = new Promise((resolve, reject) => {",
      "  const ok = Math.random() > 0.5;",
      "  setTimeout(() => {",
      "    if (ok) resolve('данные');",
      "    else reject(new Error('сервер не ответил'));",
      "  }, 300);",
      "});"
    ] },
    { p: "Функцию внутри `new Promise` называют исполнителем. Она запускается сразу и получает две функции: `resolve` выполняет промис, `reject` отклоняет его. Повторный вызов `resolve` или `reject` уже ничего не меняет." },

    { h: 'then, catch, finally' },
    { code: [
      "p.then(value => console.log('успех', value))",
      " .catch(err => console.log('ошибка', err.message))",
      " .finally(() => console.log('в любом случае'));"
    ] },
    { p: "`then` возвращает новый промис, поэтому вызовы складываются в цепочку. Что вернёшь из `then`, то получит следующий `then`. Если вернуть промис, цепочка дождётся его." },
    { code: [
      "Promise.resolve(2)",
      "  .then(x => x * 10)        // 20",
      "  .then(x => delay(100, x + 1)) // ждём 100 мс, потом 21",
      "  .then(x => console.log(x)); // 21"
    ] },
    { p: "Ошибка в любом звене пропускает следующие `then` и попадает в ближайший `catch`. Выброшенный `throw` внутри `then` тоже превращается в отклонённый промис." },

    { h: 'Готовые промисы' },
    { list: [
      "`Promise.resolve(x)` — уже выполненный промис со значением `x`;",
      "`Promise.reject(err)` — уже отклонённый промис;",
      "`Promise.all([...])` — ждёт все промисы и возвращает массив результатов в исходном порядке; отклоняется при первой ошибке;",
      "`Promise.allSettled([...])` — ждёт все и возвращает статус каждого, не падает;",
      "`Promise.race([...])` — результат первого завершившегося промиса, успешного или нет;",
      "`Promise.any([...])` — первый успешный результат."
    ] },
    { code: [
      "const [user, orders] = await Promise.all([loadUser(1), loadOrders(1)]);",
      "// оба запроса идут параллельно, ждём самый долгий"
    ] },

    { h: 'Частые ошибки' },
    { list: [
      "забыть `return` внутри `then`: следующий `then` получит `undefined`, а цепочка не дождётся вложенного промиса;",
      "не обработать ошибку: в консоли появится `Uncaught (in promise)`;",
      "вызвать `resolve` в одной ветке `if` и забыть в другой: промис навсегда останется в ожидании."
    ] },
    { note: "Свою реализацию `Promise.all`, таймаут для промиса и повтор запроса при ошибке часто спрашивают на собеседованиях фронтендеров. В задачах ниже все три." }
  ],
  quiz: [
    {
      q: "Что выведет код?",
      code: ["Promise.resolve(1)", "  .then(x => { x + 1; })", "  .then(x => console.log(x));"],
      options: ["`2`", "`undefined`", "`1`"],
      answer: 1,
      explain: "В фигурных скобках стрелочная функция ничего не возвращает без `return`, поэтому следующий `then` получает `undefined`."
    },
    {
      q: "Что выведет код?",
      code: ["new Promise((resolve, reject) => {", "  resolve('a');", "  reject(new Error('b'));", "  resolve('c');", "}).then(console.log, e => console.log(e.message));"],
      options: ["`a`", "`b`", "`c`"],
      answer: 0,
      explain: "Промис меняет состояние только один раз. Первым был `resolve('a')`, остальные вызовы игнорируются."
    },
    {
      q: "Как поведёт себя `Promise.all`, если из трёх промисов второй отклонился?",
      options: ["Вернёт массив из двух успешных результатов", "Отклонится с ошибкой второго промиса", "Будет ждать бесконечно"],
      answer: 1,
      explain: "`Promise.all` отклоняется при первой ошибке. Если нужны все результаты независимо от ошибок, используют `Promise.allSettled`."
    }
  ],
  tasks: [
    {
      id: 'with-timeout',
      title: 'Таймаут для промиса',
      text: "Напиши функцию `withTimeout(promise, ms)`. Она возвращает промис, который выполняется так же, как `promise`, если тот успел за `ms` мс. Если не успел, промис отклоняется с ошибкой `new Error('timeout')`. Ошибку самого `promise` нужно пропускать дальше.",
      fn: 'withTimeout',
      starter: ['function withTimeout(promise, ms) {', '  // твой код', '}'],
      tests: [
        { code: "withTimeout(Promise.resolve(5), 50)", expected: 5 },
        { code: "withTimeout(new Promise(r => setTimeout(() => r('поздно'), 200)), 30)", label: "промис выполнится через 200 мс, таймаут 30 мс", expectedError: 'timeout' },
        { code: "withTimeout(new Promise(r => setTimeout(() => r('успел'), 20)), 100)", label: "промис через 20 мс, таймаут 100 мс", expected: 'успел', hidden: true },
        { code: "withTimeout(Promise.reject(new Error('сбой')), 50)", label: "исходный промис отклонён с ошибкой 'сбой'", expectedError: 'сбой', hidden: true }
      ],
      hints: [
        "Здесь подходит `Promise.race`: кто первый завершится, тот и победил.",
        "Второй участник гонки — промис, который через `ms` вызывает `reject(new Error('timeout'))`."
      ],
      solution: [
        'function withTimeout(promise, ms) {',
        '  const timer = new Promise((_, reject) => {',
        "    setTimeout(() => reject(new Error('timeout')), ms);",
        '  });',
        '  return Promise.race([promise, timer]);',
        '}'
      ],
      explain: "Таймер остаётся висеть и после победы `promise`, но повторный `reject` уже ничего не меняет. В продакшене его ещё отменяют через `clearTimeout`, чтобы не держать лишний таймер."
    },
    {
      id: 'promise-all',
      title: 'Свой Promise.all',
      text: "Напиши функцию `promiseAll(items)` без использования `Promise.all`. Она получает массив промисов или обычных значений и возвращает промис с массивом результатов в исходном порядке (не в порядке завершения). Если хотя бы один промис отклонился, результат отклоняется с его ошибкой. Для пустого массива результат `[]`.",
      fn: 'promiseAll',
      starter: ['function promiseAll(items) {', '  // твой код', '}'],
      tests: [
        { code: "promiseAll([Promise.resolve(1), 2, Promise.resolve(3)])", expected: [1, 2, 3] },
        { code: "promiseAll([new Promise(r => setTimeout(() => r('медленно'), 40)), Promise.resolve('быстро')])", label: "первый промис дольше второго", expected: ['медленно', 'быстро'] },
        { code: "promiseAll([])", expected: [] },
        { code: "promiseAll([Promise.resolve(1), Promise.reject(new Error('нет'))])", expectedError: 'нет', hidden: true },
        { code: "(() => { const orig = Promise.all; Promise.all = () => { throw new Error('Promise.all использовать нельзя'); }; try { return promiseAll([1, Promise.resolve(2)]); } finally { Promise.all = orig; } })()", label: "работает без Promise.all", expected: [1, 2], hidden: true }
      ],
      hints: [
        "Верни `new Promise((resolve, reject) => ...)`. Заведи массив `results` и счётчик готовых.",
        "Пройди по `items` с индексом. `Promise.resolve(item)` превратит обычное значение в промис. В `then` клади результат в `results[i]`, увеличивай счётчик и вызывай `resolve(results)`, когда счётчик равен длине.",
        "Не забудь пустой массив: при нём `then` не сработает ни разу, поэтому `resolve([])` нужно вызвать сразу."
      ],
      solution: [
        'function promiseAll(items) {',
        '  return new Promise((resolve, reject) => {',
        '    const results = [];',
        '    let done = 0;',
        '    if (items.length === 0) resolve(results);',
        '    items.forEach((item, i) => {',
        '      Promise.resolve(item).then(value => {',
        '        results[i] = value;',
        '        done++;',
        '        if (done === items.length) resolve(results);',
        '      }, reject);',
        '    });',
        '  });',
        '}'
      ],
      explain: "Главная ловушка — `results.push(value)`: тогда результаты встанут в порядке завершения. Запись по индексу `results[i]` сохраняет исходный порядок, а счётчик говорит, когда готовы все."
    },
    {
      id: 'retry',
      title: 'Повтор при ошибке',
      text: "Напиши функцию `retry(fn, times)`. `fn` — функция без аргументов, которая возвращает промис. Вызывай её, пока она не выполнится успешно, но не больше `times` раз. Верни промис с первым успешным результатом. Если все попытки неудачны, промис отклоняется с ошибкой последней попытки.",
      fn: 'retry',
      starter: ['function retry(fn, times) {', '  // твой код', '}'],
      tests: [
        { code: "(() => { let n = 0; return retry(() => ++n < 3 ? Promise.reject(new Error('сбой ' + n)) : Promise.resolve('ок с попытки ' + n), 5); })()", label: "fn падает два раза, на третий успех, times = 5", expected: 'ок с попытки 3' },
        { code: "(() => { let n = 0; return retry(() => Promise.reject(new Error('сбой ' + (++n))), 3); })()", label: "fn всегда падает, times = 3", expectedError: 'сбой 3' },
        { code: "retry(() => Promise.resolve('сразу'), 1)", expected: 'сразу', hidden: true },
        { code: "(async () => { let n = 0; try { await retry(() => { n++; return Promise.reject(new Error('x')); }, 4); } catch (e) {} return n; })()", label: "при times = 4 fn вызывается ровно 4 раза", expected: 4, hidden: true },
        { code: "(async () => { let n = 0; await retry(() => { n++; return Promise.resolve(n); }, 5); return n; })()", label: "после успеха fn больше не вызывается", expected: 1, hidden: true }
      ],
      hints: [
        "Проще всего с `async`/`await` (следующий урок) или рекурсией на `catch`.",
        "Рекурсивный вариант: `return fn().catch(err => times > 1 ? retry(fn, times - 1) : Promise.reject(err))`."
      ],
      solution: [
        'function retry(fn, times) {',
        '  return fn().catch(err => {',
        '    if (times <= 1) throw err;',
        '    return retry(fn, times - 1);',
        '  });',
        '}'
      ],
      explain: "Через `async` то же самое пишется циклом: `for` по попыткам, внутри `try { return await fn(); } catch (e) { last = e; }`, после цикла `throw last`. В реальных запросах между попытками ещё делают паузу, которая растёт: 1 с, 2 с, 4 с."
    }
  ]
};

JSP_COURSE.lessons['async-await'] = {
  title: 'async/await и fetch',
  theory: [
    { h: 'async и await' },
    { p: "`async` перед функцией делает так, что она всегда возвращает промис. Внутри неё можно писать `await` перед промисом: выполнение функции приостановится, пока промис не завершится, а `await` вернёт его значение. Код выглядит как обычный последовательный, хотя внутри те же промисы." },
    { code: [
      "async function getTotal() {",
      "  const user = await loadUser(1);      // ждём пользователя",
      "  const orders = await loadOrders(user.id); // потом его заказы",
      "  return orders.length;",
      "}",
      "",
      "getTotal().then(n => console.log(n)); // async-функция возвращает промис"
    ] },
    { p: "Пока функция ждёт `await`, остальная страница продолжает работать. Ждёт только сама функция." },

    { h: 'Ошибки: try/catch' },
    { p: "Если промис после `await` отклонился, `await` выбрасывает ошибку. Её ловят обычным `try`/`catch`." },
    { code: [
      "async function safeLoad() {",
      "  try {",
      "    const user = await loadUser(1);",
      "    return user.name;",
      "  } catch (err) {",
      "    console.log('не загрузилось:', err.message);",
      "    return 'Гость';",
      "  }",
      "}"
    ] },

    { h: 'Последовательно или параллельно' },
    { p: "Два `await` подряд выполняются друг за другом. Если запросы не зависят друг от друга, это лишнее ожидание. Запусти их сразу и дождись вместе через `Promise.all`." },
    { code: [
      "// медленно: 1 с + 1 с = 2 с",
      "const a = await load('a');",
      "const b = await load('b');",
      "",
      "// быстро: оба идут одновременно, около 1 с",
      "const [a2, b2] = await Promise.all([load('a'), load('b')]);",
      "",
      "// по массиву",
      "const users = await Promise.all(ids.map(id => loadUser(id)));"
    ] },
    { note: "`await` внутри `forEach` не работает так, как ждут: `forEach` не ждёт промисы. Для последовательного обхода используй `for...of` с `await`, для параллельного `Promise.all` с `map`." },

    { h: 'fetch' },
    { p: "`fetch(url)` отправляет запрос и возвращает промис с объектом ответа. Тело ответа читают отдельно, например `await response.json()`, это тоже промис." },
    { code: [
      "async function loadPosts() {",
      "  const response = await fetch('https://example.com/api/posts');",
      "  if (!response.ok) {",
      "    throw new Error('HTTP ' + response.status);",
      "  }",
      "  return await response.json();",
      "}"
    ] },
    { p: "Важная деталь: `fetch` отклоняет промис только при сетевой ошибке (нет интернета, сервер недоступен). Ответы 404 и 500 считаются успешными с точки зрения промиса, поэтому `response.ok` (статус 200–299) проверяют вручную." },
    { p: "В задачах ниже `fetch` и API передаются параметром. Так их можно подменить в тестах, и этот же приём используют в настоящих проектах для тестирования кода, который ходит в сеть." }
  ],
  quiz: [
    {
      q: "Что вернёт `async function f() { return 5; }` при вызове `f()`?",
      options: ["`5`", "Промис, который выполнится со значением 5", "`undefined`"],
      answer: 1,
      explain: "async-функция всегда возвращает промис. Чтобы получить 5, нужно `await f()` или `f().then(...)`."
    },
    {
      q: "Сервер ответил 404. Что сделает `await fetch(url)`?",
      options: ["Выбросит ошибку", "Вернёт ответ с `ok: false` и `status: 404`", "Будет ждать бесконечно"],
      answer: 1,
      explain: "`fetch` отклоняется только при сетевых ошибках. Статус проверяют через `response.ok` или `response.status`."
    },
    {
      q: "Что выведет код?",
      code: ["async function f() {", "  console.log(1);", "  await null;", "  console.log(2);", "}", "f();", "console.log(3);"],
      options: ["`1 2 3`", "`1 3 2`", "`3 1 2`"],
      answer: 1,
      explain: "До первого `await` функция выполняется синхронно: `1`. Код после `await` уходит в микрозадачу, поэтому сначала синхронный `3`, потом `2`."
    }
  ],
  tasks: [
    {
      id: 'user-name',
      title: 'Имя или «Гость»',
      text: "Напиши async-функцию `getUserName(api, id)`. `api.getUser(id)` возвращает промис с объектом пользователя `{ id, name }`. Верни имя пользователя. Если запрос отклонился с ошибкой, верни строку `'Гость'`.",
      fn: 'getUserName',
      starter: ['async function getUserName(api, id) {', '  // твой код', '}'],
      tests: [
        { code: "getUserName({ getUser: id => Promise.resolve({ id, name: 'Аня' }) }, 1)", label: "getUserName(api, 1), api отвечает { id: 1, name: 'Аня' }", expected: 'Аня' },
        { code: "getUserName({ getUser: () => Promise.reject(new Error('500')) }, 2)", label: "getUserName(api, 2), api отклоняет запрос", expected: 'Гость' },
        { code: "getUserName({ getUser: id => Promise.resolve({ id, name: 'Пользователь ' + id }) }, 7)", label: "имя зависит от id", expected: 'Пользователь 7', hidden: true }
      ],
      hints: [
        "Внутри `try` дождись `await api.getUser(id)` и верни `.name`.",
        "В `catch` верни `'Гость'`."
      ],
      solution: [
        'async function getUserName(api, id) {',
        '  try {',
        '    const user = await api.getUser(id);',
        '    return user.name;',
        '  } catch (err) {',
        "    return 'Гость';",
        '  }',
        '}'
      ],
      explain: "Без `await` внутри `try` ошибка промиса пролетит мимо `catch`: `return api.getUser(id)` вернёт отклонённый промис наружу. Поэтому в `try` важно именно ждать."
    },
    {
      id: 'load-all',
      title: 'Загрузить всё параллельно',
      text: "Напиши async-функцию `loadAll(ids, load)`. `load(id)` возвращает промис с данными. Загрузи данные для всех `ids` параллельно и верни массив результатов в том же порядке, что и `ids`. Тест проверит, что запросы идут одновременно, а не по очереди.",
      fn: 'loadAll',
      starter: ['async function loadAll(ids, load) {', '  // твой код', '}'],
      tests: [
        { code: "loadAll([1, 2, 3], id => Promise.resolve(id * 10))", label: "loadAll([1, 2, 3], id => id * 10)", expected: [10, 20, 30] },
        { code: "loadAll([], id => Promise.resolve(id))", label: "loadAll([], load)", expected: [] },
        { code: "(async () => { const t = Date.now(); await loadAll([1, 2, 3, 4, 5], id => new Promise(r => setTimeout(() => r(id), 60))); return Date.now() - t < 200; })()", label: "5 запросов по 60 мс завершаются быстрее 200 мс", expected: true, hidden: true },
        { code: "loadAll([3, 1], id => new Promise(r => setTimeout(() => r('id' + id), id * 20)))", label: "порядок как в ids, а не по скорости", expected: ['id3', 'id1'], hidden: true }
      ],
      hints: [
        "`ids.map(id => load(id))` сразу запускает все запросы и даёт массив промисов.",
        "Дождись их всех через `await Promise.all(...)`."
      ],
      solution: ['async function loadAll(ids, load) {', '  return Promise.all(ids.map(id => load(id)));', '}'],
      explain: "Цикл `for...of` с `await` внутри тоже вернёт правильный массив, но запросы пойдут по одному, и пять запросов по секунде займут пять секунд вместо одной."
    },
    {
      id: 'fetch-json',
      title: 'fetch с проверкой статуса',
      text: "Напиши async-функцию `fetchJson(url, fetchFn)`. Вызови `fetchFn(url)`, он работает как настоящий `fetch`: возвращает промис с ответом `{ ok, status, json() }`. Если `ok` равно `false`, выброси `new Error('HTTP ' + status)`. Иначе верни результат `await response.json()`.",
      fn: 'fetchJson',
      starter: ['async function fetchJson(url, fetchFn) {', '  // твой код', '}'],
      tests: [
        { code: "fetchJson('/api/user', url => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ name: 'Аня', url }) }))", label: "сервер отвечает 200 и { name: 'Аня' }", expected: { name: 'Аня', url: '/api/user' } },
        { code: "fetchJson('/api/none', () => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) }))", label: "сервер отвечает 404", expectedError: 'HTTP 404' },
        { code: "fetchJson('/api/err', () => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) }))", label: "сервер отвечает 500", expectedError: 'HTTP 500', hidden: true },
        { code: "fetchJson('/api/list', () => Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve([1, 2]) }))", label: "ответ 201 с массивом", expected: [1, 2], hidden: true }
      ],
      hints: [
        "`const response = await fetchFn(url);`",
        "Проверь `if (!response.ok) throw new Error('HTTP ' + response.status);`, потом `return response.json();`."
      ],
      solution: [
        'async function fetchJson(url, fetchFn) {',
        '  const response = await fetchFn(url);',
        '  if (!response.ok) {',
        "    throw new Error('HTTP ' + response.status);",
        '  }',
        '  return response.json();',
        '}'
      ],
      explain: "`throw` внутри async-функции отклоняет возвращаемый промис. Снаружи такую ошибку ловят `try`/`catch` вокруг `await fetchJson(...)` или через `.catch`."
    },
    {
      id: 'run-in-order',
      title: 'Строго по очереди',
      text: "Напиши async-функцию `runInOrder(tasks)`. `tasks` — массив функций, каждая возвращает промис. Запусти их строго по очереди: следующую только после завершения предыдущей. Верни массив результатов.",
      fn: 'runInOrder',
      starter: ['async function runInOrder(tasks) {', '  // твой код', '}'],
      tests: [
        { code: "runInOrder([() => Promise.resolve(1), () => Promise.resolve(2)])", expected: [1, 2] },
        { code: "(async () => { const log = []; const mk = (name, ms) => () => { log.push('старт ' + name); return new Promise(r => setTimeout(() => { log.push('конец ' + name); r(name); }, ms)); }; const res = await runInOrder([mk('A', 30), mk('B', 10)]); return [res, log]; })()", label: "A (30 мс) и B (10 мс): B стартует после конца A", expected: [['A', 'B'], ['старт A', 'конец A', 'старт B', 'конец B']] },
        { code: "runInOrder([])", expected: [], hidden: true }
      ],
      hints: [
        "Здесь нужен обычный цикл `for...of`: внутри `await` действительно ждёт.",
        "`for (const task of tasks) results.push(await task());`"
      ],
      solution: [
        'async function runInOrder(tasks) {',
        '  const results = [];',
        '  for (const task of tasks) {',
        '    results.push(await task());',
        '  }',
        '  return results;',
        '}'
      ],
      explain: "Это обратная ситуация к прошлой задаче. `Promise.all(tasks.map(t => t()))` запустит всё сразу. Очередь нужна, когда задачи зависят друг от друга или сервер не любит много одновременных запросов."
    }
  ]
};

JSP_COURSE.lessons['hash-count'] = {
  title: 'Подсчёт и поиск через Map и Set',
  theory: [
    { h: 'Зачем это на экзамене' },
    { p: "На вступительных экзаменах и собеседованиях у задач есть ограничение по времени работы. Решение «для каждого элемента пройди весь массив ещё раз» делает n × n шагов: на массиве из 100 000 элементов это 10 миллиардов операций, и скрытый тест упадёт по времени. Такое решение называют квадратичным, O(n²)." },
    { p: "Много таких задач решается за один проход, если запоминать увиденное в `Map` или `Set`. Проверка `set.has(x)` и чтение `map.get(x)` работают почти мгновенно, сколько бы элементов ни было. Это O(1) на операцию и O(n) на весь проход." },

    { h: 'Приём 1: подсчёт' },
    { code: [
      "function countChars(str) {",
      "  const counts = new Map();",
      "  for (const ch of str) {",
      "    counts.set(ch, (counts.get(ch) || 0) + 1);",
      "  }",
      "  return counts;",
      "}",
      "countChars('мама') // Map { 'м' => 2, 'а' => 2 }"
    ] },
    { p: "Подсчёт решает задачи «какой элемент встречается чаще всего», «есть ли повторы», «одинаковы ли наборы букв в двух словах»." },

    { h: 'Приём 2: «видел ли я нужное раньше»' },
    { p: "Классика — найти два числа с заданной суммой. Вместо перебора всех пар идём по массиву один раз и для каждого числа спрашиваем: встречалось ли раньше число, которого мне не хватает до суммы?" },
    { code: [
      "// есть ли в массиве два числа с суммой target",
      "function hasPair(nums, target) {",
      "  const seen = new Set();",
      "  for (const n of nums) {",
      "    if (seen.has(target - n)) return true;",
      "    seen.add(n);",
      "  }",
      "  return false;",
      "}"
    ] },
    { p: "Порядок «сначала проверь, потом добавь» важен: так число не составит пару само с собой." },

    { h: 'Приём 3: ключ группы' },
    { p: "Чтобы собрать одинаковые по какому-то признаку элементы, придумай ключ: у анаграмм это отсортированные буквы, у дат это месяц, у слов это первая буква. Элементы с одним ключом кладут в один массив в `Map`." },
    { code: [
      "const key = word.split('').sort().join(''); // 'кот' и 'ток' дают 'кот'"
    ] },
    { note: "Перед кодом оцени, сколько будет данных. Если в условии n до 100 000 или больше, двойной цикл почти наверняка не пройдёт по времени, ищи решение за один-два прохода." }
  ],
  quiz: [
    {
      q: "В массиве 100 000 чисел. Какое решение задачи «есть ли повторы» уложится во время?",
      options: ["Двойной цикл: сравнить каждое с каждым", "Один проход с `Set`: если число уже есть в наборе, повтор найден", "Оба одинаково быстрые"],
      answer: 1,
      explain: "Двойной цикл — это около 5 миллиардов сравнений. С `Set` хватит 100 000 шагов."
    },
    {
      q: "Чему равно `new Set('abracadabra').size`?",
      options: ["`11`", "`5`", "`4`"],
      answer: 1,
      explain: "`Set` из строки берёт уникальные буквы: a, b, r, c, d."
    },
    {
      q: "Почему для подсчёта лучше `Map`, а не обычный объект `{}`?",
      options: ["Объект не умеет хранить числа", "Ключи `Map` не превращаются в строки и не пересекаются с встроенными свойствами вроде `constructor`", "`Map` всегда сортирует ключи"],
      answer: 1,
      explain: "У объекта ключ `1` и `'1'` одинаковы, а слово `constructor` уже есть в прототипе. `Map` таких сюрпризов не даёт."
    }
  ],
  tasks: [
    {
      id: 'two-sum',
      title: 'Два числа с суммой',
      text: "Напиши функцию `twoSum(nums, target)`. Найди два разных элемента массива, сумма которых равна `target`, и верни их индексы `[i, j]`, где `i < j`. Если подходящих пар несколько, верни ту, у которой `j` наименьший. Если пары нет, верни `null`. Решение должно работать за один проход.",
      fn: 'twoSum',
      starter: ['function twoSum(nums, target) {', '  // твой код', '}'],
      tests: [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { args: [[3, 2, 4], 6], expected: [1, 2] },
        { args: [[1, 2, 3], 10], expected: null },
        { args: [[3, 3], 6], expected: [0, 1], hidden: true },
        { args: [[], 0], expected: null, hidden: true },
        { args: [[-1, 5, 4, 0], -1], expected: [0, 3], hidden: true },
        { code: "(() => { const a = []; for (let i = 0; i < 200000; i++) a.push(i * 2); return twoSum(a, 399994 + 399996); })()", label: "массив из 200 000 чисел, пара в самом конце", expected: [199997, 199998], hidden: true }
      ],
      hints: [
        "Заведи `Map`: ключ — число, значение — его индекс.",
        "Для каждого `nums[j]` проверь, есть ли в `Map` число `target - nums[j]`. Если есть, ответ `[map.get(...), j]`. Иначе положи `nums[j]` в `Map`."
      ],
      solution: [
        'function twoSum(nums, target) {',
        '  const seen = new Map();',
        '  for (let j = 0; j < nums.length; j++) {',
        '    const need = target - nums[j];',
        '    if (seen.has(need)) return [seen.get(need), j];',
        '    seen.set(nums[j], j);',
        '  }',
        '  return null;',
        '}'
      ],
      explain: "Если сначала сложить в `Map` все числа, а потом искать, число может найти само себя: в `[3, 2, 4]` с суммой 6 тройка вернёт `[0, 0]`. Проверка до добавления решает это."
    },
    {
      id: 'first-unique',
      title: 'Первая неповторяющаяся буква',
      text: "Напиши функцию `firstUnique(str)`, которая возвращает первый символ строки, встречающийся в ней ровно один раз. Если такого нет, верни `null`. Регистр учитывается: `'A'` и `'a'` — разные символы.",
      fn: 'firstUnique',
      starter: ['function firstUnique(str) {', '  // твой код', '}'],
      tests: [
        { args: ['привет'], expected: 'п' },
        { args: ['аабвв'], expected: 'б' },
        { args: ['ааа'], expected: null },
        { args: [''], expected: null, hidden: true },
        { args: ['aAa'], expected: 'A', hidden: true },
        { args: ['ccbba'], expected: 'a', hidden: true }
      ],
      hints: [
        "Сначала посчитай, сколько раз встречается каждый символ (первый проход).",
        "Потом пройди строку ещё раз по порядку и верни первый символ, у которого счётчик равен 1."
      ],
      solution: [
        'function firstUnique(str) {',
        '  const counts = new Map();',
        '  for (const ch of str) counts.set(ch, (counts.get(ch) || 0) + 1);',
        '  for (const ch of str) {',
        '    if (counts.get(ch) === 1) return ch;',
        '  }',
        '  return null;',
        '}'
      ],
      explain: "Два прохода по строке — это всё ещё O(n). Вариант с `str.indexOf(ch) === str.lastIndexOf(ch)` короче, но внутри каждый поиск снова идёт по строке, и выходит O(n²)."
    },
    {
      id: 'is-anagram',
      title: 'Анаграммы',
      text: "Напиши функцию `isAnagram(a, b)`. Она возвращает `true`, если строки состоят из одних и тех же букв в одинаковом количестве, без учёта регистра и пробелов. Например, `'Кабан'` и `'банка'` — анаграммы.",
      fn: 'isAnagram',
      starter: ['function isAnagram(a, b) {', '  // твой код', '}'],
      tests: [
        { args: ['Кабан', 'банка'], expected: true },
        { args: ['кот', 'ток'], expected: true },
        { args: ['кот', 'кит'], expected: false },
        { args: ['аа', 'а'], expected: false, hidden: true },
        { args: ['апельсин', 'спаниель'], expected: true, hidden: true },
        { args: ['Лунь', 'нуль '], expected: true, hidden: true },
        { args: ['ааб', 'абб'], expected: false, hidden: true }
      ],
      hints: [
        "Сначала приведи обе строки к одному виду: `toLowerCase()` и убрать пробелы через `replaceAll(' ', '')`.",
        "Простой путь: отсортировать буквы и сравнить строки. Путь быстрее: посчитать буквы первой строки в `Map` и вычитать буквы второй."
      ],
      solution: [
        'function isAnagram(a, b) {',
        "  const norm = s => s.toLowerCase().replaceAll(' ', '').split('').sort().join('');",
        '  return norm(a) === norm(b);',
        '}'
      ],
      explain: "Сортировка работает за O(n log n), подсчёт за O(n). На экзаменационных ограничениях обычно проходят оба варианта, но на собеседовании спросят про второй."
    },
    {
      id: 'group-anagrams',
      title: 'Группы анаграмм',
      text: "Напиши функцию `groupAnagrams(words)`. Она возвращает массив групп: в каждой группе слова-анаграммы друг друга (регистр одинаковый, пробелов нет). Группы идут в порядке первого появления, слова внутри группы в исходном порядке.",
      fn: 'groupAnagrams',
      starter: ['function groupAnagrams(words) {', '  // твой код', '}'],
      tests: [
        { args: [['кот', 'ток', 'нос', 'сон', 'кто']], expected: [['кот', 'ток', 'кто'], ['нос', 'сон']] },
        { args: [['а']], expected: [['а']] },
        { args: [[]], expected: [], hidden: true },
        { args: [['ab', 'ba', 'abc', 'cab', 'b']], expected: [['ab', 'ba'], ['abc', 'cab'], ['b']], hidden: true }
      ],
      hints: [
        "Ключ группы — буквы слова в отсортированном порядке: `w.split('').sort().join('')`.",
        "`Map` запоминает порядок добавления ключей. В конце верни `[...map.values()]`."
      ],
      solution: [
        'function groupAnagrams(words) {',
        '  const groups = new Map();',
        '  for (const w of words) {',
        "    const key = w.split('').sort().join('');",
        '    if (!groups.has(key)) groups.set(key, []);',
        '    groups.get(key).push(w);',
        '  }',
        '  return [...groups.values()];',
        '}'
      ],
      explain: "Приём «ключ группы» работает везде, где элементы надо разложить по корзинам: заказы по дате, сотрудники по отделу, слова по первой букве."
    }
  ]
};

JSP_COURSE.lessons['two-pointers'] = {
  title: 'Два указателя и скользящее окно',
  theory: [
    { h: 'Два указателя' },
    { p: "Вместо одного индекса `i` заводим два, и каждый двигается по своему правилу. Так за один проход решаются задачи, которые в лоб требуют двойного цикла." },
    { p: "Вариант «с двух концов»: один указатель в начале, другой в конце, сближаем их. Так проверяют палиндромы и ищут пару с суммой в отсортированном массиве." },
    { code: [
      "// отсортированный массив: есть ли пара с суммой target",
      "function hasPairSorted(arr, target) {",
      "  let left = 0, right = arr.length - 1;",
      "  while (left < right) {",
      "    const sum = arr[left] + arr[right];",
      "    if (sum === target) return true;",
      "    if (sum < target) left++;  // нужна сумма больше",
      "    else right--;              // нужна сумма меньше",
      "  }",
      "  return false;",
      "}"
    ] },
    { p: "Вариант «по двум массивам»: по указателю на каждый массив. Так сливают два отсортированных массива в один, как в сортировке слиянием." },

    { h: 'Скользящее окно' },
    { p: "Окно — это отрезок массива или строки от `left` до `right`. Правую границу двигаем вперёд по одному шагу, левую подтягиваем, когда окно перестаёт подходить под условие. Сумму или набор символов в окне не пересчитываем заново, а обновляем: добавили элемент справа, убрали слева." },
    { code: [
      "// максимальная сумма k подряд идущих элементов",
      "let sum = 0;",
      "for (let i = 0; i < k; i++) sum += arr[i];   // первое окно",
      "let best = sum;",
      "for (let i = k; i < arr.length; i++) {",
      "  sum += arr[i] - arr[i - k];  // сдвинули окно на 1",
      "  best = Math.max(best, sum);",
      "}"
    ] },

    { h: 'Подсчёт групп подряд' },
    { p: "Ещё один частый шаблон: пройти строку и обработать группы одинаковых символов подряд, например сжать `'aaabcc'` в `'a3bc2'`. Указатель `i` стоит на начале группы, `j` бежит вперёд, пока символ тот же. Длина группы равна `j - i`." },
    { note: "Типичная ошибка таких задач — забыть обработать последнюю группу после цикла. Проверяй решение на строке, которая заканчивается группой, и на пустой строке." }
  ],
  quiz: [
    {
      q: "Массив отсортирован по возрастанию. Сумма `arr[left] + arr[right]` меньше нужной. Что сдвигать?",
      options: ["`right--`", "`left++`", "Оба указателя"],
      answer: 1,
      explain: "Сдвиг левого указателя вправо берёт число побольше, и сумма растёт."
    },
    {
      q: "Сколько операций сделает скользящее окно на массиве из n элементов?",
      options: ["Порядка n", "Порядка n × k", "Порядка n²"],
      answer: 0,
      explain: "Каждый элемент один раз входит в окно и один раз выходит из него."
    },
    {
      q: "Что выведет код?",
      code: ["const s = 'aab';", "let groups = 0;", "for (let i = 0; i < s.length; i++) {", "  if (s[i] !== s[i + 1]) groups++;", "}", "console.log(groups);"],
      options: ["`1`", "`2`", "`3`"],
      answer: 1,
      explain: "Группа заканчивается там, где следующий символ другой. Для последнего символа `s[i + 1]` равно `undefined`, поэтому последняя группа тоже засчитывается: `aa` и `b`."
    }
  ],
  tasks: [
    {
      id: 'merge-sorted',
      title: 'Слить отсортированные',
      text: "Напиши функцию `mergeSorted(a, b)`. Она получает два массива чисел, отсортированных по возрастанию, и возвращает один отсортированный массив из всех элементов. Используй два указателя, без `sort`.",
      fn: 'mergeSorted',
      starter: ['function mergeSorted(a, b) {', '  // твой код', '}'],
      tests: [
        { args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
        { args: [[1, 2], []], expected: [1, 2] },
        { args: [[], []], expected: [] },
        { args: [[1, 1, 4], [1, 2]], expected: [1, 1, 1, 2, 4], hidden: true },
        { args: [[10], [1, 2, 3]], expected: [1, 2, 3, 10], hidden: true },
        { args: [[-5, 0], [-3, 7, 9]], expected: [-5, -3, 0, 7, 9], hidden: true }
      ],
      hints: [
        "Указатели `i` на `a` и `j` на `b`. Пока оба не дошли до конца, бери меньший из `a[i]` и `b[j]` и двигай его указатель.",
        "После цикла в одном из массивов могут остаться элементы. Добавь хвост: `result.push(...a.slice(i), ...b.slice(j))`."
      ],
      solution: [
        'function mergeSorted(a, b) {',
        '  const result = [];',
        '  let i = 0, j = 0;',
        '  while (i < a.length && j < b.length) {',
        '    if (a[i] <= b[j]) result.push(a[i++]);',
        '    else result.push(b[j++]);',
        '  }',
        '  return result.concat(a.slice(i), b.slice(j));',
        '}'
      ],
      explain: "Это шаг сортировки слиянием, он работает за O(n + m). Запись `a[i++]` сначала берёт элемент, потом увеличивает `i`."
    },
    {
      id: 'max-window',
      title: 'Лучшие k дней подряд',
      text: "Напиши функцию `maxWindowSum(arr, k)`, которая возвращает наибольшую сумму `k` подряд идущих элементов. Числа могут быть отрицательными. Если `k` больше длины массива или `k <= 0`, верни `null`.",
      fn: 'maxWindowSum',
      starter: ['function maxWindowSum(arr, k) {', '  // твой код', '}'],
      tests: [
        { args: [[1, 4, 2, 10, 2, 3], 2], expected: 12 },
        { args: [[5, 1, 3], 3], expected: 9 },
        { args: [[1, 2], 3], expected: null },
        { args: [[-3, -1, -2], 1], expected: -1, hidden: true },
        { args: [[-5, -2, -9, -1], 2], expected: -7, hidden: true },
        { args: [[7], 0], expected: null, hidden: true },
        { code: "(() => { const a = []; for (let i = 0; i < 300000; i++) a.push(i % 100); return maxWindowSum(a, 50000); })()", label: "массив из 300 000 чисел, k = 50 000", expected: 2475000, hidden: true }
      ],
      hints: [
        "Посчитай сумму первых `k` элементов, это первое окно и пока лучший ответ.",
        "Дальше сдвигай окно: прибавь `arr[i]`, вычти `arr[i - k]`, обнови максимум. Начальный максимум бери из первого окна, а не 0, иначе сломаются отрицательные числа."
      ],
      solution: [
        'function maxWindowSum(arr, k) {',
        '  if (k <= 0 || k > arr.length) return null;',
        '  let sum = 0;',
        '  for (let i = 0; i < k; i++) sum += arr[i];',
        '  let best = sum;',
        '  for (let i = k; i < arr.length; i++) {',
        '    sum += arr[i] - arr[i - k];',
        '    if (sum > best) best = sum;',
        '  }',
        '  return best;',
        '}'
      ],
      explain: "Если для каждого окна заново складывать `k` чисел через `slice` и `reduce`, на большом тесте выйдет 15 миллиардов операций. Сдвиг окна делает одну операцию на шаг."
    },
    {
      id: 'longest-unique',
      title: 'Самая длинная подстрока без повторов',
      text: "Напиши функцию `longestUnique(s)`, которая возвращает длину самой длинной подстроки (идущих подряд символов) без повторяющихся символов. Например, у `'abcabcbb'` это `'abc'`, длина 3.",
      fn: 'longestUnique',
      starter: ['function longestUnique(s) {', '  // твой код', '}'],
      tests: [
        { args: ['abcabcbb'], expected: 3 },
        { args: ['bbbbb'], expected: 1 },
        { args: ['pwwkew'], expected: 3 },
        { args: [''], expected: 0, hidden: true },
        { args: ['dvdf'], expected: 3, hidden: true },
        { args: ['abba'], expected: 2, hidden: true },
        { args: ['привет мир'], expected: 8, hidden: true }
      ],
      hints: [
        "Окно от `left` до `right`. В `Map` храни, на каком индексе последний раз встречался каждый символ.",
        "Если символ `s[right]` уже встречался внутри окна (его индекс `>= left`), сдвинь `left` на позицию после него. Потом обнови `Map` и максимум `right - left + 1`."
      ],
      solution: [
        'function longestUnique(s) {',
        '  const last = new Map();',
        '  let left = 0, best = 0;',
        '  for (let right = 0; right < s.length; right++) {',
        '    const ch = s[right];',
        '    if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;',
        '    last.set(ch, right);',
        '    best = Math.max(best, right - left + 1);',
        '  }',
        '  return best;',
        '}'
      ],
      explain: "Две ловушки в скрытых тестах. На `'dvdf'` нельзя начинать окно заново с повторного символа: правильная подстрока `'vdf'`. На `'abba'` нельзя двигать `left` назад, отсюда проверка `>= left`."
    },
    {
      id: 'compress',
      title: 'Сжатие строки',
      text: "Напиши функцию `compress(s)`. Каждую группу одинаковых символов подряд замени на символ и количество, если оно больше 1. Например, `'aaabcc'` превращается в `'a3bc2'`.",
      fn: 'compress',
      starter: ['function compress(s) {', '  // твой код', '}'],
      tests: [
        { args: ['aaabcc'], expected: 'a3bc2' },
        { args: ['abc'], expected: 'abc' },
        { args: [''], expected: '' },
        { args: ['zzzzzzzzzzzz'], expected: 'z12', hidden: true },
        { args: ['aabbaa'], expected: 'a2b2a2', hidden: true },
        { args: ['x'], expected: 'x', hidden: true }
      ],
      hints: [
        "Указатель `i` на начало группы, `j` бежит, пока `s[j] === s[i]`.",
        "Длина группы `j - i`. Допиши символ и, если длина больше 1, число. Потом `i = j`."
      ],
      solution: [
        'function compress(s) {',
        "  let result = '';",
        '  let i = 0;',
        '  while (i < s.length) {',
        '    let j = i;',
        '    while (j < s.length && s[j] === s[i]) j++;',
        '    const len = j - i;',
        "    result += s[i] + (len > 1 ? len : '');",
        '    i = j;',
        '  }',
        '  return result;',
        '}'
      ],
      explain: "Вложенный `while` здесь не делает решение квадратичным: `j` только растёт, и каждый символ посещается один раз. Это задача из реальных контестов Яндекса (RLE-сжатие)."
    }
  ]
};

JSP_COURSE.lessons.stack = {
  title: 'Стек и очередь',
  theory: [
    { h: 'Стек' },
    { p: "Стек работает по правилу «последним пришёл, первым ушёл», как стопка тарелок. В JavaScript стек — это обычный массив с методами `push` (положить сверху) и `pop` (снять сверху). Верхний элемент: `stack[stack.length - 1]` или `stack.at(-1)`." },
    { code: [
      "const stack = [];",
      "stack.push(1);",
      "stack.push(2);",
      "stack.at(-1)   // 2, посмотреть верх",
      "stack.pop()    // 2, снять",
      "stack.length   // 1"
    ] },
    { p: "Стек нужен, когда что-то открывается и потом закрывается в обратном порядке: скобки, теги HTML, вложенные вызовы функций, кнопка «Назад», отмена действий." },

    { h: 'Проверка скобок' },
    { p: "Открывающую скобку кладём в стек. Закрывающая должна совпасть с верхом стека, тогда снимаем его. В конце стек должен быть пустым." },
    { code: [
      "'([])'  → ( → ([ → ( → пусто   правильно",
      "'([)]'  → ( → ([ → встретили ), а сверху [   ошибка",
      "'(('    → в конце в стеке ((   ошибка"
    ] },

    { h: 'Очередь' },
    { p: "Очередь работает «первым пришёл, первым ушёл». В массиве это `push` в конец и `shift` из начала. Учти, что `shift` сдвигает все элементы и на больших данных медленный. Для быстрых очередей хранят индекс головы и не удаляют элементы: `queue[head++]`." },
    { code: [
      "const queue = [1, 2, 3];",
      "let head = 0;",
      "while (head < queue.length) {",
      "  const item = queue[head++]; // взяли первого в очереди",
      "  // ... можно добавлять новых в конец: queue.push(...)",
      "}"
    ] },
    { p: "Очередь пригодится для обхода в ширину (поиск кратчайшего пути, обход дерева по уровням), такие задачи бывают в последних номерах экзамена." },

    { h: 'Обратная польская запись' },
    { p: "В обратной польской записи оператор пишут после чисел: `2 3 +` значит `2 + 3`. Скобки не нужны: `(2 + 1) * 3` записывается как `2 1 + 3 *`. Вычисляется стеком: число кладём в стек, оператор снимает два верхних числа и кладёт результат." },
    { note: "Снимая два числа для оператора, помни про порядок: первым снимается правый операнд. Для `-` и `/` это важно: `5 2 -` равно 3, а не -3." }
  ],
  quiz: [
    {
      q: "Что останется в стеке после `push(1); push(2); pop(); push(3);`?",
      options: ["`[1, 3]`", "`[2, 3]`", "`[1, 2, 3]`"],
      answer: 0,
      explain: "`pop` снял верхнюю двойку, потом сверху положили тройку."
    },
    {
      q: "Строка `'(]'`. На каком шаге проверка скобок поймёт, что она неправильная?",
      options: ["Сразу на `(`", "На `]`: верх стека `(` не пара для `]`", "Только в конце"],
      answer: 1,
      explain: "Закрывающая скобка должна совпасть с последней открытой."
    },
    {
      q: "Чему равно выражение `4 2 - 3 *` в обратной польской записи?",
      options: ["`6`", "`-6`", "`10`"],
      answer: 0,
      explain: "`4 2 -` даёт 2, потом `2 3 *` даёт 6."
    }
  ],
  tasks: [
    {
      id: 'brackets',
      title: 'Правильные скобки',
      text: "Напиши функцию `isValidBrackets(s)`. Строка состоит из скобок `()`, `[]` и `{}`. Верни `true`, если каждая скобка закрыта скобкой того же типа в правильном порядке.",
      fn: 'isValidBrackets',
      starter: ['function isValidBrackets(s) {', '  // твой код', '}'],
      tests: [
        { args: ['()[]{}'], expected: true },
        { args: ['([{}])'], expected: true },
        { args: ['(]'], expected: false },
        { args: ['([)]'], expected: false, hidden: true },
        { args: ['(('], expected: false, hidden: true },
        { args: ['))'], expected: false, hidden: true },
        { args: [''], expected: true, hidden: true }
      ],
      hints: [
        "Сделай объект пар: `{ ')': '(', ']': '[', '}': '{' }`.",
        "Открывающую кладёшь в стек. Для закрывающей: если `stack.pop()` не равен её паре, сразу `false`. В конце верни `stack.length === 0`."
      ],
      solution: [
        'function isValidBrackets(s) {',
        "  const pairs = { ')': '(', ']': '[', '}': '{' };",
        '  const stack = [];',
        '  for (const ch of s) {',
        '    if (ch in pairs) {',
        '      if (stack.pop() !== pairs[ch]) return false;',
        '    } else {',
        '      stack.push(ch);',
        '    }',
        '  }',
        '  return stack.length === 0;',
        '}'
      ],
      explain: "Подсчёт открытых и закрытых скобок без стека проверит только количество, а строка `'([)]'` пройдёт, хотя она неправильная. `pop` у пустого массива возвращает `undefined`, поэтому лишняя закрывающая тоже ловится."
    },
    {
      id: 'backspace',
      title: 'Клавиша Backspace',
      text: "Напиши функцию `applyBackspace(s)`. Символ `#` в строке означает нажатие Backspace: он стирает предыдущий напечатанный символ (если он есть). Верни итоговый текст.",
      fn: 'applyBackspace',
      starter: ['function applyBackspace(s) {', '  // твой код', '}'],
      tests: [
        { args: ['ab#c'], expected: 'ac' },
        { args: ['abc##d'], expected: 'ad' },
        { args: ['#a'], expected: 'a' },
        { args: ['a##b'], expected: 'b', hidden: true },
        { args: ['###'], expected: '', hidden: true },
        { args: ['привет#!'], expected: 'приве!', hidden: true }
      ],
      hints: [
        "Набранный текст — это стек символов.",
        "Обычный символ `push`, `#` делает `pop`. В конце `stack.join('')`."
      ],
      solution: [
        'function applyBackspace(s) {',
        '  const stack = [];',
        '  for (const ch of s) {',
        "    if (ch === '#') stack.pop();",
        '    else stack.push(ch);',
        '  }',
        "  return stack.join('');",
        '}'
      ],
      explain: "Через строку и `slice(0, -1)` тоже работает, но каждый `slice` копирует всю строку. Массив с `pop` дешевле."
    },
    {
      id: 'rpn',
      title: 'Калькулятор обратной польской записи',
      text: "Напиши функцию `evalRPN(tokens)`. Массив `tokens` содержит выражение в обратной польской записи: числа строками и операторы `+`, `-`, `*`, `/`. Деление целочисленное с отбрасыванием дробной части к нулю (`Math.trunc`). Верни результат числом.",
      fn: 'evalRPN',
      starter: ['function evalRPN(tokens) {', '  // твой код', '}'],
      tests: [
        { args: [['2', '1', '+', '3', '*']], expected: 9 },
        { args: [['4', '13', '5', '/', '+']], expected: 6 },
        { args: [['5', '2', '-']], expected: 3 },
        { args: [['7']], expected: 7, hidden: true },
        { args: [['-7', '2', '/']], expected: -3, hidden: true },
        { args: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], expected: 22, hidden: true }
      ],
      hints: [
        "Число превращай через `Number(token)` и клади в стек.",
        "Для оператора сними `b = stack.pop()`, потом `a = stack.pop()` (именно в таком порядке), посчитай `a op b` и положи обратно."
      ],
      solution: [
        'function evalRPN(tokens) {',
        '  const stack = [];',
        '  for (const t of tokens) {',
        "    if (t === '+' || t === '-' || t === '*' || t === '/') {",
        '      const b = stack.pop();',
        '      const a = stack.pop();',
        "      if (t === '+') stack.push(a + b);",
        "      else if (t === '-') stack.push(a - b);",
        "      else if (t === '*') stack.push(a * b);",
        '      else stack.push(Math.trunc(a / b));',
        '    } else {',
        '      stack.push(Number(t));',
        '    }',
        '  }',
        '  return stack.pop();',
        '}'
      ],
      explain: "Проверять «число ли это» через `isNaN` или `t < '0'` опасно из-за отрицательных чисел вроде `'-11'`: они начинаются с минуса. Надёжнее сравнивать с четырьмя операторами. `Math.floor(-3.5)` дал бы -4, поэтому здесь `Math.trunc`."
    }
  ]
};
