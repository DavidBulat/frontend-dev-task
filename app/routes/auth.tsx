import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertCircleIcon } from "lucide-react";

import type { Route } from "./+types/auth";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { useLoginMutation } from "~/hooks/use-queries";
import { getReturnToFromState } from "~/utils/product-navigation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign in" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = getReturnToFromState(location.state);
  const loginMutation = useLoginMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => navigate(returnTo),
      }
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              {loginMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Sign in failed</AlertTitle>
                  <AlertDescription>
                    Invalid username or password. Please try again.
                  </AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="emilys"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
                <FieldDescription>
                  Demo credentials: emilys / emilyspass
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
