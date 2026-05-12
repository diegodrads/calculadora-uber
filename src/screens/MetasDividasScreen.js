import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import InputForm from '../components/InputForm';
import Botao from '../components/Botao';
import { salvarMeta, listarMetas, deletarMeta, salvarDivida, listarDividas, deletarDivida } from '../storage/database';
import { gerarId, formatarMoeda, calcularJuros } from '../utils/helpers';

export default function MetasDividasScreen() {
  const [metas, setMetas] = useState([]);
  const [dividas, setDividas] = useState([]);

  const [metaNome, setMetaNome] = useState('');
  const [metaValor, setMetaValor] = useState('');

  const [dividaNome, setDividaNome] = useState('');
  const [dividaValor, setDividaValor] = useState('');
  const [dividaJuros, setDividaJuros] = useState('');
  const [dividaData, setDividaData] = useState('');

  const [precoCombustivel, setPrecoCombustivel] = useState('');
  const [kmPorLitro, setKmPorLitro] = useState('');
  const [custoCalculado, setCustoCalculado] = useState(null);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function carregarDados() {
    setMetas(await listarMetas());
    setDividas(await listarDividas());
  }

  async function handleSalvarMeta() {
    if (!metaNome || !metaValor) {
      Alert.alert('Atenção', 'Preencha nome e valor da meta.');
      return;
    }
    await salvarMeta({
      id: gerarId(),
      nome: metaNome,
      valorMensal: parseFloat(metaValor),
      ativa: true,
      criadaEm: new Date().toISOString(),
    });
    setMetaNome('');
    setMetaValor('');
    await carregarDados();
    Alert.alert('Sucesso', 'Meta salva!');
  }

  async function handleDeletarMeta(id) {
    Alert.alert('Confirmar', 'Deletar esta meta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: async () => { await deletarMeta(id); await carregarDados(); } },
    ]);
  }

  async function handleSalvarDivida() {
    if (!dividaNome || !dividaValor) {
      Alert.alert('Atenção', 'Preencha nome e valor da dívida.');
      return;
    }
    await salvarDivida({
      id: gerarId(),
      nome: dividaNome,
      valorOriginal: parseFloat(dividaValor),
      valorRestante: parseFloat(dividaValor),
      taxaJurosMensal: parseFloat(dividaJuros) || 0,
      dataContracao: dividaData || new Date().toISOString().split('T')[0],
      criadaEm: new Date().toISOString(),
    });
    setDividaNome('');
    setDividaValor('');
    setDividaJuros('');
    setDividaData('');
    await carregarDados();
    Alert.alert('Sucesso', 'Dívida salva!');
  }

  async function handleDeletarDivida(id) {
    Alert.alert('Confirmar', 'Deletar esta dívida?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: async () => { await deletarDivida(id); await carregarDados(); } },
    ]);
  }

  function handleCalcularCustoKm() {
    const gasolina = parseFloat(precoCombustivel);
    const kmL = parseFloat(kmPorLitro);
    if (!gasolina || !kmL) {
      Alert.alert('Atenção', 'Preencha preço do combustível e km por litro.');
      return;
    }
    setCustoCalculado(gasolina / kmL);
  }

  function calcularDiasDesde(dataStr) {
    if (!dataStr) return 0;
    const inicio = new Date(dataStr);
    const hoje = new Date();
    return Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Calculadora de Custo por Km */}
      <View style={styles.secaoCard}>
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoIcon}>⛽</Text>
          <Text style={styles.secaoTitulo}>Custo por Km</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm label="Preço (R$/L)" value={precoCombustivel} onChangeText={setPrecoCombustivel} keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowItem}>
            <InputForm label="Km por Litro" value={kmPorLitro} onChangeText={setKmPorLitro} keyboardType="decimal-pad" />
          </View>
        </View>
        <Botao titulo="Calcular" onPress={handleCalcularCustoKm} cor="#D97706" />
        {custoCalculado !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Custo por km</Text>
            <Text style={styles.resultValor}>R$ {custoCalculado.toFixed(2)}/km</Text>
          </View>
        )}
      </View>

      {/* Metas */}
      <View style={styles.secaoCard}>
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoIcon}>🎯</Text>
          <Text style={styles.secaoTitulo}>Metas</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm label="Nome" value={metaNome} onChangeText={setMetaNome} />
          </View>
          <View style={styles.rowItem}>
            <InputForm label="Valor Mensal (R$)" value={metaValor} onChangeText={setMetaValor} keyboardType="decimal-pad" />
          </View>
        </View>
        <Botao titulo="Adicionar Meta" onPress={handleSalvarMeta} cor="#6C63FF" />

        {metas.length > 0 && <View style={styles.divider} />}
        {metas.map((m) => (
          <View key={m.id} style={styles.itemLista}>
            <View style={[styles.itemIndicador, { backgroundColor: '#6C63FF' }]} />
            <View style={styles.itemCorpo}>
              <Text style={styles.itemNome}>{m.nome || 'Meta'}</Text>
              <Text style={styles.itemValor}>{formatarMoeda(m.valorMensal)}/mês</Text>
            </View>
            <TouchableOpacity style={styles.deletarBtn} onPress={() => handleDeletarMeta(m.id)}>
              <Text style={styles.deletarTexto}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Dívidas */}
      <View style={styles.secaoCard}>
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoIcon}>💳</Text>
          <Text style={styles.secaoTitulo}>Dívidas</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm label="Nome" value={dividaNome} onChangeText={setDividaNome} />
          </View>
          <View style={styles.rowItem}>
            <InputForm label="Valor (R$)" value={dividaValor} onChangeText={setDividaValor} keyboardType="decimal-pad" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm label="Juros Mensal (%)" value={dividaJuros} onChangeText={setDividaJuros} keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowItem}>
            <InputForm label="Data Contração" value={dividaData} onChangeText={setDividaData} placeholder="YYYY-MM-DD" />
          </View>
        </View>
        <Botao titulo="Adicionar Dívida" onPress={handleSalvarDivida} cor="#DC2626" />

        {dividas.length > 0 && <View style={styles.divider} />}
        {dividas.map((d) => {
          const dias = calcularDiasDesde(d.dataContracao);
          const jurosCalculados = calcularJuros(d.valorOriginal || 0, d.taxaJurosMensal || 0, dias);
          const totalComJuros = (d.valorOriginal || 0) + jurosCalculados;

          return (
            <View key={d.id} style={styles.itemLista}>
              <View style={[styles.itemIndicador, { backgroundColor: '#DC2626' }]} />
              <View style={styles.itemCorpo}>
                <Text style={styles.itemNome}>{d.nome}</Text>
                <Text style={styles.itemValor}>Original: {formatarMoeda(d.valorOriginal)}</Text>
                {d.taxaJurosMensal > 0 && (
                  <Text style={styles.itemDetalhe}>
                    +{formatarMoeda(jurosCalculados)} juros ({dias}d) → {formatarMoeda(totalComJuros)}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.deletarBtn} onPress={() => handleDeletarDivida(d.id)}>
                <Text style={styles.deletarTexto}>×</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  resultBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  resultValor: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D97706',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  itemLista: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginVertical: 4,
    overflow: 'hidden',
  },
  itemIndicador: {
    width: 4,
    alignSelf: 'stretch',
  },
  itemCorpo: {
    flex: 1,
    padding: 12,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  itemValor: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  itemDetalhe: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 2,
    fontWeight: '500',
  },
  deletarBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deletarTexto: {
    fontSize: 22,
    color: '#CBD5E1',
    lineHeight: 26,
  },
});
