export const C = {
  yellow:      '#F5C000',
  yellowLight: '#FFFBEB',
  yellowPale:  '#FEF9E7',
  black:       '#0D0D0D',
  dark:        '#1C1C1E',
  gray50:      '#FAFAFA',
  gray100:     '#F5F5F5',
  gray200:     '#E8E8E8',
  gray300:     '#D1D5DB',
  gray500:     '#6B7280',
  gray600:     '#4B5563',
  gray700:     '#374151',
  green:       '#10B981',
  greenLight:  '#ECFDF5',
  greenBorder: '#A7F3D0',
  red:         '#EF4444',
  orange:      '#F97316',
  blue:        '#3B82F6',
  white:       '#FFFFFF',
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const AVATAR_COLORS = [
  C.orange, C.blue, C.green, '#8B5CF6', C.red, '#F59E0B', '#06B6D4',
];

export function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
