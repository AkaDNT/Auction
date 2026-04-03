import type {
  BenefitItem,
  FeatureItem,
  HeroMetric,
  LogoItem,
  NavLink,
  PricingPlan,
  StatItem,
  StepItem,
  TeamMember,
  TestimonialItem,
} from "../types/home";

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#footer" },
];

export const heroMetrics: HeroMetric[] = [
  {
    value: "2.4K",
    label: "Active auctions",
    description: "Live inventory across premium and fast-moving categories.",
  },
  {
    value: "97%",
    label: "Sell-through rate",
    description: "Optimized bidding workflows that keep auctions competitive.",
  },
  {
    value: "24/7",
    label: "Marketplace coverage",
    description: "A platform designed for continuous demand and trust.",
  },
];

export const featureItems: FeatureItem[] = [
  {
    title: "Real-time bidding engine",
    description:
      "Pushes live updates instantly so buyers and sellers stay aligned during every auction window.",
    badge: "Live",
  },
  {
    title: "Verified transaction flows",
    description:
      "Structured checks for deposits, approvals, and settlement reduce risk across the platform.",
    badge: "Secure",
  },
  {
    title: "Category orchestration",
    description:
      "Manage diverse inventory, premium lots, and timed releases from a single operating layer.",
    badge: "Scale",
  },
  {
    title: "Seller-first tooling",
    description:
      "Operational dashboards help teams publish lots, monitor bids, and close faster.",
    badge: "Ops",
  },
];

export const benefitItems: BenefitItem[] = [
  {
    title: "Trust built into every step",
    description:
      "Clear verification, bidding history, and transparent lot states make the marketplace feel safe.",
  },
  {
    title: "Designed for speed",
    description:
      "The experience minimizes friction so buyers can bid quickly and sellers can move inventory.",
  },
  {
    title: "Flexible for multiple business models",
    description:
      "Support platform fees, commission-based revenue, premium memberships, and partner programs.",
  },
];

export const stepItems: StepItem[] = [
  {
    step: "01",
    title: "Register and verify",
    description:
      "Users create an account and complete onboarding to enter the ecosystem with confidence.",
  },
  {
    step: "02",
    title: "Explore live lots",
    description:
      "Browse featured auctions, monitor current bids, and shortlist opportunities worth tracking.",
  },
  {
    step: "03",
    title: "Bid or list inventory",
    description:
      "Buyers place bids while sellers publish lots with pricing, timing, and business rules.",
  },
  {
    step: "04",
    title: "Close and settle",
    description:
      "Automated completion steps guide both sides through payment, handoff, and reporting.",
  },
];

export const statItems: StatItem[] = [
  {
    value: "$18.4M",
    label: "Total bid volume",
    description: "Momentum across high-value categories and repeat buyers.",
  },
  {
    value: "12 min",
    label: "Average conversion cycle",
    description: "A tighter funnel from interest to confirmed lot ownership.",
  },
  {
    value: "180+",
    label: "Trusted sellers",
    description: "Curated partners spanning inventory, logistics, and service.",
  },
  {
    value: "4.9/5",
    label: "Buyer satisfaction",
    description:
      "Measured confidence from a clean and reliable marketplace UX.",
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: "Ava Nguyen",
    role: "Marketplace Director",
    bio: "Owns seller acquisition, auction governance, and the operating model behind premium listings.",
    initials: "AN",
  },
  {
    name: "Daniel Park",
    role: "Product Strategy",
    bio: "Shapes the buyer journey, pricing logic, and the systems that keep the platform trustworthy.",
    initials: "DP",
  },
  {
    name: "Sophia Reed",
    role: "Operations Lead",
    bio: "Coordinates fulfillment, compliance workflows, and cross-team execution for every lot.",
    initials: "SR",
  },
];

export const logoItems: LogoItem[] = [
  { name: "Atlas Supply", accent: "A" },
  { name: "Northstone", accent: "N" },
  { name: "Monarch Partners", accent: "M" },
  { name: "Summit Trade", accent: "S" },
];

export const testimonialItems: TestimonialItem[] = [
  {
    name: "Linh Tran",
    role: "Power buyer",
    quote:
      "The bidding flow feels immediate and premium. We can evaluate lots, move fast, and still trust the process.",
  },
  {
    name: "Mark Ellis",
    role: "Enterprise seller",
    quote:
      "The platform gave our team a structured way to list inventory, handle approvals, and close with clarity.",
  },
  {
    name: "Priya Shah",
    role: "Marketplace operator",
    quote:
      "Everything is built for scale. The UI communicates confidence without sacrificing speed or detail.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "Free",
    description: "For new sellers and buyers validating the workflow.",
    features: [
      "Basic lot publishing",
      "Standard bidding access",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$49/mo",
    description:
      "For active teams that need stronger control and better visibility.",
    features: ["Commission tools", "Seller dashboard", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description:
      "For large operations that require governance and integrations.",
    features: [
      "Dedicated onboarding",
      "Advanced permissions",
      "SLA-backed support",
    ],
  },
];
