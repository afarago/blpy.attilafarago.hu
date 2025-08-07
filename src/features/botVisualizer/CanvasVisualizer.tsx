import React from 'react';
import { Arc, Arrow, Circle, Layer, Line, Stage, Text } from 'react-konva';
import { parseCommands } from './CommandParser';

interface CanvasVisualizerProps {
    pycode: string;
    axle_track: number;
}

type PathPoint = {
    x: number;
    y: number;
    cx?: number; // Center x for curves
    cy?: number; // Center y for curves
    angle: number;
    type: 'straight' | 'curve' | 'turn' | 'start';
};

const CanvasVisualizer: React.FC<CanvasVisualizerProps> = ({ pycode, axle_track }) => {
    let segments: Array<
        | { type: 'straight'; from: PathPoint; to: PathPoint }
        | { type: 'turn'; from: PathPoint; to: PathPoint; angle: number }
        | {
              type: 'curve';
              center: { x: number; y: number };
              radius: number;
              startAngle: number;
              sweepAngle: number;
              from: PathPoint;
              to: PathPoint;
          }
    > = [];

    let currentX = 0;
    let currentY = 0;
    let currentAngle = 0; // in degrees
    let scale = 0.5;
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    function updateBounds(x: number, y: number) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    let lastPoint: PathPoint = {
        x: currentX,
        y: currentY,
        angle: currentAngle,
        type: 'start',
    };
    updateBounds(currentX, currentY);

    const commands = parseCommands(pycode.split('\n'));

    commands.forEach((command) => {
        switch (command.type) {
            case 'straight': {
                if (command.distance === undefined) return;
                const radians = (currentAngle * Math.PI) / 180;
                const nextX = currentX + Math.cos(radians) * command.distance * scale;
                const nextY = currentY + Math.sin(radians) * command.distance * scale;
                const nextPoint: PathPoint = {
                    x: nextX,
                    y: nextY,
                    angle: currentAngle,
                    type: 'straight',
                };
                segments.push({ type: 'straight', from: lastPoint, to: nextPoint });
                currentX = nextX;
                currentY = nextY;
                lastPoint = nextPoint;
                break;
            }
            case 'curve': {
                if (command.radius === undefined || command.angle === undefined) return;
                // Use axle_track if you want to adjust the radius
                // For center radius, use as is. For left/right wheel, adjust:
                const centerRadius =
                    (command.radius + (Math.sign(command.radius) * axle_track) / 2) *
                    scale;
                // const centerRadius = command.radius * scale;

                const sign = command.angle >= 0 ? 1 : -1;
                const theta0 = (currentAngle * Math.PI) / 180;
                const centerAngle = theta0 + (sign > 0 ? Math.PI / 2 : -Math.PI / 2);
                const cx = currentX + Math.cos(centerAngle) * centerRadius;
                const cy = currentY + Math.sin(centerAngle) * centerRadius;

                let startAngle = (currentAngle - 90 * sign) % 360;
                let sweepAngle = command.angle;
                if (command.angle < 0) {
                    startAngle = (startAngle + command.angle) % 360;
                    sweepAngle = -sweepAngle;
                }
                if (command.radius < 0) {
                    startAngle = (startAngle + 180) % 360;
                    // sweepAngle = -sweepAngle;
                }

                // Calculate end point
                const theta1 = theta0 + (command.angle * Math.PI) / 180;
                const endX =
                    cx +
                    Math.cos(theta1 - (sign > 0 ? Math.PI / 2 : -Math.PI / 2)) *
                        centerRadius;
                const endY =
                    cy +
                    Math.sin(theta1 - (sign > 0 ? Math.PI / 2 : -Math.PI / 2)) *
                        centerRadius;
                const endAngle = currentAngle + command.angle;
                const endPoint: PathPoint = {
                    x: endX,
                    y: endY,
                    cx,
                    cy,
                    angle: endAngle,
                    type: 'curve',
                };
                segments.push({
                    type: 'curve',
                    center: { x: cx, y: cy },
                    radius: Math.abs(centerRadius),
                    startAngle,
                    sweepAngle,
                    from: lastPoint,
                    to: endPoint,
                });
                currentX = endX;
                currentY = endY;
                currentAngle = endAngle;
                lastPoint = endPoint;
                break;
            }
            case 'turn': {
                if (command.angle === undefined) return;
                currentAngle += command.angle;
                const nextPoint: PathPoint = {
                    x: currentX,
                    y: currentY,
                    angle: currentAngle,
                    type: 'turn',
                };
                segments.push({
                    type: 'turn',
                    angle: command.angle,
                    from: lastPoint,
                    to: nextPoint,
                });
                lastPoint = nextPoint;
                break;
            }
            default:
                break;
        }
        updateBounds(currentX, currentY);
    });

    // Normalize segments to fit in the canvas
    const width = maxX - minX;
    const height = maxY - minY;
    const canvasWidth = 400;
    const canvasHeight = 400;
    const scaleX = canvasWidth / width / 1.1;
    const scaleY = canvasHeight / height / 1.1;
    scale = Math.min(scaleX, scaleY);
    const offsetX = (canvasWidth - width * scale) / 2 - minX * scale;
    const offsetY = (canvasHeight - height * scale) / 2 - minY * scale;
    console.log('Canvas scale:', scale, 'Offset:', offsetX, offsetY);

    function tx(x: number): number {
        return x * scale + offsetX;
    }
    function ty(y: number): number {
        return y * scale + offsetY;
    }

    return (
        <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
                {segments.map((seg, idx) => (
                    <>
                        {seg.type === 'straight' && (
                            <Line
                                key={`straight-${idx}`}
                                points={[
                                    tx(seg.from.x),
                                    ty(seg.from.y),
                                    tx(seg.to.x),
                                    ty(seg.to.y),
                                ]}
                                stroke="blue"
                                strokeWidth={2}
                                lineCap="round"
                            />
                        )}

                        {seg.type === 'curve' && (
                            <Arc
                                key={`curve-${idx}`}
                                x={tx(seg.center.x)}
                                y={ty(seg.center.y)}
                                innerRadius={seg.radius * scale}
                                outerRadius={seg.radius * scale}
                                angle={seg.sweepAngle}
                                rotation={seg.startAngle}
                                stroke="orange"
                                strokeWidth={2}
                            />
                        )}

                        {seg.type === 'turn' && (
                            <Circle
                                key={`turn-${idx}`}
                                x={tx(seg.from.x)}
                                y={ty(seg.from.y)}
                                width={20}
                                height={20}
                                fill={'pink'}
                            />
                        )}
                    </>
                ))}
                {/* Draw orientation arrows at the end of each segment */}
                {segments.map((seg, idx) => {
                    const pt = seg.to;
                    const pt0 = seg.from;
                    return (
                        <>
                            {/* <Rect
                                x={tx(pt0.x) - 8}
                                y={ty(pt0.y) - 8}
                                width={16}
                                height={16}
                                fill="yellow"
                                stoke="yellow"
                            /> */}
                            <Text
                                x={tx(pt0.x) - 8}
                                y={ty(pt0.y) - 8}
                                fontSize={22}
                                fill="black"
                                stroke="white"
                                fillAfterStrokeEnabled={true}
                                fontFamily="Arial"
                                align="center"
                                verticalAlign="middle"
                                width={16}
                                height={16}
                                textFillEnabled={true}
                                text={idx.toString()}
                            />
                            {pt.cx !== undefined && pt.cy !== undefined && (
                                <Circle
                                    x={tx(pt.cx)}
                                    y={ty(pt.cy)}
                                    width={10}
                                    height={10}
                                    fill="lightgray"
                                />
                            )}
                            <Arrow
                                key={`arrow-${idx}`}
                                points={[
                                    tx(pt0.x),
                                    ty(pt0.y),
                                    tx(pt0.x) +
                                        Math.sign(pt.x - pt0.x) *
                                            20 *
                                            Math.cos((pt0.angle * Math.PI) / 180),
                                    ty(pt0.y) -
                                        Math.sign(pt.y - pt0.y) *
                                            20 *
                                            Math.sin((pt0.angle * Math.PI) / 180),
                                ]}
                                pointerLength={8}
                                pointerWidth={8}
                                fill="red"
                                stroke="red"
                                strokeWidth={2}
                            />
                        </>
                    );
                })}
            </Layer>
        </Stage>
    );
};

export default CanvasVisualizer;
