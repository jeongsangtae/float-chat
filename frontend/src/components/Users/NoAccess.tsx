import { Link } from "react-router-dom";

import classes from "./NoAccess.module.css";

interface NoAccessProps {
  title: string;
  description: string;
  label: string;
  path: string;
}

const NoAccess = ({ title, description, label, path }: NoAccessProps) => {
  return (
    <div className={classes["no-access"]}>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link to={path} className={classes["redirect-button-wrapper"]}>
        <button className={classes["redirect-button"]}>{label}</button>
      </Link>
    </div>
  );
};

export default NoAccess;
