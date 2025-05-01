import DirectChatSidebar from "./DirectChatSidebar";

import classes from "./DirectChatMainContent.module.css";

const DirectChatMainContent = () => {
  return (
    <div className={classes["full-content"]}>
      <div className={classes["sub-sidebar"]}>
        <DirectChatSidebar />
      </div>
      <div className={classes["main-content"]}></div>
    </div>
  );
};

export default DirectChatMainContent;
