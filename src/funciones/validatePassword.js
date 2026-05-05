function validatePassword(pw) {
  const issues = [];
  if ((pw?.length || 0) < 8) issues.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(pw)) issues.push('Al menos 1 mayúscula');
  if (!/[a-z]/.test(pw)) issues.push('Al menos 1 minúscula');
  if (!/[0-9]/.test(pw)) issues.push('Al menos 1 número');
  return issues;
}

export default validatePassword;