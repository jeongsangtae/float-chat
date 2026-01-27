import { useEffect, useState } from "react";

import { DndContext } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

import useGroupChatStore from "../../store/groupChatStore";
// import GroupChat from "./GroupChat";

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

  useEffect(() => {
    getGroupChats();
  }, []);

  // 로딩 중일 때
  if (loading) {
    return <LoadingIndicator />;
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    reorderGroupChats((prev) => {
      const oldIndex = prev.findIndex((c) => c._id === active.id);
      const newIndex = prev.findIndex((c) => c._id === over.id);

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={groupChats.map((groupChat) => groupChat._id)}>
          {groupChats.map((groupChat) => (
            // <GroupChat
            // key={groupChat._id}
            // _id={groupChat._id}
            // hostId={groupChat.hostId}
            // title={groupChat.title}
            // contextMenu={contextMenu}
            // setContextMenu={setContextMenu}
            // />
            <SortableGroupChat
              key={groupChat._id}
              _id={groupChat._id}
              hostId={groupChat.hostId}
              title={groupChat.title}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
            />
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
};

export default GroupChats;
