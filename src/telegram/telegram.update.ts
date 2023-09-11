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

import { Telegraf } from 'telegraf';
import { UserT } from './types/user.type';
import { actionButtons } from './buttons/start-inline.button';
import { TelegramService } from './telegram.service';
import { ContextT, SceneInlineContext } from './types/context.type';
import MessageUtil from './utils/message.utils';
import { EventT } from './types/event.type';
import { Message as MessageT } from 'telegraf/typings/core/types/typegram';
import { SchemaInlineKeyboard } from './types/schema-inline-keyboard';
import { createPaginateKb } from './buttons/utils';
import { Paginator } from 'apaginator';

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
      schemas.push({ text: event.title, data: `${event.id}` });
    });
    const paginator = new Paginator(schemas, 5);
    console.log(paginator.data);
    ctx.reply(
      'Твои события',
      createPaginateKb(schemas, paginator.totalPages, paginator.currentPage),
    );
  }
  @On('message')
  onMessage(@Message() msg: any, @Ctx() ctx: ContextT) {
    console.log(ctx);
  }
  @Action('close_msg')
  async closeMessage(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('closeMessage');
    const chatId: number = ctx.update.callback_query.message.chat.id;
    const msgId: number = ctx.update.callback_query.message.message_id;
    this.bot.telegram.deleteMessage(chatId, msgId);
  }
  @Action(/to_send_msg_[0-9]+/)
  async toSendMemberEvent(@Ctx() ctx: SceneInlineContext) {
    this.logger.debug('toSendMemberEvent');
    const splitedData: string[] = ctx.update.callback_query['data'].split('_');
    const senderId: string = splitedData[splitedData.length - 1];
    ctx.scene.enter('dialogEvent');
    ctx.scene.state['send_to'] = senderId;
  }
}
