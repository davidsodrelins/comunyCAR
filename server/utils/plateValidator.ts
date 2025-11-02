/**
 * Valida placa brasileira nos formatos:
 * - Placa antiga: ABC-1234
 * - Placa Mercosul: ABC1D23
 * - Placa com hífen: ABC-1D23
 */

export function validateBrazilianPlate(plate: string): boolean {
  if (!plate || typeof plate !== "string") {
    return false;
  }

  // Remover espaços e converter para maiúsculas
  const cleanedPlate = plate.trim().toUpperCase();

  // Padrão para placa antiga (ABC-1234 ou ABC1234)
  const oldPlatePattern = /^[A-Z]{3}-?\d{4}$/;

  // Padrão para placa Mercosul (ABC1D23 ou ABC-1D23)
  const mercosulPlatePattern = /^[A-Z]{3}-?\d{1}[A-Z]{1}\d{2}$/;

  return oldPlatePattern.test(cleanedPlate) || mercosulPlatePattern.test(cleanedPlate);
}

/**
 * Normaliza placa brasileira (remove hífen)
 */
export function normalizePlate(plate: string): string {
  if (!plate) return "";
  return plate.trim().toUpperCase().replace("-", "");
}

/**
 * Formata placa brasileira com hífen
 */
export function formatPlate(plate: string): string {
  const normalized = normalizePlate(plate);

  if (!validateBrazilianPlate(normalized)) {
    return normalized;
  }

  // Placa antiga: ABC1234 -> ABC-1234
  if (normalized.length === 7 && /^[A-Z]{3}\d{4}$/.test(normalized)) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  }

  // Placa Mercosul: ABC1D23 -> ABC-1D23
  if (normalized.length === 7 && /^[A-Z]{3}\d{1}[A-Z]{1}\d{2}$/.test(normalized)) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  }

  return normalized;
}

/**
 * Retorna o tipo de placa
 */
export function getPlateType(plate: string): "old" | "mercosul" | "invalid" {
  const normalized = normalizePlate(plate);

  // Placa antiga
  if (/^[A-Z]{3}\d{4}$/.test(normalized)) {
    return "old";
  }

  // Placa Mercosul
  if (/^[A-Z]{3}\d{1}[A-Z]{1}\d{2}$/.test(normalized)) {
    return "mercosul";
  }

  return "invalid";
}

/**
 * Extrai informações da placa
 */
export function parsePlate(plate: string): {
  valid: boolean;
  type: "old" | "mercosul" | "invalid";
  normalized: string;
  formatted: string;
  letters: string;
  numbers: string;
} {
  const normalized = normalizePlate(plate);
  const type = getPlateType(plate);
  const formatted = formatPlate(plate);

  let letters = "";
  let numbers = "";

  if (type === "old") {
    letters = normalized.slice(0, 3);
    numbers = normalized.slice(3);
  } else if (type === "mercosul") {
    letters = normalized.slice(0, 3) + normalized.slice(4, 5);
    numbers = normalized.slice(3, 4) + normalized.slice(5);
  }

  return {
    valid: type !== "invalid",
    type,
    normalized,
    formatted,
    letters,
    numbers,
  };
}

// Exemplos de uso:
// validateBrazilianPlate("ABC-1234") -> true
// validateBrazilianPlate("ABC1D23") -> true
// validateBrazilianPlate("ABC-1D23") -> true
// validateBrazilianPlate("INVALID") -> false
// normalizePlate("ABC-1234") -> "ABC1234"
// formatPlate("ABC1234") -> "ABC-1234"
// getPlateType("ABC1234") -> "old"
// getPlateType("ABC1D23") -> "mercosul"
// parsePlate("ABC-1234") -> { valid: true, type: "old", normalized: "ABC1234", formatted: "ABC-1234", letters: "ABC", numbers: "1234" }
