import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import GroupChat from "./GroupChat";
import { SortableGroupChatProps } from "../../types";

import classes from "./SortableGroupChat.module.css";

const SortableGroupChat = ({
  _id,
  hostId,
  title,
  contextMenu,
  setContextMenu,
  activeIndex,
  overIndex,
  isActive,
}: SortableGroupChatProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: _id, animateLayoutChanges: () => false });

  // 드래그 방향에 따라 위/아래 위치 표시선 결정
  // 채팅방 드래그해 위로 올릴 때 겹친 채팅방이 아래로 내려가며 위에 선이 보여짐
  const showTopLine =
    isOver &&
    activeIndex !== null &&
    overIndex !== null &&
    activeIndex > overIndex;

  // 채팅방 드래그해 아래로 내릴 때 겹친 채팅방이 위로 올라가며 아래에 선이 보여짐
  const showBottomLine =
    isOver &&
    activeIndex !== null &&
    overIndex !== null &&
    activeIndex < overIndex;

  const style: React.CSSProperties = {
    transform: isDragging ? CSS.Transform.toString(transform) : "none",
    // transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classes.item}
      {...attributes}
      {...listeners}
    >
      {showTopLine && <div className={classes["insert-line-top"]} />}
      {showBottomLine && <div className={classes["insert-line-bottom"]} />}

      {/* {isActive && <div className={classes["group-chat-placeholder"]} />}

      {!isActive && (
        <GroupChat
          _id={_id}
          hostId={hostId}
          title={title}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          isDragging={isDragging}
        />
      )} */}

      <GroupChat
        key={_id}
        _id={_id}
        hostId={hostId}
        title={title}
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        isDragging={isDragging}
      />
    </div>
  );
};

export default SortableGroupChat;
