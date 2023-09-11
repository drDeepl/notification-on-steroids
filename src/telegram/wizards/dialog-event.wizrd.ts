import {
  Ctx,
  InjectBot,
  Message,
  On,
  Wizard,
  WizardStep,
} from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';
import { TelegramService } from '../telegram.service';
import { ContextT } from '../types/context.type';
import { Logger } from '@nestjs/common';
import { WizardContextCallback } from './types/wizard-context-callback.type';
import { UserT } from '../types/user.type';
import {
  InlineQueryResult,
  Message as MessageT,
} from 'telegraf/typings/core/types/typegram';
import { addedEventBtns } from '../buttons/added-event';
@Wizard('dialogEvent')
export class DialogEventWizard {
  private readonly logger = new Logger(DialogEventWizard.name);
  constructor(
    @InjectBot() private readonly bot: Telegraf<ContextT>,
    private telegramService: TelegramService,
  ) {}

  @WizardStep(1)
  async addEvent(@Ctx() ctx: WizardContextCallback) {
    this.logger.debug('wizard step 1');
    const callbackDataSerlz: string[] =
      ctx.update.callback_query['data'].split('_');

    // const senderId = callbackDataSerlz[callbackDataSerlz.length - 1];
    // ctx.wizard.state['senderId'] = senderId;
    // const sender: UserT = await this.telegramService.getUserByTelegramId(
    //   +senderId,
    // );
    // ctx.replyWithHTML(
    //   `создал диалог с "<b>${sender.first_name}</b>"\nНапиши ему..`,
    // );
    // console.log(sender);
    // ctx.wizard.state['senderFirstName'] = sender.first_name;
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(2)
  async sendMsgSender(
    @Ctx() ctx: Scenes.WizardContext,
    @Message() msg: MessageT.TextMessage,
  ) {
    this.logger.debug('sendMsgSender');
    const senderId: string = ctx.wizard.state['senderId'];
    const textMsg: string = msg.text;
    const senderFirstName: string = ctx.wizard.state['senderFirstName'];
    console.log(ctx.wizard.state);
    this.bot.telegram.sendMessage(
      senderId,
      `${senderFirstName}: ${textMsg}`,
      addedEventBtns(msg.from.id),
    );
  }
}
