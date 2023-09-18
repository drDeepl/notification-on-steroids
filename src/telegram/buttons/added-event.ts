import { Markup } from 'telegraf';

import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function addedEventBtns(
  toSendMsgUserId: number,
): Markup.Markup<InlineKeyboardMarkup> {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback(
        '💬 войти в диалог',
        `to_send_msg_${toSendMsgUserId}`,
      ),
      Markup.button.callback('в меню', 'menu'),
      Markup.button.callback('закрыть', 'close_msg'),
    ],

    {
      columns: 2,
    },
  );
}
