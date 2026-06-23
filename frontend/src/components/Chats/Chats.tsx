import { useState, useEffect, useRef } from "react";

import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";
import useSocketStore from "../../store/socketStore";

import Chat from "./Chat";

import { ChatsProps } from "../../types";
import classes from "./Chats.module.css";
import Avatar from "../Users/Avatar";

const Chats = ({ roomId, chatInfo }: ChatsProps) => {
  const { userInfo } = useAuthStore();
  const { chatData, messages } = useChatStore();

  const { joinChatRoom, leaveChatRoom } = useSocketStore();

  // const prevMessagesLength = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [toBottomButton, setToBottomButton] = useState(false);

  // 채팅방 입장 시 기존 채팅방 나가고 새 방에 참여하는 useEffect
  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    leaveChatRoom();
    joinChatRoom(roomId);
  }, [roomId]);

  // 해당 채팅방의 채팅 데이터 불러오기
  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    chatData(roomId);
  }, [roomId]);

  // 마지막 읽은 메시지 복원 기능은
  // 의도한 것과 다르게 동작하기 때문에 일단 비활성화하고 삭제
  // 추후 unread anchor 기반으로 재구성 예정 (Git 참고)

  // 채팅방 입장 시 스크롤 최하단으로 이동 useEffect
  useEffect(() => {
    if (!roomId) return;

    scrollToBottomHandler();

    setShowNewMessageButton(false);
    setToBottomButton(false);
  }, [roomId]);

  // 메시지 변경 시 스크롤 상태 제어 useEffect
  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // 스크롤이 맨 아래에 있는지 확인 (오차를 줄이기 위해서 -1 사용)
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    // 스크롤이 거의 맨 아래에 있는지 확인
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    const lastMessage = messages[messages.length - 1];

    const currentUser = lastMessage?.email === userInfo?.email;

    if (isAtBottom || nearBottom || currentUser) {
      // 스크롤이 맨 아래에 있는 경우
      // 스크롤이 맨 아래에 가까운 경우
      // 마지막으로 메시지를 전송한 사용자와 현재 로그인한 사용자가 일치하는 경우
      setShowNewMessageButton(false);
      setToBottomButton(false);
      scrollToBottomHandler();
    } else {
      setShowNewMessageButton(true);
      setToBottomButton(false);
    }
  }, [messages]);

  // 스크롤을 최하단으로 이동하는 함수
  const scrollToBottomHandler = () => {
    // messagesEndRef.current?.scrollIntoView({ block: "nearest" });
    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  };

  // 새 메시지 버튼 클릭 시 하단으로 이동하는 함수
  const scrollToNewMessagesHandler = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;

    setShowNewMessageButton(false); // 버튼 숨기기
  };

  // 스크롤 시 하단 버튼 표시 제어하는 함수
  const handleScroll = () => {
    const container = chatContainerRef.current;

    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // 오차를 줄이기 위해 -1을 사용
    if (isAtBottom) {
      setToBottomButton(false);
      setShowNewMessageButton(false);
    } else if (!isAtBottom && !showNewMessageButton) {
      setToBottomButton(true);
    }
  };

  // 날짜 / 닉네임 구분 처리
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
      <div
        key={message._id}
        ref={(el) => (messageRefs.current[message._id] = el)}
      >
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
          avatarImageUrl={message.avatarImageUrl}
        />
      </div>
    );
  });

  return (
    <div className={classes["chats-container"]}>
      <div
        className={classes["messages-container"]}
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {/* 다이렉트 채팅 시작 안내 */}
        {chatInfo.type === "direct" && (
          <div className={classes["direct-chat-starting"]}>
            <Avatar
              nickname={chatInfo.nickname ?? ""}
              avatarImageUrl={chatInfo.avatarImageUrl}
              avatarColor={chatInfo.avatarColor}
              extraClass="direct-chat-starting-avatar"
            />

            <h1 className={classes.nickname}>{chatInfo.nickname}</h1>
            <div>
              {chatInfo.nickname}님과 나눈 다이렉트 채팅방 첫 부분이에요.
            </div>
          </div>
        )}

        {/* 그룹 채팅 시작 안내 */}
        {chatInfo.type === "group" && (
          <div className={classes["group-chat-starting"]}>
            <h1 className={classes.title}>
              {chatInfo.title}에 오신 것을 환영합니다
            </h1>
            <div>이 서버가 시작된 곳이에요.</div>
          </div>
        )}

        <div>{dateLineAndMessages}</div>
      </div>

      {/* 새 메시지 버튼 */}
      {showNewMessageButton && (
        <button
          onClick={scrollToNewMessagesHandler}
          className={classes["new-message-button"]}
        >
          읽지않은 새로운 메시지가 있어요
        </button>
      )}

      {/* 최신 메시지로 이동 버튼 */}
      {toBottomButton && (
        <div
          className={classes["bottom-button"]}
          onClick={scrollToBottomHandler}
        >
          최신 메시지로 이동하기
        </div>
      )}
    </div>
  );
};

export default Chats;
