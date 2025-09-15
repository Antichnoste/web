// Отрисовка графика

export function drawGeometry(ctx, width, height, r, x, y, isHit) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxR = 4;
    const scale = Math.min(80, (width - 100) / (2 * maxR));
    const scaledR = r * scale;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a202c');
    gradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx, width, height, centerX, centerY, scale);
    drawAxes(ctx, width, height, centerX, centerY);

    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('X', width - 20, centerY - 10);
    ctx.fillText('Y', centerX + 10, 20);

    if (r !== undefined) {
        drawHitAreas(ctx, centerX, centerY, scaledR);
    }

    if (x !== undefined && y !== undefined) {
        drawPoint(ctx, centerX, centerY, x, y, scale, isHit);
    }

    drawLabels(ctx, centerX, centerY, scaledR, r, scale);
}

function drawGrid(ctx, width, height, centerX, centerY, scale) {
    ctx.strokeStyle = 'rgba(243, 156, 18, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
        const x = centerX + i * scale;
        if (x >= 0 && x <= width) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }
    for (let i = -5; i <= 5; i++) {
        const y = centerY + i * scale;
        if (y >= 0 && y <= height) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
}

function drawAxes(ctx, width, height, centerX, centerY) {
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(243, 156, 18, 0.5)';
    ctx.shadowBlur = 5;

    ctx.beginPath();
    ctx.moveTo(20, centerY);
    ctx.lineTo(width - 20, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, height - 20);
    ctx.stroke();

    drawArrow(ctx, width - 20, centerY, 0);
    drawArrow(ctx, centerX, 20, 3*Math.PI / 2);

    drawAxisMarks(ctx, width, height, centerX, centerY);

    ctx.shadowBlur = 0;
}

function drawAxisMarks(ctx, width, height, centerX, centerY) {
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    for (let i = -4; i <= 4; i++) {
        if (i !== 0) {
            const x = centerX + i * 50;
            if (x > 20 && x < width - 20) {
                ctx.beginPath();
                ctx.moveTo(x, centerY - 5);
                ctx.lineTo(x, centerY + 5);
                ctx.stroke();
            }
        }
    }
    for (let i = -4; i <= 4; i++) {
        if (i !== 0) {
            const y = centerY + i * 50;
            if (y > 20 && y < height - 20) {
                ctx.beginPath();
                ctx.moveTo(centerX - 5, y);
                ctx.lineTo(centerX + 5, y);
                ctx.stroke();
            }
        }
    }
}

function drawArrow(ctx, x, y, angle) {
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowLength * Math.cos(angle - arrowAngle),
        y - arrowLength * Math.sin(angle - arrowAngle));
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowLength * Math.cos(angle + arrowAngle),
        y - arrowLength * Math.sin(angle + arrowAngle));
    ctx.stroke();
}

function drawHitAreas(ctx, centerX, centerY, scaledR) {
    const rectGradient = ctx.createLinearGradient(centerX, centerY - scaledR, centerX + scaledR, centerY);
    rectGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
    rectGradient.addColorStop(1, 'rgba(41, 128, 185, 0.6)');
    ctx.fillStyle = rectGradient;
    ctx.fillRect(centerX, centerY - scaledR, scaledR, scaledR);

    const triangleGradient = ctx.createRadialGradient(centerX - scaledR/3, centerY - scaledR/3, 0, centerX, centerY, scaledR);
    triangleGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
    triangleGradient.addColorStop(1, 'rgba(41, 128, 185, 0.6)');
    ctx.fillStyle = triangleGradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - scaledR, centerY);
    ctx.lineTo(centerX, centerY - scaledR);
    ctx.closePath();
    ctx.fill();

    const circleGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scaledR);
    circleGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
    circleGradient.addColorStop(1, 'rgba(41, 128, 185, 0.6)');
    ctx.fillStyle = circleGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scaledR, Math.PI / 2 , Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(243, 156, 18, 0.3)';
    ctx.shadowBlur = 8;

    ctx.strokeRect(centerX, centerY - scaledR, scaledR, scaledR);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - scaledR, centerY);
    ctx.lineTo(centerX, centerY - scaledR);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, scaledR, Math.PI / 2, Math.PI);
    ctx.stroke();

    ctx.shadowBlur = 0;
}

function drawPoint(ctx, centerX, centerY, x, y, scale, isHit) {
    const pointX = centerX + x * scale;
    const pointY = centerY - y * scale;
    ctx.shadowColor = isHit ? 'rgba(39, 174, 96, 0.8)' : 'rgba(231, 76, 60, 0.8)';
    ctx.shadowBlur = 15;

    ctx.fillStyle = isHit ? '#27ae60' : '#e74c3c';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(pointX + 10, pointY - 25, 80, 20);

    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`(${x}, ${y})`, pointX + 15, pointY - 10);
}

function drawLabels(ctx, centerX, centerY, scaledR) {
    ctx.font = '10px Arial';
    ctx.fillStyle = '#e0e0e0';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('R/2', centerX + scaledR / 2, centerY + 15);
    ctx.fillText('R', centerX + scaledR, centerY + 15);
    ctx.fillText('-R/2', centerX - scaledR / 2, centerY + 15);
    ctx.fillText('-R', centerX - scaledR, centerY + 15);
    ctx.fillText('R/2', centerX - 15, centerY - scaledR / 2);
    ctx.fillText('R', centerX - 15, centerY - scaledR);
    ctx.fillText('-R/2', centerX - 15, centerY + scaledR / 2);
    ctx.fillText('-R', centerX - 15, centerY + scaledR);
}