import { useEffect, useState, useMemo } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  // SortableContext,
  // verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
// import GroupChat from "./GroupChat";

import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { ContextMenu } from "../../types";

import LoadingIndicator from "../UI/LoadingIndicator";
import DraggableGroupChat from "./DraggableGroupChat";
// import SortableGroupChat from "./SortableGroupChat";

import classes from "./GroupChats.module.css";

const GroupChats = () => {
  const { userInfo, updateUserGroupChatOrder } = useAuthStore();
  const {
    loading,
    groupChats,
    getGroupChats,
    reorderGroupChats,
    saveGroupChatOrder,
  } = useGroupChatStore();

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeGroupChat = useMemo(() => {
    return groupChats.find((c) => c._id === activeGroupChatId);
  }, [activeGroupChatId, groupChats]);

  console.log(userInfo);

  const sortedGroupChats = useMemo(() => {
    // 드래그 중이면 store 상태 그대로
    // if (activeGroupChatId) return groupChats;

    if (!userInfo?.groupChatOrder.length) return groupChats;

    const orderMap = new Map(
      userInfo.groupChatOrder.map((id, index) => [id, index])
    );

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

  const dragStartHandler = (event: DragStartEvent) => {
    // 타입 단언
    const id = event.active.id as string;

    // 타입 가드
    // if (typeof id !== "string") return;

    setActiveGroupChatId(id);
    setActiveIndex(sortedGroupChats.findIndex((c) => c._id === id));
  };

  const dragOverHandler = (event: DragOverEvent) => {
    if (!event.over) return;

    setOverIndex(sortedGroupChats.findIndex((c) => c._id === event.over!.id));
  };

  const dragEndHandler = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveGroupChatId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortedGroupChats.findIndex((c) => c._id === active.id);
    const newIndex = sortedGroupChats.findIndex((c) => c._id === over.id);

    const newOrderChats = arrayMove(sortedGroupChats, oldIndex, newIndex);

    const newOrderIds = newOrderChats.map((c) => c._id);

    updateUserGroupChatOrder(newOrderIds);
    saveGroupChatOrder(newOrderIds);

    // reorderGroupChats((prev) => {
    //   const oldIndex = prev.findIndex((c) => c._id === active.id);
    //   const newIndex = prev.findIndex((c) => c._id === over.id);

    //   const sortableGroupChats = arrayMove(prev, oldIndex, newIndex);

    //   saveGroupChatOrder(sortableGroupChats.map((groupChat) => groupChat._id));

    //   return sortableGroupChats;
    // });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={dragStartHandler}
        onDragOver={dragOverHandler}
        onDragEnd={dragEndHandler}
      >
        {/* {groupChats.map((groupChat) => (
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
        ))} */}

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
        {/* Sortable 방식 UX로 되돌릴 가능성 대비해서 유지
         (드래그 중 실시간 재정렬 방식) */}
        {/* <SortableContext
          items={groupChats.map((groupChat) => groupChat._id)}
          strategy={verticalListSortingStrategy}
        >
          {groupChats.map((groupChat) => (
            <SortableGroupChat
              key={groupChat._id}
              _id={groupChat._id}
              hostId={groupChat.hostId}
              title={groupChat.title}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              activeIndex={activeIndex}
              overIndex={overIndex}
              isActive={activeGroupChatId === groupChat._id}
            />
          ))}
        </SortableContext> */}
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
