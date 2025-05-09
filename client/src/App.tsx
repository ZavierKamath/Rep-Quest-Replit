import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/layout/app-shell";
import TrainPage from "@/pages/train";
import SplitsPage from "@/pages/splits";
import ProgressPage from "@/pages/progress";
import { WorkoutProvider } from "./context/workout-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TrainPage} />
      <Route path="/train" component={TrainPage} />
      <Route path="/splits" component={SplitsPage} />
      <Route path="/progress" component={ProgressPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WorkoutProvider>
          <Toaster />
          <AppShell>
            <Router />
          </AppShell>
        </WorkoutProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
