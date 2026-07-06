import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiOutlineCodeBracket, HiOutlineDocumentArrowUp, HiOutlinePlus, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

import CodeEditor from '../components/code/CodeEditor';
import FileUploader from '../components/code/FileUploader';
import LanguageSelector from '../components/code/LanguageSelector';
import { listProjectsAPI, createProjectAPI, submitSnippetAPI, uploadFilesAPI } from '../api/analysis';

export default function NewReviewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'

  // Code state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');

  // File state
  const [files, setFiles] = useState([]);

  // Project state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Query: Fetch projects
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await listProjectsAPI();
      return response.data.projects;
    },
  });

  // Mutation: Create a project
  const createProjectMutation = useMutation({
    mutationFn: async (name) => {
      const response = await createProjectAPI(name);
      return response.data.project;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries(['projects']);
      setSelectedProjectId(newProject.id);
      setIsCreatingProject(false);
      setNewProjectName('');
      toast.success('Project created successfully!');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error?.message || 'Failed to create project.';
      toast.error(errorMsg);
    },
  });

  // Mutation: Submit snippet review
  const submitSnippetMutation = useMutation({
    mutationFn: async () => {
      return await submitSnippetAPI(code, language, selectedProjectId);
    },
    onSuccess: (response) => {
      toast.success('Code review completed successfully!');
      // Invalidate queries so dashboard reflects the new review
      queryClient.invalidateQueries(['reviews']);
      navigate('/dashboard');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error?.message || 'Failed to complete code review.';
      toast.error(errorMsg);
    },
  });

  // Mutation: Submit files review
  const submitFilesMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('projectId', selectedProjectId);
      files.forEach((file) => {
        formData.append('files', file);
      });
      return await uploadFilesAPI(formData);
    },
    onSuccess: (response) => {
      toast.success('Files code review completed successfully!');
      queryClient.invalidateQueries(['reviews']);
      navigate('/dashboard');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error?.message || 'Failed to complete code review.';
      toast.error(errorMsg);
    },
  });

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    createProjectMutation.mutate(newProjectName);
  };

  const handleStartReview = () => {
    if (!selectedProjectId) {
      toast.error('Please select or create a project first.');
      return;
    }

    if (activeTab === 'paste') {
      if (!code.trim()) {
        toast.error('Please paste some code to review.');
        return;
      }
      submitSnippetMutation.mutate();
    } else {
      if (files.length === 0) {
        toast.error('Please select at least one file to upload.');
        return;
      }
      submitFilesMutation.mutate();
    }
  };

  const isPending = submitSnippetMutation.isPending || submitFilesMutation.isPending;

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">New Review</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Submit code snippets or source files to analyze them using AI and Static Checkers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Code/File Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Selector */}
          <div className="flex border-b border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab('paste')}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-all duration-200"
              style={{
                borderColor: activeTab === 'paste' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'paste' ? 'var(--color-accent-hover)' : 'var(--color-text-secondary)',
              }}
            >
              <HiOutlineCodeBracket className="w-4 h-4" />
              Paste Code
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-all duration-200"
              style={{
                borderColor: activeTab === 'upload' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'upload' ? 'var(--color-accent-hover)' : 'var(--color-text-secondary)',
              }}
            >
              <HiOutlineDocumentArrowUp className="w-4 h-4" />
              Upload Files
            </button>
          </div>

          {/* Editor/Upload Contents */}
          {activeTab === 'paste' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Code Snippet
                </span>
                <LanguageSelector value={language} onChange={setLanguage} />
              </div>
              <CodeEditor value={code} onChange={setCode} />
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                File Uploads
              </span>
              <FileUploader files={files} onChange={setFiles} />
            </div>
          )}
        </div>

        {/* Right Side: Options & Submit */}
        <div
          className="rounded-2xl border p-6 space-y-6 glass"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Project Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Project Context
            </label>

            {isCreatingProject ? (
              <form onSubmit={handleCreateProjectSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Project name (e.g. Portfolio)"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  style={{ color: 'var(--color-text)' }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="flex-1 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(false)}
                    className="flex-1 py-1.5 bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] text-xs font-bold rounded-lg cursor-pointer hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-2">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isLoadingProjects}
                  className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
                  style={{ color: 'var(--color-text)' }}
                >
                  <option value="">-- Select Project --</option>
                  {projectsData?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsCreatingProject(true)}
                  className="flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent-hover)] hover:text-white text-[var(--color-text-secondary)] rounded-xl text-xs transition-colors duration-200 cursor-pointer"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Create New Project
                </button>
              </div>
            )}
          </div>

          {/* Submission Info & Submit Button */}
          <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
            <div className="text-xs text-[var(--color-text-muted)] space-y-1">
              <div className="flex justify-between">
                <span>Analysis mode</span>
                <span className="font-semibold text-white">Full Review</span>
              </div>
              <div className="flex justify-between">
                <span>Review credits</span>
                <span className="font-semibold text-white">Unlimited</span>
              </div>
            </div>

            <button
              onClick={handleStartReview}
              disabled={isPending || createProjectMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: 'var(--shadow-glow)',
              }}
              onMouseEnter={(e) => {
                if (!isPending) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPending) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                }
              }}
            >
              {isPending ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Code...
                </>
              ) : (
                <>
                  <HiOutlineMagnifyingGlass className="w-5 h-5" />
                  Start Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
