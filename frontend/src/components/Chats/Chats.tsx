import { useState, useEffect, useRef } from "react";

import useChatStore from "../../store/chatStore";
import useSocketStore from "../../store/socketStore";

import Chat from "./Chat";

import { ChatsProps } from "../../types";
import classes from "./Chats.module.css";
import useAuthStore from "../../store/authStore";

const Chats = ({ roomId, type, chatInfo }: ChatsProps) => {
  const { userInfo } = useAuthStore();
  const { chatData, messages } = useChatStore();
  const { joinGroupChat, leaveGroupChat } = useSocketStore();

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);

  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [toBottomButton, setToBottomButton] = useState(false);

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

  // 스크롤 마지막에 보여지는 메시지 _id를 확인하는 테스트 로직
  // 마지막 메시지 _id를 Zustand 그리고 백엔드를 통해 전달해 저장할 예정
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
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

      console.log("화면에 마지막으로 보이는 메시지 ID:", lastVisibleMessageId);
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    const lateMessage = messages[messages.length - 1];
    const currentUser = lateMessage?.email === userInfo?.email;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    console.log(
      firstRender.current,
      isAtBottom,
      currentUser,
      nearBottom,
      scrollTop + clientHeight,
      scrollHeight - 100
    );

    // console.log(scrollTop + clientHeight >= scrollHeight - 1);

    // if (isAtBottom || currentUser) {
    //   // 스크롤이 이미 맨 아래이거나 본인이 메시지를 추가한 경우
    //   scrollToBottomHandler();
    //   setShowNewMessageButton(false);
    //   // setToBottomButton(false);
    // } else {
    //   // 다른 사용자가 메시지를 보낸 경우, 버튼만 보여주고 스크롤 유지
    //   // setToBottomButton(true);
    //   // scrollToBottomHandler();
    //   setShowNewMessageButton(true);
    // }

    if (firstRender.current) {
      // 초기 렌더링 시에 스크롤이 최하단에 유지
      scrollToBottomHandler();
      setShowNewMessageButton(false);
      setToBottomButton(false);
      firstRender.current = false;
    } else if (isAtBottom) {
      // 스크롤이 최하단에 위치했을 때 그대로 최하단에 계속 유지
      scrollToBottomHandler();
      setShowNewMessageButton(false);
      setToBottomButton(false);
    } else if (currentUser) {
      // 메시지를 보낸 사용자의 경우 스크롤이 최하단에 위치
      scrollToBottomHandler();
      setShowNewMessageButton(false);
      setToBottomButton(false);
    } else if (nearBottom && !currentUser) {
      // 메시지를 보낸 사용자가 아니며, 스크롤이 최하단에서 일정 거리 떨어진 경우
      scrollToBottomHandler();
      setShowNewMessageButton(false);
      setToBottomButton(false);
    } else {
      setShowNewMessageButton(true);
      setToBottomButton(false);
    }
  }, [messages]);

  const scrollToBottomHandler = () => {
    // messagesEndRef.current?.scrollIntoView({ block: "nearest" });

    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  };

  const scrollToNewMessagesHandler = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;

    setShowNewMessageButton(false); // 버튼 숨기기
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;

    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // console.log(`scrollTop: ${scrollTop}`);
    // console.log(`clientHeight: ${clientHeight}`);
    // console.log(`scrollHeight: ${scrollHeight}`);

    // console.log(scrollTop + clientHeight >= scrollHeight - 1);

    // 오차를 줄이기 위해 -1을 사용
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      setToBottomButton(false);
      setShowNewMessageButton(false);
    } else {
      setToBottomButton(true);
    }

    // console.log(toBottomButton);
  };

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
    // <div className={classes.chats}>
    <div
      className={classes["chats-container"]}
      ref={chatContainerRef}
      onScroll={handleScroll}
    >
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

      {type === "group" && (
        <div className={classes["group-chat-starting"]}>
          <h1 className={classes.title}>
            {chatInfo.title}에 오신 것을 환영합니다
          </h1>
          <div>이 서버가 시작된 곳이에요.</div>
        </div>
      )}

      <div>{dateLineAndMessages}</div>

      {showNewMessageButton && (
        <button
          onClick={scrollToNewMessagesHandler}
          className={classes["new-message-button"]}
        >
          새로운 메시지
        </button>
      )}

      {toBottomButton && (
        <div
          className={classes["bottom-button"]}
          onClick={scrollToBottomHandler}
        >
          최신 메시지로 이동
        </div>
      )}
    </div>
  );
};

export default Chats;
