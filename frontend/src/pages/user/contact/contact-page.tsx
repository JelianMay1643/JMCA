import { useState, type FormEvent } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { btnSmall } from "../../../lib/styles";

const input =
  "border-b-2 border-[#c07bb0] bg-transparent py-2 text-base text-white outline-none placeholder:text-blush";

function ContactPage() {
  const [sent, setSent] = useState(false);


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    setSent(true);
  };

  return (
    <main className="min-h-[70vh] bg-[#d47dbf] px-4 py-10 text-white">
      <h1 className="mb-4 text-center text-3xl font-bold">Contact Us</h1>
      <p className="text-center">
        Have a question? Send us a message and we will reply.
      </p>

      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-start gap-6">
        <div className="w-full rounded-lg bg-magenta p-5 md:w-64 md:flex-none">
          <p className="mb-3 flex items-center gap-2">
            <MapPin size={16} /> Cebu City, Philippines 6000
          </p>
          <p className="mb-3 flex items-center gap-2">
            <Phone size={16} /> +63 985 232 0409
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} /> Jmcabeauty@gmail.com
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-w-[280px] flex-1 flex-col gap-3 rounded-lg bg-magenta p-5"
        >
          <input type="text" placeholder="Your Name" required className={input} />
          <input type="email" placeholder="Email" required className={input} />
          <input type="tel" placeholder="Phone Number" className={input} />
          <textarea
            placeholder="Message"
            required
            className={`${input} h-28 bg-[#c985b8] px-2`}
          />
          <button type="submit" className={btnSmall}>
            Send Message
          </button>
          {sent && <p>Thank you! Your message was sent.</p>}
        </form>
      </div>
    </main>
  );
}

export default ContactPage;