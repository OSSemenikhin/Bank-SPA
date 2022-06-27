import { Chooser } from '../../components/chooser';
import './main.scss';
import '../../assets/svg/plus.svg';
import { getFullDate, getData } from '../../helpers';
import { request } from '../../api';

const listId = 'main_list';
const route = 'accounts';
const state = {
  data: false,
  $list: false,
};

const newAcc = (el) => {
  const button = el('button', {
    class: 'main__new-bill button-filled border-radius-7',
  });
  button.innerHTML = `<svg class="button-icon button-icon--plus"><use xlink:href="#plus"></use></svg> Создать новый счёт`;
  button.addEventListener('click', () => createAccount(el));
  return button;
};

export const mainPage = async (el) => {
  state.data = await getData(route);
  const items = createItems(el, state.data);
  const header = el('div', { class: 'main__header' }, [
    el('h2', { class: 'title main__title' }, 'Ваши счета'),
    el('div', { class: 'main-filter', id: 'filter' }, 'Сортировка'),
    newAcc(el),
  ]);
  state.$list = el('ul', { id: listId, class: 'main-content' }, items);
  return el('section', { class: 'main container' }, [header, state.$list]);
};

const lastTransaction = (el, item, account) => {
  const date = item ? getFullDate(item.date) : '';
  return el('div', { class: `main-content__date-info ${item ? '' : 'hidden'}` }, [
    el('h4', { class: 'main-content__title' }, 'Последняя транзакция:'),
    el('p', { id: `last_${account}`, class: 'main-content__date' }, date),
  ]);
};

const createItems = (el, items) => {
  return items.reduce((arr, item) => {
    const last = lastTransaction(el, item.transactions[0], item.account);
    arr.push(
      el('li', { class: 'main-content__item box-shadow border-radius-7 ' }, [
        el('div', { class: 'main-content__bill' }, [
          el('h3', { class: 'main-content__number' }, item.account),
          el('p', { class: 'main-content__count' }, [
            el('span', { id: `count_${item.account}` }, Number(item.balance).toFixed(0)),
            el('span', { class: 'ml-5' }, '₽'),
          ]),
        ]),
        el('div', { id: `info_${item.account}`, class: 'main-content__info' }, [
          last ?? '',
          el(
            'a',
            {
              class: 'main-content__open button-filled border-radius-7',
              href: `/view#${item.account}`,
              'data-navigo': '',
            },
            'Открыть'
          ),
        ]),
      ])
    );
    return arr;
  }, []);
};

const createAccount = async (el) => {
  const response = await request.POST('create-account', { token: sessionStorage.getItem('auth') });
  if (localStorage.getItem('accounts')) {
    const list = JSON.parse(localStorage.getItem('accounts'));
    list.unshift(response.payload);
    const wrapper = document.getElementById(listId);
    const items = createItems(el, [response.payload]);
    items.forEach((item) => wrapper.prepend(item));
    localStorage.setItem('accounts', JSON.stringify(list));
  }
};

export const addFilter = (el) => {
  new Chooser({
    el: 'filter',
    placeholder: 'Сортировка',
    // current: 2,
    data: [
      {
        value: 'По номеру',
        filter: 'accaunt',
        onClick(item) {
          filter(item);
        },
      },
      {
        value: 'По балансу',
        filter: 'amount',
        onClick(item) {
          filter(item);
        },
      },
      {
        value: 'По последней транзакции',
        filter: 'last-transaction',
        onClick(item) {
          filter(item);
        },
      },
    ],
    classList: {
      label: 'main-filter__label select__label',
      wrapper: 'main-filter__wrapper select__wrapper',
      current: 'main-filter__button select__button border-radius-7 background-light',
      icon: 'main-filter__icon select__icon',
      list: 'main-filter__list select__list box-shadow border-radius-7 background-light',
      item: 'main-filter__item select__item',
    },
  });

  const list = document.getElementById('main_list');
  const filter = (item) => {
    let items;
    switch (item.filter) {
      case 'accaunt':
        items = createItems(
          el,
          state.data.sort((a, b) => Number(a.account) - Number(b.account))
        );
        items.reverse();
        break;
      case 'amount':
        items = createItems(
          el,
          state.data.sort((a, b) => Number(a.balance) - Number(b.balance))
        );
        break;
      case 'last-transaction':
        items = createItems(
          el,
          state.data.sort((a, b) => {
            const aDate = a.transactions[0] ? new Date(a.transactions[0].date).valueOf() : 0;
            const bDate = b.transactions[0] ? new Date(b.transactions[0].date).valueOf() : 0;
            return aDate - bDate;
          })
        );
        break;
    }
    list.innerHTML = '';
    items.forEach((item) => list.prepend(item));
  };
};

export const updates = async (el, timeout) => {
  const render = async () => {
    state.data = await getData(route);
    state.data.forEach((item) => {
      if (item.balance > 0) {
        const $balance = document.getElementById(`count_${item.account}`);
        $balance.innerHTML = '';
        const balance = Number(item.balance).toFixed(0);
        $balance.textContent = balance;
        if (item.transactions.length > 0) {
          let last = document.getElementById(`last_${item.account}`);
          const date = getFullDate(item.transactions[0].date);
          const $date = document.getElementById(`last_${item.account}`);
          $date.parentElement.classList.remove('hidden');
          $date.textContent = getFullDate(item.transactions[0]);
          if (date != last.textContent) {
            last.innerHTML = '';
            last.textContent = date;
          }
        }
      }
    });
  };
  await render();
  return setInterval(render, timeout);
};

export const skeleton = (el) => {
  const items = [];
  for (let i = 0; i < 9; i++) {
    items.push(
      el('li', { class: 'main-skeleton__item main-content__item box-shadow border-radius-7 ' }, [
        el('div', { class: 'main-skeleton__bill' }, [
          el('div', { class: 'main-skeleton__number skeleton-animation' }),
          el('div', { class: 'main-skeleton__count skeleton-animation' }),
        ]),
        el('div', { class: 'main-skeleton__info main-content__info' }, [
          el('div', { class: 'main-skeleton__last main-content__date-info skeleton-animation' }),
          el('div', {
            class: 'main-skeleton__open main-content__open border-radius-7 skeleton-button',
          }),
        ]),
      ])
    );
  }

  return el('div', { class: 'main-skeleton container' }, [
    el('div', { class: 'main-skeleton__header main__header' }, [
      el('h2', { class: 'title main__title' }, 'Ваши счета'),
      el('div', { class: 'main-skeleton__filter main-filter skeleton-animation' }),
      newAcc(el),
    ]),
    el('ul', { class: 'main-skeleton__list main-content' }, items),
  ]);
};
