import React, { useState, useEffect } from 'react';
import { Monitor, Sparkles, FileText, Palette, Download, Loader, Settings, Eye, AlertCircle, CheckCircle, Edit3, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './styles.css';

function App() {
  // **STATE MANAGEMENT**
  const [formData, setFormData] = useState({
    topic: '',
    slideCount: 5,
    theme: 'professional',
    moreInfoMode: false
  });
  
  const [slides, setSlides] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [themes, setThemes] = useState([]);
  
  // **EDITING STATES**
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editingSlide, setEditingSlide] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // **DEFAULT THEME DEFINITIONS**
  const defaultThemes = [
    {
      id: 'professional',
      name: 'Glass Blue',
      colors: ['#00D4FF', '#0099CC']
    },
    {
      id: 'creative',
      name: 'Neon Coral',
      colors: ['#FF6B6B', '#FF8E8E']
    },
    {
      id: 'dark',
      name: 'Mint Glass',
      colors: ['#4ECDC4', '#44B3AC']
    },
    {
      id: 'elegant',
      name: 'Purple Haze',
      colors: ['#A855F7', '#9333EA']
    }
  ];

  // **LOAD THEMES ON MOUNT**
  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/themes');
      if (response.ok) {
        const data = await response.json();
        if (data && data.themes && Array.isArray(data.themes)) {
          const safeThemes = data.themes.map(theme => ({
            id: theme.id || 'professional',
            name: theme.name || 'Unknown Theme',
            colors: getThemeColors(theme)
          }));
          setThemes(safeThemes);
        } else {
          setThemes(defaultThemes);
        }
      } else {
        setThemes(defaultThemes);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      setThemes(defaultThemes);
    }
  };

  const getThemeColors = (theme) => {
    if (theme.colors && Array.isArray(theme.colors)) {
      return theme.colors;
    }
    
    if (theme.colors && typeof theme.colors === 'object') {
      const colorValues = Object.values(theme.colors).filter(color => 
        typeof color === 'string' && color.startsWith('#')
      );
      if (colorValues.length >= 2) {
        return colorValues.slice(0, 2);
      }
    }
    
    const primary = theme.title || theme.primary || theme.accent || '#00D4FF';
    const secondary = theme.accent || theme.secondary || theme.text || '#0099CC';
    
    return [primary, secondary];
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    clearMessages();
  };

  // **SLIDE NAVIGATION**
  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      cancelEdit();
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      cancelEdit();
    }
  };

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
    cancelEdit();
  };

  // **ENHANCED EDITING FUNCTIONS**
  const startEdit = (slideIndex) => {
    const slide = slides[slideIndex];
    if (slide) {
      setEditingSlide(slideIndex);
      
      if (slide.slideType === 'title') {
        // **TITLE SLIDE EDITING**
        setEditTitle(slide.title || formData.topic);
        setEditContent(slide.subtitle || "AI-Generated Presentation");
      } else {
        // **CONTENT SLIDE EDITING**
        setEditTitle(slide.title || '');
        setEditContent(Array.isArray(slide.content) ? slide.content.join('\n\n') : '');
      }
    }
  };

  const saveEdit = () => {
    if (editingSlide !== null) {
      const updatedSlides = [...slides];
      const currentSlide = updatedSlides[editingSlide];
      
      if (currentSlide.slideType === 'title') {
        // **SAVE TITLE SLIDE CHANGES**
        updatedSlides[editingSlide] = {
          ...updatedSlides[editingSlide],
          title: editTitle.trim() || formData.topic,
          subtitle: editContent.trim() || "AI-Generated Presentation"
        };
        
        // **UPDATE FORM DATA TOPIC IF TITLE CHANGED**
        if (editTitle.trim() && editTitle.trim() !== formData.topic) {
          setFormData(prev => ({
            ...prev,
            topic: editTitle.trim()
          }));
        }
        
        setSuccess('✏️ Title slide updated successfully!');
      } else {
        // **SAVE CONTENT SLIDE CHANGES**
        updatedSlides[editingSlide] = {
          ...updatedSlides[editingSlide],
          title: editTitle,
          content: editContent.split('\n\n').filter(line => line.trim())
        };
        
        setSuccess('✏️ Slide updated successfully!');
      }
      
      setSlides(updatedSlides);
      setTimeout(() => setSuccess(''), 3000);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingSlide(null);
    setEditTitle('');
    setEditContent('');
  };

  // **GENERATE PRESENTATION**
  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic for your presentation');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setSlides([]);
    setDownloadUrl('');
    setCurrentSlideIndex(0);

    try {
      console.log('🚀 Generating presentation...', formData);

      const response = await fetch('http://localhost:5000/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic.trim(),
          slideCount: parseInt(formData.slideCount),
          theme: formData.theme,
          moreInfoMode: formData.moreInfoMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Generation successful:', result);

      if (result.success) {
        const slidesData = result.presentation?.slides || result.slides || [];
        setSlides(Array.isArray(slidesData) ? slidesData : []);
        
        if (result.presentation?.downloadUrl || result.downloadUrl) {
          setDownloadUrl(`http://localhost:5000${result.presentation?.downloadUrl || result.downloadUrl}`);
        }
        
        const slideCount = slidesData.length;
        const titleStrategy = result.titleStrategy?.used || 'standard';
        setSuccess(`🎉 Generated ${slideCount} slides with ${titleStrategy} titles successfully!`);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('❌ Generation failed:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('❌ Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else {
        setError(`❌ ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // **REGENERATE WITH EDITS**
  const regenerateWithEdits = async () => {
    if (slides.length === 0) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/regenerate-with-edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slides,
          theme: formData.theme,
          topic: formData.topic,
          topicSummary: { 
            summary: `Updated presentation for ${formData.topic}` 
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setDownloadUrl(`http://localhost:5000${data.downloadUrl}`);
        setSuccess('✅ Presentation updated with your edits!');
      } else {
        setError('❌ Failed to update presentation');
      }
    } catch (error) {
      console.error('❌ Regeneration failed:', error);
      setError('❌ Failed to update presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) {
      setError('❌ No presentation available for download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${formData.topic.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('📥 Download started successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('❌ Failed to download presentation');
    }
  };

  const getCurrentTheme = () => {
    const themesToUse = themes.length > 0 ? themes : defaultThemes;
    return themesToUse.find(t => t.id === formData.theme) || themesToUse[0];
  };

  const selectedThemeData = getCurrentTheme();
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="app">
      {/* **MESSAGES** */}
      {error && (
        <div className="message-banner error-banner">
          <AlertCircle className="message-icon" />
          <span>{error}</span>
          <button onClick={clearMessages} className="close-message">×</button>
        </div>
      )}

      {success && (
        <div className="message-banner success-banner">
          <CheckCircle className="message-icon" />
          <span>{success}</span>
          <button onClick={clearMessages} className="close-message">×</button>
        </div>
      )}

      {/* **HEADER** */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Monitor className="icon" />
            </div>
            <h1 className="logo-text">Slide-0-Matic</h1>
          </div>
          <p className="subtitle">
            Talk less-present more
          </p>
        </div>
      </header>

      {/* **MAIN CONTENT** */}
      <main className="main-content">
        {/* **INPUT SECTION** */}
        <div className="input-section">
          <div className="input-container">
            <div className="search-icon">
              <Sparkles className="icon" />
            </div>
            <input
              type="text"
              placeholder="Enter your topic(s) separated by commas..."
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              className="topic-input"
              disabled={isGenerating}
            />
            <button 
              className="generate-btn"
              onClick={handleGenerate}
              disabled={!formData.topic.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader className="btn-icon spinning" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="btn-icon" />
                  Generate
                </>
              )}
            </button>
          </div>
          
          {/* **CONTROLS ROW** */}
          <div className="controls-row">
            <div className="control-group">
              <label htmlFor="slideCount" className="control-label">
                📊 Slides: {formData.slideCount}
              </label>
              <input
                type="range"
                id="slideCount"
                min="3"
                max="20"
                value={formData.slideCount}
                onChange={(e) => handleInputChange('slideCount', parseInt(e.target.value))}
                className="slide-range"
                disabled={isGenerating}
              />
              <div className="range-labels">
                <span>3</span>
                <span className="range-current">
                  {formData.slideCount <= 10 ? 'Dynamic Titles' : 'Structured Titles'}
                </span>
                <span>20</span>
              </div>
            </div>

            <div className="control-group">
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  checked={formData.moreInfoMode}
                  onChange={(e) => handleInputChange('moreInfoMode', e.target.checked)}
                  disabled={isGenerating}
                />
                <span className="checkbox-label">
                  <Settings className="checkbox-icon" />
                  Detailed Mode (5 points/slide)
                </span>
              </label>
            </div>
          </div>

          <div className="input-tip">
            💡 Tip: Add multiple subtopics separated by commas for more slides (max 20)
          </div>
        </div>

        {/* **CONTENT GRID** */}
        <div className="content-grid">
          {/* **SLIDE PREVIEW WITH EDITING** */}
          <div className="preview-section">
            <div className="section-header">
              <Eye className="section-icon" />
              <h3>Cover Slide Preview</h3>
              {slides.length > 0 && (
                <span className="slide-count">{slides.length} slides</span>
              )}
            </div>

            {slides.length > 0 ? (
              <div className="slides-viewer">
                {/* **SLIDE NAVIGATION** */}
                <div className="slide-navigation">
                  <button 
                    className="nav-btn"
                    onClick={prevSlide}
                    disabled={currentSlideIndex === 0}
                  >
                    <ChevronLeft className="nav-icon" />
                  </button>
                  
                  <div className="slide-indicator">
                    <span className="current-slide">{currentSlideIndex + 1}</span>
                    <span className="slide-separator">/</span>
                    <span className="total-slides">{slides.length}</span>
                  </div>
                  
                  <button 
                    className="nav-btn"
                    onClick={nextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    <ChevronRight className="nav-icon" />
                  </button>
                </div>

                {/* **CURRENT SLIDE DISPLAY** */}
                <div className="slide-display">
                  {editingSlide === currentSlideIndex ? (
                    /* **EDITING MODE** */
                    <div className="slide-editor">
                      <div className="editor-header">
                        <h4>✏️ Editing {currentSlide?.slideType === 'title' ? 'Title Slide' : `Slide ${currentSlideIndex + 1}`}</h4>
                        <div className="editor-actions">
                          <button className="save-btn" onClick={saveEdit}>
                            <Save className="btn-icon" />
                            Save
                          </button>
                          <button className="cancel-btn" onClick={cancelEdit}>
                            <X className="btn-icon" />
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      <div className="editor-content">
                        {currentSlide?.slideType === 'title' ? (
                          /* **TITLE SLIDE EDITOR** */
                          <>
                            <div className="input-group">
                              <label>Presentation Title:</label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="title-input"
                                placeholder="Enter presentation title..."
                              />
                            </div>
                            
                            <div className="input-group">
                              <label>Subtitle (optional):</label>
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="title-input"
                                placeholder="Enter presentation subtitle..."
                              />
                            </div>
                            
                            <div className="title-editor-note">
                              <div className="note-icon">💡</div>
                              <div className="note-text">
                                <p><strong>Note:</strong> Changing the title will update your presentation topic. This won't regenerate the content slides automatically.</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* **CONTENT SLIDE EDITOR** */
                          <>
                            <div className="input-group">
                              <label>Slide Title:</label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="title-input"
                                placeholder="Enter slide title..."
                              />
                            </div>
                            
                            <div className="input-group">
                              <label>Content (separate points with double line breaks):</label>
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="content-textarea"
                                placeholder="Enter slide content... (separate bullet points with double line breaks)"
                                rows={8}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* **DISPLAY MODE** */
                    <div className="slide-content">
                      {currentSlide?.slideType === 'title' ? (
                        /* **TITLE SLIDE WITH EDIT BUTTON** */
                        <div className="title-slide">
                          <div className="title-slide-header">
                            <button 
                              className="edit-btn title-edit-btn"
                              onClick={() => startEdit(currentSlideIndex)}
                              title="Edit title slide"
                            >
                              <Edit3 className="btn-icon" />
                              Edit Title
                            </button>
                          </div>
                          <h2 className="slide-title">{currentSlide.title}</h2>
                          <p className="slide-subtitle">
                            {currentSlide.subtitle || "AI-Generated Presentation"}
                          </p>
                        </div>
                      ) : (
                        /* **CONTENT SLIDE** */
                        <div className="content-slide">
                          <div className="slide-header">
                            <h3 className="content-slide-title">{currentSlide?.title || `Slide ${currentSlideIndex + 1}`}</h3>
                            <button 
                              className="edit-btn"
                              onClick={() => startEdit(currentSlideIndex)}
                              title="Edit this slide"
                            >
                              <Edit3 className="btn-icon" />
                              Edit
                            </button>
                          </div>
                          
                          <div className="slide-bullets">
                            {currentSlide?.content && Array.isArray(currentSlide.content) ? (
                              currentSlide.content.map((bullet, index) => (
                                <div key={index} className="bullet-point">
                                  • {bullet}
                                </div>
                              ))
                            ) : (
                              <div className="no-content">No content available</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* **SLIDE THUMBNAILS** */}
                <div className="slide-thumbnails">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    >
                      <div className="thumbnail-number">{index + 1}</div>
                      <div className="thumbnail-title">
                        {slide.slideType === 'title' ? 'Title' : slide.title?.substring(0, 20) || `Slide ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* **DOWNLOAD SECTION - ALWAYS VISIBLE** */}
                <div className="download-section">
                  {downloadUrl ? (
                    /* **DOWNLOAD READY** */
                    <div className="download-ready">
                      <button onClick={handleDownload} className="download-btn primary">
                        <Download className="btn-icon" />
                        Download PowerPoint
                      </button>
                      <button onClick={regenerateWithEdits} className="update-btn" disabled={isGenerating}>
                        <Sparkles className="btn-icon" />
                        {isGenerating ? 'Updating...' : 'Update PPT with Edits'}
                      </button>
                    </div>
                  ) : (
                    /* **GENERATE DOWNLOAD** */
                    <div className="download-pending">
                      <div className="download-info">
                        <FileText className="info-icon" />
                        <div className="info-text">
                          <h4>PowerPoint Ready to Generate</h4>
                          <p>Click below to create your downloadable presentation</p>
                        </div>
                      </div>
                      <button onClick={regenerateWithEdits} className="generate-download-btn" disabled={isGenerating}>
                        <Download className="btn-icon" />
                        {isGenerating ? 'Creating PowerPoint...' : 'Create PowerPoint File'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* **EMPTY STATE** */
              <div className="preview-card">
                <div className="empty-preview">
                  <FileText className="empty-icon" />
                  <p>Generate slides to see preview</p>
                </div>
              </div>
            )}
          </div>

          {/* **RIGHT COLUMN** */}
          <div className="right-column">
            {/* **STATUS INFO** */}
            <div className="status-card">
              {slides.length > 0 ? (
                <div className="status-content success">
                  <FileText className="status-icon" />
                  <div className="status-text">
                    <h4>Presentation Ready!</h4>
                    <p>{slides.length} slides generated successfully</p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="status-content generating">
                  <Loader className="status-icon spinning" />
                  <div className="status-text">
                    <h4>Generating...</h4>
                    <p>Creating {formData.slideCount} slides with AI</p>
                  </div>
                </div>
              ) : (
                <div className="status-content empty">
                  <FileText className="status-icon" />
                  <div className="status-text">
                    <h4>No presentation generated yet</h4>
                    <p>Enter a topic to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* **THEME SELECTION** */}
            <div className="theme-section">
              <div className="section-header">
                <Palette className="section-icon" />
                <h3>Choose Theme</h3>
              </div>
              <div className="theme-grid">
                {(themes.length > 0 ? themes : defaultThemes).map((theme) => {
                  const themeColors = theme.colors && Array.isArray(theme.colors) && theme.colors.length >= 2 
                    ? theme.colors 
                    : ['#00D4FF', '#0099CC'];

                  return (
                    <div
                      key={theme.id || 'unknown'}
                      className={`theme-card ${formData.theme === theme.id ? 'selected' : ''}`}
                      onClick={() => !isGenerating && handleInputChange('theme', theme.id)}
                    >
                      <div className="theme-preview">
                        <div className="theme-colors">
                          {themeColors.slice(0, 2).map((color, index) => (
                            <div
                              key={index}
                              className="color-dot"
                              style={{ backgroundColor: color || '#00D4FF' }}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="theme-name">{theme.name || 'Unknown Theme'}</span>
                      {formData.theme === theme.id && (
                        <div className="selected-indicator">
                          <div className="checkmark">✓</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* **LOADING OVERLAY** */}
      {isGenerating && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner">
              <Sparkles className="spinner-icon" />
            </div>
            <h3>Generating your presentation...</h3>
            <p>Creating {formData.slideCount} slides with {formData.slideCount <= 10 ? 'dynamic' : 'structured'} titles</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
