import { Module } from '@nestjs/common';
import { TelegramUpdate } from './telegram.update';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram.config.factory';
import { TelegramService } from './telegram.service';
import { AddEventWizard } from './wizards/add-event.wizard';

@Module({
  imports: [TelegrafModule.forRootAsync(options())],
  providers: [TelegramUpdate, TelegramService, AddEventWizard],
})
export class TelegramModule {}
