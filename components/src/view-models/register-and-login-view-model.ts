import { useState } from "react";
import User from "../models/users";
import { LOGIN } from "../models/interfaces/login-interface";
import { AuthService } from "../services/auth-service";
import { useAuth } from "../context/auth-context";

export function useAuthViewModel() {
  const { login: authenticateUser } = useAuth(); // Renomeando a função de login do contexto
  
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [municipe_id, setMunicipeId] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const register = async (
    fullName: string,
    phoneNumber: string,
    password: string,
    municipe_id: number
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const newUser = new User(fullName, phoneNumber, password, municipe_id);
      await AuthService.register(newUser);
      setIsSuccess(true);
      return true; // Sucesso
    } catch (err: any) {
      setError(err.message || "Erro ao registrar usuário.");
      setIsSuccess(false);
      return false; // Falha
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (
    phoneNumber: number,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const loginData = new LOGIN(password, phoneNumber);
      const userResponse = await AuthService.login(loginData);
      // Supondo que `userResponse` contém os dados do usuário
      authenticateUser(userResponse); // Armazenando os dados do usuário no contexto
      setIsAuthenticated(true);
      setIsSuccess(true);
      return true; // Sucesso no login
    } catch (err: any) {
      setError(err.message || "Erro ao realizar login.");
      setIsAuthenticated(false);
      setIsSuccess(false);
      return false; // Falha no login
    } finally {
      setLoading(false);
    }
  };

  return {
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    municipe_id,
    setMunicipeId,
    loading,
    isSuccess,
    error,
    setIsSuccess,
    isAuthenticated,
    setIsAuthenticated,
  
    register,
    login: loginUser, // Usando a função renomeada aqui
  };
}
