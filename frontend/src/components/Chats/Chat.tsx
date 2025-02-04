import { ChatMessage } from "../../types";

const Chat = ({ message }: Pick<ChatMessage, "message">) => {
  return (
    <>
      <p>{message}</p>
    </>
  );
};

export default Chat;
