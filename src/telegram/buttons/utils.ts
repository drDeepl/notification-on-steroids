import { Markup } from 'telegraf';
import {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
} from 'telegraf/typings/core/types/typegram';
import { SchemaInlineKeyboard } from '../types/schema-inline-keyboard';
import { Paginator } from 'apaginator';

export function createPaginateKb(
  schemas: SchemaInlineKeyboard[],
  countItemOnPage: number,
  currentPage: number,
): Markup.Markup<InlineKeyboardMarkup> {
  const paginator = new Paginator(schemas, countItemOnPage);
  const btns: Array<Array<InlineKeyboardButton>> = [[]];
  const itemsCurrentPage = paginator.current();
  console.log(itemsCurrentPage);
  for (let row = 0; row < itemsCurrentPage.length; row++) {
    const schema: SchemaInlineKeyboard = itemsCurrentPage[row];
    btns.push([Markup.button.callback(schema.text, `${schema.data}`)]);
  }
  const pages: Array<InlineKeyboardButton> = [
    Markup.button.callback(`<<`, 'page_prev'),
    Markup.button.callback(
      `${currentPage}/${paginator.totalPages}`,
      'curr_page',
    ),
    Markup.button.callback(`>>`, 'page_prev'),
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
