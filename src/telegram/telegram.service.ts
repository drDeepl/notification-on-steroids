import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserT } from './types/user.type';
import { ContextT } from './types/context.type';
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

  async addEvent(title: string, deadline: string) {
    this.logger.debug('addEvent');
    console.log(`title: ${title}\n deadline: ${deadline}`);
    this.logger.error('TODO');
  }
}
