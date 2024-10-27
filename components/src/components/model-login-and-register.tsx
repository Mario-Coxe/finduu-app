import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFonts } from "expo-font";
import Icon from "@expo/vector-icons/Ionicons";
import { findMunicipesByProvinceId } from "../services/municipe-service";
import { findAllProvince } from "../services/province-service";
import { useAuthViewModel } from "../view-models/register-and-login-view-model";
import SucessComponent from "./messages/sucess-animation";
import ErrorComponent from "./messages/error-animation";


const schema = yup.object().shape({
  full_name: yup.string().required("Nome é obrigatório"),
  phone_number: yup
    .string()
    .required("Telefone é obrigatório")
    .matches(/^9\d{8}$/, "Número de telefone inválido. Deve começar com 9 e ter 9 dígitos."),
  province_id: yup.string().required("Província é obrigatória"),
  municipe_id: yup.string().required("Município é obrigatório"),
  password: yup.string().required("Senha é obrigatória").min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const loginSchema = yup.object().shape({
  phone_number: yup
    .string()
    .required("Telefone é obrigatório")
    .matches(/^9\d{8}$/, "Número de telefone inválido. Deve começar com 9 e ter 9 dígitos."),
  password: yup.string().required("Senha é obrigatória"),
});

const registerSchema = yup.object().shape({
  full_name: yup.string().required("Nome é obrigatório"),
  phone_number: yup
    .string()
    .required("Telefone é obrigatório")
    .matches(/^9\d{8}$/, "Número de telefone inválido. Deve começar com 9 e ter 9 dígitos."),
  province_id: yup.string().required("Província é obrigatória"),
  municipe_id: yup.string().required("Município é obrigatório"),
  password: yup.string().required("Senha é obrigatória").min(6, "A senha deve ter no mínimo 6 caracteres"),
});

interface LoginRegisterModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
  visible,
  onDismiss,
}) => {

  const [loaded] = useFonts({
    SpaceMono: require("../../../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsBold: require("../../../assets/fonts/Poppins-Bold.ttf"),
    PoppinsRegular: require("../../../assets/fonts/Poppins-Regular.ttf"),
  });


  const [isLogin, setIsLogin] = useState(true);
  const [provinces, setProvinces] = useState<Array<{ label: string; value: string }>>([]);
  const [municipalities, setMunicipalities] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loggedIn, setloggedIn] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(isLogin ? loginSchema : registerSchema),
  });

  const { register, fullName, setFullName, phoneNumber, setPhoneNumber, password, setPassword, municipe_id, setMunicipeId, loading, error, isSuccess, setIsSuccess, login } = useAuthViewModel();

  useEffect(() => {
    if (visible) {
      loadProvinces();
    }
  }, [visible]);

  if (!loaded) {
    return null;
  }

  const loadProvinces = async () => {
    try {
      const provincesData = await findAllProvince();
      setProvinces(provincesData.map((province: any) => ({ label: province.name, value: province.id })));
    } catch (error) {
      console.error("Erro ao carregar províncias:", error);
    }
  };

  const loadMunicipalities = async (provinceId: number) => {
    try {
      const municipalitiesData = await findMunicipesByProvinceId(provinceId);
      setMunicipalities(
        municipalitiesData.map((municipality: any) => ({
          label: municipality.name,
          value: municipality.id,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar municípios:", error);
    }
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    loadMunicipalities(Number(provinceId));
  };

  const handleLogin = async (data: any) => {
    try {

      const loginSuccessful = await login(data.phone_number, data.password);
      if (loginSuccessful) {
        setloggedIn(true)
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          setIsSuccess(false);
          setloggedIn(false)
          onDismiss();
          reset();
        }, 1000);
      } else {
        setErrorModalVisible(true);
        setModalVisible(false);
        setTimeout(() => {
          setErrorModalVisible(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao efetuar login:", error);


      setErrorModalVisible(true);
      setTimeout(() => {
        setErrorModalVisible(false);
      }, 1000);
    }
  };

  const handleRegister = async (data: any) => {
    try {
      setFullName(data.full_name);
      setPhoneNumber(data.phone_number);
      setMunicipeId(Number(data.municipe_id));
      setPassword(data.password);

      const wasSuccessful = await register(data.full_name, data.phone_number, data.password, data.municipe_id);

      if (wasSuccessful) {
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          setIsSuccess(false);
          onDismiss();
          reset();
        }, 1000);
      } else {
        console.log("error", error);
        setErrorModalVisible(true);
        setModalVisible(false);
        setIsSuccess(false);
        setTimeout(() => {
          setErrorModalVisible(false);
          setModalVisible(true)
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      setTimeout(() => {
        setErrorModalVisible(false);
      }, 1000);
      setErrorModalVisible(true);
    }
  };





  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <SucessComponent
          view={modalVisible}
          message={loggedIn ? "Logado com Sucesso" : "Sucesso!"}
          onClose={() => setModalVisible(false)}
        />
      </View>
    );
  }

  if (errorModalVisible) {
    return (
      <View style={styles.successContainer}>
        <ErrorComponent
          view={errorModalVisible}
          message={error}
          onClose={() => setErrorModalVisible(false)}
        />
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.content}>
            {isLogin ? (
              <>
                <Text style={styles.title}>Login</Text>
                <Controller
                  control={control}
                  name="phone_number"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Telefone"
                      style={styles.input}
                      keyboardType="numeric"
                      onChangeText={onChange}
                      value={value}
                      maxLength={9}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Senha"
                      style={styles.input}
                      secureTextEntry={true}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.loginButton}

                  onPress={handleSubmit(handleLogin)}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <Text style={styles.switchText}>
                  Não tem conta?{" "}
                  <Text
                    style={styles.switchButton}
                    onPress={() => setIsLogin(false)}
                  >
                    Registre-se
                  </Text>
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>Registro de Usuário</Text>

                <Controller
                  control={control}
                  name="full_name"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        placeholder="Nome"
                        style={styles.input}
                        onChangeText={onChange}
                        value={value}
                      />
                      {errors.full_name && (
                        <Text style={styles.errorText}>
                          {errors.full_name.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                <Controller
                  control={control}
                  name="phone_number"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        placeholder="Telefone"
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={onChange}
                        value={value}
                        maxLength={9}
                      />
                      {errors.phone_number && (
                        <Text style={styles.errorText}>
                          {errors.phone_number.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                <Controller
                  control={control}
                  name="province_id"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <RNPickerSelect
                        onValueChange={(value) => {
                          onChange(value);
                          handleProvinceChange(value);
                        }}
                        items={provinces}
                        value={value}
                        placeholder={{ label: "Selecione uma província", value: "" }}
                        style={pickerSelectStyles}
                      />
                      {errors.province_id && (
                        <Text style={styles.errorText}>
                          {errors.province_id.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                <Controller
                  control={control}
                  name="municipe_id"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <RNPickerSelect
                        onValueChange={onChange}
                        items={municipalities}
                        value={value}
                        placeholder={{ label: "Selecione um município", value: "" }}
                        style={pickerSelectStyles}
                      />
                      {errors.municipe_id && (
                        <Text style={styles.errorText}>
                          {errors.municipe_id.message}
                        </Text>
                      )}
                    </>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        placeholder="Senha"
                        style={styles.input}
                        secureTextEntry={true}
                        onChangeText={onChange}
                        value={value}
                      />
                      {errors.password && (
                        <Text style={styles.errorText}>
                          {errors.password.message}
                        </Text>
                      )}
                    </>
                  )}
                />
                <TouchableOpacity style={styles.loginButton} onPress={handleSubmit(handleRegister)}>
                  <Text style={styles.loginButtonText}>Registrar</Text>
                </TouchableOpacity>
                <Text style={styles.switchText}>
                  Já tem uma conta?{" "}
                  <Text
                    style={styles.switchButton}
                    onPress={() => setIsLogin(true)}
                  >
                    Faça login
                  </Text>
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>


      {/* Modal de sucesso */}
      {isSuccess && (
        <View style={styles.successContainer}>
          <SucessComponent
            view={modalVisible}
            message={loggedIn ? "Logado com Sucesso" : "Sucesso!"}
            onClose={() => setModalVisible(false)}
          />
        </View>
      )}

      {/* Modal de erro */}
      {errorModalVisible && (
        <View style={styles.successContainer}>
          <ErrorComponent
            view={errorModalVisible}
            message={error}
            onClose={() => setErrorModalVisible(false)}
          />
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 10,
    //height: 350,
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: "PoppinsBold",
  },
  input: {
    height: 48,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9F9F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    fontSize: 12,
    fontFamily: "PoppinsRegular",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#FF3B30",
    fontFamily: "PoppinsBold",
  },
  errorText: {
    color: "#D50000",
    marginTop: -10,
    padding: 10,
    fontSize: 12,
    fontFamily: "SpaceMono",
    backgroundColor: 'rgba(255, 235, 238, 0.2)',
    shadowOpacity: 0.3,
    shadowRadius: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  switchText: {
    marginTop: 15,
    textAlign: "center",
    fontFamily: "PoppinsRegular",
    color: "#000"
  },
  switchButton: {
    color: "blue",
    textDecorationLine: "underline",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    paddingVertical: 20,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF", // Azul clássico do iOS
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2, // Sombras no Android
  },
  loginButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "PoppinsBold",

  },
});


const pickerSelectStyles = {

  inputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    color: "black",
    marginBottom: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  inputAndroid: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    color: "black",
    marginBottom: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

};

export default LoginRegisterModal;
