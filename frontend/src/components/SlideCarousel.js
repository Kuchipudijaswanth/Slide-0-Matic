import React from 'react';
import './SlideCarousel.css';

export default function SlideCarousel({ 
  slides, 
  editingSlide, 
  onEditSlide, 
  onSaveEdit, 
  onCancelEdit 
}) {
  if (!slides || slides.length === 0) {
    return <div className="no-slides">No slides to display.</div>;
  }

  return (
    <div className="vertical-slides-container">
      {slides.map((slide, index) => (
        <div key={index} className="slide-card">
          <div className="slide-header">
            <span className="slide-number">{index + 1}</span>
            <span className="slide-type">
              {index === 0 ? 'TITLE' : 
               index === slides.length - 1 ? 'CONCLUSION' : 'CONTENT'}
            </span>
            {slide.editable && editingSlide !== index && (
              <button 
                onClick={() => onEditSlide(index)}
                className="edit-button"
                title="Edit this slide content"
              >
                Edit
              </button>
            )}
          </div>
          
          {editingSlide === index ? (
            <div className="edit-form">
              <div className="edit-input-group">
                <label>Slide Title:</label>
                <input 
                  defaultValue={slide.title}
                  placeholder="Enter slide title"
                  id={`title-${index}`}
                  className="edit-title-input"
                />
              </div>
              <div className="edit-input-group">
                <label>Slide Content (one point per line):</label>
                <textarea 
                  defaultValue={slide.content ? slide.content.join('\n') : ''}
                  placeholder="Enter slide content&#10;One bullet point per line"
                  rows="5"
                  id={`content-${index}`}
                  className="edit-content-textarea"
                />
              </div>
              <div className="edit-buttons">
                <button 
                  onClick={() => {
                    const title = document.getElementById(`title-${index}`).value;
                    const content = document.getElementById(`content-${index}`).value;
                    onSaveEdit(index, title, content);
                  }}
                  className="save-edit-button"
                >
                  Save Changes
                </button>
                <button 
                  onClick={onCancelEdit}
                  className="cancel-edit-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="slide-content">
              <h3 className="slide-title">{slide.title}</h3>
              {slide.content && slide.content.length > 0 ? (
                <ul className="slide-bullets">
                  {slide.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-content">No content for this slide</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
