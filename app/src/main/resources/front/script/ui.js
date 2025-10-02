// Работа с блокировкой ввода и с табилцей

export function sanitizeToDigits(el) {
    const raw = el.value;
    const onlyDigitsAndDots = raw.replace(/[^0-9.]/g, '');
    const parts = onlyDigitsAndDots.split('.');
    el.value = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : parts[0];
}

export function sanitizeToSignedInt(el) {
    const startsWithMinus = el.value.trim().startsWith('-');
    const withoutInvalid = el.value.replace(/[^0-9.\-]/g, '');
    const withoutMinus = withoutInvalid.replace(/-/g, '');
    const parts = withoutMinus.split('.');
    const normalized = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : parts[0];
    el.value = (startsWithMinus ? '-' : '') + normalized;
}

export function blockInvalidKeys(e, allowMinus = false) {
    const blocked = allowMinus ? ['+', 'e', 'E', ',', ' '] : ['-', '+', 'e', 'E', ',', ' '];
    if (blocked.includes(e.key)) {
        e.preventDefault();
        return;
    }
    if (allowMinus && e.key === '-') {
        if (e.target.selectionStart !== 0 || e.target.value.includes('-')) {
            e.preventDefault();
            return;
        }
    }
    if (e.key === '.') {
        const { value, selectionStart, selectionEnd } = e.target;
        const hasDot = value.includes('.');
        const selectionCoversDot = hasDot && selectionStart != null && selectionEnd != null && value.slice(selectionStart, selectionEnd).includes('.');
        if (hasDot && !selectionCoversDot) {
            e.preventDefault();
        }
    }
}

export function showError(container, message) {
    container.innerHTML = '<div class="error">' + message + '</div>';
}

export function showResult(container, isHit) {
    const message = isHit ? 'Попадание!' : 'Промах!';
    const className = isHit ? 'success' : 'error';
    container.innerHTML = '<div class="' + className + '">' + message + '</div>';
}

export function addResultRow(table, attempt, x, y, r, currentTime, executionTimeMs, isHit) {
    if (!table) return;
    const row = document.createElement('tr');
    const values = [
        attempt,
        x,
        y,
        r,
        `${typeof executionTimeMs === 'number' ? executionTimeMs.toFixed(2) + ' ms' : executionTimeMs}`,
        currentTime,
        isHit == 'Ошибка' ? isHit : (isHit ? 'Попадание' : 'Промах')
    ];
    values.forEach(value => {
        const td = document.createElement('td');
        td.textContent = String(value);
        row.appendChild(td);
    });
    table.insertBefore(row, table.children[1]);
}


