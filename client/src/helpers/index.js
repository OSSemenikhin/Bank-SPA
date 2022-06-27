import { request } from '../api';

// export const getData = async (route) => {
//   return localStorage.getItem(route)
//     ? JSON.parse(localStorage.getItem(route))
//     : await getData(route);
// };
// export const getDynamicData = (account, transactions) => {
//   return localStorage.getItem(`monthSum${account}`)
//     ? JSON.parse(localStorage.getItem(`monthSum${account}`))
//     : getMonthSum(transactions, account);
// };

export const getData = async (route) => {
  const response = await request.GET(route, sessionStorage.getItem('auth'));
  // if (response.payload) localStorage.setItem(route, JSON.stringify(response.payload));
  if (response.error) return response;
  return response.payload;
};

export const getMonth = (num, type = false) => {
  switch (num) {
    case 0:
      return type == 1 ? 'Январь' : 'Января';
    case 1:
      return type == 1 ? 'Февраль' : 'Февраля';
    case 2:
      return type == 1 ? 'Март' : 'Марта';
    case 3:
      return type == 1 ? 'Апрель' : 'Апреля';
    case 4:
      return type == 1 ? 'Май' : 'Мая';
    case 5:
      return type == 1 ? 'Июнь' : 'Июня';
    case 6:
      return type == 1 ? 'Июль' : 'Июля';
    case 7:
      return type == 1 ? 'Август' : 'Августа';
    case 8:
      return type == 1 ? 'Сентябрь' : 'Сентября';
    case 9:
      return type == 1 ? 'Октябрь' : 'Октября';
    case 10:
      return type == 1 ? 'Ноябрь' : 'Ноября';
    case 11:
      return type == 1 ? 'Декабрь' : 'Декабря';
  }
};

export const getFullDate = (item) => {
  const date = new Date(item);
  return `${date.getDate()} ${getMonth(date.getMonth())} ${date.getFullYear()}`;
};

export const getMonthSum = (account, transactions) => {
  const arr = transactions.reduce((prev, curr) => {
    const month = curr.date.slice(0, 7);
    let nowItem = prev.find((item) => item.month === month);
    if (!nowItem) {
      nowItem = {};
      prev.push(nowItem);
    }
    nowItem.month = nowItem.month ?? month;
    nowItem.label = nowItem.label ?? getMonth(+curr.date.slice(5, 7) - 1, 1).slice(0, 3);
    nowItem.entering = nowItem.entering ?? 0;
    nowItem.outgoing = nowItem.outgoing ?? 0;
    if (+curr.to == +account) {
      nowItem.entering += +curr.amount;
      nowItem.entering = +nowItem.entering.toFixed(2);
    } else {
      nowItem.outgoing += +curr.amount;
      nowItem.outgoing = +nowItem.outgoing.toFixed(2);
    }
    return prev;
  }, []);
  // if (arr && arr.length > 0) localStorage.setItem(`monthSum${account}`, JSON.stringify(arr));
  return arr;
};

export const onlyNumbersReg = /[^\d.]/gi;
