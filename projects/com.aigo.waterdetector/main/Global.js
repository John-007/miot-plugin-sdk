

import { Host } from 'miot';

// -------------------全局方法--------------------

// 判断是否是今天
export function judgeDate(dateStr) {

  // 先判断是不是今天
  let nowDate = Date.parse(new Date());
  // let nowDateStr = this.formatDate(parseInt(nowDate) / 1000);
  let nowDateStr = formatDate(parseInt(nowDate) / 1000);

  if (dateStr == nowDateStr['date']) {


    let language = Host.locale.language;
    if (language != 'zh') {
      return 'Today';
    }

    return '今天';
  }
  return dateStr;
}

// 时间格式转换
export function formatDate(date) {
  var dateNew = 0;
  if (date.length == 13) {
    dateNew = new Date(parseInt(date));
  } else {
    dateNew = new Date(parseInt(date) * 1000);
  }

  let MM = (dateNew.getMonth() + 1 < 10 ? `0${dateNew.getMonth() + 1}` : dateNew.getMonth() + 1);
  let DD = (dateNew.getDate() < 10 ? `0${dateNew.getDate()}` : dateNew.getDate());
  let hh = `${dateNew.getHours() < 10 ? `0${dateNew.getHours()}` : dateNew.getHours()}:`;
  let mm = (dateNew.getMinutes() < 10 ? `0${dateNew.getMinutes()}` : dateNew.getMinutes());
  // return MM + '月' + DD + '日' + '_' + hh + mm;

  console.log('GlobalFormatDate');
  // 区分中英文
  let dateStr = `${MM}月${DD}日`;

  let language = Host.locale.language;
  if (language != 'zh') {

    dateStr = `${DD} ${translationMonth(MM)}`;
  }


  return { 'date': dateStr, 'time': hh + mm };
}



// -------------------本地方法--------------------


function translationMonth(monthNum) {

  switch (monthNum) {
    case 1: return 'January';
    case 2: return 'February';
    case 3: return 'March';
    case 4: return 'April';
    case 5: return 'May';
    case 6: return 'June';
    case 7: return 'July';
    case 8: return 'August';
    case 9: return 'September';
    case 10: return 'October';
    case 11: return 'November';
    case 12: return 'December';
    default: break;
  }
}