// Основные переменные
let musicTracks = [];
let currentFileName = '';

// Элементы DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const pasteHtmlBtn = document.getElementById('pasteHtmlBtn');
const resultsDiv = document.getElementById('results');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const songCount = document.getElementById('songCount');
const fileName = document.getElementById('fileName');
const tableBody = document.getElementById('tableBody');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const downloadTxtBtn = document.getElementById('downloadTxtBtn');
const copyListBtn = document.getElementById('copyListBtn');
const clearBtn = document.getElementById('clearBtn');
const modal = document.getElementById('modal');
const htmlInput = document.getElementById('htmlInput');
const cancelBtn = document.getElementById('cancelBtn');
const processHtmlBtn = document.getElementById('processHtmlBtn');

// Функция извлечения музыки из HTML
function extractMusicFromHTML(htmlContent) {
    console.log('🔍 Начинаю извлечение треков из HTML...');
    
    // Создаем временный DOM элемент
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Ищем все элементы с треками
    const trackElements = doc.querySelectorAll('.track-with-cover');
    
    // Очищаем предыдущие результаты
    musicTracks = [];
    
    // Показываем прогресс-бар
    progressBar.style.display = 'block';
    progressFill.style.width = '0%';
    
    // Обрабатываем каждый трек
    trackElements.forEach((track, index) => {
        // Обновляем прогресс
        const progress = ((index + 1) / trackElements.length) * 2000;
        progressFill.style.width = `${progress}%`;
        
        // Извлекаем название песни
        const titleElement = track.querySelector('span[itemprop="name"]');
        const title = titleElement ? titleElement.textContent.trim() : 'Неизвестно';
        
        // Извлекаем всех исполнителей
        const artistElements = track.querySelectorAll('.track-with-cover_artist span[itemprop="name"]');
        const artists = Array.from(artistElements).map(artist => artist.textContent.trim());
        
        // Собираем строку исполнителей
        const artistStr = artists.length > 0 ? artists.join(', ') : 'Неизвестно';
        
        // Добавляем в массив
        musicTracks.push({
            number: index + 1,
            title: title,
            artist: artistStr
        });
    });
    
    // Скрываем прогресс-бар
    setTimeout(() => {
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
    }, 500);
    
    console.log(`✅ Извлечено ${musicTracks.length} треков!`);
    return musicTracks;
}

// Функция отображения результатов
function displayResults() {
    // Обновляем статистику
    songCount.textContent = musicTracks.length;
    fileName.textContent = currentFileName || 'из HTML кода';
    
    // Очищаем таблицу
    tableBody.innerHTML = '';
    
    // Заполняем таблицу (первые 2000 для производительности)
    const displayCount = Math.min(musicTracks.length, 2000);
    
    for (let i = 0; i < displayCount; i++) {
        const track = musicTracks[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${track.number}</td>
            <td>${escapeHtml(track.title)}</td>
            <td>${escapeHtml(track.artist)}</td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Если треков больше 2000, показываем сообщение
    if (musicTracks.length > 2000) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
                ... и ещё ${musicTracks.length - 2000} песен
            </td>
        `;
        tableBody.appendChild(row);
    }
    
    // Показываем блок с результатами
    resultsDiv.style.display = 'block';
    
    // Прокручиваем к результатам
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Функция для скачивания CSV
function downloadCSV() {
    if (musicTracks.length === 0) {
        alert('Нет данных для скачивания!');
        return;
    }
    
    // Создаем CSV содержимое
    let csvContent = "Номер;Название;Исполнитель\n";
    
    musicTracks.forEach(track => {
        // Экранируем кавычки для CSV
        const safeTitle = track.title.replace(/"/g, '""');
        const safeArtist = track.artist.replace(/"/g, '""');
        csvContent += `${track.number};"${safeTitle}";"${safeArtist}"\n`;
    });
    
    // Создаем и скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `music_list_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    
    console.log('📁 CSV файл скачан!');
}

// Функция для скачивания TXT
function downloadTXT() {
    if (musicTracks.length === 0) {
        alert('Нет данных для скачивания!');
        return;
    }
    
    // Создаем текстовое содержимое
    let txtContent = `Список песен (${musicTracks.length} треков)\n`;
    txtContent += `Сгенерировано: ${new Date().toLocaleString()}\n\n`;
    
    musicTracks.forEach(track => {
        txtContent += `${track.number}. ${track.title} - ${track.artist}\n`;
    });
    
    // Создаем и скачиваем файл
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `music_list_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    
    console.log('📄 TXT файл скачан!');
}

// Функция копирования списка
function copyListToClipboard() {
    if (musicTracks.length === 0) {
        alert('Нет данных для копирования!');
        return;
    }
    
    // Создаем текст для копирования
    let textContent = '';
    musicTracks.forEach(track => {
        textContent += `${track.number}. ${track.title} - ${track.artist}\n`;
    });
    
    // Копируем в буфер обмена
    navigator.clipboard.writeText(textContent)
        .then(() => {
            alert(`✅ Список из ${musicTracks.length} песен скопирован в буфер обмена!`);
        })
        .catch(err => {
            console.error('Ошибка копирования:', err);
            alert('❌ Не удалось скопировать в буфер обмена');
        });
}

// Функция очистки
function clearResults() {
    musicTracks = [];
    currentFileName = '';
    resultsDiv.style.display = 'none';
    tableBody.innerHTML = '';
    fileInput.value = '';
    console.log('🗑️ Результаты очищены');
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

// Загрузка файла через кнопку
selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

// Обработка выбранного файла
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    currentFileName = file.name;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const htmlContent = event.target.result;
        extractMusicFromHTML(htmlContent);
        displayResults();
    };
    reader.readAsText(file);
});

// Drag & Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm') && !file.name.endsWith('.txt')) {
        alert('Пожалуйста, выберите HTML или текстовый файл!');
        return;
    }
    
    currentFileName = file.name;
    fileInput.files = e.dataTransfer.files;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const htmlContent = event.target.result;
        extractMusicFromHTML(htmlContent);
        displayResults();
    };
    reader.readAsText(file);
});

// Кнопка "Вставить HTML код"
pasteHtmlBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    htmlInput.focus();
});

// Кнопка "Отмена" в модальном окне
cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    htmlInput.value = '';
});

// Кнопка "Обработать" в модальном окне
processHtmlBtn.addEventListener('click', () => {
    const htmlContent = htmlInput.value.trim();
    if (!htmlContent) {
        alert('Вставьте HTML код!');
        return;
    }
    
    currentFileName = 'из HTML кода';
    extractMusicFromHTML(htmlContent);
    displayResults();
    
    modal.style.display = 'none';
    htmlInput.value = '';
});

// Кнопки управления
downloadCsvBtn.addEventListener('click', downloadCSV);
downloadTxtBtn.addEventListener('click', downloadTXT);
copyListBtn.addEventListener('click', copyListToClipboard);
clearBtn.addEventListener('click', clearResults);

// Закрытие модального окна по клику вне его
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        htmlInput.value = '';
    }
});

// Сообщение при загрузке
console.log('🎵 Музыкальный экстрактор загружен!');
console.log('📝 Инструкция:');
console.log('1. Загрузи HTML файл с музыкой');
console.log('2. Или вставь HTML код вручную');
console.log('3. Скачай результаты в CSV или TXT формате');