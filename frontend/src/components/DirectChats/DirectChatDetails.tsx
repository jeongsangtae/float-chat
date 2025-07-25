import { useEffect } from "react";
import { useParams } from "react-router-dom";

import useLayoutStore from "../../store/layoutStore";
import useAuthStore from "../../store/authStore";
import useDirectChatStore from "../../store/directChatStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

import classes from "./DirectChatDetails.module.css";
import DirectChatPanel from "./DirectChatPanel";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { setView } = useLayoutStore();
  const { userInfo } = useAuthStore();
  const { directChats } = useDirectChatStore();

  useEffect(() => {
    setView("directChat");
  }, []);

  const directChat = directChats.find(
    (directChat) => directChat._id === roomId
  );

  const otherUser = directChat?.participants.find(
    (participant) => participant._id !== userInfo?._id
  );

  return (
    <div className={classes["detail-content"]}>
      <Chats
        roomId={roomId}
        type="direct"
        chatInfo={{
          nickname: otherUser?.nickname,
          avatarColor: otherUser?.avatarColor,
        }}
      />
      <ChatInput roomId={roomId} />
      <DirectChatPanel
        chatInfo={{
          nickname: otherUser?.nickname,
          avatarColor: otherUser?.avatarColor,
        }}
      />
    </div>
  );
};

export default DirectChatDetails;
