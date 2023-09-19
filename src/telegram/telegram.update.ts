import { Inject, Logger } from '@nestjs/common';
import {
  Start,
  Update,
  Ctx,
  On,
  Message,
  InjectBot,
  Action,
  SceneEnter,
  Hears,
  Scene,
  TELEGRAF_STAGE,
  InlineQuery,
  Context,
} from 'nestjs-telegraf';

import { Markup, Telegraf } from 'telegraf';
import { UserT } from './types/user.type';
import { actionButtons } from './buttons/start-inline.button';
import { eventButton } from './buttons/close-msg.button';
import { TelegramService } from './telegram.service';
import {
  ContextInlinekQueryI,
  ContextT,
  SceneInlineContext,
} from './types/context.type';
import MessageUtil from './utils/message.utils';
import { EventT } from './types/event.type';
import {
  InlineQueryResult,
  Message as MessageT,
} from 'telegraf/typings/core/types/typegram';
import { SchemaInlineKeyboard } from './types/schema-inline-keyboard';
import { createPaginateKb, formatISODate } from './buttons/utils';
import { Paginator } from 'apaginator';
import { InlineQueryResultT } from './types/inline-query-result.type';
import { DAYS, MONTHS } from './buttons/calendar-inline';
import { format } from 'ts-date';
import { actionEventBtns } from './buttons/event-action-buttons';
import { MemberEventT } from './types/memeber-event.type';
import { text } from 'stream/consumers';

@Update()
export class TelegramUpdate {
  // extends Telegraf<Context>
  private readonly logger = new Logger(TelegramUpdate.name);
  constructor(
    @InjectBot() private readonly bot: Telegraf<ContextT>,
    private telegramService: TelegramService,
  ) {} // NOTE:

  @Start()
  async onStart(@Ctx() ctx: ContextT, @Message() msg: MessageT.TextMessage) {
    this.logger.debug('onStart');
    ctx.replyWithHTML(
      `<b>${MessageUtil.welcomeUser(msg.from.username)}</b>`,
      actionButtons(),
    );
    const currentUser: UserT[] = await this.telegramService.getUser(
      msg.from.id,
    );
    console.log(currentUser.length);
    if (currentUser.length < 1) {
      console.log('length current user less 1');
      this.telegramService.addUser(
        msg.from.id,
        msg.chat.id,
        msg.from.username,
        msg.from.first_name,
      );
    }
    return;
  }

  // @SceneEnter('callback_query')
  @Action('create_event')
  async createEvent(@Ctx() ctx: ContextT) {
    this.logger.debug('createEvent');
    ctx.scene.enter('addEvent');
    this.telegramService.deleteMsgCallbackQuery(ctx);
  }

  @Action('my_event')
  async myEventAction(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('myEventAction');
    const userIdTelegram: number = ctx.update.callback_query.from.id;
    const events: EventT[] = await this.telegramService.getEvents(
      userIdTelegram,
    );
    const schemas: SchemaInlineKeyboard[] = [];
    events.forEach((event) => {
      schemas.push({ text: event.title, data: `event_${event.id}` });
    });
    const paginator: Paginator<SchemaInlineKeyboard> = new Paginator(
      schemas,
      5,
    );
    ctx.scene.state['paginator'] = paginator;

    ctx.reply(
      'Твои события',
      createPaginateKb(
        paginator.current(),
        paginator.currentPage,
        paginator.totalPages,
      ),
    );
  }

  @Action('page_next')
  async inlneMenuPageNext(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('InlineMenuPageNext');
    const paginator: Paginator<SchemaInlineKeyboard> =
      ctx.scene.state['paginator'];
    if (typeof paginator != 'undefined') {
      console.log(paginator);
      if (paginator.hasNext()) {
        paginator.next();
      }
      console.log(paginator.current());
      ctx.editMessageReplyMarkup(
        createPaginateKb(
          paginator.current(),
          paginator.currentPage,
          paginator.totalPages,
        ).reply_markup,
      );
    } else {
      ctx.deleteMessage(ctx.update.callback_query.message.message_id);
      this.myEventAction(ctx);
    }
  }

  @Action('page_prev')
  async inlneMenuPagePrev(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('InlineMenuPagePrev');
    const msgId: number = ctx.update.callback_query.message.message_id;
    const chatId: number = ctx.update.callback_query.from.id;
    const paginator: Paginator<SchemaInlineKeyboard> =
      ctx.scene.state['paginator'];
    if (typeof paginator != 'undefined') {
      if (paginator.hasPrevious()) {
        paginator.previous();
      }
      ctx.editMessageReplyMarkup(
        createPaginateKb(
          paginator.current(),
          paginator.currentPage,
          paginator.totalPages,
        ).reply_markup,
      );
    } else {
      this.bot.telegram.deleteMessage(chatId, msgId);
      this.myEventAction(ctx);
    }
  }

  @Action(/^event_\d/)
  async eventInfo(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('eventInfo');
    const eventId: string = ctx.update.callback_query['data'].split('_')[1];
    console.log(eventId);
    const event: EventT = await this.telegramService.getEvent(+eventId);
    const deadline: Date = event.deadline_datetime;
    ctx.replyWithHTML(
      `${event.title}\n---\nЗапланировано на ${formatISODate(deadline)}`,
      eventButton(event.id),
    );
  }

  @On('message')
  onMessageSendUser(@Message() msg: any, @Ctx() ctx: ContextT) {
    this.logger.debug('onMessageSendUser');
    console.log(ctx);
  }

  @Action('close_msg')
  async closeMessage(@Context() ctx: SceneInlineContext) {
    this.logger.debug('closeMessage');
    const chatId: number = ctx.update.callback_query.message.chat.id;
    const msgId: number = ctx.update.callback_query.message.message_id;
    this.bot.telegram.deleteMessage(chatId, msgId).catch((e) => console.log(e));
  }

  @Action(/to_send_msg_[0-9]+/)
  async toSendMemberEvent(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('toSendMemberEvent');
    const splitedData: string[] = ctx.update.callback_query['data'].split('_');
    const senderId: string = splitedData[splitedData.length - 1];
    ctx.scene.enter('dialogEvent');
    ctx.scene.state['send_to'] = senderId;
  }

  @Action('menu')
  menuAction(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('menuAction');
    console.log(ctx);
    const msgId: string = ctx.update['inline_message_id'];
    this.bot.telegram
      .deleteMessage(ctx.update.callback_query.from.id, +msgId)
      .catch((e) => {
        this.logger.error(Object.keys(e));
      });
    ctx.reply(MessageUtil.menuMsg(), actionButtons());
    ctx.scene.leave();
  }

  @Action(/members_event_\d/)
  async getMembersEvent(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('getMembersEvent');
    const splitedCallback: string =
      ctx.update.callback_query['data'].split('_');
    console.log(ctx.update.callback_query);
    const eventId: string = splitedCallback[splitedCallback.length - 1];
    this.logger.verbose(eventId);
    const membersEvent: MemberEventT[] =
      await this.telegramService.getEventMembersByEventId(+eventId);
    const schemas: SchemaInlineKeyboard[] = [];
    for (let i = 0; i < membersEvent.length; i++) {
      const member: MemberEventT = membersEvent[i];
      const user: UserT = await this.telegramService.getUserByTelegramId(
        member.member_telegram_id,
      );
      schemas.push({
        text: user.first_name,
        data: `to_send_msg_${user.chat_id}`,
      });
    }
    const paginator: Paginator<SchemaInlineKeyboard> = new Paginator(schemas);
    ctx.scene.state['paginator'] = paginator;
    ctx.reply(
      'Нажми на имя, чтобы отправить сообщение участнику',
      createPaginateKb(
        paginator.current(),
        paginator.currentPage,
        paginator.totalPages,
      ),
    );
  }

  @Action('add_member_event')
  async addMemberEvent(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('addMemberEvent');
    console.log(ctx);
    ctx.scene.enter('addEvent', { toStep: 4 });
  }

  @Action(/^to_send_msg_/)
  async toSendMsgMember(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('toSendMsgMember');
    const splitedData: string[] = ctx.update.callback_query['data'].split('_');
    const toSendChatId: string = splitedData[splitedData.length - 1];
    ctx.scene.enter('dialogEvent', { to_send_chat_id: +toSendChatId });
  }
}
