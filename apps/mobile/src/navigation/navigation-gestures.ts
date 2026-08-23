export const navigationEdgePanWidth = 36;
export const navigationPanStartDistance = 18;
export const navigationPanCompleteDistance = 72;
export const navigationPanCompleteVelocity = 0.45;

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

  return absDx >= navigationPanCompleteDistance && absDx > absDy * 1.4 && Math.abs(vx) >= navigationPanCompleteVelocity;
}
