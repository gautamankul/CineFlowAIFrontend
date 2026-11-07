import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from "../services/api";
import './ProjectDetail.css';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch project details wrapped in useCallback
    const fetchProject = useCallback(async () => {
        try {
            setError('');
            const res = await apiFetch(`/studio/projects/${id}/`, {
                method: "GET",
            });

            // Handles both Axios-style { data: {...} } and direct JSON fetch returns
            const data = res?.data !== undefined ? res.data : res;

            if (data && (data.id || data.name)) {
                setProject(data);
            } else {
                setProject(null);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load project.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id, fetchProject]);

    // Trigger Celery Storyboard Task
    const handleGenerateStoryboard = async () => {
        try {
            setActionLoading(true);
            setError('');

            // Consistently use apiFetch with POST method and correct path prefix
            await apiFetch(`/studio/projects/${id}/generate_storyboard/`, {
                method: "POST",
            });

            // Optimistically update UI status
            setProject((prev) => (prev ? { ...prev, status: 'generating' } : prev));

            // Poll to refresh project after task queues
            setTimeout(() => {
                fetchProject();
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to trigger storyboard generation.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="project-detail-container">
                <div className="detail-loading">Loading project details...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="project-detail-container">
                <div className="detail-error">Project not found.</div>
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="project-detail-container">
            {/* Top Bar */}
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Dashboard
                </button>
                <span className={`status-badge ${(project.status || 'draft').toLowerCase()}`}>
                    {project.status || 'Draft'}
                </span>
            </header>

            {error && <div className="detail-error-banner">⚠ {error}</div>}

            {/* Main Info Hero */}
            <section className="detail-hero">
                <div className="hero-meta">
                    <span className="detail-tag">PROJECT WORKSPACE</span>
                    <h1>{project.name}</h1>
                    <div className="spec-row">
                        <span>🎥 Style: <strong>{project.style || 'Cinematic realism'}</strong></span>
                        <span>📐 Aspect: <strong>{project.aspect_ratio || '16:9'}</strong></span>
                        <span>🕒 Created: {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

                {/* Action Button for Draft State */}
                {project.status === 'draft' && (
                    <div className="draft-action-box">
                        <p>Your project is currently in <strong>Draft</strong> mode. Ready to turn your story prompt into scene shots?</p>
                        <button
                            className="generate-btn"
                            onClick={handleGenerateStoryboard}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Queueing Generation...' : '✦ Generate AI Storyboard'}
                        </button>
                    </div>
                )}
            </section>

            {/* Prompt Card */}
            <section className="detail-card">
                <h3>Film Prompt</h3>
                <p className="prompt-text">{project.prompt}</p>
            </section>

            {/* Scenes Section */}
            <section className="detail-card">
                <div className="scenes-header">
                    <h3>Storyboard Scenes ({project.scenes?.length || 0})</h3>
                    {project.status === 'storyboard_ready' && (
                        <button
                            className="secondary-action-btn"
                            onClick={handleGenerateStoryboard}
                            disabled={actionLoading}
                        >
                            Regenerate Storyboard
                        </button>
                    )}
                </div>

                {(!project.scenes || project.scenes.length === 0) ? (
                    <div className="scenes-empty">
                        <span className="empty-scene-icon">🎬</span>
                        <p>No scenes generated yet. Click "Generate AI Storyboard" to split your prompt into camera scenes.</p>
                    </div>
                ) : (
                    <div className="scenes-list">
                        {project.scenes.map((scene) => (
                            <div key={scene.id} className="scene-row">
                                <div className="scene-number">Scene {scene.scene_number}</div>
                                <div className="scene-content">
                                    <h4>{scene.title}</h4>
                                    <p>{scene.description}</p>
                                    <div className="scene-prompts">
                                        <small><strong>Visual:</strong> {scene.image_prompt}</small>
                                        <small><strong>Camera:</strong> {scene.video_prompt}</small>
                                    </div>
                                </div>
                                <div className="scene-actions">
                                    <span className={`status-badge ${(scene.status || 'pending').toLowerCase()}`}>
                                        {scene.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}