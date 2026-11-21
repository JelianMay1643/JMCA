import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../../components/context/use-auth";
import PasswordRules from "../../../components/features/auth/password-rules";
import {
  changePasswordRequest,
  updateProfileRequest,
} from "../../../services/auth-service";
import { getPayment, savePayment } from "../../../services/payment-service";
import { getErrorMessage } from "../../../lib/error";
import { checkPassword } from "../../../lib/password";
import { btnSmall } from "../../../lib/styles";

type Message = { ok: boolean; text: string } | null;

const field = "rounded-md border border-neutral-300 p-2 text-sm";
const providers = ["GCash", "Maya", "GoTyme", "Bank", "Other"];

function Notice({ message }: { message: Message }) {
  if (!message) return null;
  return (
    <p
      className={`rounded-md px-3 py-2 text-sm ${
        message.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {message.text}
    </p>
  );
}

function AccountProfilePage() {
  const { user, updateUser } = useAuth();
  const isCustomer = user?.role === "customer";

  const [name, setName] = useState(user?.name ?? "");
  const [nameMessage, setNameMessage] = useState<Message>(null);
  const [savingName, setSavingName] = useState(false);

  const [provider, setProvider] = useState("");
  const [number, setNumber] = useState("");
  const [paymentMessage, setPaymentMessage] = useState<Message>(null);
  const [savingPayment, setSavingPayment] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isCustomer) return;
    getPayment()
      .then((p) => {
        setProvider(p.paymentProvider ?? "");
        setNumber(p.paymentNumber ?? "");
      })
      .catch(() => {});
  }, [isCustomer]);

  const handleName = async (e: FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    setSavingName(true);
    try {
      const updated = await updateProfileRequest(name);
      updateUser(updated);
      setNameMessage({ ok: true, text: "Name updated" });
    } catch (err) {
      setNameMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSavingName(false);
    }
  };

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    setPaymentMessage(null);
    setSavingPayment(true);
    try {
      await savePayment(provider, number);
      setPaymentMessage({ ok: true, text: "Payment details saved" });
    } catch (err) {
      setPaymentMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSavingPayment(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!checkPassword(newPassword).valid) {
      setShowRules(true);
      setPasswordMessage({
        ok: false,
        text: "New password does not meet the requirements",
      });
      return;
    }
    if (newPassword !== confirm) {
      setPasswordMessage({ ok: false, text: "Passwords do not match" });
      return;
    }

    setSavingPassword(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setShowRules(false);
      setPasswordMessage({ ok: true, text: "Password updated" });
    } catch (err) {
      setPasswordMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Profile</h1>

      <form
        onSubmit={handleName}
        className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-5 text-neutral-800"
      >
        <h2 className="text-xl font-bold">Account Details</h2>

        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            className={`${field} bg-neutral-100 text-neutral-500`}
            value={user?.email ?? ""}
            disabled
          />
        </label>

        <Notice message={nameMessage} />

        <div>
          <button type="submit" className={btnSmall} disabled={savingName}>
            {savingName ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {isCustomer && (
        <form
          onSubmit={handlePayment}
          className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-5 text-neutral-800"
        >
          <h2 className="text-xl font-bold">Refund Payment Details</h2>
          <p className="text-sm text-neutral-500">
            
          </p>

          <label className="flex flex-col gap-1 text-sm">
            Payment Provider
            <select
              className={field}
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="">Select provider</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Account Number
            <input
              className={field}
              inputMode="numeric"
              placeholder="09XXXXXXXXX"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </label>

          <Notice message={paymentMessage} />

          <div>
            <button type="submit" className={btnSmall} disabled={savingPayment}>
              {savingPayment ? "Saving..." : "Save Payment Details"}
            </button>
          </div>
        </form>
      )}

      <form
        onSubmit={handlePassword}
        className="flex flex-col gap-3 rounded-lg bg-white p-5 text-neutral-800"
      >
        <h2 className="text-xl font-bold">Change Password</h2>

        <label className="flex flex-col gap-1 text-sm">
          Current Password
          <input
            type="password"
            className={field}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          New Password
          <input
            type="password"
            className={field}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={() => setShowRules(true)}
            required
          />
        </label>

        {showRules && <PasswordRules password={newPassword} />}

        <label className="flex flex-col gap-1 text-sm">
          Confirm New Password
          <input
            type="password"
            className={field}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        <Notice message={passwordMessage} />

        <div>
          <button type="submit" className={btnSmall} disabled={savingPassword}>
            {savingPassword ? "Saving..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccountProfilePage;