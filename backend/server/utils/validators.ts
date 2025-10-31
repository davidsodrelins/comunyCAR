/**
 * Validadores para CNPJ, Email, Placa de Veículo, etc.
 */

/**
 * Validar CNPJ (formato: XX.XXX.XXX/XXXX-XX)
 * Retorna true se válido, false caso contrário
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres especiais
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Verifica se não é uma sequência repetida (ex: 11111111111111)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Calcula primeiro dígito verificador
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  let digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  // Calcula segundo dígito verificador
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Formatar CNPJ (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  if (cleanCNPJ.length !== 14) return cnpj;
  
  return cleanCNPJ.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Validar placa de veículo brasileiro
 * Formatos aceitos:
 * - Placa antiga: ABC-1234
 * - Placa Mercosul: ABC1D23
 */
export function isValidVehiclePlate(plate: string): boolean {
  const cleanPlate = plate.replace(/[^\w]/g, '').toUpperCase();

  // Placa antiga (ABC-1234)
  const oldFormat = /^[A-Z]{3}\d{4}$/;
  
  // Placa Mercosul (ABC1D23)
  const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return oldFormat.test(cleanPlate) || mercosulFormat.test(cleanPlate);
}

/**
 * Formatar placa de veículo
 */
export function formatVehiclePlate(plate: string): string {
  const cleanPlate = plate.replace(/[^\w]/g, '').toUpperCase();

  // Placa antiga (ABC-1234)
  if (/^[A-Z]{3}\d{4}$/.test(cleanPlate)) {
    return cleanPlate.replace(/^([A-Z]{3})(\d{4})$/, '$1-$2');
  }

  // Placa Mercosul (ABC1D23)
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleanPlate)) {
    return cleanPlate;
  }

  return plate;
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar telefone brasileiro (com ou sem formatação)
 * Formatos: (11) 99999-9999, 11 99999-9999, 11999999999
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Telefone com DDD (11 dígitos)
  if (cleanPhone.length === 11) {
    // Verifica se não é uma sequência repetida
    if (/^(\d)\1{10}$/.test(cleanPhone)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Formatar telefone brasileiro
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }

  return phone;
}

/**
 * Validar força de senha
 */
export function validatePasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Mínimo 8 caracteres');
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Misture letras maiúsculas e minúsculas');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Adicione números');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Adicione caracteres especiais');
  }

  return { score: Math.min(score, 4), feedback };
}

/**
 * Sanitizar entrada (prevenir XSS)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validar URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
