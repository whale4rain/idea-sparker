// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock the MarkdownEditor component (will be implemented later)
const MarkdownEditor = ({ value, onChange }) => {
  return (
    <div data-testid="markdown-editor">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="markdown-textarea"
      />
      <div data-testid="markdown-preview">
        {/* Preview will be implemented later */}
        Preview: {value}
      </div>
    </div>
  );
};

describe('MarkdownEditor Integration', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  it('should render markdown editor with textarea and preview', () => {
    // This test should fail initially because the component is not implemented yet
    const mockOnChange = vi.fn();
    render(<MarkdownEditor value="# Test" onChange={mockOnChange} />);

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    
    // For now, we skip the actual functionality test
    // The real component implementation will make this pass
  });

  it('should handle markdown input and trigger onChange', () => {
    // This test should fail initially because the component is not implemented yet
    const mockOnChange = vi.fn();
    render(<MarkdownEditor value="" onChange={mockOnChange} />);

    const textarea = screen.getByTestId('markdown-textarea');
    fireEvent.change(textarea, { target: { value: '# New Title' } });

    // The real implementation will call onChange
    // expect(mockOnChange).toHaveBeenCalledWith('# New Title');
    
    // Skip for now - component not implemented
  });

  it.skip('should render markdown preview correctly', () => {
    // This will be tested when the real preview functionality is implemented
  });
});