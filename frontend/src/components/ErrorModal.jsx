import React from 'react';

export default function ErrorModal({ error, onClose, onSwitchToManual, onRetry }) {
  if (!error) return null;

  const isRateLimit = error.status === 429;
  const isUnclearImage = error.status === 422 && (error.message?.toLowerCase().includes('screenshot') || error.message?.toLowerCase().includes('read'));
  const isServerConfig = error.status === 500;
  const isConnectionError = error.status === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-max-width-mobile bg-surface rounded-3xl p-6 shadow-2xl border border-surface-container text-left space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close error"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 pt-1">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isRateLimit
              ? 'bg-amber-500/10 text-amber-600'
              : 'bg-error-container text-on-error-container'
          }`}>
            <span className="material-symbols-outlined text-[26px]">
              {isRateLimit ? 'schedule' : isServerConfig ? 'dns' : 'error'}
            </span>
          </div>

          <div className="flex-1 pr-6 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {isRateLimit
                  ? 'High Traffic Notice'
                  : isUnclearImage
                  ? 'Screenshot Unclear'
                  : isConnectionError
                  ? 'Connection Issue'
                  : 'Calculation Error'}
              </h3>
            </div>
            {error.status > 0 && (
              <span className="inline-block mt-0.5 font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono font-semibold">
                HTTP {error.status}
              </span>
            )}
          </div>
        </div>

        {/* Message */}
        <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
          {error.message || error.detail || 'An unexpected error occurred while processing your request.'}
        </p>

        {/* Helpful Tip */}
        <div className="p-3.5 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface-variant">
          {isRateLimit ? (
            <p>?? <strong className="text-on-surface">Quick tip:</strong> Manual Entry runs instantly without any AI rate limits!</p>
          ) : isUnclearImage ? (
            <p>?? <strong className="text-on-surface">Suggestion:</strong> Crop your screenshot tightly to the subject attendance table, or enter the numbers manually.</p>
          ) : isServerConfig ? (
            <p>?? <strong className="text-on-surface">Notice:</strong> AI Vision service is not configured in backend environment.</p>
          ) : (
            <p>?? Total classes held must be greater than 0, and attended classes cannot exceed total held.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          {onSwitchToManual && (
            <button
              onClick={() => {
                onClose();
                onSwitchToManual();
              }}
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
              <span>Use Manual Entry</span>
            </button>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Try Again</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-medium"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
