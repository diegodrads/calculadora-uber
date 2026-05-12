import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Botao({ titulo, onPress, cor = '#6C63FF', disabled = false }) {
  return (
    <TouchableOpacity
      style={[styles.botao, { backgroundColor: cor }, disabled && styles.desabilitado]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.texto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  desabilitado: {
    opacity: 0.45,
  },
  texto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
