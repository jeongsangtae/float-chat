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
  avatarImageUrl,
}: GroupChatInviteListProps) => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { getGroupChats, acceptGroupChatInvite, rejectGroupChatInvite } =
    useGroupChatStore();

  const [dateOnly, timeOnly] = kstDate.split(" ");
  const [year, month, day] = dateOnly.split(".");
  const [hour, minute] = timeOnly.split(":");

  const numMonth = parseInt(month, 10);
  const numDay = parseInt(day, 10);
  const numHour = parseInt(hour, 10);

  const am = numHour < 12;

  const resultHour = am
    ? numHour === 0
      ? 12
      : numHour
    : numHour > 12
    ? numHour - 12
    : 12;

  const ampm = am ? "오전" : "오후";
  const now = new Date();
  const groupChatInviteDate = new Date(parseInt(year), numMonth - 1, numDay);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayChecked = groupChatInviteDate.getTime() === today.getTime();
  const yesterdayChecked =
    groupChatInviteDate.getTime() === yesterday.getTime();

  let resultDate = `${ampm} ${resultHour}:${minute}`;

  if (todayChecked) {
    resultDate = `${ampm} ${resultHour}:${minute}`;
  } else if (yesterdayChecked) {
    resultDate = `어제 ${ampm} ${resultHour}:${minute}`;
  }

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
      <div className={classes["group-chat-invite-main"]}>
        {avatarImageUrl ? (
          <img className={classes.avatar} src={avatarImageUrl} />
        ) : (
          <div
            className={classes.avatar}
            style={{ backgroundColor: avatarColor || "#ccc" }}
          >
            {requesterNickname.charAt(0)}
          </div>
        )}

        <div className={classes["group-chat-invite-content"]}>
          <div className={classes["sender-info"]}>
            <div className={classes.nickname}>{requesterNickname}</div>
            <div className={classes.date}>{resultDate}</div>
            {/* <div className={classes.date}>어제 {resultDate}</div> */}
          </div>

          <div className={classes["invite-info"]}>
            <div className={classes["room-title"]}>{roomTitle}</div>
            <div className={classes["participant-count"]}>
              멤버 {participantCount}명
            </div>
          </div>
        </div>
      </div>

      {!sendRequest && !participant && (
        <div className={classes["group-chat-invite-buttons"]}>
          <button
            className={classes["group-chat-invite-accept-button"]}
            onClick={acceptGroupChatInviteHandler}
          >
            수락
          </button>
          <button
            className={classes["group-chat-invite-reject-button"]}
            onClick={rejectGroupChatInviteHandler}
          >
            거절
          </button>
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
