import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token di verifica mancante");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Errore durante la verifica");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Errore di connessione");
      });
  }, [searchString]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4">
            {status === "loading" && (
              <div className="bg-muted">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          <CardTitle>
            {status === "loading" && "Verifica in corso..."}
            {status === "success" && "Email Verificata!"}
            {status === "error" && "Verifica Fallita"}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          {status !== "loading" && (
            <Button onClick={() => navigate("/login")} data-testid="button-go-to-login">
              Vai al Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
