export type InlineQueryResultT = {
  type: string;
  id: number;
  title: string;
  input_message_content: {
    message_text: string;
  };
  reply_markup?: Object;
};
