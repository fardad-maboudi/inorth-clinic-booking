import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import JoorchinBuiltBy from './components/JoorchinBuiltBy.jsx'
import RouteErrorBoundary from './components/RouteErrorBoundary.jsx'
import { pwaConfig } from './config/pwa.js'
import { installViewportRecovery } from './lib/viewport-recovery.js'
import { installAccordionAnimation } from './lib/accordion.js'

installViewportRecovery()
installAccordionAnimation()

if (import.meta.env.PROD && pwaConfig.enabled !== false) {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }))
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: (n, e) => !(e?.status >= 400 && e?.status < 500) && n < 2 } } })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Platform chrome: fails alone, never takes the app down with it. */}
      <RouteErrorBoundary routeName="JoorchinBuiltBy" fallback={() => null}>
        <JoorchinBuiltBy />
      </RouteErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
