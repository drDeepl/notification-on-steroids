import { Scenes, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

export interface WizardContextCallback extends Scenes.WizardContext {
  update: Update.CallbackQueryUpdate;
}
