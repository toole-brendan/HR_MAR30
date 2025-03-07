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
  // Default demo user
  const demoUser: User = {
    id: "8675309",
    username: "john.doe",
    name: "SSgt. John Doe",
    rank: "Staff Sergeant",
  };
  
  const [user, setUser] = useState<User | null>(demoUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Auto-authenticate with demo user
  useEffect(() => {
    localStorage.setItem("handreceiptUser", JSON.stringify(demoUser));
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
