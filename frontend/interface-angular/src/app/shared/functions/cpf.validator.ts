import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Function to validate a Brazilian CPF (Cadastro de Pessoas Físicas)
// This function checks if the CPF is valid according to the Brazilian CPF rules.
export function isValidCpf(cpf: string): boolean {
  if (!cpf) return false;

  // Remove any non-numeric characters from the CPF string
  // This ensures that the CPF is in a clean numeric format
  cpf = cpf.replace(/[^\d]+/g, '');

  // Check if the CPF has exactly 11 digits
  // The CPF must be 11 digits long to be valid
  if (cpf.length !== 11) return false;

  // Check for invalid CPFs that consist of repeated digits
  // These are not valid CPFs and should return false
  const invalidCpfs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999'
  ];

  // Check if the CPF is in the list of invalid CPFs
  // If it is, return false as it is not a valid CPF
  if (invalidCpfs.includes(cpf)) return false;

  let sum = 0;
  // Calculate the first verification digit
  // The first digit is calculated using the first 9 digits of the CPF
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  // The verification digit is calculated as follows:
  // 1. Take the sum of the products of each digit by its position (from 10 to 2)
  // 2. Calculate the remainder of the sum divided by 11 
  // 3. Subtract the remainder from 11 to get the verification digit
  // 4. If the result is 10 or 11, the verification digit is set to 0
  // 5. Compare the calculated verification digit with the 10th digit of the CPF
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  // Calculate the second verification digit
  // The second digit is calculated using the first 10 digits of the CPF
  // The process is similar to the first digit calculation
  // 1. Take the sum of the products of each digit by its position (from 11 to 2)
  // 2. Calculate the remainder of the sum divided by 11 
  // 3. Subtract the remainder from 11 to get the verification digit
  // 4. If the result is 10 or 11, the verification digit is  set to 0
  // 5. Compare the calculated verification digit with the 11th digit of the CPF  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  // Compare the calculated verification digit with the 11th digit of the CPF
  // If they do not match, the CPF is invalid 
  // If the calculated verification digit does not match the 11th digit of the CPF, return false
  // If they match, return true indicating the CPF is valid
  if (rev !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Validator function for Angular forms
// This function returns a ValidatorFn that checks if the CPF is valid 
// It can be used in Angular reactive forms to validate CPF inputs 
// If the CPF is valid, it returns null (indicating no errors)
// If the CPF is invalid, it returns an object with the error key 'cpfInvalid'
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return isValidCpf(value) ? null : { cpfInvalid: true };
  };
}
