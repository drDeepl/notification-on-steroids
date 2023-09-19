import { Markup } from 'telegraf';
import {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
} from 'telegraf/typings/core/types/typegram';
import { SchemaInlineKeyboard } from '../types/schema-inline-keyboard';

export function createPaginateKb(
  schemas: SchemaInlineKeyboard[],

  currentPage: number,
  totalCountPages: number,
): Markup.Markup<InlineKeyboardMarkup> {
  const btns: Array<Array<InlineKeyboardButton>> = [[]];

  for (let row = 0; row < schemas.length; row++) {
    const schema: SchemaInlineKeyboard = schemas[row];
    btns.push([Markup.button.callback(schema.text, `${schema.data}`)]);
  }
  const pages: Array<InlineKeyboardButton> = [
    Markup.button.callback(`<<`, `${currentPage > 0 ? 'page_prev' : '_'}`),
    Markup.button.callback(
      `${currentPage + 1}/${totalCountPages}`,
      'curr_page',
    ),
    Markup.button.callback(
      `>>`,
      `${currentPage + 1 < totalCountPages ? 'page_next' : '_'}`,
    ),
  ];

  btns.push(pages);
  btns.push([Markup.button.callback(`закрыть`, 'close_msg')]);
  return Markup.inlineKeyboard(btns);
}

export function formatISODate(isoDate: Date) {
  const day: number = isoDate.getDate();
  const month: number = isoDate.getMonth() + 1;
  const year: number = isoDate.getFullYear();
  return `${day / 10 < 1 ? '0' + day : day}.${
    month / 10 < 1 ? '0' + month : month
  }.${year}`;
}
