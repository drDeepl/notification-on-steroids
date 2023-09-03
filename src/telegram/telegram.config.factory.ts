import { ConfigService } from '@nestjs/config';
import {
  TelegrafModuleAsyncOptions,
  TelegrafModuleOptions,
} from 'nestjs-telegraf';
import { PrismaModule } from 'src/prisma/prisma.module';

const telegrafModuleOptions = (
  config: ConfigService,
): TelegrafModuleOptions => {
  return {
    token: config.get('TELEGRAM_TOKEN'),
  };
};

export const options = (): TelegrafModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => telegrafModuleOptions(config),
  };
};
