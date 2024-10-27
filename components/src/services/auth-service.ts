import axios from "axios";
import { AUTH } from "@/enviroments";
import User from "../models/users";
import { LOGIN } from "../models/interfaces/login-interface";
export class AuthService {
  static async register(user: User): Promise<any> {
    console.log("user", user);
    try {
      const response = await axios.post(`${AUTH}register`, {
        full_name: user.fullName,
        phone_number: user.phoneNumber,
        password: user.password,
        municipe_id: user.municipe_id,
      });
      return response.data;
    } catch (error: any) {
      console.log("error", error);
      throw new Error(
        error.response?.data?.message || "Erro ao registrar usuário."
      );
    }
  }

  static async login(login: LOGIN): Promise<any> {
    console.log("user", login);

    try {
      const response = await axios.post(`${AUTH}login`, {
        phone_number: login.phone_number,
        password: login.password,
      });
      return response.data;
    } catch (error: any) {
      console.log("Login error", error);
      throw new Error(
        error.response?.data?.message || "Erro ao realizar login."
      );
    }
  }
}
