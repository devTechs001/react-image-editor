// frontend/src/components/tools/ToolManager.jsx
import React, { useCallback } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import toast from 'react-hot-toast';

// Import core tool components that exist
import PencilTool from './PencilTool';
import BrushTool from './BrushTool';
import EraserTool from './EraserTool';
import FillTool from './FillTool';
import EyeDropper from './EyeDropper';
import TextTool from './TextTool';
import ShapeTool from './ShapeTool';
import LineTool from './LineTool';
import CropTool from './CropTool';
import RotateTool from './RotateTool';
import MagicWand from './MagicWand';
import LassoTool from './LassoTool';
import CloneTool from './CloneTool';
import HealingBrush from './HealingBrush';
import BlurTool from './BlurTool';
import SharpenTool from './SharpenTool';
import SmudgeTool from './SmudgeTool';
import DodgeBurnTool from './DodgeBurnTool';
import GradientTool from './GradientTool';
import SelectionTool from './SelectionTool';
import ArrowTool from './ArrowTool';
import AnnotationTool from './AnnotationTool';
import MeasureTool from './MeasureTool';

// Tool configuration mapping
const TOOL_COMPONENTS = {
  pencil: { component: PencilTool, cursor: 'crosshair' },
  brush: { component: BrushTool, cursor: 'crosshair' },
  eraser: { component: EraserTool, cursor: 'cell' },
  fill: { component: FillTool, cursor: 'pointer' },
  eyedropper: { component: EyeDropper, cursor: 'copy' },
  text: { component: TextTool, cursor: 'text' },
  shape: { component: ShapeTool, cursor: 'crosshair' },
  line: { component: LineTool, cursor: 'crosshair' },
  crop: { component: CropTool, cursor: 'default' },
  rotate: { component: RotateTool, cursor: 'grab' },
  magicwand: { component: MagicWand, cursor: 'pointer' },
  lasso: { component: LassoTool, cursor: 'crosshair' },
  clone: { component: CloneTool, cursor: 'copy' },
  healingbrush: { component: HealingBrush, cursor: 'crosshair' },
  blur: { component: BlurTool, cursor: 'crosshair' },
  sharpen: { component: SharpenTool, cursor: 'crosshair' },
  smudge: { component: SmudgeTool, cursor: 'crosshair' },
  dodgeburn: { component: DodgeBurnTool, cursor: 'crosshair' },
  gradient: { component: GradientTool, cursor: 'crosshair' },
  selection: { component: SelectionTool, cursor: 'default' },
  arrow: { component: ArrowTool, cursor: 'pointer' },
  annotation: { component: AnnotationTool, cursor: 'text' },
  measure: { component: MeasureTool, cursor: 'crosshair' }
};

export default function ToolManager({ activeTool, canvasRef }) {
  const { setActiveTool, toolOptions, setToolOptions } = useEditor();

  // Get the active tool component
  const ActiveToolComponent = activeTool ? TOOL_COMPONENTS[activeTool]?.component : null;

  // Handle tool completion
  const handleToolComplete = useCallback((result) => {
    toast.success(`${activeTool} tool completed!`);
    // Return to select tool after operation
    setActiveTool('select');
  }, [activeTool, setActiveTool]);

  // Handle tool cancel
  const handleToolCancel = useCallback(() => {
    setActiveTool('select');
  }, [setActiveTool]);

  // Update tool options
  const updateToolOptions = useCallback((options) => {
    setToolOptions(prev => ({ ...prev, ...options }));
  }, [setToolOptions]);

  // If no active tool or tool not found, render nothing
  if (!activeTool || !ActiveToolComponent) {
    return null;
  }

  return (
    <ActiveToolComponent
      canvasRef={canvasRef}
      onComplete={handleToolComplete}
      onCancel={handleToolCancel}
      onOptionsChange={updateToolOptions}
      options={toolOptions}
    />
  );
}
