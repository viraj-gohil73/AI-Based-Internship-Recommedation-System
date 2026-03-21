import React, { useState } from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  GraduationCap,
  Laptop2,
  Layers3,
  Menu,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  X,
} from "lucide-react";

const Motion = m;
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Modules", href: "#projects" },
  { label: "Plans", href: "#plans" },
  { label: "Contact", href: "#contact" },
];

const highlights = [
  {
    title: "Project-first profiles",
    desc: "Students highlight outcomes, stack, and proof links - not just keywords.",
    icon: Laptop2,
  },
  {
    title: "Company-ready listings",
    desc: "Post clear roles with timeline, stipend, and expectations in minutes.",
    icon: Building2,
  },
  {
    title: "Smart shortlisting",
    desc: "Recruiters quickly compare signal-rich profiles and prioritize faster.",
    icon: UserRoundSearch,
  },
  {
    title: "Transparent tracking",
    desc: "Both sides see real status updates with fewer follow-up messages.",
    icon: BellRing,
  },
];

const modules = [
  {
    title: "Portfolio Projects",
    desc: "Upload demo, repository, stack, and measurable impact per project.",
    tags: ["Showcase", "Proof", "Impact"],
    icon: Layers3,
  },
  {
    title: "Internship Pipeline",
    desc: "Publish openings, review applicants, and move through stages quickly.",
    tags: ["Applicants", "Stages", "Tracking"],
    icon: BriefcaseBusiness,
  },
  {
    title: "Verification + Admin",
    desc: "Approval and audit workflows keep listings trusted and compliant.",
    tags: ["Approvals", "Audit", "Trust"],
    icon: ShieldCheck,
  },
  {
    title: "Notifications",
    desc: "Instant alerts for approvals, applications, and shortlist activity.",
    tags: ["Realtime", "Inbox", "Read states"],
    icon: BellRing,
  },
  {
    title: "Role-safe Auth",
    desc: "OTP onboarding and role-aware access protect every user journey.",
    tags: ["OTP", "Access", "Security"],
    icon: FileCheck2,
  },
  {
    title: "Performance Insights",
    desc: "Track profile views, response rates, and hiring conversion trends.",
    tags: ["Analytics", "Reports", "Decisions"],
    icon: BarChart3,
  },
];

const steps = [
  {
    title: "Create account",
    desc: "Students add projects and skills. Companies set role needs and filters.",
    icon: GraduationCap,
  },
  {
    title: "Publish or apply",
    desc: "Companies post internships. Students discover and apply with clarity.",
    icon: Rocket,
  },
  {
    title: "Review and hire",
    desc: "Shortlist confidently with transparent communication and timelines.",
    icon: BadgeCheck,
  },
];

const metrics = [
  { label: "Student profiles", value: "12,000+" },
  { label: "Open internships", value: "1,400+" },
  { label: "Applications", value: "48,000+" },
  { label: "Hires completed", value: "2,300+" },
];

const plans = [
  {
    name: "Starter",
    price: "INR 0",
    icon: Sparkles,
    perks: ["Project profile builder", "5 AI suggestions", "Resume score summary", "Up to 10 applications"],
  },
  {
    name: "Pro",
    price: "INR 999",
    featured: true,
    icon: CircleDollarSign,
    perks: ["Unlimited AI matches", "Resume rewriting", "Interview prep kits", "Unlimited applications"],
  },
  {
    name: "Edge",
    price: "INR 2499",
    icon: Rocket,
    perks: ["Everything in Pro", "Mentor office hours", "Mock interviews", "Priority referrals"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

function SectionHead({ tag, title, desc }) {
  return (
    <Motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center lg:text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{tag}</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-4 text-base text-slate-600 sm:text-lg">{desc}</p>}
    </Motion.div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef7ff] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(125,211,252,0.32),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(74,222,128,0.22),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.16),transparent_34%)]" />

      <header className="sticky top-0 z-50 border-b border-cyan-100/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              A
            </span>
            <span>
              AIntern<span className="text-cyan-600">Match</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-cyan-700">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/choose-login"
              className="rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              Log in
            </Link>
            <Link
              to="/choose-register"
              className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-300/40 transition hover:-translate-y-0.5 hover:from-cyan-700 hover:to-blue-700"
            >
              Start free
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-white text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-cyan-100 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <Link
                to="/choose-register"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-white"
              >
                Start free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative px-6 pb-24 pt-16 sm:pt-24">
          <Motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div>
              <Motion.p variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                <Sparkles size={14} /> modern hiring ecosystem
              </Motion.p>
              <Motion.h1 variants={fadeUp} className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Build your project brand.
                <span className="mt-1 block bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                  Get hired with proof.
                </span>
              </Motion.h1>
              <Motion.p variants={fadeUp} className="mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
                AInternMatch connects student project portfolios with internship teams that hire on real signal, clear communication, and transparent progress.
              </Motion.p>

              <Motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register-student"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-400/30 transition hover:-translate-y-0.5"
                >
                  Create student profile <ChevronRight size={17} />
                </Link>
                <Link
                  to="/auth/company/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                >
                  Post internship <BriefcaseBusiness size={16} />
                </Link>
              </Motion.div>

              <Motion.div variants={fadeUp} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                  </div>
                ))}
              </Motion.div>
            </div>

            <Motion.div variants={fadeUp} className="relative mx-auto w-full max-w-lg">
              <Motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_16px_60px_-18px_rgba(2,132,199,0.35)]"
              >
                <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-slate-900">Full Stack Intern</p>
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white">Open</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">SaaS Studio â€¢ Remote â€¢ 8 weeks</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required stack</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">React, Node, MongoDB</p>
                    </div>
                    <div className="rounded-xl border border-white bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shortlist score</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">92 / 100</p>
                    </div>
                  </div>

                  <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    View details <ArrowRight size={16} />
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-cyan-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Pro tip</p>
                  <p className="mt-1 text-sm text-slate-600">Add measurable outcomes to 2 projects to improve recruiter trust quickly.</p>
                </div>
              </Motion.div>
            </Motion.div>
          </Motion.div>
        </section>

        <Motion.section
          id="features"
          className="px-6 py-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-7xl">
            <SectionHead
              tag="Why AInternMatch"
              title="Everything needed to connect talent and teams"
              desc="A clean, conversion-focused flow for students, recruiters, and companies."
            />

            <Motion.div variants={stagger} className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <Motion.article
                    variants={fadeUp}
                    key={item.title}
                    className="group rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-300/40">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  </Motion.article>
                );
              })}
            </Motion.div>
          </div>
        </Motion.section>

        <Motion.section
          id="workflow"
          className="bg-white/70 px-6 py-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHead
              tag="How It Works"
              title="Three simple steps from profile to offer"
              desc="Shared workflow for students and companies with less friction and more visibility."
            />

            <Motion.div variants={stagger} className="grid gap-5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Motion.article
                    variants={fadeUp}
                    key={step.title}
                    className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Step 0{index + 1}</p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{step.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
                      </div>
                    </div>
                  </Motion.article>
                );
              })}
            </Motion.div>
          </div>
        </Motion.section>

        <Motion.section
          id="projects"
          className="px-6 py-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-7xl">
            <SectionHead
              tag="Platform Modules"
              title="Built around real output, not resume noise"
              desc="From project quality to role quality, each module improves matching confidence."
            />

            <Motion.div variants={stagger} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((item) => {
                const Icon = item.icon;
                return (
                  <Motion.article
                    variants={fadeUp}
                    key={item.title}
                    className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        <Icon size={20} />
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                  </Motion.article>
                );
              })}
            </Motion.div>
          </div>
        </Motion.section>

        <Motion.section
          id="plans"
          className="bg-white/70 px-6 py-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="mx-auto max-w-7xl">
            <SectionHead
              tag="Plans"
              title="Flexible pricing for students and teams"
              desc="Start free, upgrade when you need advanced tools and faster outcomes."
            />

            <Motion.div variants={stagger} className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Motion.article
                    variants={fadeUp}
                    key={plan.name}
                    className={`rounded-3xl border p-7 shadow-sm transition ${
                      plan.featured
                        ? "border-cyan-300 bg-gradient-to-b from-cyan-50 to-white shadow-cyan-200/60"
                        : "border-cyan-100 bg-white"
                    }`}
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{plan.price}</p>
                    <div className="mt-5 space-y-3">
                      {plan.perks.map((perk) => (
                        <p key={perk} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                          {perk}
                        </p>
                      ))}
                    </div>
                    <button
                      className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        plan.featured
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-300/40"
                          : "border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50"
                      }`}
                    >
                      Choose {plan.name}
                    </button>
                  </Motion.article>
                );
              })}
            </Motion.div>
          </div>
        </Motion.section>

        <Motion.section
          className="px-6 pb-14 pt-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <Motion.div
            variants={fadeUp}
            className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-[2rem] border border-cyan-100 bg-gradient-to-r from-cyan-600 to-blue-700 px-8 py-14 text-center text-white shadow-[0_20px_60px_-24px_rgba(2,132,199,0.8)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">Launch your next opportunity</p>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Ready to convert projects into internship offers?</h2>
            <p className="max-w-2xl text-cyan-100">Build your profile, publish your openings, and start meaningful student-company connections today.</p>
            <Link
              to="/choose-register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
            >
              Create account <ArrowRight size={16} />
            </Link>
          </Motion.div>
        </Motion.section>
      </main>

      <footer id="contact" className="border-t border-cyan-100 bg-white/80 px-6 py-12 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">AInternMatch</h3>
            <p className="mt-3 text-sm text-slate-600">A modern internship platform where project quality meets hiring clarity.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Explore</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {navLinks.slice(0, 4).map((item) => (
                <p key={item.href}>
                  <a href={item.href} className="hover:text-cyan-700">
                    {item.label}
                  </a>
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">For users</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2">
                <GraduationCap size={14} className="text-cyan-700" /> Students
              </p>
              <p className="inline-flex items-center gap-2">
                <Building2 size={14} className="text-cyan-700" /> Companies
              </p>
              <p className="inline-flex items-center gap-2">
                <BriefcaseBusiness size={14} className="text-cyan-700" /> Recruiters
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Contact</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>support@ainternmatch.ai</p>
              <p>Ahmedabad, India</p>
              <p className="inline-flex items-center gap-2 text-cyan-700">
                <BadgeCheck size={14} /> Verified company onboarding
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-cyan-100 pt-6 text-center text-xs text-slate-500">
          2026 AInternMatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

