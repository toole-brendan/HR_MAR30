import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem("handreceiptUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Mock auth - in real world would call API
      if (username === "john.doe" && password === "password") {
        const user = {
          id: "8675309",
          username: "john.doe",
          name: "SSgt. John Doe",
          rank: "Staff Sergeant",
        };
        
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("handreceiptUser", JSON.stringify(user));
        return;
      }
      throw new Error("Invalid credentials");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("handreceiptUser");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
