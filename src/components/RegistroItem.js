import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatarMoeda, formatarData } from '../utils/helpers';

export default function RegistroItem({ registro, onDeletar }) {
  const metaLiquida = (registro.valorRecebido || 0) - (registro.custoVariavel || 0) - (registro.custoCombustivel || 0) - (registro.custoAluguel || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.data}>{formatarData(registro.data)}</Text>
        <Text style={styles.ganho}>{formatarMoeda(registro.valorRecebido || 0)}</Text>
      </View>
      <View style={styles.detalhes}>
        <Text style={styles.info}>Km: {registro.kmRodados || 0}km</Text>
        <Text style={styles.info}>Horas: {registro.horasTrabalhadas || 0}h</Text>
        <Text style={styles.info}>Líquido: {formatarMoeda(metaLiquida)}</Text>
      </View>
      {onDeletar && (
        <TouchableOpacity style={styles.deletar} onPress={() => onDeletar(registro.id)}>
          <Text style={styles.deletarTexto}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  data: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  ganho: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  detalhes: {
    flexDirection: 'row',
    gap: 12,
  },
  info: {
    fontSize: 12,
    color: '#888',
  },
  deletar: {
    position: 'absolute',
    top: 4,
    right: 8,
  },
  deletarTexto: {
    fontSize: 22,
    color: '#e53935',
    fontWeight: '600',
  },
});
