import {getData} from './server-api.js';
import {setGalleryData, renderGallery} from './gallery.js';
import {showErrorNotif, debounce} from './utils.js';
import {initGalleryFilters} from './gallery-filters.js';
import './gallery.js';

// Получаем данные о фотографиях с сервера
getData()
  .then((photosData) => {
    console.log('Получили данные от модуля server-api.js', photosData);
    // Инициализируем галерею
    setGalleryData(photosData);

    // Инициализируем фильтрацию изображений
    initGalleryFilters({
      photosData: photosData,
      callback: debounce(renderGallery),
    });

    // Первая, дефолтная отрисовка галереи без фильтрации
    renderGallery();
  })
  .catch((error) => {
    console.log('Ошибка получения данных из модуля server-api.js', error);
    showErrorNotif(error);
  });
