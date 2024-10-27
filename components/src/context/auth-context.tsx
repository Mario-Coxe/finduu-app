import React, { createContext, useContext, useState } from "react";
import User from "../models/users";

interface AuthContextType {
  user: User | null; // Aqui você pode definir a interface do usuário
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData); // Armazena o usuário logado no contexto
  };

  const logout = () => {
    setUser(null); // Limpa os dados do usuário ao fazer logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
