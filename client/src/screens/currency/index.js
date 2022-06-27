import { Chooser } from '../../components/chooser';
import './currency.scss';
import { getData } from '../../helpers';
import { API_URL, request } from '../../api';
import { addLoading, addSuccess, startLoading, stopLoading } from '../../components/loading';

export const routeWebSocket = `ws://${API_URL}currency-feed`;
const route = 'currencies';
const routeChangesListData = 'changesListData';
const routeAllCurrencies = 'all-currencies';
const state = {
  currencies: false,
  changesListData: JSON.parse(sessionStorage.getItem(routeChangesListData)) ?? [],
  allCurrencies: JSON.parse(sessionStorage.getItem(routeAllCurrencies)) ?? false,
  selectFrom: false,
  selectTo: false,
  $changesList: false,
  $form: false,
  $summ: false,
  from: false,
  to: false,
  $loading: false,
  $success: false,
  $errorDisp: false,
};

const operationForm = (el) => {
  if (state.$form) state.$form.removeEventListener('submit', currencyBuy);
  state.$summ = el('input', {
    class: 'currency-operation__input input border-radius-7',
    placeholder: 'Укажите сумму',
  });
  state.$form = el('form', { class: 'currency-operation__form' }, [
    el('div', { class: 'currency-operation__left' }, [
      el('div', { class: 'currency-operation__select' }, [
        el('div', { id: 'from', class: 'currency-operation__from' }),
        el('div', { id: 'to', class: 'currency-operation__to' }),
      ]),
      el('label', { class: 'currency-operation__label' }, [
        el('span', { class: 'currency-operation__name' }, 'Сумма'),
        state.$summ,
      ]),
    ]),
    el('div', { class: 'currency-operation__right' }, [
      el(
        'button',
        {
          class: 'currency-operation__submit button-filled border-radius-7',
          type: 'submit',
        },
        'Обменять'
      ),
    ]),
  ]);
  state.$form.addEventListener('submit', currencyBuy);
  return state.$form;
};

export const currencyPage = async (el) => {
  state.currencies = await getData(route);
  state.allCurrencies = await getData(routeAllCurrencies);
  const userCurrencyItems = getItems(el, state.currencies);
  const userCurrency = el('div', { class: 'currency-user box-shadow border-radius-50' }, [
    el('h2', { class: 'subtitle' }, 'Ваши валюты'),
    el('ul', { class: 'doted__ul' }, userCurrencyItems),
  ]);

  state.$summ.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/[^0-9]/, '');
    if (event.target.classList.contains('_error')) {
      event.target.classList.remove('_error');
      state.$errorDisp.innerHTML = '';
    }
  });

  state.$form = operationForm(el);

  state.$loading = addLoading(el, 'currency-operation');
  state.$success = addSuccess(el, 'currency-operation');
  state.$errorDisp = el(
    'p',
    { id: 'buy_error', class: 'currency-operation__error text__error' },
    ''
  );

  const currency = el('div', { class: 'currency-operation box-shadow border-radius-50' }, [
    el('h2', { class: 'subtitle' }, 'Обмен валюты'),
    state.$form,
    state.$loading,
    state.$success,
    state.$errorDisp,
  ]);

  let changesItems = false;
  if (state.changesListData.length > 0) {
    changesItems = getItems(el, state.changesListData, true);
  }

  state.$changesList = el('ul', { id: 'changes_list', class: 'doted__ul' }, changesItems || '');

  return el('section', { class: 'currency container' }, [
    el('h2', { class: 'title' }, 'Валютный обмен'),
    el('div', { class: 'currency__wrapper' }, [
      el('div', { class: 'currency__left' }, [userCurrency, currency]),
      el('div', { class: 'currency-changes border-radius-50 background-grey_6' }, [
        el('h2', { class: 'subtitle' }, 'Изменение курсов в реальном времени'),
        state.$changesList,
      ]),
    ]),
  ]);
};

const getItems = (el, arr, changes = false) => {
  return Object.values(arr).map((item) => {
    if (changes) {
      item.mod = item.change < 0 ? ' down' : ' up';
      item.code = `${item.from}/${item.to}`;
      item.amount = item.rate;
    }
    const countAttr = { class: `doted__count${item.mod ?? ''}` };
    if (item.code.length <= 5) countAttr.id = item.code;

    return el('li', { class: `doted__li${item.mod ?? ''}` }, [
      el('h3', { class: `doted__name` }, item.code),
      el('span', { class: `doted__dots${item.mod ?? ''}` }),
      el('span', { ...countAttr }, +item.amount.toFixed(2)),
    ]);
  });
};

const currencyBuy = async (e) => {
  e.preventDefault();
  if (state.$summ.value == '') {
    state.$errorDisp.textContent = 'Укажите сумму';
    state.$summ.classList.add('_error');
    return;
  }
  startLoading(state.$loading);
  const resp = await request.POST('currency-buy', {
    from: state.from,
    to: state.to,
    amount: state.$summ.value,
  });
  if (resp.error) {
    switch (resp.error) {
      case 'Invalid account from':
        state.$errorDisp.textContent = 'Неправильный номер счета отправителя';
        break;
      case 'Invalid account to':
        state.$errorDisp.textContent = 'Неправильный номер счета получателя';
        break;
      case 'Invalid amount':
        state.$errorDisp.textContent = 'Указана некорректная сумма';
        break;
      case 'Not enough currency':
        state.$errorDisp.textContent = 'На счете недостаточно средств';
        break;
    }
  } else {
    state.$summ.value = '';
    stopLoading(state.$success, state.$loading, updatePage);
  }
};

export const addChanges = (el, data) => {
  if (data.type === 'EXCHANGE_RATE_CHANGE') {
    const items = getItems(el, [data], true);
    if (state.$changesList.childNodes.length > 11) {
      state.$changesList.removeChild(
        state.$changesList.childNodes[state.$changesList.childNodes.length - 1]
      );
    }
    if (state.changesListData.length > 11) {
      state.changesListData.pop();
    }
    items.forEach((item) => {
      state.$changesList.prepend(item);
      state.changesListData.unshift(data);
    });
    sessionStorage.setItem(routeChangesListData, JSON.stringify(state.changesListData));
  }
};

export const addSelect = () => {
  const classList = {
    label: 'currency-operation__name select__label',
    wrapper: 'currency-operation__wrapper select__wrapper',
    current: 'currency-operation__button select__button background-light border-radius-7',
    icon: 'currency-operation__icon select__icon',
    list: 'currency-operation__list select__list box-shadow border-radius-7 background-light',
    item: 'currency-operation__item select__item',
  };
  state.selectFrom = new Chooser({
    el: 'from',
    placeholder: 'placeholder',
    label: 'Из',
    current: 1,
    data: state.allCurrencies.map((item) => {
      return { value: item };
    }),
    classList: classList,
    group: 'currency',
    onSetUp(items) {
      state.from = items[this.current - 1].value;
    },
    onSelect(item) {
      state.from = item.value;
    },
  });
  state.selectTo = new Chooser({
    el: 'to',
    placeholder: 'placeholder',
    label: 'в',
    current: 2,
    data: state.allCurrencies.map((item) => {
      return { value: item };
    }),
    classList: classList,
    group: 'currency',
    onSetUp(items) {
      state.to = items[this.current - 1].value;
    },
    onSelect(item) {
      state.to = item.value;
    },
  });
};

const updatePage = async () => {
  state.currencies = await getData(route);
  state.allCurrencies = await getData(routeAllCurrencies);
  sessionStorage.setItem(routeAllCurrencies, JSON.stringify(state.allCurrencies));
  Object.values(state.currencies).map((item) => {
    const countEl = document.getElementById(item.code);
    if (Number(countEl.textContent) == item.amount) return;
    countEl.textContent = +item.amount.toFixed(2);
  });
  let items = state.allCurrencies.map((item) => {
    return { value: item };
  });
  state.selectFrom.updateList(items);
  state.selectTo.updateList(items);
};

export const updates = async (timeout) => {
  await updatePage();
  return setInterval(updatePage, timeout);
};

export const skeleton = (el) => {
  const items = (length) => {
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(el('div', { class: `currency-skeleton__item skeleton-animation` }));
    }
    return arr;
  };
  const operation = state.allCurrencies
    ? operationForm(el)
    : el('div', { class: 'currency-operation__form' }, [
        el('div', { class: 'currency-operation__left currency-skeleton-operation__left' }, [
          el('div', { class: 'currency-skeleton__item skeleton-animation' }),
          el('div', { class: 'currency-skeleton__item skeleton-animation' }),
        ]),
      ]);
  let changesItems = false;
  if (state.changesListData.length > 0) {
    changesItems = getItems(el, state.changesListData, true);
  }
  state.$changesList = el('ul', { id: 'changes_list', class: 'doted__ul' }, changesItems || '');

  const changesList = changesItems
    ? el('div', { class: 'currency-changes border-radius-50 background-grey_6' }, [
        el('h2', { class: 'subtitle' }, 'Изменение курсов в реальном времени'),
        state.$changesList,
      ])
    : el('div', { class: 'currency-changes border-radius-50 background-grey_6' }, [
        el('h2', { class: 'subtitle' }, 'Изменение курсов в реальном времени'),
        items(10),
      ]);

  return el('section', { class: 'currency container' }, [
    el('h2', { class: 'title' }, 'Валютный обмен'),
    el('div', { class: 'currency__wrapper' }, [
      el('div', { class: 'currency__left' }, [
        el('div', { class: 'currency-user box-shadow border-radius-50' }, [
          el('h2', { class: 'subtitle' }, 'Ваши валюты'),
          items(5),
        ]),
        el('div', { class: 'currency-operation box-shadow border-radius-50' }, [
          el('h2', { class: 'subtitle' }, 'Обмен валюты'),
          operation,
        ]),
      ]),
      changesList,
    ]),
  ]);
};
