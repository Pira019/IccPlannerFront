// Permis de capturer les méthodes asynchrone
export const handleAsyncError = async (asyncFunc,t) => {
    try {
      const result = await asyncFunc(); // Exécute la fonction asynchrone
      return {
        result : result.data
      }

    } catch (error) {
      // Gérer l'erreur
      const errorMessage = error.response?.data?.message || t?.('internalError');
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
