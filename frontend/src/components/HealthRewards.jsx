import './HealthRewards.css';

const VOUCHER_TARGET = 100;
const POINTS_PER_VISIT = 10;

function HealthRewards({ healthPoints = 0 }) {
  const points = Math.max(0, Number(healthPoints) || 0);

  const progress = Math.min(
    100,
    Math.max(0, Math.round((points / VOUCHER_TARGET) * 100)),
  );

  const remainingPoints = Math.max(VOUCHER_TARGET - points, 0);

  const completedVisits = Math.floor(points / POINTS_PER_VISIT);

  const voucherUnlocked = points >= VOUCHER_TARGET;

  return (
    <section className="modern-rewards">
      <header className="modern-rewards__header">
        <div>
          <p className="modern-rewards__eyebrow">HEALTH REWARDS</p>

          <h2>Food voucher progress</h2>

          <p className="modern-rewards__description">
            Complete eligible clinic visits to earn Health Points and unlock
            your Cyngatha food voucher.
          </p>
        </div>

        <article className="modern-rewards__balance">
          <span>Current balance</span>

          <strong>{points}</strong>

          <small>Health Points</small>
        </article>
      </header>

      <article className="modern-voucher">
        <div className="modern-voucher__media">
          <img
            src="/images/cyngatha-team.png"
            alt="Cyngatha team supporting the PulseUp student reward programme"
          />

          <div className="modern-voucher__shade" aria-hidden="true" />

          <div className="modern-voucher__media-copy">
            <span>PULSEUP REWARDS</span>

            <h3>Wellness support that rewards healthy choices.</h3>

            <div className="modern-voucher__partner">
              <i aria-hidden="true" />

              <div>
                <small>FOOD VOUCHER PARTNER</small>

                <strong>Cyngatha</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="modern-voucher__content">
          <header className="modern-voucher__header">
            <div>
              <p>CYNGATHA REWARD</p>

              <h3>R100 Food Voucher</h3>
            </div>

            <span
              className={
                voucherUnlocked
                  ? 'modern-voucher__status is-unlocked'
                  : 'modern-voucher__status'
              }
            >
              {voucherUnlocked ? 'Unlocked' : 'Quest active'}
            </span>
          </header>

          <div className="modern-voucher__progress-heading">
            <span>Your progress</span>

            <strong>
              {points} / {VOUCHER_TARGET} points
            </strong>
          </div>

          <div
            className="modern-voucher__progress"
            role="progressbar"
            aria-label="Food voucher progress"
            aria-valuemin="0"
            aria-valuemax={VOUCHER_TARGET}
            aria-valuenow={Math.min(points, VOUCHER_TARGET)}
          >
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="modern-voucher__progress-footer">
            <span>0 points</span>

            <strong>{progress}% complete</strong>

            <span>100 points</span>
          </div>

          <div className="modern-voucher__metrics">
            <article>
              <span>Completed visits</span>

              <strong>{completedVisits}</strong>
            </article>

            <article>
              <span>Points remaining</span>

              <strong>{remainingPoints}</strong>
            </article>
          </div>

          <div
            className={
              voucherUnlocked
                ? 'modern-voucher__notice is-success'
                : 'modern-voucher__notice'
            }
          >
            <span aria-hidden="true">{voucherUnlocked ? '✓' : '+'}</span>

            <p>
              {voucherUnlocked
                ? 'Your R100 Cyngatha food voucher is ready to be claimed.'
                : `Earn ${remainingPoints} more Health Points to unlock your R100 food voucher.`}
            </p>
          </div>
        </div>
      </article>

      <section className="modern-rewards__steps">
        <article>
          <span>01</span>

          <div>
            <strong>Book a clinic visit</strong>

            <p>Select an available campus healthcare time slot.</p>
          </div>
        </article>

        <article>
          <span>02</span>

          <div>
            <strong>Complete your visit</strong>

            <p>Attend the consultation with the assigned clinician.</p>
          </div>
        </article>

        <article>
          <span>03</span>

          <div>
            <strong>Receive Health Points</strong>

            <p>Points are awarded after the appointment is completed.</p>
          </div>
        </article>
      </section>
    </section>
  );
}

export default HealthRewards;
