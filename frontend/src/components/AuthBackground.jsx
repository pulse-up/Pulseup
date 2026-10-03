import backgroundImage from '../assets/anatomy-bg.jpg';

import './AuthBackground.css';

/**
 * Full-screen animated background shared by the sign-in and
 * create-account pages. Purely decorative, so it is hidden from
 * assistive technology.
 */
function AuthBackground() {
  return (
    <div className="pulse-auth-bg" aria-hidden="true">
      <div
        className="pulse-auth-bg__image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="pulse-auth-bg__tint" />
      <div className="pulse-auth-bg__glow pulse-auth-bg__glow--blue" />
      <div className="pulse-auth-bg__glow pulse-auth-bg__glow--orange" />
      <div className="pulse-auth-bg__scan" />
      <div className="pulse-auth-bg__vignette" />
    </div>
  );
}

export default AuthBackground;
