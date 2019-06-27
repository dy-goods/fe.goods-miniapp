export const priceText = (s?: number | string, prefix?: string) => {
  s = Number(s);
  if (typeof prefix === 'undefined') {
    prefix = '￥';
  }
  if (isNaN(s)) {
    return `${prefix}0`;
  }
  let num = (s / 100).toFixed(2);
  while (true) {
    if (num.endsWith('0')) {
      num = num.slice(0, -1);
      continue;
    }
    if (num.endsWith('.')) {
      num = num.slice(0, -1);
    }
    break;
  }
  return `${prefix}${num}`;
};