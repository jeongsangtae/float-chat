interface NoAccessProps {
  title: string;
  description: string;
}

const NoAccess = ({ title, description }: NoAccessProps) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default NoAccess;
