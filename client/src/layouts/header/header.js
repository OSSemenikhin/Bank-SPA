import './header.scss';

const links = [
  { name: 'Банкоматы', href: '/atms' },
  { name: 'Счета', href: '/' },
  { name: 'Валюта', href: '/currency' },
  { name: 'Выйти', href: '/login', id: 'logout' },
];

export const header = (el, navDisp) => {
  const menu = links.map((item) => {
    return el('li', { class: 'header-nav__item' }, [
      item.id
        ? el(
            'a',
            {
              id: item.id,
              class: 'header-nav__link button border-radius-7',
              href: item.href,
              'data-navigo': '',
            },
            item.name
          )
        : el(
            'a',
            {
              class: 'header-nav__link button border-radius-7',
              href: item.href,
              'data-navigo': '',
            },
            item.name
          ),
    ]);
  });

  const navClass = navDisp ? 'header-nav' : 'header-nav header-nav--hidden';
  const burgerClass = navDisp ? 'burger' : 'burger burger--hidden';

  return el('header', { class: 'header' }, [
    el('div', { class: 'container header__wrapper' }, [
      el('h2', { class: 'header__title' }, 'Coin.'),
      el('nav', { id: 'nav', class: navClass }, [
        el('ul', { id: 'nav_list', class: 'header-nav__list' }, menu),
      ]),
      el('button', { id: 'burger', class: burgerClass }, [el('span', { class: 'burger__lines' })]),
    ]),
  ]);
};

export class Burger {
  constructor() {
    this.nav = document.getElementById('nav');
    this.burger = document.getElementById('burger');
    this.isOpen = false;
    if (this.burger) this.#setup();
  }

  #setup() {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.miss = this.miss.bind(this);
    this.burger.addEventListener('click', (event) => {
      event._burgerMenu = true;
      this.#toggle();
    });
  }

  #toggle() {
    this.isOpen ? this.close() : this.open();
  }

  noClose(event) {
    event._burgerMenu = true;
  }

  miss(event) {
    if (event._burgerMenu) return;
    else this.close();
  }

  open() {
    this.burger.classList.add('open');
    this.nav.classList.add('open');
    this.isOpen = true;
    document.addEventListener('click', this.miss);
    this.nav.addEventListener('click', this.noClose);
  }

  close() {
    this.burger.classList.remove('open');
    this.nav.classList.remove('open');
    this.isOpen = false;
    document.removeEventListener('click', this.miss);
    this.nav.removeEventListener('click', this.noClose);
  }
}
