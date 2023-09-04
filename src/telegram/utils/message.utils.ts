export class MessageUtil {
  public welcomeUser(username: string): string {
    return `Привет, ${username}.👋\nСоздадим событие?📝`;
  }

  public menuMsg(): string {
    return 'Что выберешь?🤔';
  }
}

export default new MessageUtil();
