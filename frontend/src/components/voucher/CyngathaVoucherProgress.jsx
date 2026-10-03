import { useEffect, useState } from 'react';

import voucherService from '../../services/voucherService';

import './CyngathaVoucherProgress.css';

function formatVoucherDate(dateValue) {
  if (!dateValue) {
    return 'Not available';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function CyngathaVoucherProgress() {
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    voucherService
      .getMyProgress()
      .then((response) => {
        if (!cancelled) {
          setProgress(response);
          setError('');
        }
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        console.error('Voucher progress loading failed:', requestError);

        setError('Your voucher progress could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError('');

      const response = await voucherService.getMyProgress();

      setProgress(response);
    } catch (requestError) {
      console.error('Voucher progress refresh failed:', requestError);

      setError('Your voucher progress could not be refreshed.');
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <article className="cyngatha-voucher-card voucher-loading-card">
        <p>Loading Cyngatha voucher progress...</p>
      </article>
    );
  }

  if (!progress) {
    return (
      <article className="cyngatha-voucher-card voucher-error-card">
        <div>
          <h2>Cyngatha Food Voucher</h2>

          <p>{error || 'Voucher progress is unavailable.'}</p>

          <button
            type="button"
            className="voucher-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Try again'}
          </button>
        </div>
      </article>
    );
  }

  const voucherTiers = Array.isArray(progress.voucherTiers)
    ? progress.voucherTiers
    : [60, 80, 100, 120];

  const percentage = Math.min(
    100,
    Math.max(0, Number(progress.progressPercentage || 0)),
  );

  const currentTier = Number(progress.currentTierAmount || 0);

  const activeVoucher = progress.activeVoucher || null;

  return (
    <article className="cyngatha-voucher-card">
      <div className="cyngatha-voucher-visual">
        <div className="cyngatha-image-overlay" />

        <div className="cyngatha-powered-card">
          <span>POWERED BY</span>

          <strong>
            <i aria-hidden="true" />
            Cyngatha
          </strong>
        </div>
      </div>

      <div className="cyngatha-voucher-content">
        <div className="cyngatha-voucher-heading">
          <div>
            <p className="cyngatha-eyebrow">PULSEUP HEALTH REWARDS</p>

            <h2>Food Voucher Progress</h2>
          </div>

          <span
            className={
              progress.questActive
                ? 'voucher-quest-badge active'
                : 'voucher-quest-badge complete'
            }
          >
            {progress.questActive ? 'Quest Active' : 'Top Tier'}
          </span>
        </div>

        <div className="voucher-progress-summary">
          <span className="voucher-current-tier">
            {currentTier > 0
              ? `CURRENT TIER: R${currentTier}`
              : 'BUILDING YOUR FIRST VOUCHER'}
          </span>

          <strong>{percentage}%</strong>
        </div>

        <div
          className="voucher-progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={percentage}
          aria-label="Cyngatha voucher progress"
        >
          <span
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="voucher-tier-markers">
          {voucherTiers.map((tier) => (
            <span
              className={
                Number(progress.healthPoints) >= tier
                  ? 'reached'
                  : tier === progress.nextTierAmount
                    ? 'next'
                    : ''
              }
              key={tier}
            >
              R{tier}
            </span>
          ))}
        </div>

        <div className="voucher-health-points">
          <div>
            <span>HEALTH POINTS</span>

            <strong>{progress.healthPoints}</strong>
          </div>

          <div>
            <span>POINTS PER VISIT</span>

            <strong>+{progress.pointsPerCompletedVisit}</strong>
          </div>

          <div>
            <span>VISITS TO NEXT TIER</span>

            <strong>{progress.visitsToNextTier}</strong>
          </div>
        </div>

        <p className="voucher-progress-message">{progress.progressMessage}</p>

        {activeVoucher ? (
          <section className="active-voucher-box">
            <div className="active-voucher-heading">
              <div>
                <span>AVAILABLE VOUCHER</span>

                <strong>R{activeVoucher.amount}</strong>
              </div>

              <span className="active-voucher-status">
                {activeVoucher.status}
              </span>
            </div>

            <div className="voucher-code-box">
              <span>VOUCHER CODE</span>

              <strong>{activeVoucher.voucherCode}</strong>
            </div>

            <p>
              Valid until{' '}
              <strong>{formatVoucherDate(activeVoucher.expiresAt)}</strong>
            </p>
          </section>
        ) : (
          <p className="voucher-locked-message">
            Your voucher code will appear here automatically when you reach the
            first 60-point tier.
          </p>
        )}

        {error && <p className="voucher-inline-error">{error}</p>}

        <button
          type="button"
          className="voucher-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh progress'}
        </button>
      </div>
    </article>
  );
}

export default CyngathaVoucherProgress;
