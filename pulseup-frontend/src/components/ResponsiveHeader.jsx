import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import './ResponsiveHeader.css';

function ResponsiveHeader({
  ariaLabel = 'Page navigation',
  desktopAction,
  desktopActions,
  identity,
  menuItems = [],
  onSignOut,
  variant = 'dashboard',
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const actions = desktopActions || (desktopAction ? [desktopAction] : []);
  const generatedId = useId().replace(/:/g, '');
  const menuId = `pulse-responsive-menu-${generatedId}`;
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function closeAndRestoreFocus() {
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeAndRestoreFocus();
      }
    }

    function handlePointerDown(event) {
      if (!headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth > 980) {
        setMenuOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleMenuAction(onSelect) {
    closeMenu();
    onSelect?.();
  }

  const headerClassName = [
    'pulse-responsive-header',
    `pulse-responsive-header--${variant}`,
    menuOpen ? 'pulse-responsive-header--open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClassName} ref={headerRef}>
      <div className="pulse-responsive-header__inner">
        <Link
          className="pulse-responsive-header__logo"
          to="/"
          aria-label="PulseUp home"
          onClick={closeMenu}
        >
          PULSE<span>UP</span>
        </Link>

        <div className="pulse-responsive-header__desktop">
          {identity && (
            <div className="pulse-responsive-header__identity">
              <strong>{identity.name}</strong>
              <span>{identity.detail}</span>
            </div>
          )}

          {actions.map((action) => (
            <Link
              className="pulse-responsive-header__desktop-link"
              to={action.to}
              key={`${action.label}-${action.to}`}
            >
              {action.label}
            </Link>
          ))}

          {onSignOut && (
            <button
              type="button"
              className="pulse-responsive-header__sign-out"
              onClick={onSignOut}
            >
              Sign out
            </button>
          )}
        </div>

        <button
          ref={menuButtonRef}
          className="pulse-responsive-header__menu-button"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((currentState) => !currentState)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id={menuId}
          className="pulse-responsive-header__menu"
          aria-label={ariaLabel}
          hidden={!menuOpen}
        >
          {identity && (
            <div className="pulse-responsive-header__mobile-identity">
              <strong>{identity.name}</strong>
              <span>{identity.detail}</span>
            </div>
          )}

          <div className="pulse-responsive-header__menu-items">
            {menuItems.map((item) => {
              const itemClassName = item.active
                ? 'pulse-responsive-header__menu-item is-active'
                : 'pulse-responsive-header__menu-item';

              if (item.to) {
                return (
                  <Link
                    className={itemClassName}
                    to={item.to}
                    aria-current={item.active ? 'page' : undefined}
                    onClick={closeMenu}
                    key={`${item.label}-${item.to}`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  type="button"
                  className={itemClassName}
                  aria-pressed={item.active || undefined}
                  onClick={() => handleMenuAction(item.onSelect)}
                  key={item.label}
                >
                  {item.label}
                </button>
              );
            })}

            {onSignOut && (
              <button
                type="button"
                className="pulse-responsive-header__menu-item pulse-responsive-header__menu-item--sign-out"
                onClick={() => handleMenuAction(onSignOut)}
              >
                Sign out
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default ResponsiveHeader;
