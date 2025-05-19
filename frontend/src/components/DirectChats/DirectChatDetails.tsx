import { useParams } from "react-router-dom";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

import classes from "./DirectChatDetails.module.css";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className={classes["detail-content"]}>
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </div>
  );
};

export default DirectChatDetails;
