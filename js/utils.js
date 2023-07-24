const ACCEPTED_FILE_TYPES = ['jpg', 'jpeg', 'png'];

// Параметры уведомлений
const NOTIF_CONTAINER_CLASS = 'system-notification';
const NOTIF_BASE_CLASS = 'system-notification__message';
const NotifClass = {
  ERROR: 'system-notification__message--error',
  SUCCESS: 'system-notification__message--success'
};
const NOTIF_SHOW_TIMER = 5000;

// Параметры сообщений
const MessageType = {
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
};
const MessageText = {
  ERROR: 'Ошибка загрузки файла',
  SUCCESS: 'Изображение успешно загружено'
};
const MESSAGE_PARAMS = {
  ERROR: {
    ID: '#error',
    CLASS: '.error',
    TITLE: '.error__title',
  },
  SUCCESS: {
    ID: '#success',
    CLASS: '.success',
    TITLE: '.success__title',
  }
};

// Параметры задержки
const DEBOUNCE_TIMEOUT = 500;
const THROTTLE_DELAY = 1000;

function isValidFileType(file) {
  if (file) {
    const fileExt = file.type.split('/')[1];

    return ACCEPTED_FILE_TYPES.includes(fileExt);
  }

  return false;
}

function getRandomInt(min, max) {
  min = Math.floor(min);
  max = Math.ceil(max);

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

function getRandUniqElemsFromArr(arr, elemsCount = 1) {
  if (elemsCount <= 1) {
    return arr[getRandomInt(0, arr.length - 1)];
  }

  const result = [];
  const generatedIDs = [];
  const idsGenerator = getUniqIdGenerator(0, elemsCount);

  for (let i = 0; i < elemsCount; i++) {
    generatedIDs.push(idsGenerator());
  }

  const shuffledIDs = shuffleArr(generatedIDs);

  for (let i = 0; i < shuffledIDs.length; i++) {
    const elemIndex = shuffledIDs[i];
    result.push(arr[elemIndex]);
  }

  return result;
}

// v.2  генератор последовательных псевдо-уникальных чисел (с ростом числа элементов будет работать быстрее, чем рандомайзер с массивом)
function getUniqIdGenerator(min = 0, max = 10) {
  let currentId = min;

  return function () {
    if (min < max) {
      return currentId++;
    }
  };
}

// Функция для перемешивания массива (по алгоритму тасования Фишера-Йетса)
function shuffleArr(arr) {
  if (!arr.length) {
    return;
  }

  const shuffledArr = arr.slice();

  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);

    [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
  }

  return shuffledArr;
}

// Проверка нажатой клавиши
function isEscapeKey(evt) {
  return evt.key === 'Escape';
}

// Вывод сообщений об ошибках/успехе загрузки фотографий на сервер
function showMessage(messageText, messageType = MessageType.SUCCESS) {
  const message = createMessage(messageText, messageType);
  document.body.append(message);
}

function createMessage(messageText, messageType = MessageType.SUCCESS) {
  // Параметры контейнера сообщения
  const templateContainerSelector = MESSAGE_PARAMS[messageType].ID;
  const messageContainerSelector = MESSAGE_PARAMS[messageType].CLASS;
  const messageTitleSelector = MESSAGE_PARAMS[messageType].TITLE;

  // Создаем сообщение
  const messageTmpl = document.querySelector(templateContainerSelector).content;
  const message = messageTmpl.cloneNode(true);
  message.querySelector(messageTitleSelector).textContent = messageText;
  message.querySelector(messageContainerSelector).addEventListener('click', closeMessageClickHandler);
  document.addEventListener('keydown', closeMessageKeyDownHandler);

  return message;
}

function showError(errorText = MessageText.ERROR) {
  showMessage(errorText, MessageType.ERROR);
}

function showSuccess(successText = MessageText.SUCCESS) {
  showMessage(successText, MessageType.SUCCESS);
}

// Вывод прочих уведомлений пользователям сервиса
function createNotifContainer() {
  const notifContainer = document.createElement('ul');
  notifContainer.className = NOTIF_CONTAINER_CLASS;
  return notifContainer;
}

function showNotification(notifText, notifClass) {
  if (!document.querySelector(`.${NOTIF_CONTAINER_CLASS}`)) {
    const notifContainer = createNotifContainer();
    document.body.append(notifContainer);
  }

  const notifocationsContainer = document.querySelector(`.${NOTIF_CONTAINER_CLASS}`);
  const notification = document.createElement('li');
  notification.textContent = notifText;
  notification.classList.add(NOTIF_BASE_CLASS);
  notification.classList.add(notifClass);

  notifocationsContainer.prepend(notification);

  // Скрываем сообщение через NOTIF_SHOW_TIMER миллисекунд
  setTimeout(() => notification.remove(), NOTIF_SHOW_TIMER);
}

function showErrorNotif(errorText) {
  showNotification(errorText, NotifClass.ERROR);
}

function showSuccessNotif(successText) {
  showNotification(successText, NotifClass.SUCCESS);
}

function closeMessageClickHandler(evt) {
  const target = evt.target;
  const closeMessageTriggers = ['success', 'success__button', 'error', 'error__button'];

  // Закрываем сообщение при клике по соответствующему классу
  if(closeMessageTriggers.includes(target.className)) {
    removeMessage();
    document.removeEventListener('keydown', closeMessageClickHandler);
  }
}

function closeMessageKeyDownHandler(evt) {
  // Закрываем сообщение только при нажатии ESC
  if(isEscapeKey(evt)) {
    removeMessage();
    document.removeEventListener('keydown', closeMessageKeyDownHandler);
  }
}

function removeMessage() {
  document.querySelector(MESSAGE_PARAMS.ERROR.CLASS)?.remove();
  document.querySelector(MESSAGE_PARAMS.SUCCESS.CLASS)?.remove();
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
  isValidFileType,
  getRandomInt,
  getRandomElemsFromArr,
  getRandUniqElemsFromArr,
  isEscapeKey,
  MessageType,
  showError,
  showSuccess,
  showErrorNotif,
  showSuccessNotif,
  debounce,
  throttle
};
