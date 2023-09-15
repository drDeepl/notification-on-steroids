import { Markup } from 'telegraf';

import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function actionButtons(): Markup.Markup<InlineKeyboardMarkup> {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('📋 Мои события', 'my_event'),
      // Markup.button.switchToCurrentChat('📋 Мои события', 'события'),
      Markup.button.callback('📝 Добавить событие', 'create_event'),
    ],

    {
      columns: 2,
    },
  );
}
