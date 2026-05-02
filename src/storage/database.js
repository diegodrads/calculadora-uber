import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  REGISTROS: '@uber_registros',
  METAS: '@uber_metas',
  DIVIDAS: '@uber_dividas',
  CONFIG: '@uber_config',
};

// ============ Registros Diários ============
export async function salvarRegistro(registro) {
  try {
    const registros = await listarRegistros();
    const idx = registros.findIndex((r) => r.id === registro.id);
    if (idx >= 0) {
      registros[idx] = registro;
    } else {
      registros.push(registro);
    }
    await AsyncStorage.setItem(KEYS.REGISTROS, JSON.stringify(registros));
    return true;
  } catch (e) {
    console.error('Erro ao salvar registro:', e);
    return false;
  }
}

export async function listarRegistros() {
  try {
    const data = await AsyncStorage.getItem(KEYS.REGISTROS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao listar registros:', e);
    return [];
  }
}

export async function deletarRegistro(id) {
  try {
    const registros = await listarRegistros();
    const filtrados = registros.filter((r) => r.id !== id);
    await AsyncStorage.setItem(KEYS.REGISTROS, JSON.stringify(filtrados));
    return true;
  } catch (e) {
    console.error('Erro ao deletar registro:', e);
    return false;
  }
}

// ============ Metas ============
export async function salvarMeta(meta) {
  try {
    const metas = await listarMetas();
    const idx = metas.findIndex((m) => m.id === meta.id);
    if (idx >= 0) {
      metas[idx] = meta;
    } else {
      metas.push(meta);
    }
    await AsyncStorage.setItem(KEYS.METAS, JSON.stringify(metas));
    return true;
  } catch (e) {
    console.error('Erro ao salvar meta:', e);
    return false;
  }
}

export async function listarMetas() {
  try {
    const data = await AsyncStorage.getItem(KEYS.METAS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao listar metas:', e);
    return [];
  }
}

export async function deletarMeta(id) {
  try {
    const metas = await listarMetas();
    const filtradas = metas.filter((m) => m.id !== id);
    await AsyncStorage.setItem(KEYS.METAS, JSON.stringify(filtradas));
    return true;
  } catch (e) {
    console.error('Erro ao deletar meta:', e);
    return false;
  }
}

// ============ Dívidas ============
export async function salvarDivida(divida) {
  try {
    const dividas = await listarDividas();
    const idx = dividas.findIndex((d) => d.id === divida.id);
    if (idx >= 0) {
      dividas[idx] = divida;
    } else {
      dividas.push(divida);
    }
    await AsyncStorage.setItem(KEYS.DIVIDAS, JSON.stringify(dividas));
    return true;
  } catch (e) {
    console.error('Erro ao salvar dívida:', e);
    return false;
  }
}

export async function listarDividas() {
  try {
    const data = await AsyncStorage.getItem(KEYS.DIVIDAS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao listar dívidas:', e);
    return [];
  }
}

export async function deletarDivida(id) {
  try {
    const dividas = await listarDividas();
    const filtradas = dividas.filter((d) => d.id !== id);
    await AsyncStorage.setItem(KEYS.DIVIDAS, JSON.stringify(filtradas));
    return true;
  } catch (e) {
    console.error('Erro ao deletar dívida:', e);
    return false;
  }
}

// ============ Configurações ============
export async function salvarConfig(config) {
  try {
    await AsyncStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Erro ao salvar config:', e);
    return false;
  }
}

export async function listarConfig() {
  try {
    const data = await AsyncStorage.getItem(KEYS.CONFIG);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Erro ao listar config:', e);
    return {};
  }
}
