export function createTremolaAdapter() {
  const tremola = window.tremola || window.backend;

  return {
    isAvailable: Boolean(tremola),
    async appendEvent(event) {
      if (!tremola) {
        throw new Error("Tremola backend is not available in this browser context.");
      }

      throw new Error("tinySSB append integration still needs the Tremola API binding.");
    },
    async loadEvents() {
      if (!tremola) {
        return [];
      }

      throw new Error("tinySSB event loading still needs the Tremola API binding.");
    }
  };
}
