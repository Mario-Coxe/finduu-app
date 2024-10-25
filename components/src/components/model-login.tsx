import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { findMunicipesByProvinceId } from "../services/municipe-service";
import { findAllProvince } from "../services/province-service";
import { useRegisterViewModel } from "../view-models/register-view-model";
import SucessComponent from "./sucess-animation";


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

interface LoginRegisterModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
  visible,
  onDismiss,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [provinces, setProvinces] = useState<Array<{ label: string; value: string }>>([]);
  const [municipalities, setMunicipalities] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isSuccess2, setIsSuccess2] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { register, fullName, setFullName, phoneNumber, setPhoneNumber, password, setPassword, municipe_id, setMunicipeId, loading, error, isSuccess, setIsSuccess } = useRegisterViewModel();

  useEffect(() => {
    if (visible) {
      loadProvinces();
    }
  }, [visible]);

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



  const handleRegister = async (data: any) => {
    try {
      setFullName(data.full_name);
      setPhoneNumber(data.phone_number);
      setMunicipeId(Number(data.municipe_id));
      setPassword(data.password);
  
      
      await register(data.full_name, data.phone_number, data.password, data.municipe_id);
      
      console.log(isSuccess)
      // Verifica se o usuário foi criado com sucesso e atualiza o estado
      if (!isSuccess) {
        setModalVisible(true); // Abre o modal de sucesso
        setTimeout(() => {
          setModalVisible(false); // Fecha o modal automaticamente após 3 segundos
          setIsSuccess(false); // Reseta o estado de sucesso após fechamento
          onDismiss(); 
        }, 1000);
      }
  
      setFullName('');
      setPhoneNumber('');
      setPassword('');
      setMunicipeId(0);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  };
  

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <SucessComponent
          view={modalVisible}
          onClose={() => setModalVisible(false)}
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
                <TextInput
                  placeholder="Telefone"
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Senha"
                  style={styles.input}
                  secureTextEntry={true}
                />
                <Button title="Login" onPress={onDismiss} />
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

                <Button title="Registrar" onPress={handleSubmit(handleRegister)} />
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  switchText: {
    marginTop: 15,
    textAlign: "center",
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
});


const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },

};

export default LoginRegisterModal;
