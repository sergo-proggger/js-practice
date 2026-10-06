// Проверка решений. В браузере файл работает как Web Worker: страница запускает его на каждую проверку
// и останавливает через 2 секунды, поэтому бесконечный цикл не повесит приложение.
// Этот же файл подключает test-course.js в Node, чтобы прогнать эталонные решения.

function jspIsIdent(key) {
  return /^[A-Za-zА-Яа-яЁё_$][A-Za-z0-9А-Яа-яЁё_$]*$/.test(key);
}

function jspShow(value, depth) {
  depth = depth || 0;
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') {
    return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  }
  if (typeof value === 'number') return Object.is(value, -0) ? '0' : String(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'bigint') return value + 'n';
  if (typeof value === 'function') return 'функция';
  if (typeof value === 'symbol') return value.toString();
  if (depth > 4) return '…';
  if (Array.isArray(value)) {
    return '[' + value.map(function (v) { return jspShow(v, depth + 1); }).join(', ') + ']';
  }
  if (value instanceof Map) return 'Map(' + jspShow(Array.from(value.entries()), depth + 1) + ')';
  if (value instanceof Set) return 'Set(' + jspShow(Array.from(value), depth + 1) + ')';
  var keys = Object.keys(value);
  if (!keys.length) return '{}';
  return '{ ' + keys.map(function (k) {
    return (jspIsIdent(k) ? k : jspShow(k)) + ': ' + jspShow(value[k], depth + 1);
  }).join(', ') + ' }';
}

// Сравнение ответа с ожидаемым: массивы по порядку, объекты без учёта порядка ключей, NaN равен NaN.
function jspEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!jspEqual(a[i], b[i])) return false;
    }
    return true;
  }
  var tagA = Object.prototype.toString.call(a);
  if (tagA !== Object.prototype.toString.call(b)) return false;
  if (a instanceof Map || a instanceof Set) return jspEqual(Array.from(a), Array.from(b));
  var ka = Object.keys(a);
  var kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (var j = 0; j < ka.length; j++) {
    var k = ka[j];
    if (!Object.prototype.hasOwnProperty.call(b, k) || !jspEqual(a[k], b[k])) return false;
  }
  return true;
}

function jspClone(value) {
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value); } catch (e) { /* ниже запасной вариант */ }
  }
  return JSON.parse(JSON.stringify(value));
}

function jspErrorText(err) {
  if (err && err.name) return err.name + ': ' + err.message;
  return String(err);
}

// Запускает код ученика и все тесты задачи. Возвращает { status, results?, message?, logs }.
function jspRun(code, fnName, tests) {
  var logs = [];
  var methods = ['log', 'info', 'warn', 'error'];
  var saved = {};
  methods.forEach(function (m) {
    saved[m] = console[m];
    console[m] = function () {
      if (logs.length >= 200) return;
      var parts = Array.prototype.map.call(arguments, function (a) {
        return typeof a === 'string' ? a : jspShow(a);
      });
      logs.push((m === 'warn' || m === 'error' ? m + ': ' : '') + parts.join(' '));
    };
  });

  try {
    var fn;
    try {
      // Код выполняется как обычный скрипт (непрямой eval), поэтому сообщения об ошибках
      // совпадают с теми, что показал бы браузер: например, «Unexpected end of input» при пропущенной скобке.
      // Каждая проверка идёт в новом воркере, так что объявления не копятся между запусками.
      fn = (0, eval)(code + '\n;(typeof ' + fnName + " === 'function' ? " + fnName + ' : undefined);');
    } catch (err) {
      return { status: 'compile', message: jspErrorText(err), logs: logs };
    }
    if (typeof fn !== 'function') return { status: 'nofn', logs: logs };

    var results = tests.map(function (t, index) {
      var r = {
        index: index,
        hidden: !!t.hidden,
        label: t.code || (fnName + '(' + (t.args || []).map(function (a) { return jspShow(a); }).join(', ') + ')'),
        expected: jspShow(t.expected)
      };
      try {
        var got;
        if (t.code) {
          got = new Function(fnName, 'return (' + t.code + ');')(fn);
        } else {
          var args = jspClone(t.args || []);
          var before = t.noMutate ? jspClone(args) : null;
          got = fn.apply(null, args);
          if (t.noMutate && !jspEqual(args, before)) {
            r.pass = false;
            r.got = jspShow(got);
            r.note = 'Функция изменила входной массив. Работай с копией: [...arr].';
            return r;
          }
        }
        r.got = jspShow(got);
        r.pass = jspEqual(got, t.expected);
      } catch (err) {
        r.pass = false;
        r.error = jspErrorText(err);
      }
      return r;
    });
    return { status: 'done', results: results, logs: logs };
  } finally {
    methods.forEach(function (m) { console[m] = saved[m]; });
  }
}

if (typeof importScripts === 'function') {
  // Ссылку на отправку запоминаем заранее: код ученика может случайно объявить своё postMessage
  var jspSend = self.postMessage.bind(self);
  self.onmessage = function (e) {
    var d = e.data;
    jspSend(jspRun(d.code, d.fnName, d.tests));
  };
}
