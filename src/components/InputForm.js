import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function InputForm({ label, value, onChangeText, placeholder, keyboardType = 'default', editable = true }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          !editable && styles.desabilitado,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        editable={editable}
        placeholderTextColor="#94A3B8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E1B4B',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputFocused: {
    borderColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  desabilitado: {
    opacity: 0.5,
    backgroundColor: '#F8FAFC',
  },
});
