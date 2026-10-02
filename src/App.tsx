import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginGate from "./components/LoginGate";

const App = () => {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("mesLabelPharmaAuth") === "1"
  );
  const [password, setPassword] = useState(
    () => localStorage.getItem("mesLabelPharmaPass") ?? "dec25"
  );

  const handleLogin = () => {
    sessionStorage.setItem("mesLabelPharmaAuth", "1");
    setAuthed(true);
  };

  const handlePasswordChange = (newPassword: string) => {
    localStorage.setItem("mesLabelPharmaPass", newPassword);
    setPassword(newPassword);
  };

  if (!authed) {
    return (
      <LoginGate
        onLogin={handleLogin}
        currentPassword={password}
        onPasswordChange={handlePasswordChange}
      />
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
