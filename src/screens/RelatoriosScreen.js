import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CardResumo, { CardResumoSimples } from '../components/Cards';
import Botao from '../components/Botao';
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📈 Relatórios Mensais</Text>

      {resumoMensal.length === 0 ? (
        <Text style={styles.vazio}>Nenhum registro encontrado. Adicione registros primeiro.</Text>
      ) : (
        <>
          <Text style={styles.subtitulo}>Selecione um mês:</Text>
          <View style={styles.mesesGrid}>
            {mesesDisponiveis.map((mes) => {
              const [ano, m] = mes.split('-');
              const nomeMes = new Date(parseInt(ano), parseInt(m) - 1).toLocaleDateString('pt-BR', { month: 'long' });
              const ativo = mes === mesSelecionado;
              return (
                <Botao
                  key={mes}
                  titulo={`${nomeMes}/${ano}`}
                  onPress={() => setMesSelecionado(mes)}
                  cor={ativo ? '#6C63FF' : '#999'}
                />
              );
            })}
          </View>

          {detalheMes && (
            <View style={styles.resumoMes}>
              <Text style={styles.tituloMes}>
                {new Date(parseInt(detalheMes.mes.split('-')[0]), parseInt(detalheMes.mes.split('-')[1]) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Text>

              <CardResumo titulo="Total Recebido" valor={detalheMes.totalGanho} cor="#2E7D32" />
              <CardResumo titulo="Total Custos Variáveis" valor={detalheMes.totalCustoVariavel} cor="#e53935" />
              <CardResumo titulo="Total Combustível" valor={detalheMes.totalCombustivel} cor="#FF6F00" />
              <CardResumo titulo="Total Aluguel" valor={detalheMes.totalAluguel} cor="#9C27B0" />
              <CardResumoSimples titulo="Km Rodados" valor={detalheMes.totalKm} unidade="km" cor="#FF6F00" />
              <CardResumoSimples titulo="Horas Trabalhadas" valor={detalheMes.totalHoras} unidade="h" cor="#1565C0" />

              {detalheMes.totalHoras > 0 && (
                <CardResumoSimples
                  titulo="Ganho por Hora"
                  valor={detalheMes.totalGanho / detalheMes.totalHoras}
                  unidade="R$/h"
                  cor="#6C63FF"
                />
              )}

              {detalheMes.totalKm > 0 && (
                <CardResumoSimples
                  titulo="Ganho por Km"
                  valor={detalheMes.totalGanho / detalheMes.totalKm}
                  unidade="R$/km"
                  cor="#0097A7"
                />
              )}

              <Text style={styles.subtitulo}>Registros do mês:</Text>
              {registrosMes.map((r) => {
                const liquid = (r.valorRecebido || 0) - (r.custoVariavel || 0) - (r.custoCombustivel || 0) - (r.custoAluguel || 0);
                return (
                  <View key={r.id} style={styles.registroLinha}>
                    <View>
                      <Text style={styles.regData}>{r.data}</Text>
                      <Text style={styles.regInfo}>
                        Km: {r.kmRodados || 0} | Horas: {r.horasTrabalhadas || 0}h
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.regGanho}>{formatarMoeda(r.valorRecebido)}</Text>
                      <Text style={[styles.regLiquido, { color: liquid >= 0 ? '#2E7D32' : '#e53935' }]}>
                        Líq: {formatarMoeda(liquid)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginVertical: 12,
  },
  vazio: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15,
  },
  mesesGrid: {
    gap: 4,
  },
  resumoMes: {
    marginTop: 16,
  },
  tituloMes: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  registroLinha: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regData: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  regInfo: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  regGanho: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  regLiquido: {
    fontSize: 12,
    fontWeight: '600',
  },
});
