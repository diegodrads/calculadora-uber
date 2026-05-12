import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CardResumo, { CardResumoSimples, CardHero, CardStat, CardProgress, SectionTitle } from '../components/Cards';
import { listarRegistros, listarMetas, listarDividas, listarConfig } from '../storage/database';
import { formatarMoeda } from '../utils/helpers';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function diasNoMes(ano, mes) {
  return new Date(ano, mes, 0).getDate();
}

function formatarHoras(h) {
  if (!h || h === 0) return '0h';
  const horas = Math.floor(h);
  const min = Math.round((h - horas) * 60);
  if (min === 0) return `${horas}h`;
  return `${horas}h ${min}min`;
}

function formatarKm(km) {
  return km.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export default function DashboardScreen() {
  const [registros, setRegistros] = useState([]);
  const [metas, setMetas] = useState([]);
  const [dividas, setDividas] = useState([]);
  const [config, setConfig] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  async function carregarDados() {
    const [r, m, d, c] = await Promise.all([
      listarRegistros(),
      listarMetas(),
      listarDividas(),
      listarConfig(),
    ]);
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

  // Memoizado: só recalcula quando os dados mudam
  const resumo = useMemo(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    const mesAtual = `${ano}-${String(mes).padStart(2, '0')}`;
    const diaHoje = hoje.getDate();
    const totalDiasDoMes = diasNoMes(ano, mes);
    const diasRestantes = totalDiasDoMes - diaHoje;

    const registrosMes = registros.filter((r) => r.data && r.data.startsWith(mesAtual));
    const diasUnicos = new Set(registrosMes.map((r) => r.data));
    const diasComRegistro = diasUnicos.size;

    const kmTotal = registrosMes.reduce((s, r) => s + (r.kmRodados || 0), 0);
    const horasTotal = registrosMes.reduce((s, r) => s + (r.horasTrabalhadas || 0), 0);
    const receitaTotal = registrosMes.reduce((s, r) => s + (r.valorRecebido || 0), 0);
    const custoVariavelTotal = registrosMes.reduce((s, r) => s + (r.custoVariavel || 0), 0);
    const custoCombustivelTotal = registrosMes.reduce((s, r) => s + (r.custoCombustivel || 0), 0);

    // Aluguel: usa o lançado nos registros, ou calcula pela config se não houver
    const custoAluguelRegistros = registrosMes.reduce((s, r) => s + (r.custoAluguel || 0), 0);
    const custoAluguelConfig = config.valorAluguel || 0;
    const tipoAluguel = config.tipoAluguel || 'mensal';

    let custoAluguelTotal = custoAluguelRegistros;
    if (custoAluguelRegistros === 0 && custoAluguelConfig > 0 && diasComRegistro > 0) {
      if (tipoAluguel === 'mensal') {
        // Proporcional: distribui o custo mensal pelos dias trabalhados no mês
        custoAluguelTotal = (custoAluguelConfig / totalDiasDoMes) * diasComRegistro;
      } else if (tipoAluguel === 'semanal') {
        const valorDiario = config.valorAluguelDiario || (custoAluguelConfig / 7);
        custoAluguelTotal = valorDiario * diasComRegistro;
      }
    }

    const custoTotalPeriodo = custoVariavelTotal + custoCombustivelTotal + custoAluguelTotal;
    const lucroLiquido = receitaTotal - custoTotalPeriodo;

    // KPIs derivados
    const custoPorKm = kmTotal > 0 ? custoTotalPeriodo / kmTotal : 0;
    const ganhoPorKm = kmTotal > 0 ? receitaTotal / kmTotal : 0;
    const ganhoPorHora = horasTotal > 0 ? receitaTotal / horasTotal : 0;
    const mediaDiaria = diasComRegistro > 0 ? receitaTotal / diasComRegistro : 0;
    const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    // Meta
    const metaAtiva = metas.find((m) => m.ativa !== false);
    let progressoMeta = 0;
    let faltaMeta = 0;
    let metaDiariaRestante = 0;

    if (metaAtiva && metaAtiva.valorMensal > 0) {
      progressoMeta = (lucroLiquido / metaAtiva.valorMensal) * 100;
      faltaMeta = Math.max(metaAtiva.valorMensal - lucroLiquido, 0);
      metaDiariaRestante = diasRestantes > 0 ? faltaMeta / diasRestantes : faltaMeta;
    }

    return {
      ano,
      mes,
      diaHoje,
      totalDiasDoMes,
      diasRestantes,
      registrosMes,
      diasComRegistro,
      kmTotal,
      horasTotal,
      receitaTotal,
      custoVariavelTotal,
      custoCombustivelTotal,
      custoAluguelTotal,
      custoTotalPeriodo,
      lucroLiquido,
      custoPorKm,
      ganhoPorKm,
      ganhoPorHora,
      mediaDiaria,
      margemLucro,
      metaAtiva,
      progressoMeta,
      faltaMeta,
      metaDiariaRestante,
    };
  }, [registros, metas, config]);

  const totalDividas = useMemo(
    () => dividas.reduce((s, d) => s + (d.valorRestante || d.valorOriginal || 0), 0),
    [dividas]
  );

  const nomeMes = MESES[resumo.mes - 1];
  const temRegistros = resumo.registrosMes.length > 0;

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
          <Text style={styles.headerMes}>{nomeMes} {resumo.ano}</Text>
        </View>
        {temRegistros && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {resumo.diasComRegistro}/{resumo.totalDiasDoMes} dias
            </Text>
          </View>
        )}
      </View>

      {/* Estado vazio — nada mais é renderizado */}
      {!temRegistros ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitulo}>Nenhum registro este mês</Text>
          <Text style={styles.emptyTexto}>
            Adicione registros de corridas na aba "Registrar" para ver o resumo aqui.
          </Text>
        </View>
      ) : (
        <>
          {/* Hero: Receita e Lucro */}
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
              icon={resumo.lucroLiquido >= 0 ? '📈' : '📉'}
              cor={resumo.lucroLiquido >= 0 ? '#16A34A' : '#DC2626'}
            />
          </View>

          {/* Quick stats: km, horas, média diária */}
          <View style={styles.statsRow}>
            <CardStat
              icon="🛣️"
              label="Km Rodados"
              valor={`${formatarKm(resumo.kmTotal)} km`}
              cor="#D97706"
            />
            <CardStat
              icon="⏱️"
              label="Trabalhadas"
              valor={formatarHoras(resumo.horasTotal)}
              cor="#2563EB"
            />
            <CardStat
              icon="📅"
              label="Média/dia"
              valor={formatarMoeda(resumo.mediaDiaria).replace('R$ ', 'R$')}
              cor="#7C3AED"
            />
          </View>

          {/* KPIs de eficiência */}
          <SectionTitle>Eficiência</SectionTitle>
          <View style={styles.gridRow}>
            {resumo.ganhoPorHora > 0 && (
              <View style={styles.gridItem}>
                <CardResumoSimples
                  titulo="Ganho por Hora"
                  valor={parseFloat(resumo.ganhoPorHora.toFixed(2))}
                  unidade="R$/h"
                  cor="#6C63FF"
                />
              </View>
            )}
            {resumo.ganhoPorKm > 0 && (
              <View style={styles.gridItem}>
                <CardResumoSimples
                  titulo="Ganho por Km"
                  valor={parseFloat(resumo.ganhoPorKm.toFixed(2))}
                  unidade="R$/km"
                  cor="#0891B2"
                />
              </View>
            )}
          </View>

          {resumo.receitaTotal > 0 && (
            <CardMargem margem={resumo.margemLucro} />
          )}

          {/* Custos — só exibe os que têm valor */}
          <SectionTitle>Custos do Mês</SectionTitle>

          <View style={styles.gridRow}>
            {resumo.custoVariavelTotal > 0 && (
              <View style={styles.gridItem}>
                <CardResumo titulo="Custo Variável" valor={resumo.custoVariavelTotal} cor="#DC2626" />
              </View>
            )}
            {resumo.custoCombustivelTotal > 0 && (
              <View style={styles.gridItem}>
                <CardResumo titulo="Combustível" valor={resumo.custoCombustivelTotal} cor="#D97706" />
              </View>
            )}
          </View>

          {resumo.custoAluguelTotal > 0 && (
            <CardResumo titulo="Aluguel do Carro" valor={resumo.custoAluguelTotal} cor="#7C3AED" />
          )}

          {resumo.custoTotalPeriodo > 0 && (
            <CardResumo titulo="Custo Total" valor={resumo.custoTotalPeriodo} cor="#DC2626" />
          )}

          {resumo.custoPorKm > 0 && (
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
                progresso={resumo.progressoMeta}
                meta={resumo.metaAtiva.valorMensal}
                atual={resumo.lucroLiquido}
                cor="#6C63FF"
              />
              {resumo.faltaMeta > 0 && resumo.diasRestantes > 0 && (
                <CardMetaInfo
                  falta={resumo.faltaMeta}
                  porDia={resumo.metaDiariaRestante}
                  diasRestantes={resumo.diasRestantes}
                />
              )}
            </>
          )}

          {/* Dívidas */}
          {totalDividas > 0 && (
            <>
              <SectionTitle>Dívidas</SectionTitle>
              <CardResumo titulo="Total em Dívidas" valor={totalDividas} cor="#DC2626" />
            </>
          )}
        </>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Card de margem de lucro inline
function CardMargem({ margem }) {
  const cor = margem >= 30 ? '#16A34A' : margem >= 10 ? '#D97706' : '#DC2626';
  const label = margem >= 30 ? 'Boa margem' : margem >= 10 ? 'Margem razoável' : 'Margem baixa';
  return (
    <View style={[margemStyles.card, { borderLeftColor: cor }]}>
      <Text style={margemStyles.titulo}>Margem Líquida</Text>
      <View style={margemStyles.row}>
        <Text style={[margemStyles.valor, { color: cor }]}>{margem.toFixed(1)}%</Text>
        <View style={[margemStyles.badge, { backgroundColor: cor + '18' }]}>
          <Text style={[margemStyles.badgeText, { color: cor }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

// Card de projeção de meta
function CardMetaInfo({ falta, porDia, diasRestantes }) {
  return (
    <View style={metaStyles.card}>
      <View style={metaStyles.item}>
        <Text style={metaStyles.label}>Falta para a meta</Text>
        <Text style={metaStyles.valor}>{formatarMoeda(falta)}</Text>
      </View>
      <View style={metaStyles.separador} />
      <View style={metaStyles.item}>
        <Text style={metaStyles.label}>Necessário por dia</Text>
        <Text style={[metaStyles.valor, { color: '#6C63FF' }]}>{formatarMoeda(porDia)}</Text>
      </View>
      <View style={metaStyles.separador} />
      <View style={metaStyles.item}>
        <Text style={metaStyles.label}>Dias restantes</Text>
        <Text style={[metaStyles.valor, { color: '#64748B' }]}>{diasRestantes}d</Text>
      </View>
    </View>
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
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  headerBadgeText: {
    color: '#6C63FF',
    fontSize: 12,
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
    marginTop: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  emptyTexto: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 16,
  },
});

const margemStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
    marginHorizontal: 2,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  titulo: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  valor: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

const metaStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  valor: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  separador: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
  },
});
