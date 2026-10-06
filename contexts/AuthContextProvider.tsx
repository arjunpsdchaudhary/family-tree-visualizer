"use client";
import { User } from "@/lib/types";
import axios from "axios";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser();
  }, []);
  useEffect(() => {
    console.log("user from context:", user);
  }, [user]);

  async function getUser() {
    try {
      const response = await axios.get("/api/me");
      setUser(response.data.user);
      console.log("user from context :", response.data.user, "user :", user);
    } catch (error) {
      console.log("unable to find any user");
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth should be used inside AuthContextProvider");
  }

  return context;
};
