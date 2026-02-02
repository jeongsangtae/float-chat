import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import GroupChat from "./GroupChat";
import { GroupChatProps } from "../../types";

import classes from "./SortableGroupChat.module.css";

const SortableGroupChat = ({
  _id,
  hostId,
  title,
  contextMenu,
  setContextMenu,
  activeIndex,
  overIndex,
}: GroupChatProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: _id });

  const showTopLine =
    isOver &&
    activeIndex !== null &&
    overIndex !== null &&
    activeIndex > overIndex;

  const showBottomLine =
    isOver &&
    activeIndex !== null &&
    overIndex !== null &&
    activeIndex < overIndex;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classes.item}
      {...attributes}
      {...listeners}
    >
      {/* <div className={classes.dropZone}>
        {showTopLine && <div className={classes.dropLine} />}
      </div> */}

      {showTopLine && <div className={classes["insert-line-top"]} />}
      {showBottomLine && <div className={classes["insert-line-bottom"]} />}

      <GroupChat
        key={_id}
        _id={_id}
        hostId={hostId}
        title={title}
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        isDragging={isDragging}
      />

      {/* <div className={classes.dropZone}>
        {showBottomLine && <div className={classes.dropLine} />}
      </div> */}
    </div>
  );
};

export default SortableGroupChat;
