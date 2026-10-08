import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Sessions.css";

function Sessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchSessions = async () => {
    try {
      setError("");

      const response = await api.get("/sessions");

      setSessions(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load sessions"
      );
    } finally {
      setLoading(false);
    }
  };

  const logoutSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);

      await api.delete("/sessions/" + sessionId);

      await fetchSessions();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to logout session"
      );
    } finally {
      setActionLoading("");
    }
  };

  const logoutAllSessions = async () => {
    try {
      setActionLoading("all");

      await api.delete("/sessions");

      await fetchSessions();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to logout all sessions"
      );
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const activeSessions = sessions.filter(
    (session) => !session.isRevoked
  );

  const sessionHistory = sessions.filter(
    (session) => session.isRevoked
  );

  if (loading) {
    return (
      <main className="sessions-page">
        <div className="sessions-loading">
          <div className="loading-spinner"></div>
          <p>Loading your sessions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="sessions-page">
      <div className="sessions-container">

        {/* HEADER */}
        <header className="sessions-header">
          <div className="header-content">
            <div className="security-icon">
              🛡
            </div>

            <div>
              <p className="eyebrow">
                ACCOUNT SECURITY
              </p>

              <h1>Sessions</h1>

              <p className="header-description">
                Manage devices that are currently signed
                in to your account.
              </p>
            </div>
          </div>

          <button
            className="dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div className="session-error">
            <span>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* ACTIVE SESSIONS */}
        <section className="session-section">
          <div className="section-header">
            <div>
              <h2>Active Sessions</h2>

              <p>
                Devices currently signed in to your
                account.
              </p>
            </div>

            {activeSessions.length > 0 && (
              <button
                className="logout-all-button"
                onClick={logoutAllSessions}
                disabled={actionLoading === "all"}
              >
                {actionLoading === "all"
                  ? "Logging out..."
                  : "Logout All"}
              </button>
            )}
          </div>

          {activeSessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>

              <h3>No active sessions</h3>

              <p>
                You don't have any active sessions
                right now.
              </p>
            </div>
          ) : (
            <div className="session-list">
              {activeSessions.map((session) => (
                <div
                  className="session-card"
                  key={session._id}
                >
                  <div className="device-section">
                    <div className="device-icon">
                      💻
                    </div>

                    <div className="device-details">
                      <div className="device-title">
                        <h3>
                          {session.userAgent ||
                            "Unknown Device"}
                        </h3>

                        <span className="status-active">
                          Active
                        </span>
                      </div>

                      <p className="device-ip">
                        IP Address:{" "}
                        {session.ipAddress ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="session-meta">
                    <div className="meta-item">
                      <span>Created</span>

                      <strong>
                        {new Date(
                          session.createdAt
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div className="meta-item">
                      <span>Expires</span>

                      <strong>
                        {new Date(
                          session.expiresAt
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <button
                      className="logout-session-button"
                      onClick={() =>
                        logoutSession(session._id)
                      }
                      disabled={
                        actionLoading === session._id
                      }
                    >
                      {actionLoading === session._id
                        ? "Logging out..."
                        : "Logout"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SESSION HISTORY */}
        <section className="session-section history-section">
          <div className="section-header">
            <div>
              <h2>Session History</h2>

              <p>
                Previously revoked login sessions.
              </p>
            </div>
          </div>

          {sessionHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon history-icon">
                ◷
              </div>

              <h3>No session history</h3>

              <p>
                Revoked sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="session-list">
              {sessionHistory.map((session) => (
                <div
                  className="session-card revoked-session"
                  key={session._id}
                >
                  <div className="device-section">
                    <div className="device-icon revoked-icon">
                      💻
                    </div>

                    <div className="device-details">
                      <div className="device-title">
                        <h3>
                          {session.userAgent ||
                            "Unknown Device"}
                        </h3>

                        <span className="status-revoked">
                          Revoked
                        </span>
                      </div>

                      <p className="device-ip">
                        IP Address:{" "}
                        {session.ipAddress ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="session-meta">
                    <div className="meta-item">
                      <span>Created</span>

                      <strong>
                        {new Date(
                          session.createdAt
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div className="meta-item">
                      <span>Revoked</span>

                      <strong>
                        {session.revokedAt
                          ? new Date(
                              session.revokedAt
                            ).toLocaleString()
                          : "N/A"}
                      </strong>
                    </div>

                    <div className="revoked-label">
                      Session revoked
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECURITY INFO */}
        <div className="security-info">
          <div className="security-info-icon">
            🔐
          </div>

          <div>
            <h3>Keep your account secure</h3>

            <p>
              If you don't recognize a device, revoke
              its session immediately and change your
              password.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Sessions;