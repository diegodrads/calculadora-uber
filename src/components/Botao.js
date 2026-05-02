import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Botao({ titulo, onPress, cor = '#6C63FF', disabled = false }) {
  return (
    <TouchableOpacity
      style={[styles.botao, { backgroundColor: cor }, disabled && styles.desabilitado]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.texto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  desabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
