import { useNavigate } from "react-router-dom";

import { GroupChatInviteListProps } from "../../types";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

import classes from "./GroupChatInviteList.module.css";
import Avatar from "../Users/Avatar";

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

  // 그룹 채팅방 초대 날짜를 화면 표시 형식으로 변환

  // 공백 기준으로 날짜와 시간을 분리
  const [dateOnly, timeOnly] = kstDate.split(" ");

  // 날짜 부분을 "." 기준으로 분리
  const [year, month, day] = dateOnly.split(".");

  // 시간 부분을 ":" 기준으로 분리
  const [hour, minute] = timeOnly.split(":");

  // 문자열을 10진수 숫자로 변환 (ex: 04 -> 4)
  const numMonth = parseInt(month, 10);
  const numDay = parseInt(day, 10);
  const numHour = parseInt(hour, 10);

  // 오전인지 확인 (12시 이전이면 오전)
  const am = numHour < 12;

  // 오전일 때 0시는 12로 표기, 나머지는 그대로 표기
  // 오후일 때 13~23시는 12를 빼고, 12시는 그대로 12시로 표기
  const resultHour = am
    ? numHour === 0
      ? 12
      : numHour
    : numHour > 12
    ? numHour - 12
    : 12;

  // 오전/오후 표기
  const ampm = am ? "오전" : "오후";

  // 현재 날짜 정보
  const now = new Date(); // 현재 시간 기준의 Date 객체 생성

  // 그룹 채팅방 초대의 날짜를 기반으로 Date 객체 생성
  // 월은 0부터 시작하므로, -1 (ex: 4월 -> 3)
  const groupChatInviteDate = new Date(parseInt(year), numMonth - 1, numDay);

  // 오늘 날짜의 00:00:00 기준 Date 객체 생성
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 어제 날짜의 00:00:00 기준 Date 객체 생성
  // today 객체를 복사해서 날짜만 하루 전으로 수정
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // 메시지 날짜가 오늘 또는 어제인지 확인
  const todayChecked = groupChatInviteDate.getTime() === today.getTime();
  const yesterdayChecked =
    groupChatInviteDate.getTime() === yesterday.getTime();

  // 날짜 포맷 결과를 담는 변수
  let resultDate = `${ampm} ${resultHour}:${minute}`;

  // 조건에 따라 날짜 출력 형식 변경
  if (todayChecked) {
    // 오늘이면 년, 월, 일 생략하고 시간만 표기
    resultDate = `${ampm} ${resultHour}:${minute}`;
  } else if (yesterdayChecked) {
    // 어제면 "어제"라는 표시를 앞에 붙여서 표기
    resultDate = `어제 ${ampm} ${resultHour}:${minute}`;
  }

  // 그룹 채팅방 초대 수락
  const acceptGroupChatInviteHandler = async (): Promise<void> => {
    await acceptGroupChatInvite({ groupChatId, groupChatInviteId });

    // 그룹 채팅방 목록을 다시 가져와서 실시간 반영
    await getGroupChats();
  };

  // 그룹 채팅방 초대 거절
  const rejectGroupChatInviteHandler = async (): Promise<void> => {
    await rejectGroupChatInvite(groupChatInviteId);
  };

  // 그룹 채팅방 이동
  const groupChatMoveHandler = (): void => {
    navigate(`/group-chat/${groupChatId}`);
  };

  // 현재 사용자가 보낸 초대인지 여부
  const sendRequest = userInfo?._id === requester;

  // 이미 그룹 채팅방에 참여 중인지 여부
  const participant = status === "참여중";

  return (
    <li className={classes["group-chat-invite-item"]}>
      <div className={classes["group-chat-invite-main"]}>
        <Avatar
          nickname={requesterNickname}
          avatarImageUrl={avatarImageUrl}
          avatarColor={avatarColor}
        />

        <div className={classes["group-chat-invite-content"]}>
          <div className={classes["sender-info"]}>
            <div className={classes.nickname}>{requesterNickname}</div>
            <div className={classes.date}>{resultDate}</div>
          </div>

          <div className={classes["invite-info"]}>
            <div className={classes["room-title"]}>{roomTitle}</div>
            <div className={classes["participant-count"]}>
              멤버 {participantCount}명
            </div>
          </div>
        </div>
      </div>

      {/* 초대 대기 상태일 때 수락/거절 버튼 표시 */}
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

      {/* 이미 참여 중인 경우 채팅방 이동 버튼 표시 */}
      {!sendRequest && participant && (
        <div className={classes["group-chat-invite-text"]}>
          <button onClick={groupChatMoveHandler}>참여중</button>
        </div>
      )}
    </li>
  );
};

export default GroupChatInviteList;
