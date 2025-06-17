import { useNavigate } from "react-router-dom";

import { GroupChatInviteListProps } from "../../types";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

import classes from "./GroupChatInviteList.module.css";

const GroupChatInviteList = ({
  groupChatId,
  groupChatInviteId,
  requester,
  requesterNickname,
  roomTitle,
  status,
  kstDate,
  participantCount,
  avatarColor,
}: GroupChatInviteListProps) => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { getGroupChats, acceptGroupChatInvite, rejectGroupChatInvite } =
    useGroupChatStore();

  const acceptGroupChatInviteHandler = async (): Promise<void> => {
    await acceptGroupChatInvite({ groupChatId, groupChatInviteId });

    // 그룹 채팅방 목록을 다시 가져와서 실시간 반영
    await getGroupChats();
  };

  const rejectGroupChatInviteHandler = async (): Promise<void> => {
    await rejectGroupChatInvite(groupChatInviteId);
  };

  const groupChatMoveHandler = (): void => {
    navigate(`/group-chat/${groupChatId}`);
  };

  const sendRequest = userInfo?._id === requester;
  const participant = status === "참여중";

  return (
    <li className={classes["group-chat-invite-item"]}>
      <div className={classes["group-chat-invite-info"]}>
        <div className={classes["group-chat-invite-info-title"]}>
          {roomTitle} 멤버 {participantCount}명
        </div>
        <div className={classes["group-chat-invite-info-nickname"]}>
          <div
            className={classes.avatar}
            style={{ backgroundColor: avatarColor || "#ccc" }}
          >
            {requesterNickname.charAt(0)}
            {/* <div
              className={
                onlineChecked ? classes["online-dot"] : classes["offline-dot"]
              }
            /> */}
          </div>
          {requesterNickname}님의 초대
          <div>{kstDate}</div>
        </div>
      </div>

      {!sendRequest && !participant && (
        <div className={classes["group-chat-invite-buttons"]}>
          <button onClick={acceptGroupChatInviteHandler}>수락</button>
          <button onClick={rejectGroupChatInviteHandler}>거절</button>
        </div>
      )}

      {!sendRequest && participant && (
        <div className={classes["group-chat-invite-text"]}>
          <button onClick={groupChatMoveHandler}>참여중</button>
        </div>
      )}
    </li>
  );
};

export default GroupChatInviteList;
