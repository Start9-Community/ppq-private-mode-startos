// Constants shared across this package's startos/ code.

// Port the proxy listens on inside the container (upstream default).
export const apiPort = 8787

// Upstream's PPQ_DATA_DIR inside the container: where it persists the API key
// saved from the status page.
export const dataDir = '/data'
