import { Markup } from 'telegraf';
import { switchToCurrentChat } from 'telegraf/typings/button';

import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function addedEventBtns(
  toSendMsgUserId: number,
): Markup.Markup<InlineKeyboardMarkup> {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('💬 написать', `to_send_msg_${toSendMsgUserId}`),
      Markup.button.callback('закрыть', 'close_msg'),
    ],

    {
      columns: 2,
    },
  );
}
