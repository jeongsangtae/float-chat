import { useEffect, useState, useMemo } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import useGroupChatStore from "../../store/groupChatStore";
// import GroupChat from "./GroupChat";

import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { ContextMenu } from "../../types";

import LoadingIndicator from "../UI/LoadingIndicator";
import SortableGroupChat from "./SortableGroupChat";

const GroupChats = () => {
  const { loading, groupChats, getGroupChats, reorderGroupChats } =
    useGroupChatStore();

  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    id: null,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  // const [activeGroupChatId, setActiveGroupChatId] = useState<string | null>(
  //   null
  // );

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

  // 로딩 중일 때
  if (loading) {
    return <LoadingIndicator />;
  }

  const dragStartHandler = (event: DragStartEvent) => {
    setActiveIndex(groupChats.findIndex((c) => c._id === event.active.id));
  };

  const dragOverHandler = (event: DragOverEvent) => {
    if (!event.over) return;

    setOverIndex(groupChats.findIndex((c) => c._id === event.over!.id));
  };

  const dragEndHandler = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    reorderGroupChats((prev) => {
      const oldIndex = prev.findIndex((c) => c._id === active.id);
      const newIndex = prev.findIndex((c) => c._id === over.id);

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // const activeGroupChat = useMemo(() => {
  //   return groupChats.find((c) => c._id === activeGroupChatId);
  // }, [activeGroupChatId, groupChats]);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={dragStartHandler}
        onDragOver={dragOverHandler}
        onDragEnd={dragEndHandler}
      >
        <SortableContext
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
            />
          ))}
        </SortableContext>
        {/* <DragOverlay>
          {activeGroupChat ? (<></>) : null}
        </DragOverlay> */}
      </DndContext>
    </>
  );
};

export default GroupChats;
