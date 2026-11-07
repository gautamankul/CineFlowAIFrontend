import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./ProjectDetail.css";

// Base backend media helper (adjust if running on a custom port/domain)
const BACKEND_BASE_URL = "http://localhost:8000";
const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(""); // 'storyboard' | 'generate_all' | 'assemble' | sceneId
  const [error, setError] = useState("");

  // 1. Fetch Project Details
  const fetchProjectold = useCallback(
    async (isPolling = false) => {
      try {
        if (!isPolling) setError("");
        const res = await apiFetch(`/studio/projects/${id}/`, {
          method: "GET",
        });

        const data = res?.data !== undefined ? res.data : res;
        if (data && (data.id || data.name)) {
          setProject(data);
        }
      } catch (err) {
        if (!isPolling) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to load project.",
          );
        }
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [id],
  );

  const fetchProject = useCallback(
    async (isPolling = false) => {
      try {
        if (!isPolling) setError("");

        const response = await apiFetch(`/studio/projects/${id}/`, {
          method: "GET",
        });

        // Check HTTP response
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          throw new Error(
            errorData.detail ||
              errorData.error ||
              `API Error: ${response.status}`,
          );
        }

        // IMPORTANT: Parse native Fetch Response
        const data = await response.json();

        console.log("Project JSON:", data);

        // Support wrapped and unwrapped API responses
        const projectData =
          data?.project ?? data?.data?.project ?? data?.data ?? data;

        if (!projectData || !projectData.id) {
          throw new Error("Project ID missing from API response.");
        }

        setProject(projectData);
        setError("");
      } catch (err) {
        console.error("Project fetch failed:", err);

        if (!isPolling) {
          setProject(null);
          setError(err.message || "Failed to load project.");
        }
      } finally {
        if (!isPolling) {
          setLoading(false);
        }
      }
    },
    [id],
  );

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id, fetchProject]);

  // 2. Auto-polling when project or scenes are actively generating
  useEffect(() => {
    if (!project) return;

    const isProjectBusy = ["generating", "draft"].includes(project.status);
    const hasActiveScenes = project.scenes?.some((s) =>
      ["generating_image", "generating_video"].includes(s.status),
    );

    let interval = null;
    if (isProjectBusy || hasActiveScenes) {
      interval = setInterval(() => {
        fetchProject(true);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [project, fetchProject]);

  // 3. Action Handlers
  const handleGenerateStoryboard = async () => {
    try {
      setActionLoading(true);
      setActiveAction("storyboard");
      setError("");

      await apiFetch(`/studio/projects/${id}/storyboard/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene_count: project?.scenes?.length || 3 }),
      });

      setProject((prev) => (prev ? { ...prev, status: "generating" } : prev));
      setTimeout(() => fetchProject(true), 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to trigger storyboard generation.",
      );
    } finally {
      setActionLoading(false);
      setActiveAction("");
    }
  };

  const handleGenerateAllClips = async () => {
    try {
      setActionLoading(true);
      setActiveAction("generate_all");
      setError("");

      await apiFetch(`/studio/projects/${id}/generate_all/`, {
        method: "POST",
      });

      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "generating",
          scenes: prev.scenes.map((s) => ({
            ...s,
            status: "generating_image",
          })),
        };
      });
      setTimeout(() => fetchProject(true), 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to trigger clip generation.",
      );
    } finally {
      setActionLoading(false);
      setActiveAction("");
    }
  };

  const handleAssembleVideo = async () => {
    try {
      setActionLoading(true);
      setActiveAction("assemble");
      setError("");

      await apiFetch(`/studio/projects/${id}/assemble/`, {
        method: "POST",
      });

      setProject((prev) => (prev ? { ...prev, status: "generating" } : prev));
      setTimeout(() => fetchProject(true), 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to assemble video.",
      );
    } finally {
      setActionLoading(false);
      setActiveAction("");
    }
  };

  const handleRegenerateScene = async (sceneId) => {
    try {
      setActiveAction(`scene-${sceneId}`);
      setError("");

      await apiFetch(`/studio/scenes/${sceneId}/regenerate/`, {
        method: "POST",
      });

      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          scenes: prev.scenes.map((s) =>
            s.id === sceneId ? { ...s, status: "generating_image" } : s,
          ),
        };
      });
      setTimeout(() => fetchProject(true), 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          `Failed to regenerate scene #${sceneId}`,
      );
    } finally {
      setActiveAction("");
    }
  };

  if (loading) {
    return (
      <div className="cine-container cine-center">
        <div className="cine-spinner"></div>
        <p className="cine-loading-text">Loading Production Studio...</p>
      </div>
    );
  }

  //   if (!project) {
  //     return (
  //       <div className="cine-container cine-center">
  //         <div className="cine-empty-card">
  //           <h2>Project Not Found</h2>
  //           <p>The requested project ID does not exist or has been removed.</p>
  //           <button
  //             className="cine-btn cine-btn-secondary"
  //             onClick={() => navigate("/")}
  //           >
  //             ← Back to Dashboard
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }

  if (!project) {
    return (
      <div className="cine-container cine-center">
        <div className="cine-empty-card">
          <h2>
            {error.includes("(404)")
              ? "Project Not Found"
              : "Unable to Load Project"}
          </h2>

          <p>{error || "Unable to retrieve project details."}</p>

          <button
            className="cine-btn cine-btn-primary"
            onClick={() => {
              setLoading(true);
              fetchProject();
            }}
          >
            Retry Loading Project
          </button>

          <button
            className="cine-btn cine-btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const scenes = project.scenes || [];
  const completedScenesCount = scenes.filter(
    (s) => s.status === "completed" && s.video,
  ).length;
  const canAssemble =
    scenes.length > 0 && completedScenesCount === scenes.length;

  return (
    <div className="cine-container">
      {/* HEADER / NAVIGATION */}
      <header className="cine-header">
        <div className="cine-brand" onClick={() => navigate("/dashboard")}>
          <span className="cine-icon">◀</span> Back to Dashboard
        </div>
        <div className="cine-header-right">
          <span className="cine-tag">
            PROJECT #{String(project.id).slice(0, 8)}
          </span>
          <span className={`cine-badge status-${project.status.toLowerCase()}`}>
            {project.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </header>

      {error && (
        <div className="cine-alert" role="alert">
          <span>⚠ {error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="cine-hero">
        <div className="cine-hero-main">
          <div className="cine-title-area">
            <h1>{project.name}</h1>
            <div className="cine-pill-row">
              <span className="cine-pill">🎥 {project.style}</span>
              <span className="cine-pill">📐 {project.aspect_ratio}</span>
              <span className="cine-pill">
                🎬 {scenes.length} Scene{scenes.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <p className="cine-prompt-box">
            <span className="cine-prompt-label">MASTER FILM PROMPT</span>
            {project.prompt}
          </p>
        </div>

        {/* WORKFLOW CONTROLS */}
        <div className="cine-hero-actions">
          <h3>Production Controls</h3>

          {project.status === "draft" || scenes.length === 0 ? (
            <button
              className="cine-btn cine-btn-primary"
              onClick={handleGenerateStoryboard}
              disabled={actionLoading}
            >
              {activeAction === "storyboard"
                ? "Generating..."
                : "✦ Generate Storyboard"}
            </button>
          ) : (
            <>
              <button
                className="cine-btn cine-btn-primary"
                onClick={handleGenerateAllClips}
                disabled={actionLoading || activeAction === "generate_all"}
              >
                {activeAction === "generate_all"
                  ? "Queueing Clips..."
                  : "⚡ Generate All Clips"}
              </button>

              <button
                className="cine-btn cine-btn-secondary"
                onClick={handleAssembleVideo}
                disabled={
                  !canAssemble || actionLoading || activeAction === "assemble"
                }
                title={
                  !canAssemble
                    ? "All scenes must be generated before assembling"
                    : ""
                }
              >
                {activeAction === "assemble"
                  ? "Assembling..."
                  : "🎞 Assemble Final Video"}
              </button>

              <button
                className="cine-btn cine-btn-ghost"
                onClick={handleGenerateStoryboard}
                disabled={actionLoading}
              >
                {activeAction === "storyboard"
                  ? "Regenerating..."
                  : "↺ Redo Storyboard"}
              </button>
            </>
          )}
        </div>
      </section>

      {/* FINAL VIDEO SECTION (IF AVAILABLE) */}
      {project.final_video && (
        <section className="cine-final-section">
          <div className="cine-section-header">
            <h2>Final Rendered Film</h2>
            <a
              href={resolveMediaUrl(project.final_video)}
              download
              className="cine-btn cine-btn-secondary"
            >
              ⬇ Download Video
            </a>
          </div>
          <div className="cine-final-video-wrap">
            <video
              src={resolveMediaUrl(project.final_video)}
              controls
              playsInline
              className="cine-player"
            />
          </div>
        </section>
      )}

      {/* STORYBOARD SCENES GRID */}
      <section className="cine-scenes-section">
        <div className="cine-section-header">
          <div>
            <h2>Storyboard Timeline</h2>
            <p className="cine-subtitle">
              Generated shots based on your cinematic prompt.
            </p>
          </div>
          <span className="cine-progress-label">
            Ready Clips: <strong>{completedScenesCount}</strong> /{" "}
            {scenes.length}
          </span>
        </div>

        {scenes.length === 0 ? (
          <div className="cine-empty-state">
            <div className="empty-icon">🎞</div>
            <h3>No Scenes Found</h3>
            <p>Click "Generate Storyboard" above to create shots with AI.</p>
          </div>
        ) : (
          <div className="cine-scenes-grid">
            {scenes.map((scene) => {
              const isSceneActive = activeAction === `scene-${scene.id}`;
              const isGenerating = [
                "generating_image",
                "generating_video",
              ].includes(scene.status);

              return (
                <div key={scene.id} className="cine-scene-card">
                  {/* Media Stage */}
                  <div className="cine-scene-media">
                    {scene.video ? (
                      <video
                        src={resolveMediaUrl(scene.video)}
                        controls
                        className="cine-media-el"
                      />
                    ) : scene.reference_image ? (
                      <img
                        src={resolveMediaUrl(scene.reference_image)}
                        alt={`Scene ${scene.scene_number}`}
                        className="cine-media-el"
                      />
                    ) : (
                      <div className="cine-media-placeholder">
                        {isGenerating ? (
                          <div className="cine-mini-loader">
                            <div className="cine-spinner"></div>
                            <span>
                              Generating{" "}
                              {scene.status.replace("generating_", "")}...
                            </span>
                          </div>
                        ) : (
                          <div className="cine-placeholder-info">
                            <span>Shot {scene.scene_number}</span>
                            <small>No Media Yet</small>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="cine-scene-badge-row">
                      <span className="cine-scene-seq">
                        #{scene.scene_number}
                      </span>
                      <span
                        className={`cine-badge status-${scene.status.toLowerCase()}`}
                      >
                        {scene.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Scene Details */}
                  <div className="cine-scene-body">
                    <h3 className="cine-scene-title">{scene.title}</h3>
                    <p className="cine-scene-desc">{scene.description}</p>

                    <div className="cine-meta-blocks">
                      {scene.camera_movement && (
                        <div className="cine-meta-item">
                          <strong>Camera:</strong> {scene.camera_movement}
                        </div>
                      )}
                      {scene.lighting && (
                        <div className="cine-meta-item">
                          <strong>Lighting:</strong> {scene.lighting}
                        </div>
                      )}
                      {scene.image_prompt && (
                        <div className="cine-meta-item">
                          <strong>Image Prompt:</strong>
                          <span>{scene.image_prompt}</span>
                        </div>
                      )}
                    </div>

                    {scene.error_message && (
                      <div className="cine-scene-error">
                        ⚠ {scene.error_message}
                      </div>
                    )}
                  </div>

                  {/* Scene Footer Actions */}
                  <div className="cine-scene-footer">
                    <button
                      className="cine-btn cine-btn-ghost cine-btn-sm"
                      onClick={() => handleRegenerateScene(scene.id)}
                      disabled={actionLoading || isSceneActive || isGenerating}
                    >
                      {isSceneActive ? "Queueing..." : "↻ Regenerate Shot"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
