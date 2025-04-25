import { GroupChatInviteProps } from "../../types";

import useGroupChatStore from "../../store/groupChatStore";

const GroupChatInvite = ({
  roomId,
  friendId,
  nickname,
  onToggle,
}: GroupChatInviteProps) => {
  const { inviteGroupChat } = useGroupChatStore();

  const groupChatInviteHandler = async (): Promise<void> => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    await inviteGroupChat({ roomId, friendId, nickname });
    onToggle();
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
