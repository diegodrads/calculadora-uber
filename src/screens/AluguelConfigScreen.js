import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import InputForm from '../components/InputForm';
import Botao from '../components/Botao';
import { salvarConfig, listarConfig } from '../storage/database';

export default function AluguelConfigScreen() {
  const [config, setConfig] = useState({});
  const [valorAluguel, setValorAluguel] = useState('');
  const [tipoAluguel, setTipoAluguel] = useState('mensal');
  const [valorAluguelDiario, setValorAluguelDiario] = useState('');
  const [combustivelPreco, setCombustivelPreco] = useState('');
  const [combustivelKmL, setCombustivelKmL] = useState('');
  const [exibirAluguel, setExibirAluguel] = useState('sim');

  useFocusEffect(
    useCallback(() => {
      carregarConfig();
    }, [])
  );

  async function carregarConfig() {
    const c = await listarConfig();
    setConfig(c);
    setValorAluguel(c.valorAluguel ? String(c.valorAluguel) : '');
    setTipoAluguel(c.tipoAluguel || 'mensal');
    setValorAluguelDiario(c.valorAluguelDiario ? String(c.valorAluguelDiario) : '');
    setCombustivelPreco(c.combustivelPreco ? String(c.combustivelPreco) : '');
    setCombustivelKmL(c.combustivelKmL ? String(c.combustivelKmL) : '');
    setExibirAluguel(c.exibirAluguel !== 'nao' ? 'sim' : 'nao');
  }

  async function handleSalvar() {
    const novaConfig = {
      ...config,
      valorAluguel: parseFloat(valorAluguel) || 0,
      tipoAluguel,
      valorAluguelDiario: parseFloat(valorAluguelDiario) || 0,
      combustivelPreco: parseFloat(combustivelPreco) || 0,
      combustivelKmL: parseFloat(combustivelKmL) || 0,
      exibirAluguel,
    };

    const ok = await salvarConfig(novaConfig);
    if (ok) {
      Alert.alert('Sucesso', 'Configurações salvas!');
      await carregarConfig();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  }

  const custoPorKm =
    combustivelPreco && combustivelKmL && parseFloat(combustivelKmL) > 0
      ? parseFloat(combustivelPreco) / parseFloat(combustivelKmL)
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Aluguel */}
      <View style={styles.secaoCard}>
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoIcon}>🚗</Text>
          <Text style={styles.secaoTitulo}>Aluguel do Carro</Text>
        </View>

        <InputForm label="Valor do Aluguel (R$)" value={valorAluguel} onChangeText={setValorAluguel} keyboardType="decimal-pad" />

        <Text style={styles.fieldLabel}>Tipo de Cobrança</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, tipoAluguel === 'semanal' && styles.toggleBtnAtivo]}
            onPress={() => setTipoAluguel('semanal')}
          >
            <Text style={[styles.toggleTexto, tipoAluguel === 'semanal' && styles.toggleTextoAtivo]}>Semanal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, tipoAluguel === 'mensal' && styles.toggleBtnAtivo]}
            onPress={() => setTipoAluguel('mensal')}
          >
            <Text style={[styles.toggleTexto, tipoAluguel === 'mensal' && styles.toggleTextoAtivo]}>Mensal</Text>
          </TouchableOpacity>
        </View>

        {tipoAluguel === 'semanal' && (
          <InputForm
            label="Valor Diário Equivalente (R$)"
            value={valorAluguelDiario}
            onChangeText={setValorAluguelDiario}
            keyboardType="decimal-pad"
          />
        )}
      </View>

      {/* Combustível */}
      <View style={styles.secaoCard}>
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoIcon}>⛽</Text>
          <Text style={styles.secaoTitulo}>Combustível Padrão</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm label="Preço (R$/L)" value={combustivelPreco} onChangeText={setCombustivelPreco} keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowItem}>
            <InputForm label="Km por Litro" value={combustivelKmL} onChangeText={setCombustivelKmL} keyboardType="decimal-pad" />
          </View>
        </View>

        {custoPorKm !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Custo estimado por km</Text>
            <Text style={styles.resultValor}>R$ {custoPorKm.toFixed(2)}/km</Text>
          </View>
        )}
      </View>

      {/* Visibilidade */}
      <View style={styles.secaoCard}>
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoIcon}>👁️</Text>
          <Text style={styles.secaoTitulo}>Exibir Aluguel nos Registros</Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, exibirAluguel === 'sim' && styles.toggleBtnAtivo]}
            onPress={() => setExibirAluguel('sim')}
          >
            <Text style={[styles.toggleTexto, exibirAluguel === 'sim' && styles.toggleTextoAtivo]}>Sim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, exibirAluguel === 'nao' && styles.toggleBtnAtivo]}
            onPress={() => setExibirAluguel('nao')}
          >
            <Text style={[styles.toggleTexto, exibirAluguel === 'nao' && styles.toggleTextoAtivo]}>Não</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Botao titulo="Salvar Configurações" onPress={handleSalvar} />
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
  secaoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  secaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  secaoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  secaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnAtivo: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  toggleTextoAtivo: {
    color: '#6C63FF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  resultBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  resultValor: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16A34A',
  },
});
