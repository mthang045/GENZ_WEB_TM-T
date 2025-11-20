import { Toaster as SonnerToaster } from 'sonner'

export function AppToaster(props) {
  return <SonnerToaster {...props} />
}

// Provide a named export `Toaster` so existing imports work: `import { Toaster } from './sonner'`
export const Toaster = AppToaster

export default AppToaster
