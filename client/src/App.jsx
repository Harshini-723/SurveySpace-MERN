import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q._id]).length,
    [questions, answers]
  );
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  async function loadSurvey() {
    setLoading(true);
    setError('');
    setSubmitted(false);
    setAnswers({});
    try {
      const response = await fetch(`${API_URL}/api/questions`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load questions.');
      setQuestions(data.questions || []);
    } catch (err) {
      setError(`${err.message} Check that the backend is running and VITE_API_URL is correct.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSurvey(); }, []);

  function chooseAnswer(questionId, option) {
    setAnswers((current) => ({ ...current, [questionId]: option }));
  }

  async function submitSurvey(event) {
    event.preventDefault();
    if (answeredCount !== questions.length || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: questions.map((q) => ({
            questionId: q._id,
            question: q.question,
            answer: answers[q._id]
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not submit your survey.');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="brand">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name">SurveySpace</div>
          <div className="brand-tagline">Every opinion matters.</div>
        </div>
      </header>

      {loading ? (
        <section className="survey-card status-card"><div className="loader" /><p>Loading your survey...</p></section>
      ) : error && questions.length === 0 ? (
        <section className="survey-card status-card">
          <h2>Unable to load survey</h2><p className="error-text">{error}</p>
          <button className="submit-button" onClick={loadSurvey}>Try Again</button>
        </section>
      ) : submitted ? (
        <section className="survey-card thank-card">
          <div className="success-icon"><Check size={25} strokeWidth={2.5} /></div>
          <h1>Thank you!</h1>
          <p className="success-subtitle">Your survey was submitted successfully.</p>
          <h3 className="answers-heading">Your Answers</h3>
          <div className="answer-list">
            {questions.map((q, index) => (
              <article className="answer-item" key={q._id}>
                <strong>{index + 1}. {q.question}</strong>
                <span>{answers[q._id]}</span>
              </article>
            ))}
          </div>
          <button className="submit-button another-button" onClick={loadSurvey}>
            Take Another Survey <RotateCcw size={14} />
          </button>
        </section>
      ) : (
        <form className="survey-card" onSubmit={submitSurvey}>
          <div className="eyebrow">ONLINE SURVEY</div>
          <h1>We'd love to hear from you!</h1>
          <p className="intro">Answer these 5 randomly selected questions.</p>
          <div className="progress-meta">
            <span>Survey Progress</span>
            <strong>{answeredCount} / {questions.length} answered</strong>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>

          <div className="question-list">
            {questions.map((q, index) => (
              <fieldset className="question-block" key={q._id}>
                <legend><span className="question-number">{index + 1}</span><span>{q.question}</span></legend>
                <div className="options-grid">
                  {q.options.map((option) => (
                    <label className={`option ${answers[q._id] === option ? 'selected' : ''}`} key={option}>
                      <input
                        type="radio"
                        name={q._id}
                        value={option}
                        checked={answers[q._id] === option}
                        onChange={() => chooseAnswer(q._id, option)}
                      />
                      <span className="radio-dot" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          {error && <p className="error-text inline-error">{error}</p>}
          <button className="submit-button" type="submit" disabled={answeredCount !== questions.length || saving}>
            {saving ? 'Submitting...' : 'Submit Survey →'}
          </button>
        </form>
      )}
      <footer>© 2026 SurveySpace | Your opinion matters.</footer>
    </main>
  );
}
