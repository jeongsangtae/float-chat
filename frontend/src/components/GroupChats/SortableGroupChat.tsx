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
  draggingRef,
}: GroupChatProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: _id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* <div className={classes.dragHandle} {...listeners}>
        ⠿
      </div> */}
      <GroupChat
        key={_id}
        _id={_id}
        hostId={hostId}
        title={title}
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        draggingRef={draggingRef}
      />
    </div>
  );
};

export default SortableGroupChat;
