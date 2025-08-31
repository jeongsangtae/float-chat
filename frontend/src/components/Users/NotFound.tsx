import { Link } from "react-router-dom";

import classes from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className={classes["not-found"]}>
      <h1>이 리소스를 찾을 수 없습니다</h1>
      <p>안타깝게도 이 리소스를 찾을 수 없습니다.</p>
      <Link to="/" className={classes["redirect-button-wrapper"]}>
        <button className={classes["redirect-button"]}>홈으로 돌아가기</button>
      </Link>
    </div>
  );
};

export default NotFound;
