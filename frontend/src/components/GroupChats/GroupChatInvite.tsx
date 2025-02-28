import { FriendUser } from "../../types";

const GroupChatInvite = ({ nickname }: Pick<FriendUser, "nickname">) => {
  return (
    <>
      <ul>
        <li>{nickname}</li>
        <button>초대</button>
      </ul>
    </>
  );
};

export default GroupChatInvite;
