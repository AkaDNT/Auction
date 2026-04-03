export type NavLink = {
  label: string;
  href: string;
};

export type HeroMetric = {
  value: string;
  label: string;
  description: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  badge: string;
};

export type BenefitItem = {
  title: string;
  description: string;
};

export type StepItem = {
  step: string;
  title: string;
  description: string;
};

export type StatItem = {
  value: string;
  label: string;
  description: string;
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  initials: string;
};

export type LogoItem = {
  name: string;
  accent: string;
};

export type TestimonialItem = {
  name: string;
  role: string;
  quote: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};
