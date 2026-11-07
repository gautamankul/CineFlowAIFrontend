
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch } from "../services/api";
import "./Dashboard.css";

// Change this if your Django endpoint is different.
const PROJECT_URL = "/studio/projects/";


// Parse Django REST API responses.
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

  // LOAD ALL PROJECTS
  const loadData = useCallback(async () => {
    try {
      setError("");

      const res = await getProjects();

      // Supports Django list and paginated responses.
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

  // CREATE NEW PROJECT
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

      await createProject({
        name: projectName,
        prompt: projectPrompt,
        style: "Cinematic realism",
      });

      setName("");
      setPrompt("");

      // Reload projects after successful creation.
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          ▶ CineFlow<span>AI</span>
        </div>

        <div className="header-right">
          <span className="studio-label">
            AI FILM STUDIO
          </span>
        </div>
      </header>

      <main className="dashboard-content">

        {/* WELCOME SECTION */}
        <section className="welcome-section">
          <div>
            <span className="section-tag">
              YOUR CREATIVE WORKSPACE
            </span>

            <h1>
              CineFlowAI <span>Studio</span>
            </h1>

            <p>
              Turn your imagination into cinematic experiences.
              Create and manage your AI film projects.
            </p>
          </div>

          <div className="welcome-icon">🎬</div>
        </section>

        {/* ERROR MESSAGE */}
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

        {/* CREATE PROJECT */}
        <section className="create-section">
          <div className="section-heading">
            <div>
              <h2>Create New Project</h2>
              <p>Start your next cinematic masterpiece.</p>
            </div>

            <span className="ai-badge">
              ✦ AI POWERED
            </span>
          </div>

          <form
            onSubmit={handleCreate}
            className="project-form"
          >
            {/* PROJECT TITLE */}
            <div className="form-group">
              <label htmlFor="project-name">
                Project Title
              </label>

              <input
                id="project-name"
                type="text"
                placeholder="Enter your film title..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={150}
                disabled={creating}
                required
              />
            </div>

            {/* FILM PROMPT */}
            <div className="form-group">
              <label htmlFor="film-prompt">
                Describe Your Film
              </label>

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

            {/* FORM FOOTER */}
            <div className="form-bottom">
              <span className="style-label">
                🎥 Style: Cinematic Realism
              </span>

              <button
                type="submit"
                className="create-button"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "✦ Create Project"}
              </button>
            </div>
          </form>
        </section>

        {/* PROJECT LIST */}
        <section className="projects-section">
          <div className="section-heading">
            <div>
              <h2>My Projects</h2>
              <p>Manage your cinematic creations.</p>
            </div>

            <span className="project-count">
              {projects.length} Projects
            </span>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="empty-state" role="status">
              Loading your projects...
            </div>

          ) : projects.length === 0 ? (

            /* EMPTY STATE */
            <div className="empty-state">
              <div className="empty-icon">🎬</div>

              <h3>No Projects Yet</h3>

              <p>
                Your creative journey starts here.
                Create your first AI film project.
              </p>
            </div>

          ) : (

            /* PROJECT CARDS */
            <div className="project-grid">
              {projects.map((project) => {
                const status = String(
                  project.status || "pending"
                ).toLowerCase();

                return (
                  <article
                    className="project-card"
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="project-card-top">
                      <span className="project-icon">
                        🎞
                      </span>

                      <span
                        className={`status-badge ${status}`}
                      >
                        {project.status || "Pending"}
                      </span>
                    </div>

                    <h3>{project.name}</h3>

                    <p className="project-prompt">
                      {project.prompt}
                    </p>

                    <div className="project-card-footer">
                      <span>
                        {project.style ||
                          "Cinematic realism"}
                      </span>

                      <span>#{project.id}</span>
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
