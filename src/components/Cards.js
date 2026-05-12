import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatarMoeda } from '../utils/helpers';

const COLORS = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  primary: '#6C63FF',
  text: '#1E1B4B',
  muted: '#64748B',
  border: '#E2E8F0',
};

export default function CardResumo({ titulo, valor, cor = '#333' }) {
  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <Text style={styles.cardTitulo}>{titulo}</Text>
      <Text style={[styles.cardValor, { color: cor }]}>{formatarMoeda(valor)}</Text>
    </View>
  );
}

export function CardResumoSimples({ titulo, valor, unidade = '', cor = '#333' }) {
  return (
    <View style={[styles.card, { borderLeftColor: cor }]}>
      <Text style={styles.cardTitulo}>{titulo}</Text>
      <Text style={[styles.cardValor, { color: cor }]}>
        {unidade === 'R$' ? formatarMoeda(valor) : `${valor}${unidade ? ' ' + unidade : ''}`}
      </Text>
    </View>
  );
}

export function CardValor({ label, valor, cor = '#333' }) {
  return (
    <View style={styles.valorBox}>
      <Text style={styles.valorLabel}>{label}</Text>
      <Text style={[styles.valorGrande, { color: cor }]}>{formatarMoeda(valor)}</Text>
    </View>
  );
}

export function CardHero({ label, valor, icon, cor, flex = 1 }) {
  const isNegative = valor < 0;
  const displayCor = cor || (isNegative ? '#DC2626' : '#16A34A');
  return (
    <View style={[styles.heroCard, { flex }]}>
      <View style={[styles.heroIcon, { backgroundColor: displayCor + '18' }]}>
        <Text style={styles.heroIconText}>{icon}</Text>
      </View>
      <Text style={styles.heroLabel}>{label}</Text>
      <Text style={[styles.heroValor, { color: displayCor }]} numberOfLines={1} adjustsFontSizeToFit>
        {formatarMoeda(valor)}
      </Text>
    </View>
  );
}

export function CardStat({ icon, label, valor, cor = COLORS.primary }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBg, { backgroundColor: cor + '18' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statValor, { color: cor }]}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function CardProgress({ titulo, progresso, meta, atual, cor = COLORS.primary }) {
  const pct = Math.min(Math.max(progresso, 0), 100);
  const concluida = pct >= 100;
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleRow}>
          <Text style={styles.progressIcon}>{concluida ? '🏆' : '🎯'}</Text>
          <Text style={styles.progressTitulo} numberOfLines={1}>{titulo}</Text>
        </View>
        <Text style={[styles.progressPct, { color: concluida ? '#16A34A' : cor }]}>
          {pct.toFixed(0)}%
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%`, backgroundColor: concluida ? '#16A34A' : cor },
          ]}
        />
      </View>
      <View style={styles.progressFooter}>
        <Text style={styles.progressInfo}>Atual: {formatarMoeda(atual)}</Text>
        <Text style={styles.progressInfo}>Meta: {formatarMoeda(meta)}</Text>
      </View>
    </View>
  );
}

export function CardToque({ titulo, onPress, cor = COLORS.primary }) {
  return (
    <TouchableOpacity style={[styles.cardToque, { borderColor: cor }]} onPress={onPress}>
      <Text style={[styles.cardTitulo, { color: cor }]}>{titulo}</Text>
      <Text style={[styles.seta, { color: cor }]}>›</Text>
    </TouchableOpacity>
  );
}

export function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
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
  cardTitulo: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardValor: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  valorBox: {
    alignItems: 'center',
    marginVertical: 8,
  },
  valorLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  valorGrande: {
    fontSize: 28,
    fontWeight: '700',
  },
  // Hero card
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroIconText: {
    fontSize: 18,
  },
  heroLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroValor: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  // Stat card
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIcon: {
    fontSize: 16,
  },
  statValor: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Progress card
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  progressTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  progressPct: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressInfo: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '500',
  },
  // Touch card
  cardToque: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  seta: {
    fontSize: 22,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 2,
  },
});
