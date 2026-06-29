export const launch = async () => ({
  newPage: async () => ({
    setContent: async () => undefined,
    pdf: async () => new Uint8Array([37, 80, 68, 70]),
  }),
  close: async () => undefined,
});

export default { launch };
