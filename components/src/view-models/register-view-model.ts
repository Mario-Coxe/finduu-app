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
  ) => {
    setLoading(true); // Ativar o estado de loading
    try {
      // Criar o novo objeto do usuário
      const newUser = new User(fullName, phoneNumber, password, municipe_id);
      const result = await AuthService.register(newUser);
      console.log("Usuário registrado com sucesso:", result);

      // Limpar os estados dos campos
      setFullName("");
      setPhoneNumber("");
      setPassword("");
      setMunicipeId(0);

      setIsSuccess(true); // Ativar o estado de sucesso
    } catch (err: any) {
      setError(err.message || "Erro ao registrar usuário.");
    } finally {
      setFullName("");
      setPhoneNumber("");
      setPassword("");
      setMunicipeId(0);
      setLoading(false); // Desativar o estado de loading
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
    isSuccess, // Novo estado de sucesso
    error,
    setIsSuccess,
    register,
  };
}
