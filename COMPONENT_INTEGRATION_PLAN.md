# Component Integration Plan

## Critical Fixes - COMPLETED ✅

### 1. ImageCanvas.jsx - FIXED
- **Issue**: Used non-existent `useEditorContext()` hook
- **Fix**: Changed to `useEditor()` and mapped correct context properties
- **Status**: ✅ Fixed

### 2. CanvasControls.jsx - FIXED
- **Issue**: Referenced non-existent properties (`canvas.zoom`, `resetView`, `setUIState`)
- **Fix**: Updated to use correct context properties (`zoom`, `setZoom`, `setUI`, `setShowGrid`)
- **Status**: ✅ Fixed

---

## Integration Priority Levels

### PRIORITY 1: Core Editing Tools (Week 1)
These are essential for basic image editing functionality.

#### 1.1 Tool Components Integration
**Files to integrate:** 23 components in `/components/tools/`

**Integration Steps:**
1. Update Toolbar.jsx to import and render tool components
2. Connect tools to EditorContext's `activeTool` state
3. Implement tool-specific canvas operations

**Components:**
- ✅ SelectionTool - Already referenced in Toolbar
- ✅ PencilTool - Add to Toolbar
- ✅ BrushTool - Add to Toolbar  
- ✅ EraserTool - Add to Toolbar
- ✅ FillTool - Add to Toolbar
- ✅ EyeDropper - Add to Toolbar
- ✅ TextTool - Add to Toolbar
- ✅ ShapeTool - Add to Toolbar
- ✅ LineTool - Add to Toolbar
- ✅ CropTool - Add to Toolbar
- ✅ RotateTool - Add to Toolbar
- ✅ MagicWand - Add to Toolbar
- ✅ LassoTool - Add to Toolbar
- ✅ CloneTool - Add to Toolbar
- ✅ HealingBrush - Add to Toolbar
- ✅ BlurTool - Add to Toolbar
- ✅ SharpenTool - Add to Toolbar
- ✅ SmudgeTool - Add to Toolbar
- ✅ DodgeBurnTool - Add to Toolbar
- ✅ GradientTool - Add to Toolbar
- ✅ SelectionTool - Add to Toolbar
- ✅ ArrowTool - Add to Toolbar
- ✅ AnnotationTool - Add to Toolbar
- ✅ MeasureTool - Add to Toolbar

**Action Items:**
- [ ] Create `ToolManager.jsx` component to handle tool switching
- [ ] Update Toolbar to use tool components
- [ ] Connect each tool to canvas operations
- [ ] Add tool options panel in RightPanel

---

### PRIORITY 2: Filter System (Week 2)
Enhance the filtering capabilities with the orphaned filter components.

#### 2.1 Filter Components Integration
**Files to integrate:** 16 components in `/components/filters/`

**Integration Steps:**
1. Update FilterPanel.jsx to import filter components
2. Connect filters to EditorContext's `adjustments` and `activeFilter` state
3. Add filter preview and intensity controls

**Components:**
- [ ] Blur - Integrate into FilterPanel
- [ ] Sharpen - Integrate into FilterPanel
- [ ] Noise - Integrate into FilterPanel
- [ ] Vintage - Integrate into FilterPanel
- [ ] Pixelate - Integrate into FilterPanel
- [ ] Glitch - Integrate into FilterPanel
- [ ] ColorBalance - Integrate into Adjustments panel
- [ ] ColorGrading - Integrate into Adjustments panel
- [ ] HSL - Integrate into Adjustments panel
- [ ] Levels - Integrate into Adjustments panel
- [ ] Curves - Integrate into Adjustments panel
- [ ] Distortion - Integrate into FilterPanel
- [ ] Effects - Integrate into FilterPanel
- [ ] FilterComposer - Create advanced filter editor
- [ ] FilterPreview - Add preview functionality
- [ ] Presets - Add to PresetsPanel

**Action Items:**
- [ ] Create `FilterGallery.jsx` component
- [ ] Update Adjustments.jsx to include all filter types
- [ ] Add before/after preview for filters
- [ ] Implement filter intensity sliders

---

### PRIORITY 3: Layer System Enhancement (Week 3)
Improve layer management with the orphaned layer components.

#### 3.1 Layer Components Integration
**Files to integrate:** 11 components in `/components/layers/`

**Integration Steps:**
1. Update LayersPanel.jsx to import layer components
2. Connect to EditorContext's layer management functions
3. Add advanced layer operations

**Components:**
- [ ] LayerItem - Use in LayersPanel list
- [ ] LayerThumbnail - Add to LayerItem
- [ ] LayerOperations - Add context menu
- [ ] BlendModes - Add to PropertiesPanel
- [ ] AdjustmentLayer - Add layer type
- [ ] ClippingMask - Add layer feature
- [ ] LayerMasks - Add layer feature
- [ ] LayerStyles - Add to PropertiesPanel
- [ ] LayerEffects - Add to PropertiesPanel
- [ ] LayerTree - Implement for nested layers
- [ ] SmartObject - Add layer type

**Action Items:**
- [ ] Refactor LayersPanel to use components
- [ ] Add layer context menu
- [ ] Implement layer nesting (LayerTree)
- [ ] Add adjustment layers
- [ ] Implement layer masks

---

### PRIORITY 4: Canvas Enhancements (Week 4)
Improve canvas functionality with additional components.

#### 4.1 Canvas Components Integration
**Files to integrate:** 9 components in `/components/canvas/`

**Components:**
- [ ] Grid - Add grid overlay
- [ ] RulerGuides - Add measurement guides
- [ ] SelectionBox - Add selection visual
- [ ] Snapping - Add snap-to-grid
- [ ] TransformControls - Add transform handles
- [ ] MultiCanvasManager - Handle multiple canvases
- [ ] OffscreenCanvas - Performance optimization
- [ ] WebGLCanvas - GPU-accelerated rendering
- [ ] VideoCanvas - Video frame support

**Action Items:**
- [ ] Create `CanvasOverlays.jsx` component
- [ ] Add grid and guides to ImageCanvas
- [ ] Implement snapping functionality
- [ ] Add transform controls for objects

---

### PRIORITY 5: 3D Features (Week 5)
Enhance 3D capabilities.

#### 5.1 3D Components Integration
**Files to integrate:** 6 components in `/components/3d/`

**Components:**
- [ ] CameraControls - Add to ThreeJSCanvas
- [ ] LightingSetup - Add lighting editor
- [ ] MaterialEditor - Add material properties
- [ ] Model3D - Add 3D model import
- [ ] Scene3D - Scene management
- [ ] TextureMapper - Texture mapping tool

**Action Items:**
- [ ] Enhance ThreeJSCanvas with components
- [ ] Add 3D model import/export
- [ ] Create material editor panel

---

### PRIORITY 6: Export System (Week 6)
Complete export functionality.

#### 6.2 Export Components Integration
**Files to integrate:** 10 components in `/components/export/`

**Components:**
- [ ] BatchExport - Add to Export modal
- [ ] CloudExport - Add cloud save options
- [ ] CompressionSettings - Add to Export settings
- [ ] ExportPresets - Add to PresetsPanel
- [ ] FormatSelector - Update Export modal
- [ ] MetadataEditor - Add metadata editing
- [ ] QualitySettings - Update Export modal
- [ ] ResizeOptions - Add to Export settings
- [ ] SocialMediaExport - Add presets
- [ ] WatermarkManager - Add watermark feature

**Action Items:**
- [ ] Update Export modal in Editor.jsx
- [ ] Create `ExportSettings.jsx` component
- [ ] Add batch export functionality
- [ ] Implement watermark system

---

### PRIORITY 7: Workspace & Layout (Ongoing)
Improve UI/UX with workspace components.

#### 7.1 Workspace Components
**Files to integrate:** 8 components in `/components/workspace/`

**Components:**
- [ ] AssetsPanel - Already imported in RightPanel
- [ ] LibraryPanel - Already imported in RightPanel
- [ ] PresetsPanel - Already imported in RightPanel
- [ ] PropertiesPanel - Already imported in RightPanel
- [ ] CommandPalette - Add global command system
- [ ] HistoryPanel - Alternative to HistoryStack
- [ ] QuickActions - Add quick action buttons
- [ ] WorkspacePresets - Save workspace layouts

**Action Items:**
- [ ] Integrate CommandPalette into App.jsx
- [ ] Add QuickActions to toolbar
- [ ] Implement workspace preset system

---

### PRIORITY 8: Layout Components (Ongoing)
Use layout components throughout the app.

#### 7.2 Layout Components
**Files to use:** 9 components in `/components/layout/`

**Components:**
- [x] Layout - Used in App.jsx
- [x] EditorLayout - Used in routes
- [x] Navbar - Used in layout
- [x] MobileNav - Used in layout
- [x] BottomNav - Used in layout
- [ ] DockLayout - Optional advanced layout
- [ ] ResizablePanel - Use in panels
- [ ] ResponsiveGrid - Use in galleries
- [ ] SplitPane - Use in editor layout
- [ ] Footer - Add to main layout
- [ ] ResponsiveGrid - Use in templates

---

## Feature Modules (Future Phases)

### Phase 2: Advanced Features

#### Animation Module (14 components)
**Status:** Completely orphaned
**Recommendation:** Create dedicated `/animation-editor` route
**Components:** Timeline, KeyframeEditor, AnimationPlayer, etc.

#### Audio Module (18 components)
**Status:** Completely orphaned
**Recommendation:** Create dedicated `/audio-editor` route
**Components:** AudioEditor, AudioMixer, AudioEffects, etc.

#### Video Module (17 components)
**Status:** Completely orphaned  
**Recommendation:** Create dedicated `/video-editor` route (already exists in routes)
**Components:** VideoEditor, VideoTimeline, VideoEffects, etc.

#### Text Module (13 components)
**Status:** Completely orphaned
**Recommendation:** Integrate into main editor as Text tool panel
**Components:** TextEditor, FontSelector, TextEffects, etc.

#### Templates Module (9 components)
**Status:** Completely orphaned
**Recommendation:** Integrate into LeftPanel or Templates page
**Components:** TemplateGallery, TemplateCategories, TemplatePreview, etc.

#### Merge Module (9 components)
**Status:** Completely orphaned
**Recommendation:** Create dedicated merge tool or integrate as advanced feature
**Components:** ImageMerger, Collage, Panorama, HDRMerge, etc.

#### Mobile Module (8 components)
**Status:** Completely orphaned
**Recommendation:** Use for mobile-responsive design
**Components:** GestureHandler, MobileToolbar, TouchControls, etc.

---

## Implementation Timeline

### Week 1-2: Core Tools
- Fix all tool component integrations
- Connect to canvas operations
- Add tool options panel

### Week 3-4: Filters & Adjustments
- Integrate all filter components
- Enhance Adjustments panel
- Add filter preview system

### Week 5-6: Layer System
- Implement advanced layer features
- Add layer masks and effects
- Create layer nesting system

### Week 7-8: Canvas & Export
- Enhance canvas with overlays
- Complete export system
- Add batch processing

### Week 9-10: Polish & Optimization
- Performance optimization
- Bug fixes
- Documentation

---

## Testing Checklist

### Unit Tests
- [ ] Test each tool component in isolation
- [ ] Test filter application
- [ ] Test layer operations
- [ ] Test canvas rendering

### Integration Tests
- [ ] Test tool switching
- [ ] Test filter chains
- [ ] Test layer stack operations
- [ ] Test export workflows

### E2E Tests
- [ ] Complete editing workflow
- [ ] Export workflow
- [ ] Project save/load
- [ ] Keyboard shortcuts

---

## Documentation Needed

1. **Component API Documentation**
   - Props for each component
   - Context dependencies
   - Usage examples

2. **Integration Guide**
   - How to add new tools
   - How to add new filters
   - How to extend layers

3. **User Documentation**
   - Tool usage guide
   - Filter guide
   - Layer management guide

---

## Current Status Summary

| Category | Total | Integrated | Orphaned | Progress |
|----------|-------|------------|----------|----------|
| Core Editor | 7 | 7 | 0 | ✅ 100% |
| AI Components | 34 | 13 | 21 | 🟡 38% |
| Advanced | 10 | 7 | 3 | 🟢 70% |
| Tools | 23 | 0 | 23 | 🔴 0% |
| Filters | 19 | 3 | 16 | 🔴 16% |
| Layers | 12 | 1 | 11 | 🔴 8% |
| Canvas | 13 | 4 | 9 | 🔴 31% |
| 3D | 7 | 1 | 6 | 🔴 14% |
| UI | 33 | 33 | 0 | ✅ 100% |
| Export | 11 | 1 | 10 | 🔴 9% |
| **TOTAL** | **277** | **52** | **225** | **🟡 19%** |

---

## Next Immediate Actions

1. ✅ Fix ImageCanvas.jsx - DONE
2. ✅ Fix CanvasControls.jsx - DONE
3. ⏳ Create ToolManager.jsx
4. ⏳ Update Toolbar to use tool components
5. ⏳ Integrate filter components into FilterPanel
6. ⏳ Enhance LayersPanel with layer components
7. ⏳ Add export components to Export modal
8. ⏳ Test all integrations

---

**Last Updated:** March 23, 2026
**Status:** Critical fixes complete, beginning Priority 1 integration
