import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CardResumo, { CardResumoSimples, CardHero, CardStat, CardProgress, SectionTitle } from '../components/Cards';
import { listarRegistros, listarMetas, listarDividas, listarConfig } from '../storage/database';
import { formatarMoeda } from '../utils/helpers';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

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

    const custoAluguelRegistros = registrosMes.reduce((s, r) => s + (r.custoAluguel || 0), 0);
    const diasComRegistro = new Set(registrosMes.map((r) => r.data)).size;
    const custoAluguelConfig = config.valorAluguel || 0;
    const tipoAluguel = config.tipoAluguel || 'mensal';

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
    const custoPorKm = kmTotal > 0 ? custoTotalPeriodo / kmTotal : 0;
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
      diasComRegistro,
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
  const hoje = new Date();
  const nomeMes = MESES[hoje.getMonth()];
  const anoAtual = hoje.getFullYear();

  const progresso =
    resumo.metaAtiva && resumo.metaAtiva.valorMensal > 0
      ? (resumo.lucroLiquido / resumo.metaAtiva.valorMensal) * 100
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Resumo do mês</Text>
          <Text style={styles.headerMes}>{nomeMes} {anoAtual}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{resumo.diasComRegistro}d</Text>
        </View>
      </View>

      {/* Hero metrics */}
      <View style={styles.heroRow}>
        <CardHero
          label="Receita Bruta"
          valor={resumo.receitaTotal}
          icon="💰"
          cor="#16A34A"
        />
        <CardHero
          label="Lucro Líquido"
          valor={resumo.lucroLiquido}
          icon="📈"
          cor={resumo.lucroLiquido >= 0 ? '#16A34A' : '#DC2626'}
        />
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <CardStat icon="🛣️" label="Km Rodados" valor={`${resumo.kmTotal} km`} cor="#D97706" />
        <CardStat icon="⏱️" label="Horas" valor={`${resumo.horasTotal} h`} cor="#2563EB" />
        <CardStat icon="📅" label="Dias" valor={`${resumo.diasComRegistro}`} cor="#7C3AED" />
      </View>

      {/* Custos */}
      <SectionTitle>Custos do Mês</SectionTitle>

      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <CardResumo titulo="Custo Variável" valor={resumo.custoVariavelTotal} cor="#DC2626" />
        </View>
        <View style={styles.gridItem}>
          <CardResumo titulo="Combustível" valor={resumo.custoCombustivelTotal} cor="#D97706" />
        </View>
      </View>

      {resumo.custoAluguelTotal > 0 && (
        <CardResumo titulo="Aluguel do Carro" valor={resumo.custoAluguelTotal} cor="#7C3AED" />
      )}

      <CardResumo titulo="Custo Total do Período" valor={resumo.custoTotalPeriodo} cor="#DC2626" />

      {resumo.kmTotal > 0 && (
        <CardResumoSimples
          titulo="Custo por Km Rodado"
          valor={parseFloat(resumo.custoPorKm.toFixed(2))}
          unidade="R$/km"
          cor="#DB2777"
        />
      )}

      {/* Meta */}
      {resumo.metaAtiva && (
        <>
          <SectionTitle>Progresso da Meta</SectionTitle>
          <CardProgress
            titulo={resumo.metaAtiva.nome || 'Meta do Mês'}
            progresso={progresso}
            meta={resumo.metaAtiva.valorMensal}
            atual={resumo.lucroLiquido}
            cor="#6C63FF"
          />
        </>
      )}

      {/* Dívidas */}
      {totalDividas > 0 && (
        <>
          <SectionTitle>Dívidas</SectionTitle>
          <CardResumo titulo="Total em Dívidas" valor={totalDividas} cor="#DC2626" />
        </>
      )}

      {/* Estado vazio */}
      {resumo.registrosMes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitulo}>Nenhum registro este mês</Text>
          <Text style={styles.emptyTexto}>
            Adicione registros de corridas na aba "Registrar" para ver o resumo aqui.
          </Text>
        </View>
      )}

      <View style={styles.bottomSpacer} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerMes: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.3,
  },
  headerBadge: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -3,
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridItem: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
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
  bottomSpacer: {
    height: 16,
  },
});
