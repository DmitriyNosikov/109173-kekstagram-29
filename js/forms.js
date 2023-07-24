/*
  TODO:
  - Prestine.js при каждом вызове, даже ни смотря на reset() и
  destroy() своего объекта - не затирает за собой слушатель события
  input на #upload-file - Подумать, можно ли как-то это исправить.
*/
import {openImgEditor, closeImgEditor} from './forms-modal.js';
import {
  MAX_TAGS_COUNT,
  MAX_COMMENT_LENGTH,
  checkTagsSemantics,
  checkTagsCount,
  checkTagsUniq,
  checkCommentLength
} from './validators.js';
import {sendData} from './server-api.js';
import {isValidFileType, showError, showSuccess} from './utils.js';

// Статусы отправки формы
const SubmitBtnText = {
  BASE: 'Опубликовать',
  PUBLISHING: 'Публикуем...'
};
const DataSendStatusText = {
  SUCCESS: 'Данные успешно отправлены',
  ERROR: 'Ошибка отправки данных'
};

// Валидация
const PrestineClass = {
  to: 'img-upload__field-wrapper',
  error: 'img-upload__item--invalid',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'span',
  errorText: 'img-upload__error'
};
const ValidatorMessage = {
  // Хеш-теги
  HT_SEMANTICS: 'Хэш-теги должны начинаться с символа # и содержать только буквы/цифры',
  HT_COUNT: `К одной фотографии можно добавить не более ${MAX_TAGS_COUNT} хэш-тегов`,
  HT_UNIQ: 'Хэш-теги не могут повторяться',
  // Комментарии
  COMM_LENGTH: `Длина комментария не должна превышать ${MAX_COMMENT_LENGTH} символов.`,
};

const uploadImgForm = document.querySelector('.img-upload__form');
const uploadImgInput = document.querySelector('.img-upload__input');
const submitFormBtn = document.querySelector('.img-upload__submit');
const preview = document.querySelector('.img-upload__preview > img');
const effectThumbnails = document.querySelectorAll('.effects__preview');
const hashTagsInput = uploadImgForm.querySelector('.text__hashtags');
const descriptionInput = uploadImgForm.querySelector('.text__description');

let pristine = null;

uploadImgInput.addEventListener('change', (evt) => {
  const target = evt.target;
  const choosedFile = target.files[0];

  // Если загружен файл валидного типа
  if (isValidFileType(choosedFile)) {
    setFormValidators(); // Устанавливаем валидаторы на формуsetFormValidators(); // Устанавливаем валидаторы на форму
    uploadImgForm.addEventListener('submit', submitFormHandler); // Устанавливаем обработчик на отправку
    setImagePreview(choosedFile); // Загружаем изображение в модальное окно
    openImgEditor(evt); // Открываем редактор изображения
  }
});

function submitFormHandler(event) {
  event.preventDefault();

  const targetForm = event.target;
  const isValidForm = pristine.validate();

  // Если форма валидна - отправляем
  if (isValidForm) {
    blockSendBtn();
    sendData(new FormData(targetForm))
      .then(() => {
        showSuccess(DataSendStatusText.SUCCESS);
        closeImgEditor(); // Закрываем форму только в случае успешной отправки
      })
      .catch(() => showError(DataSendStatusText.ERROR))
      .finally(() => {
        unblockSendBtn();
      });
  }
}

function setImagePreview(fileInfo) {
  const imageSrc = URL.createObjectURL(fileInfo);

  preview.src = imageSrc;

  for(let i = 0; i < effectThumbnails.length; i++) {
    effectThumbnails[i].style.backgroundImage = `url(${imageSrc})`;
  }
}

function setFormValidators() {
  pristine = new Pristine(uploadImgForm, {
    classTo: PrestineClass.to,
    errorClass: PrestineClass.error,
    errorTextParent: PrestineClass.errorTextParent,
    errorTextTag: PrestineClass.errorTextTag,
    errorTextClass: PrestineClass.errorText
  });

  // Валидация хэш-тегов
  pristine.addValidator(
    hashTagsInput,
    checkTagsSemantics, // Проверка общей семантики
    ValidatorMessage.HT_SEMANTICS,
    1,
    true
  );

  pristine.addValidator(
    hashTagsInput,
    checkTagsCount, // Проверка количества тегов
    ValidatorMessage.HT_COUNT,
    2,
    true
  );

  pristine.addValidator(
    hashTagsInput,
    checkTagsUniq, // Проверка на уникальность
    ValidatorMessage.HT_UNIQ,
    3,
    true
  );

  // Валидатор комментария
  pristine.addValidator(
    descriptionInput,
    checkCommentLength,
    ValidatorMessage.COMM_LENGTH
  );
}

function removeFormValidators() {
  uploadImgForm.removeEventListener('submit', submitFormHandler);

  if (!pristine) {
    return;
  }

  pristine.reset();
  pristine.destroy();
}

function blockSendBtn() {
  submitFormBtn.disabled = true;
  submitFormBtn.textContent = SubmitBtnText.PUBLISHING;
}

function unblockSendBtn() {
  submitFormBtn.disabled = false;
  submitFormBtn.textContent = SubmitBtnText.BASE;
}

export {removeFormValidators};
