import { Markup } from 'telegraf';

import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function eventButton(
  eventId: number,
): Markup.Markup<InlineKeyboardMarkup> {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('участники🤓', `members_event_${eventId}`),
      Markup.button.callback('🗑 удалить', `del_event$${eventId}`),
      Markup.button.callback('назад', 'prev_to_events'),
    ],
    { columns: 2 },
  );
}
