// frontend/src/pages/Projects.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  FolderOpen,
  Grid,
  List,
  MoreVertical,
  Trash2,
  Copy,
  Edit,
  Download,
  Share2,
  Clock,
  Image,
  Video,
  Music,
  Star,
  Filter,
  SortAsc
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/helpers/cn';
import { formatDistanceToNow } from 'date-fns';

// Mock projects data
const mockProjects = [
  {
    id: 1,
    name: 'Summer Campaign Banner',
    type: 'image',
    thumbnail: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    size: '1920 × 1080',
    starred: true
  },
  {
    id: 2,
    name: 'Product Showcase Video',
    type: 'video',
    thumbnail: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    size: '1920 × 1080',
    starred: false
  },
  {
    id: 3,
    name: 'Podcast Episode 12',
    type: 'audio',
    thumbnail: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    size: '45:32',
    starred: true
  },
  {
    id: 4,
    name: 'Social Media Kit',
    type: 'image',
    thumbnail: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    size: '1080 × 1080',
    starred: false
  }
];

const typeIcons = {
  image: Image,
  video: Video,
  audio: Music
};

const sortOptions = [
  { id: 'updatedAt', label: 'Last Modified' },
  { id: 'createdAt', label: 'Date Created' },
  { id: 'name', label: 'Name' }
];

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [filterType, setFilterType] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(p => p.type === filterType);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b[sortBy]) - new Date(a[sortBy]);
    });

    return result;
  }, [projects, searchQuery, sortBy, filterType]);

  const handleProjectClick = (project) => {
    const routes = {
      image: '/editor',
      video: '/video-editor',
      audio: '/audio-editor'
    };
    navigate(`${routes[project.type]}/${project.id}`);
  };

  const handleContextMenu = (e, project) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      project
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const toggleStar = (id) => {
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p)
    );
  };

  const duplicateProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now(),
      name: `${project.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects(prev => [newProject, ...prev]);
    closeContextMenu();
  };

  const deleteProject = () => {
    if (selectedProject) {
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setShowDeleteModal(false);
      setSelectedProject(null);
    }
  };

  return (
    <div className="min-h-screen" onClick={closeContextMenu}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-surface-400">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        
        <Button variant="primary" onClick={() => navigate('/editor')} icon={Plus}>
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-editor-card border border-editor-border">
            {[
              { id: 'all', label: 'All' },
              { id: 'image', label: 'Images', icon: Image },
              { id: 'video', label: 'Videos', icon: Video },
              { id: 'audio', label: 'Audio', icon: Music }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                  filterType === type.id
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-surface-400 hover:text-white'
                )}
              >
                {type.icon && <type.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-editor-card border border-editor-border text-sm text-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-editor-card border border-editor-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'grid' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-white'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'list' ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const TypeIcon = typeIcons[project.type];

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleProjectClick(project)}
                  onContextMenu={(e) => handleContextMenu(e, project)}
                  className={cn(
                    'group relative rounded-2xl overflow-hidden cursor-pointer',
                    'bg-editor-card border border-editor-border',
                    'hover:border-primary-500/50 transition-all hover:shadow-glow',
                    viewMode === 'list' && 'flex items-center gap-4'
                  )}
                >
                  {/* Thumbnail */}
                  <div className={cn(
                    'relative bg-surface-800',
                    viewMode === 'grid' ? 'aspect-video' : 'w-32 h-20 flex-shrink-0'
                  )}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TypeIcon className="w-10 h-10 text-surface-600" />
                    </div>
                    
                    {/* Star Badge */}
                    {project.starred && (
                      <div className="absolute top-2 left-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={cn(
                    viewMode === 'grid' ? 'p-4' : 'flex-1 py-3'
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white truncate group-hover:text-primary-300 transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                          </span>
                          <span>•</span>
                          <span>{project.size}</span>
                        </div>
                      </div>

                      {/* More Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, project);
                        }}
                        className="p-1.5 rounded-lg text-surface-500 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-surface-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Create your first project to get started'
            }
          </p>
          <Button variant="primary" onClick={() => navigate('/editor')} icon={Plus}>
            Create Project
          </Button>
        </div>
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 w-48 py-1 rounded-xl bg-editor-card border border-editor-border shadow-elevated overflow-hidden"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                onClick={() => {
                  handleProjectClick(contextMenu.project);
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <Edit className="w-4 h-4" />
                Open
              </button>
              <button
                onClick={() => {
                  toggleStar(contextMenu.project.id);
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <Star className="w-4 h-4" />
                {contextMenu.project.starred ? 'Unstar' : 'Star'}
              </button>
              <button
                onClick={() => duplicateProject(contextMenu.project)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-white/5 hover:text-white"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <div className="h-px bg-editor-border my-1" />
              <button
                onClick={() => {
                  setSelectedProject(contextMenu.project);
                  setShowDeleteModal(true);
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteProject}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-surface-300">
          Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}