import './contentHeader.scss';
import '../../assets/svg/back.svg';

const backLink = (el, href) => {
  const link = el('a', {
    class: 'content-header__back button-filled button-filled--back border-radius-7',
    href: href,
  });
  link.innerHTML =
    '<svg class="button-icon button-icon--back"><use xlink:href="#back"></use></svg>Вернуться назад';
  return link;
};

export const contentHeader = (el, props) => {
  return el('div', { class: `content-header` }, [
    el('h2', { class: 'title' }, props.title),
    el('h3', { class: 'content-header__number' }, ` № ${props.account}`),
    backLink(el, props.backHref),
    el('div', { class: 'content-header__count-info' }, [
      el('span', { class: 'content-header__label' }, 'Баланс'),
      el('span', { id: 'account_count', class: 'content-header__count' }, props.balance),
      el('span', { class: 'ml-5' }, '₽'),
    ]),
  ]);
};

export const updateAmount = (newAmount) => {
  const el = document.getElementById('account_count');
  el.innerHTML = '';
  const amount = Number(newAmount).toFixed(2);
  el.textContent = amount;
};

export const contentHeaderSkeleton = (el, props) => {
  return el('div', { class: `content-header content-header-skeleton` }, [
    el('div', { class: 'title content-header-skeleton__title' }, props.title),
    el('div', {
      class: 'content-header__number content-header-skeleton__number skeleton-animation',
    }),
    backLink(el, props.backHref),
    el(
      'div',
      {
        class: 'content-header__count-info content-header-skeleton__count-info skeleton-animation',
      },
      [
        el('div', { class: 'content-header__label content-header-skeleton__label' }),
        el('div', { class: 'content-header__count content-header-skeleton__count' }),
        el('div', { class: 'ml-5' }),
      ]
    ),
  ]);
};
