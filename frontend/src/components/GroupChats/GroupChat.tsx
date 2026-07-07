import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";

import { GroupChatProps } from "../../types";

import classes from "./GroupChat.module.css";

const GroupChat = ({
  _id,
  hostId,
  title,
  contextMenu,
  setContextMenu,
}: GroupChatProps) => {
  const { userInfo } = useAuthStore();
  const { toggleModal } = useModalStore();

  const location = useLocation();

  // 툴팁 위치
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // 툴팁 표시 여부
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // 현재 접속 중인 그룹 채팅방인지 확인
  const active = location.pathname === `/group-chat/${_id}`;

  // 컨텍스트 메뉴 DOM 참조
  const contextMenuRef = useRef<HTMLUListElement | null>(null);

  // 우클릭 컨텍스트 메뉴 열기
  const contextMenuOpenHandler = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();
    event.stopPropagation(); // 우클릭 이벤트가 전역 우클릭 이벤트까지 퍼지지 않게 막음

    // 이미 메뉴가 열려 있으면 닫기만 하고 끝
    if (contextMenu.visible) {
      contextMenuCloseHandler();
      return;
    }

    // 메뉴가 안 열려 있으면 열기
    setContextMenu({
      visible: true,
      x: event.pageX,
      y: event.pageY,
      id: _id,
    });
  };

  // 마우스를 올리면 제목 툴팁 표시
  const mouseEnterHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setTooltipPos({
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
    });

    setShowTooltip(true);
  };

  // 마우스가 벗어나면 툴팁 숨김
  const mouseLeaveHandler = () => {
    setShowTooltip(false);
  };

  // 컨텍스트 메뉴 닫기
  const contextMenuCloseHandler = (): void => {
    setContextMenu({ visible: false, x: 0, y: 0, id: null });
  };

  // 그룹 채팅방 삭제 모달 열기
  const groupChatDeleteHandler = async (): Promise<void> => {
    toggleModal("groupChatConfirm", "DELETE", { _id, type: "delete" });
    contextMenuCloseHandler();
  };

  // 그룹 채팅방 나가기 모달 열기
  const groupChatLeaveHandler = async (): Promise<void> => {
    toggleModal("groupChatConfirm", "DELETE", { _id, type: "leave" });
    contextMenuCloseHandler();
  };

  // 그룹 채팅방 수정 모달 열기
  const groupChatEditHandler = (): void => {
    toggleModal("groupChatForm", "PATCH", { _id, title });
    contextMenuCloseHandler();
  };

  // 컨텍스트 메뉴 외부 클릭 및 우클릭 처리
  useEffect(() => {
    // 외부 좌클릭 감지 함수
    const outsideClickHandler = (event: MouseEvent): void => {
      // 메뉴 외부를 클릭하면 컨텍스트 메뉴 닫기
      if (
        contextMenu.visible &&
        contextMenuRef.current &&
        // contains()는 Node 타입의 인자를 필요로 함
        // event.target은 EventTarget 타입이므로, 확실하게 Node라고 단언 (as Node)
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        contextMenuCloseHandler();
      }
    };

    // 외부 우클릭 감지 함수
    const outsideContextMenuHandler = (event: MouseEvent): void => {
      event.preventDefault(); // 기본 브라우저 컨텍스트 메뉴 막기
      contextMenuCloseHandler(); //메뉴창 닫기
    };

    // 좌클릭 이벤트를 전역에 등록
    document.addEventListener("click", outsideClickHandler);
    // 우클릭 이벤트를 전역에 등록
    document.addEventListener("contextmenu", outsideContextMenuHandler);
    // 컴포넌트가 언마운트되거나 context.visible이 변경되면 클린업
    return () => {
      document.removeEventListener("click", outsideClickHandler);
      document.removeEventListener("contextmenu", outsideContextMenuHandler);
    };
  }, [contextMenu.visible]); // visible 상태가 바뀔 때마다 리렌더링

  return (
    <>
      <div
        className={`${classes["group-chat"]} ${active ? classes.active : ""}`}
        onMouseEnter={mouseEnterHandler}
        onMouseLeave={mouseLeaveHandler}
        onContextMenu={contextMenuOpenHandler}
      >
        <Link
          to={`/group-chat/${_id.toString()}`}
          className={`${classes.title} ${
            title.length > 12 ? classes["title-small"] : ""
          }`}
        >
          {title}
        </Link>

        <span className={classes.indicator} />
        {/* 마우스를 올리면 전체 제목 툴팁 표시 */}
        {showTooltip && (
          <div
            className={classes["tooltip-text"]}
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translateY(-50%)",
            }}
          >
            {title}
          </div>
        )}
      </div>

      {/* 현재 그룹 채팅방의 컨텍스트 메뉴 */}
      {contextMenu.visible && contextMenu.id === _id && (
        <ul
          className={classes["context-menu"]}
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {hostId === userInfo?._id ? (
            <>
              <button type="button" onClick={groupChatEditHandler}>
                채팅방 수정
              </button>
              <button type="button" onClick={groupChatDeleteHandler}>
                채팅방 삭제
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={groupChatLeaveHandler}>
                채팅방 나가기
              </button>
            </>
          )}
        </ul>
      )}
    </>
  );
};

export default GroupChat;
