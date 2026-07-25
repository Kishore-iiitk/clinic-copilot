import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { RoleProvider, useRole } from '@/context/RoleContext';
import { AppLayout } from '@/components/layout/AppLayout';

import RoleSelect from '@/pages/RoleSelect';
import WardDashboard from '@/pages/WardDashboard';
import Alerts from '@/pages/Alerts';
import PatientDetail from '@/pages/PatientDetail';
import VoiceNote from '@/pages/VoiceNote';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { role } = useRole();
  if (!role) return <RoleSelect />;
  return <Component {...rest} />;
}

function Router() {
  const { role } = useRole();
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={role ? WardDashboard : RoleSelect} />
        <Route path="/ward" component={() => <ProtectedRoute component={WardDashboard} />} />
        <Route path="/alerts" component={() => <ProtectedRoute component={Alerts} />} />
        <Route path="/patients/:id" component={() => <ProtectedRoute component={PatientDetail} />} />
        <Route path="/patients/:id/notes/new" component={() => <ProtectedRoute component={VoiceNote} />} />
        <Route>
          <div className="p-8 text-center text-gray-500 font-medium">Page not found</div>
        </Route>
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        {/* Wouter base is "/" — standard SPA routing for Vercel */}
        <WouterRouter>
          <Router />
        </WouterRouter>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
