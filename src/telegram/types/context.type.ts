import { Context, Scenes } from 'telegraf';
import {
  CallbackQuery,
  InlineQuery,
  Update,
} from 'telegraf/typings/core/types/typegram';
import { SceneContext, SceneContextScene } from 'telegraf/typings/scenes';

export type ContextT = Scenes.SceneContext;

export interface SceneInlineContext extends Scenes.WizardContext {
  update: Update.CallbackQueryUpdate;
}

export interface ContextCallbackQueryI extends Scenes.SceneContext {
  update: Update.CallbackQueryUpdate;
}

export interface ContextInlinekQueryI extends Scenes.SceneContext {
  update: Update.InlineQueryUpdate;
  scenes: SceneContextScene<SceneContext>;
}
