import React from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFonts } from "expo-font";
import loadingAnimation from '../../../../assets/icons/sucess.json';

interface SucessComponentProps {
  view: boolean;
  onClose: () => void;
  message: string | null
}

const SucessComponent: React.FC<SucessComponentProps> = ({ view, onClose, message }) => {
  const [loaded] = useFonts({
    SpaceMono: require("../../../../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsBold: require("../../../../assets/fonts/Poppins-Bold.ttf"),
    PoppinsRegular: require("../../../../assets/fonts/Poppins-Regular.ttf"),
    RobotoCondensedExtraBold: require("../../../../assets/fonts/RobotoCondensed-ExtraBold.ttf"),

  });

  if (!loaded) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={view}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LottieView
            source={loadingAnimation}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: 300,
  },
  animation: {
    width: 150,
    height: 150,
  },
  message: {
    marginVertical: 10,
    fontFamily: "RobotoCondensedExtraBold",
    fontSize: 20,
    textAlign: 'center',
    color: '#000',
  },
});

export default SucessComponent;
