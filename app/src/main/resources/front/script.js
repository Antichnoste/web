// JavaScript валидация и функциональность для геометрического калькулятора
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('geometryForm');
    const resultDiv = document.getElementById('result');
    const canvas = document.getElementById('geometryCanvas');
    const ctx = canvas.getContext('2d');
    const resultsTable = document.getElementById('result-table');

    // Инициализация canvas
    drawGeometry(ctx, canvas.width, canvas.height, 4);

    // Добавление интерактивности - обновление графика при изменении R
    const rInput = document.getElementById('r');
    const yInput = document.getElementById('y');
    const xRadios = document.querySelectorAll('input[name="x"]');

    // Обновление графика при изменении R
    rInput.addEventListener('input', function() {
        const r = parseFloat(this.value);
        if (!isNaN(r) && r >= 1 && r <= 4) {
            drawGeometry(ctx, canvas.width, canvas.height, r);
        }
    });

    // Обновление графика при изменении Y
    yInput.addEventListener('input', function() {
        const y = parseFloat(this.value);
        const r = parseFloat(rInput.value);
        const selectedX = document.querySelector('input[name="x"]:checked');
        
        if (!isNaN(y) && !isNaN(r) && selectedX) {
            const x = parseFloat(selectedX.value);
            const isHit = checkHit(x, y, r);
            drawGeometry(ctx, canvas.width, canvas.height, r, x, y, isHit);
        }
    });

    // Обновление графика при изменении X
    xRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const x = parseFloat(this.value);
            const y = parseFloat(yInput.value);
            const r = parseFloat(rInput.value);
            
            if (!isNaN(y) && !isNaN(r)) {
                const isHit = checkHit(x, y, r);
                drawGeometry(ctx, canvas.width, canvas.height, r, x, y, isHit);
            }
        });
    });

    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const x = parseFloat(formData.get('x'));
        const y = parseFloat(formData.get('y'));
        const r = parseFloat(formData.get('r'));

        // Валидация данных
        if (!validateInputs(x, y, r)) {
            return;
        }

        // Проверка попадания в область
        const startTime = performance.now();
        const isHit = checkHit(x, y, r);
        
        // Обновление canvas
        drawGeometry(ctx, canvas.width, canvas.height, r, x, y, isHit);
        const endTime = performance.now();

        // Добавление результата в таблицу
        const currentTime = new Date().toLocaleString();
        addResultRow(x, y, r, currentTime, endTime - startTime, isHit);

        // Показать текстовый результат
        // showResult(isHit);

        // Отправка данных на сервер
        sendToServer(x, y, r, isHit);
    });

    // Валидация входных данных
    function validateInputs(x, y, r) {
        let isValid = true;
        let errorMessage = '';

        // Проверка X (должно быть одно из предустановленных значений)
        const validXValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
        if (isNaN(x) || !validXValues.includes(x)) {
            errorMessage += 'X должно быть одним из предустановленных значений: -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2<br>';
            isValid = false;
        }

        // Проверка Y (диапазон -3 до 5)
        if (isNaN(y) || y < -3 || y > 5) {
            errorMessage += 'Y должно быть числом в диапазоне от -3 до 5<br>';
            isValid = false;
        }

        // Проверка R (диапазон 1 до 4)
        if (isNaN(r) || r < 1 || r > 4) {
            errorMessage += 'R должно быть числом в диапазоне от 1 до 4<br>';
            isValid = false;
        }

        if (!isValid) {
            showError(errorMessage);
        }

        return isValid;
    }

    // Проверка попадания в область с правильной логикой
    function checkHit(x, y, r) {
        // 1-й квадрант: прямоугольник (0 ≤ x ≤ R, 0 ≤ y ≤ R)
        if (x >= 0 && y >= 0 && x <= r && y <= r) {
            return true;
        }
        
        // 2-й квадрант: треугольник (x ≤ 0, y ≥ 0, |x| + y ≤ R)
        if (x <= 0 && y >= 0 && Math.abs(x) + y <= r) {
            return true;
        }
        
        // 3-й квадрант: четверть круга (x ≤ 0, y ≤ 0, x² + y² ≤ R²)
        if (x <= 0 && y <= 0 && x * x + y * y <= r * r) {
            return true;
        }
        
        return false;
    }

    // Отправка данных на сервер
    function sendToServer(x, y, r, isHit) {
        const formData = new FormData();
        formData.append('x', x);
        formData.append('y', y);
        formData.append('r', r);
        formData.append('hit', isHit);

        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сервера: ' + response.status);
            }
            // Сервер может вернуть HTML, но мы не перерисовываем весь документ
            // чтобы сохранить таблицу результатов на странице.
            return response.text();
        })
        .then(data => {
            // Опционально можно отобразить сообщение об успешной отправке
            // или распарсить ответ сервера при необходимости.
        })
        .catch(error => {
            showError('Ошибка при отправке данных: ' + error.message);
        });
    }

    // Отображение ошибок
    function showError(message) {
        resultDiv.innerHTML = '<div class="error">' + message + '</div>';
    }

    // Отображение результата
    function showResult(isHit) {
        const message = isHit ? 'Попадание!' : 'Промах!';
        const className = isHit ? 'success' : 'error';
        resultDiv.innerHTML = '<div class="' + className + '">' + message + '</div>';
    }

    // Рисование геометрической области с улучшенной графикой
    function drawGeometry(ctx, width, height, r, x, y, isHit) {
        const centerX = width / 2;
        const centerY = height / 2;
        // Динамический масштаб в зависимости от R
        const maxR = 4; // Максимальное значение R
        const scale = Math.min(80, (width - 100) / (2 * maxR)); // Адаптивный масштаб
        const scaledR = r * scale;

        // Очистка canvas с градиентом
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a202c');
        gradient.addColorStop(1, '#2d3748');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Сетка координат
        drawGrid(ctx, width, height, centerX, centerY, scale);

        // Оси координат с улучшенным стилем
        drawAxes(ctx, width, height, centerX, centerY);

        // Подписи осей
        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('X', width - 20, centerY - 10);
        ctx.fillText('Y', centerX + 10, 20);

        // Рисование областей с градиентами и анимацией
        drawHitAreas(ctx, centerX, centerY, scaledR);

        // Отметка точки с анимацией
        if (x !== undefined && y !== undefined) {
            drawPoint(ctx, centerX, centerY, x, y, scale, isHit);
        }

        // Подписи и метки
        drawLabels(ctx, centerX, centerY, scaledR, r, scale);
    }

    // Рисование сетки
    function drawGrid(ctx, width, height, centerX, centerY, scale) {
        ctx.strokeStyle = 'rgba(243, 156, 18, 0.1)';
        ctx.lineWidth = 1;
        
        // Вертикальные линии
        for (let i = -5; i <= 5; i++) {
            const x = centerX + i * scale;
            if (x >= 0 && x <= width) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }
        
        // Горизонтальные линии
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

    // Рисование осей координат
    function drawAxes(ctx, width, height, centerX, centerY) {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(243, 156, 18, 0.5)';
        ctx.shadowBlur = 5;
        
        // Ось X
        ctx.beginPath();
        ctx.moveTo(20, centerY);
        ctx.lineTo(width - 20, centerY);
        ctx.stroke();
        
        // Ось Y
        ctx.beginPath();
        ctx.moveTo(centerX, 20);
        ctx.lineTo(centerX, height - 20);
        ctx.stroke();
        
        // Стрелки
        drawArrow(ctx, width - 20, centerY, 0);
        drawArrow(ctx, centerX, 20, 3*Math.PI / 2);
        
        // Отметки на осях
        drawAxisMarks(ctx, width, height, centerX, centerY);
        
        ctx.shadowBlur = 0;
    }

    // Рисование отметок на осях
    function drawAxisMarks(ctx, width, height, centerX, centerY) {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        
        // Отметки на оси X
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

        // Отметки на оси Y
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

    // Рисование стрелок
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

    // Рисование областей попадания с правильной геометрией
    function drawHitAreas(ctx, centerX, centerY, scaledR) {
        // 1-й квадрант: прямоугольник (0 ≤ x ≤ R, 0 ≤ y ≤ R)
        const rectGradient = ctx.createLinearGradient(centerX, centerY - scaledR, centerX + scaledR, centerY);
        rectGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
        rectGradient.addColorStop(1, 'rgba(41, 128, 185, 0.6)');
        ctx.fillStyle = rectGradient;
        ctx.fillRect(centerX, centerY - scaledR, scaledR, scaledR);

        // 2-й квадрант: треугольник (x ≤ 0, y ≥ 0, |x| + y ≤ R)
        // Треугольник: от (0,0) до (-R,0) до (0,R)
        const triangleGradient = ctx.createRadialGradient(centerX - scaledR/3, centerY - scaledR/3, 0, centerX, centerY, scaledR);
        triangleGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
        triangleGradient.addColorStop(1, 'rgba(41, 128, 185, 0.6)');
        ctx.fillStyle = triangleGradient;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);           // (0, 0)
        ctx.lineTo(centerX - scaledR, centerY); // (-R, 0)
        ctx.lineTo(centerX, centerY - scaledR); // (0, R)
        ctx.closePath();
        ctx.fill();

        // 3-й квадрант: четверть круга (x ≤ 0, y ≤ 0, x² + y² ≤ R²)
        // Четверть круга от π до 3π/2 (от -R по X до -R по Y)
        const circleGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scaledR);
        circleGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
        circleGradient.addColorStop(1, 'rgba(41, 128, 185, 0.6)');
        ctx.fillStyle = circleGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, scaledR, Math.PI / 2 , Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();

        // Контуры областей с эффектами
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(243, 156, 18, 0.3)';
        ctx.shadowBlur = 8;

        // Прямоугольник (1-й квадрант)
        ctx.strokeRect(centerX, centerY - scaledR, scaledR, scaledR);

        // Треугольник (2-й квадрант)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - scaledR, centerY);
        ctx.lineTo(centerX, centerY - scaledR);
        ctx.closePath();
        ctx.stroke();

        // Четверть круга (3-й квадрант)
        ctx.beginPath();
        ctx.arc(centerX, centerY, scaledR, Math.PI / 2, Math.PI);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

    // Рисование точки с анимацией
    function drawPoint(ctx, centerX, centerY, x, y, scale, isHit) {
        const pointX = centerX + x * scale;
        const pointY = centerY - y * scale;
        
        // Внешнее свечение
        ctx.shadowColor = isHit ? 'rgba(39, 174, 96, 0.8)' : 'rgba(231, 76, 60, 0.8)';
        ctx.shadowBlur = 15;
        
        // Основная точка
        ctx.fillStyle = isHit ? '#27ae60' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Внутренняя точка
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Подпись координат с фоном
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(pointX + 10, pointY - 25, 80, 20);
        
        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`(${x}, ${y})`, pointX + 15, pointY - 10);
    }

    // Рисование подписей и меток
    function drawLabels(ctx, centerX, centerY, scaledR, r, scale) {
        // Подпись R
        // ctx.fillStyle = '#f39c12';
        // ctx.font = 'bold 16px Arial';
        // ctx.textAlign = 'center';
        // ctx.fillText(`R = ${r}`, centerX + 30, centerY - scaledR - 10);
        
        // Подписи значений на осях
        ctx.font = '10px Arial';
        ctx.fillStyle = '#e0e0e0';
        ctx.textAlign = 'center';
        
        // Подписи на оси X
        // for (let i = -4; i <= 4; i++) {
        //     if (i !== 0) {
        //         const x = centerX + i * scale;
        //         if (x > 20 && x < 480) {
        //             ctx.fillText(i.toString(), x, centerY + 15);
        //         }
        //     }
        // }
        
        //Подписи на оси Y
        // for (let i = -4; i <= 4; i++) {
        //     if (i !== 0) {
        //         const y = centerY + i * scale;
        //         if (y > 20 && y < 480) {
        //             ctx.fillText((-i).toString(), centerX - 15, y + 3);
        //         }
        //     }
        // }
        
        // Подписи R/2, R на осях
        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 10px Arial';
        
        // R/2 и R на оси X
        ctx.fillText('R/2', centerX + scaledR/2, centerY + 15);
        ctx.fillText('R', centerX + scaledR, centerY + 15);
        ctx.fillText('-R/2', centerX - scaledR/2, centerY + 15);
        ctx.fillText('-R', centerX - scaledR, centerY + 15);
        
        // R/2 и R на оси Y
        ctx.fillText('R/2', centerX - 15, centerY - scaledR/2);
        ctx.fillText('R', centerX - 15, centerY - scaledR);
        ctx.fillText('-R/2', centerX - 15, centerY + scaledR/2);
        ctx.fillText('-R', centerX - 15, centerY + scaledR);
    }

    // Добавление строки в таблицу результатов
    function addResultRow(x, y, r, currentTime, executionTimeMs, isHit) {
        if (!resultsTable) return;
        const row = document.createElement('tr');
        const values = [
            x,
            y,
            r,
            currentTime,
            `${typeof executionTimeMs === 'number' ? executionTimeMs.toFixed(2) : executionTimeMs} ms`,
            isHit ? 'Попадание' : 'Промах'
        ];
        values.forEach(value => {
            const td = document.createElement('td');
            td.textContent = String(value);
            row.appendChild(td);
        });
        resultsTable.appendChild(row);
    }
});