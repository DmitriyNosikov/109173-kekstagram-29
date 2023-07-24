import {setGalleryData} from './gallery.js';
import {getRandUniqElemsFromArr} from './utils.js';

const RANDOM_PHOTOS_COUNT = 10;
const FilterBtnClass = {
  BASE: 'img-filters__button',
  ACTIVE: 'img-filters__button--active',
  INACTIVE: 'img-filters--inactive',
};
const Filter = {
  DEFAULT: 'filter-default',
  RANDOM: 'filter-random',
  DISCUSSED: 'filter-discussed',
};

const imageFiltersContainer = document.querySelector('.img-filters');

function initGalleryFilters(settings) {
  imageFiltersContainer.classList.remove(FilterBtnClass.INACTIVE);

  imageFiltersContainer.addEventListener('click', (evt) => {
    const target = evt.target;

    // Не обрабатываем клики на уже активном элементе и на чем либо, кроме кнопок фильтров
    if (isActiveFilter(target)) {
      return;
    }

    // Сбрасываем предыдущую активную кнопку фильтра. Активируем текущую.
    toogleBtnActiveClass(target);

    // Меняем фильтр
    const filterID = target.id;

    setFilter(filterID, settings);
  });
}

function isActiveFilter(target) {
  if (target.classList.contains(FilterBtnClass.ACTIVE) || // Если кликаем по уже активному фильтру
    !target.classList.contains(FilterBtnClass.BASE)) { // Если кликаем не по кнопкам (например, по контейнеру с кнопками)
    return true;
  }

  return false;
}

function toogleBtnActiveClass(target) {
  document.querySelector(`.${FilterBtnClass.ACTIVE}`).classList.remove(FilterBtnClass.ACTIVE);
  target.classList.add(FilterBtnClass.ACTIVE);
}

function setFilter(filterID, settings) {
  const photos = settings.photosData.slice();
  let filterApplied = false;

  switch(filterID) {
    case Filter.RANDOM: { // Случайные фотографии в количестве RANDOM_PICTURES_COUNT штук
      const randomPictures = getRandPhotos(photos);
      setGalleryData(randomPictures);
      filterApplied = true;
      break;
    }

    case Filter.DISCUSSED: { // Фотографии, отсортированные по количеству комментариев
      const mostDiscussed = getSortedByComments(photos);
      setGalleryData(mostDiscussed);
      filterApplied = true;
      break;
    }

    default: {
      setGalleryData(photos);
      break;
    }
  }

  // Перерисовываем отсортированную галерею
  settings.callback(filterApplied);
}

function getRandPhotos(photosArr, photosCount = RANDOM_PHOTOS_COUNT) {
  return getRandUniqElemsFromArr(photosArr, photosCount);
}

function getSortedByComments(photosArr) {
  return photosArr.sort((picA, picB) => picB.comments.length - picA.comments.length);
}

export {initGalleryFilters};
