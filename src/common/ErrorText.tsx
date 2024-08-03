import React from "react";

interface Props {
  errorText: string;
}

const ErrorText: React.FC<Props> = ({ errorText }) => {
  return (
    <p className=" text-rose-600 text-sm text-muted-foreground">{errorText}</p>
  );
};

export default ErrorText;
