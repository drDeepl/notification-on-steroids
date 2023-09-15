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
import { Markup, Scenes, Telegraf } from 'telegraf';
import { ContextT, SceneInlineContext } from '../types/context.type';
import { Logger } from '@nestjs/common';
import MessageUtil from '../utils/message.utils';
import { actionButtons } from '../buttons/start-inline.button';
import { inlineCalendar } from '../buttons/calendar-inline';
import { addedEventBtns } from '../buttons/added-event';
import { TelegramService } from '../telegram.service';
import {
  InlineKeyboardMarkup,
  InlineQueryResult,
  Message as MessageT,
} from 'telegraf/typings/core/types/typegram';
import { EventCreated } from '../types/event-created.type';
import { ValidDate, parseIso, format } from 'ts-date/locale/ru';
import { UserT } from '../types/user.type';
import { MemberEventT } from '../types/memeber-event.type';
import { actionEventBtns } from '../buttons/event-action-buttons';
@Wizard('addEvent')
export class AddEventWizard {
  private readonly logger = new Logger(AddEventWizard.name);
  constructor(
    @InjectBot() private readonly bot: Telegraf<ContextT>,
    private telegramService: TelegramService,
  ) {}

  @WizardStep(1)
  addEvent(@Ctx() ctx: Scenes.WizardContext) {
    this.logger.debug('addEvemt');
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
    console.log(deadline);
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
      reply_markup: actionEventBtns(eventCreated.title).reply_markup,
    });
    // ctx.scene.leave();
    ctx.wizard.state['createdEvent'] = eventCreated;
    ctx.wizard.next();
  }

  @Action('add_member_event')
  @WizardStep(4)
  async addMemberEvent(@Context() ctx: SceneInlineContext) {
    this.logger.debug('addMemberEvent');
    ctx.replyWithHTML(
      'Отправь мне <b>имя пользователя</b>, которого хочешь добавить к событию и у него появится событие\nОно начинается с <b>@</b>',
    );
  }

  @On('text')
  @WizardStep(4)
  async setMemberToEvent(
    @Context() ctx: SceneInlineContext,
    @Message() msg: MessageT.TextMessage,
  ) {
    this.logger.debug('setMemberToEvent');
    const username: string = msg.text.trim();
    const user: UserT[] = await this.telegramService.getUserByUsername(
      username,
    );

    if (user.length > 0) {
      const createdEvent: EventCreated = ctx.wizard.state['createdEvent'];
      console.log(createdEvent);
      const memberEvent: MemberEventT = await this.telegramService.setEventUser(
        createdEvent.id,
        user[0].telegram_id,
      );
      const actionCreatedEventBtns: Markup.Markup<InlineKeyboardMarkup> =
        addedEventBtns(ctx.from.id);
      console.log(memberEvent);
      ctx.replyWithHTML(
        `Добавил <b>${username}</b> к событию`,
        actionCreatedEventBtns,
      );

      this.bot.telegram.sendMessage(
        user[0].chat_id,
        `${ctx.from.username} добавил(а) тебя к событию "${createdEvent.title}"`,
        addedEventBtns(user[0].chat_id),
      );
      ctx.scene.leave();
    } else {
      ctx.replyWithHTML(
        `Я не нашел пользователя с именем <b>"${username}"</b>`,
      );
    }
  }
}
