import 'babel-polyfill';
import './styles/styles.scss';
import { el, setChildren } from 'redom';
import Navigo from 'navigo';
import { header, Burger } from './layouts/header/header';

const router = new Navigo('/');
if (!sessionStorage.getItem('auth')) router.navigate('/login');
let ws;
let interval;
const timeout = 15000 * 6;
const navDisp = window.location.pathname !== '/login';
const main = el('main', { class: 'content' });
setChildren(window.document.body, [header(el, navDisp), main]);
const $nav = document.getElementById('nav');
const $burger = document.getElementById('burger');
if (window.screen.width < 768) new Burger();
window.addEventListener('resize', () => {
  if (window.screen.width < 768) new Burger();
});
const logout = document.getElementById('logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.removeItem('auth');
  $nav.classList.add('header-nav--hidden');
  router.navigate('/login');
});
const headerLinks = document.querySelectorAll('.header-nav__link');

const navVisible = () => {
  if (window.location.pathname == '/login') {
    if (!$nav.classList.contains('header-nav--hidden')) {
      $nav.classList.add('header-nav--hidden');
    }
    if (window.screen.width < 768) {
      $burger.classList.add('burger--hidden');
    }
  } else if ($nav.classList.contains('header-nav--hidden')) {
    $nav.classList.remove('header-nav--hidden');
    if (window.screen.width < 768) {
      $burger.classList.remove('burger--hidden');
    }
  }
};

let map;
const addSection = async (page) => {
  if (map) map.destroy();
  clearInterval(interval);
  if (ws) ws.close();
  const section = await page(el, router);
  setChildren(main, section);
  navVisible();
  const links = section.querySelectorAll('[href]');
  if (links) {
    Array.from(links).map((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate(link.getAttribute('href'));
      });
    });
  }
};

const activeSection = (section) => {
  headerLinks.forEach((link) => {
    if (link.classList.contains('active-section')) {
      link.classList.remove('active-section');
    } else if (section == link.getAttribute('href')) {
      link.classList.add('active-section');
    }
  });
};

router.on('/login', async () => {
  if (sessionStorage.getItem('auth')) {
    router.navigate('/');
    return;
  }
  activeSection();
  const { loginPage } = await import('./screens/login');
  await addSection(loginPage);
});

router.on('/', async () => {
  activeSection('/');
  const { mainPage, addFilter, updates, skeleton } = await import('./screens/main');
  addSection(skeleton);
  await addSection(mainPage);
  addFilter(el);
  interval = await updates(el, timeout);
});

router.on('/view', async () => {
  activeSection('/view');
  const { viewPage, addDynamic, addFilter, updates, skeleton } = await import('./screens/view');
  addSection(skeleton);
  await addSection(viewPage);
  addFilter();
  addDynamic();
  interval = updates(el, timeout);
});

router.on('/history', async () => {
  activeSection('/history');
  const { historyPage, addDynamic, updates, skeleton } = await import('./screens/history');
  addSection(skeleton);
  await addSection(historyPage);
  addDynamic();
  interval = await updates(el, timeout);
});

router.on('/currency', async () => {
  activeSection('/currency');
  const { currencyPage, addSelect, routeWebSocket, addChanges, updates, skeleton } = await import(
    './screens/currency'
  );
  await addSection(skeleton);
  if (document.getElementById('from')) addSelect();
  await addSection(currencyPage);
  addSelect();
  ws = new WebSocket(routeWebSocket);
  ws.onmessage = (responce) => addChanges(el, JSON.parse(responce.data));
  interval = await updates(timeout);
});

router.on('/atms', async () => {
  activeSection('/atms');
  const { atms, addMap } = await import('./screens/atms');
  await addSection(atms);
  map = await addMap(el);
});

router.resolve();
