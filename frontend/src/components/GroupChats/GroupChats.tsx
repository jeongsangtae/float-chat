import { useEffect, useState } from "react";
import useGroupChatStore from "../../store/groupChatStore";
import GroupChat from "./GroupChat";

import { ContextMenu } from "../../types";

import LoadingIndicator from "../UI/LoadingIndicator";

const GroupChats = () => {
  const { loading, groupChats, getGroupChats } = useGroupChatStore();

  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    id: null,
  });

  useEffect(() => {
    getGroupChats();
  }, []);

  // 로딩 중일 때
  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      {groupChats.map((groupChat) => (
        <GroupChat
          key={groupChat._id}
          _id={groupChat._id}
          hostId={groupChat.hostId}
          title={groupChat.title}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
        />
      ))}
    </>
  );
};

export default GroupChats;
