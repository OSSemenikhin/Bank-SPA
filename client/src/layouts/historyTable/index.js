import './historyTable.scss';

export const historyTable = (el, props) => {
  return el('div', { class: 'history-section border-radius-50 background-grey__7' }, [
    el('h4', { class: 'subtitle' }, 'История переводов'),
    el('table', { class: 'history-table' }, [
      el('thead', { class: 'history-table__head' }, [
        el('th', { class: 'history-table__th' }, 'Счёт отправителя'),
        el('th', { class: 'history-table__th' }, 'Счёт получателя'),
        el('th', { class: 'history-table__th' }, 'Сумма'),
        el('th', { class: 'history-table__th' }, 'Дата'),
        // el('th', {class: 'history-table__th'}, ''),
      ]),
      el(
        'tbody',
        { id: 'history_table_body', class: 'history-table__tbody' },
        historyTableItems(el, props)
      ),
    ]),
  ]);
};

export const historyTableItems = (el, props) => {
  return props.data.reduce((arr, item) => {
    const direction = +props.account == +item.to ? '_entering' : '_outgoing';
    arr.unshift(
      el('tr', { class: 'history-table__tr' }, [
        el('td', { class: 'history-table__td' }, item.from),
        el('td', { class: 'history-table__td' }, item.to),
        el('td', { class: `history-table__td ${direction}` }, `${item.amount} ₽`),
        el('td', { class: 'history-table__td' }, new Date(item.date).toLocaleDateString()),
        // el('td', {class: 'history-table__td'}, ''),
      ])
    );
    return arr;
  }, []);
};

export const updateHistoryTable = (el, data, account) => {
  const table = document.getElementById('history_table_body');
  const items = historyTableItems(el, { data: data, account: account });
  table.innerHTML = '';
  items.forEach((item) => table.append(item));
};

export const historyTableSkeleton = (el) => {
  return el(
    'div',
    { class: 'history-section history-section-skeleton border-radius-50 background-grey__7' },
    [
      el('h4', { class: 'subtitle' }, 'История переводов'),
      el('table', { class: 'history-table' }, [
        el('thead', { class: 'history-table__head' }, [
          el('th', { class: 'history-table__th' }, 'Счёт отправителя'),
          el('th', { class: 'history-table__th' }, 'Счёт получателя'),
          el('th', { class: 'history-table__th' }, 'Сумма'),
          el('th', { class: 'history-table__th' }, 'Дата'),
          // el('th', {class: 'history-table__th'}, ''),
        ]),
        el(
          'tbody',
          { id: 'history_table_body', class: 'history-table__tbody' },
          historyTableItemsSkeleton(el)
        ),
      ]),
    ]
  );
};

const historyTableItemsSkeleton = (el) => {
  const items = [];
  for (let i = 0; i < 3; i++) {
    items.push(
      el('tr', { class: 'history-table__tr history-table-skeleton__tr' }, [
        el('td', { class: 'history-table__td history-table-skeleton__td' }, [
          el('div', { class: 'history-table-skeleton__model skeleton-animation' }),
        ]),
        el('td', { class: 'history-table__td history-table-skeleton__td' }, [
          el('div', { class: 'history-table-skeleton__model skeleton-animation' }),
        ]),
        el('td', { class: `history-table__td history-table-skeleton__td` }, [
          el('div', { class: 'history-table-skeleton__model skeleton-animation' }),
        ]),
        el('td', { class: 'history-table__td history-table-skeleton__td' }, [
          el('div', { class: 'history-table-skeleton__model skeleton-animation' }),
        ]),
        // el('td', {class: 'history-table__td'}, ''),
      ])
    );
  }
  return items;
};
