import { useContext } from "react";
import { AuthContext } from "./AuthContextValue";

export const useAuth = () => {
  return useContext(AuthContext);
};