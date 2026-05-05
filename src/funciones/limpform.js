export default function limpform(form) {
  const clean = {};
  for (const key in form) {
    if (typeof form[key] === 'string') {
      // Elimina etiquetas HTML, espacios extra y caracteres sospechosos
      clean[key] = form[key]
        .trim()
        .replace(/<[^>]*>?/gm, '') // No HTML
        .replace(/[;={}]/g, '');    // No caracteres de inyección SQL comunes
    } else {
      clean[key] = form[key];
    }
  }
  return clean;
};