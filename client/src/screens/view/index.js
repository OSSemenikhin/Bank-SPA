import './view.scss';
import { Chooser } from '../../components/chooser';
import { contentHeader, contentHeaderSkeleton } from '../../layouts/contentHeader';
import { historyTable, historyTableSkeleton } from '../../layouts/historyTable';
import { getData, getMonthSum, onlyNumbersReg } from '../../helpers';
import { addChart } from '../../components/chart/addChart';
import { updateAccauntData } from '../../components/updateAccauntData';
import { request } from '../../api';
import '../../assets/svg/mail.svg';
import {
  addLoading,
  addSuccess,
  startLoading,
  stopLoading,
  stopLoadingError,
} from '../../components/loading';
const valid = require('card-validator');

// const transactionsRoute = 'lastTransactions';
const state = {
  route: false,
  data: false,
  $form: false,
  dynamicData: false,
  $cardDisp: false,
  selectInput: false,
  transactions: false,
  // transactions: JSON.parse(localStorage.getItem(transactionsRoute)) || false,
  $recipient: false,
  $summ: false,
  $errorDisp: false,
  $loading: false,
  $success: false,
};

export const viewPage = async (el) => {
  state.route = `account/${window.location.hash.replace('#', '')}`;
  state.data = await getData(state.route);
  state.dynamicData = getMonthSum(state.data.account, state.data.transactions);

  const historyData =
    state.data.transactions > 10 ? state.data.transactions : state.data.transactions.slice(-10);

  const header = contentHeader(el, {
    account: state.data.account,
    title: 'Просмотр счёта',
    balance: state.data.balance,
    backHref: `/`,
  });

  state.$summ = el('input', {
    id: 'summ',
    class: 'view-main__input input',
    type: 'text',
    name: 'summ',
    placeholder: 'Укажите сумму',
  });
  state.$summ.addEventListener('input', inputSumm);

  state.$cardDisp = el('span', { id: 'type', class: 'view-main__type card-type' });

  const sendButton = el('button', {
    class: 'view-main__button button-filled button-filled--mailing border-radius-7',
  });
  sendButton.innerHTML =
    '<svg class="button-icon button-icon--mail"><use xlink:href="#mail"></use></svg>Отправить';
  state.$form = el('form', { class: 'view-main__form' }, [
    el('div', { class: 'view-main__label' }, [
      el('span', { class: 'view-main__name' }, 'Номер счёта получателя'),
      el('div', { id: 'select_input', class: 'view-main__select-input' }),
    ]),
    el('div', { class: 'view-main__label' }, [
      el('span', { class: 'view-main__name' }, 'Сумма перевода'),
      state.$summ,
    ]),
    sendButton,
  ]);

  state.$form.addEventListener('submit', (e) => transfer(e, el));
  state.$errorDisp = el('p', { id: 'transfer_error', class: 'view-main__error text__error' }, '');
  state.$loading = addLoading(el, 'view-main');
  state.$success = addSuccess(el, 'view-main');

  const main = el('div', { class: 'view-main' }, [
    el('div', { class: 'view-main__left border-radius-50' }, [
      el('h4', { class: 'subtitle' }, 'Новый перевод'),
      state.$cardDisp,
      state.$form,
      state.$errorDisp,
      state.$loading,
      state.$success,
    ]),
    el('div', { class: 'view-main__right border-radius-50 box-shadow' }, [
      el('h4', { class: 'subtitle' }, 'Динамика баланса'),
      el('div', { class: 'view-main-dynamic' }, [
        el('canvas', { id: 'dynamic', class: 'view-main-dynamic__chart' }),
        el('a', { class: 'view-main-dynamic__link', href: `/history#${state.data.account}` }),
      ]),
    ]),
  ]);
  const history = historyTable(el, { data: historyData, account: state.data.account });
  return el('section', { class: 'view container' }, [header, main, history]);
};

const inputRecipient = (e) => {
  removeErrors(state.$recipient);
  let check = valid.number(e.target.value);
  if (check.isPotentiallyValid && check.card) {
    state.$cardDisp.classList.add(`card-type--${check.card.type}`);
  } else {
    state.$cardDisp.classList.forEach((className) => {
      if (className.startsWith('card-type--')) state.$cardDisp.classList.remove(className);
    });
  }
};

const inputSumm = (e) => {
  removeErrors(state.$summ);
  e.target.value = e.target.value.replace(onlyNumbersReg, '');
};

export const addFilter = () => {
  let chooserData = [];
  if (state.transactions) {
    chooserData = state.transactions.map((tr) => {
      return { value: tr.to };
    });
  }
  state.selectInput = new Chooser({
    el: 'select_input',
    placeholder: 'Сортировка',
    label: 'Выберите или введите номер',
    input: {
      filter: true,
      numbers: true,
      id: 'recipient',
      attr: {
        type: 'text',
        placeholder: 'Введите номер счёта',
      },
    },
    data: chooserData,
    classList: {
      label: 'view-main-select__label',
      wrapper: 'view-main-select__wrapper',
      current: 'view-main-select__input view-main__input input',
      icon: 'select__icon',
      list: 'view-main-select__list select__list box-shadow border-radius-7 background-light',
      item: 'select__item',
    },
    onSelect() {
      removeErrors(state.$recipient);
    },
  });
  state.$recipient = document.getElementById('recipient');
  state.$recipient.addEventListener('input', inputRecipient);
};

const updateFilter = (data) => {
  if (data.transactions) {
    state.transactions = filterTransactions(data.transactions, data.account);
    if (state.transactions.length > 10) state.transactions = state.transactions.slice(-10);
    let items = state.transactions.map((transaction) => {
      return { value: transaction.to };
    });
    // localStorage.setItem(transactionsRoute, JSON.stringify(items));
    state.selectInput.updateList(items);
  }
};

const filterTransactions = (transactions, account) => {
  return transactions.reduce((arr, transaction) => {
    const check = arr.find((item) => item.to == transaction.to);
    if (transaction.to != account && !check) {
      arr.push(transaction);
    }
    return arr;
  }, []);
};

let chartData = {
  el: 'dynamic',
};
export const addDynamic = () => {
  chartData.data = state.dynamicData;
  if (state.dynamicData.length > 0) {
    addChart(chartData);
  }
};

const removeErrors = (input) => {
  state.$errorDisp.textContent = '';
  if (input.classList.contains('_error')) {
    input.classList.remove('_error');
  }
};

const transfer = async (e, el) => {
  e.preventDefault();
  if (state.$recipient.value == '') {
    state.$recipient.classList.add('_error');
    state.$errorDisp.textContent = 'Укажите номер счета получателя';
    return;
  }
  if (state.$summ.value == '') {
    state.$summ.classList.add('_error');
    state.$errorDisp.textContent = 'Укажите сумму';
    return;
  }
  startLoading(state.$loading);
  const resp = await request.POST('transfer-funds', {
    from: state.data.account,
    to: state.$recipient.value,
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
      case 'Overdraft prevented':
        state.$errorDisp.textContent = 'На счете недостаточно средств';
        break;
    }
    stopLoadingError(state.$loading);
  } else {
    state.$recipient.value = '';
    state.$summ.value = '';
    stopLoading(state.$success, state.$loading, () => {
      const render = updateAccauntData(
        el,
        state.route,
        state.data,
        state.dynamicData,
        chartData,
        resp.payload
      );
      updatePage(render);
      state.selectInput.resetSelected();
    });
  }
};

const updatePage = async (render) => {
  const newData = await render();
  if (newData) updateFilter(newData);
  state.data = newData;
};

export const updates = (el, timeout) => {
  const render = updateAccauntData(el, state.route, state.data, state.dynamicData, chartData);
  updatePage(render);
  return setInterval(render, timeout);
};

export const skeleton = (el) => {
  return el('section', { class: 'view view-skeleton container' }, [
    contentHeaderSkeleton(el, { title: 'Просмотр счёта', backHref: `/` }),
    el('div', { class: 'view-main view-main-skeleton' }, [
      el('div', { class: 'view-main__left view-main-skeleton__left border-radius-50' }, [
        el('h4', { class: 'subtitle' }, 'Новый перевод'),
        el('div', { class: 'view-main__form view-main-skeleton__form' }, [
          el('div', { class: 'view-main__label view-main-skeleton__label skeleton-animation' }),
          el('div', { class: 'view-main__label view-main-skeleton__label skeleton-animation' }),
          el('div', {
            class: 'view-main__button view-main-skeleton__button skeleton-button border-radius-7',
          }),
        ]),
      ]),
      el(
        'div',
        { class: 'view-main__right view-main-skeleton__right border-radius-50 box-shadow' },
        [
          el('h4', { class: 'subtitle' }, 'Динамика баланса'),
          el('div', { class: 'view-main-dynamic view-main-dynamic-skeleton skeleton-animation' }),
        ]
      ),
    ]),
    historyTableSkeleton(el),
  ]);
};
