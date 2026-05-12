import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CardResumo, { CardResumoSimples } from '../components/Cards';
import { listarRegistros, listarDividas, listarConfig } from '../storage/database';
import { formatarMoeda, resumoPorMes } from '../utils/helpers';

export default function RelatoriosScreen() {
  const [registros, setRegistros] = useState([]);
  const [dividas, setDividas] = useState([]);
  const [config, setConfig] = useState({});
  const [mesSelecionado, setMesSelecionado] = useState(null);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function carregarDados() {
    const r = await listarRegistros();
    const d = await listarDividas();
    const c = await listarConfig();
    setRegistros(r);
    setDividas(d);
    setConfig(c);
  }

  const resumoMensal = resumoPorMes(registros);
  const mesesDisponiveis = resumoMensal.map((r) => r.mes).sort().reverse();
  const detalheMes = resumoMensal.find((r) => r.mes === mesSelecionado);
  const registrosMes = registros.filter((r) => r.data && r.data.startsWith(mesSelecionado || ''));

  function nomeMesAno(mesStr) {
    const [ano, m] = mesStr.split('-');
    return new Date(parseInt(ano), parseInt(m) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  function nomeMesCurto(mesStr) {
    const [ano, m] = mesStr.split('-');
    const nome = new Date(parseInt(ano), parseInt(m) - 1).toLocaleDateString('pt-BR', { month: 'short' });
    return `${nome.replace('.', '')}/${ano.slice(2)}`;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {resumoMensal.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyTitulo}>Sem dados ainda</Text>
          <Text style={styles.emptyTexto}>Adicione registros de corridas para ver os relatórios mensais.</Text>
        </View>
      ) : (
        <>
          {/* Seletor de mês */}
          <Text style={styles.sectionTitle}>Selecione o mês</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mesesScroll}>
            {mesesDisponiveis.map((mes) => {
              const ativo = mes === mesSelecionado;
              return (
                <TouchableOpacity
                  key={mes}
                  style={[styles.mesPill, ativo && styles.mesPillAtivo]}
                  onPress={() => setMesSelecionado(mes)}
                >
                  <Text style={[styles.mesPillTexto, ativo && styles.mesPillTextoAtivo]}>
                    {nomeMesCurto(mes)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Detalhe do mês */}
          {detalheMes ? (
            <>
              <Text style={styles.tituloMes}>{nomeMesAno(detalheMes.mes)}</Text>

              {/* Receita e custos */}
              <Text style={styles.sectionTitle}>Financeiro</Text>
              <CardResumo titulo="Total Recebido" valor={detalheMes.totalGanho} cor="#16A34A" />

              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <CardResumo titulo="Custo Variável" valor={detalheMes.totalCustoVariavel} cor="#DC2626" />
                </View>
                <View style={styles.gridItem}>
                  <CardResumo titulo="Combustível" valor={detalheMes.totalCombustivel} cor="#D97706" />
                </View>
              </View>

              {detalheMes.totalAluguel > 0 && (
                <CardResumo titulo="Aluguel" valor={detalheMes.totalAluguel} cor="#7C3AED" />
              )}

              {/* Indicadores */}
              <Text style={styles.sectionTitle}>Indicadores</Text>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <CardResumoSimples titulo="Km Rodados" valor={detalheMes.totalKm} unidade="km" cor="#D97706" />
                </View>
                <View style={styles.gridItem}>
                  <CardResumoSimples titulo="Horas" valor={detalheMes.totalHoras} unidade="h" cor="#2563EB" />
                </View>
              </View>

              {detalheMes.totalHoras > 0 && (
                <CardResumoSimples
                  titulo="Ganho por Hora"
                  valor={parseFloat((detalheMes.totalGanho / detalheMes.totalHoras).toFixed(2))}
                  unidade="R$/h"
                  cor="#6C63FF"
                />
              )}
              {detalheMes.totalKm > 0 && (
                <CardResumoSimples
                  titulo="Ganho por Km"
                  valor={parseFloat((detalheMes.totalGanho / detalheMes.totalKm).toFixed(2))}
                  unidade="R$/km"
                  cor="#0891B2"
                />
              )}

              {/* Registros do mês */}
              <Text style={styles.sectionTitle}>Registros do mês ({registrosMes.length})</Text>
              {registrosMes
                .sort((a, b) => b.data.localeCompare(a.data))
                .map((r) => {
                  const liquido = (r.valorRecebido || 0) - (r.custoVariavel || 0) - (r.custoCombustivel || 0) - (r.custoAluguel || 0);
                  const isPositivo = liquido >= 0;
                  return (
                    <View key={r.id} style={styles.registroLinha}>
                      <View style={[styles.registroIndicador, { backgroundColor: isPositivo ? '#16A34A' : '#DC2626' }]} />
                      <View style={styles.registroCorpo}>
                        <View style={styles.registroHeader}>
                          <Text style={styles.regData}>{r.data}</Text>
                          <Text style={styles.regGanho}>{formatarMoeda(r.valorRecebido)}</Text>
                        </View>
                        <View style={styles.regChips}>
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>🛣 {r.kmRodados || 0} km</Text>
                          </View>
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>⏱ {r.horasTrabalhadas || 0}h</Text>
                          </View>
                          <View style={[styles.chip, { backgroundColor: isPositivo ? '#DCFCE7' : '#FEE2E2' }]}>
                            <Text style={[styles.chipText, { color: isPositivo ? '#16A34A' : '#DC2626', fontWeight: '700' }]}>
                              {formatarMoeda(liquido)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
            </>
          ) : (
            <View style={styles.selectHint}>
              <Text style={styles.selectHintText}>Selecione um mês acima para ver o detalhamento</Text>
            </View>
          )}
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 2,
  },
  tituloMes: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    textTransform: 'capitalize',
    marginTop: 16,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  mesesScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  mesPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  mesPillAtivo: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  mesPillTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  mesPillTextoAtivo: {
    color: '#FFFFFF',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridItem: {
    flex: 1,
  },
  registroLinha: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginVertical: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  registroIndicador: {
    width: 4,
  },
  registroCorpo: {
    flex: 1,
    padding: 12,
  },
  registroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  regData: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  regGanho: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  regChips: {
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
  selectHint: {
    alignItems: 'center',
    marginTop: 32,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  selectHintText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 6,
  },
  emptyTexto: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
});
