import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default demo user - Captain Michael Rodriguez
  const demoUser: User = {
    id: "8675309",
    username: "michael.rodriguez",
    name: "Michael Rodriguez",
    rank: "Captain",
    position: "Company Commander, Bravo Company",
    unit: "2-87 Infantry Battalion, 2nd Brigade Combat Team, 10th Mountain Division",
    yearsOfService: 6,
    commandTime: "3 months",
    responsibility: "Primary Hand Receipt Holder for company-level property",
    valueManaged: "$4.2M",
    upcomingEvents: [
      { title: "National Training Center rotation", date: "4 months" },
      { title: "Post-deployment equipment reset", date: "In progress" }
    ],
    equipmentSummary: {
      vehicles: 72,
      weapons: 143,
      communications: 95,
      opticalSystems: 63,
      sensitiveItems: 210
    }
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
      if (username === "michael.rodriguez" && password === "password") {
        // Use the same demo user object we defined above
        setUser(demoUser);
        setIsAuthenticated(true);
        localStorage.setItem("handreceiptUser", JSON.stringify(demoUser));
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
