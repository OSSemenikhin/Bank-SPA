import { getData, getMonthSum } from '../helpers';
import { updateHistoryTable } from '../layouts/historyTable';
import { updateChart } from '../components/chart/addChart';
import { updateAmount } from '../layouts/contentHeader';

export const updateAccauntData = (el, route, data, dynamicData, chartProps, setData = false) => {
  return async () => {
    const nowData = setData || (await getData(route));
    if (nowData.transactionsLength != data.transactionsLength) {
      let nowDynamicData = getMonthSum(nowData.transactions, data.account);
      if (nowDynamicData.length > 0) {
        updateChart(dynamicData, nowDynamicData, chartProps);
      }
      dynamicData = [];
      dynamicData = [...nowDynamicData];
      data = {};
      data = { ...nowData };
      const historyData = data.transactions > 10 ? data.transactions : data.transactions.slice(-10);
      updateHistoryTable(el, historyData, data.account);
      updateAmount(data.balance);
      if (data) localStorage.setItem(`${route}/${data.account}`, JSON.stringify(data));
      if (dynamicData && dynamicData.length > 0)
        localStorage.setItem(`monthSum${data.account}`, JSON.stringify(dynamicData));
    }
    return data;
  };
};
