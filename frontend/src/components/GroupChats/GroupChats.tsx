import { useEffect } from "react";
import useGroupChatStore from "../../store/groupChatStore";
import GroupChat from "./GroupChat";

import { ModalProps } from "../../types";
import LoadingIndicator from "../UI/LoadingIndicator";

const GroupChats = ({ onToggle }: ModalProps) => {
  const { loading, groupChats, getGroupChats } = useGroupChatStore();

  useEffect(() => {
    getGroupChats();
  }, []);

  // 로딩 중일 때
  if (loading) {
    return <LoadingIndicator />;
  }

  console.log(onToggle);

  return (
    <>
      {groupChats.length === 0 ? (
        <p>그룹 채팅방이 없습니다.</p>
      ) : (
        groupChats.map((groupChat) => (
          <GroupChat
            key={groupChat._id}
            _id={groupChat._id}
            title={groupChat.title}
            onToggle={onToggle}
          />
        ))
      )}
    </>
  );
};

export default GroupChats;
