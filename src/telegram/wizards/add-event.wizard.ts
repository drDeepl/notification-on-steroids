import { Action, Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { ContextT } from '../types/context.type';
import { Logger } from '@nestjs/common';
import MessageUtil from '../utils/message.utils';
import { actionButtons } from '../buttons/start-inline.button';
@Wizard('addEvent')
export class AddEventWizard {
  private readonly logger = new Logger(AddEventWizard.name);
  @WizardStep(1)
  addEvent(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Отправь название события', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Меню', callback_data: 'menu' }]],
      },
    });
    ctx.wizard.next();
  }

  @Action('menu')
  menuAction(@Context() ctx: ContextT) {
    this.logger.debug('menuAction');
    ctx.reply(MessageUtil.menuMsg(), actionButtons());
    ctx.scene.leave();
  }
  
  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    console.log(ctx);
    ctx.reply('last scene');
  }
}
