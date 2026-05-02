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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Novo Registro</Text>

      <InputForm label="Data" value={data} onChangeText={setData} placeholder="YYYY-MM-DD" />
      <InputForm
        label="Valor Recebido (R$)"
        value={valorRecebido}
        onChangeText={setValorRecebido}
        keyboardType="decimal-pad"
      />
      <InputForm label="Km Rodados" value={kmRodados} onChangeText={setKmRodados} keyboardType="decimal-pad" />
      <InputForm
        label="Horas Trabalhadas"
        value={horasTrabalhadas}
        onChangeText={setHorasTrabalhadas}
        keyboardType="decimal-pad"
      />
      <InputForm
        label="Custo Variável (R$)"
        value={custoVariavel}
        onChangeText={setCustoVariavel}
        keyboardType="decimal-pad"
      />
      <InputForm
        label="Custo Combustível (R$)"
        value={custoCombustivel}
        onChangeText={setCustoCombustivel}
        keyboardType="decimal-pad"
      />
      <InputForm
        label="Aluguel do Carro (R$)"
        value={custoAluguel}
        onChangeText={setCustoAluguel}
        keyboardType="decimal-pad"
      />

      <Botao titulo="Salvar Registro" onPress={handleSalvar} />

      <Text style={styles.subtitulo}>Registros Anteriores</Text>
      {registros.map((r) => (
        <RegistroItem key={r.id} registro={r} onDeletar={handleDeletar} />
      ))}
      {registros.length === 0 && (
        <Text style={styles.vazio}>Nenhum registro encontrado.</Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  vazio: {
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
  },
});
