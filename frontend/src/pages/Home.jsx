import React, { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: "AI-Powered Matching",
      desc: "Smart algorithms match students with internships that fit their skills and goals perfectly.",
    },
    {
      title: "Skill-Based Recommendations",
      desc: "Personalized internship suggestions based on your unique skills and academic background.",
    },
    {
      title: "Real-Time Insights",
      desc: "Get live data, industry trends, and salary stats to make better career choices.",
    },
    {
      title: "Career Growth Tracking",
      desc: "Monitor your progress, get insights, and improve your profile visibility over time.",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "₹0",
      color: "bg-gray-700",
      features: [
        "Basic profile creation",
        "5 AI recommendations",
        "Standard resume analysis",
        "Apply to 10 internships",
      ],
    },
    {
      name: "Pro",
      price: "₹999",
      color: "bg-blue-600",
      features: [
        "Unlimited AI matches",
        "Advanced resume optimization",
        "Unlimited applications",
        "Career insights dashboard",
      ],
    },
    {
      name: "Go",
      price: "₹2499",
      color: "bg-purple-600",
      features: [
        "Everything in Pro",
        "Personal career coach",
        "Mock interviews",
        "Guaranteed interview calls",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-blue-600">
            Intern<span className="text-gray-800">Vision</span>
          </h1>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#plans" className="hover:text-blue-600">Pricing</a>
            <a href="#contact" className="hover:text-blue-600">Contact</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex gap-3">
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Login
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3">
            <a href="#features" className="block hover:text-blue-600">Features</a>
            <a href="#plans" className="block hover:text-blue-600">Pricing</a>
            <a href="#contact" className="block hover:text-blue-600">Contact</a>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Login
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
        {/* Text Section */}
        <div className="text-center lg:text-left max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
            Find Your Perfect{" "}
            <span className="text-blue-600">Internship</span> with AI
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Discover internships that align with your passion and skills — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started →
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:bg-blue-50">
              Learn More
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex justify-center lg:justify-end">
          <img
            src="https://img.freepik.com/free-vector/ai-technology-internship-concept-illustration_114360-19780.jpg?w=1080"
            alt="InternVision"
            className="rounded-2xl shadow-xl w-full max-w-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose <span className="text-blue-600">InternVision</span>?
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">✨</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {f.title}
                </h4>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="py-20 bg-gradient-to-t from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-12">
            Choose Your <span className="text-blue-600">Plan</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition p-8 flex flex-col"
              >
                <div
                  className={`w-14 h-14 mx-auto ${plan.color} text-white rounded-full flex items-center justify-center text-xl mb-4`}
                >
                  💎
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h4>
                <p className="text-4xl font-extrabold text-blue-600 mb-6">
                  {plan.price}
                </p>
                <ul className="text-gray-600 text-sm mb-6 space-y-2 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j}>✅ {f}</li>
                  ))}
                </ul>
                <button
                  className={`px-5 py-3 ${plan.color} text-white rounded-lg hover:opacity-90`}
                >
                  Get {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-10 px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white text-lg mb-3">InternVision</h4>
            <p className="text-sm text-gray-400">
              AI-powered internship matching platform helping students connect with companies.
            </p>
          </div>
          <div>
            <h4 className="text-white text-lg mb-3">Quick Links</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#plans" className="hover:text-white">Pricing</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-lg mb-3">Contact</h4>
            <p className="text-sm">📧 support@internvision.com</p>
            <p className="text-sm">📍 Ahmedabad, India</p>
          </div>
          <div>
            <h4 className="text-white text-lg mb-3">Social</h4>
            <div className="flex gap-3 text-2xl">
              <span className="hover:text-white cursor-pointer">🌐</span>
              <span className="hover:text-white cursor-pointer">🐦</span>
              <span className="hover:text-white cursor-pointer">💼</span>
              <span className="hover:text-white cursor-pointer">📸</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
          © 2025 InternVision. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
