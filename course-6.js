// Курс «JS-практика»: основы фронтенда к тесту Т-Банка (уроки 22–26) и пробный тест.
// Задачи с dom: true проверяются в изолированной мини-странице с настоящим document,
// остальные — как обычно, в фоновом потоке.

JSP_COURSE.lessons['dom-basics'] = {
  title: 'DOM: элементы на странице',
  theory: [
    { h: 'Что такое DOM' },
    { p: "Браузер читает HTML и строит из него дерево объектов — DOM. Каждый тег становится объектом-элементом: у него есть родитель, дети, атрибуты и текст. JavaScript меняет страницу, меняя это дерево, а браузер сразу перерисовывает то, что изменилось." },
    { p: "Ты уже много раз видел результат на WordPress: слайдер, мобильное меню, поп-ап с формой. Всё это — код, который находит элементы и меняет их классы, текст и атрибуты." },

    { h: 'Как найти элементы' },
    { code: [
      "document.getElementById('menu');          // по id, один элемент или null",
      "document.querySelector('.card .title');  // первый подходящий под CSS-селектор",
      "document.querySelectorAll('li.active');  // все подходящие, список NodeList",
      "",
      "const list = document.querySelector('#list');",
      "list.querySelectorAll('li');             // искать можно и внутри элемента",
      "button.closest('.card');                 // ближайший предок (или сам элемент) по селектору",
      "el.matches('.active');                   // подходит ли сам элемент под селектор"
    ] },
    { p: "`querySelectorAll` возвращает NodeList: у него есть `forEach` и `length`, но нет `map` и `filter`. Чтобы получить обычный массив, пиши `[...nodeList]`." },
    { note: "Ищи внутри нужного элемента, а не во всём `document`. Тогда код не зацепит такие же классы в других частях страницы, например второй слайдер." },

    { h: 'Текст и HTML' },
    { code: [
      "title.textContent = 'Новый заголовок'; // только текст, теги не создаются",
      "box.innerHTML = '<b>жирный</b>';       // разбирается как HTML"
    ] },
    { p: "Если вставлять через `innerHTML` то, что ввёл пользователь, он может подсунуть свой HTML и даже скрипт. Это называется XSS, одна из главных уязвимостей сайтов. Для текста всегда используй `textContent`: строка `<b>` покажется как есть, тегом не станет." },

    { h: 'Атрибуты, data-атрибуты и классы' },
    { code: [
      "link.getAttribute('href');",
      "link.setAttribute('target', '_blank');",
      "input.hidden = true;                 // многие атрибуты доступны как свойства",
      "",
      "// <li data-id=\"7\" data-price=\"500\">",
      "li.dataset.id;     // '7' — всегда строка",
      "li.dataset.price;  // '500'",
      "",
      "card.classList.add('active');",
      "card.classList.remove('active');",
      "card.classList.toggle('open');        // был — убрать, не было — добавить",
      "card.classList.contains('active');    // true или false"
    ] },
    { p: "Менять внешний вид лучше классами, а не через `el.style`: стили остаются в CSS, а JavaScript только переключает состояние. Так делает любая нормальная тема WordPress." },

    { h: 'Создание и удаление элементов' },
    { code: [
      "const li = document.createElement('li');",
      "li.textContent = 'Молоко';",
      "li.classList.add('item');",
      "list.append(li);      // в конец",
      "list.prepend(li);     // в начало",
      "li.remove();          // удалить",
      "list.innerHTML = '';  // очистить содержимое"
    ] },
    { p: "Новый элемент существует в памяти, пока ты не вставишь его в страницу через `append` или `prepend`." },

    { h: 'Как догадаться, что нужно' },
    { list: [
      "Найти один элемент — `querySelector`, все — `querySelectorAll`.",
      "Связать кнопку с карточкой, в которой она лежит, — `closest`.",
      "Хранить id или цену прямо в разметке — `data-*` и `dataset`.",
      "Показать или спрятать, выделить, открыть — `classList` или `hidden`.",
      "Вывести список из массива — `createElement` в цикле и `append`."
    ] }
  ],
  quiz: [
    {
      q: "Что вернёт `document.querySelector('.item')`, если таких элементов три?",
      options: ["Массив из трёх элементов", "Первый подходящий элемент", "Последний подходящий элемент"],
      answer: 1,
      explain: "`querySelector` всегда возвращает один элемент — первый в порядке документа, или `null`. Все находит `querySelectorAll`."
    },
    {
      q: "Пользователь ввёл имя `<img src=x onerror=alert(1)>`. Как безопасно показать его на странице?",
      options: ["`el.innerHTML = name`", "`el.textContent = name`", "Оба способа безопасны"],
      answer: 1,
      explain: "`textContent` выводит строку как текст. `innerHTML` создаст картинку, и её `onerror` выполнит чужой код."
    },
    {
      q: "Что вернёт `li.dataset.price` для `<li data-price=\"500\">`?",
      options: ["Число `500`", "Строку `'500'`", "`undefined`"],
      answer: 1,
      explain: "Значения атрибутов всегда строки. Для расчётов преобразуй: `Number(li.dataset.price)`."
    },
    {
      q: "Как получить у NodeList метод `map`?",
      options: ["`nodeList.map(...)` работает сразу", "`[...nodeList].map(...)`", "Никак"],
      answer: 1,
      explain: "NodeList — не массив. Разворот `[...]` или `Array.from` делает из него обычный массив."
    }
  ],
  tasks: [
    {
      id: 'count-active',
      dom: true,
      title: 'Сколько активных',
      text: "Напиши функцию `countActive(root)`, которая возвращает, сколько элементов внутри `root` имеют класс `active`. Сам `root` не считается, классы вроде `inactive` тоже.",
      fn: 'countActive',
      starter: ['function countActive(root) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const root = document.createElement('div'); root.innerHTML = '<p class="active">a</p><p>b</p><span class="active big">c</span>'; return countActive(root); })()`, label: 'root с <p class="active">, <p> и <span class="active big">', expected: 2 },
        { code: `(() => { const root = document.createElement('ul'); root.innerHTML = '<li class="active">1</li><li><b class="active">2</b></li>'; return countActive(root); })()`, label: 'активный <li> и активный <b> внутри другого <li>', expected: 2 },
        { code: `(() => { const root = document.createElement('div'); return countActive(root); })()`, label: 'пустой root', expected: 0 },
        { code: `(() => { const root = document.createElement('div'); root.className = 'active'; root.innerHTML = '<p>1</p>'; return countActive(root); })()`, label: 'активен только сам root', expected: 0, hidden: true },
        { code: `(() => { const root = document.createElement('div'); root.innerHTML = '<i class="inactive"></i><i class="active-item"></i>'; return countActive(root); })()`, label: 'классы inactive и active-item', expected: 0, hidden: true },
        { code: `(() => { document.body.innerHTML = '<div class="active"></div><div class="active"></div>'; const root = document.createElement('div'); root.innerHTML = '<p class="active"></p>'; return countActive(root); })()`, label: 'на странице есть другие .active, а в root один', expected: 1, hidden: true }
      ],
      hints: [
        "Ищи внутри `root`, а не во всём `document`.",
        "`root.querySelectorAll('.active').length`."
      ],
      solution: [
        'function countActive(root) {',
        "  return root.querySelectorAll('.active').length;",
        '}'
      ],
      explain: "Селектор `.active` совпадает только с целым классом, поэтому `inactive` и `active-item` не считаются, а `active big` считается. `root.querySelectorAll` ищет только потомков, сам `root` не входит."
    },
    {
      id: 'render-list',
      dom: true,
      title: 'Список из массива',
      text: "Напиши функцию `renderList(ul, items)`. Удали всё, что было внутри `ul`, и добавь по `<li>` на каждую строку из `items` в том же порядке. Строки — это то, что ввёл пользователь, поэтому теги в них должны показаться как текст.",
      fn: 'renderList',
      starter: ['function renderList(ul, items) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const ul = document.createElement('ul'); renderList(ul, ['Молоко', 'Хлеб']); return ul.innerHTML; })()`, label: "renderList(ul, ['Молоко', 'Хлеб']), затем ul.innerHTML", expected: '<li>Молоко</li><li>Хлеб</li>' },
        { code: `(() => { const ul = document.createElement('ul'); ul.innerHTML = '<li>старое</li>'; renderList(ul, ['новое']); return ul.innerHTML; })()`, label: "в ul уже был <li>старое</li>, затем renderList(ul, ['новое'])", expected: '<li>новое</li>' },
        { code: `(() => { const ul = document.createElement('ul'); ul.innerHTML = '<li>x</li>'; renderList(ul, []); return ul.innerHTML; })()`, label: 'пустой массив', expected: '' },
        { code: `(() => { const ul = document.createElement('ul'); renderList(ul, ['<b>жирный</b>']); return ul.innerHTML; })()`, label: "строка с тегом <b>", expected: '<li>&lt;b&gt;жирный&lt;/b&gt;</li>', hidden: true },
        { code: `(() => { const ul = document.createElement('ul'); renderList(ul, ['a & b']); return [ul.children.length, ul.innerHTML]; })()`, label: "строка с амперсандом", expected: [1, '<li>a &amp; b</li>'], hidden: true }
      ],
      hints: [
        "Очистить список: `ul.innerHTML = ''` — это безопасно, строка пустая.",
        "Для каждой строки: `document.createElement('li')`, текст через `textContent`, потом `ul.append(li)`."
      ],
      solution: [
        'function renderList(ul, items) {',
        "  ul.innerHTML = '';",
        '  for (const item of items) {',
        "    const li = document.createElement('li');",
        '    li.textContent = item;',
        '    ul.append(li);',
        '  }',
        '}'
      ],
      explain: "Вариант `ul.innerHTML += '<li>' + item + '</li>'` выглядит короче, но превращает введённый текст в HTML: это прямая дорога к XSS. Ещё он пересобирает весь список на каждой итерации. `createElement` и `textContent` безопасны."
    },
    {
      id: 'create-card',
      dom: true,
      title: 'Карточка услуги',
      text: "Напиши функцию `createCard(item)`. По объекту `{ title, text, url }` создай и верни элемент:\n\n`<article class=\"card\"><h3>заголовок</h3><p>текст</p><a href=\"ссылка\">Подробнее</a></article>`\n\nВставлять его на страницу не нужно, только вернуть.",
      fn: 'createCard',
      starter: ['function createCard(item) {', '  // твой код', '}'],
      tests: [
        { code: `createCard({ title: 'Ремонт', text: 'Под ключ', url: '/remont' }).outerHTML`, label: "createCard({ title: 'Ремонт', text: 'Под ключ', url: '/remont' }).outerHTML", expected: '<article class="card"><h3>Ремонт</h3><p>Под ключ</p><a href="/remont">Подробнее</a></article>' },
        { code: `createCard({ title: 'Сайт', text: '', url: '#' }).outerHTML`, label: "пустой текст", expected: '<article class="card"><h3>Сайт</h3><p></p><a href="#">Подробнее</a></article>' },
        { code: `createCard({ title: 'A', text: 'B', url: '/c' }).tagName`, label: 'тег возвращённого элемента', expected: 'ARTICLE', hidden: true },
        { code: `createCard({ title: 'Скидка <50%>', text: 'Только сегодня & завтра', url: '/sale' }).outerHTML`, label: 'символы < > & в тексте', expected: '<article class="card"><h3>Скидка &lt;50%&gt;</h3><p>Только сегодня &amp; завтра</p><a href="/sale">Подробнее</a></article>', hidden: true }
      ],
      hints: [
        "Создай четыре элемента: `article`, `h3`, `p`, `a`. Тексты через `textContent`.",
        "Ссылка: `a.href = item.url` или `a.setAttribute('href', item.url)`. Потом `article.append(h3, p, a)` — `append` принимает несколько элементов."
      ],
      solution: [
        'function createCard(item) {',
        "  const article = document.createElement('article');",
        "  article.className = 'card';",
        "  const h3 = document.createElement('h3');",
        '  h3.textContent = item.title;',
        "  const p = document.createElement('p');",
        '  p.textContent = item.text;',
        "  const a = document.createElement('a');",
        "  a.setAttribute('href', item.url);",
        "  a.textContent = 'Подробнее';",
        '  article.append(h3, p, a);',
        '  return article;',
        '}'
      ],
      explain: "Так в JavaScript рисуют карточки товаров, отзывов и услуг, пришедших с сервера. `setAttribute('href', …)` записывает ссылку как есть, а свойство `a.href` при чтении вернёт полный адрес с доменом."
    },
    {
      id: 'mark-done',
      dom: true,
      title: 'Отметить выполненным',
      text: "В списке `list` лежат `<li data-id=\"…\">`. Напиши функцию `markDone(list, id)`: найди элемент, у которого `data-id` равен `id`, добавь ему класс `done` и верни `true`. Другие классы элемента не трогай. Если элемента нет, верни `false`. `id` может прийти числом или строкой.",
      fn: 'markDone',
      starter: ['function markDone(list, id) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const list = document.createElement('ul'); list.innerHTML = '<li data-id="1">a</li><li data-id="2">b</li>'; const r = markDone(list, 2); return [r, list.children[0].className, list.children[1].className]; })()`, label: 'markDone(list, 2) → [результат, класс 1-го, класс 2-го]', expected: [true, '', 'done'] },
        { code: `(() => { const list = document.createElement('ul'); list.innerHTML = '<li data-id="1">a</li>'; const r = markDone(list, '7'); return [r, list.querySelectorAll('.done').length]; })()`, label: "нет элемента с id '7'", expected: [false, 0] },
        { code: `(() => { const list = document.createElement('ul'); list.innerHTML = '<li data-id="5" class="item urgent">a</li>'; markDone(list, '5'); return list.children[0].className; })()`, label: 'у элемента уже есть классы item urgent', expected: 'item urgent done', hidden: true },
        { code: `(() => { const list = document.createElement('ul'); list.innerHTML = '<li data-id="10">a</li><li data-id="1">b</li>'; markDone(list, 1); return [list.children[0].className, list.children[1].className]; })()`, label: 'есть id 10 и 1, отмечаем 1', expected: ['', 'done'], hidden: true }
      ],
      hints: [
        "Перебери `list.querySelectorAll('li')` и сравнивай `li.dataset.id` со `String(id)`.",
        "Класс добавляй через `classList.add('done')`, тогда старые классы останутся."
      ],
      solution: [
        'function markDone(list, id) {',
        "  for (const li of list.querySelectorAll('li')) {",
        '    if (li.dataset.id === String(id)) {',
        "      li.classList.add('done');",
        '      return true;',
        '    }',
        '  }',
        '  return false;',
        '}'
      ],
      explain: "`li.className = 'done'` стёр бы классы `item urgent`. `dataset.id` — строка, поэтому `id` приводим к строке, иначе `'2' === 2` даст `false`. Можно и селектором: `list.querySelector('[data-id=\"' + id + '\"]')`, но тогда опасны кавычки внутри id."
    }
  ]
};

JSP_COURSE.lessons['events'] = {
  title: 'События и делегирование',
  theory: [
    { h: 'Обработчик события' },
    { code: [
      "button.addEventListener('click', (event) => {",
      "  console.log('клик по', event.target);",
      "});"
    ] },
    { p: "Браузер сам вызывает функцию, когда происходит событие, и передаёт объект `event`. Самые частые события: `click`, `input` (каждое изменение поля), `change` (поле изменено и потеряло фокус, для чекбоксов и select — сразу), `submit` (отправка формы), `keydown`, `DOMContentLoaded`." },

    { h: 'Состояние в замыкании' },
    { p: "Если обработчику нужно что-то помнить, например счётчик кликов, храни это в переменной внутри функции, которая вешает обработчик. У каждого вызова будет своя переменная, и два счётчика на странице не перепутаются." },
    { code: [
      "function setup(button) {",
      "  let clicks = 0;               // своя переменная для каждой кнопки",
      "  button.addEventListener('click', () => {",
      "    clicks++;",
      "  });",
      "}"
    ] },

    { h: 'Всплытие' },
    { p: "Событие сначала срабатывает на самом элементе, по которому кликнули, а потом «всплывает» вверх: на родителе, на его родителе и так до `document`. Поэтому клик по `<span>` внутри кнопки — это ещё и клик по кнопке." },
    { list: [
      "`event.target` — элемент, на котором событие произошло (по чему кликнули).",
      "`event.currentTarget` — элемент, на котором висит этот обработчик.",
      "`event.stopPropagation()` — остановить всплытие. Нужно редко.",
      "`event.preventDefault()` — отменить действие браузера по умолчанию: переход по ссылке, отправку формы."
    ] },

    { h: 'Делегирование' },
    { p: "Вместо того чтобы вешать обработчик на каждый элемент списка, вешают один на общий родитель и по `event.target` понимают, по чему кликнули. Плюсы: один обработчик вместо сотни, и он работает для элементов, которые добавятся позже (например, товары, подгруженные кнопкой «Показать ещё»)." },
    { code: [
      "list.addEventListener('click', (event) => {",
      "  const li = event.target.closest('li');   // кликнуть могли по span внутри li",
      "  if (!li || !list.contains(li)) return;    // кликнули мимо пунктов",
      "  console.log('выбран', li.dataset.id);",
      "});"
    ] },
    { note: "`closest` — главный помощник делегирования. Клик часто приходится не на сам пункт, а на иконку или текст внутри него." },

    { h: 'Как догадаться' },
    { list: [
      "Много одинаковых элементов или элементы появляются позже — делегирование на родителе.",
      "Нужно реагировать на ввод в поле сразу — событие `input`.",
      "Форма не должна перезагружать страницу — `submit` и `preventDefault`.",
      "Вкладки, аккордеон, меню — клик меняет классы или `hidden` у нескольких элементов сразу."
    ] }
  ],
  quiz: [
    {
      q: "Внутри `<button>` лежит `<span>Купить</span>`. Пользователь кликнул по тексту. Чем будет `event.target` в обработчике на кнопке?",
      options: ["Кнопка", "`span`", "`document`"],
      answer: 1,
      explain: "`target` — самый глубокий элемент, по которому кликнули. Кнопка в этом обработчике — `currentTarget`."
    },
    {
      q: "Главный плюс делегирования?",
      options: ["Обработчик срабатывает быстрее", "Один обработчик на родителе работает и для элементов, добавленных позже", "Событие перестаёт всплывать"],
      answer: 1,
      explain: "Обработчик висит на родителе, а новые элементы — его дети, поэтому их клики тоже всплывают к нему."
    },
    {
      q: "Чем `input` отличается от `change` у текстового поля?",
      options: ["Ничем", "`input` срабатывает на каждое изменение, `change` — когда поле изменили и ушли из него", "`change` срабатывает на каждое нажатие клавиши"],
      answer: 1,
      explain: "Для живого поиска нужен `input`, для проверки после ввода часто хватает `change`."
    }
  ],
  tasks: [
    {
      id: 'counter',
      dom: true,
      title: 'Счётчик кликов',
      text: "Напиши функцию `setupCounter(button, output)`. Сразу покажи в `output` текст `0`, а при каждом клике по `button` увеличивай число на 1. На странице может быть несколько счётчиков, они не должны влиять друг на друга.",
      fn: 'setupCounter',
      starter: ['function setupCounter(button, output) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const b = document.createElement('button'); const o = document.createElement('span'); setupCounter(b, o); return o.textContent; })()`, label: 'сразу после setupCounter', expected: '0' },
        { code: `(() => { const b = document.createElement('button'); const o = document.createElement('span'); setupCounter(b, o); b.click(); b.click(); b.click(); return o.textContent; })()`, label: 'три клика', expected: '3' },
        { code: `(() => { const b1 = document.createElement('button'); const o1 = document.createElement('span'); const b2 = document.createElement('button'); const o2 = document.createElement('span'); setupCounter(b1, o1); setupCounter(b2, o2); b1.click(); b1.click(); b2.click(); return [o1.textContent, o2.textContent]; })()`, label: 'два счётчика: 2 клика и 1 клик', expected: ['2', '1'], hidden: true },
        { code: `(() => { const b = document.createElement('button'); b.innerHTML = '<span>+</span>'; const o = document.createElement('span'); setupCounter(b, o); b.querySelector('span').click(); return o.textContent; })()`, label: 'клик по span внутри кнопки', expected: '1', hidden: true }
      ],
      hints: [
        "Заведи `let count = 0` внутри `setupCounter` — у каждого вызова будет свой счётчик.",
        "`button.addEventListener('click', () => { count++; output.textContent = count; })`."
      ],
      solution: [
        'function setupCounter(button, output) {',
        '  let count = 0;',
        '  output.textContent = count;',
        "  button.addEventListener('click', () => {",
        '    count++;',
        '    output.textContent = count;',
        '  });',
        '}'
      ],
      explain: "Если вынести `count` за пределы функции, два счётчика будут увеличивать одну общую переменную. Число в `textContent` превращается в строку, поэтому тест ждёт `'3'`. Клик по `span` внутри кнопки всплывает до кнопки сам."
    },
    {
      id: 'picker',
      dom: true,
      title: 'Выбор из списка через делегирование',
      text: "Напиши функцию `setupPicker(list, onPick)`. Повесь один обработчик клика на `list`. При клике по пункту `<li>` или по чему-то внутри него вызывай `onPick(id)`, где `id` — значение `data-id` этого пункта. Клик мимо пунктов ничего не делает. Пункты, добавленные позже, тоже должны работать.",
      fn: 'setupPicker',
      starter: ['function setupPicker(list, onPick) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const list = document.createElement('ul'); list.innerHTML = '<li data-id="a">A</li><li data-id="b"><span>B</span></li>'; const picks = []; setupPicker(list, id => picks.push(id)); list.children[0].click(); list.querySelector('span').click(); return picks; })()`, label: 'клик по первому li и по span во втором', expected: ['a', 'b'] },
        { code: `(() => { const list = document.createElement('ul'); list.innerHTML = '<li data-id="a">A</li>'; const picks = []; setupPicker(list, id => picks.push(id)); list.click(); return picks; })()`, label: 'клик по самому списку, мимо пунктов', expected: [] },
        { code: `(() => { const list = document.createElement('ul'); list.innerHTML = '<li data-id="a">A</li>'; const picks = []; setupPicker(list, id => picks.push(id)); list.insertAdjacentHTML('beforeend', '<li data-id="c"><b>C</b></li>'); list.querySelector('b').click(); return picks; })()`, label: 'пункт добавлен после setupPicker', expected: ['c'], hidden: true },
        { code: `(() => { const wrap = document.createElement('li'); wrap.dataset.id = 'outer'; const list = document.createElement('ul'); list.innerHTML = '<p>шапка</p>'; wrap.append(list); const picks = []; setupPicker(list, id => picks.push(id)); list.querySelector('p').click(); return picks; })()`, label: 'сам список лежит внутри чужого li', expected: [], hidden: true }
      ],
      hints: [
        "Внутри обработчика: `const li = event.target.closest('li')`.",
        "Проверь, что `li` найден и лежит внутри списка: `if (!li || !list.contains(li)) return;`. Потом `onPick(li.dataset.id)`."
      ],
      solution: [
        'function setupPicker(list, onPick) {',
        "  list.addEventListener('click', (event) => {",
        "    const li = event.target.closest('li');",
        '    if (!li || !list.contains(li)) return;',
        '    onPick(li.dataset.id);',
        '  });',
        '}'
      ],
      explain: "Обработчики на каждом `li` не сработают для пунктов, добавленных позже. `closest('li')` ищет вверх до самого `document`, поэтому может найти `li` снаружи списка — проверка `list.contains(li)` это отсекает."
    },
    {
      id: 'tabs',
      dom: true,
      title: 'Вкладки',
      text: "В `root` лежат кнопки `.tab` с атрибутом `data-tab` и блоки `.panel` с атрибутом `data-panel`. Напиши функцию `setupTabs(root)`: при клике по вкладке (или по чему-то внутри неё) класс `active` должен остаться только у неё, блок с таким же значением `data-panel` — стать видимым (`hidden = false`), остальные блоки — скрытыми (`hidden = true`).",
      fn: 'setupTabs',
      starter: ['function setupTabs(root) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const root = document.createElement('div'); root.innerHTML = '<button class="tab active" data-tab="a">A</button><button class="tab" data-tab="b">B</button><div class="panel" data-panel="a">1</div><div class="panel" data-panel="b" hidden>2</div>'; setupTabs(root); root.querySelectorAll('.tab')[1].click(); return [...root.querySelectorAll('.tab')].map(t => t.classList.contains('active')).concat([...root.querySelectorAll('.panel')].map(p => p.hidden)); })()`, label: 'клик по вкладке B → [active A, active B, hidden 1, hidden 2]', expected: [false, true, true, false] },
        { code: `(() => { const root = document.createElement('div'); root.innerHTML = '<button class="tab active" data-tab="a">A</button><button class="tab" data-tab="b">B</button><div class="panel" data-panel="a">1</div><div class="panel" data-panel="b" hidden>2</div>'; setupTabs(root); const tabs = root.querySelectorAll('.tab'); tabs[1].click(); tabs[0].click(); return [...tabs].map(t => t.classList.contains('active')).concat([...root.querySelectorAll('.panel')].map(p => p.hidden)); })()`, label: 'клик по B, потом по A', expected: [true, false, false, true] },
        { code: `(() => { const root = document.createElement('div'); root.innerHTML = '<button class="tab active" data-tab="a">A</button><button class="tab" data-tab="b"><span>B</span></button><div class="panel" data-panel="a">1</div><div class="panel" data-panel="b" hidden>2</div>'; setupTabs(root); root.querySelector('span').click(); return [...root.querySelectorAll('.tab')].map(t => t.classList.contains('active')).concat([...root.querySelectorAll('.panel')].map(p => p.hidden)); })()`, label: 'клик по span внутри вкладки B', expected: [false, true, true, false], hidden: true },
        { code: `(() => { const root = document.createElement('div'); root.innerHTML = '<button class="tab active" data-tab="a">A</button><button class="tab" data-tab="b">B</button><div class="panel" data-panel="a">1</div><div class="panel" data-panel="b" hidden>2</div>'; setupTabs(root); root.querySelector('.panel').click(); return [...root.querySelectorAll('.tab')].map(t => t.classList.contains('active')).concat([...root.querySelectorAll('.panel')].map(p => p.hidden)); })()`, label: 'клик по тексту панели ничего не меняет', expected: [true, false, false, true], hidden: true },
        { code: `(() => { const root = document.createElement('div'); root.innerHTML = '<button class="tab active" data-tab="a">A</button><button class="tab" data-tab="b">B</button><button class="tab" data-tab="c">C</button><div class="panel" data-panel="a">1</div><div class="panel" data-panel="b" hidden>2</div><div class="panel" data-panel="c" hidden>3</div>'; setupTabs(root); root.querySelectorAll('.tab')[2].click(); return [...root.querySelectorAll('.panel')].map(p => p.hidden); })()`, label: 'три вкладки, клик по C', expected: [true, true, false], hidden: true }
      ],
      hints: [
        "Один обработчик на `root`, вкладку находи через `event.target.closest('.tab')`.",
        "Пройди по всем `.tab` и сделай `classList.toggle('active', t === tab)`. По всем `.panel`: `p.hidden = p.dataset.panel !== tab.dataset.tab`."
      ],
      solution: [
        'function setupTabs(root) {',
        "  root.addEventListener('click', (event) => {",
        "    const tab = event.target.closest('.tab');",
        '    if (!tab || !root.contains(tab)) return;',
        "    for (const t of root.querySelectorAll('.tab')) {",
        "      t.classList.toggle('active', t === tab);",
        '    }',
        "    for (const p of root.querySelectorAll('.panel')) {",
        '      p.hidden = p.dataset.panel !== tab.dataset.tab;',
        '    }',
        '  });',
        '}'
      ],
      explain: "`classList.toggle(name, условие)` с вторым аргументом добавляет класс, если условие истинно, и убирает, если ложно. Так не нужно отдельно «снимать со всех и ставить одному». Вкладки, аккордеоны и меню на сайтах устроены именно так."
    },
    {
      id: 'filter',
      dom: true,
      title: 'Живой поиск по списку',
      text: "Напиши функцию `setupFilter(input, list)`. При каждом вводе в поле (событие `input`) скрывай (`hidden = true`) те `<li>` из `list`, в тексте которых нет введённой строки, и показывай остальные. Регистр не важен, пробелы по краям введённой строки не учитываются. Пустое поле показывает всё.",
      fn: 'setupFilter',
      starter: ['function setupFilter(input, list) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const input = document.createElement('input'); const list = document.createElement('ul'); list.innerHTML = '<li>Москва</li><li>Минск</li><li>Казань</li>'; setupFilter(input, list); input.value = 'м'; input.dispatchEvent(new Event('input')); return [...list.children].map(li => li.hidden); })()`, label: "ввели 'м'", expected: [false, false, true] },
        { code: `(() => { const input = document.createElement('input'); const list = document.createElement('ul'); list.innerHTML = '<li>Москва</li><li>Минск</li><li>Казань</li>'; setupFilter(input, list); input.value = 'мин'; input.dispatchEvent(new Event('input')); input.value = ''; input.dispatchEvent(new Event('input')); return [...list.children].map(li => li.hidden); })()`, label: "ввели 'мин', потом стёрли", expected: [false, false, false] },
        { code: `(() => { const input = document.createElement('input'); const list = document.createElement('ul'); list.innerHTML = '<li>Москва</li><li>Минск</li><li>Казань</li>'; setupFilter(input, list); input.value = ' КАЗ '; input.dispatchEvent(new Event('input')); return [...list.children].map(li => li.hidden); })()`, label: "' КАЗ ' с пробелами и заглавными", expected: [true, true, false], hidden: true },
        { code: `(() => { const input = document.createElement('input'); const list = document.createElement('ul'); list.innerHTML = '<li>Москва</li><li>Минск</li>'; setupFilter(input, list); input.value = 'сочи'; input.dispatchEvent(new Event('input')); return [...list.children].map(li => li.hidden); })()`, label: 'ничего не найдено', expected: [true, true], hidden: true }
      ],
      hints: [
        "`input.addEventListener('input', ...)`, внутри возьми `input.value.trim().toLowerCase()`.",
        "Для каждого `li`: `li.hidden = !li.textContent.toLowerCase().includes(query)`. Пустая строка входит в любую, поэтому пустое поле само покажет всё."
      ],
      solution: [
        'function setupFilter(input, list) {',
        "  input.addEventListener('input', () => {",
        '    const query = input.value.trim().toLowerCase();',
        "    for (const li of list.querySelectorAll('li')) {",
        '      li.hidden = !li.textContent.toLowerCase().includes(query);',
        '    }',
        '  });',
        '}'
      ],
      explain: "`'Москва'.includes('')` — `true`, поэтому отдельная проверка на пустое поле не нужна. Событие `change` здесь не подойдёт: оно срабатывает только когда пользователь ушёл из поля, а фильтр должен реагировать на каждую букву."
    }
  ]
};

JSP_COURSE.lessons['forms'] = {
  title: 'Формы: проверка, отправка, черновик',
  theory: [
    { h: 'Формы, которые ты уже делал' },
    { p: "На WordPress ты ставил формы через Contact Form 7: плагин сам проверяет поля и отправляет письмо. Сейчас разберём, как это устроено на чистом JavaScript. Так делают формы на лендингах без плагинов, заявки в Telegram и калькуляторы." },

    { h: 'Значения полей' },
    { code: [
      "form.elements.name.value;     // текст поля name — всегда строка",
      "form.elements.agree.checked;  // чекбокс: true или false",
      "form.elements.city.value;     // select: value выбранного option",
      "",
      "// все поля сразу",
      "const data = Object.fromEntries(new FormData(form));"
    ] },
    { p: "`FormData` собирает поля по атрибуту `name`. Но неотмеченный чекбокс в неё не попадает вообще, а отмеченный приходит строкой `'on'`. Если нужен честный `true` или `false`, читай `checked` у чекбоксов отдельно." },

    { h: 'Отправка без перезагрузки' },
    { code: [
      "form.addEventListener('submit', async (event) => {",
      "  event.preventDefault();               // иначе браузер перезагрузит страницу",
      "  const res = await fetch('/api/lead', {",
      "    method: 'POST',",
      "    headers: { 'Content-Type': 'application/json' },",
      "    body: JSON.stringify(data)",
      "  });",
      "  if (!res.ok) throw new Error('Ошибка ' + res.status);",
      "  const answer = await res.json();",
      "});"
    ] },
    { note: "`fetch` отклоняет промис только когда нет сети. Ответ 404 или 500 приходит как обычный, с `res.ok === false`. Проверку `res.ok` забывают чаще всего." },

    { h: 'Проверка данных' },
    { list: [
      "Перед проверкой убирай пробелы по краям: `value.trim()`. Имя из одних пробелов — пустое.",
      "Телефон люди пишут по-разному: `+7 (900) 123-45-67`, `8 900 1234567`. Удобно оставить только цифры: `phone.replace(/\\D/g, '')` и проверить их количество.",
      "Для email хватает простой проверки: есть `@`, точка после неё и нет пробелов.",
      "Проверка в браузере — для удобства. Сервер всё равно проверяет данные сам, обойти браузерную проверку легко."
    ] },
    { p: "И про закон: если форма собирает имя и телефон, по 152-ФЗ нужна галочка согласия на обработку персональных данных и ссылка на политику. Ты это уже знаешь по Анастасии, теперь сможешь проверять согласие и в коде." },

    { h: 'Черновик в localStorage' },
    { code: [
      "localStorage.setItem('lead', JSON.stringify(data)); // хранит только строки",
      "const raw = localStorage.getItem('lead');           // строка или null",
      "let draft = null;",
      "try {",
      "  draft = raw ? JSON.parse(raw) : null;",
      "} catch (e) {",
      "  draft = null; // в хранилище мусор: не падаем",
      "}"
    ] },
    { p: "`JSON.parse` бросает ошибку на испорченной строке. Без `try/catch` один битый черновик сломает всю форму. В задачах хранилище передаётся параметром `storage`: в настоящем коде туда передают `localStorage`, а в тестах — подделку с теми же методами." },

    { h: 'Как догадаться' },
    { list: [
      "Отправка без перезагрузки — `submit`, `preventDefault`, `fetch`.",
      "Ответ сервера может быть ошибкой — проверяй `res.ok`.",
      "Сохранить между визитами — `localStorage` и `JSON.stringify`/`JSON.parse` в `try`."
    ] }
  ],
  quiz: [
    {
      q: "Что вернёт `Object.fromEntries(new FormData(form))` для неотмеченного чекбокса `agree`?",
      options: ["`{ agree: false }`", "В объекте не будет ключа `agree`", "`{ agree: 'off' }`"],
      answer: 1,
      explain: "Неотмеченные чекбоксы в `FormData` не попадают. Отмеченный придёт как `'on'`."
    },
    {
      q: "Сервер ответил 500. Что сделает `await fetch(url)`?",
      options: ["Бросит ошибку", "Вернёт ответ с `res.ok === false`", "Вернёт `null`"],
      answer: 1,
      explain: "`fetch` отклоняется только при сетевой ошибке. Статус нужно проверять самому."
    },
    {
      q: "Зачем `event.preventDefault()` в обработчике `submit`?",
      options: ["Чтобы браузер не отправил форму сам и не перезагрузил страницу", "Чтобы проверить поля", "Чтобы очистить форму"],
      answer: 0,
      explain: "По умолчанию браузер отправляет форму и открывает ответ как новую страницу. Мы отменяем это и отправляем сами через `fetch`."
    }
  ],
  tasks: [
    {
      id: 'validate',
      title: 'Проверка заявки',
      text: "Напиши функцию `validateForm(data)`. На входе объект `{ name, phone, email, agree }`. Верни объект ошибок, где есть только неправильные поля:\n\n`name`: после удаления пробелов по краям пусто → `'Укажите имя'`.\n`phone`: цифр не ровно 11 → `'Телефон должен содержать 11 цифр'`.\n`email`: не подходит под «текст без пробелов, @, текст без пробелов, точка, текст без пробелов» → `'Проверьте email'`.\n`agree` не `true` → `'Нужно согласие на обработку персональных данных'`.\n\nЕсли всё правильно, верни `{}`.",
      fn: 'validateForm',
      starter: ['function validateForm(data) {', '  // твой код', '}'],
      tests: [
        { args: [{ name: 'Иван', phone: '+7 (900) 123-45-67', email: 'ivan@mail.ru', agree: true }], expected: {} },
        { args: [{ name: '  ', phone: '123', email: 'ivan@', agree: false }], expected: { name: 'Укажите имя', phone: 'Телефон должен содержать 11 цифр', email: 'Проверьте email', agree: 'Нужно согласие на обработку персональных данных' } },
        { args: [{ name: ' Анна ', phone: '8 900 123 45 67', email: 'anna@yandex.ru', agree: true }], expected: {}, hidden: true },
        { args: [{ name: 'Олег', phone: '+7 900 123 45 678', email: 'oleg@mail.ru', agree: true }], expected: { phone: 'Телефон должен содержать 11 цифр' }, hidden: true },
        { args: [{ name: 'Олег', phone: '89001234567', email: 'o leg@mail.ru', agree: true }], expected: { email: 'Проверьте email' }, hidden: true },
        { args: [{ name: 'Олег', phone: '89001234567', email: 'oleg@mail.ru', agree: 'on' }], expected: { agree: 'Нужно согласие на обработку персональных данных' }, hidden: true }
      ],
      hints: [
        "Заведи `const errors = {}` и добавляй ключи только для неправильных полей.",
        "Цифры телефона: `data.phone.replace(/\\D/g, '').length`. Email: `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)`. Согласие: `data.agree !== true`."
      ],
      solution: [
        'function validateForm(data) {',
        '  const errors = {};',
        "  if (!data.name.trim()) errors.name = 'Укажите имя';",
        "  if (data.phone.replace(/\\D/g, '').length !== 11) errors.phone = 'Телефон должен содержать 11 цифр';",
        "  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) errors.email = 'Проверьте email';",
        "  if (data.agree !== true) errors.agree = 'Нужно согласие на обработку персональных данных';",
        '  return errors;',
        '}'
      ],
      explain: "`\\D` — любой символ, кроме цифры, поэтому скобки, пробелы, плюс и дефисы уходят разом. Согласие проверяем строго `!== true`: строка `'on'` из `FormData` — не то же самое, что отмеченная галочка в нашем объекте."
    },
    {
      id: 'read-form',
      dom: true,
      title: 'Прочитать форму',
      text: "Напиши функцию `readForm(form)`. Верни объект, где ключи — атрибуты `name` полей формы, а значения — `value` поля. Для чекбоксов значение — `true` или `false` (отмечен или нет). Элементы без `name`, например кнопку, пропускай.",
      fn: 'readForm',
      starter: ['function readForm(form) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const form = document.createElement('form'); form.innerHTML = '<input name="name" value="Иван"><input name="phone" value="+7 900"><select name="city"><option value="msk">Москва</option><option value="spb" selected>СПб</option></select><input type="checkbox" name="agree" checked><button>Отправить</button>'; return readForm(form); })()`, label: 'имя, телефон, select СПб, отмеченный чекбокс, кнопка', expected: { name: 'Иван', phone: '+7 900', city: 'spb', agree: true } },
        { code: `(() => { const form = document.createElement('form'); form.innerHTML = '<input name="name" value=""><input type="checkbox" name="agree">'; return readForm(form); })()`, label: 'пустое имя, чекбокс не отмечен', expected: { name: '', agree: false } },
        { code: `(() => { const form = document.createElement('form'); form.innerHTML = '<textarea name="comment">Перезвоните</textarea><input type="checkbox" name="news" checked><input type="checkbox" name="agree">'; return readForm(form); })()`, label: 'textarea и два чекбокса', expected: { comment: 'Перезвоните', news: true, agree: false }, hidden: true },
        { code: `(() => { const form = document.createElement('form'); form.innerHTML = '<input name="email" value="a@b.ru"><button name="">Ок</button><input type="submit" value="Отправить">'; return readForm(form); })()`, label: 'кнопки без name', expected: { email: 'a@b.ru' }, hidden: true }
      ],
      hints: [
        "`form.elements` — все поля формы. Перебери их циклом `for...of`.",
        "Пропускай `if (!el.name) continue`. Для `el.type === 'checkbox'` бери `el.checked`, для остальных `el.value`."
      ],
      solution: [
        'function readForm(form) {',
        '  const data = {};',
        '  for (const el of form.elements) {',
        '    if (!el.name) continue;',
        "    data[el.name] = el.type === 'checkbox' ? el.checked : el.value;",
        '  }',
        '  return data;',
        '}'
      ],
      explain: "Через `Object.fromEntries(new FormData(form))` неотмеченный чекбокс пропал бы, а отмеченный стал бы `'on'`. Явный перебор `form.elements` даёт полный контроль над типами значений."
    },
    {
      id: 'send-form',
      title: 'Отправить заявку',
      text: "Напиши асинхронную функцию `sendForm(url, data, fetchFn)`. Отправь `POST`-запрос через `fetchFn(url, options)`: заголовок `Content-Type: application/json`, тело — `data` в виде JSON. Если ответ не `ok`, брось ошибку с сообщением `'Ошибка ' + статус`. Иначе верни разобранный JSON ответа.\n\nВ настоящем коде вместо `fetchFn` передают `fetch`, в тестах — подделку с тем же поведением.",
      fn: 'sendForm',
      starter: ['async function sendForm(url, data, fetchFn) {', '  // твой код', '}'],
      tests: [
        { code: `(async () => { const calls = []; const fake = async (url, opts) => { calls.push([url, opts.method, opts.headers['Content-Type'], opts.body]); return { ok: true, status: 200, json: async () => ({ id: 7 }) }; }; const res = await sendForm('/api/lead', { name: 'Иван' }, fake); return [res, calls]; })()`, label: "sendForm('/api/lead', { name: 'Иван' }, fake) → [ответ, параметры вызова]", expected: [{ id: 7 }, [['/api/lead', 'POST', 'application/json', '{"name":"Иван"}']]] },
        { code: `sendForm('/api/lead', {}, async () => ({ ok: false, status: 500, json: async () => ({}) }))`, label: 'сервер ответил 500', expectedError: 'Ошибка 500' },
        { code: `sendForm('/x', {}, async () => ({ ok: false, status: 404, json: async () => ({ error: 'нет' }) }))`, label: 'сервер ответил 404', expectedError: 'Ошибка 404', hidden: true },
        { code: `sendForm('/x', {}, async () => { throw new Error('Нет сети'); })`, label: 'нет сети', expectedError: 'Нет сети', hidden: true },
        { code: `(async () => { let body; await sendForm('/x', { phone: '+7', agree: true }, async (u, o) => { body = JSON.parse(o.body); return { ok: true, status: 201, json: async () => null }; }); return body; })()`, label: 'тело запроса — правильный JSON', expected: { phone: '+7', agree: true }, hidden: true }
      ],
      hints: [
        "`const res = await fetchFn(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })`.",
        "`if (!res.ok) throw new Error('Ошибка ' + res.status)`, потом `return res.json()`."
      ],
      solution: [
        'async function sendForm(url, data, fetchFn) {',
        '  const res = await fetchFn(url, {',
        "    method: 'POST',",
        "    headers: { 'Content-Type': 'application/json' },",
        '    body: JSON.stringify(data)',
        '  });',
        "  if (!res.ok) throw new Error('Ошибка ' + res.status);",
        '  return res.json();',
        '}'
      ],
      explain: "Без проверки `res.ok` ответ 500 выглядел бы как успех, и пользователь думал бы, что заявка ушла. Ошибку сети ловить внутри не нужно: она сама пройдёт наружу, и вызывающий код покажет сообщение."
    },
    {
      id: 'draft',
      title: 'Черновик формы',
      text: "Напиши функцию `createDraft(storage, key)`, которая возвращает объект с тремя методами:\n\n`save(data)` — сохранить объект в `storage` под ключом `key` в виде JSON;\n`load()` — вернуть сохранённый объект, а если ничего нет или там испорченная строка, вернуть `null`;\n`clear()` — удалить черновик.\n\n`storage` устроен как `localStorage`: `getItem`, `setItem`, `removeItem`.",
      fn: 'createDraft',
      starter: ['function createDraft(storage, key) {', '  // твой код', '}'],
      tests: [
        { code: `(() => { const m = new Map(); const storage = { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; const d = createDraft(storage, 'lead'); d.save({ name: 'Иван', agree: true }); return [d.load(), m.get('lead')]; })()`, label: "save({ name: 'Иван', agree: true }) → [load(), что лежит в storage]", expected: [{ name: 'Иван', agree: true }, '{"name":"Иван","agree":true}'] },
        { code: `(() => { const m = new Map(); const storage = { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; return createDraft(storage, 'lead').load(); })()`, label: 'load() без сохранения', expected: null },
        { code: `(() => { const m = new Map([['lead', '{oops']]); const storage = { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; return createDraft(storage, 'lead').load(); })()`, label: 'в storage испорченная строка', expected: null, hidden: true },
        { code: `(() => { const m = new Map(); const storage = { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; const d = createDraft(storage, 'lead'); d.save({ a: 1 }); d.clear(); return [d.load(), m.size]; })()`, label: 'save, clear, load', expected: [null, 0], hidden: true },
        { code: `(() => { const m = new Map(); const storage = { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; const a = createDraft(storage, 'a'); const b = createDraft(storage, 'b'); a.save({ x: 1 }); b.save({ x: 2 }); return [a.load(), b.load()]; })()`, label: 'два черновика с разными ключами', expected: [{ x: 1 }, { x: 2 }], hidden: true }
      ],
      hints: [
        "Верни объект с методами: `return { save(data) { ... }, load() { ... }, clear() { ... } }`. `storage` и `key` будут доступны внутри благодаря замыканию.",
        "В `load`: `const raw = storage.getItem(key); if (raw === null) return null;` и `JSON.parse(raw)` внутри `try`, в `catch` верни `null`."
      ],
      solution: [
        'function createDraft(storage, key) {',
        '  return {',
        '    save(data) {',
        '      storage.setItem(key, JSON.stringify(data));',
        '    },',
        '    load() {',
        '      const raw = storage.getItem(key);',
        '      if (raw === null) return null;',
        '      try {',
        '        return JSON.parse(raw);',
        '      } catch (e) {',
        '        return null;',
        '      }',
        '    },',
        '    clear() {',
        '      storage.removeItem(key);',
        '    }',
        '  };',
        '}'
      ],
      explain: "`localStorage` хранит только строки: если записать объект без `JSON.stringify`, сохранится `'[object Object]'`. Испорченная строка в хранилище бывает чаще, чем кажется (старая версия сайта, ручная правка), и `try/catch` защищает форму от падения."
    }
  ]
};

JSP_COURSE.lessons['network'] = {
  title: 'Браузер и сеть',
  theory: [
    { h: 'Что происходит, когда вводишь адрес сайта' },
    { p: "Это любимый вопрос на собеседованиях. Коротко:" },
    { list: [
      "DNS: браузер узнаёт IP-адрес сервера по домену. Ты это видел, когда настраивал домен на хостинге и ждал, пока «обновятся DNS».",
      "Соединение: TCP, а для https ещё и TLS — обмен ключами шифрования, тот самый SSL-сертификат.",
      "HTTP-запрос: метод, адрес, заголовки. Сервер отвечает статусом, заголовками и телом (HTML).",
      "Браузер разбирает HTML и строит DOM, загружает CSS и строит CSSOM, выполняет скрипты.",
      "Раскладка (layout) и отрисовка: вычисляются размеры и положение элементов, пиксели выводятся на экран."
    ] },

    { h: 'Методы HTTP' },
    { list: [
      "`GET` — получить данные. Параметры в адресе после `?`. Не должен ничего менять на сервере.",
      "`POST` — отправить данные: заявка, заказ. Данные в теле запроса.",
      "`PUT` и `PATCH` — заменить или частично изменить запись.",
      "`DELETE` — удалить."
    ] },

    { h: 'Коды ответа' },
    { list: [
      "1xx — информация (встречается редко).",
      "2xx — успех: `200 OK`, `201 Created` (создано), `204 No Content` (успех без тела).",
      "3xx — перенаправление: `301` (навсегда, важно для SEO при переезде сайта), `302` (временно), `304 Not Modified` (возьми из кэша).",
      "4xx — ошибка клиента: `400` (неверный запрос), `401` (нужно войти), `403` (вошёл, но нельзя), `404` (не найдено), `429` (слишком много запросов).",
      "5xx — ошибка сервера: `500` (упал код, например фатальная ошибка PHP в теме), `502` и `504` (проблемы между прокси и сервером), `503` (сервер недоступен)."
    ] },

    { h: 'Адрес и параметры' },
    { code: [
      "// https://site.ru:443/catalog/?q=кот&page=2#reviews",
      "// протокол  домен  порт  путь      параметры        якорь",
      "",
      "encodeURIComponent('кот и пёс'); // '%D0%BA%D0%BE%D1%82%20%D0%B8%20...'",
      "decodeURIComponent('%D0%BA%D0%BE%D1%82'); // 'кот'"
    ] },
    { p: "Значения в адресе кодируют через `encodeURIComponent`: пробел, `&`, `=`, кириллица иначе сломают адрес. Например, `&` внутри значения браузер примет за начало следующего параметра." },

    { h: 'Где хранить данные в браузере' },
    { list: [
      "Cookie — маленькие строки, которые браузер сам отправляет на сервер с каждым запросом. Для входа в аккаунт (сессия). Строка `document.cookie` выглядит как `name=value; other=value2`.",
      "`localStorage` — до ~5 МБ, живёт без срока, на сервер не уходит.",
      "`sessionStorage` — как `localStorage`, но очищается при закрытии вкладки."
    ] },

    { h: 'CORS и кэш' },
    { p: "CORS: если страница с `site.ru` делает `fetch` на `api.other.ru`, браузер покажет ответ странице только если сервер разрешил это заголовком `Access-Control-Allow-Origin`. Это защита в браузере, а не на сервере: тот же запрос из Postman пройдёт. Ошибка CORS решается на сервере, а не в коде страницы." },
    { p: "Кэш: заголовок `Cache-Control: max-age=31536000` разрешает браузеру год не перезапрашивать файл. Поэтому к стилям и скриптам добавляют версию, `style.css?ver=1.2`, как делает WordPress: новая версия — новый адрес, кэш не мешает." }
  ],
  quiz: [
    {
      q: "Пользователь вошёл в аккаунт, но открывает чужую админку. Какой код ответа правильный?",
      options: ["`401`", "`403`", "`404`"],
      answer: 1,
      explain: "`401` — «ты не вошёл», `403` — «вошёл, но тебе сюда нельзя»."
    },
    {
      q: "Сайт переехал на новый домен навсегда. Какой редирект настроить?",
      options: ["`301`", "`302`", "`500`"],
      answer: 0,
      explain: "`301` говорит поисковикам «навсегда», и они переносят позиции на новый адрес. `302` — временный."
    },
    {
      q: "Что уходит на сервер с каждым запросом автоматически?",
      options: ["`localStorage`", "Cookie", "`sessionStorage`"],
      answer: 1,
      explain: "Cookie браузер прикладывает сам. Хранилища `localStorage` и `sessionStorage` остаются в браузере."
    },
    {
      q: "Где исправляют ошибку CORS?",
      options: ["В JavaScript на странице", "На сервере, который отдаёт данные: он должен разрешить домен заголовком", "В настройках браузера пользователя"],
      answer: 1,
      explain: "Решение принимает сервер через `Access-Control-Allow-Origin`. Код страницы это не обойдёт."
    }
  ],
  tasks: [
    {
      id: 'status-group',
      title: 'Что значит код ответа',
      text: "Напиши функцию `statusGroup(code)`, которая по коду HTTP-ответа возвращает группу: `'информация'` (100–199), `'успех'` (200–299), `'перенаправление'` (300–399), `'ошибка клиента'` (400–499), `'ошибка сервера'` (500–599). Для остальных чисел верни `'неизвестно'`.",
      fn: 'statusGroup',
      starter: ['function statusGroup(code) {', '  // твой код', '}'],
      tests: [
        { args: [200], expected: 'успех' },
        { args: [301], expected: 'перенаправление' },
        { args: [404], expected: 'ошибка клиента' },
        { args: [503], expected: 'ошибка сервера' },
        { args: [100], expected: 'информация', hidden: true },
        { args: [299], expected: 'успех', hidden: true },
        { args: [600], expected: 'неизвестно', hidden: true },
        { args: [99], expected: 'неизвестно', hidden: true }
      ],
      hints: [
        "Первая цифра кода — его группа: `Math.floor(code / 100)`.",
        "Сопоставь цифру с названием через массив или объект, а для чисел вне 100–599 верни `'неизвестно'`."
      ],
      solution: [
        'function statusGroup(code) {',
        "  const groups = { 1: 'информация', 2: 'успех', 3: 'перенаправление', 4: 'ошибка клиента', 5: 'ошибка сервера' };",
        "  return groups[Math.floor(code / 100)] || 'неизвестно';",
        '}'
      ],
      explain: "Группу определяет первая цифра. Таблица вместо цепочки `if` короче и не даёт ошибиться в границах вроде 299 и 300."
    },
    {
      id: 'build-query',
      title: 'Параметры для адреса',
      text: "Напиши функцию `buildQuery(params)`, которая собирает строку параметров для адреса. Ключи и значения кодируй через `encodeURIComponent`. Значения `null` и `undefined` пропускай. Если значение — массив, повтори ключ для каждого элемента. Если параметров нет, верни пустую строку, иначе строку с `?` в начале.",
      fn: 'buildQuery',
      starter: ['function buildQuery(params) {', '  // твой код', '}'],
      tests: [
        { args: [{ page: 2, sort: 'price' }], expected: '?page=2&sort=price' },
        { args: [{}], expected: '' },
        { args: [{ q: 'кот и пёс' }], expected: '?q=%D0%BA%D0%BE%D1%82%20%D0%B8%20%D0%BF%D1%91%D1%81' },
        { args: [{ a: null, b: undefined, c: 0 }], expected: '?c=0', hidden: true },
        { args: [{ tag: ['js', 'css'] }], expected: '?tag=js&tag=css', hidden: true },
        { args: [{ 'a b': 'x&y=z' }], expected: '?a%20b=x%26y%3Dz', hidden: true },
        { args: [{ a: null }], expected: '', hidden: true }
      ],
      hints: [
        "Собирай пары в массив `parts`, каждая пара — `encodeURIComponent(key) + '=' + encodeURIComponent(value)`.",
        "Для массива пройди по элементам. В конце `parts.length ? '?' + parts.join('&') : ''`. Проверка на `null` и `undefined` разом: `value == null`."
      ],
      solution: [
        'function buildQuery(params) {',
        '  const parts = [];',
        '  for (const [key, value] of Object.entries(params)) {',
        '    if (value == null) continue;',
        '    const values = Array.isArray(value) ? value : [value];',
        '    for (const v of values) {',
        "      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));",
        '    }',
        '  }',
        "  return parts.length ? '?' + parts.join('&') : '';",
        '}'
      ],
      explain: "Без кодирования значение `x&y=z` превратилось бы в два параметра. `value == null` ловит и `null`, и `undefined`, но пропускает `0` и пустую строку. Это редкий случай, где нестрогое сравнение уместно. `URLSearchParams` кодирует пробел как `+`, поэтому здесь собираем вручную."
    },
    {
      id: 'parse-cookies',
      title: 'Разобрать cookie',
      text: "Напиши функцию `parseCookies(str)`, которая превращает строку вида `document.cookie` в объект. Пары разделены `;`, пробелы вокруг пар и имён не учитываются. Значение — всё после первого `=`, его надо раскодировать через `decodeURIComponent`. Пара без `=` даёт пустое значение. Пустая строка даёт `{}`.",
      fn: 'parseCookies',
      starter: ['function parseCookies(str) {', '  // твой код', '}'],
      tests: [
        { args: ['theme=dark; lang=ru'], expected: { theme: 'dark', lang: 'ru' } },
        { args: [''], expected: {} },
        { args: ['name=%D0%98%D0%B2%D0%B0%D0%BD'], expected: { name: 'Иван' } },
        { args: ['token=abc=def; x=1'], expected: { token: 'abc=def', x: '1' }, hidden: true },
        { args: ['  a=1 ;b=2 '], expected: { a: '1', b: '2' }, hidden: true },
        { args: ['flag'], expected: { flag: '' }, hidden: true }
      ],
      hints: [
        "`str.split(';')`, у каждой части `trim()`, пустые пропускай.",
        "Ищи первый `=` через `indexOf`: имя — до него, значение — после. Если `=` нет (`-1`), значение пустое."
      ],
      solution: [
        'function parseCookies(str) {',
        '  const result = {};',
        "  for (const part of str.split(';')) {",
        '    const pair = part.trim();',
        '    if (!pair) continue;',
        "    const i = pair.indexOf('=');",
        '    if (i === -1) {',
        "      result[pair] = '';",
        '      continue;',
        '    }',
        '    result[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());',
        '  }',
        '  return result;',
        '}'
      ],
      explain: "`pair.split('=')` разрезал бы `abc=def` на части и потерял хвост значения. Поиск первого `=` через `indexOf` надёжнее. Значения cookie часто кодируют, поэтому `decodeURIComponent` обязателен."
    }
  ]
};

JSP_COURSE.lessons['layout'] = {
  title: 'Вёрстка: что спрашивают на тесте',
  theory: [
    { h: 'Блочная модель' },
    { p: "Каждый элемент — прямоугольник: содержимое, вокруг `padding`, потом `border`, снаружи `margin`. По умолчанию (`box-sizing: content-box`) `width` задаёт только содержимое, и padding с рамкой прибавляются к нему. С `box-sizing: border-box` `width` — это вся ширина вместе с padding и рамкой. Поэтому почти все сайты начинают CSS с `* { box-sizing: border-box; }`." },
    { code: [
      "/* content-box: на экране 100 + 2×10 + 2×1 = 122px */",
      ".a { width: 100px; padding: 10px; border: 1px solid; }",
      "/* border-box: на экране ровно 100px */",
      ".b { width: 100px; padding: 10px; border: 1px solid; box-sizing: border-box; }"
    ] },
    { note: "Вертикальные `margin` соседних блоков схлопываются: между блоками с `margin-bottom: 20px` и `margin-top: 30px` будет 30px, а не 50. Во flex и grid этого нет." },

    { h: 'Специфичность: какое правило победит' },
    { p: "Если к элементу подходят несколько правил, побеждает более специфичное. Специфичность считают тремя числами (a, b, c):" },
    { list: [
      "a — количество `#id`;",
      "b — классы `.class`, атрибуты `[type=\"text\"]` и псевдоклассы `:hover`, `:first-child`;",
      "c — теги `div`, `p` и псевдоэлементы `::before`."
    ] },
    { p: "Сравнивают слева направо: один id сильнее любого числа классов. При равенстве побеждает правило, которое стоит ниже в CSS. Стиль в атрибуте `style` сильнее селекторов, а `!important` сильнее всего, поэтому его используют только в крайнем случае — например, когда тему WordPress иначе не перебить." },
    { code: [
      "ul li            /* (0, 0, 2) */",
      "#nav .item a     /* (1, 1, 1) */",
      "a:hover          /* (0, 1, 1) */",
      "p::before        /* (0, 0, 2) */",
      "*                /* (0, 0, 0) — звёздочка и комбинаторы > + ~ не считаются */"
    ] },

    { h: 'Позиционирование' },
    { list: [
      "`static` — обычный поток, по умолчанию.",
      "`relative` — сдвиг от своего места, место в потоке сохраняется. Часто ставят родителю, чтобы внутри работал `absolute`.",
      "`absolute` — выпадает из потока и позиционируется от ближайшего предка с `position`, отличным от `static`.",
      "`fixed` — от окна браузера, не прокручивается (шапка, кнопка «наверх»).",
      "`sticky` — ведёт себя как обычный, пока не доскроллили до порога, потом прилипает."
    ] },
    { p: "`z-index` работает только у позиционированных элементов (и у детей flex/grid) и только внутри одного «контекста наложения». Если поп-ап не поднимается выше шапки, часто дело в том, что у родителя свой `z-index` или `transform`." },

    { h: 'Flex и Grid' },
    { code: [
      ".row { display: flex; justify-content: space-between; align-items: center; gap: 16px; }",
      "/* justify-content — по главной оси (в строку — по горизонтали), align-items — по поперечной */",
      ".item { flex: 1; } /* делят свободное место поровну */",
      "",
      ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }",
      ".cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }",
      "/* колонок столько, сколько влезет по 240px, адаптив без медиазапросов */"
    ] },
    { p: "Flex — для одного направления: строка кнопок, шапка, выравнивание по центру. Grid — для двух направлений сразу: сетка карточек, макет страницы." },

    { h: 'Единицы и адаптив' },
    { list: [
      "`px` — фиксированные пиксели.",
      "`%` — от размера родителя.",
      "`em` — от размера шрифта самого элемента (для `font-size` — от родителя).",
      "`rem` — от размера шрифта `html`, обычно 16px. Удобно для отступов и шрифтов.",
      "`vw`, `vh` — проценты ширины и высоты окна."
    ] },
    { p: "Mobile first: базовые стили пишут для телефона, а для экранов пошире добавляют `@media (min-width: 768px) { ... }`." }
  ],
  quiz: [
    {
      q: "Чему равна видимая ширина блока: `width: 200px; padding: 20px; border: 2px solid;` при `box-sizing: border-box`?",
      options: ["`200px`", "`244px`", "`240px`"],
      answer: 0,
      explain: "При `border-box` padding и рамка входят в `width`. При `content-box` было бы 200 + 40 + 4 = 244px."
    },
    {
      q: "Что победит для `<a id=\"buy\" class=\"btn\">`: `.btn.big.red { color: red }` или `#buy { color: green }`?",
      options: ["Красный: три класса", "Зелёный: id сильнее любого числа классов", "То, что ниже в файле"],
      answer: 1,
      explain: "Специфичность (1, 0, 0) больше (0, 3, 0): сравнение начинается с числа id."
    },
    {
      q: "От чего позиционируется `position: absolute`?",
      options: ["Всегда от окна браузера", "От ближайшего предка с `position`, отличным от `static`", "Всегда от родителя"],
      answer: 1,
      explain: "Поэтому родителю обычно ставят `position: relative`. Если таких предков нет, отсчёт идёт от начального блока страницы."
    },
    {
      q: "Что делает `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`?",
      options: ["Ровно 4 колонки по 240px", "Столько колонок, сколько влезет шириной от 240px, они растягиваются на всю ширину", "Одну колонку 240px"],
      answer: 1,
      explain: "Популярный приём для адаптивной сетки карточек без медиазапросов."
    },
    {
      q: "У `html` размер шрифта 16px, у родителя 20px. Чему равен `margin: 2rem` у элемента?",
      options: ["`40px`", "`32px`", "`2px`"],
      answer: 1,
      explain: "`rem` всегда считается от шрифта `html`, родитель не влияет."
    }
  ],
  tasks: [
    {
      id: 'specificity',
      title: 'Посчитать специфичность',
      text: "Напиши функцию `specificity(selector)`, которая возвращает массив `[a, b, c]`: `a` — число `#id`, `b` — число классов, атрибутов `[...]` и псевдоклассов (`:hover`), `c` — число тегов и псевдоэлементов (`::before`). Звёздочка `*` и комбинаторы (пробел, `>`, `+`, `~`) не считаются. Псевдоклассы со скобками вроде `:not()` в тестах не встретятся.",
      fn: 'specificity',
      starter: ['function specificity(selector) {', '  // твой код', '}'],
      tests: [
        { args: ['ul li'], expected: [0, 0, 2] },
        { args: ['#nav .item a'], expected: [1, 1, 1] },
        { args: ['a:hover'], expected: [0, 1, 1] },
        { args: ['p::before'], expected: [0, 0, 2], hidden: true },
        { args: ['input[type="text"]'], expected: [0, 1, 1], hidden: true },
        { args: ['*'], expected: [0, 0, 0], hidden: true },
        { args: ['div.card.active > h2 + p'], expected: [0, 2, 3], hidden: true },
        { args: ['a[href$=".pdf"]'], expected: [0, 1, 1], hidden: true },
        { args: ['#header#main .x'], expected: [2, 1, 0], hidden: true }
      ],
      hints: [
        "Сначала вырежи атрибуты `[...]` и посчитай их в `b`: внутри них могут быть точки и решётки, которые собьют подсчёт.",
        "Потом пройди регулярным выражением по частям: `#имя`, `.имя`, `::имя`, `:имя` и просто `имя` (тег). Порядок проверок важен: `::` проверь раньше `:`."
      ],
      solution: [
        'function specificity(selector) {',
        '  let a = 0;',
        '  let b = 0;',
        '  let c = 0;',
        "  const rest = selector.replace(/\\[[^\\]]*\\]/g, () => { b++; return ' '; });",
        '  for (const [token] of rest.matchAll(/#[\\w-]+|\\.[\\w-]+|::[\\w-]+|:[\\w-]+|[a-zA-Z][\\w-]*/g)) {',
        "    if (token[0] === '#') a++;",
        "    else if (token.startsWith('::')) c++;",
        "    else if (token[0] === '.' || token[0] === ':') b++;",
        '    else c++;',
        '  }',
        '  return [a, b, c];',
        '}'
      ],
      explain: "Если не вырезать атрибуты заранее, точка в `\".pdf\"` посчитается как класс, а `pdf` — как тег. Псевдоэлемент `::before` идёт в `c`, а псевдокласс `:hover` в `b`: это частый вопрос на тестах."
    },
    {
      id: 'winner',
      title: 'Какое правило победит',
      text: "Напиши функцию `winner(first, second)`. Оба аргумента — селекторы, `second` стоит в CSS ниже. Верни селектор, правило которого применится: с большей специфичностью, а при равенстве — `second`. Подсчёт специфичности такой же, как в прошлой задаче, напиши его внутри решения.",
      fn: 'winner',
      starter: ['function winner(first, second) {', '  // твой код', '}'],
      tests: [
        { args: ['#buy', '.btn.big.red'], expected: '#buy' },
        { args: ['.menu a', 'nav a'], expected: '.menu a' },
        { args: ['p', 'p'], expected: 'p' },
        { args: ['.a', '.b'], expected: '.b', hidden: true },
        { args: ['ul li a', '.link'], expected: '.link', hidden: true },
        { args: ['a:hover', 'a.btn'], expected: 'a.btn', hidden: true },
        { args: ['div p span em', 'p.text'], expected: 'p.text', hidden: true },
        { args: ['.note', 'html body div main section article div ul li a span'], expected: '.note', hidden: true },
        { args: ['a:hover', 'a'], expected: 'a:hover', hidden: true }
      ],
      hints: [
        "Скопируй подсчёт специфичности в отдельную функцию внутри или рядом с `winner`.",
        "Сравни массивы по очереди: сначала `a`, если равны — `b`, потом `c`. Если всё равно, побеждает `second`."
      ],
      solution: [
        'function winner(first, second) {',
        '  const spec = (selector) => {',
        '    let a = 0;',
        '    let b = 0;',
        '    let c = 0;',
        "    const rest = selector.replace(/\\[[^\\]]*\\]/g, () => { b++; return ' '; });",
        '    for (const [token] of rest.matchAll(/#[\\w-]+|\\.[\\w-]+|::[\\w-]+|:[\\w-]+|[a-zA-Z][\\w-]*/g)) {',
        "      if (token[0] === '#') a++;",
        "      else if (token.startsWith('::')) c++;",
        "      else if (token[0] === '.' || token[0] === ':') b++;",
        '      else c++;',
        '    }',
        '    return [a, b, c];',
        '  };',
        '  const x = spec(first);',
        '  const y = spec(second);',
        '  for (let i = 0; i < 3; i++) {',
        '    if (x[i] !== y[i]) return x[i] > y[i] ? first : second;',
        '  }',
        '  return second;',
        '}'
      ],
      explain: "Специфичность сравнивают не суммой, а по разрядам: `div p span em` — это (0, 0, 4), а `p.text` — (0, 1, 1), и один класс перевешивает любое число тегов. Когда стиль темы WordPress «не применяется», почти всегда причина в этом."
    }
  ]
};

// Новые уроки — в этап «DOM и события» вместо списка тем
(function () {
  const m = JSP_COURSE.modules.find(x => x.id === 'dom');
  if (m) {
    delete m.topics;
    m.title = 'Основы фронтенда к тесту Т-Банка';
    m.period = '3–9 ноября, перед тестом 10–12 ноября';
    m.lessons = ['dom-basics', 'events', 'forms', 'network', 'layout'];
  }
  const plan = JSP_COURSE.plan;
  if (plan) {
    plan.title = 'План подготовки к отбору Т-Банка';
    plan.steps = plan.steps.concat([
      { id: 'dom-basics', lesson: 'dom-basics' },
      { id: 'events', lesson: 'events' },
      { id: 'forms', lesson: 'forms' },
      { id: 'network', lesson: 'network' },
      { id: 'layout', lesson: 'layout' },
      { id: 'front-test', quiz: 'front-test' }
    ]);
  }
})();

// Пробный тест по основам фронтенда: вопросы с выбором ответа на время
JSP_COURSE.quizzes = [
  {
    id: 'front-test',
    title: 'Пробный тест по основам фронтенда',
    minutes: 40,
    topics: { html: 'HTML', css: 'CSS', js: 'JavaScript', dom: 'DOM и события', net: 'Браузер и сеть' },
    questions: [
      { topic: 'html', q: "Чем `<title>` отличается от `<h1>`?", options: ["Ничем, это синонимы", "`<title>` — текст во вкладке браузера и в поисковой выдаче, `<h1>` — главный заголовок на самой странице", "`<title>` — подпись к картинке"], answer: 1, explain: "`<title>` живёт в `<head>` и на странице не виден. `<h1>` — видимый главный заголовок, обычно один на странице." },
      { topic: 'html', q: "Зачем картинке атрибут `alt`?", options: ["Это всплывающая подсказка при наведении", "Описание для программ чтения с экрана и для случая, когда картинка не загрузилась", "Подпись под картинкой"], answer: 1, explain: "`alt` нужен для доступности и SEO. Всплывающую подсказку даёт `title`." },
      { topic: 'html', q: "Как правильно связать подпись с полем ввода?", options: ["`<label for=\"email\">` и `<input id=\"email\">`", "`<label name=\"email\">` и `<input name=\"email\">`", "Поставить их рядом в одном `div`"], answer: 0, explain: "`for` указывает на `id` поля. Клик по подписи ставит фокус в поле, скринридер читает подпись." },
      { topic: 'html', q: "Какой элемент правильнее для кнопки отправки формы?", options: ["`<div onclick=\"send()\">`", "`<a href=\"#\">`", "`<button type=\"submit\">`"], answer: 2, explain: "`button` доступен с клавиатуры, отправляет форму по Enter и понятен скринридерам. `div` ничего этого не умеет." },
      { topic: 'html', q: "Какой тег предназначен для основного уникального содержимого страницы?", options: ["`<main>`", "`<section>`", "`<div id=\"main\">`"], answer: 0, explain: "`main` — одна на странице область основного содержимого. `section` — тематический раздел, их может быть много." },
      { topic: 'html', q: "Что делает атрибут `defer` у `<script src=\"app.js\">`?", options: ["Скрипт выполняется сразу, как только скачается", "Скрипт скачивается параллельно и выполняется после разбора HTML, по порядку", "Скрипт выполняется только после клика"], answer: 1, explain: "`defer` сохраняет порядок скриптов и не блокирует разбор страницы. `async` выполняет скрипт сразу по готовности, порядок не гарантирован." },

      { topic: 'css', q: "Какой будет видимая ширина блока при `box-sizing: content-box`?", code: [".box { width: 100px; padding: 10px; border: 1px solid; }"], options: ["`100px`", "`122px`", "`111px`"], answer: 1, explain: "Содержимое 100px, слева и справа по 10px padding и по 1px рамки: 100 + 20 + 2." },
      { topic: 'css', q: "Что меняет `box-sizing: border-box`?", options: ["`width` включает padding и рамку", "Убирает рамку", "`width` включает margin"], answer: 0, explain: "С `border-box` заданная ширина — это ширина вместе с padding и border. Margin в неё не входит никогда." },
      { topic: 'css', q: "Каким будет цвет текста у `<p id=\"x\" class=\"t\">`?", code: ["#x { color: red; }", "p.t { color: blue; }", ".t { color: green; }"], options: ["Красным", "Синим", "Зелёным"], answer: 0, explain: "У `#x` специфичность (1, 0, 0), у `p.t` — (0, 1, 1), у `.t` — (0, 1, 0). Id сильнее." },
      { topic: 'css', q: "Два правила с одинаковой специфичностью задают разный цвет. Какое применится?", options: ["Первое в файле", "То, что ниже в CSS", "Браузер выберет случайно"], answer: 1, explain: "При равной специфичности побеждает правило, объявленное позже." },
      { topic: 'css', q: "От чего отсчитывается `position: absolute`?", options: ["От ближайшего предка с `position`, отличным от `static`", "Всегда от родителя", "Всегда от окна браузера"], answer: 0, explain: "Поэтому родителю ставят `position: relative`. От окна отсчитывается `fixed`." },
      { topic: 'css', q: "Чем `display: none` отличается от `visibility: hidden`?", options: ["Ничем", "`display: none` убирает элемент вместе с местом, `visibility: hidden` прячет, но место остаётся", "`visibility: hidden` удаляет элемент из DOM"], answer: 1, explain: "Оба способа оставляют элемент в DOM. Разница в том, занимает ли он место на странице." },
      { topic: 'css', q: "В контейнере `display: flex` (по умолчанию в строку) за что отвечает `justify-content: center`?", options: ["Выравнивание по горизонтали, вдоль главной оси", "Выравнивание по вертикали", "Выравнивание текста внутри элементов"], answer: 0, explain: "`justify-content` — главная ось, `align-items` — поперечная. При `flex-direction: column` оси меняются местами." },
      { topic: 'css', q: "Что произойдёт, если трём flex-элементам задать `flex: 1`?", options: ["Каждый станет шириной 1px", "Они поделят свободное место поровну", "Первый займёт всё место"], answer: 1, explain: "`flex: 1` — это `flex-grow: 1` с нулевой базой, поэтому элементы получают равные доли." },
      { topic: 'css', q: "Что создаёт `grid-template-columns: repeat(3, 1fr)`?", options: ["Три колонки равной ширины", "Три строки", "Одну колонку шириной 3fr"], answer: 0, explain: "`1fr` — одна доля свободного места, три колонки по доле — три равные колонки." },
      { topic: 'css', q: "У `html` шрифт 16px, у родителя 20px. Чему равно `2rem`?", options: ["`40px`", "`32px`", "`2em`"], answer: 1, explain: "`rem` считается от шрифта корневого элемента `html`." },
      { topic: 'css', q: "Когда применятся стили внутри `@media (min-width: 768px)`?", options: ["На экранах уже 768px", "На экранах от 768px и шире", "Только на экране ровно 768px"], answer: 1, explain: "`min-width` — «не меньше». Это основа подхода mobile first." },

      { topic: 'js', q: "Что вернёт `typeof null`?", options: ["`'null'`", "`'object'`", "`'undefined'`"], answer: 1, explain: "Это историческая ошибка языка, её оставили ради совместимости. Проверять `null` нужно через `=== null`." },
      { topic: 'js', q: "Чему равно `0.1 + 0.2 === 0.3`?", options: ["`true`", "`false`"], answer: 1, explain: "Дробные числа хранятся в двоичном виде неточно: `0.1 + 0.2` даёт `0.30000000000000004`. Деньги считают в копейках целыми числами." },
      { topic: 'js', q: "Что выведет код?", code: ["console.log('5' + 3, '5' - 3);"], options: ["`8 2`", "`'53' 2`", "`53 '2'`"], answer: 1, explain: "`+` со строкой склеивает, а `-` работает только с числами и приводит строку к числу." },
      { topic: 'js', q: "Что выведет код?", code: ["for (var i = 0; i < 3; i++) {", "  setTimeout(() => console.log(i));", "}"], options: ["`0 1 2`", "`3 3 3`", "`undefined` три раза"], answer: 1, explain: "`var` — одна переменная на весь цикл, к моменту срабатывания таймеров она уже 3. С `let` у каждой итерации своя `i`, и вывод был бы `0 1 2`." },
      { topic: 'js', q: "Чем `===` отличается от `==`?", options: ["`===` сравнивает без приведения типов", "`===` работает только с числами", "Ничем"], answer: 0, explain: "`'1' == 1` — `true`, а `'1' === 1` — `false`. В коде почти всегда используют `===`." },
      { topic: 'js', q: "Что выведет код?", code: ["function makeCounter() {", "  let n = 0;", "  return () => ++n;", "}", "const c = makeCounter();", "c();", "console.log(c());"], options: ["`1`", "`2`", "`0`"], answer: 1, explain: "Замыкание: функция помнит свою `n` между вызовами. Первый вызов дал 1, второй — 2." },
      { topic: 'js', q: "В каком порядке выведутся числа?", code: ["console.log(1);", "setTimeout(() => console.log(2));", "Promise.resolve().then(() => console.log(3));", "console.log(4);"], options: ["`1 2 3 4`", "`1 4 3 2`", "`1 4 2 3`"], answer: 1, explain: "Сначала весь синхронный код (1, 4), потом микрозадачи — промисы (3), потом макрозадачи — таймеры (2)." },
      { topic: 'js', q: "Что вернёт выражение?", code: ["[1, 2, 3].map(x => x * 2).filter(x => x > 2)"], options: ["`[4, 6]`", "`[2, 4, 6]`", "`[3]`"], answer: 0, explain: "`map` даёт `[2, 4, 6]`, `filter` оставляет больше двух." },
      { topic: 'js', q: "Можно ли выполнить `obj.a = 2`, если объявлено `const obj = { a: 1 }`?", options: ["Нет, будет ошибка", "Да: `const` запрещает переприсвоить переменную, но не менять объект", "Да, но значение не изменится"], answer: 1, explain: "Ошибкой будет только `obj = {}`. Чтобы запретить изменение самого объекта, есть `Object.freeze`." },
      { topic: 'js', q: "Что делает `const b = { ...a }`?", options: ["Глубокую копию со всеми вложенными объектами", "Поверхностную копию: вложенные объекты остаются общими", "Ссылку на тот же объект"], answer: 1, explain: "Копируются только свойства верхнего уровня. Глубокую копию делает `structuredClone(a)`." },

      { topic: 'dom', q: "Чем `querySelector` отличается от `querySelectorAll`?", options: ["Первый находит первый подходящий элемент, второй — все (NodeList)", "Первый ищет по id, второй по классу", "Ничем"], answer: 0, explain: "Оба принимают любой CSS-селектор." },
      { topic: 'dom', q: "Как безопасно вывести на страницу текст, который ввёл пользователь?", options: ["`el.innerHTML = text`", "`el.textContent = text`", "`document.write(text)`"], answer: 1, explain: "`textContent` не разбирает HTML, поэтому чужой код не выполнится." },
      { topic: 'dom', q: "Обработчики `click` висят на кнопке и на `div`, в котором она лежит. В каком порядке они сработают при клике по кнопке?", options: ["Сначала `div`, потом кнопка", "Сначала кнопка, потом `div`", "Сработает только кнопка"], answer: 1, explain: "Событие всплывает от элемента вверх по предкам." },
      { topic: 'dom', q: "Чем `event.target` отличается от `event.currentTarget`?", options: ["`target` — элемент, где произошло событие, `currentTarget` — элемент, на котором висит обработчик", "Это одно и то же", "`currentTarget` — всегда `document`"], answer: 0, explain: "При делегировании `currentTarget` — список, а `target` — пункт или что-то внутри него." },
      { topic: 'dom', q: "Как не дать форме перезагрузить страницу при отправке?", options: ["`return false` в атрибуте `action`", "`event.preventDefault()` в обработчике `submit`", "Убрать кнопку отправки"], answer: 1, explain: "`preventDefault` отменяет действие браузера по умолчанию." },
      { topic: 'dom', q: "Главное преимущество делегирования событий?", options: ["Один обработчик на родителе работает и для элементов, добавленных позже", "События перестают всплывать", "Обработчики срабатывают раньше"], answer: 0, explain: "Новые элементы — дети того же родителя, их события всплывают к общему обработчику." },
      { topic: 'dom', q: "Чем `DOMContentLoaded` отличается от `load`?", options: ["Ничем", "`DOMContentLoaded` — HTML разобран и DOM готов, `load` — загрузились ещё и картинки, стили, шрифты", "`load` срабатывает раньше"], answer: 1, explain: "Для работы с элементами хватает `DOMContentLoaded`, ждать картинки не нужно." },

      { topic: 'net', q: "Чем ответ 401 отличается от 403?", options: ["401 — нужно войти, 403 — вошёл, но доступа нет", "Это одно и то же", "401 — сервер упал"], answer: 0, explain: "401 Unauthorized и 403 Forbidden — частый вопрос на тестах." },
      { topic: 'net', q: "Что означает ответ 301?", options: ["Временное перенаправление", "Постоянное перенаправление", "Не найдено"], answer: 1, explain: "301 — «переехал навсегда», поисковики переносят позиции. Временный — 302." },
      { topic: 'net', q: "Чем GET отличается от POST?", options: ["GET получает данные, параметры в адресе; POST отправляет данные в теле запроса", "POST быстрее", "GET нельзя использовать в формах"], answer: 0, explain: "GET не должен ничего менять на сервере, его можно кэшировать и сохранять в закладки." },
      { topic: 'net', q: "Что такое ошибка CORS?", options: ["Сервер упал", "Браузер не отдаёт странице ответ с другого домена, если сервер не разрешил это заголовком", "Неверный пароль"], answer: 1, explain: "Разрешение даёт сервер заголовком `Access-Control-Allow-Origin`." },
      { topic: 'net', q: "Чем cookie отличаются от `localStorage`?", options: ["Cookie браузер отправляет на сервер с каждым запросом, `localStorage` остаётся в браузере", "`localStorage` отправляется на сервер", "Ничем"], answer: 0, explain: "Поэтому в cookie хранят сессию входа, а в `localStorage` — настройки интерфейса и черновики." },
      { topic: 'net', q: "Сервер ответил 500. Что сделает `await fetch(url)`?", options: ["Бросит ошибку", "Вернёт ответ с `ok === false`, ошибку надо проверять самому", "Вернёт `undefined`"], answer: 1, explain: "`fetch` отклоняет промис только при сетевой ошибке." }
    ]
  }
];
