import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Results from "@/pages/Results";
import RepoDetail from "@/pages/RepoDetail";
import Favorites from "@/pages/Favorites";
import PublicCollection from "@/pages/PublicCollection";
import Settings from "@/pages/Settings";
import BeninDevs from "@/pages/BeninDevs";
import DevProfile from "@/pages/DevProfile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/repo/:owner/:repo" element={<RepoDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/collection/:slug" element={<PublicCollection />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/devs-benin" element={<BeninDevs />} />
          <Route path="/dev/:username" element={<DevProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPrompt />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
