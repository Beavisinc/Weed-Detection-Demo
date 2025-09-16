// Управление видимостью подписей (labelgun) с белым "ореолом" вокруг текста
var hideLabel = function(label) {
    if (!label || !label.labelObject) return; // защита
    label.labelObject.style.opacity = 0;
    label.labelObject.style.transition = 'opacity 0s';
}; // [2]

var showLabel = function(label) {
    if (!label || !label.labelObject) return; // защита
    label.labelObject.style.opacity = 1;
    label.labelObject.style.transition = 'opacity 0.2s';

    // Стили "белого буфера" вокруг текста (универсальный способ через text-shadow)
    // Набор из 8 теней формирует псевдо-обводку вокруг букв
    label.labelObject.style.textShadow =
        '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff,' +
        '1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff';

    // Цвет самих букв (по желанию): чёрный для контраста
    label.labelObject.style.color = '#000';

    // Доп. вариант для браузеров с поддержкой: псевдо-обводка штрихом
    // Оставлено 0px, т.к. в большинстве случаев text-shadow достаточно
    label.labelObject.style.webkitTextStroke = '0px #fff';
}; // [2][1]

// Инициализация labelgun
labelEngine = new labelgun.default(hideLabel, showLabel); // [2]

// Счётчики и хранилища
var id = 0;
var labels = [];
var totalMarkers = 0; // [2]

// Пересчёт подписи после изменений
function resetLabels(markers) {
    labelEngine.reset();
    var i = 0;
    for (var j = 0; j < markers.length; j++) {
        markers[j].eachLayer(function(label) {
            addLabel(label, ++i);
        });
    }
    labelEngine.update();
} // [2]

// Добавление подписи в labelgun
function addLabel(layer, id) {
    if (!layer.getTooltip || !layer.getTooltip()) return;

    // Извлекаем DOM-контейнер tooltip (у Leaflet нет прямого getContainer)
    var tt = layer.getTooltip();
    if (!tt || !tt._source || !tt._source._tooltip || !tt._source._tooltip._container) return;
    var label = tt._source._tooltip._container;

    // Применяем буфер сразу при создании контейнера (на случай, если showLabel вызовется позже)
    label.style.textShadow =
        '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff,' +
        '1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff';
    label.style.color = '#000';
    label.style.webkitTextStroke = '0px #fff';

    // Получаем геометрию контейнера для расчёта коллизий
    var rect = label.getBoundingClientRect();
    var bottomLeft = map.containerPointToLatLng([rect.left, rect.bottom]);
    var topRight   = map.containerPointToLatLng([rect.right, rect.top]);
    var boundingBox = {
        bottomLeft: [bottomLeft.lng, bottomLeft.lat],
        topRight:   [topRight.lng,   topRight.lat]
    };

    // Регистрируем подпись в labelgun
    labelEngine.ingestLabel(
        boundingBox,
        id,
        parseInt(Math.random() * (5 - 1) + 1), // вес
        label,
        "Label " + id,
        false
    );

    // Добавляем слой на карту, если ещё не добавлен
    if (!layer.added) {
        layer.addTo(map);
        layer.added = true;
    }
} // [2][1]
