import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Path, Image, Transformer } from 'react-konva';

const UniversalCanvas = ({
    stageRef,
    layers, // Array of layer objects { id, name, visible, locked, shapes: [] }
    selectedShapeId,
    onSelectShape,
    onChangeShape,
    tool, // 'select', 'brush', 'eraser', 'rect', 'circle', 'line'
    color,
    strokeWidth,
    lineCap, // 'butt', 'round', 'square'
    onDrawEnd
}) => {
    const isDrawing = useRef(false);

    const [selectionRect, setSelectionRect] = React.useState(null);

    // Handle mouse events for drawing and selection
    const handleMouseDown = (e) => {
        const stage = e.target.getStage();
        const pos = stage.getRelativePointerPosition();

        if (tool === 'select') {
            const clickedOnEmpty = e.target === stage;
            if (clickedOnEmpty) {
                onSelectShape(null);
                setSelectionRect({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
            }
            return;
        }

        isDrawing.current = true;
        onDrawEnd('START', { tool, pos, ...{ stroke: color, strokeWidth, lineCap } });
    };

    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const pos = stage.getRelativePointerPosition();

        if (tool === 'select' && selectionRect) {
            setSelectionRect(prev => ({ ...prev, x2: pos.x, y2: pos.y }));
            return;
        }

        if (!isDrawing.current) return;
        onDrawEnd('MOVE', { pos });
    };

    const handleMouseUp = (e) => {
        if (tool === 'select' && selectionRect) {
            // Find shapes within marquee
            const x = Math.min(selectionRect.x1, selectionRect.x2);
            const y = Math.min(selectionRect.y1, selectionRect.y2);
            const width = Math.abs(selectionRect.x1 - selectionRect.x2);
            const height = Math.abs(selectionRect.y1 - selectionRect.y2);

            if (width > 5 && height > 5) {
                const stage = e.target.getStage();
                const shapes = stage.find('.shape');
                const selected = shapes.filter(s => {
                    const box = s.getClientRect();
                    return (
                        box.x >= x &&
                        box.y >= y &&
                        box.x + box.width <= x + width &&
                        box.y + box.height <= y + height
                    );
                });
                onSelectShape(selected.map(s => s.id()));
            }
            setSelectionRect(null);
        }

        isDrawing.current = false;
        onDrawEnd('END');
    };

    const containerRef = useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useLayoutEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const isMultiSelect = Array.isArray(selectedShapeId);

    return (
        <div ref={containerRef} className="w-full h-full bg-[#050B0D] relative overflow-hidden flex items-center justify-center">
            {/* Background Grid (CSS based for performance) */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(#00E5FF 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}></div>

            <Stage
                width={dimensions.width}
                height={dimensions.height}
                ref={stageRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="bg-black/20 shadow-2xl border border-white/5"
            >
                {layers.slice().reverse().map((layer) => (
                    layer.visible && (
                        <Layer key={layer.id}>
                            {layer.shapes.map((shape) => {
                                const isSelected = isMultiSelect
                                    ? selectedShapeId.includes(shape.id)
                                    : shape.id === selectedShapeId;

                                const commonProps = {
                                    ...shape,
                                    name: 'shape',
                                    id: shape.id,
                                    onClick: () => tool === 'select' && !layer.locked && onSelectShape(shape.id),
                                    onTap: () => tool === 'select' && !layer.locked && onSelectShape(shape.id),
                                    draggable: tool === 'select' && !layer.locked,
                                    onDragEnd: (e) => {
                                        onChangeShape(shape.id, {
                                            x: e.target.x(),
                                            y: e.target.y()
                                        });
                                    },
                                    onTransformEnd: (e) => {
                                        const node = e.target;
                                        const attrs = {
                                            x: node.x(),
                                            y: node.y(),
                                            scaleX: node.scaleX(),
                                            scaleY: node.scaleY(),
                                            rotation: node.rotation()
                                        };
                                        if (shape.type === 'rect') {
                                            attrs.width = node.width() * node.scaleX();
                                            attrs.height = node.height() * node.scaleY();
                                            attrs.scaleX = 1;
                                            attrs.scaleY = 1;
                                        }
                                        onChangeShape(shape.id, attrs);
                                    }
                                };

                                return (
                                    <React.Fragment key={shape.id}>
                                        {shape.type === 'line' && (
                                            <Line
                                                {...commonProps}
                                                lineCap={shape.lineCap || 'round'}
                                                lineJoin={shape.lineJoin || 'round'}
                                            />
                                        )}
                                        {shape.type === 'path' && (
                                            <Path
                                                {...commonProps}
                                                data={shape.data}
                                                fill={shape.fill || '#00E5FF'}
                                                stroke={shape.stroke || '#00E5FF'}
                                            />
                                        )}
                                        {shape.type === 'rect' && (
                                            <Rect {...commonProps} />
                                        )}
                                        {shape.type === 'circle' && (
                                            <Circle {...commonProps} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </Layer>
                    )
                ))}
                <Layer>
                    {selectionRect && (
                        <Rect
                            x={Math.min(selectionRect.x1, selectionRect.x2)}
                            y={Math.min(selectionRect.y1, selectionRect.y2)}
                            width={Math.abs(selectionRect.x1 - selectionRect.x2)}
                            height={Math.abs(selectionRect.y1 - selectionRect.y2)}
                            fill="rgba(0, 229, 255, 0.1)"
                            stroke="#00E5FF"
                            strokeWidth={1}
                            dash={[5, 5]}
                        />
                    )}
                    {tool === 'select' && selectedShapeId && (
                        <TransformerComponent selectedShapeIds={isMultiSelect ? selectedShapeId : [selectedShapeId]} />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

// Helper for Transformer to avoid clutter
const TransformerComponent = ({ selectedShapeIds }) => {
    const trRef = useRef();

    useEffect(() => {
        if (trRef.current) {
            const stage = trRef.current.getStage();
            const nodes = selectedShapeIds.map(id => stage.findOne('#' + id)).filter(Boolean);
            trRef.current.nodes(nodes);
            trRef.current.getLayer().batchDraw();
        }
    }, [selectedShapeIds]);

    return (
        <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
            }}
            borderStroke="#00E5FF"
            anchorStroke="#00E5FF"
            anchorFill="#050B0D"
            anchorSize={8}
        />
    );
};

export default UniversalCanvas;
