import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../components/context/use-auth";
import AuthShell from "../../../components/features/auth/auth-shell";
import { getErrorMessage } from "../../../lib/error";
import { authButton, authInput } from "../../../lib/styles";
import loginImg from "../../../assets/login.webp";

type FromState = { from?: { pathname: string; search: string } } | null;

function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as FromState)?.from;
  const redirectTo = from ? `${from.pathname}${from.search}` : "/";

  if (loading) return null;
  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell image={loginImg}>
      <h1 className="mb-2 text-center text-4xl font-bold">Welcome To JMCA</h1>
      <p className="mb-10 text-center text-sm">
        Beauty is how you feel inside, and it reflects in your eyes.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={authInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={authInput}
        />

        {error && (
          <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <p className="text-sm">
          First time here?{" "}
          <Link
            to="/signup"
            state={location.state}
            className="font-bold underline"
          >
            Create Account.
          </Link>
        </p>

        <button type="submit" disabled={submitting} className={authButton}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;