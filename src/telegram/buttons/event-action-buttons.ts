import { Markup } from 'telegraf';

import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function actionEventBtns(
  eventTitle: string,
): Markup.Markup<InlineKeyboardMarkup> {
  return Markup.inlineKeyboard(
    [
      Markup.button.switchToCurrentChat('участники', `участники:${eventTitle}`),
      Markup.button.callback('📝 добавить участника', 'add_member_event'),
      Markup.button.callback('закрыть', 'close_event'),
    ],

    {
      columns: 2,
    },
  );
}
