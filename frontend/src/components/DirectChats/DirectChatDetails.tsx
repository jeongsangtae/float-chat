import { useEffect } from "react";
import { useParams } from "react-router-dom";

import useLayoutStore from "../../store/layoutStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

import classes from "./DirectChatDetails.module.css";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { setView } = useLayoutStore();

  useEffect(() => {
    setView("directChat");
  }, []);

  return (
    <div className={classes["detail-content"]}>
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </div>
  );
};

export default DirectChatDetails;
