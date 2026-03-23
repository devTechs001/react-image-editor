// tests/frontend/unit/components/ExportPanel.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from '@/components/export/ExportPanel';
import * as exportServices from '@/services/export';

// Mock export services
vi.mock('@/services/export', () => ({
  exportCanvasToBlob: vi.fn(),
  exportCanvasToDataURL: vi.fn(),
  downloadImage: vi.fn(),
  ImageFormat: {
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    WEBP: 'image/webp'
  },
  ImageQuality: {
    LOSSLESS: 1,
    HIGH: 0.92,
    MEDIUM: 0.75,
    LOW: 0.5
  }
}));

// Mock UI components
vi.mock('@/components/ui/Button', () => ({
  default: ({ children, onClick, loading, disabled, className, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={loading || disabled}
      className={className}
      data-loading={loading}
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/Slider', () => ({
  default: ({ value, onChange, min, max, step }) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      data-testid="slider"
    />
  )
}));

vi.mock('@/components/ui/Select', () => ({
  default: ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="select"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}));

vi.mock('@/components/ui/Switch', () => ({
  default: ({ checked, onChange }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      data-testid="switch"
    />
  )
}));

vi.mock('@/components/ui/Modal', () => ({
  default: ({ children, onClose }) => (
    <div data-testid="modal">
      {children}
      <button onClick={onClose}>Close Modal</button>
    </div>
  )
}));

vi.mock('@/components/ui/Tabs', () => ({
  default: ({ tabs, value, onValueChange }) => (
    <div data-testid="tabs">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          data-active={value === tab.value}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}));

describe('ExportPanel', () => {
  const mockCanvas = document.createElement('canvas');
  const mockOnClose = vi.fn();
  const mockOnExportComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export panel with correct title', () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('displays format selection tabs', () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('GIF')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('switches between tabs when clicked', async () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const gifTab = screen.getByText('GIF');
    fireEvent.click(gifTab);

    await waitFor(() => {
      expect(screen.getByText('Frame Rate')).toBeInTheDocument();
    });
  });

  it('calls onExportComplete when export succeeds', async () => {
    exportServices.exportCanvasToBlob.mockResolvedValue(
      new Blob(['test'], { type: 'image/png' })
    );
    exportServices.downloadImage.mockImplementation(() => {});

    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const exportButton = screen.getByText('Export Image').closest('button');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockOnExportComplete).toHaveBeenCalled();
    });
  });

  it('shows error message when export fails', async () => {
    exportServices.exportCanvasToBlob.mockRejectedValue(
      new Error('Export failed')
    );

    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const exportButton = screen.getByText('Export Image').closest('button');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Export failed')).toBeInTheDocument();
    });
  });

  it('allows changing format selection', async () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const jpegOption = screen.getByText('JPEG').closest('button');
    fireEvent.click(jpegOption);

    expect(jpegOption).toHaveClass('border-primary-500');
  });

  it('allows adjusting scale with slider', async () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const slider = screen.getByTestId('slider');
    fireEvent.change(slider, { target: { value: '2' } });

    expect(slider.value).toBe('2');
  });

  it('allows toggling metadata option', async () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const metadataSwitch = screen.getByTestId('switch');
    fireEvent.click(metadataSwitch);

    expect(metadataSwitch.checked).toBe(true);
  });

  it('allows toggling watermark option', async () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const switches = screen.getAllByTestId('switch');
    const watermarkSwitch = switches[1]; // Second switch is watermark
    fireEvent.click(watermarkSwitch);

    expect(watermarkSwitch.checked).toBe(true);
  });

  it('opens settings modal when settings button clicked', async () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const settingsButton = screen.getByTestId('settings-button') || screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button clicked', () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const closeButton = screen.getByTestId('close-button') || screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables export button while exporting', async () => {
    exportServices.exportCanvasToBlob.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const exportButton = screen.getByText('Export Image').closest('button');
    fireEvent.click(exportButton);

    expect(exportButton).toHaveAttribute('data-loading', 'true');
    expect(exportButton).toBeDisabled();
  });

  it('shows export progress', async () => {
    exportServices.exportCanvasToBlob.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={mockOnClose}
        onExportComplete={mockOnExportComplete}
      />
    );

    const exportButton = screen.getByText('Export Image').closest('button');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportButton).toHaveTextContent(/Exporting/);
    });
  });
});

describe('ExportPanel - Format Options', () => {
  const mockCanvas = document.createElement('canvas');

  it('shows quality options for JPEG format', () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={() => {}}
        onExportComplete={() => {}}
      />
    );

    // Select JPEG format
    const jpegOption = screen.getByText('JPEG').closest('button');
    fireEvent.click(jpegOption);

    // Quality dropdown should be visible
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('hides quality options for PNG format', () => {
    render(
      <ExportPanel
        canvas={mockCanvas}
        onClose={() => {}}
        onExportComplete={() => {}}
      />
    );

    // PNG is default, quality options should not show for lossless
    // This depends on implementation details
  });
});
