// let nowDraw = {};
// let postponed = false;
export const chart = (props) => {
  // TO DO Animation bug when update
  // postponed = false;
  // if (nowDraw[props.el]) {
  //   postponed = props;
  //   return;
  // }
  // Defaults
  const speed = props.speed ?? 10;
  const labelFontSize = props.fonts.labels.size ?? 20;
  const labelMarginTop = props.fonts.labels.marginTop ?? 20;
  const labelFontWeight = props.fonts.labels.weight ?? 400;
  const labelFontFamily = props.fonts.labels.fontFamily ?? 'sans serif';

  const countFontSize = props.fonts.count.size ?? 20;
  const countMarginLeft = props.fonts.count.marginLeft ?? 10;
  const countFontWeight = props.fonts.count.weight ?? 400;
  const countFontFamily = props.fonts.count.fontFamily ?? 'sans serif';

  const reRender = props.reRender ?? false;

  // Create
  const canvas = document.getElementById(props.el);
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  // Get min and max datas
  const maxRatio = props.ratio
    ? +props.data.reduce((acc, curr) => (+acc.outgoing > +curr.outgoing ? acc : curr)).outgoing
    : 0;
  const maxData =
    props.data.length > 0
      ? +props.data.reduce((acc, curr) => (+acc.entering > +curr.entering ? acc : curr)).entering
      : 0;
  const max = Math.max(maxData, maxRatio);
  const min = Math.min(maxData, maxRatio);

  // Check font count width
  ctx.fillStyle = 'black';
  ctx.font = `${countFontWeight} ${countFontSize}px ${countFontFamily}`;
  const countWidth = Math.max(
    +ctx.measureText(max).width.toFixed(2),
    +ctx.measureText(min).width.toFixed(2)
  );

  // Get sizes
  const paddingBottom = props.paddingBottom ?? 0;
  const paddingLeftRight = props.paddingLeftRight ? +props.paddingLeftRight.toFixed(2) : 20;
  const widthDisp = +(canvas.width - countWidth - countMarginLeft).toFixed(2);
  const heightDisp = canvas.height - labelFontSize - labelMarginTop - paddingBottom;
  const gap = props.gap ? +props.gap.toFixed(2) : 20;
  const itemWidth = +(
    (widthDisp - gap * (props.data.length - 1) - paddingLeftRight * 2) /
    props.data.length
  ).toFixed(2);
  const fontLabelsPosX = canvas.height - labelFontSize - paddingBottom;

  if (reRender) ctx.clearRect(0, 0, widthDisp, heightDisp);

  // Draw main disp
  ctx.strokeStyle = props.stroke ?? 'black';
  ctx.fontLineWidth = '1';
  ctx.rect(0, 0, widthDisp, heightDisp);
  ctx.stroke();

  // Draw counts
  let yPos = widthDisp + countMarginLeft;
  ctx.fillText('0', yPos, heightDisp);

  if (props.ratio) {
    let xPos = heightDisp - heightDisp / (max / min) - countFontSize / 2;
    ctx.fillStyle = maxData > maxRatio ? props.fill : props.ratio.fill;
    ctx.fillText(max, yPos, countFontSize - countFontSize / 5);
    ctx.fillStyle = maxData < maxRatio ? props.fill : props.ratio.fill;
    if (xPos < heightDisp - countFontSize && xPos > countFontSize + 10) {
      ctx.fillText(min, yPos, xPos);
    } else if (xPos < countFontSize + 10) {
      ctx.fillText(min, yPos, countFontSize + 15);
    } else if (xPos > heightDisp - countFontSize) {
      ctx.fillText(min, yPos, heightDisp - countFontSize);
    }
  } else ctx.fillText(max, yPos, countFontSize - countFontSize / 5);

  // TO DO Animation bug when update

  // Draw items function
  const draw = (el, itemHeight, color, lastPosY, reRender, old, ratio = false) => {
    // let newHeight = reRender
    //   ? old
    //   : 0;
    let newHeight = 0;
    let step = itemHeight / speed;
    const fill = () => {
      ctx.fillStyle = color;
      ctx.fillRect(lastPosY, heightDisp, itemWidth, -newHeight);
      if (itemHeight > newHeight) {
        window.requestAnimationFrame(fill);
      } else if (ratio) {
        draw(el, ratio.height, ratio.fill, ratio.lastPosY, reRender, ratio.old)();
      }
      newHeight += step;
    };
    return fill;
  };

  // Draw items
  let lastPosY = paddingLeftRight;
  let lastFontY;
  let fontLine = true;
  props.data.forEach((item) => {
    // Data
    const itemHeight = heightDisp / (max / +item.entering);
    let old = false;
    if (reRender) old = heightDisp / (max / +item.oldEntering);
    if (props.ratio) {
      const ratio = {
        height: heightDisp / (max / +item.outgoing),
        fill: props.ratio.fill,
        lastPosY: lastPosY,
        old: reRender ? heightDisp / (max / +item.oldOutgoing) : false,
      };
      draw(props.el, itemHeight, props.fill, lastPosY, reRender, old, ratio)();
    } else {
      draw(props.el, itemHeight, props.fill, lastPosY, reRender, old)();
    }

    // Label
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.font = `${labelFontWeight} ${labelFontSize}px ${labelFontFamily}`;
    const fontWidth = +ctx.measureText(item.label).width.toFixed(2);
    let checkCrossing = false;
    if (lastFontY + fontWidth >= lastPosY - 5 + itemWidth / 2 && fontLine) checkCrossing = true;
    lastFontY = lastPosY + itemWidth / 2;
    ctx.fillText(
      item.label,
      lastFontY,
      !checkCrossing ? fontLabelsPosX : fontLabelsPosX + labelFontSize
    );
    if (checkCrossing) fontLine = false;
    else fontLine = true;
    lastPosY += itemWidth + gap;
  });
};
