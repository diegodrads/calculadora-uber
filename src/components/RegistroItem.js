import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatarMoeda, formatarData } from '../utils/helpers';

export default function RegistroItem({ registro, onDeletar }) {
  const liquido = (registro.valorRecebido || 0)
    - (registro.custoVariavel || 0)
    - (registro.custoCombustivel || 0)
    - (registro.custoAluguel || 0);

  const isPositivo = liquido >= 0;

  return (
    <View style={styles.container}>
      <View style={[styles.indicador, { backgroundColor: isPositivo ? '#16A34A' : '#DC2626' }]} />
      <View style={styles.corpo}>
        <View style={styles.header}>
          <Text style={styles.data}>{formatarData(registro.data)}</Text>
          <Text style={styles.ganho}>{formatarMoeda(registro.valorRecebido || 0)}</Text>
        </View>
        <View style={styles.detalhes}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>🛣 {registro.kmRodados || 0} km</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>⏱ {registro.horasTrabalhadas || 0}h</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: isPositivo ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.chipText, { color: isPositivo ? '#16A34A' : '#DC2626', fontWeight: '700' }]}>
              {formatarMoeda(liquido)}
            </Text>
          </View>
        </View>
      </View>
      {onDeletar && (
        <TouchableOpacity style={styles.deletar} onPress={() => onDeletar(registro.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deletarTexto}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginVertical: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  indicador: {
    width: 4,
  },
  corpo: {
    flex: 1,
    padding: 13,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  data: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  ganho: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },
  detalhes: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  deletar: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  deletarTexto: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '400',
    lineHeight: 26,
  },
});
