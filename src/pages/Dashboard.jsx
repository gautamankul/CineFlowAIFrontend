import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./Dashboard.css";

// Matched to router prefix in urls.py (path("api/", include(router.urls)))
const PROJECT_URL = "/studio/projects/";

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  let data = {};

  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { detail: text } : {};
    }
  }

  if (!response.ok) {
    const message =
      data.detail ||
      data.message ||
      data.error ||
      (typeof data === "object" && data !== null
        ? Object.entries(data)
            .map(([key, value]) => {
              const errorText = Array.isArray(value)
                ? value.join(", ")
                : typeof value === "object"
                ? JSON.stringify(value)
                : String(value);
              return `${key}: ${errorText}`;
            })
            .join(" | ")
        : "") ||
      `Request failed (${response.status}).`;

    throw new Error(message);
  }

  return data;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic realism");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [sceneCount, setSceneCount] = useState(3);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // GET PROJECTS
  const getProjects = useCallback(async () => {
    const response = await apiFetch(PROJECT_URL, {
      method: "GET",
    });
    return handleResponse(response);
  }, []);

  // CREATE PROJECT
  const createProject = async (projectData) => {
    const response = await apiFetch(PROJECT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
    return handleResponse(response);
  };

  // TRIGGER STORYBOARD GENERATION
  const generateStoryboard = async (projectId, count) => {
    const response = await apiFetch(`${PROJECT_URL}${projectId}/storyboard/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scene_count: count }),
    });
    return handleResponse(response);
  };

  // LOAD ALL PROJECTS
  const loadData = useCallback(async () => {
    try {
      setError("");
      const res = await getProjects();
      const projectData = Array.isArray(res)
        ? res
        : res.results ?? res.data ?? [];

      if (!Array.isArray(projectData)) {
        throw new Error("Invalid projects response format.");
      }

      setProjects(projectData);
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [getProjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // SUBMIT HANDLER
  const handleCreate = async (e) => {
    e.preventDefault();

    const projectName = name.trim();
    const projectPrompt = prompt.trim();

    if (!projectName || !projectPrompt) {
      setError("Please enter a project title and film prompt.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      // 1. Create project record
      const newProject = await createProject({
        name: projectName,
        prompt: projectPrompt,
        style: style,
        aspect_ratio: aspectRatio,
      });

      // 2. Dispatch Celery storyboard task
      await generateStoryboard(newProject.id, Number(sceneCount));

      // 3. Clear inputs & navigate to the Project view
      setName("");
      setPrompt("");
      navigate(`/project/${newProject.id}`);
    } catch (err) {
      setError(err.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          ▶ CineFlow<span>AI</span>
        </div>
        <div className="header-right">
          <span className="studio-label">AI FILM STUDIO</span>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <span className="section-tag">YOUR CREATIVE WORKSPACE</span>
            <h1>
              CineFlowAI <span>Studio</span>
            </h1>
            <p>
              Turn your imagination into cinematic experiences. Create and
              manage your AI film projects.
            </p>
          </div>
          <div className="welcome-icon">🎬</div>
        </section>

        {error && (
          <div className="dashboard-error" role="alert">
            ⚠ {error}
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <section className="create-section">
          <div className="section-heading">
            <div>
              <h2>Create New Project</h2>
              <p>Start your next cinematic masterpiece.</p>
            </div>
            <span className="ai-badge">✦ AI POWERED</span>
          </div>

          <form onSubmit={handleCreate} className="project-form">
            <div className="form-group">
              <label htmlFor="project-name">Project Title</label>
              <input
                id="project-name"
                type="text"
                placeholder="Enter your film title..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                disabled={creating}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="film-prompt">Describe Your Film</label>
              <textarea
                id="film-prompt"
                placeholder="Describe your cinematic vision, characters, environment, camera movements, lighting and story..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                disabled={creating}
                required
              />
            </div>

            <div
              className="form-row"
              style={{ display: "flex", gap: "12px", marginBottom: "16px" }}
            >
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="project-style">Visual Style</label>
                <select
                  id="project-style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={creating}
                >
                  <option value="Cinematic realism">Cinematic realism</option>
                  <option value="Science fiction">Science fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Anime">Anime</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Stylized animation">Stylized animation</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="project-aspect">Aspect Ratio</label>
                <select
                  id="project-aspect"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  disabled={creating}
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>

              <div className="form-group" style={{ width: "100px" }}>
                <label htmlFor="project-scenes">Scenes</label>
                <input
                  id="project-scenes"
                  type="number"
                  min="2"
                  max="10"
                  value={sceneCount}
                  onChange={(e) => setSceneCount(e.target.value)}
                  disabled={creating}
                />
              </div>
            </div>

            <div className="form-bottom">
              <span className="style-label">🎥 Style: {style}</span>
              <button
                type="submit"
                className="create-button"
                disabled={creating}
              >
                {creating ? "Creating..." : "✦ Create & Generate Storyboard"}
              </button>
            </div>
          </form>
        </section>

        <section className="projects-section">
          <div className="section-heading">
            <div>
              <h2>My Projects</h2>
              <p>Manage your cinematic creations.</p>
            </div>
            <span className="project-count">{projects.length} Projects</span>
          </div>

          {loading ? (
            <div className="empty-state" role="status">
              Loading your projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <h3>No Projects Yet</h3>
              <p>Your creative journey starts here. Create your first AI film project.</p>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => {
                const projectStatus = String(
                  project.status || "pending"
                ).toLowerCase();

                return (
                  <article
                    className="project-card"
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div className="project-card-top">
                      <span className="project-icon">🎞</span>
                      <span className={`status-badge ${projectStatus}`}>
                        {project.status || "Pending"}
                      </span>
                    </div>

                    <h3>{project.name}</h3>
                    <p className="project-prompt">{project.prompt}</p>

                    <div className="project-card-footer">
                      <span>{project.style || "Cinematic realism"}</span>
                      <span>#{String(project.id).slice(0, 8)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}