"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(3);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/summarize', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          top_k: topK
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--background) 0%, #f8fafc 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--brand-red)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              ∑
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'var(--foreground)',
              margin: 0
            }}>
              Extractive Summarization
            </h1>
          </div>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--secondary)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.7'
          }}>
            Transform lengthy text into concise, key insights using advanced AI-powered extractive summarization
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2rem'
        }} className="grid-responsive">
          {/* Input Panel */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--foreground)',
                marginBottom: '0.5rem'
              }}>
                Input Text
              </label>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--secondary)',
                marginBottom: '1rem'
              }}>
                Paste your text below to generate an extractive summary
              </p>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here..."
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '1rem',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                fontSize: '1rem',
                lineHeight: '1.6',
                background: 'var(--input-bg)',
                color: 'var(--foreground)',
                resize: 'vertical',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = 'var(--brand-red)';
                target.style.boxShadow = '0 0 0 3px rgba(210, 35, 42, 0.1)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.borderColor = 'var(--border)';
                target.style.boxShadow = 'none';
              }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: 'var(--secondary)'
            }}>
              <span>{wordCount} words • {charCount} characters</span>
            </div>

            {/* Controls */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: 'var(--input-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--foreground)',
                marginBottom: '1rem'
              }}>
                Summary Settings
              </h3>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--foreground)',
                  marginBottom: '0.5rem'
                }}>
                  Number of Sentences: {topK}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--border)',
                    outline: 'none',
                    appearance: 'none'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--secondary)',
                  marginTop: '0.25rem'
                }}>
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>
            </div>

            <button
              onClick={run}
              disabled={loading || !text.trim()}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                marginTop: '1.5rem',
                background: loading ? 'var(--secondary)' : 'var(--brand-red)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading && text.trim()) {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'var(--brand-red-dark)';
                  target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && text.trim()) {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'var(--brand-red)';
                  target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <div className="animate-pulse" style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Processing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Summary
                </>
              )}
            </button>

            {error && (
              <div className="animate-fadeIn" style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            minHeight: '500px'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--foreground)',
                marginBottom: '0.5rem'
              }}>
                Summary Output
              </label>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--secondary)'
              }}>
                Your AI-generated extractive summary will appear here
              </p>
            </div>

            {summary ? (
              <div className="animate-fadeIn" style={{
                background: 'var(--input-bg)',
                border: '2px solid var(--brand-red)',
                borderRadius: '12px',
                padding: '1.5rem',
                minHeight: '300px'
              }}>
                <div style={{
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: 'var(--foreground)'
                }}>
                  {summary}
                </div>
                
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  color: 'var(--secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{summary.trim().split(/\s+/).length} words in summary</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(summary)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = 'var(--brand-red)';
                      target.style.color = 'var(--brand-red)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = 'var(--border)';
                      target.style.color = 'var(--secondary)';
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                color: 'var(--secondary)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'var(--input-bg)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  border: '2px dashed var(--border)'
                }}>
                  📄
                </div>
                <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  No summary yet
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  Enter text and click &quot;Generate Summary&quot; to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border)',
          color: 'var(--secondary)',
          fontSize: '0.875rem'
        }}>
          <p>Powered by AI • Extractive Summarization Engine</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand-red);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand-red);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
