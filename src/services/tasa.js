export const TasaOficial = {

  async obtener() {

    try {
      const response = await fetch('/api/tasa');
      const data = await response.json();
      return data.rate;

    } catch (error) {
      
      return 36.50; // Retorno de emergencia
    }
  }
};