/*
  TODO: При перерисовке галереи не снимается обработчик с
  общего контейнера .pictures.container, а каждый раз устанавливается
  новое дополнительное событие.
*/
import {drawThumbnails} from './thumbnails.js';
import {openFullPhoto} from './photos-modal.js';
import {getCommentsRenderer, updateCommentsCounter, isAllCommentsLoaded} from './comments.js';
import './forms.js';

const COMMENTS_PER_PAGE = 5; // Количество комментариев, загружающихся под фото за 1 раз

const picturesContainer = document.querySelector('.pictures.container');
const fullPictureContainer = document.querySelector('.big-picture__img > img');
const fullPictureDescription = document.querySelector('.social__caption');
const likesCountContainer = document.querySelector('.likes-count');
const commentsCounter = document.querySelector('.comments-count');
const commentsContainer = document.querySelector('.social__comments');
const loadMoreCommentsBtn = document.querySelector('.social__comments-loader');

/*
  @param {Object} pictData - Объект с данными о фотографиях
  @param {Bool} filterApplied - Была ли отфильтрована галерея.
  Параметр необходим, т.к. по умолчинию индекс в массиве с фото
  соответствует id изображения в этом массиве, что дает
  нам простой доступ к фотографии по pictData[curPictId].
  Однако, если отфильтровать фотографии, допустим, по лайкам,
  в таком случае на месте 0 индекса может оказаться фото с другим
  id, например 17. В таком случае, простой доступ по индексу - не подойдет.
  Необходимо пройтись по всему массиву с данными, чтобы найти фото с тем id,
  который нам нужен
*/
function renderGallery(pictData, filterApplied = false) {
  // Отрисовываем фотографии на странице
  drawThumbnails(pictData);

  // Добавляем обработчик событий клика по миниатюре через делегирование
  picturesContainer.addEventListener('click', (evt) => {
    if (!evt.target.closest('.picture')) {
      return;
    }

    evt.preventDefault(); // Предотвращаем открытие ссылки

    // Загружаем данные о фотографии, по которой кликнули, в модальное окно
    const target = evt.target.closest('.picture').querySelector('.picture__img');
    const curPictId = target.dataset.imgId;
    let currentImage = null;

    if (!filterApplied) { // Если галарея отсортирована по умолчанию (НЕ РАБОТАЕТ ПОКА)
      currentImage = pictData[curPictId];
    } else {
      currentImage = pictData.find((image) => image.id === curPictId);
    }

    const {url, description, likes, comments} = currentImage;

    fullPictureContainer.src = url;
    fullPictureDescription.textContent = description;
    likesCountContainer.textContent = likes || 0;
    commentsCounter.textContent = comments.length || 0;
    commentsContainer.innerHTML = ''; // Очищаем от старых комментариев

    if (comments.length > 0) { // Отрисовываем комментарии
      const drawComments = getCommentsRenderer(comments, commentsContainer, COMMENTS_PER_PAGE);
      drawComments();

      loadMoreCommentsBtn.classList.remove('hidden');
      // loadMoreCommentsBtn.addEventListener('click', drawComments); // Добавляем обработчик на кнопку загрузки доп. комментариев
      loadMoreCommentsBtn.onclick = drawComments; // Временное решение, т.к. непонятно пока, как удалять обработчик при закрытии окна в ./photosModal.js
    }

    // Если все комментарии загружены - скрыть кнопку загрузки
    if (isAllCommentsLoaded(comments.length)) {
      loadMoreCommentsBtn.classList.add('hidden');
    }

    updateCommentsCounter(); // Обновляем счетчик комментариев
    openFullPhoto(evt); // Открываем модальное окно
  });
}

export {renderGallery};
