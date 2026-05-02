import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatarMoeda } from '../utils/helpers';

export default function CardResumo({ titulo, valor, cor = '#333' }) {
  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={[styles.valor, { color: cor }]}>{formatarMoeda(valor)}</Text>
    </View>
  );
}

export function CardResumoSimples({ titulo, valor, unidade = '', cor = '#333' }) {
  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={[styles.valor, { color: cor }]}>
        {unidade === 'R$' ? formatarMoeda(valor) : `${valor}${unidade ? ' ' + unidade : ''}`}
      </Text>
    </View>
  );
}

export function CardValor({ label, valor, cor = '#333' }) {
  return (
    <View style={styles.valorBox}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.valorGrande, { color: cor }]}>{formatarMoeda(valor)}</Text>
    </View>
  );
}

export function CardToque({ titulo, onPress, cor = '#6C63FF' }) {
  return (
    <TouchableOpacity style={[styles.cardToque, { borderColor: cor }]} onPress={onPress}>
      <Text style={[styles.titulo, { color: cor }]}>{titulo}</Text>
      <Text style={styles.seta}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 2,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  titulo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  valor: {
    fontSize: 20,
    fontWeight: '700',
  },
  valorBox: {
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  valorGrande: {
    fontSize: 28,
    fontWeight: '700',
  },
  cardToque: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  seta: {
    fontSize: 22,
    color: '#6C63FF',
    fontWeight: '600',
  },
});
