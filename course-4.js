// Курс «JS-практика»: пробные экзамены в формате контеста Т-Банка.
// У каждого экзамена своё время. Во время экзамена нет подсказок и решений,
// у скрытых тестов не видно входных данных. После завершения открывается разбор.

JSP_COURSE.exams = [
  {
    id: 'exam-1',
    title: 'Пробный экзамен 1',
    minutes: 150,
    tasks: [
      {
        id: 'cashback',
        title: 'Кешбэк',
        text: "Банк начисляет кешбэк с каждой покупки отдельно: `percent` процентов от суммы покупки, округлённых вниз до целого рубля. Напиши функцию `cashback(purchases, percent)`, которая возвращает общий кешбэк в рублях.\n\n`purchases` — массив целых сумм в рублях, `percent` — целое число от 0 до 100.",
        fn: 'cashback',
        starter: ['function cashback(purchases, percent) {', '  // твой код', '}'],
        tests: [
          { args: [[100, 250, 99], 5], expected: 21 },
          { args: [[1000], 1], expected: 10 },
          { args: [[], 3], expected: 0 },
          { args: [[199, 199, 199], 1], expected: 3, hidden: true },
          { args: [[7, 13], 10], expected: 1, hidden: true },
          { args: [[100000, 5], 0], expected: 0, hidden: true }
        ],
        hints: [
          "Округлять нужно каждую покупку отдельно, а не общую сумму.",
          "`Math.floor(sum * percent / 100)` для каждой покупки и сложить."
        ],
        solution: [
          'function cashback(purchases, percent) {',
          '  let total = 0;',
          '  for (const sum of purchases) {',
          '    total += Math.floor(sum * percent / 100);',
          '  }',
          '  return total;',
          '}'
        ],
        explain: "Главная ловушка в слове «отдельно». Если сначала сложить покупки, а округлить один раз, в `[199, 199, 199]` с 1 % выйдет 5 вместо 3. В задачах контеста такие детали условия и проверяют скрытые тесты."
      },
      {
        id: 'max-profit',
        title: 'Лучшая сделка',
        text: "В массиве `prices` записана цена акции по дням. Можно один раз купить и один раз продать, причём продать только позже покупки. Напиши функцию `maxProfit(prices)`, которая возвращает наибольшую прибыль. Если заработать нельзя, верни `0`.\n\nМассив может содержать до 200 000 элементов.",
        fn: 'maxProfit',
        starter: ['function maxProfit(prices) {', '  // твой код', '}'],
        tests: [
          { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
          { args: [[7, 6, 4, 3, 1]], expected: 0 },
          { args: [[2, 4]], expected: 2 },
          { args: [[]], expected: 0, hidden: true },
          { args: [[5]], expected: 0, hidden: true },
          { args: [[9, 2, 8, 1]], expected: 6, hidden: true },
          { code: "(() => { const a = []; for (let i = 200000; i >= 1; i--) a.push(i); a.push(300000); return maxProfit(a); })()", label: 'цены падают 200 000 дней, в последний день 300 000', expected: 299999, hidden: true }
        ],
        hints: [
          "Иди по дням слева направо и помни самую низкую цену, которая была до сегодняшнего дня.",
          "Каждый день считай `price - minSoFar` и обновляй лучший результат. Это один проход, O(n)."
        ],
        solution: [
          'function maxProfit(prices) {',
          '  let min = Infinity;',
          '  let best = 0;',
          '  for (const p of prices) {',
          '    if (p < min) min = p;',
          '    else if (p - min > best) best = p - min;',
          '  }',
          '  return best;',
          '}'
        ],
        explain: "Ответ «максимум минус минимум» неверен: в `[9, 2, 8, 1]` минимум 1 стоит после максимума 9, продать раньше покупки нельзя. Перебор всех пар работает за O(n²) и не успеет на 200 000 днях, поэтому нужен один проход с запоминанием минимума."
      },
      {
        id: 'top-category',
        title: 'Главная категория трат',
        text: "Напиши функцию `topCategory(transactions)`. Каждая операция — объект `{ category, amount }`. Сумма может быть отрицательной: это возврат. Верни категорию с наибольшей общей суммой. Если у нескольких категорий сумма одинаковая, верни ту, что меньше при обычном сравнении строк (`a < b`). Для пустого массива верни `null`.",
        fn: 'topCategory',
        starter: ['function topCategory(transactions) {', '  // твой код', '}'],
        tests: [
          { args: [[{ category: 'Еда', amount: 500 }, { category: 'Такси', amount: 300 }, { category: 'Еда', amount: 200 }]], expected: 'Еда' },
          { args: [[{ category: 'Кино', amount: 400 }, { category: 'Еда', amount: 400 }]], expected: 'Еда' },
          { args: [[]], expected: null },
          { args: [[{ category: 'Аптека', amount: 50 }]], expected: 'Аптека', hidden: true },
          { args: [[{ category: 'Такси', amount: 1000 }, { category: 'Такси', amount: -900 }, { category: 'Еда', amount: 200 }]], expected: 'Еда', hidden: true },
          { args: [[{ category: 'b', amount: 1 }, { category: 'a', amount: 1 }, { category: 'c', amount: 0 }]], expected: 'a', hidden: true },
          { args: [[{ category: 'Связь', amount: -100 }, { category: 'Спорт', amount: -50 }]], expected: 'Спорт', hidden: true }
        ],
        hints: [
          "Сначала посчитай сумму по каждой категории в `Map` или объекте.",
          "Потом пройди по итогам и выбери лучший: сумма больше, либо сумма равна, а название меньше. Начальное значение лучшей суммы — `-Infinity`, а не 0: все суммы могут быть отрицательными."
        ],
        solution: [
          'function topCategory(transactions) {',
          '  const totals = new Map();',
          '  for (const { category, amount } of transactions) {',
          '    totals.set(category, (totals.get(category) || 0) + amount);',
          '  }',
          '  let best = null;',
          '  let bestSum = -Infinity;',
          '  for (const [category, sum] of totals) {',
          '    if (sum > bestSum || (sum === bestSum && category < best)) {',
          '      best = category;',
          '      bestSum = sum;',
          '    }',
          '  }',
          '  return best;',
          '}'
        ],
        explain: "Две ловушки: ничья (её решает условие про сравнение строк) и отрицательные суммы. Если начать с `bestSum = 0`, при одних возвратах функция вернёт `null`, хотя категории есть."
      },
      {
        id: 'merge-intervals',
        title: 'Объединение броней',
        text: "Брони переговорки заданы отрезками `[start, end]`. Напиши функцию `mergeIntervals(intervals)`, которая объединяет пересекающиеся и соприкасающиеся отрезки (`[1, 4]` и `[4, 5]` дают `[1, 5]`) и возвращает их отсортированными по началу.\n\nВходной массив и отрезки в нём менять нельзя.",
        fn: 'mergeIntervals',
        starter: ['function mergeIntervals(intervals) {', '  // твой код', '}'],
        tests: [
          { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
          { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
          { args: [[[5, 7], [1, 2]]], expected: [[1, 2], [5, 7]] },
          { args: [[]], expected: [], hidden: true },
          { args: [[[3, 4]]], expected: [[3, 4]], hidden: true },
          { args: [[[1, 10], [2, 3], [4, 5]]], expected: [[1, 10]], hidden: true },
          { args: [[[6, 8], [1, 9], [2, 4]]], expected: [[1, 9]], noMutate: true, hidden: true }
        ],
        hints: [
          "Отсортируй копию массива по началу: `[...intervals].sort((a, b) => a[0] - b[0])`.",
          "Иди по отрезкам и сравнивай начало текущего с концом последнего в ответе. Конец объединения — `Math.max` из двух концов. В ответ клади новые массивы, а не входные отрезки."
        ],
        solution: [
          'function mergeIntervals(intervals) {',
          '  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);',
          '  const result = [];',
          '  for (const [start, end] of sorted) {',
          '    const last = result[result.length - 1];',
          '    if (last && start <= last[1]) {',
          '      last[1] = Math.max(last[1], end);',
          '    } else {',
          '      result.push([start, end]);',
          '    }',
          '  }',
          '  return result;',
          '}'
        ],
        explain: "`sort` меняет массив на месте, поэтому сортируем копию. Если положить в ответ сам входной отрезок и потом поменять его конец, изменятся и входные данные. Конец берём через `Math.max`: `[1, 10]` поглощает `[2, 3]` целиком."
      },
      {
        id: 'count-subarrays',
        title: 'Отрезки с нужной суммой',
        text: "Напиши функцию `countSubarrays(arr, k)`, которая возвращает, сколько непустых отрезков подряд идущих элементов массива дают в сумме `k`. Числа могут быть отрицательными и нулевыми.\n\nМассив может содержать до 100 000 элементов.",
        fn: 'countSubarrays',
        starter: ['function countSubarrays(arr, k) {', '  // твой код', '}'],
        tests: [
          { args: [[1, 1, 1], 2], expected: 2 },
          { args: [[1, 2, 3], 3], expected: 2 },
          { args: [[1, -1, 0], 0], expected: 3 },
          { args: [[], 0], expected: 0, hidden: true },
          { args: [[0, 0, 0], 0], expected: 6, hidden: true },
          { args: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4, hidden: true },
          { code: "(() => { const a = new Array(100000).fill(1); return countSubarrays(a, 1); })()", label: '100 000 единиц, k = 1', expected: 100000, hidden: true }
        ],
        hints: [
          "Префиксная сумма: `pref[j] - pref[i] = k` значит, что отрезок между ними даёт `k`.",
          "Иди слева направо, считай текущую префиксную сумму `s` и храни в `Map`, сколько раз встречалась каждая префиксная сумма. На каждом шаге прибавь к ответу `count.get(s - k)`. Не забудь начальную сумму 0, встреченную один раз."
        ],
        solution: [
          'function countSubarrays(arr, k) {',
          '  const count = new Map([[0, 1]]);',
          '  let sum = 0;',
          '  let result = 0;',
          '  for (const x of arr) {',
          '    sum += x;',
          '    result += count.get(sum - k) || 0;',
          '    count.set(sum, (count.get(sum) || 0) + 1);',
          '  }',
          '  return result;',
          '}'
        ],
        explain: "Скользящее окно здесь не работает из-за отрицательных чисел: сумма окна не растёт монотонно. Перебор всех отрезков — O(n²), на 100 000 элементов это 5 миллиардов операций. Префиксные суммы с `Map` дают O(n). Это одна из самых частых идей на контестах."
      },
      {
        id: 'shortest-path',
        title: 'Путь по офису',
        text: "План офиса — массив строк одинаковой длины: `'.'` — свободная клетка, `'#'` — стена. Ходить можно на соседнюю клетку вверх, вниз, влево и вправо. Напиши функцию `shortestPath(grid)`, которая возвращает наименьшее число шагов из левого верхнего угла в правый нижний. Если дойти нельзя (или угол сам стена), верни `-1`.\n\nПлан может быть до 300 × 300 клеток.",
        fn: 'shortestPath',
        starter: ['function shortestPath(grid) {', '  // твой код', '}'],
        tests: [
          { args: [['..', '..']], expected: 2 },
          { args: [['.#.', '.#.', '...']], expected: 4 },
          { args: [['.#', '#.']], expected: -1 },
          { args: [['.']], expected: 0, hidden: true },
          { args: [['#']], expected: -1, hidden: true },
          { args: [['...', '.#.', '..#']], expected: -1, hidden: true },
          { args: [['....#', '.##.#', '.#...', '.#.#.', '...#.']], expected: 8, hidden: true },
          { code: "(() => { const row = '.'.repeat(300); return shortestPath(new Array(300).fill(row)); })()", label: 'пустой план 300 × 300', expected: 598, hidden: true }
        ],
        hints: [
          "Это поиск в ширину (BFS): очередь клеток и массив расстояний, где `-1` значит «ещё не были».",
          "Бери клетки из начала очереди, а не с конца: `pop()` превращает очередь в стек, и расстояния получатся неверными. Удобно хранить индекс начала `head` и брать `queue[head++]`, это быстрее, чем `shift()`."
        ],
        solution: [
          'function shortestPath(grid) {',
          '  const rows = grid.length;',
          '  const cols = grid[0].length;',
          "  if (grid[0][0] === '#' || grid[rows - 1][cols - 1] === '#') return -1;",
          '  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));',
          '  dist[0][0] = 0;',
          '  const queue = [[0, 0]];',
          '  let head = 0;',
          '  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];',
          '  while (head < queue.length) {',
          '    const [r, c] = queue[head++];',
          '    if (r === rows - 1 && c === cols - 1) return dist[r][c];',
          '    for (const [dr, dc] of steps) {',
          '      const nr = r + dr;',
          '      const nc = c + dc;',
          "      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;",
          "      if (grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue;",
          '      dist[nr][nc] = dist[r][c] + 1;',
          '      queue.push([nr, nc]);',
          '    }',
          '  }',
          '  return -1;',
          '}'
        ],
        explain: "BFS обходит клетки слоями: сначала все на расстоянии 1, потом 2 и так далее, поэтому первое попадание в цель и есть кратчайший путь. Поиск в глубину (DFS) находит какой-то путь, но не обязательно короткий. Клетку отмечаем при добавлении в очередь, иначе одна клетка попадёт в неё много раз."
      }
    ]
  },
  {
    id: 'exam-2',
    title: 'Пробный экзамен 2',
    minutes: 150,
    tasks: [
      {
        id: 'palindrome',
        title: 'Палиндром',
        text: "Напиши функцию `isPalindrome(s)`. Строка — палиндром, если читается одинаково в обе стороны, когда учитываются только буквы (русские и латинские) и цифры, а регистр не важен. Пустая строка — палиндром.",
        fn: 'isPalindrome',
        starter: ['function isPalindrome(s) {', '  // твой код', '}'],
        tests: [
          { args: ['А роза упала на лапу Азора'], expected: true },
          { args: ['race a car'], expected: false },
          { args: [''], expected: true },
          { args: ['Was it a car or a cat I saw?'], expected: true, hidden: true },
          { args: ['12321'], expected: true, hidden: true },
          { args: ['.,!'], expected: true, hidden: true },
          { args: ['ab'], expected: false, hidden: true },
          { args: ['Ёж, жё'], expected: true, hidden: true },
          { args: ['Аё'], expected: false, hidden: true }
        ],
        hints: [
          "Сначала приведи строку к нижнему регистру и оставь только нужные символы.",
          "Регулярное выражение `/[^a-zа-яё0-9]/g` удаляет всё лишнее. Затем сравни два указателя с концов или строку с развёрнутой."
        ],
        solution: [
          'function isPalindrome(s) {',
          "  const t = s.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');",
          '  let i = 0;',
          '  let j = t.length - 1;',
          '  while (i < j) {',
          '    if (t[i] !== t[j]) return false;',
          '    i++;',
          '    j--;',
          '  }',
          '  return true;',
          '}'
        ],
        explain: "Буква `ё` не входит в диапазон `а-я`, её добавляют в класс отдельно. Без этого `'Аё'` превратится в `'а'` и ошибочно окажется палиндромом. Два указателя не создают лишнюю развёрнутую строку."
      },
      {
        id: 'compress',
        title: 'Сжатие строки',
        text: "Напиши функцию `compress(s)`. Каждую группу из подряд идущих одинаковых символов замени на символ и длину группы. Если группа из одного символа, число не пиши. Например, `'aaabcc'` → `'a3bc2'`.",
        fn: 'compress',
        starter: ['function compress(s) {', '  // твой код', '}'],
        tests: [
          { args: ['aaabcc'], expected: 'a3bc2' },
          { args: ['abc'], expected: 'abc' },
          { args: [''], expected: '' },
          { args: ['aaaaaaaaaaaa'], expected: 'a12', hidden: true },
          { args: ['aabbaa'], expected: 'a2b2a2', hidden: true },
          { args: ['zz'], expected: 'z2', hidden: true },
          { args: ['x'], expected: 'x', hidden: true }
        ],
        hints: [
          "Иди по строке и считай длину текущей группы.",
          "Когда символ сменился или строка кончилась, допиши в ответ символ группы и, если длина больше 1, саму длину."
        ],
        solution: [
          'function compress(s) {',
          "  let result = '';",
          '  let count = 1;',
          '  for (let i = 1; i <= s.length; i++) {',
          '    if (s[i] === s[i - 1]) {',
          '      count++;',
          '    } else {',
          '      result += s[i - 1] + (count > 1 ? count : \'\');',
          '      count = 1;',
          '    }',
          '  }',
          '  return result;',
          '}'
        ],
        explain: "Частые ошибки: забыть записать последнюю группу и считать все вхождения символа, а не подряд идущие (`'aabbaa'` тогда даст `a4b2`). Цикл до `i <= s.length` закрывает последнюю группу: `s[s.length]` равно `undefined` и не совпадает с последним символом."
      },
      {
        id: 'longest-streak',
        title: 'Самая длинная серия',
        text: "В массиве `days` номера дней, в которые были тренировки. Номера идут в любом порядке и могут повторяться. Напиши функцию `longestStreak(days)`, которая возвращает длину самой длинной серии дней подряд (например, 3, 4, 5, 6 — серия из 4 дней).\n\nМассив может содержать до 200 000 элементов.",
        fn: 'longestStreak',
        starter: ['function longestStreak(days) {', '  // твой код', '}'],
        tests: [
          { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
          { args: [[5, 5, 6]], expected: 2 },
          { args: [[]], expected: 0 },
          { args: [[10]], expected: 1, hidden: true },
          { args: [[0, -1, 1, 3]], expected: 3, hidden: true },
          { args: [[1, 2, 2, 3]], expected: 3, hidden: true },
          { code: "(() => { const a = []; for (let i = 200000; i >= 1; i--) a.push(i); return longestStreak(a); })()", label: '200 000 дней в обратном порядке', expected: 200000, hidden: true }
        ],
        hints: [
          "Положи все дни в `Set`, повторы исчезнут, а проверка `has` работает мгновенно.",
          "Начинай считать серию только с дня `d`, для которого нет `d - 1` в `Set`. Тогда каждый день посчитается один раз, и всё решение — O(n)."
        ],
        solution: [
          'function longestStreak(days) {',
          '  const set = new Set(days);',
          '  let best = 0;',
          '  for (const d of set) {',
          '    if (set.has(d - 1)) continue;',
          '    let len = 1;',
          '    while (set.has(d + len)) len++;',
          '    if (len > best) best = len;',
          '  }',
          '  return best;',
          '}'
        ],
        explain: "Можно отсортировать и пройти один раз, это O(n log n) и тоже успевает, но надо не сбрасывать серию на повторах: в `[1, 2, 2, 3]` ответ 3. Решение через `Set` без сортировки — классическое O(n): серия начинается только там, где нет предыдущего дня."
      },
      {
        id: 'min-rooms',
        title: 'Сколько нужно переговорок',
        text: "Встречи заданы отрезками `[start, end]`, встреча занимает время от `start` до `end`, не включая `end`: если одна встреча кончается в 10, другая может начаться в 10 в той же комнате. Напиши функцию `minRooms(meetings)`, которая возвращает наименьшее число переговорок, чтобы провести все встречи.",
        fn: 'minRooms',
        starter: ['function minRooms(meetings) {', '  // твой код', '}'],
        tests: [
          { args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
          { args: [[[7, 10], [2, 4]]], expected: 1 },
          { args: [[]], expected: 0 },
          { args: [[[1, 5], [5, 10]]], expected: 1, hidden: true },
          { args: [[[1, 10], [2, 9], [3, 8]]], expected: 3, hidden: true },
          { args: [[[9, 10], [4, 9], [4, 17]]], expected: 2, hidden: true },
          { args: [[[1, 2], [1, 2], [1, 2], [2, 3]]], expected: 3, hidden: true }
        ],
        hints: [
          "Разбей встречи на события: начало (+1 комната) и конец (−1 комната). Ответ — максимум одновременно занятых комнат.",
          "Отсортируй события по времени. Если в одно время есть конец и начало, конец должен идти первым."
        ],
        solution: [
          'function minRooms(meetings) {',
          '  const events = [];',
          '  for (const [start, end] of meetings) {',
          '    events.push([start, 1]);',
          '    events.push([end, -1]);',
          '  }',
          '  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);',
          '  let busy = 0;',
          '  let best = 0;',
          '  for (const [, delta] of events) {',
          '    busy += delta;',
          '    if (busy > best) best = busy;',
          '  }',
          '  return best;',
          '}'
        ],
        explain: "Сортировка `a[1] - b[1]` при равном времени ставит конец (−1) раньше начала (+1), поэтому встречи `[1, 5]` и `[5, 10]` помещаются в одну комнату. Такой приём «событий на прямой» помогает в задачах про очереди, кассы, банкоматы и операторов."
      },
      {
        id: 'min-capacity',
        title: 'Грузоподъёмность курьера',
        text: "Посылки нужно развезти строго по порядку массива `weights` за `days` дней. Каждый день курьер берёт несколько следующих посылок подряд, их общий вес не больше грузоподъёмности. Напиши функцию `minCapacity(weights, days)`, которая возвращает наименьшую грузоподъёмность, при которой можно уложиться.\n\nПосылок может быть до 100 000, каждая весит до 500.",
        fn: 'minCapacity',
        starter: ['function minCapacity(weights, days) {', '  // твой код', '}'],
        tests: [
          { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
          { args: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
          { args: [[1, 2, 3, 1, 1], 4], expected: 3 },
          { args: [[10], 1], expected: 10, hidden: true },
          { args: [[5, 5, 5], 5], expected: 5, hidden: true },
          { args: [[7, 2, 5, 10, 8], 2], expected: 18, hidden: true },
          { code: "(() => minCapacity(new Array(100000).fill(500), 1000))()", label: '100 000 посылок по 500, 1000 дней', expected: 50000, hidden: true }
        ],
        hints: [
          "Ответ лежит между весом самой тяжёлой посылки и суммой всех весов. Если грузоподъёмность `c` подходит, то и любая больше тоже.",
          "Это бинарный поиск по ответу. Для середины `mid` жадно посчитай, за сколько дней развезёшь: набирай посылки, пока помещаются, иначе начинай новый день."
        ],
        solution: [
          'function minCapacity(weights, days) {',
          '  const fits = cap => {',
          '    let used = 1;',
          '    let load = 0;',
          '    for (const w of weights) {',
          '      if (load + w > cap) {',
          '        used++;',
          '        load = 0;',
          '      }',
          '      load += w;',
          '    }',
          '    return used <= days;',
          '  };',
          '  let lo = Math.max(...weights);',
          '  let hi = weights.reduce((a, b) => a + b, 0);',
          '  while (lo < hi) {',
          '    const mid = Math.floor((lo + hi) / 2);',
          '    if (fits(mid)) hi = mid;',
          '    else lo = mid + 1;',
          '  }',
          '  return lo;',
          '}'
        ],
        explain: "Перебирать грузоподъёмность по одной слишком долго: до 50 миллионов вариантов. Бинарный поиск по ответу проверяет около 26 вариантов, каждый за O(n). Признак такой задачи: «найди наименьшее X, при котором можно» и проверка «можно ли при X» легко пишется жадно. `Math.max(...weights)` на 100 000 элементов работает, а на миллионах может упасть, тогда считай максимум циклом."
      },
      {
        id: 'coin-change',
        title: 'Размен наименьшим числом монет',
        text: "Напиши функцию `coinChange(coins, amount)`, которая возвращает наименьшее число монет из набора `coins`, дающее в сумме `amount`. Монет каждого номинала сколько угодно. Если набрать сумму нельзя, верни `-1`.\n\n`amount` до 10 000, номиналов до 20.",
        fn: 'coinChange',
        starter: ['function coinChange(coins, amount) {', '  // твой код', '}'],
        tests: [
          { args: [[1, 2, 5], 11], expected: 3 },
          { args: [[2], 3], expected: -1 },
          { args: [[1], 0], expected: 0 },
          { args: [[1, 3, 4], 6], expected: 2, hidden: true },
          { args: [[2, 5, 10, 1], 27], expected: 4, hidden: true },
          { args: [[186, 419, 83, 408], 6249], expected: 20, hidden: true },
          { args: [[7], 10000], expected: -1, hidden: true }
        ],
        hints: [
          "Жадный выбор (сначала крупные монеты) ошибается: для `[1, 3, 4]` и суммы 6 он даст 4 + 1 + 1, а лучше 3 + 3.",
          "Динамика: `dp[s]` — наименьшее число монет для суммы `s`. `dp[0] = 0`, остальные `Infinity`. Для каждой суммы перебери монету `c`: `dp[s] = Math.min(dp[s], dp[s - c] + 1)`."
        ],
        solution: [
          'function coinChange(coins, amount) {',
          '  const dp = new Array(amount + 1).fill(Infinity);',
          '  dp[0] = 0;',
          '  for (let s = 1; s <= amount; s++) {',
          '    for (const c of coins) {',
          '      if (c <= s && dp[s - c] + 1 < dp[s]) dp[s] = dp[s - c] + 1;',
          '    }',
          '  }',
          '  return dp[amount] === Infinity ? -1 : dp[amount];',
          '}'
        ],
        explain: "Это классическая динамика: ответ для суммы строится из ответов для меньших сумм. Работает за `amount × число номиналов`, здесь до 200 000 операций. Последняя задача контеста часто именно такая: перебор не успевает, жадность ошибается, нужна таблица."
      }
    ]
  }
];

// Как на настоящем контесте читать входные данные в JavaScript
JSP_COURSE.examInput = [
  "// Вариант для Node.js: всё, что пришло на вход, одной строкой",
  "const input = require('fs').readFileSync(0, 'utf8').trim().split('\\n');",
  "const n = Number(input[0]);",
  "const arr = input[1].split(' ').map(Number);",
  "// ... решение ...",
  "console.log(answer);"
];
