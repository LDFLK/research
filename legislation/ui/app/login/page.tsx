 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "@/provider/configProvider";
import { setAuthToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LoginResponse = {
  success: boolean;
  token?: string;
  expires_at?: string;
  detail?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const apiUrl = useConfig().apiUrl;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok || !data.success || !data.token) {
        setError(data.detail || "Login failed. Please check your credentials.");
        return;
      }

      setAuthToken(data.token);
      router.push("/");
    } catch (err) {
      setError("Unable to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use your credentials to access the legislation analysis dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

