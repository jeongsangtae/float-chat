import { ChatMessage } from "../../types";

import classes from "./Chat.module.css";

const Chat = ({ message, date }: Pick<ChatMessage, "message" | "date">) => {
  const [year, month, day] = date.split(" ")[0].split(".");
  const formatted = `${year}년 ${month}월 ${day}일`;

  return (
    <div className={classes["chat-container"]}>
      <p className={classes["chat-message"]}>{message}</p>
      <p>{formatted}</p>
    </div>
  );
};

export default Chat;
