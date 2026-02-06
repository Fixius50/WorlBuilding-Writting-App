import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Transformer } from 'react-konva';

const GlyphEditorCanvas = ({
    stageRef,
    layers, // Array of layer objects { id, name, visible, locked, shapes: [] }
    selectedShapeId,
    onSelectShape,
    onChangeShape,
    tool, // 'select', 'brush', 'eraser', 'rect', 'circle', 'line'
    color,
    strokeWidth,
    onDrawEnd
}) => {
    const isDrawing = useRef(false);

    // Handle mouse events for drawing
    const handleMouseDown = (e) => {
        if (tool === 'select') {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
                onSelectShape(null);
            }
            return;
        }

        // Identify active layer (must be visible and unlocked)
        // For simplicity, we assume we draw on the first active unlocked layer or the "active" one set in props
        // We'll pass `activeLayerId` from parent ideally. For now, let's assume parent handles "add shape to active layer" logic via onDrawEnd generic handler?
        // Actually, drawing logic usually happens *inside* component for performance (lines), then commits to state.

        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();

        onDrawEnd('START', { tool, pos, ...{ stroke: color, strokeWidth } });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        onDrawEnd('MOVE', { pos: point });
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
        onDrawEnd('END');
    };

    return (
        <div className="w-full h-full bg-[#050B0D] relative overflow-hidden flex items-center justify-center">
            {/* Background Grid (CSS based for performance) */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(#00E5FF 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}></div>

            <Stage
                width={800} // Should be dynamic based on container
                height={600}
                ref={stageRef}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                className="bg-black/20 shadow-2xl border border-white/5"
            >
                {layers.slice().reverse().map((layer) => ( // Render bottom-up? Arrays usually 0=bottom. Z-index in Konva determined by render order.
                    // Wait, Konva renders in order. 0 is bottom. existing .map is fine if 0 is background.
                    // Just ensure 'layers' prop is ordered correctly.
                    layer.visible && (
                        <Layer key={layer.id}>
                            {layer.shapes.map((shape, i) => {
                                const isSelected = shape.id === selectedShapeId;
                                return (
                                    <React.Fragment key={shape.id}>
                                        {shape.type === 'line' && (
                                            <Line
                                                {...shape}
                                                lineCap="round"
                                                lineJoin="round"
                                                onClick={() => !layer.locked && onSelectShape(shape.id)}
                                                onTap={() => !layer.locked && onSelectShape(shape.id)}
                                                draggable={tool === 'select' && !layer.locked}
                                                onDragEnd={(e) => {
                                                    onChangeShape(shape.id, {
                                                        x: e.target.x(),
                                                        y: e.target.y()
                                                    });
                                                }}
                                                onTransformEnd={(e) => {
                                                    const node = e.target;
                                                    const scaleX = node.scaleX();
                                                    const scaleY = node.scaleY();

                                                    // Reset scale and apply to points or width?
                                                    // For lines/brush, usually better to just effectively scale
                                                    // But we can reset scale to 1 and adjust points if needed for cleaner data
                                                    // For now, keep simple scaling.
                                                    onChangeShape(shape.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                        scaleX: scaleX,
                                                        scaleY: scaleY,
                                                        rotation: node.rotation()
                                                    });
                                                }}
                                            />
                                        )}
                                        {/* Add Rect and Circle handlers similarly */}
                                        {isSelected && !layer.locked && (
                                            <TransformerComponent selectedShapeId={selectedShapeId} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </Layer>
                    )
                ))}
            </Stage>
        </div>
    );
};

// Helper for Transformer to avoid clutter
const TransformerComponent = ({ selectedShapeId }) => {
    const trRef = useRef();
    const { Layer } = React.useContext(React.createContext(null)); // Mock, actually need access to stage?
    // React-Konva Transformer finds node by ref usually.
    // Better pattern: pass ref to Shape, or use stage.findOne('#id').

    // Simpler pattern for React-Konva:
    // The Transformer must be rendered in the Layer (or a separate top layer)
    // and manually attached to the node.

    return (
        <Transformer
            ref={(node) => {
                if (node) {
                    // We need to attach to the shape. 
                    // This often requires the shape to have a Ref, or use `node.getStage().findOne('#'+selectedShapeId)`
                    // Let's rely on the parent updating this.
                    // Actually, simpler standard way:
                    const stage = node.getStage();
                    const selectedNode = stage.findOne('.' + selectedShapeId); // Assuming we add name={id} or id={id}
                    if (selectedNode) {
                        node.nodes([selectedNode]);
                        node.getLayer().batchDraw();
                    }
                }
            }}
            boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
            borderStroke="#00E5FF"
            anchorStroke="#00E5FF"
            anchorFill="#050B0D"
            anchorSize={8}
        />
    );
};

export default GlyphEditorCanvas;
