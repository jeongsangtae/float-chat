import { useLoaderData } from "react-router-dom";
import GroupChat from "./GroupChat";

import { GroupChatData } from "../../types";

const GroupChats = () => {
  const groupChats = useLoaderData<GroupChatData[]>();

  console.log(groupChats);

  return (
    <>
      <div>그룹 채팅방</div>
      {groupChats.map((groupChat: GroupChatData) => {
        return (
          <GroupChat
            key={groupChat._id}
            _id={groupChat._id}
            title={groupChat.title}
          />
        );
      })}
    </>
  );
};

export default GroupChats;
