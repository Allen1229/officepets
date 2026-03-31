import { PIXEL_TEMPLATES } from '../gameData';

export default function PixelArt({ templateName, className = "", size = 128, color }) {
  const template = PIXEL_TEMPLATES[templateName] || PIXEL_TEMPLATES['egg_common'];
  if (!template) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ shapeRendering: 'crispEdges' }}
    >
      {template.map((row, y) =>
        row.split('').map((char, x) => {
          if (char !== '1') return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x + 0.05}
              y={y + 0.05}
              width={0.9}
              height={0.9}
              fill={color || 'currentColor'}
            />
          );
        })
      )}
    </svg>
  );
}
