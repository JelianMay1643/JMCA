import LegalPage, { type LegalSection } from "./legal-page";

const updated = "November 21, 2026";

const terms: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    body: ["By creating an account or placing an order on JMCA, you agree to these Terms and Conditions."],
  },
  {
    heading: "Accounts",
    body: [
      "You must provide accurate information when signing up and keep your password secure.",
      "You are responsible for all activity under your account. We may suspend accounts that violate our rules.",
    ],
  },
  {
    heading: "Products and Pricing",
    body: [
      "We try to display colors, sizes, and prices accurately. Slight color differences may occur because of screen settings.",
      "Prices may change without notice. The price at the time you place your order is the price you pay.",
    ],
  },
  {
    heading: "Orders and Payment",
    body: [
      "An order is confirmed only after payment is received (or accepted for cash on delivery).",
      "We may cancel an order if an item is out of stock or if we suspect fraud. You will be refunded in full.",
    ],
  },
  {
    heading: "Shipping and Delivery",
    body: ["Delivery times are estimates and may be affected by courier delays, weather, or holidays."],
  },
  {
    heading: "Privacy",
    body: ["We only use your personal information to process orders and improve our service. We do not sell your data."],
  },
  {
    heading: "Changes to These Terms",
    body: ["We may update these terms at any time. Continued use of the shop means you accept the changes."],
  },
];


const refund: LegalSection[] = [
  {
    heading: "Order Cancellation",
    body: [
      "You can cancel an order from your account before it is shipped.",
      "A refund can be requested only if the order was cancelled within 10 minutes after it was placed.",
    ],
  },
  {
    heading: "How to Request a Refund",
    body: [
      "Open your cancelled order in your account and submit a refund request.",
      "Make sure your online payment details (GCash, Maya, etc.) in your profile are correct, because the refund is sent there.",
    ],
  },
  {
    heading: "Refund Process",
    body: [
      "Our team reviews each request and may leave a note with the decision.",
      "Approved refunds are sent to the payment account you provided.",
      "Requests may be rejected if the 10-minute window has passed or the details are incomplete.",
    ],
  },
];

const rules: LegalSection[] = [
  {
    heading: "Be Respectful",
    body: ["Harassment, abusive language, or threats toward staff or other customers are not allowed."],
  },
  {
    heading: "Honest Reviews",
    body: ["Reviews must be based on your real purchase. Fake, spam, or offensive reviews will be removed."],
  },
  {
    heading: "Fair Use",
    body: ["Do not abuse refunds or promos. Repeated abuse can lead to account suspension."],
  },
  {
    heading: "Reporting",
    body: ["Use the Report button on a product if something looks wrong. Do not submit false reports."],
  },
  {
    heading: "Support",
    body: ["For any concern, contact our support team first before disputing a payment."],
  },
];

export const TermsPage = () => <LegalPage title="Terms & Conditions" updated={updated} sections={terms} />;
export const RefundPolicyPage = () => <LegalPage title="Refund Policy" updated={updated} sections={refund} />;
export const RulesPage = () => <LegalPage title="Shop Rules" updated={updated} sections={rules} />;