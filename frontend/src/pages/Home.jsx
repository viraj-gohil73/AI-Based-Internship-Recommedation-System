import React, { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const highlights = [
    {
      title: "Student-first profiles",
      desc: "Show skills, projects, and achievements clearly so companies understand you fast.",
    },
    {
      title: "Company-ready listings",
      desc: "Post internships with role details, requirements, and timelines in minutes.",
    },
    {
      title: "Simple applications",
      desc: "Apply with clean, focused profiles that are easy to review.",
    },
    {
      title: "Transparent updates",
      desc: "Track applications and responses without any hidden steps.",
    },
  ];

  const steps = [
    {
      title: "Create your account",
      desc: "Students add skills and projects. Companies add team and role info.",
    },
    {
      title: "Publish or apply",
      desc: "Companies post openings. Students browse and apply in a few clicks.",
    },
    {
      title: "Connect and hire",
      desc: "Shortlist, interview, and finalize all in one place.",
    },
  ];

  const metrics = [
    { label: "Student profiles", value: "12,000+" },
    { label: "Open roles", value: "1,400+" },
    { label: "Applications sent", value: "48,000+" },
    { label: "Hires completed", value: "2,300+" },
  ];

  const plans = [
    {
      name: "Starter",
      price: "INR 0",
      perks: [
        "Profile builder",
        "5 AI recommendations",
        "Resume score summary",
        "Up to 10 applications",
      ],
    },
    {
      name: "Pro",
      price: "INR 999",
      perks: [
        "Unlimited AI matches",
        "Resume rewriting",
        "Interview prep kits",
        "Unlimited applications",
      ],
    },
    {
      name: "Edge",
      price: "INR 2499",
      perks: [
        "Everything in Pro",
        "Mentor office hours",
        "Mock interviews",
        "Priority referrals",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-700">
            AIntern
            <span className="text-indigo-700">Match</span>
          </h1>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <a href="#features" className="transition hover:text-blue-700">Features</a>
            <a href="#workflow" className="transition hover:text-blue-700">Workflow</a>
            <a href="#plans" className="transition hover:text-blue-700">Plans</a>
            <a href="#contact" className="transition hover:text-blue-700">Contact</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              Log in
            </button>
            <button className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700">
              Start free
            </button>
          </div>

          <button
            className="text-2xl text-slate-700 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? "X" : "="}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-blue-100 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
              <a href="#features" className="hover:text-blue-700">Features</a>
              <a href="#workflow" className="hover:text-blue-700">Workflow</a>
              <a href="#plans" className="hover:text-blue-700">Plans</a>
              <a href="#contact" className="hover:text-blue-700">Contact</a>
              <button className="mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Start free
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="relative pt-32">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute right-10 top-28 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              One home for students and companies
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Build profiles, post roles, and connect for internships.
            </h2>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              AInternMatch is a simple internship platform that helps students apply and companies hire without the noise.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700">
                Create a student profile
              </button>
              <button className="rounded-lg border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                Post an internship
              </button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xl font-semibold text-slate-900">{metric.value}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-xl">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900">Internship Listing</span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Open</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Product Design Intern, FinTech Studio
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="font-semibold text-slate-700">Requirements</p>
                    <p className="text-slate-500">Figma, UX basics</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="font-semibold text-slate-700">Location</p>
                    <p className="text-slate-500">Remote, 3 months</p>
                  </div>
                </div>
                <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white">
                  View details
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Tip</p>
                <p className="mt-2">
                  Add two project links to increase profile credibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Why AInternMatch
            </p>
            <h3 className="mt-4 text-3xl font-bold text-slate-900">
              One place for students and companies.
            </h3>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm"
              >
                <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600" />
                <h4 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                How it works
              </p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">
                Three steps for both students and companies.
              </h3>
              <p className="mt-4 text-slate-600">
                Simple flows that help students apply and companies hire without friction.
              </p>
              <div className="mt-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">Live preview</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>Students publish a clean profile with projects and skills.</p>
                  <p>Companies post internships with clear expectations.</p>
                  <p>Everyone tracks applications and responses easily.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-blue-600">Step 0{index + 1}</p>
                  <h4 className="mt-2 text-xl font-semibold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                Built for collaboration
              </p>
              <h3 className="mt-4 text-3xl font-bold text-slate-900">
                Clear details that make hiring faster.
              </h3>
              <p className="mt-4 text-slate-600">
                Students show real work. Companies highlight expectations. Everyone moves faster.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                  <p className="text-lg font-semibold text-slate-900">Student portfolios</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Share projects, GitHub links, and certificates in one place.
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                  <p className="text-lg font-semibold text-slate-900">Company pages</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Show team, culture, and growth so students apply with clarity.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Student story</p>
              <h4 className="mt-4 text-2xl font-semibold text-slate-900">
                "The platform made it easy to apply and follow up."
              </h4>
              <p className="mt-4 text-slate-600">
                I added my projects, applied to three roles, and got a reply within a week.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Rhea Patel</p>
                  <p className="text-xs text-slate-500">Data Science Intern, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Plans</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            Simple plans for students and companies.
          </h3>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-3xl border border-blue-100 bg-white p-8 text-left shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600" />
                <h4 className="mt-4 text-2xl font-semibold text-slate-900">
                  {plan.name}
                </h4>
                <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price}</p>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  {plan.perks.map((perk) => (
                    <p key={perk}>{perk}</p>
                  ))}
                </div>
                <button className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700">
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-12 text-center">
          <h3 className="text-3xl font-bold text-slate-900">
            Ready to get started?
          </h3>
          <p className="max-w-2xl text-slate-600">
            Create a profile, post a role, and start connecting today.
          </p>
          <button className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700">
            Create an account
          </button>
        </div>
      </section>

      <footer id="contact" className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">AInternMatch</h4>
            <p className="mt-3 text-sm text-slate-600">
              A simple internship platform for students and companies.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Explore</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p><a href="#features" className="hover:text-blue-700">Features</a></p>
              <p><a href="#workflow" className="hover:text-blue-700">Workflow</a></p>
              <p><a href="#plans" className="hover:text-blue-700">Plans</a></p>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Contact</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>support@ainternmatch.ai</p>
              <p>Ahmedabad, India</p>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Community</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Student success stories</p>
              <p>Mentor network</p>
              <p>Company partners</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-blue-100 px-6 pt-6 text-center text-xs text-slate-500">
          2026 AInternMatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
