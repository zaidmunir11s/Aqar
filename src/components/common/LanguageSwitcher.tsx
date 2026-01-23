import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLocalization } from '../../hooks/useLocalization';
import { COLORS } from '../../constants';

interface LanguageSwitcherProps {
  variant?: 'button' | 'text' | 'icon';
  showLabel?: boolean;
}

/**
 * Language switcher component
 * Allows users to toggle between supported languages
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  showLabel = true,
}) => {
  const { language, toggleLanguage, t } = useLocalization();

  const handlePress = () => {
    toggleLanguage();
  };

  if (variant === 'text') {
    return (
      <TouchableOpacity onPress={handlePress} style={styles.textContainer}>
        {showLabel && (
          <Text style={styles.label}>{t('profile.language')}: </Text>
        )}
        <Text style={styles.languageText}>
          {language === 'en' ? 'English' : 'العربية'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        variant === 'icon' && styles.iconButton,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {showLabel && (
          <Text style={styles.buttonText}>
            {language === 'en' ? 'العربية' : 'English'}
          </Text>
        )}
        <Text style={styles.languageCode}>
          {language === 'en' ? 'AR' : 'EN'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary || '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  iconButton: {
    minWidth: 50,
    paddingHorizontal: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  languageCode: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: COLORS.textPrimary || '#000000',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary || '#007AFF',
  },
});

export default LanguageSwitcher;
