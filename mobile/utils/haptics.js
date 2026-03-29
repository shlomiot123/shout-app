import { Platform, Vibration } from 'react-native';

export const ImpactFeedbackStyle = { Light: 'light', Medium: 'medium', Heavy: 'heavy' };
export const NotificationFeedbackType = { Success: 'success', Warning: 'warning', Error: 'error' };

export function impactAsync(style) {
  if (Platform.OS === 'android') {
    const duration = style === ImpactFeedbackStyle.Heavy ? 30 : style === ImpactFeedbackStyle.Medium ? 20 : 10;
    Vibration.vibrate(duration);
  }
  // iOS haptics require native module; silently no-op without expo-haptics
}

export function notificationAsync(type) {
  if (Platform.OS === 'android') {
    const duration = type === NotificationFeedbackType.Error ? 50 : 20;
    Vibration.vibrate(duration);
  }
}
