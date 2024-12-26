import { useLoaderData } from "react-router-dom";
import GroupChat from "./GroupChat";

import { GroupChatData } from "../../types";

const GroupChats = () => {
  const groupChats = useLoaderData<{ groupChats: GroupChatData[] }>();

  console.log(groupChats);

  return (
    <>
      <div>그룹 채팅방</div>
      {groupChats.map((groupChat) => {
        return <GroupChat key={groupChat._id} title={groupChat.title} />;
      })}
    </>
  );
};

export default GroupChats;
