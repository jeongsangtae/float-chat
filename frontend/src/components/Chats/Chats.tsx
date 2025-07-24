import { useEffect } from "react";

import useChatStore from "../../store/chatStore";
import useSocketStore from "../../store/socketStore";

import Chat from "./Chat";

import { ChatsProps } from "../../types";
import classes from "./Chats.module.css";

const Chats = ({ roomId, type, chatInfo }: ChatsProps) => {
  const { chatData, messages } = useChatStore();
  const { joinGroupChat, leaveGroupChat } = useSocketStore();

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }
    leaveGroupChat();
    joinGroupChat(roomId);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }
    chatData(roomId);
  }, [roomId]);

  let prevDate = ""; // 이전 메시지의 날짜를 저장하는 변수 (날짜 줄 중복 방지)
  let prevUserEmail = ""; // 이전 이메일을 저장하는 변수

  const dateLineAndMessages = messages.map((message) => {
    // 메시지의 날짜에서 년, 월, 일을 추출 (ex: "2025.04.12 13:25:12")
    const [year, month, day] = message.date.split(" ")[0].split(".");

    // 날짜를 ex)"2025년 4월 12일"처럼 보이도록 가공
    const currentDate = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;

    // 이전 메시지 날짜와 현재 메시지 날짜가 다르면 날짜 라인을 보여줌
    const showDateLine = currentDate !== prevDate;

    // 현재 메시지 날짜를 prevDate에 저장해 다른 메시지 비교에 사용
    prevDate = currentDate;

    // 이전 메시지와 같은 사용자인지 확인
    const sameUserAsPrevious = message.email === prevUserEmail;

    // 사용자가 달라졌거나 날짜가 바뀌었으면 닉네임을 보여줌
    const showNickname = !sameUserAsPrevious || showDateLine;

    // 닉네임을 보여주는 경우에만 현재 닉네임을 저장해 다음 비교에 사용
    if (showNickname) {
      prevUserEmail = message.email;
    }

    return (
      <div key={message._id}>
        {/* 날짜가 바뀌었을 경우에만 날짜 구분선 출력 */}
        {showDateLine && (
          <div className={classes["date-line"]}>{currentDate}</div>
        )}

        {/* 실제 채팅 메시지 렌더링 */}
        <Chat
          nickname={message.nickname}
          message={message.message}
          date={message.date}
          showNickname={showNickname}
          avatarColor={message.avatarColor}
        />
      </div>
    );
  });

  return (
    <div className={classes["chats-container"]}>
      {type === "direct" && (
        <div>
          <div
            className={classes.avatar}
            style={{ backgroundColor: chatInfo.avatarColor }}
          >
            {chatInfo.nickname?.charAt(0)}
          </div>
          <h1>{chatInfo.nickname}</h1>
          <div>{chatInfo.nickname}님과 나눈 다이렉트 채팅방 첫 부분이에요.</div>
        </div>
      )}
      {type === "group" && (
        <div>
          <h1>
            {chatInfo.hostNickname}님의 {chatInfo.title}에 오신 것을 환영합니다
          </h1>
          <p>이 서버가 시작된 곳이에요.</p>
        </div>
      )}
      {dateLineAndMessages}
    </div>
  );
};

export default Chats;
