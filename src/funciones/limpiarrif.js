export default function limpiarrif(rif) {
  return rif.toUpperCase().trim().replace(/[^JVEGP0-9-]/g, "");
}
