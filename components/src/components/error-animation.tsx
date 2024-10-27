import React from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import loadingAnimation from '../../../assets/icons/error.json';

interface ErrorComponentProps {
  view: boolean;
  onClose: () => void;
  message: string | null
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ view, onClose, message }) => {

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
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ErrorComponent;
