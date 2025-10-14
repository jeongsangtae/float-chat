import { useState, useEffect, useRef } from "react";

import useChatStore from "../../store/chatStore";
import useSocketStore from "../../store/socketStore";

import Chat from "./Chat";

import { ChatsProps } from "../../types";
import classes from "./Chats.module.css";
import useAuthStore from "../../store/authStore";

const Chats = ({ roomId, type, chatInfo }: ChatsProps) => {
  const { userInfo } = useAuthStore();
  const { chatData, messages, lastReadMessage, saveLastReadMessageId } =
    useChatStore();

  const { joinChatRoom, leaveChatRoom } = useSocketStore();

  const prevMessagesLength = useRef<number | null>(null);
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

  // 스크롤이 멈춘 후 마지막으로 읽은 메시지 ID 저장하는 useEffect (디바운스 적용)
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || !roomId) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      // 기존 타이머 있으면 제거
      if (timeoutId) clearTimeout(timeoutId);

      // 스크롤 멈추고 0.5초 후 실행
      timeoutId = setTimeout(() => {
        const messagesInView = messages.filter((msg) => {
          const el = messageRefs.current[msg._id];
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.bottom <= window.innerHeight;
          // return rect.top >= 0 && rect.bottom <= window.innerHeight;
        });

        if (messagesInView.length === 0) return;

        const lastVisibleMessageId =
          messagesInView[messagesInView.length - 1]._id;

        saveLastReadMessageId(roomId, lastVisibleMessageId);

        // 메시지 개수를 로컬 스토리지에 저장
        localStorage.setItem(
          `prevMessagesLength-${roomId}`,
          String(messages.length)
        );
      }, 500);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId); // 정리
    };
  }, [messages]);

  // 마지막으로 읽은 메시지 위치 확인 및 초기 스크롤 제어
  useEffect(() => {
    if (!roomId) return;

    if (lastReadMessage) {
      // 마지막으로 읽은 메시지가 현재 대화의 마지막 메시지라면 하단으로 스크롤
      const lastMessageChecked =
        lastReadMessage.lastVisibleMessageId ===
        messages[messages.length - 1]?._id;

      if (lastMessageChecked) scrollToBottomHandler();
    } else {
      // 처음 진입했거나 읽은 기록이 없는 경우, 기본적으로 하단으로 스크롤
      scrollToBottomHandler();
      setShowNewMessageButton(false);
      setToBottomButton(false);
    }
  }, [lastReadMessage, roomId]);

  // 메시지 변경 시 스크롤 상태 제어 useEffect
  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    const loadPrevMessagesLength = Number(
      localStorage.getItem(`prevMessagesLength-${roomId}`)
    );

    // 이전 메시지 길이 초기화
    if (messages.length > 0 && prevMessagesLength.current === null) {
      prevMessagesLength.current = loadPrevMessagesLength;
    }

    // 이전 읽은 위치로 스크롤 (새로고침 or 방 재입장 시)
    if (messages.length <= loadPrevMessagesLength && lastReadMessage) {
      const targetEl =
        messageRefs.current[lastReadMessage.lastVisibleMessageId || ""];
      if (targetEl) {
        targetEl.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    // 새 메시지 추가 시 하단 제어
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    const lastMessage = messages[messages.length - 1];
    const currentUser = lastMessage?.email === userInfo?.email;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isAtBottom || currentUser || nearBottom) {
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
        />
      </div>
    );
  });

  return (
    <div
      className={classes["chats-container"]}
      ref={chatContainerRef}
      onScroll={handleScroll}
    >
      {/* 다이렉트 채팅 시작 안내 */}
      {type === "direct" && (
        <div className={classes["direct-chat-starting"]}>
          <div
            className={classes.avatar}
            style={{ backgroundColor: chatInfo.avatarColor }}
          >
            {chatInfo.nickname?.charAt(0)}
          </div>
          <h1 className={classes.nickname}>{chatInfo.nickname}</h1>
          <div>{chatInfo.nickname}님과 나눈 다이렉트 채팅방 첫 부분이에요.</div>
        </div>
      )}

      {/* 그룹 채팅 시작 안내 */}
      {type === "group" && (
        <div className={classes["group-chat-starting"]}>
          <h1 className={classes.title}>
            {chatInfo.title}에 오신 것을 환영합니다
          </h1>
          <div>이 서버가 시작된 곳이에요.</div>
        </div>
      )}

      <div>{dateLineAndMessages}</div>

      {/* <div className={classes["button-wrapper"]}> */}
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
      {/* </div> */}
    </div>
  );
};

export default Chats;
