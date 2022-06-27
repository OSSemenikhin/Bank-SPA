import './history.scss';
import { contentHeader, contentHeaderSkeleton } from '../../layouts/contentHeader';
import { historyTable, historyTableSkeleton } from '../../layouts/historyTable';
import { getData, getMonthSum } from '../../helpers';
import { addChart } from '../../components/chart/addChart';
import { updateAccauntData } from '../../components/updateAccauntData';

const state = {
  route: false,
  dynamicData: false,
  data: false,
  chartData: {
    el: 'dynamic',
    ratioEl: 'dynamic-2',
    ratio: true,
    fullData: true,
  },
};

export const historyPage = async (el) => {
  state.route = `account/${window.location.hash.replace('#', '')}`;
  state.data = await getData(state.route);
  state.dynamicData = getMonthSum(state.data.account, state.data.transactions);

  const historyData =
    state.data.transactions > 10 ? state.data.transactions : state.data.transactions.slice(-10);

  const header = contentHeader(el, {
    title: 'История баланса',
    account: state.data.account,
    balance: state.data.balance,
    backHref: `/view#${state.data.account}`,
  });

  const dynamic = el('div', { class: 'history__dynamic box-shadow border-radius-50' }, [
    el('h3', { class: 'subtitle' }, 'Динамика баланса'),
    el('div', [el('canvas', { id: 'dynamic', class: 'history__chart' })]),
  ]);

  const ratio = el('div', { class: 'history__ratio box-shadow border-radius-50' }, [
    el('h3', { class: 'subtitle' }, 'Соотношение входящих исходящих транзакций'),
    el('div', [el('canvas', { id: 'dynamic-2', class: 'history__chart' })]),
  ]);

  const history = historyTable(el, { data: historyData, account: state.data.account });

  return el('section', { class: 'history container' }, [header, dynamic, ratio, history]);
};

export const addDynamic = () => {
  state.chartData.data = state.dynamicData;
  if (state.dynamicData.length > 0) {
    addChart(state.chartData);
  }
};

export const updates = async (el, timeout) => {
  const render = updateAccauntData(el, state.route, state.data, state.dynamicData, state.chartData);
  await render();
  return setInterval(render, timeout);
};

export const skeleton = async (el) => {
  return el('section', { class: 'history history-skeleton container' }, [
    contentHeaderSkeleton(el, {
      title: 'История баланса',
      backHref: `/view#$${window.location.hash.replace('#', '')}`,
    }),
    el('div', { class: 'history__dynamic history-skeleton__dynamic box-shadow border-radius-50' }, [
      el('div', { class: 'subtitle history-skeleton__subtitle skeleton-animation' }),
      el('div', { class: 'history__chart history-skeleton__chart skeleton-animation' }),
    ]),
    el('div', { class: 'history__ratio history-skeleton__ratio box-shadow border-radius-50' }, [
      el('div', { class: 'subtitle history-skeleton__subtitle skeleton-animation' }),
      el('div', { class: 'history__chart history-skeleton__chart skeleton-animation' }),
    ]),
    historyTableSkeleton(el),
  ]);
};
