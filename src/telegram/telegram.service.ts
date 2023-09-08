import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserT } from './types/user.type';
import { ContextT, SceneInlineContext } from './types/context.type';
import { EventCreated } from './types/event-created.type';
import { ValidDate } from 'ts-date';
import { Message as MessageT } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class TelegramService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(TelegramService.name);
  async getUser(userId: number): Promise<UserT[]> {
    this.logger.debug('getUser');
    return this.prisma.user.findMany({
      where: { telegram_id: userId },
    });
  }

  async addUser(
    telegram_id: number,
    username: string,
    first_name: string,
  ): Promise<UserT> {
    this.logger.debug('addUser');
    return this.prisma.user.create({
      data: {
        telegram_id: telegram_id,
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

  async addEvent(title: string, deadline: ValidDate): Promise<EventCreated> {
    this.logger.debug('addEvent');
    console.log(`title: ${title}\n deadline: ${deadline}`);
    this.logger.error('TODO');
    return this.prisma.event.create({
      data: {
        title: title,
        deadline_datetime: deadline,
      },
    });
  }

  async loading(ctx: SceneInlineContext, msg: MessageT.TextMessage) {
    const numbersSmile: String[] = ['5️⃣,4️⃣,3️⃣,2️⃣,1️⃣'];
    for (let i = 0; i < numbersSmile.length; i++) {
      setTimeout(() => {
        console.log(numbersSmile[i]);
        ctx.editMessageText(`${msg.text} ${numbersSmile[i]}`, msg);
      }, 1000);
    }
  }
}
