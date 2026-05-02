import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CardResumo, { CardResumoSimples, CardValor } from '../components/Cards';
import { listarRegistros, listarMetas, listarDividas, listarConfig } from '../storage/database';
import { formatarMoeda, resumoPorMes, primeiroDiaMes, ultimoDiaMes, dataHoje } from '../utils/helpers';

export default function DashboardScreen() {
  const [registros, setRegistros] = useState([]);
  const [metas, setMetas] = useState([]);
  const [dividas, setDividas] = useState([]);
  const [config, setConfig] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  function calcularResumo() {
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

    const registrosMes = registros.filter((r) => r.data && r.data.startsWith(mesAtual));
    const kmTotal = registrosMes.reduce((s, r) => s + (r.kmRodados || 0), 0);
    const horasTotal = registrosMes.reduce((s, r) => s + (r.horasTrabalhadas || 0), 0);
    const receitaTotal = registrosMes.reduce((s, r) => s + (r.valorRecebido || 0), 0);
    const custoVariavelTotal = registrosMes.reduce((s, r) => s + (r.custoVariavel || 0), 0);
    const custoCombustivelTotal = registrosMes.reduce((s, r) => s + (r.custoCombustivel || 0), 0);

    // Aluguel: soma o que foi lançado por corrida + aplica config se necessário
    const custoAluguelRegistros = registrosMes.reduce((s, r) => s + (r.custoAluguel || 0), 0);
    const diasComRegistro = new Set(registrosMes.map((r) => r.data)).size;
    const custoAluguelConfig = config.valorAluguel || 0;
    const tipoAluguel = config.tipoAluguel || 'mensal';

    // Se o usuário configurou aluguel mas não lançou por corrida, calcula automaticamente
    let custoAluguelTotal = custoAluguelRegistros;
    if (custoAluguelRegistros === 0 && custoAluguelConfig > 0 && diasComRegistro > 0) {
      if (tipoAluguel === 'mensal') {
        custoAluguelTotal = custoAluguelConfig;
      } else if (tipoAluguel === 'semanal') {
        const valorDiario = config.valorAluguelDiario || (custoAluguelConfig / 7);
        custoAluguelTotal = valorDiario * diasComRegistro;
      }
    }

    const custoTotalPeriodo = custoVariavelTotal + custoCombustivelTotal + custoAluguelTotal;
    const lucroLiquido = receitaTotal - custoTotalPeriodo;

    // Custo por km
    const custoPorKm = kmTotal > 0 ? custoTotalPeriodo / kmTotal : 0;

    // Meta líquida
    const metaAtiva = metas.find((m) => m.ativa !== false);

    return {
      kmTotal,
      horasTotal,
      receitaTotal,
      custoVariavelTotal,
      custoCombustivelTotal,
      custoAluguelTotal,
      custoTotalPeriodo,
      lucroLiquido,
      custoPorKm,
      metaAtiva,
      registrosMes,
    };
  }

  async function carregarDados() {
    const r = await listarRegistros();
    const m = await listarMetas();
    const d = await listarDividas();
    const c = await listarConfig();
    setRegistros(r);
    setMetas(m);
    setDividas(d);
    setConfig(c);
  }

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const resumo = calcularResumo();
  const totalDividas = dividas.reduce((s, d) => s + (d.valorRestante || d.valorOriginal || 0), 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.saudacao}>📊 Dashboard</Text>

      <CardValor label="Receita Bruta do Mês" valor={resumo.receitaTotal} cor="#2E7D32" />
      <CardValor label="Lucro Líquido" valor={resumo.lucroLiquido} cor={resumo.lucroLiquido >= 0 ? '#2E7D32' : '#e53935'} />

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <CardResumoSimples titulo="Km Rodados" valor={resumo.kmTotal} unidade="km" cor="#FF6F00" />
        </View>
        <View style={styles.gridItem}>
          <CardResumoSimples titulo="Horas Trabalhadas" valor={resumo.horasTotal} unidade="h" cor="#1565C0" />
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <CardResumo titulo="Custo Variável" valor={resumo.custoVariavelTotal} cor="#e53935" />
        </View>
        <View style={styles.gridItem}>
          <CardResumo titulo="Combustível" valor={resumo.custoCombustivelTotal} cor="#FF6F00" />
        </View>
      </View>

      {resumo.custoAluguelTotal > 0 && (
        <CardResumo titulo="Aluguel do Carro" valor={resumo.custoAluguelTotal} cor="#9C27B0" />
      )}

      <CardResumo
        titulo="Custo Total do Período"
        valor={resumo.custoTotalPeriodo}
        cor="#e53935"
      />

      <CardResumoSimples
        titulo="Custo por Km Rodado"
        valor={resumo.custoPorKm}
        unidade="R$/km"
        cor="#E91E63"
      />

      {totalDividas > 0 && (
        <CardResumo titulo="Total em Dívidas" valor={totalDividas} cor="#D32F2F" />
      )}

      {resumo.metaAtiva && (
        <CardResumoSimples
          titulo={`Progresso Meta: ${resumo.metaAtiva.nome || 'Sem nome'}`}
          valor={resumo.metaAtiva.valorMensal > 0 ? (resumo.lucroLiquido / resumo.metaAtiva.valorMensal) * 100 : 0}
          unidade="%"
          cor="#6C63FF"
        />
      )}

      {resumo.registrosMes.length === 0 && (
        <Text style={styles.vazio}>
          Nenhum registro no mês atual. Adicione registros de corridas na aba "Registrar".
        </Text>
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
  saudacao: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  gridItem: {
    flex: 1,
  },
  vazio: {
    textAlign: 'center',
    color: '#999',
    marginTop: 24,
    fontSize: 14,
    lineHeight: 20,
  },
});
