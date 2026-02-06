import { useDraggable, useDroppable } from "@dnd-kit/core";

import GroupChat from "./GroupChat";

import classes from "./DraggableGroupChat.module.css";

const DraggableGroupChat = ({
  _id,
  hostId,
  title,
  contextMenu,
  setContextMenu,
  activeIndex,
  overIndex,
  isSource,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: _id,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: _id,
  });

  const setRef = (node: HTMLElement | null) => {
    setNodeRef(node); // draggable
    setDroppableRef(node); // droppable
  };

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

  const style = {
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setRef}
      style={style}
      className={classes.item}
      {...attributes}
      {...listeners}
    >
      {showTopLine && <div className={classes["insert-line-top"]} />}
      {showBottomLine && <div className={classes["insert-line-bottom"]} />}

      {/* {isSource  ? (
        <div className={classes["group-chat-placeholder"]} />
      ) : (
        <GroupChat
          _id={_id}
          hostId={hostId}
          title={title}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          isDragging={isDragging}
        />
      )} */}

      {isSource && !isDragging ? (
        <div className={classes["group-chat-placeholder"]} />
      ) : (
        <GroupChat
          _id={_id}
          hostId={hostId}
          title={title}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          isDragging={isDragging}
        />
      )}
    </div>
  );
};

export default DraggableGroupChat;
