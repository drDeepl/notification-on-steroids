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
} from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Scenes, Telegraf } from 'telegraf';
import { UserT } from './types/user.type';
import { actionButtons } from './buttons/start-inline.button';
import { TelegramService } from './telegram.service';
import { ContextT } from './types/context.type';
import MessageUtil from './utils/message.utils';

@Update()
export class TelegramUpdate {
  // extends Telegraf<Context>
  private readonly logger = new Logger(TelegramUpdate.name);
  constructor(
    @InjectBot() private readonly bot: Telegraf<ContextT>,

    private telegramService: TelegramService,
  ) {} // NOTE:

  @Start()
  async onStart(@Ctx() ctx: ContextT, @Message() msg: any) {
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
        msg.from.username,
        msg.from.first_name,
      );
    }
    return;
  }

  // @SceneEnter('callback_query')
  @On('callback_query')
  async createEvent(@Ctx() ctx: ContextT) {
    this.logger.debug('createEvent');
    // console.log(ctx.scene);
    ctx.scene.enter('addEvent');
  }
  @On('message')
  onMessage(@Message() msg: any, @Ctx() ctx: ContextT) {
    console.log(ctx);
  }
}
