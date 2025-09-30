import { useState, useEffect, useRef } from "react";
import { shallow } from "zustand/shallow";

import useChatStore from "../../store/chatStore";
import useSocketStore from "../../store/socketStore";

import Chat from "./Chat";

import { ChatsProps } from "../../types";
import classes from "./Chats.module.css";
import useAuthStore from "../../store/authStore";

const Chats = ({ roomId, type, chatInfo }: ChatsProps) => {
  const { userInfo } = useAuthStore();
  // const { chatData, messages, lastReadMessage, saveLastReadMessageId } =
  //   useChatStore();

  const chatData = useChatStore((state) => state.chatData);
  const lastReadMessage = useChatStore((state) => state.lastReadMessage);
  const saveLastReadMessageId = useChatStore(
    (state) => state.saveLastReadMessageId
  );
  const messages = useChatStore((state) => state.messages, shallow);

  const { joinChatRoom, leaveChatRoom } = useSocketStore();

  // const initialMessageCount = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  // const prevMessagesLength = useRef<number>(messages.length);
  // const prevMessagesLength = useRef<number>(0);
  const firstRender = useRef<boolean>(false);

  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [toBottomButton, setToBottomButton] = useState(false);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    leaveChatRoom();
    joinChatRoom(roomId);

    firstRender.current = true;
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    chatData(roomId);
  }, [roomId]);

  // 스크롤 마지막에 보여지는 메시지 _id를 전달하는 로직
  // 마지막 메시지 _id를 Zustand 그리고 백엔드를 통해 전달
  // debounce 패턴을 추가해 스크롤이 멈추고 1초 뒤에 마지막 메시지 _id 전달
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || !roomId) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      // 기존 타이머 있으면 제거
      if (timeoutId) clearTimeout(timeoutId);

      // 스크롤 멈추고 1초 후 실행
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
        localStorage.setItem(
          `lastVisibleMessageId-${roomId}`,
          lastVisibleMessageId
        );
        // console.log("화면에 마지막으로 보이는 메시지 ID:", lastVisibleMessageId);
      }, 500);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId); // 정리
    };
  }, [messages]);

  // useEffect(() => {
  //   if (!roomId) return;

  //   const savedId = localStorage.getItem(`lastVisibleMessageId-${roomId}`);

  //   if (savedId) {
  //     setTimeout(() => {
  //       const targetEl = messageRefs.current[savedId];
  //       if (targetEl) {
  //         targetEl.scrollIntoView({ block: "nearest" });
  //       }
  //     }, 0);
  //   }
  // }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    if (lastReadMessage) {
      const targetEl =
        messageRefs.current[lastReadMessage.lastVisibleMessageId || ""];
      if (targetEl) {
        targetEl.scrollIntoView({ block: "nearest" });

        const lastMessageChecked =
          lastReadMessage.lastVisibleMessageId ===
          messages[messages.length - 1]?._id;

        if (lastMessageChecked) scrollToBottomHandler();
      }
    } else {
      scrollToBottomHandler();
      setShowNewMessageButton(false);
      setToBottomButton(false);
    }
  }, [lastReadMessage, roomId]);

  // useEffect(() => {
  //   const container = chatContainerRef.current;

  //   if (!container) return;

  //   const { scrollTop, scrollHeight, clientHeight } = container;

  //   const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
  //   // const currentUser = lastMessage?.email === userInfo?.email;
  //   const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;
  //   const lastMessage = messages[messages.length - 1];
  //   const isNewMessage = messages.length > prevMessagesLength.current;

  //   console.log(
  //     `새로운 메시지: ${isNewMessage}`,
  //     `메시지 길이: ${messages.length}`,
  //     `이전 메시지 길이: ${prevMessagesLength.current}`
  //   );

  //   prevMessagesLength.current = messages.length; // 최신 상태 저장

  //   console.log(
  //     `업데이트된 후 이전 메시지 길이: ${prevMessagesLength.current}`
  //   );

  //   // "내가 쓴 메시지인지" 체크
  //   const isMyMessage = lastMessage?.email === userInfo?.email;

  //   console.log(`새로운 메시지 확인: ${isNewMessage}`);
  //   console.log(`내가 메시지 쓴지 확인: ${isMyMessage}`);

  //   if (isNewMessage) {
  //     // 새로운 메시지가 추가됐고, 내가 쓴 메시지라면 스크롤 최하단 이동
  //     if (isMyMessage) {
  //       scrollToBottomHandler();
  //       setShowNewMessageButton(false);
  //       setToBottomButton(false);
  //       return;
  //     }
  //   }

  //   // 마지막 읽은 메시지 위치 복원 로직
  //   if (lastReadMessage && lastMessage) {
  //     if (lastReadMessage.lastVisibleMessageId === lastMessage._id) {
  //       scrollToBottomHandler();
  //       setShowNewMessageButton(false);
  //       setToBottomButton(false);
  //     } else {
  //       const targetEl =
  //         messageRefs.current[lastReadMessage.lastVisibleMessageId || ""];
  //       if (targetEl) {
  //         targetEl.scrollIntoView({ block: "nearest" });
  //       }
  //     }
  //   } else if (isAtBottom || nearBottom) {
  //     scrollToBottomHandler();
  //     setShowNewMessageButton(false);
  //     setToBottomButton(false);
  //   } else {
  //     setShowNewMessageButton(true);
  //     setToBottomButton(false);
  //   }
  // }, [messages]);

  // useEffect(() => {
  //   const container = chatContainerRef.current;

  //   if (!container) return;

  //   // if (!initialMessageCount.current) return

  //   // const loadLastVisibleMessageId = localStorage.getItem(
  //   //   `lastVisibleMessageId-${roomId}`
  //   // );

  //   // if (messages.length > 0 && initialMessageCount.current === null) {
  //   //   initialMessageCount.current = messages.length;
  //   // }

  //   // console.log(messages.length, initialMessageCount.current);

  //   // if (
  //   //   initialMessageCount.current !== null &&
  //   //   messages.length <= initialMessageCount.current
  //   // ) {
  //   //   return;
  //   // }

  //   const { scrollTop, scrollHeight, clientHeight } = container;

  //   const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
  //   const lastMessage = messages[messages.length - 1];
  //   const currentUser = lastMessage?.email === userInfo?.email;
  //   const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

  //   if (isAtBottom || currentUser || nearBottom) {
  //     console.log(lastReadMessage);
  //     if (lastReadMessage && lastMessage) {
  //       console.log(lastReadMessage.lastVisibleMessageId === lastMessage._id);
  //       if (lastReadMessage.lastVisibleMessageId === lastMessage._id) {
  //         scrollToBottomHandler();
  //         setShowNewMessageButton(false);
  //         setToBottomButton(false);
  //       } else {
  //         const targetEl =
  //           messageRefs.current[lastReadMessage.lastVisibleMessageId || ""];
  //         if (targetEl) {
  //           targetEl.scrollIntoView({ block: "nearest" });
  //         }
  //       }
  //     }
  //   } else {
  //     setShowNewMessageButton(true);
  //     setToBottomButton(false);
  //   }
  // }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    // if (!initialMessageCount.current) return

    // const loadLastVisibleMessageId = localStorage.getItem(
    //   `lastVisibleMessageId-${roomId}`
    // );

    // if (messages.length > 0 && initialMessageCount.current === null) {
    //   initialMessageCount.current = messages.length;
    // }

    // console.log(messages.length, initialMessageCount.current);

    // if (
    //   initialMessageCount.current !== null &&
    //   messages.length <= initialMessageCount.current
    // ) {
    //   return;
    // }

    const { scrollTop, scrollHeight, clientHeight } = container;

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    const lastMessage = messages[messages.length - 1];
    const currentUser = lastMessage?.email === userInfo?.email;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    console.log(firstRender.current);
    console.log(currentUser);

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (isAtBottom || currentUser || nearBottom) {
      setShowNewMessageButton(false);
      setToBottomButton(false);
      scrollToBottomHandler();
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
