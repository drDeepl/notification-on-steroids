import { Start, Update, Ctx, On, Message } from 'nestjs-telegraf';
import { PrismaService } from 'src/prisma/prisma.service';
import { Scenes, Telegraf } from 'telegraf';

type Context = Scenes.SceneContext;

@Update()
export class TelegramService extends Telegraf<Context> {
  constructor(token: any, private prisma: PrismaService) {
    super(token);
  }

  @Start()
  onStart(@Ctx() ctx: Context) {
    ctx.replyWithHTML('<b>Привет, создадим событие?</b>');
    return;
  }

  @On('message')
  onMessage(@Message() msg: any, @Ctx() ctx: Context) {
    console.log(msg.from);
  }
}
