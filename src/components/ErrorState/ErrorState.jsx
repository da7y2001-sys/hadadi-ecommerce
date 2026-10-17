import "./ErrorState.css";

// مكوّن بسيط لعرض رسالة خطأ موحّدة مع زر إعادة المحاولة (اختياري)
function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="error-state">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="error-state-btn" type="button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
