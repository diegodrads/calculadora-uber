export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function formatarMoeda(valor) {
  return `R$ ${(valor || 0).toFixed(2).replace('.', ',')}`;
}

export function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}

export function dataHoje() {
  return new Date().toISOString().split('T')[0];
}

export function diasNoMes(ano, mes) {
  return new Date(ano, mes, 0).getDate();
}

export function primeiroDiaMes(ano, mes) {
  return new Date(ano, mes - 1, 1).toISOString().split('T')[0];
}

export function ultimoDiaMes(ano, mes) {
  return new Date(ano, mes, 0).toISOString().split('T')[0];
}

export function calcularJuros(valor, taxaJurosMensal, dias) {
  // Juros simples: valor * (taxa/100) * (dias/30)
  return valor * (taxaJurosMensal / 100) * (dias / 30);
}

export function calcularCustoPorKm(valorCombustivel, kmMedioPorLitro) {
  if (!kmMedioPorLitro || kmMedioPorLitro === 0) return 0;
  return valorCombustivel / kmMedioPorLitro;
}

export function resumoPorMes(registros) {
  const resumo = {};
  registros.forEach((r) => {
    const mes = r.data.substring(0, 7);
    if (!resumo[mes]) {
      resumo[mes] = {
        mes,
        totalGanho: 0,
        totalKm: 0,
        totalCustoVariavel: 0,
        totalCombustivel: 0,
        totalAluguel: 0,
        totalHoras: 0,
      };
    }
    resumo[mes].totalGanho += r.valorRecebido || 0;
    resumo[mes].totalKm += r.kmRodados || 0;
    resumo[mes].totalCustoVariavel += r.custoVariavel || 0;
    resumo[mes].totalCombustivel += r.custoCombustivel || 0;
    resumo[mes].totalAluguel += r.custoAluguel || 0;
    resumo[mes].totalHoras += r.horasTrabalhadas || 0;
  });
  return Object.values(resumo).sort((a, b) => a.mes.localeCompare(b.mes));
}

export function calcularMetaDiariaNecessaria(metaMensal, diasTrabalhados, diasUteisRestantes, ganhoAcumulado) {
  const restante = metaMensal - ganhoAcumulado;
  if (restante <= 0) return 0;
  if (diasUteisRestantes <= 0) return restante;
  return restante / diasUteisRestantes;
}
