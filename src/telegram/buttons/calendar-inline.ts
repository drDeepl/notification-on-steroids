import { Markup } from 'telegraf';
import {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
} from 'telegraf/typings/core/types/typegram';

import { Calendar } from 'node-calendar';

const MONTHS = {
  0: 'январь',
  1: 'февраль',
  2: 'март',
  3: 'апрель',
  4: 'май',
  5: 'июнь',
  6: 'июль',
  7: 'август',
  8: 'сентябрь',
  9: 'октябрь',
  10: 'ноябрь',
  11: 'декабрь',
};
const DAYS = {
  0: 'Пн.',
  1: 'Вт.',
  2: 'Ср.',
  3: 'Чт.',
  4: 'Пт.',
  5: 'Сб.',
  6: 'Вс.',
};

export function inlineCalendar(): Markup.Markup<InlineKeyboardMarkup> {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const inlineCalendarKb: Array<Array<InlineKeyboardButton>> = [
    [Markup.button.callback(`${MONTHS[currentMonth]}`, 'set_month')],
    [
      Markup.button.callback('Пн.', '_mon'),
      Markup.button.callback('Вт.', '_tue'),
      Markup.button.callback('Ср.', '_wed'),
      Markup.button.callback('Чт.', '_thu'),
      Markup.button.callback('Пт.', '_fri'),
      Markup.button.callback('Сб.', '_sat'),
      Markup.button.callback('Вс.', '_sun'),
    ],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  const calendar = new Calendar().monthdayscalendar(
    currentYear,
    currentMonth + 1,
  );

  console.log(calendar);
  for (let week = 0; week < calendar.length; week++) {
    for (let dayWeek = 0; dayWeek < calendar[week].length; dayWeek++) {
      const day: number = calendar[week][dayWeek];

      if (day == 0) {
        inlineCalendarKb[week + 2][dayWeek] = Markup.button.callback(
          ` `,
          `_${dayWeek}-${week}`,
        );
      } else {
        inlineCalendarKb[week + 2][dayWeek] = Markup.button.callback(
          `${day}`,
          `${day / 10 < 1 ? '0' + day : day}-${
            currentMonth / 10 < 1 ? '0' + currentMonth : currentMonth
          }-${currentYear}`,
        );
      }
    }
  }
  return Markup.inlineKeyboard(inlineCalendarKb);
}
