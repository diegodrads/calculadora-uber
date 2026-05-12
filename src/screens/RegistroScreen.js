import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import InputForm from '../components/InputForm';
import Botao from '../components/Botao';
import RegistroItem from '../components/RegistroItem';
import { salvarRegistro, listarRegistros, deletarRegistro, listarConfig } from '../storage/database';
import { gerarId, dataHoje } from '../utils/helpers';

export default function RegistroScreen() {
  const [registros, setRegistros] = useState([]);
  const [config, setConfig] = useState({});

  const [data, setData] = useState(dataHoje());
  const [valorRecebido, setValorRecebido] = useState('');
  const [kmRodados, setKmRodados] = useState('');
  const [horasTrabalhadas, setHorasTrabalhadas] = useState('');
  const [custoVariavel, setCustoVariavel] = useState('');
  const [custoCombustivel, setCustoCombustivel] = useState('');
  const [custoAluguel, setCustoAluguel] = useState('');

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function carregarDados() {
    const r = await listarRegistros();
    const c = await listarConfig();
    setRegistros(r.sort((a, b) => b.data.localeCompare(a.data)));
    setConfig(c);
  }

  function limparCampos() {
    setData(dataHoje());
    setValorRecebido('');
    setKmRodados('');
    setHorasTrabalhadas('');
    setCustoVariavel('');
    setCustoCombustivel('');
    setCustoAluguel('');
  }

  async function handleSalvar() {
    if (!valorRecebido || !kmRodados) {
      Alert.alert('Atenção', 'Preencha pelo menos valor recebido e km rodados.');
      return;
    }

    const registro = {
      id: gerarId(),
      data,
      valorRecebido: parseFloat(valorRecebido) || 0,
      kmRodados: parseFloat(kmRodados) || 0,
      horasTrabalhadas: parseFloat(horasTrabalhadas) || 0,
      custoVariavel: parseFloat(custoVariavel) || 0,
      custoCombustivel: parseFloat(custoCombustivel) || 0,
      custoAluguel: parseFloat(custoAluguel) || 0,
    };

    const ok = await salvarRegistro(registro);
    if (ok) {
      Alert.alert('Sucesso', 'Registro salvo com sucesso!');
      limparCampos();
      await carregarDados();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  }

  async function handleDeletar(id) {
    Alert.alert('Confirmar', 'Deletar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deletarRegistro(id);
          await carregarDados();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Formulário */}
      <View style={styles.formCard}>
        <Text style={styles.formTitulo}>Novo Registro</Text>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm label="Data" value={data} onChangeText={setData} placeholder="YYYY-MM-DD" />
          </View>
          <View style={styles.rowItem}>
            <InputForm
              label="Valor Recebido (R$)"
              value={valorRecebido}
              onChangeText={setValorRecebido}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm label="Km Rodados" value={kmRodados} onChangeText={setKmRodados} keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowItem}>
            <InputForm
              label="Horas Trabalhadas"
              value={horasTrabalhadas}
              onChangeText={setHorasTrabalhadas}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.separador} />
        <Text style={styles.subLabel}>Custos</Text>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <InputForm
              label="Custo Variável (R$)"
              value={custoVariavel}
              onChangeText={setCustoVariavel}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.rowItem}>
            <InputForm
              label="Combustível (R$)"
              value={custoCombustivel}
              onChangeText={setCustoCombustivel}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <InputForm
          label="Aluguel do Carro (R$)"
          value={custoAluguel}
          onChangeText={setCustoAluguel}
          keyboardType="decimal-pad"
        />

        <Botao titulo="Salvar Registro" onPress={handleSalvar} />
      </View>

      {/* Histórico */}
      <Text style={styles.sectionTitle}>Histórico</Text>

      {registros.map((r) => (
        <RegistroItem key={r.id} registro={r} onDeletar={handleDeletar} />
      ))}

      {registros.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTexto}>Nenhum registro encontrado.</Text>
        </View>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  formTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  separador: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTexto: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});
