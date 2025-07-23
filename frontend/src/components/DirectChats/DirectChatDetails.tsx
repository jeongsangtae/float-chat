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
      <div>아바타</div>
      <h1>상대방 닉네임</h1>
      <div>님과 나눈 다이렉트 채팅방 첫 시작 부분</div>
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </div>
  );
};

export default DirectChatDetails;
