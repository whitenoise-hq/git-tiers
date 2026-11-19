/**
 * 크리스마스 리스 테두리(SVG). 배지 가장자리를 따라 솔잎 뭉치를 두르고
 * 빨간 열매와 반짝이는 전구를 얹는다.
 * 좌표는 배지 왼쪽 위(0,0) 기준이고, 바깥으로 나가는 만큼은 FramePad 로 알려 준다.
 * 같은 크기면 늘 같은 그림이 나오도록 난수는 고정 시드로 만든다.
 */
import type { FrameArt } from './types';

const PAD = 12;
/** 솔잎 줄기 중심선이 배지 테두리 밖으로 나가 있는 거리 */
const OUTSET = 2;
const TUFT_STEP = 5;
const BERRY_STEP = 40;

const NEEDLE_COLORS = ['#1f6b40', '#2b8a52', '#17583a', '#36a05f'] as const;
const BASE_COLOR = '#174a2f';
const BERRY = '#d0142f';
const LIGHT_COLORS = ['#ffd66b', '#fff1b8', '#ffb35c'] as const;

interface PathPoint {
  readonly x: number;
  readonly y: number;
  /** 진행 방향(라디안). 시계 방향으로 돈다. */
  readonly angle: number;
}

const n1 = (value: number) => Math.round(value * 10) / 10;

/** 고정 시드 난수(mulberry32) */
const seeded = (seed: number) => {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** 둥근 사각형 둘레를 따라가는 점(시계 방향, 위쪽 변 왼쪽에서 시작) */
const roundedRectPath = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number
) => {
  const r = Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2);
  const w = x1 - x0 - 2 * r;
  const h = y1 - y0 - 2 * r;
  const arc = (Math.PI / 2) * r;
  // [길이, 길이 안에서의 위치 → 점]
  const segments: readonly [number, (d: number) => PathPoint][] = [
    [w, (d) => ({ x: x0 + r + d, y: y0, angle: 0 })],
    [arc, (d) => corner(x1 - r, y0 + r, -Math.PI / 2, d / r)],
    [h, (d) => ({ x: x1, y: y0 + r + d, angle: Math.PI / 2 })],
    [arc, (d) => corner(x1 - r, y1 - r, 0, d / r)],
    [w, (d) => ({ x: x1 - r - d, y: y1, angle: Math.PI })],
    [arc, (d) => corner(x0 + r, y1 - r, Math.PI / 2, d / r)],
    [h, (d) => ({ x: x0, y: y1 - r - d, angle: -Math.PI / 2 })],
    [arc, (d) => corner(x0 + r, y0 + r, Math.PI, d / r)],
  ];
  const corner = (
    cx: number,
    cy: number,
    start: number,
    t: number
  ): PathPoint => {
    const theta = start + t;
    return {
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta),
      angle: theta + Math.PI / 2,
    };
  };
  const length = segments.reduce((sum, [len]) => sum + len, 0);

  const pointAt = (distance: number): PathPoint => {
    let rest = ((distance % length) + length) % length;
    for (const [len, at] of segments) {
      if (rest <= len) return at(rest);
      rest -= len;
    }
    return segments[0][1](0);
  };

  const d = `M${n1(x0 + r)},${y0} H${n1(x1 - r)} A${r},${r} 0 0 1 ${x1},${n1(y0 + r)} V${n1(y1 - r)} A${r},${r} 0 0 1 ${n1(x1 - r)},${y1} H${n1(x0 + r)} A${r},${r} 0 0 1 ${x0},${n1(y1 - r)} V${n1(y0 + r)} A${r},${r} 0 0 1 ${n1(x0 + r)},${y0} Z`;

  return { length, pointAt, d };
};

const deg = (radians: number) => n1((radians * 180) / Math.PI);

/** 솔잎 한 가닥(색마다 하나씩 defs 에 두고 <use> 로 재사용해 파일을 줄인다) */
const needleDefs = (): string =>
  `<defs>${NEEDLE_COLORS.map(
    (color, i) => `<ellipse id="n${i}" rx="5.6" ry="2" fill="${color}"/>`
  ).join('')}</defs>`;

const tuft = (p: PathPoint, rand: () => number): string => {
  // 바깥쪽 법선 방향으로 조금씩 흔들어 울퉁불퉁하게 만든다.
  const offset = (rand() - 0.4) * 4.5;
  const nx = Math.sin(p.angle);
  const ny = -Math.cos(p.angle);
  const cx = n1(p.x + nx * offset);
  const cy = n1(p.y + ny * offset);
  return [-1, 0, 1]
    .map((side) => {
      const tilt =
        deg(p.angle) + side * (34 + rand() * 18) + (rand() - 0.5) * 16;
      const color = Math.floor(rand() * NEEDLE_COLORS.length);
      const scale = n1(0.85 + rand() * 0.4);
      return `<use href="#n${color}" transform="translate(${cx} ${cy}) rotate(${tilt}) scale(${scale} 1)"/>`;
    })
    .join('');
};

const berries = (p: PathPoint): string => {
  const cx = n1(p.x);
  const cy = n1(p.y);
  return [
    [-2.2, 0.8],
    [2.1, 1],
    [0, -1.9],
  ]
    .map(
      ([dx, dy]) =>
        `<circle cx="${n1(cx + dx)}" cy="${n1(cy + dy)}" r="2.5" fill="${BERRY}"/><circle cx="${n1(cx + dx - 0.7)}" cy="${n1(cy + dy - 0.7)}" r="0.7" fill="#fff" fill-opacity="0.65"/>`
    )
    .join('');
};

const light = (p: PathPoint, index: number): string => {
  const color = LIGHT_COLORS[index % LIGHT_COLORS.length];
  const begin = n1((index % 5) * 0.45);
  return `<circle cx="${n1(p.x)}" cy="${n1(p.y)}" r="1.6" fill="${color}"><animate attributeName="opacity" values="1;0.3;1" dur="2.4s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
};

export const wreathFrame = (
  width: number,
  height: number,
  radius: number
): FrameArt => {
  const path = roundedRectPath(
    -OUTSET,
    -OUTSET,
    width + OUTSET,
    height + OUTSET,
    radius + OUTSET
  );
  const rand = seeded(1225);

  const tufts: string[] = [];
  for (let d = 0; d < path.length; d += TUFT_STEP)
    tufts.push(tuft(path.pointAt(d), rand));

  const decorations: string[] = [];
  let lightIndex = 0;
  for (let d = BERRY_STEP / 4; d < path.length; d += BERRY_STEP / 2) {
    const p = path.pointAt(d);
    const isBerry =
      Math.round((d - BERRY_STEP / 4) / (BERRY_STEP / 2)) % 2 === 0;
    decorations.push(isBerry ? berries(p) : light(p, lightIndex++));
  }

  const markup = [
    needleDefs(),
    `<path d="${path.d}" fill="none" stroke="${BASE_COLOR}" stroke-width="9" stroke-linejoin="round"/>`,
    tufts.join(''),
    decorations.join(''),
  ].join('');

  return { pad: { top: PAD, right: PAD, bottom: PAD, left: PAD }, markup };
};
