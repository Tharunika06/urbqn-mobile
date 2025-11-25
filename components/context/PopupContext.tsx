// components/context/PopupContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PopupType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface PopupButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface PopupConfig {
  title: string;
  message: string;
  type?: PopupType;
  buttons?: PopupButton[];
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PopupContextType {
  showPopup: (config: PopupConfig) => void;
  showSuccess: (title: string, message: string, onConfirm?: () => void) => void;
  showError: (title: string, message: string, onConfirm?: () => void) => void;
  showWarning: (title: string, message: string, onConfirm?: () => void) => void;
  showInfo: (title: string, message: string, onConfirm?: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  showCustom: (
    title: string,
    message: string,
    buttons: PopupButton[],
    type?: PopupType
  ) => void;
  hidePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider');
  }
  return context;
};

interface PopupProviderProps {
  children: React.ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [popupConfig, setPopupConfig] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showPopup = useCallback((config: PopupConfig) => {
    setPopupConfig(config);
    setVisible(true);
  }, []);

  const hidePopup = useCallback(() => {
    setVisible(false);
    setTimeout(() => setPopupConfig(null), 300);
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      showPopup({
        title,
        message,
        type: 'success',
        onConfirm,
      });
    },
    [showPopup]
  );

  const showError = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      showPopup({
        title,
        message,
        type: 'error',
        onConfirm,
      });
    },
    [showPopup]
  );

  const showWarning = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      showPopup({
        title,
        message,
        type: 'warning',
        onConfirm,
      });
    },
    [showPopup]
  );

  const showInfo = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      showPopup({
        title,
        message,
        type: 'info',
        onConfirm,
      });
    },
    [showPopup]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      showPopup({
        title,
        message,
        type: 'confirm',
        showCancel: true,
        onConfirm,
        onCancel,
      });
    },
    [showPopup]
  );

  const showCustom = useCallback(
    (
      title: string,
      message: string,
      buttons: PopupButton[],
      type: PopupType = 'info'
    ) => {
      showPopup({
        title,
        message,
        type,
        buttons,
      });
    },
    [showPopup]
  );

  return (
    <PopupContext.Provider
      value={{
        showPopup,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        showCustom,
        hidePopup,
      }}
    >
      {children}
      {popupConfig && (
        <PopupModal
          visible={visible}
          config={popupConfig}
          onClose={hidePopup}
        />
      )}
    </PopupContext.Provider>
  );
};

// PopupModal Component
interface PopupModalProps {
  visible: boolean;
  config: PopupConfig;
  onClose: () => void;
}

const PopupModal: React.FC<PopupModalProps> = ({ visible, config, onClose }) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (config.type || 'info') {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#4CAF50' };
      case 'error':
        return { name: 'close-circle' as const, color: '#F44336' };
      case 'warning':
        return { name: 'warning' as const, color: '#FF9800' };
      case 'confirm':
        return { name: 'help-circle' as const, color: '#2196F3' };
      case 'info':
      default:
        return { name: 'information-circle' as const, color: '#2196F3' };
    }
  };

  const iconConfig = getIconConfig();

  const handleConfirm = () => {
    config.onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    config.onCancel?.();
    onClose();
  };

  // Custom buttons support
  if (config.buttons && config.buttons.length > 0) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={iconConfig.name} size={64} color={iconConfig.color} />
            </View>

            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.message}>{config.message}</Text>

            <View style={styles.customButtonsContainer}>
              {config.buttons.map((button, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.customButton,
                    button.style === 'cancel' && styles.customCancelButton,
                    button.style === 'destructive' && styles.customDestructiveButton,
                    config.buttons!.length > 1 && { flex: 1, marginHorizontal: 4 }
                  ]}
                  onPress={() => {
                    button.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.customButtonText,
                      button.style === 'cancel' && styles.customCancelButtonText,
                      button.style === 'destructive' && styles.customDestructiveButtonText
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // Standard confirm/cancel buttons
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconConfig.color }]}>
            <Ionicons name={iconConfig.name} size={40} color="#fff" />
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>{config.message}</Text>

          <View style={styles.buttonContainer}>
            {config.showCancel && (
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>
                  {config.cancelText || 'Cancel'}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                config.showCancel && { flex: 1 },
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {config.confirmText ||
                  (config.type === 'confirm' ? 'Confirm' : 'OK')}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    minWidth: 280,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    color: '#1a2238',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#1a73e8',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Custom buttons styles
  customButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  customButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: 0.5,
  },
  customCancelButton: {
    backgroundColor: '#f3f3f3',
  },
  customCancelButtonText: {
    color: '#666',
  },
  customDestructiveButton: {
    backgroundColor: '#f44336',
  },
  customDestructiveButtonText: {
    color: '#fff',
  },
});

export { PopupModal };