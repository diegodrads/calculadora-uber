import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import InputForm from '../components/InputForm';
import Botao from '../components/Botao';
import { salvarConfig, listarConfig } from '../storage/database';

export default function AluguelConfigScreen() {
  const [config, setConfig] = useState({});
  const [valorAluguel, setValorAluguel] = useState('');
  const [tipoAluguel, setTipoAluguel] = useState('mensal'); // 'semanal' | 'mensal'
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

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>⚙️ Configurações</Text>

      {/* Aluguel do Carro */}
      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>🚗 Aluguel do Carro</Text>
        <InputForm
          label="Valor do Aluguel (R$)"
          value={valorAluguel}
          onChangeText={setValorAluguel}
          keyboardType="decimal-pad"
        />
        <Text style={styles.label}>Tipo de Cobrança</Text>
        <View style={styles.opcoes}>
          <Botao
            titulo="Semanal"
            onPress={() => setTipoAluguel('semanal')}
            cor={tipoAluguel === 'semanal' ? '#9C27B0' : '#ccc'}
          />
          <Botao
            titulo="Mensal"
            onPress={() => setTipoAluguel('mensal')}
            cor={tipoAluguel === 'mensal' ? '#9C27B0' : '#ccc'}
          />
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

      {/* Combustível Padrão */}
      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>⛽ Combustível Padrão</Text>
        <InputForm
          label="Preço do Combustível (R$/L)"
          value={combustivelPreco}
          onChangeText={setCombustivelPreco}
          keyboardType="decimal-pad"
        />
        <InputForm
          label="Km por Litro"
          value={combustivelKmL}
          onChangeText={setCombustivelKmL}
          keyboardType="decimal-pad"
        />
        {combustivelPreco && combustivelKmL && parseFloat(combustivelKmL) > 0 && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              Custo estimado: R$ {(parseFloat(combustivelPreco) / parseFloat(combustivelKmL)).toFixed(2)}/km
            </Text>
          </View>
        )}
      </View>

      {/* Visibilidade */}
      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>👁️ Exibir Aluguel nos Registros</Text>
        <View style={styles.opcoes}>
          <Botao
            titulo="Sim"
            onPress={() => setExibirAluguel('sim')}
            cor={exibirAluguel === 'sim' ? '#6C63FF' : '#ccc'}
          />
          <Botao
            titulo="Não"
            onPress={() => setExibirAluguel('nao')}
            cor={exibirAluguel === 'nao' ? '#6C63FF' : '#ccc'}
          />
        </View>
      </View>

      <Botao titulo="Salvar Configurações" onPress={handleSalvar} />
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
    marginBottom: 16,
  },
  secao: {
    marginBottom: 24,
  },
  tituloSecao: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  opcoes: {
    flexDirection: 'row',
    gap: 8,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
});
