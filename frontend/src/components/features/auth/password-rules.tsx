import { Check } from "lucide-react";
import { checkPassword } from "../../../lib/password";

function Rule({ ok, text, indent }: { ok: boolean; text: string; indent?: boolean }) {
  return (
    <li
      className={`flex items-center gap-2 ${indent ? "ml-5" : ""} ${
        ok ? "text-green-700" : "text-neutral-500"
      }`}
    >
      {ok ? <Check size={14} /> : <span className="w-3.5 text-center">•</span>}
      {text}
    </li>
  );
}

function PasswordRules({ password }: { password: string }) {
  const c = checkPassword(password);

  return (
    <div className="rounded-md border border-neutral-300 bg-white p-4 text-sm text-neutral-700">
      <p className="mb-2">Your password must contain:</p>
      <ul className="flex flex-col gap-1.5">
        <Rule ok={c.longEnough} text="At least 8 characters" />
        <Rule ok={c.typesMet >= 3} text="At least 3 of the following:" />
        <Rule ok={c.lower} text="Lower case letters (a-z)" indent />
        <Rule ok={c.upper} text="Upper case letters (A-Z)" indent />
        <Rule ok={c.number} text="Numbers (0-9)" indent />
        <Rule ok={c.special} text="Special characters (e.g. !@#$%^&*)" indent />
      </ul>
    </div>
  );
}

export default PasswordRules;