import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../components/context/use-auth";
import AuthShell from "../../../components/features/auth/auth-shell";
import PasswordRules from "../../../components/features/auth/password-rules";
import { getErrorMessage } from "../../../lib/error";
import { checkPassword } from "../../../lib/password";
import { authButton, authInput } from "../../../lib/styles";
import signupImg from "../../../assets/signup.webp";

type FromState = { from?: { pathname: string; search: string } } | null;

function SignupPage() {
  const { user, loading, signup } = useAuth();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as FromState)?.from;
  const redirectTo = from ? `${from.pathname}${from.search}` : "/";

  if (loading) return null;
  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!checkPassword(password).valid) {
      setShowRules(true);
      setError("Password does not meet the requirements");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(getErrorMessage(err, "Sign up failed. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell image={signupImg}>
      <h1 className="mb-8 text-center text-4xl font-bold">Create Account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={authInput}
        />
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
          onFocus={() => setShowRules(true)}
          required
          className={authInput}
        />

        {showRules && <PasswordRules password={password} />}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className={authInput}
        />

        {error && (
          <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <p className="text-sm">
          Already have account?{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-bold underline"
          >
            Sign In
          </Link>
        </p>

        <button type="submit" disabled={submitting} className={authButton}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </AuthShell>
  );
}

export default SignupPage;