import { useEffect, useState, useMemo } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { ContextMenu } from "../../types";

import LoadingIndicator from "../UI/LoadingIndicator";
import DraggableGroupChat from "./DraggableGroupChat";

import classes from "./GroupChats.module.css";

const GroupChats = () => {
  const { userInfo, updateUserGroupChatOrder } = useAuthStore();
  const { loading, groupChats, getGroupChats, saveGroupChatOrder } =
    useGroupChatStore();

  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    id: null,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [activeGroupChatId, setActiveGroupChatId] = useState<string | null>(
    null
  );

  useEffect(() => {
    getGroupChats();
  }, []);

  // 드래그 시작 조건 설정 (8px 이상 이동 시 드래그 시작)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 현재 드래그 중인 그룹 채팅방 정보
  const activeGroupChat = useMemo(() => {
    return groupChats.find((c) => c._id === activeGroupChatId);
  }, [activeGroupChatId, groupChats]);

  // 사용자가 저장한 순서대로 그룹 채팅방 정렬
  const sortedGroupChats = useMemo(() => {
    const order = userInfo?.groupChatOrder ?? [];

    if (!order.length) return groupChats;

    // 채팅방 ID와 순서를 빠르게 조회하기 위한 Map 생성
    const orderMap = new Map(order.map((id, index) => [id, index]));

    return [...groupChats].sort((a, b) => {
      const aIndex = orderMap.get(a._id);
      const bIndex = orderMap.get(b._id);

      // order에 없는 채팅방은 뒤로
      if (aIndex === undefined) return 1;
      if (bIndex === undefined) return -1;

      return aIndex - bIndex;
    });
  }, [userInfo?.groupChatOrder, groupChats]);

  // 로딩 중일 때
  if (loading) {
    return <LoadingIndicator />;
  }

  // 드래그 시작
  const dragStartHandler = (event: DragStartEvent) => {
    // 타입 단언
    // event.active.id를 string으로 취급
    const id = event.active.id as string;

    // 타입 가드 예시
    // 런타임에서 string인지 확인하는 방식
    // if (typeof id !== "string") return;

    // 현재 드래그 중인 채팅방 저장
    setActiveGroupChatId(id);
    setActiveIndex(sortedGroupChats.findIndex((c) => c._id === id));
  };

  // 현재 드래그 중인 위치 추적
  const dragOverHandler = (event: DragOverEvent) => {
    if (!event.over) return;

    setOverIndex(sortedGroupChats.findIndex((c) => c._id === event.over!.id));
  };

  // 드래그 종료 후 채팅방 순서 저장
  const dragEndHandler = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveGroupChatId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortedGroupChats.findIndex((c) => c._id === active.id);
    const newIndex = sortedGroupChats.findIndex((c) => c._id === over.id);

    // 변경된 순서대로 채팅방 배열 재정렬
    const newOrderChats = arrayMove(sortedGroupChats, oldIndex, newIndex);

    // 정렬된 채팅방 ID 목록 생성
    const newOrderIds = newOrderChats.map((c) => c._id);

    // 로컬 상태와 서버에 변경된 순서 저장
    updateUserGroupChatOrder(newOrderIds);
    saveGroupChatOrder(newOrderIds);
  };

  // 이전 SortableContext 기반 실시간 재정렬 구현은 제거
  // 필요 시 Git History 참고
  // 관련 커밋: code cleanup & comment update

  return (
    <>
      {/* 그룹 채팅방 드래그 앤 드롭 */}
      <DndContext
        sensors={sensors}
        onDragStart={dragStartHandler}
        onDragOver={dragOverHandler}
        onDragEnd={dragEndHandler}
      >
        {sortedGroupChats.map((groupChat) => (
          <DraggableGroupChat
            key={groupChat._id}
            _id={groupChat._id}
            hostId={groupChat.hostId}
            title={groupChat.title}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            activeIndex={activeIndex}
            overIndex={overIndex}
            isSource={activeGroupChatId === groupChat._id}
          />
        ))}

        {/* 드래그 중인 채팅방 미리보기 */}
        <DragOverlay>
          {activeGroupChat && (
            <div className={` ${classes["group-chat-overlay"]} `}>
              <span
                className={`${classes["group-chat-overlay-title"]} ${
                  activeGroupChat.title.length > 12
                    ? classes["title-small"]
                    : ""
                }`}
              >
                {activeGroupChat.title}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default GroupChats;
