import { Markup } from 'telegraf';
import {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
} from 'telegraf/typings/core/types/typegram';
import { SchemaInlineKeyboard } from '../types/schema-inline-keyboard';

export function createPaginateKb(
  schemas: SchemaInlineKeyboard[],
  countPages: number,
  currentPage: number,
): Markup.Markup<InlineKeyboardMarkup> {
  const btns: Array<Array<InlineKeyboardButton>> = [[]];
  for (let row = 0; row < schemas.length; row++) {
    const schema: SchemaInlineKeyboard = schemas[row];
    btns.push([Markup.button.callback(schema.text, `${schema.data}`)]);
  }
  const pages: Array<InlineKeyboardButton> = [
    Markup.button.callback(`<<`, 'page_prev'),
    Markup.button.callback(`${currentPage + 1}/${countPages}`, 'curr_page'),
    Markup.button.callback(`>>`, 'page_prev'),
  ];

  btns.push(pages);
  return Markup.inlineKeyboard(btns);
}
