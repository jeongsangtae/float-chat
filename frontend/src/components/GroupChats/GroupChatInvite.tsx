import { GroupChatInviteProps } from "../../types";

import useGroupChatStore from "../../store/groupChatStore";

const GroupChatInvite = ({
  roomId,
  friendId,
  nickname,
}: GroupChatInviteProps) => {
  const { inviteGroupChat } = useGroupChatStore();

  const groupChatInviteHandler = (): void => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    inviteGroupChat({ roomId, friendId, nickname });
  };

  return (
    <>
      <ul>
        <li>{nickname}</li>
        <button onClick={groupChatInviteHandler}>초대</button>
      </ul>
    </>
  );
};

export default GroupChatInvite;
