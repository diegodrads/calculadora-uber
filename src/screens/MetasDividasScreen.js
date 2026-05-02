import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import InputForm from '../components/InputForm';
import Botao from '../components/Botao';
import { salvarMeta, listarMetas, deletarMeta, salvarDivida, listarDividas, deletarDivida } from '../storage/database';
import { gerarId, formatarMoeda, calcularJuros } from '../utils/helpers';

export default function MetasDividasScreen() {
  const [metas, setMetas] = useState([]);
  const [dividas, setDividas] = useState([]);

  // Meta
  const [metaNome, setMetaNome] = useState('');
  const [metaValor, setMetaValor] = useState('');

  // Dívida
  const [dividaNome, setDividaNome] = useState('');
  const [dividaValor, setDividaValor] = useState('');
  const [dividaJuros, setDividaJuros] = useState('');
  const [dividaData, setDividaData] = useState('');

  // Calculadora de custo km
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

  // ===== Metas =====
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

  // ===== Dívidas =====
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Calculadora de Custo por Km */}
      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>⛽ Custo por Km</Text>
        <InputForm label="Preço Combustível (R$/L)" value={precoCombustivel} onChangeText={setPrecoCombustivel} keyboardType="decimal-pad" />
        <InputForm label="Km por Litro" value={kmPorLitro} onChangeText={setKmPorLitro} keyboardType="decimal-pad" />
        <Botao titulo="Calcular Custo por Km" onPress={handleCalcularCustoKm} cor="#FF6F00" />
        {custoCalculado !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              Custo: R$ {custoCalculado.toFixed(2)} / km
            </Text>
          </View>
        )}
      </View>

      {/* Metas */}
      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>🎯 Metas</Text>
        <InputForm label="Nome da Meta" value={metaNome} onChangeText={setMetaNome} />
        <InputForm label="Valor Mensal (R$)" value={metaValor} onChangeText={setMetaValor} keyboardType="decimal-pad" />
        <Botao titulo="Adicionar Meta" onPress={handleSalvarMeta} cor="#6C63FF" />

        {metas.map((m) => (
          <View key={m.id} style={styles.itemLista}>
            <View>
              <Text style={styles.itemNome}>{m.nome || 'Meta'}</Text>
              <Text style={styles.itemValor}>{formatarMoeda(m.valorMensal)}/mês</Text>
            </View>
            <Botao titulo="×" onPress={() => handleDeletarMeta(m.id)} cor="#e53935" />
          </View>
        ))}
      </View>

      {/* Dívidas */}
      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>💳 Dívidas</Text>
        <InputForm label="Nome da Dívida" value={dividaNome} onChangeText={setDividaNome} />
        <InputForm label="Valor Original (R$)" value={dividaValor} onChangeText={setDividaValor} keyboardType="decimal-pad" />
        <InputForm label="Taxa de Juros Mensal (%)" value={dividaJuros} onChangeText={setDividaJuros} keyboardType="decimal-pad" />
        <InputForm label="Data da Contração" value={dividaData} onChangeText={setDividaData} placeholder="YYYY-MM-DD" />
        <Botao titulo="Adicionar Dívida" onPress={handleSalvarDivida} cor="#D32F2F" />

        {dividas.map((d) => {
          const dias = calcularDiasDesde(d.dataContracao);
          const jurosCalculados = calcularJuros(d.valorOriginal || 0, d.taxaJurosMensal || 0, dias);
          const totalComJuros = (d.valorOriginal || 0) + jurosCalculados;

          return (
            <View key={d.id} style={styles.itemLista}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNome}>{d.nome}</Text>
                <Text style={styles.itemValor}>Original: {formatarMoeda(d.valorOriginal)}</Text>
                {d.taxaJurosMensal > 0 && (
                  <>
                    <Text style={styles.itemDetalhe}>Juros ({dias}d): +{formatarMoeda(jurosCalculados)}</Text>
                    <Text style={styles.itemTotal}>Total c/ juros: {formatarMoeda(totalComJuros)}</Text>
                  </>
                )}
              </View>
              <Botao titulo="×" onPress={() => handleDeletarDivida(d.id)} cor="#e53935" />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    padding: 16,
  },
  secao: {
    marginBottom: 24,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  resultBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  itemLista: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  itemValor: {
    fontSize: 13,
    color: '#666',
  },
  itemDetalhe: {
    fontSize: 12,
    color: '#e53935',
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D32F2F',
  },
});
