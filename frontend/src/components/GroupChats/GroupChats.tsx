import { useLoaderData } from "react-router-dom";
import GroupChat from "./GroupChat";

import { GroupChatData } from "../../types";

const GroupChats = () => {
  const groupChatsResData = useLoaderData<GroupChatData[]>();

  return (
    <>
      <div>그룹 채팅방</div>
      {groupChatsResData.map((groupChatResData) => (
        <GroupChat title={groupChatResData.title} />
      ))}
    </>
  );
};

export default GroupChats;
