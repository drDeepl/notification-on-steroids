import {
  Action,
  Ctx,
  Message,
  On,
  Wizard,
  WizardStep,
  Context,
  InjectBot,
} from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';
import { ContextT, SceneInlineContext } from '../types/context.type';
import { Logger } from '@nestjs/common';
import MessageUtil from '../utils/message.utils';
import { actionButtons } from '../buttons/start-inline.button';
import { inlineCalendar } from '../buttons/calendar-inline';
import { TelegramService } from '../telegram.service';
import { Message as MessageT } from 'telegraf/typings/core/types/typegram';
import { EventCreated } from '../types/event-created.type';
import { ValidDate, parseIso, format } from 'ts-date/locale/ru';
@Wizard('addEvent')
export class AddEventWizard {
  private readonly logger = new Logger(AddEventWizard.name);
  constructor(
    @InjectBot() private readonly bot: Telegraf<ContextT>,
    private telegramService: TelegramService,
  ) {}

  @WizardStep(1)
  addEvent(@Ctx() ctx: Scenes.WizardContext) {
    ctx.reply('Давай выберем дату', inlineCalendar());
    ctx.wizard.next();
  }

  @Action('set_calendar')
  setCalendar(@Ctx() ctx: SceneInlineContext) {
    const msgIdPrev: number = ctx.update.callback_query.message.message_id;
    try {
      ctx.deleteMessage(msgIdPrev);
    } catch (e) {
      console.log(e);
      console.log(Object.keys(e));
    }
    ctx.wizard.back();
    ctx.reply('Вернул календарь!', inlineCalendar());
  }

  @Action('menu')
  menuAction(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('menuAction');
    const msgId: number = ctx.update.callback_query.message.message_id;
    ctx.deleteMessage(msgId).catch((e) => {
      this.logger.error(Object.keys(e));
    });
    ctx.reply(MessageUtil.menuMsg(), actionButtons());
    ctx.scene.leave();
  }

  @Action(/\d{4}-\d{1,2}-\d{1,2}/)
  @WizardStep(2)
  async step2(@Context() ctx: SceneInlineContext, @Message() msg: MessageT) {
    this.logger.debug('step2');
    const msgIdPrev: number = ctx.update.callback_query.message.message_id;
    try {
      ctx.deleteMessage(msgIdPrev).catch((e) => {
        this.logger.error(Object.keys(e));
      });
    } catch (e) {
      console.log(e);
      console.log(Object.keys(e));
    }
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
    ctx.wizard.state['msg_id_prev_step'] =
      ctx.update.callback_query.message.message_id;
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(3)
  async setTitleEvent(
    @Context() ctx: SceneInlineContext,
    @Message() msg: MessageT.TextMessage,
  ) {
    const deadline: ValidDate = parseIso(ctx.wizard.state['date_event']);
    const msgId: number = msg.message_id;
    const msgIdPrev: number = ctx.wizard.state['msg_id_prev_step'];
    for (let shift = 0; shift < msgId - msgIdPrev + 1; shift++) {
      ctx.deleteMessage(msgId - shift).catch((e) => {
        this.logger.error(Object.keys(e));
      });
    }

    const eventCreated: EventCreated = await this.telegramService.addEvent(
      msg.text,
      deadline,
      msg.from.id,
    );
    const msg_answer: string = `Добавил событие "${
      eventCreated.title
    }" на ${format(eventCreated.deadline_datetime, 'DD.MM.YYYY')}`;
    await ctx.reply(msg_answer, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'В меню', callback_data: 'menu' }],
          [{ text: 'Добавить человека', callback_data: 'add_member_event' }],
        ],
      },
    });
    // ctx.scene.leave();
  }
}
