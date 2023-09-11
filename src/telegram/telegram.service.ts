import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserT } from './types/user.type';
import { ContextT, SceneInlineContext } from './types/context.type';
import { EventCreated } from './types/event-created.type';
import { ValidDate } from 'ts-date';
import { Message as MessageT } from 'telegraf/typings/core/types/typegram';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { EventT } from './types/event.type';
import { MemberEventT } from './types/memeber-event.type';

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<ContextT>,
    private prisma: PrismaService,
  ) {}

  private readonly logger = new Logger(TelegramService.name);
  async getUser(userId: number): Promise<UserT[]> {
    this.logger.debug('getUser');
    return this.prisma.user.findMany({
      where: { telegram_id: userId },
    });
  }

  async getUserByUsername(username: string): Promise<UserT[]> {
    this.logger.debug('getUserByUsername');
    return this.prisma.user.findMany({
      where: {
        username: username,
      },
    });
  }
  async getUserByTelegramId(telegramId: number): Promise<UserT> {
    this.logger.debug('getUserByTelegramId');
    return this.prisma.user.findUnique({
      where: {
        telegram_id: telegramId,
      },
    });
  }

  async addUser(
    telegram_id: number,
    chat_id: number,
    username: string,
    first_name: string,
  ): Promise<UserT> {
    this.logger.debug('addUser');
    return this.prisma.user.create({
      data: {
        telegram_id: telegram_id,
        chat_id: chat_id,
        username: username,
        first_name: first_name,
      },
    });
  }

  async deleteMsgCallbackQuery(ctx: ContextT): Promise<void> {
    this.logger.debug('deleteMsg');
    const msgId: number = ctx.update?.['callback_query'].message.message_id;
    ctx.deleteMessage(msgId);
  }

  async addEvent(
    title: string,
    deadline: ValidDate,
    userIdtelegram: number,
  ): Promise<EventCreated> {
    this.logger.debug('addEvent');
    console.log(`title: ${title}\n deadline: ${deadline}`);
    this.logger.error('TODO');
    return this.prisma.event.create({
      data: {
        title: title,
        deadline_datetime: deadline,
        user_id_telegram: userIdtelegram,
      },
    });
  }

  async getEvents(userIdTelegram: number): Promise<EventT[]> {
    this.logger.debug('getEvents');
    return this.prisma.event.findMany({
      where: {
        user_id_telegram: userIdTelegram,
      },
    });
  }
  async setEventUser(eventId: number, memberId: number): Promise<MemberEventT> {
    this.logger.debug('setEventUser');
    return this.prisma.membersEvent.create({
      data: {
        event_id: eventId,
        member_telegram_id: memberId,
      },
    });
  }
}
