import legacy from '@vitejs/plugin-legacy'

export default function legacyConfig() {
  return legacy({
    targets: ["chrome > 100"]
  })
}
