import './loading.scss';

export const startLoading = (loading) => {
  loading.classList.remove('hidden');
};

export const stopLoading = async (success, loading, update) => {
  success.classList.remove('hidden');
  update();
  setTimeout(() => success.classList.add('hidden'), 2000);
  loading.classList.add('hidden');
};

export const stopLoadingError = async (loading) => {
  loading.classList.add('hidden');
};

export const addLoading = (el, className) => {
  return el('div', { class: `${className}-loading loading border-radius-50 hidden` }, [
    el('div', { class: `${className}-loading__spinner spinner` }, [
      el('div', { class: 'spinner__up' }),
      el('div', { class: 'spinner__down' }),
    ]),
  ]);
};

export const addSuccess = (el, className) => {
  return el('div', { class: `${className}-success success border-radius-50 hidden` }, [
    el('div', { class: `success__icon` }),
    el('p', { class: 'success__message' }),
  ]);
};
