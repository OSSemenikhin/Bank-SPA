import { chart } from './chart';

export const addChart = (props) => {
  let labelsFontSize, labelsFontMarginTop, labelsFontWeight, countFontSize, paddingLeftRight, gap;
  if (window.screen.width >= 1300) {
    labelsFontSize = 24;
    labelsFontMarginTop = 20;
    labelsFontWeight = 700;
    countFontSize = 20;
    paddingLeftRight = 35;
    gap = 28;
  } else if (window.screen.width >= 1200) {
    labelsFontSize = 20;
    labelsFontMarginTop = 20;
    countFontSize = 20;
    paddingLeftRight = 25;
    gap = 15;
  } else if (window.screen.width >= 960) {
    labelsFontWeight = 400;
    paddingLeftRight = 15;
    gap = 10;
  } else if (window.screen.width >= 768) {
    if (props.fullData) {
      labelsFontSize = 18;
      labelsFontMarginTop = 15;
      labelsFontWeight = 400;
      countFontSize = 16;
      paddingLeftRight = 15;
      gap = 14;
    } else {
      labelsFontSize = 24;
      labelsFontMarginTop = 20;
      labelsFontWeight = 700;
      countFontSize = 20;
      paddingLeftRight = 35;
      gap = 28;
    }
  } else if (window.screen.width >= 576) {
    if (props.fullData) {
      labelsFontSize = 14;
      labelsFontMarginTop = 15;
      labelsFontWeight = 200;
      countFontSize = 14;
      paddingLeftRight = 10;
      gap = 10;
    } else {
      labelsFontSize = 24;
      labelsFontMarginTop = 20;
      labelsFontWeight = 700;
      countFontSize = 20;
      paddingLeftRight = 35;
      gap = 28;
    }
  } else {
    if (props.fullData) {
      labelsFontSize = 14;
      labelsFontMarginTop = 15;
      labelsFontWeight = 200;
      countFontSize = 14;
      paddingLeftRight = 10;
      gap = 10;
      // chartData = props.data.length > 6 ? props.data.slice(-6) : props.data;
      // chartDataRatio = props.dataRatio.length > 6 ? props.dataRatio.slice(-6) : props.dataRatio;
    } else {
      labelsFontSize = 16;
      labelsFontMarginTop = 15;
      labelsFontWeight = 400;
      countFontSize = 16;
      paddingLeftRight = 15;
      gap = 15;
    }
  }

  const chartProps = {
    data: !props.fullData
      ? props.data.length > 6
        ? props.data.slice(-6)
        : props.data
      : window.screen.width >= 576
      ? props.data.length > 12
        ? props.data.slice(-12)
        : props.data
      : props.data.length > 6
      ? props.data.slice(-6)
      : props.data,
    paddingLeftRight: paddingLeftRight,
    paddingBottom: 3,
    gap: gap,
    speed: 1,
    reRender: props.reRender,
    fonts: {
      labels: {
        size: labelsFontSize,
        marginTop: labelsFontMarginTop,
        weight: labelsFontWeight,
        fontFamily: 'Ubuntu',
      },
      count: {
        size: countFontSize,
        weight: 200,
        fontFamily: 'Ubuntu',
        marginLeft: 15,
      },
    },
  };

  chart({
    el: props.el,
    fill: '#116ACC',
    ...chartProps,
  });
  if (props.ratio) {
    chart({
      el: props.ratioEl,
      fill: '#76CA66',
      ratio: {
        ratioEl: props.ratioEl,
        fill: '#FD4E5D',
      },
      ...chartProps,
    });
  }
};

export const updateChart = (dynamicData, nowDynamicData, props) => {
  nowDynamicData.forEach((item) => {
    const oldItem = dynamicData.find((old) => old.month == item.month);
    item.oldEntering = oldItem ? oldItem.entering : 0;
    item.oldOutgoing = oldItem ? oldItem.outgoing : 0;
  });
  props.data = nowDynamicData;
  props.reRender = true;
  addChart(props);
};
