import { ModeToggle } from "@/components/mode-toggle";
import localStore from "@/localStore/Store";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const ProtectedRouter: React.FC<Props> = ({ children }) => {
  const [cookie] = useCookies(["accessToken"]);
  const store = localStore((state) => state);

  let location = useLocation();

  useEffect(() => {
    if (!cookie.accessToken) {
      store.setIsLoggedIn(false);
    }
  }, [cookie?.accessToken]);

  if (!store.isLoggedIn && !cookie.accessToken) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="relative">
      {children}
      <div className="fixed bottom-8 right-8">
        <ModeToggle />
      </div>
    </div>
  );
};

export default ProtectedRouter;
