import { Link } from "react-router-dom";

import classes from "./NoAccess.module.css";

interface NoAccessProps {
  title: string;
  description: string;
  label: string;
  path: string;
}

const NoAccess = ({
  title,
  description,
  // isLoggedIn,
  label,
  path,
}: NoAccessProps) => {
  return (
    <div className={classes["no-access"]}>
      <h1>{title}</h1>
      <p>{description}</p>
      {/* {!isLoggedIn ? (
        <Link to="/login">
          <button>로그인 하러가기</button>
        </Link>
      ) : (
        <Link to="/">
          <button>홈으로 돌아가기</button>
        </Link>
      )} */}
      <Link to={path}>
        <button>{label}</button>
      </Link>
    </div>
  );
};

export default NoAccess;
