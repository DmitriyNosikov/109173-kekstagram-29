const BASE_URL = 'https://29.javascript.pages.academy/kekstagram';
const Route = {
  GET_DATA: '/data',
  SEND_DATA: '/',
};
const Method = {
  GET: 'GET',
  POST: 'POST'
};
const ErrorText = {
  DEFAULT: 'Не удалось загрузить данные с сервера. Ожидаемый статус: 200. Сервер вернул: ',
  LOAD: 'Не удалось загрузить данные с сервера. Перезагрузите страницу или попробуйте позднее.',
  SEND: 'Не удалось отправить данные на сервер. Попробуйте повторить отправку.'
};
const ATTEMPTS_COUNT = 3; // Количество повторных попыток загрузки данных с сервера
const ATTEMPTS_FREQUENCY = 3000; // Частота запросов

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function request(url, method = Method.GET, body = null) {
  console.log(...arguments);
  return fetch(url, {method, body})
    .then((response) => {
      console.log('Запрос выполнен успешно');
      if (response.ok) {
        return response.json();
      }

      throw new Error(`${ErrorText.DEFAULT} ${response.status}`);
    })
    .catch((error) => {
      console.log('Ошибка выполнения запроса');
      throw new Error(error);
    });
}

function loadWithRetry(route, errorText, method = Method.GET, body = null, attemptCount = ATTEMPTS_COUNT) {
  console.log('-'.repeat(100));
  console.log(`Попытка повторно загрузить данные с сервера (${attemptCount})`);
  return request(`${BASE_URL}${route}`, {method, body})
    .then((response) => response.json())
    .catch(() => {
      if (attemptCount > 0) {
        return delay(ATTEMPTS_FREQUENCY)
          .then(() => loadWithRetry(route, errorText, method, body, --attemptCount));
      }

      throw new Error(errorText);
    });
}

function loadData(route, errorText, method = Method.GET, body = null) {
  return fetch(`${BASE_URL}${route}`, {method, body})
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(`${ErrorText.DEFAULT} ${response.status}`);
    })
    .catch((error = errorText) => {
      throw new Error(error);
    });
}

function getData() {
  return loadWithRetry(Route.GET_DATA, ErrorText.LOAD);
}

function sendData(data) {
  return loadData(Route.SEND_DATA, ErrorText.SEND, Method.POST, data);
}

export {getData, sendData};
