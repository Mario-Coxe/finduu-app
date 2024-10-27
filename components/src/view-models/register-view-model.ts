import { useState } from "react";
import User from "../models/users";
import { AuthService } from "../services/auth-service";

export function useRegisterViewModel() {
  // Definindo os estados para os inputs de registro
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [municipe_id, setMunicipeId] = useState<number>(0); // Id do município
  const [loading, setLoading] = useState<boolean>(false); // Estado de carregamento
  const [isSuccess, setIsSuccess] = useState<boolean>(false); // Estado de sucesso
  const [error, setError] = useState<string | null>(null);

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
    register,
  };
}
