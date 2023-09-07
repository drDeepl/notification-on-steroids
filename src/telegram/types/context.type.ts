import { Scenes } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

export type ContextT = Scenes.SceneContext;

export interface SceneInlineContext extends Scenes.WizardContext {
  update: Update.CallbackQueryUpdate;
}
