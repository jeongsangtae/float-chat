import { ChatMessage } from "../../types";

import classes from "./Chat.module.css";

const Chat = ({ message }: Pick<ChatMessage, "message">) => {
  return (
    <div className={classes["chat-container"]}>
      <p className={classes["chat-message"]}>{message}</p>
    </div>
  );
};

export default Chat;
