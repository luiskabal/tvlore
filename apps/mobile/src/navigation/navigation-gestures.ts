export const navigationEdgePanWidth = 64;
export const navigationPanStartDistance = 12;
export const navigationPanCompleteDistance = 64;
export const navigationPanVelocityDistance = 36;
export const navigationPanCompleteVelocity = 0.25;

export type BackPanInput = {
  canGoBack: boolean;
  dx: number;
  dy: number;
  startX: number;
  width: number;
};

export function isBackPanStart({ canGoBack, dx, dy, startX, width }: BackPanInput) {
  if (!canGoBack || width <= 0) {
    return false;
  }

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const fromLeftEdge = startX <= navigationEdgePanWidth && dx > 0;
  const fromRightEdge = startX >= width - navigationEdgePanWidth && dx < 0;

  return (fromLeftEdge || fromRightEdge) && absDx >= navigationPanStartDistance && absDx > absDy * 1.4;
}

export function shouldCompleteBackPan(dx: number, dy: number, vx: number) {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const hasHorizontalIntent = absDx > absDy * 1.2;

  if (!hasHorizontalIntent) {
    return false;
  }

  return absDx >= navigationPanCompleteDistance || (absDx >= navigationPanVelocityDistance && Math.abs(vx) >= navigationPanCompleteVelocity);
}
