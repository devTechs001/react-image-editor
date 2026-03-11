// frontend/src/contexts/ProjectContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { projectAPI } from '@/services/api/projectAPI';
import toast from 'react-hot-toast';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getAll();
      setProjects(data.projects || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = useCallback(async (projectData) => {
    try {
      const project = await projectAPI.create(projectData);
      setProjects(prev => [project, ...prev]);
      setCurrentProject(project);
      toast.success('Project created');
      return project;
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (id, data) => {
    try {
      const project = await projectAPI.update(id, data);
      setProjects(prev => prev.map(p => p.id === id ? project : p));
      if (currentProject?.id === id) {
        setCurrentProject(project);
      }
      toast.success('Project updated');
      return project;
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
      throw err;
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (id) => {
    try {
      await projectAPI.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
      throw err;
    }
  }, [currentProject]);

  const duplicateProject = useCallback(async (id) => {
    try {
      const project = await projectAPI.duplicate(id);
      setProjects(prev => [project, ...prev]);
      toast.success('Project duplicated');
      return project;
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate project');
      throw err;
    }
  }, []);

  const selectProject = useCallback((project) => {
    setCurrentProject(project);
  }, []);

  const searchProjects = useCallback(async (query, filters = {}) => {
    try {
      const data = await projectAPI.search(query, filters);
      return data.projects || [];
    } catch (err) {
      toast.error('Search failed');
      return [];
    }
  }, []);

  const getRecentProjects = useCallback(async (limit = 10) => {
    try {
      const data = await projectAPI.getRecent(limit);
      return data.projects || [];
    } catch (err) {
      return [];
    }
  }, []);

  const value = {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    selectProject,
    searchProjects,
    getRecentProjects,
    refreshProjects: loadProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

export default ProjectContext;
