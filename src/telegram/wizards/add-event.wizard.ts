import {
  Action,
  Ctx,
  Message,
  On,
  Wizard,
  WizardStep,
  Context,
} from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { ContextT, SceneInlineContext } from '../types/context.type';
import { Logger } from '@nestjs/common';
import MessageUtil from '../utils/message.utils';
import { actionButtons } from '../buttons/start-inline.button';
import { inlineCalendar } from '../buttons/calendar-inline';
import { TelegramService } from '../telegram.service';
import { Message as MessageT } from 'telegraf/typings/core/types/typegram';

@Wizard('addEvent')
export class AddEventWizard {
  private readonly logger = new Logger(AddEventWizard.name);
  constructor(private telegramService: TelegramService) {}

  @WizardStep(1)
  addEvent(@Ctx() ctx: Scenes.WizardContext) {
    ctx.reply('Давай выберем дату', inlineCalendar());
    ctx.wizard.next();
  }

  @Action('set_calendar')
  setCalendar(@Ctx() ctx: SceneInlineContext) {
    const msgIdPrev: number = ctx.update.callback_query.message.message_id;
    ctx.deleteMessage(msgIdPrev);
    ctx.wizard.back();
    ctx.reply('Вернул календарь!', inlineCalendar());
  }

  @Action('menu')
  menuAction(@Ctx() ctx: SceneInlineContext) {
    const msgIdPrev: number = ctx.update.callback_query.message.message_id;
    ctx.deleteMessage(msgIdPrev);
    this.logger.debug('menuAction');
    ctx.reply(MessageUtil.menuMsg(), actionButtons());
    ctx.scene.leave();
  }

  @Action(/\d{1,2}-\d{1,2}-\d{4}/)
  @WizardStep(2)
  async step2(@Context() ctx: SceneInlineContext, @Message() msg: MessageT) {
    this.logger.debug('step2');
    const msgIdPrev: number = ctx.update.callback_query.message.message_id;
    ctx.deleteMessage(msgIdPrev);
    const dateEvent: string = ctx.update.callback_query['data'];
    ctx.reply('Супер, теперь отправь название для события', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Меню', callback_data: 'menu' },
            { text: 'Верни календарь', callback_data: 'set_calendar' },
          ],
        ],
      },
    });

    ctx.wizard.state['date_event'] = dateEvent;
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(3)
  setTitleEvent(
    @Context() ctx: SceneInlineContext,
    @Message() msg: MessageT.TextMessage,
  ) {
    const deadline: string = ctx.wizard.state['date_event'];
    ctx.reply(`Добавил событие "${msg.text}" на ${deadline}`);
    this.telegramService.addEvent(msg.text, deadline);
  }
}
