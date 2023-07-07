const MESSAGE_SHOW_TIMER = 5000;
const BASE_MESSAGE_CLASS = 'system-messages__message';
const MessageClasses = {
  ERROR: 'system-messages__message--error',
  SUCCESS: 'system-messages__message--success'
};
const DEBOUNCE_TIMEOUT = 500;
const THROTTLE_DELAY = 1000;

const messagesContainer = document.querySelector('.system-messages');

function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function getRandomElemsFromArr(arr, elemsCount = 1) {
  let elem = arr[getRandomInt(0, arr.length - 1)];

  if (elemsCount > 1) {
    for (let i = 1; i <= elemsCount; i++) {
      elem += ` ${arr[getRandomInt(0, arr.length - 1)]}`;
    }
  }

  return elem;
}

// v.2 генератора (с ростом числа элементов будет работать быстрее, чем рандомайзер с массивом)
function uniqueIdGenerator(min = 0, max) {
  let currentId = min;

  return function () {
    if (min < max) {
      return currentId++;
    }
  };
}

// Проверка наличия класса в класс-листе
function hasClass(className, classList) {
  const classes = Array.from(classList);

  return classes.includes(className);
}

// Проверка клавишь
function isEscapeKey(evt) {
  return evt.key === 'Escape';
}

// Валидаторы
function isValidHashTag(hashTagStr) {
  const regex = /^#[\w\dа-яА-Я]{1,19}$/gi;

  return regex.test(hashTagStr);
}

// Вывод сообщений пользователю
function showMessage(messageText, messageClass) {
  const message = document.createElement('li');
  message.textContent = messageText;
  message.classList.add(BASE_MESSAGE_CLASS);
  message.classList.add(messageClass);

  messagesContainer.prepend(message);

  // Скрываем сообщение через MESSAGE_SHOW_TIMER миллисекунд
  setTimeout(() => message.remove(), MESSAGE_SHOW_TIMER);
}

function showError(errorText) {
  showMessage(errorText, MessageClasses.ERROR);
}

function showSuccess(successText) {
  showMessage(successText, MessageClasses.SUCCESS);
}

// Функции для устранения дребезга
function debounce(callback, timeout = DEBOUNCE_TIMEOUT) {
  let timerId = null;

  return function (...rest) {
    clearTimeout(timerId);

    timerId = setTimeout(() => callback.apply(this, rest), timeout);
  };
}

// Вызов функции не раньше, чем раз в delay миллисекунд
function throttle(callback, delay = THROTTLE_DELAY) {
  let previousTime = 0;

  return function (...rest) {
    const currentTime = new Date();

    if (currentTime - previousTime >= delay) {
      callback.apply(this, rest);

      previousTime = currentTime;
    }
  };
}

export {
  getRandomInt,
  getRandomElemsFromArr,
  uniqueIdGenerator,
  getLoremDescription,
  hasClass,
  isEscapeKey,
  isValidHashTag,
  showError,
  showSuccess,
  debounce,
  throttle
};
