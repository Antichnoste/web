import { drawGeometry } from './canvas.js';
import { sendToServerAndGetResponse } from './api.js';
import { sanitizeToDigits, sanitizeToSignedInt, blockInvalidKeys, showError, showResult, addResultRow } from './ui.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('geometryForm');
    const resultDiv = document.getElementById('result');
    const canvas = document.getElementById('geometryCanvas');
    const ctx = canvas.getContext('2d');
    const resultsTable = document.getElementById('result-table');
    let attemptCounter = 0;

    drawGeometry(ctx, canvas.width, canvas.height);

    const rInput = document.getElementById('r');
    const yInput = document.getElementById('y');

    yInput.addEventListener('input', () => sanitizeToSignedInt(yInput));
    yInput.addEventListener('paste', () => setTimeout(() => sanitizeToSignedInt(yInput), 0));

    rInput.addEventListener('input', () => sanitizeToDigits(rInput));
    rInput.addEventListener('paste', () => setTimeout(() => sanitizeToDigits(rInput), 0));

    yInput.addEventListener('keydown', (e) => blockInvalidKeys(e, true));
    rInput.addEventListener('keydown', (e) => blockInvalidKeys(e, false));

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const x = parseFloat(formData.get('x'));
        const y = parseFloat(formData.get('y'));
        const r = parseFloat(formData.get('r'));

        if (!validateInputs(x, y, r, resultDiv)) {
            drawGeometry(ctx, canvas.width, canvas.height);
            return;
        }

        const result = await sendToServerAndGetResponse(x, y, r);

        if (result.status == 200){
            drawGeometry(ctx, canvas.width, canvas.height, r, x, y, result.isHit);
            showResult(resultDiv, result.isHit);
        } else{
            drawGeometry(ctx, canvas.width, canvas.height);
            showError(resultDiv, "Ошибка работы с сервером!")
        }

        attemptCounter += 1;
        addResultRow(
            resultsTable,
            attemptCounter,
            x,
            y,
            r,
            result.curentTime,
            result.execTime,
            result.status == 200 ? result.isHit : 'Ошибка'
        );
    });
});

function validateInputs(x, y, r, resultDiv) {
    let isValid = true;
    let errorMessage = '';

    const validXValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
    if (isNaN(x) || !validXValues.includes(x)) {
        errorMessage += 'X должно быть одним из предустановленных значений: -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2<br>';
        isValid = false;
    }

    if (isNaN(y) || y < -3 || y > 5) {
        errorMessage += 'Y должно быть числом в диапазоне от -3 до 5<br>';
        isValid = false;
    }

    if (isNaN(r) || r < 1 || r > 4) {
        errorMessage += 'R должно быть числом в диапазоне от 1 до 4<br>';
        isValid = false;
    }

    if (!isValid) {
        showError(resultDiv, errorMessage);
    }

    return isValid;
}