// Для запросов на сервер

export async function sendToServerAndGetResponse(x, y, r) {
    const formData = new FormData();
    formData.append('x', x);
    formData.append('y', y);
    formData.append('r', r);

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
    };

    try {
        const response = await fetch("/fcgi-bin/server.jar", requestOptions);
        const result = await response.json(); // возвращаем json с сервера

        if (response.ok) {
            return {
                x: x,
                y: y,
                r: r,
                execTime: `${result.time} ms`,
                curentTime: new Date(result.now).toLocaleString(),
                isHit: result.result,
                status: response.status
            };
        } else if (response.status === 400) { // 400 ошибка - сервер не может понять запрос из-за его неверного синтаксиса
            return {
                x: x,
                y: y,
                r: r,
                execTime: "N/A",
                curentTime: new Date(result.now).toLocaleString(),
                isHit: false,
                status: response.status
            };
        } else {
            return {
                x: x,
                y: y,
                r: r,
                execTime: "N/A",
                curentTime: "N/A",
                isHit: false,
                status: response.status
            };
        }
    } catch (error) { // тут ошибка соединения с сервером (сервер лежит)
        return {
            x: x,
            y: y,
            r: r,
            execTime: "N/A",
            curentTime: "N/A",
            isHit: false,
            status: 0 // network error
        };
    }
}


