import { CalculoResultado } from '../types';

/**
 * Realiza os cálculos de necessidade de insumos para separação logística.
 * 
 * Regras:
 * - quantidadeNecessaria = quantidadeReferencia * quantidadePorBase
 *   (onde quantidadeReferencia são as Peças do pedido OU os Packs do pedido)
 * - quantidadeEmbalagens = Math.ceil(quantidadeNecessaria / quantidadePorEmbalagem)
 * - quantidadeSeparada = quantidadeEmbalagens * quantidadePorEmbalagem
 * - sobra = quantidadeSeparada - quantidadeNecessaria
 */
export function calculateInsumeRequirement(
  quantidadeReferencia: number,
  quantidadePorBase: number,
  quantidadePorEmbalagem: number
): CalculoResultado {
  if (
    quantidadeReferencia <= 0 ||
    quantidadePorBase <= 0 ||
    quantidadePorEmbalagem <= 0 ||
    isNaN(quantidadeReferencia) ||
    isNaN(quantidadePorBase) ||
    isNaN(quantidadePorEmbalagem)
  ) {
    return {
      quantidadeNecessaria: 0,
      quantidadeEmbalagens: 0,
      quantidadeSeparada: 0,
      sobra: 0,
    };
  }

  const quantidadeNecessaria = quantidadeReferencia * quantidadePorBase;
  const quantidadeEmbalagens = Math.ceil(quantidadeNecessaria / quantidadePorEmbalagem);
  const quantidadeSeparada = quantidadeEmbalagens * quantidadePorEmbalagem;
  const sobra = quantidadeSeparada - quantidadeNecessaria;

  return {
    quantidadeNecessaria,
    quantidadeEmbalagens,
    quantidadeSeparada,
    sobra,
  };
}

/**
 * Calcula a quantidade de packs a partir do total de peças e peças por pack
 */
export function calcularPacksPorPecas(totalPecas: number, pecasPorPack: number): number {
  if (totalPecas <= 0 || pecasPorPack <= 0 || isNaN(totalPecas) || isNaN(pecasPorPack)) {
    return 0;
  }
  return Math.ceil(totalPecas / pecasPorPack);
}

/**
 * Formata números no padrão brasileiro com separador de milhar (ex: 1.350 ou 2.700)
 */
export function formatNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(valor);
}
