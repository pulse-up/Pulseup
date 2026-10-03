import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero-students.webp';
import comfortImg from '../assets/comfort-student.webp';
import staffImg from '../assets/staff-team.webp';
import './HomePage.css';

const values = [
  { icon: 'briefcase', title: 'Professional', text: 'Medical practitioners dedicated to the highest standards of clinical excellence.' },
  { icon: 'shield', title: 'Trustworthy', text: 'Building lasting relationships through honesty and reliable health information.' },
  { icon: 'lock', title: 'Confidential', text: 'Your health data is protected by rigorous security and privacy protocols.' },
  { icon: 'eyeoff', title: 'Discreet', text: 'Private consultations designed to make you feel comfortable and respected.' },
  { icon: 'leaf', title: 'Holistic', text: 'Treating the whole person—mind and body—not just the symptoms.' },
  { icon: 'globe', title: 'Culturally Aware', text: 'Responsive care that respects the diverse backgrounds of our community.' },
];

const staffServices = [
  { icon: 'heart', title: 'Reproductive Health', text: 'Access to family planning resources and advice.' },
  { icon: 'activity', title: 'BP Checkups', text: 'Regular blood pressure monitoring and heart health.' },
  { icon: 'shield', title: 'VCT Services', text: 'Private and voluntary counseling and testing.' },
];

const services = [
  { icon: 'stethoscope', title: 'General Consultations', text: 'Daily check-ups and medical advice.' },
  { icon: 'heart', title: 'Reproductive Health', text: 'Contraception and family planning.' },
  { icon: 'flask', title: 'HIV VCT', text: 'Confidential testing and counseling.' },
  { icon: 'pill', title: 'TB-DOTS', text: 'Treatment support and monitoring.' },
  { icon: 'bandage', title: 'Wound Dressings', text: 'Minor injury care and recovery.' },
];

const ICONS = {
  stethoscope: 'M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1M8 15a6 6 0 0 0 12 0v-3M18 10a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  lock: 'M7 11V7a5 5 0 0 1 10 0v4M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z',
  eyeoff: 'M9.9 9.9a3 3 0 1 0 4.2 4.2M10.7 5.1A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13 13 0 0 1-1.7 2.7M6.6 6.6A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6 2.4-.5 4.9-2 5.9-3',
  briefcase: 'M12 11v4M14 13h-4M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M18 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z',
  shield: 'M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4',
  flask: 'M14.5 2v6.5L20 19a2 2 0 0 1-1.8 3H5.8A2 2 0 0 1 4 19l5.5-10.5V2M8.5 2h7M7 16h10',
  pill: 'M10.5 20.5l10-10a5 5 0 1 0-7-7l-10 10a5 5 0 1 0 7 7zM8.5 8.5l7 7',
  bandage: 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM18 6v12M6 6v12M10 10h.01M10 14h.01M14 10h.01M14 14h.01',
  activity: 'M22 12h-2.5a2 2 0 0 0-1.9 1.5l-2.4 8.4a.25.25 0 0 1-.5 0L9.2 2.2a.25.25 0 0 0-.5 0l-2.3 8.4A2 2 0 0 1 4.5 12H2',
  target: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  check: 'M20 6L9 17l-5-5',
  alert: 'M21.7 18l-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3zM12 9v4M12 17h.01',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  close: 'M18 6L6 18M6 6l12 12',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
};

function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const CAMPUS_CLINICS = [
  {
    name: 'Bellville Campus',
    phone: '+27 21 959 6403',
    tel: '+27219596403',
    location: 'New Library Extension, Ground Floor',
    hours: '08:00 - 16:30',
  },
  {
    name: 'Cape Town (District Six) Campus',
    phone: '+27 21 460 3405',
    tel: '+27214603405',
    location: 'Administration Building, Level 2, Room 2.900',
    hours: '08:00 - 16:30',
  },
  {
    name: 'Mowbray Campus',
    phone: '+27 21 680 1555',
    tel: '+27216801555',
    location: 'Administration Building, Ground Floor',
    hours: '08:00 - 16:00',
  },
  {
    name: 'Wellington Campus',
    phone: '+27 21 864 5522',
    tel: '+27218645522',
    location: 'Administration Building, Ground Floor, Room A29',
    hours: '07:30 - 15:30',
  },
];

const TOPICS = ['How PulseUp works', 'Medical emergency', 'Book an appointment', 'HIV/VCT support', 'Reproductive health', 'Ask a nurse'];

function pulsyReply(text) {
  const t = text.toLowerCase();
  const has = (...w) => w.some((x) => t.includes(x));
  if (has('emergency', 'bleed', 'unconscious', 'asthma', 'allerg', 'trauma', 'urgent'))
    return { text: 'If this is life-threatening, do not wait. Call District Six Campus emergency response on 021 460 3999 or go to the nearest emergency facility now.' };
  if (has('how', 'work', 'process', 'step'))
    return {
      text: "Here's how PulseUp works: 1) Choose a service - pick the campus healthcare service you need. 2) Select an available time - choose a clinic slot that works with your schedule. 3) Arrive informed - track your clinician, room, status and digital queue.",
    };
  if (has('book', 'appointment', 'schedule'))
    return { text: 'Booking takes about a minute: create a student account, choose a service, then pick an available time. Staff confirm it and you can follow your queue.', link: { to: '/register', label: 'Create account' } };
  if (has('hiv', 'vct', 'test'))
    return { text: 'HIV VCT is confidential counselling and testing, free for registered students. Sign in to see available times.', link: { to: '/login', label: 'Sign in' } };
  if (has('reproduct', 'contracep', 'family', 'pregnan'))
    return { text: 'Reproductive health covers contraception and family planning in a private consultation. You can book it once you are signed in.', link: { to: '/login', label: 'Sign in' } };
  if (has('nurse', 'advice', 'symptom', 'sick', 'pain'))
    return { text: 'For clinical advice, book a consultation so a nurse or doctor can see you. I can only help with appointments and general information.', link: { to: '/register', label: 'Book a visit' } };
  if (has('free', 'cost', 'price', 'pay'))
    return { text: 'Clinic services are 100% free for registered students.' };
  if (has('queue', 'wait'))
    return { text: 'Once staff confirm your booking, you can see your queue position, clinic room and estimated wait after signing in.', link: { to: '/login', label: 'Sign in' } };
  return { text: "I'm not sure about that one. Pick a topic below, or book a consultation for anything clinical." };
}

function Pulsy() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi, I'm Pulsy, your PulseUp assistant. Are you a student or staff member?", chips: ['Student', 'Staff'] },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open]);

  function say(text) {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m.map((x) => ({ ...x, chips: undefined })), { from: 'me', text: value }]);
    setInput('');
    setTimeout(() => {
      let reply;
      if (value === 'Student') reply = { text: 'Great! What can I help you with?', chips: TOPICS };
      else if (value === 'Staff') reply = { text: 'Staff can sign in to publish availability, review requests and manage the queue.', link: { to: '/login', label: 'Staff sign in' } };
      else reply = { ...pulsyReply(value), chips: TOPICS };
      setMessages((m) => [...m, { from: 'bot', ...reply }]);
    }, 450);
  }

  return (
    <div className="pulsy">
      {open && (
        <section className="pulsy-panel" aria-label="Pulsy assistant">
          <header>
            <span className="pulsy-avatar"><Icon name="activity" size={20} /></span>
            <div><strong>Pulsy</strong><small>PulseUp assistant · Online</small></div>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}><Icon name="close" size={18} /></button>
          </header>
          <div className="pulsy-body">
            {messages.map((m, i) => (
              <div key={i} className={'pulsy-msg pulsy-' + m.from}>
                <p>{m.text}</p>
                {m.link && <Link className="pulsy-link" to={m.link.to}>{m.link.label}</Link>}
                {m.chips && (
                  <div className="pulsy-chips">
                    {m.chips.map((c) => (<button key={c} type="button" onClick={() => say(c)}>{c}</button>))}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); say(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Pulsy..." aria-label="Message Pulsy" />
            <button type="submit" aria-label="Send"><Icon name="send" size={18} /></button>
          </form>
          <small className="pulsy-note">Pulsy helps with appointments. It is not medical advice.</small>
        </section>
      )}
      <button type="button" className="pulsy-fab" aria-label={open ? 'Close Pulsy chat' : 'Chat with Pulsy'} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? 'close' : 'chat'} size={26} />
      </button>
    </div>
  );
}

function HomePage() {
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let animationFrameId = null;

    function updateNavigation() {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      setHeaderScrolled(currentScrollY > 12);

      if (currentScrollY < 40) {
        setHeaderExpanded(false);
      } else if (scrollDifference > 6) {
        setHeaderExpanded(true);
      } else if (scrollDifference < -6) {
        setHeaderExpanded(false);
      }

      lastScrollY = currentScrollY;
      animationFrameId = null;
    }

    function handleScroll() {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateNavigation);
    }

    const revealTargets = document.querySelectorAll(
      [
        '.home-stat-strip',
        '.home-heading',
        '.home-values',
        '.home-purpose',
        '.home-service-grid',
        '.home-service-action',
        '.home-steps',
        '.home-queue-card',
        '.home-emergency-card',
        '.home-contact-cards',
      ].join(','),
    );

    revealTargets.forEach((element) => {
      element.classList.add('home-reveal');
    });

    let revealObserver = null;

    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -50px 0px',
        },
      );

      revealTargets.forEach((element) => {
        revealObserver.observe(element);
      });
    } else {
      revealTargets.forEach((element) => {
        element.classList.add('is-visible');
      });
    }

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      if (revealObserver) {
        revealObserver.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth > 980) {
        setMobileMenuOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener('keydown', handleKeyDown);

      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const headerClassName = [
    'home-header',
    headerScrolled ? 'home-header-scrolled' : '',
    headerExpanded && !mobileMenuOpen ? 'home-header-expanded' : '',
    mobileMenuOpen ? 'home-header-menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const navigationClassName = [
    'home-links',
    mobileMenuOpen ? 'home-links-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const menuButtonClassName = [
    'home-menu-button',
    mobileMenuOpen ? 'home-menu-button-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="home-page">
      <header className={headerClassName}>
        <nav className="home-container home-nav" aria-label="Main navigation">
          <a className="home-logo" href="#home" onClick={closeMobileMenu}>
            PULSE<span>UP</span>
          </a>

          <div id="home-navigation-menu" className={navigationClassName}>
            <a href="#home" onClick={closeMobileMenu}>
              Home
            </a>

            <a href="#about" onClick={closeMobileMenu}>
              About us
            </a>

            <a href="#contact" onClick={closeMobileMenu}>
              Contact
            </a>

            <a href="#services" onClick={closeMobileMenu}>
              Services
            </a>

            <div className="home-mobile-actions">
              <Link
                className="home-button home-button-outline"
                to="/login"
                onClick={closeMobileMenu}
              >
                Student sign in
              </Link>

              <Link
                className="home-button"
                to="/register"
                onClick={closeMobileMenu}
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="home-nav-actions">
            <Link className="home-login-link" to="/login">
              Sign in
            </Link>

            <Link className="home-button home-button-small" to="/register">
              Create account
            </Link>
          </div>

          <button
            className={menuButtonClassName}
            type="button"
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="home-navigation-menu"
            onClick={() => {
              setMobileMenuOpen((currentState) => !currentState);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <main>
        <section className="bmc-hero" id="home">
          <div className="bmc-hero-media">
            <img src={heroImg} alt="A clinician in scrubs and a face shield" />

            <div className="bmc-hero-scrim" />
          </div>

          <div className="home-container bmc-hero-content">
            <h1>
              Award-winning campus care, for everyone.
            </h1>

            <p>
              PulseUp brings CPUT's clinical team to every student and staff
              member on campus, with simple booking, live queues and
              confidential support you can trust.
            </p>

            <div className="bmc-hero-actions">
              <Link className="bmc-button bmc-button-solid" to="/register">
                Book a clinic visit
              </Link>

              <Link className="bmc-button bmc-button-outline" to="/login">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="bmc-intro">
          <div className="home-container bmc-intro-inner">
            <span className="bmc-intro-label">Rewriting campus healthcare</span>

            <h2>Medical excellence and support beyond compare.</h2>

            <p>
              PulseUp gives the CPUT community award-winning clinical care and
              wraparound support, from booking through recovery, so every
              student and staff member can thrive.
            </p>
          </div>
        </section>

        <section className="bmc-feature">
          <div className="home-container bmc-feature-grid">
            <div className="bmc-feature-media">
              <img
                src={comfortImg}
                alt="A student booking a clinic appointment on her phone from her room"
              />
            </div>

            <div className="bmc-feature-copy">
              <span className="bmc-feature-label">Clinic booking</span>

              <h3>Book from the comfort of your room.</h3>

              <p>
                No more waiting in early morning queues outside the clinic.
                Whether you're in your residence or a lecture hall, secure
                your appointment with just a few taps.
              </p>

              <div className="bmc-feature-actions">
                <Link className="bmc-button bmc-button-solid" to="/register">
                  Book an appointment
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bmc-feature bmc-feature-reverse" id="staff">
          <div className="home-container bmc-feature-grid">
            <div className="bmc-feature-copy">
              <span className="bmc-feature-label">Staff &amp; student care</span>

              <h3>Care for everyone on campus, not just students.</h3>

              <p>
                Lecturers, cleaners, security guards and every other campus
                employee can register for their own PulseUp account and use
                the same clinic, booking and queue tools as students.
              </p>

              <ul className="bmc-staff-services" aria-label="Services for staff">
                {staffServices.map((item) => (
                  <li key={item.title}>
                    <span><Icon name={item.icon} size={20} /></span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="bmc-feature-actions">
                <Link className="bmc-button bmc-button-solid" to="/register/staff">
                  Register as university staff
                </Link>
              </div>
            </div>

            <div className="bmc-feature-media">
              <img
                src={staffImg}
                alt="The campus staff team standing together on the steps"
              />
            </div>
          </div>
        </section>

        <section className="home-section home-about" id="about">
          <div className="home-container">
            <div className="home-heading home-heading-centred home-heading-light">
              <h2>About Us</h2>
              <p>The principles that guide every interaction at PulseUp.</p>
            </div>
            <div className="home-values">
              {values.map((item) => (
                <article key={item.title}>
                  <span className="home-value-icon"><Icon name={item.icon} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-vm">
          <div className="home-container home-purpose">
            <article>
              <span className="home-purpose-number"><Icon name="eye" size={32} /></span>
              <div>
                <h3>Our Vision</h3>
                <p>To be the leading university clinical service in South Africa, recognized for our commitment to student well-being and clinical precision through integrated campus healthcare.</p>
              </div>
            </article>
            <article>
              <span className="home-purpose-number"><Icon name="target" size={32} /></span>
              <div>
                <h3>Our Mission</h3>
                <p>Providing accessible, affordable, and holistic primary health care services that empower the CPUT community to excel in their academic and professional journeys.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="home-section home-services" id="services">
          <div className="home-container">
            <div className="home-services-top">
              <div className="home-heading home-heading-light">
                <h2>Services for Students</h2>
                <p>Comprehensive health support tailored for the academic lifestyle.</p>
              </div>
              <div className="home-free"><strong>100% Free</strong><span>For registered students</span></div>
            </div>
            <div className="home-service-grid">
              {services.map((service) => (
                <article key={service.title}>
                  <span className="home-service-icon"><Icon name={service.icon} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-help" id="contact">
          <div className="home-container">
            <div className="home-help-card">
              <div className="home-help-emergency">
                <div className="home-help-copy">
                  <span className="home-help-eyebrow">
                    <Icon name="alert" size={16} />
                    Critical emergencies
                  </span>

                  <h2>No appointment needed in an emergency.</h2>

                  <p>
                    Visit us immediately or call the emergency line if you or
                    someone else has:
                  </p>

                  <ul className="home-emergency-pills">
                    <li>Severe Bleeding</li>
                    <li>Unconscious</li>
                    <li>Severe Asthma</li>
                    <li>Allergic Reaction</li>
                    <li>Difficulty Moving / Trauma</li>
                  </ul>
                </div>

                <div className="home-call-card">
                  <h3>Emergency Response</h3>
                  <p>24/7 Dispatch and On-Campus Medical Support</p>
                  <a className="num" href="tel:+27214603999">021 460 3999</a>
                  <small>District Six Campus</small>
                  <a className="home-button" href="tel:+27214603999">
                    <Icon name="phone" size={18} />
                    Call Immediately
                  </a>
                </div>
              </div>

              <div className="home-help-contact">
                <div className="home-help-contact-head">
                  <span>Contact us</span>
                  <h2>Reach a campus clinic directly.</h2>
                  <p>
                    Campus Health Clinics run at four CPUT campuses. Call ahead
                    to check availability, or sign in to book online.
                  </p>
                </div>

                <div className="home-help-clinics">
                  {CAMPUS_CLINICS.map((campus) => (
                    <article key={campus.name}>
                      <h3>{campus.name}</h3>

                      <p className="home-help-row">
                        <Icon name="pin" size={17} />
                        <span>{campus.location}</span>
                      </p>

                      <p className="home-help-row">
                        <Icon name="clock" size={17} />
                        <span>Consultation hours: {campus.hours}</span>
                      </p>

                      <a className="home-help-call" href={`tel:${campus.tel}`}>
                        <Icon name="phone" size={16} />
                        {campus.phone}
                      </a>
                    </article>
                  ))}
                </div>

                <p className="home-help-general">
                  <span>
                    <Icon name="phone" size={16} />
                    General CPUT switchboard:{' '}
                    <a href="tel:+27219596767">+27 21 959 6767</a>
                  </span>

                  <span>
                    <Icon name="mail" size={16} />
                    Email:{' '}
                    <a href="mailto:info@cput.ac.za">info@cput.ac.za</a>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-container home-footer-grid">
          <div>
            <a className="home-logo home-logo-light" href="#home">
              PULSE<span>UP</span>
            </a>

            <p>
              Student-focused appointment booking and digital queue information
              for CPUT campus healthcare.
            </p>
          </div>

          <div className="home-footer-links">
            <strong>Explore</strong>
            <a href="#about">About us</a>
            <a href="#services">Student services</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="home-footer-links">
            <strong>Student access</strong>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
          </div>

          <div className="home-footer-alert">
            <strong>Need urgent help?</strong>

            <p>
              Online booking is not intended for life-threatening emergencies.
            </p>
          </div>
        </div>

        <div className="home-container home-footer-bottom">
          <span>© 2026 PulseUp. Student project.</span>

          <a
            href="https://www.cput.ac.za/student/support-services/dsa/campus-health-clinics"
            target="_blank"
            rel="noreferrer"
          >
            Official CPUT Campus Health information
          </a>
        </div>
      </footer>
      <Pulsy />
    </div>
  );
}

export default HomePage;
