// MYOBOT — Coming Soon (Refactored for 3D CSS Gyroscope & Fallbacks)
const FORM_ENDPOINT = null;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('waitlistForm');
  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  const messageInput = document.getElementById('messageInput');
  const formFeedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitBtn');
  const formPanel = document.querySelector('.form-panel');
  const interestTabs = document.querySelectorAll('.tab-3d');
  const gyroContainer = document.querySelector('.gyro-container');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selectedInterests = new Set();

  // ─── Cursor-tracking spotlight and 3D Gyroscope tilt ───
  if (!prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
      // 1. Grid spotlight position
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      
      // 2. Gyroscope 3D tilt calculations (max 20 degrees tilt)
      const tiltX = (e.clientX / window.innerWidth - 0.5) * 20;
      const tiltY = (e.clientY / window.innerHeight - 0.5) * -20;
      
      if (gyroContainer) {
        gyroContainer.style.setProperty('--gyro-tilt-x', `${tiltX}deg`);
        gyroContainer.style.setProperty('--gyro-tilt-y', `${tiltY}deg`);
      }
    });
  }

  // ─── Scroll-linked Parallax, Scale, and Fading ───
  if (!prefersReducedMotion && gyroContainer) {
    window.addEventListener('scroll', () => {
      const scrollPct = window.scrollY / window.innerHeight;
      
      // 1. Fade out the gyroscope completely as we scroll to fold 2 (Absolute text protection)
      gyroContainer.style.opacity = Math.max(0, 0.75 - scrollPct * 1.35);
      
      // 2. Shift upward and scale down (Parallax motion)
      gyroContainer.style.transform = `translate(-50%, calc(-50% - ${scrollPct * 100}px)) rotateX(var(--gyro-tilt-y, 0deg)) rotateY(var(--gyro-tilt-x, 0deg)) scale(${Math.max(0.65, 1 - scrollPct * 0.4)})`;
    });
  }

  // ─── GSAP entrance animations ───
  if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
    // Animate Hero Section (Fold 1) on load
    gsap.to(['.top-nav', '#hero .reveal'], {
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.15,
    });

    // Animate Gyroscope container separately (only opacity, preserving transform)
    if (gyroContainer) {
      gsap.to(gyroContainer, {
        opacity: 0.75,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.25,
      });
    }

    // Animate Form Section (Fold 2) on scroll reveal
    const formObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(['#waitlist-section .reveal', 'footer.bottom'], {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: 'power3.out',
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const waitlistSection = document.getElementById('waitlist-section');
    if (waitlistSection) {
      formObserver.observe(waitlistSection);
    }

  } else {
    // Fallback if GSAP is missing or user prefers reduced motion
    document.querySelectorAll('.reveal, .top-nav, footer.bottom').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    if (gyroContainer) {
      gyroContainer.style.opacity = '0.75';
    }
  }

  // ─── 3D form panel tilt ───
  if (formPanel && !prefersReducedMotion) {
    formPanel.addEventListener('mousemove', (e) => {
      const rect = formPanel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      formPanel.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`;
    });

    formPanel.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(formPanel, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' });
      } else {
        formPanel.style.transform = '';
      }
    });
  }

  // ─── 3D interest tabs ───
  interestTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const value = tab.dataset.value;
      const isActive = tab.classList.toggle('active');
      tab.setAttribute('aria-pressed', String(isActive));

      if (isActive) {
        selectedInterests.add(value);
        if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
          gsap.fromTo(tab, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
        }
      } else {
        selectedInterests.delete(value);
      }
    });

    if (!prefersReducedMotion) {
      tab.addEventListener('mousemove', (e) => {
        if (tab.classList.contains('active')) return;
        const rect = tab.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        tab.style.transform = `rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateZ(12px)`;
      });

      tab.addEventListener('mouseleave', () => {
        if (!tab.classList.contains('active')) {
          tab.style.transform = '';
        }
      });
    }
  });

  // ─── Form validation & storage ───
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formFeedback.textContent = '';
    formFeedback.className = 'feedback';
    emailInput.classList.remove('error');

    const email = emailInput.value.trim();
    if (!email) {
      emailInput.classList.add('error');
      formFeedback.textContent = 'Please enter your email.';
      formFeedback.classList.add('error');
      return;
    }

    if (!validateEmail(email)) {
      emailInput.classList.add('error');
      formFeedback.textContent = 'Please enter a valid email address.';
      formFeedback.classList.add('error');
      return;
    }

    const entry = {
      name: nameInput.value.trim(),
      email,
      interests: [...selectedInterests],
      message: messageInput.value.trim(),
      submittedAt: new Date().toISOString(),
    };

    const saveLocal = () => {
      const leads = JSON.parse(localStorage.getItem('myobot-waitlist') || '[]');
      const existing = leads.findIndex((l) => l.email === email);
      if (existing >= 0) {
        leads[existing] = entry;
      } else {
        leads.push(entry);
      }
      localStorage.setItem('myobot-waitlist', JSON.stringify(leads));
    };

    const showSuccess = () => {
      submitBtn.disabled = true;
      formFeedback.textContent = "You're on the list. We'll be in touch.";
      formFeedback.classList.add('success');

      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.to(formPanel, { scale: 0.98, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });
      }

      setTimeout(() => {
        submitBtn.disabled = false;
      }, 2000);
    };

    submitBtn.disabled = true;

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(entry),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Submit failed');
          saveLocal();
          showSuccess();
        })
        .catch(() => {
          formFeedback.textContent = 'Something went wrong. Please try again.';
          formFeedback.classList.add('error');
          submitBtn.disabled = false;
        });
    } else {
      saveLocal();
      showSuccess();
    }
  });
});
