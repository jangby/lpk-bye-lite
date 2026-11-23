import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Hero from '../components/landing/Hero.jsx';
import About from '../components/landing/About.jsx';
import Programs from '../components/landing/Programs.jsx';
import ProblemSolution from '../components/landing/ProblemSolution.jsx';
import Benefits from '../components/landing/Benefits.jsx';
import Gallery from '../components/landing/Gallery.jsx';
import WhyUs from '../components/landing/WhyUs.jsx';
import Steps from '../components/landing/Steps.jsx';
import Testimonials from '../components/landing/Testimonials.jsx';
import Faq from '../components/landing/Faq.jsx';
import CtaBanner from '../components/landing/CtaBanner.jsx';
import Contact from '../components/landing/Contact.jsx';
import ChatWidget from '../components/chat/ChatWidget.jsx';

// Halaman landing: urutan bagian
export default function Landing() {
  const [config, setConfig] = useState(null);

  // Status pendaftaran dimuat ulang tiap 1 menit
  useEffect(() => {
    const load = () => api('/config').then(setConfig).catch(() => {});
    load();
    const timer = setInterval(load, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero config={config} />
      <About />
      <Programs config={config} />
      <ProblemSolution />
      <Benefits />
      <Gallery />
      <WhyUs config={config} />
      <Steps />
      <Testimonials />
      <Faq />
      <CtaBanner config={config} />
      <Contact />
      <Footer />
      <ChatWidget />
    </div>
  );
}
