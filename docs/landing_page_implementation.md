# MechMind AI - Ultra-Premium Landing Page Implementation

## Step-by-Step React Component Guide

---

## Installation & Setup

```bash
# Install additional dependencies for landing page
npm install framer-motion react-scroll lottie-react react-typed gsap three three/examples

# Optional but recommended for animations
npm install tailwindcss-animate
```

---

## Component 1: Landing Navigation Bar

**File: `src/components/landing/Navigation.tsx`**

```typescript
import React from 'react';
import { Menu, X } from 'lucide-react';
import { useScroll } from 'framer-motion';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md shadow-lg'
          : 'bg-gradient-to-r from-slate-900 to-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg 
                         flex items-center justify-center text-white font-bold text-lg
                         group-hover:shadow-lg group-hover:shadow-teal-500/50 
                         transition-all duration-300 animate-pulse">
            ⚙️
          </div>
          <span className="text-xl font-bold text-white">MechMind AI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Use Cases', 'Pricing', 'Docs', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-300 hover:text-teal-400 transition-colors duration-300
                       text-sm font-medium relative group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-400 
                             group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="px-6 py-2 border-2 border-teal-400 text-teal-400 rounded-lg
                           hover:bg-teal-400/10 transition-all duration-300 font-medium">
            Start Free Trial
          </button>
          <button className="px-6 py-2 bg-teal-500 text-white rounded-lg
                           hover:bg-teal-600 transition-all duration-300 font-medium
                           shadow-lg hover:shadow-teal-500/50">
            Login
          </button>
        </div>

        {/* Mobile Menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-teal-500/20 p-4 space-y-4">
          {['Features', 'Use Cases', 'Pricing', 'Docs'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block text-gray-300 hover:text-teal-400 py-2"
            >
              {item}
            </a>
          ))}
          <div className="pt-4 border-t border-teal-500/20 space-y-2">
            <button className="w-full px-6 py-2 border-2 border-teal-400 text-teal-400 rounded-lg">
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
```

---

## Component 2: Hero Section with Animations

**File: `src/components/landing/HeroSection.tsx`**

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
                       pt-20 px-6 relative overflow-hidden flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Particle animation */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-400 rounded-full"
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-teal-500 rounded-full
                    mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full
                    mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-bold text-white leading-tight"
            >
              Transform Industrial Diagnostics with{' '}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 
                             bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 leading-relaxed max-w-xl"
            >
              MechMind AI combines advanced language models with industrial expertise to diagnose
              equipment failures in seconds, not hours. Upload technical manuals once. Get instant,
              citation-backed answers forever.
            </motion.p>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 pt-8">
              {[
                { stat: '47,000+', label: 'Equipment Analyzed' },
                { stat: '94.8%', label: 'Accuracy Rate' },
                { stat: '2.3s', label: 'Avg Response' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-teal-400">{item.stat}</div>
                  <div className="text-sm text-gray-400 mt-2">{item.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-8">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 137, 123, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500
                         text-white font-bold rounded-lg shadow-lg
                         hover:shadow-xl transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-teal-400 text-teal-400
                         font-bold rounded-lg hover:bg-teal-400/10 transition-all duration-300
                         flex items-center gap-2"
              >
                Watch Demo <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right column - Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6
                       border border-teal-500/20 shadow-2xl shadow-teal-500/20"
            >
              {/* Fake dashboard */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold text-teal-400">⚙️ MechMind AI</div>
                  <div className="text-xs text-gray-400">READY</div>
                </div>
                <div className="bg-slate-700/50 rounded p-4 space-y-2">
                  <div className="text-sm text-white">Analyzing pump cavitation issue...</div>
                  <div className="bg-slate-600 rounded h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['NPSH Analysis', 'Flow Rate', 'Pressure Drop', 'Temperature'].map((label) => (
                    <div key={label} className="bg-slate-700/30 rounded p-3">
                      <div className="text-xs text-gray-400 mb-2">{label}</div>
                      <div className="text-lg font-bold text-teal-400">78%</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
```

---

## Component 3: Features Showcase

**File: `src/components/landing/FeaturesSection.tsx`**

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Database } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Diagnostics',
    description: 'AI-powered analysis of complex equipment failures in seconds',
  },
  {
    icon: Brain,
    title: 'Knowledge Integration',
    description: 'Leverages decades of technical manuals and maintenance logs',
  },
  {
    icon: Database,
    title: 'Real-time Context',
    description: 'Dynamic retrieval and citation from your entire document library',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features for Modern Industry
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need for intelligent equipment troubleshooting
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group p-8 rounded-xl bg-slate-800/50 border border-teal-500/20
                         hover:border-teal-500/60 transition-all duration-300
                         hover:shadow-lg hover:shadow-teal-500/20"
              >
                <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-teal-500/20
                              to-cyan-500/20 rounded-lg group-hover:from-teal-500/40
                              group-hover:to-cyan-500/40 transition-all duration-300">
                  <Icon size={32} className="text-teal-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
```

---

## Component 4: Testimonial Section

**File: `src/components/landing/Testimonial.tsx`**

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export const TestimonialSection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="p-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900
                   border-l-4 border-teal-500 shadow-xl"
        >
          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          {/* Quote */}
          <p className="text-2xl text-white font-light leading-relaxed mb-8 italic">
            "MechMind AI reduced our troubleshooting time from 6 hours to 12 minutes. The
            citation-backed answers give us confidence in every diagnostic decision."
          </p>

          {/* Attribution */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400
                          flex items-center justify-center text-white font-bold">
              JC
            </div>
            <div>
              <p className="font-bold text-white">Dr. James Chen</p>
              <p className="text-sm text-gray-400">Chief Maintenance Engineer, FlowServe Corp</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
```

---

## Component 5: Pricing Section

**File: `src/components/landing/PricingSection.tsx`**

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$99',
    description: 'For small teams',
    features: ['Up to 500 documents', 'Basic chat interface', '5 concurrent sessions', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$299',
    description: 'For growing operations',
    features: [
      'Unlimited documents',
      'Advanced search',
      '50 concurrent sessions',
      'Knowledge graph',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large deployments',
    features: [
      'Unlimited everything',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantees',
      'On-premise option',
    ],
    highlighted: false,
  },
];

export const PricingSection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Flexible Plans for Every Scale</h2>
          <p className="text-gray-400 text-lg">From startups to enterprise operations</p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className={`p-8 rounded-xl transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500 shadow-xl shadow-teal-500/30 scale-100'
                  : 'bg-slate-800/50 border border-slate-700 hover:border-teal-500/60'
              }`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block px-3 py-1 bg-teal-500 text-white text-xs
                              font-bold rounded-full">
                  POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-gray-400">/month</span>}
              </div>

              <button
                className={`w-full py-3 px-6 rounded-lg font-bold mb-8 transition-all
                          duration-300 ${
                            plan.highlighted
                              ? 'bg-teal-500 text-white hover:bg-teal-600'
                              : 'border border-teal-500 text-teal-400 hover:bg-teal-500/10'
                          }`}
              >
                Start Free Trial
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-teal-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## Component 6: CTA Footer & Main Footer

**File: `src/components/landing/CTAFooter.tsx`**

```typescript
import React from 'react';
import { motion } from 'framer-motion';

export const CTAFooter: React.FC = () => {
  return (
    <>
      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white"
          >
            Ready to Transform Your Maintenance Operations?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-white/90"
          >
            Join hundreds of companies reducing downtime with MechMind AI
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-white text-teal-600 font-bold rounded-lg
                     hover:shadow-lg transition-all duration-300"
          >
            Start Your Free Trial Today
          </motion.button>

          <p className="text-sm text-white/80">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-white">MechMind AI</span>
            </div>
            <p className="text-sm text-gray-400">
              Transforming industrial maintenance with AI intelligence
            </p>
          </div>

          {/* Columns 2-4 */}
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Security', 'Roadmap'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers', 'Contact'],
            },
            {
              title: 'Legal',
              links: ['Privacy', 'Terms', 'Compliance', 'Cookies'],
            },
          ].map((group, i) => (
            <div key={i}>
              <h4 className="font-bold text-white mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between
                      items-center text-sm text-gray-400">
          <p>&copy; 2024 MechMind AI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {['GitHub', 'LinkedIn', 'Twitter'].map((social) => (
              <a key={social} href="#" className="hover:text-teal-400 transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
};
```

---

## Main Landing Page Component

**File: `src/pages/LandingPage.tsx`**

```typescript
import React from 'react';
import { Navigation } from '../components/landing/Navigation';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { TestimonialSection } from '../components/landing/Testimonial';
import { PricingSection } from '../components/landing/PricingSection';
import { CTAFooter } from '../components/landing/CTAFooter';

export default function LandingPage() {
  return (
    <div className="bg-slate-900 min-h-screen overflow-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TestimonialSection />
      <PricingSection />
      <CTAFooter />
    </div>
  );
}
```

---

## Update App.tsx for Landing Page

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import SearchPage from './pages/SearchPage';
import GraphPage from './pages/GraphPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <Router>
      <Routes>
        {/* Landing page - public */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard pages - protected */}
        {isLoggedIn ? (
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Header />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/graph" element={<GraphPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Navigate to="/" />
        )}
      </Routes>
    </Router>
  );
}

export default App;
```

---

## Tailwind CSS Configuration Update

**Update `tailwind.config.js`:**

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3e5f5',
          500: '#1a237e',
          600: '#1565c0',
          700: '#0d47a1',
        },
        secondary: {
          500: '#00897b',
          600: '#00695c',
        },
        accent: {
          500: '#ff6f00',
          600: '#e65100',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 137, 123, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 137, 123, 0.8)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

---

## Performance Optimizations

```typescript
// Add Suspense and lazy loading
import { Suspense, lazy } from 'react';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

// Loading fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Use in App.tsx
<Suspense fallback={<LoadingSpinner />}>
  <LandingPage />
</Suspense>
```

---

## Animation Libraries Integration

All animations use **Framer Motion** which is already installed. Additional enhancements:

1. **Page Transitions**: Animate route changes
2. **Scroll Animations**: Trigger animations on scroll
3. **Gesture Controls**: Desktop drag, mobile swipe
4. **Performance**: Use `will-change` CSS for animated elements

---

## Testing Landing Page

```bash
# Start dev server
npm run dev

# Visit http://localhost:5173
# All animations should be smooth
# Mobile responsive should work on all devices
# Dark theme should apply correctly
```

---

## Production Checklist

- ✅ Compress images
- ✅ Code splitting
- ✅ Lazy load components
- ✅ Optimize animations
- ✅ Add SEO meta tags
- ✅ Minify CSS/JS
- ✅ Test on mobile
- ✅ Test animation performance
- ✅ Lighthouse audit
- ✅ Accessibility check

