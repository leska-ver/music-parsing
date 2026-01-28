// Основные переменные
let musicTracks = [];
let currentFileName = '';
let duplicatesFound = []; // Храним найденные дубликаты

// Элементы DOM (будут инициализированы после загрузки DOM)
let uploadArea, fileInput, selectFileBtn, pasteHtmlBtn, resultsDiv, progressBar, progressFill;
let songCount, fileName, tableBody, downloadCsvBtn, downloadTxtBtn, copyListBtn;
let removeDuplicatesBtn, clearBtn, modal, htmlInput, cancelBtn, processHtmlBtn;
// Элементы для модального окна Дубликаты
let duplicatesModal, duplicatesContent, duplicatesStats, cancelRemoveBtn, confirmRemoveBtn;
let resultModal, resultTitle, resultContent, closeResultBtn;

// Инициализация DOM элементов
function initDomElements() {
	uploadArea = document.getElementById('uploadArea');
	fileInput = document.getElementById('fileInput');
	selectFileBtn = document.getElementById('selectFileBtn');
	pasteHtmlBtn = document.getElementById('pasteHtmlBtn');
	resultsDiv = document.getElementById('results');
	progressBar = document.getElementById('progressBar');
	progressFill = document.getElementById('progressFill');
	songCount = document.getElementById('songCount');
	fileName = document.getElementById('fileName');
	tableBody = document.getElementById('tableBody');
	downloadCsvBtn = document.getElementById('downloadCsvBtn');
	downloadTxtBtn = document.getElementById('downloadTxtBtn');
	copyListBtn = document.getElementById('copyListBtn');
	removeDuplicatesBtn = document.getElementById('removeDuplicatesBtn');
	clearBtn = document.getElementById('clearBtn');
	modal = document.getElementById('modal');
	htmlInput = document.getElementById('htmlInput');
	cancelBtn = document.getElementById('cancelBtn');
	processHtmlBtn = document.getElementById('processHtmlBtn');

	// Элементы для модальных окон
	duplicatesModal = document.getElementById('duplicatesModal');
	duplicatesContent = document.getElementById('duplicatesContent');
	duplicatesStats = document.getElementById('duplicatesStats');
	cancelRemoveBtn = document.getElementById('cancelRemoveBtn');
	confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
	
	resultModal = document.getElementById('resultModal');
	resultTitle = document.getElementById('resultTitle');
	resultContent = document.getElementById('resultContent');
	closeResultBtn = document.getElementById('closeResultBtn');
	
	// Проверяем, что все элементы найдены
	const elements = {
			uploadArea, fileInput, selectFileBtn, pasteHtmlBtn, resultsDiv, progressBar, progressFill,
			songCount, fileName, tableBody, downloadCsvBtn, downloadTxtBtn, copyListBtn,
			removeDuplicatesBtn, clearBtn, modal, htmlInput, cancelBtn, processHtmlBtn,
			duplicatesModal, duplicatesContent, duplicatesStats, cancelRemoveBtn, confirmRemoveBtn,
			resultModal, resultTitle, resultContent, closeResultBtn
	};
    
	let missingElements = [];
	for (const [name, element] of Object.entries(elements)) {
			if (!element) {
					missingElements.push(name);
			}
	}
	
	if (missingElements.length > 0) {
			console.warn('Не найдены элементы DOM:', missingElements);
	} else {
			console.log('✅ Все DOM элементы успешно инициализированы');
	}
}

// Функция поиска дубликатов - ПРОСТАЯ и РАБОЧАЯ
function findDuplicates(tracks) {
	const seen = new Map();
	const duplicates = [];
	
	// Просто считаем дубликаты, не изменяя номера
	tracks.forEach(track => {
		const key = `${track.title.toLowerCase().trim()}||${track.artist.toLowerCase().trim()}`;
		
		if (seen.has(key)) {
			// Это дубликат
			const original = seen.get(key);
			duplicates.push({
				duplicate: track,
				originalNumber: original.number,
				duplicateNumber: track.number
			});
		} else {
			// Первое вхождение
			seen.set(key, track);
		}
	});
	
	return duplicates;
}

// Функция извлечения музыки из HTML
function extractMusicFromHTML(htmlContent) {
	console.log('🔍 Начинаю извлечение треков из HTML...');
	
	try {
		// Создаем временный DOM элемент
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'text/html');
		
		// Ищем все элементы с треками
		const trackElements = doc.querySelectorAll('.track-with-cover');
		
		console.log(`Найдено элементов .track-with-cover: ${trackElements.length}`);
		
		// Очищаем предыдущие результаты
		musicTracks = [];
		duplicatesFound = [];
		
		// Показываем прогресс-бар
		if (progressBar) {
			progressBar.style.display = 'block';
		}
		if (progressFill) {
			progressFill.style.width = '0%';
		}
			
		// Обрабатываем каждый трек
		trackElements.forEach((track, index) => {
			// Обновляем прогресс
			if (progressFill && trackElements.length > 0) {
				const progress = ((index + 1) / trackElements.length) * 100;
				progressFill.style.width = `${progress}%`;
			}
			
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
			if (progressBar) {
				progressBar.style.display = 'none';
			}
			if (progressFill) {
				progressFill.style.width = '0%';
			}
		}, 500);
		
		console.log(`✅ Извлечено ${musicTracks.length} треков!`);
		
		return musicTracks;
	} catch (error) {
		console.error('Ошибка при извлечении музыки:', error);
		showResult('Ошибка', 'Ошибка при обработке HTML файла. Проверьте консоль для подробностей.');
		return [];
	}
}

// Функция отображения результатов
function displayResults() {
	try {
		// Обновляем статистику
		if (songCount) {
			songCount.textContent = musicTracks.length;
		}
		if (fileName) {
			fileName.textContent = currentFileName || 'из HTML кода';
		}
		
		// Проверяем есть ли дубликаты
		const duplicates = findDuplicates(musicTracks);
		
		// Обновляем текст кнопки в зависимости от наличия дубликатов
		if (removeDuplicatesBtn) {
			if (duplicates.length > 0) {
				removeDuplicatesBtn.innerHTML = `🔍 Удалить дубликаты (${duplicates.length})`;
				removeDuplicatesBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)';
			} else {
					removeDuplicatesBtn.innerHTML = '🔍 Удалить дубликаты';
					removeDuplicatesBtn.style.background = '';
			}
		}
			
		// Очищаем таблицу
		if (tableBody) {
			tableBody.innerHTML = '';
		} else {
			console.error('Элемент tableBody не найден!');
			return;
		}
			
		// Заполняем таблицу (первые 2000 для производительности)
		const displayCount = Math.min(musicTracks.length, 2000);
		
		for (let i = 0; i < displayCount; i++) {
			const track = musicTracks[i];
			const row = document.createElement('tr');
			
			// Проверяем, является ли этот трек дубликатом
			const isDuplicate = duplicates.some(d => d.duplicate.number === track.number);
			
			if (isDuplicate) {
				row.style.backgroundColor = '#fff5f5'; // Красноватый фон для дубликатов
				row.style.opacity = '0.7';
			}
			
			row.innerHTML = `
				<td>${track.number}</td>
				<td>${escapeHtml(track.title)} ${isDuplicate ? '<span style="color: #ff6b6b; font-size: 12px;">(дубликат)</span>' : ''}</td>
				<td>${escapeHtml(track.artist)}</td>
			`;
			
			tableBody.appendChild(row);
		}
		
		// Если треков больше 2000, показываем сообщение
		if (musicTracks.length > 2000 && tableBody) {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td colspan="3" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
					... и ещё ${musicTracks.length - 2000} песен
				</td>
			`;
			tableBody.appendChild(row);
		}
		
		// Показываем блок с результатами
		if (resultsDiv) {
			resultsDiv.style.display = 'block';
			
			// Прокручиваем к результатам
			resultsDiv.scrollIntoView({ behavior: 'smooth' });
		}
		
		console.log(`📊 Отображено ${displayCount} треков, найдено ${duplicates.length} дубликатов`);
	} catch (error) {
		console.error('Ошибка при отображении результатов:', error);
		showResult('Ошибка', 'Ошибка при отображении результатов. Проверьте консоль.');
	}
}

// Функция удаления дубликатов
function removeDuplicates() {
	if (musicTracks.length === 0) {
		showResult('Внимание', 'Нет данных для обработки!');
		return;
	}
	
	const beforeCount = musicTracks.length;
	const uniqueTracks = [];
	const seen = new Set();
	const removedDuplicates = [];
	
	// Собираем уникальные треки
	musicTracks.forEach(track => {
		const key = `${track.title.toLowerCase().trim()}||${track.artist.toLowerCase().trim()}`;
		
		if (!seen.has(key)) {
			seen.add(key);
			// Сохраняем трек с новым порядковым номером
			uniqueTracks.push({
				number: uniqueTracks.length + 1,
				title: track.title,
				artist: track.artist
			});
		} else {
			// Запоминаем удаленный дубликат
			removedDuplicates.push({
				title: track.title,
				artist: track.artist,
				number: track.number
			});
		}
	});
	
	const afterCount = uniqueTracks.length;
	
	if (beforeCount === afterCount) {
		showResult('✅ Результат', 'Дубликатов не найдено!');
		return;
	}
	
	// Показываем модальное окно с дубликатами
	showDuplicatesModal(removedDuplicates, beforeCount, afterCount, uniqueTracks);
}

// Функция показа модального окна с дубликатами
function showDuplicatesModal(duplicates, beforeCount, afterCount, uniqueTracks) {
  if (!duplicatesModal || !duplicatesContent || !duplicatesStats) {
		// Fallback на стандартный confirm
		const message = `Найдено ${duplicates.length} дубликатов. Удалить?\n\nБыло: ${beforeCount} треков\nСтало: ${afterCount} уникальных треков`;
		if (confirm(message)) {
			performRemoveDuplicates(duplicates, beforeCount, afterCount, uniqueTracks);
		}
		return;
  }
  
  // Формируем компактный HTML с дубликатами
  let duplicatesHTML = '<div style="display: grid; gap: 20px; max-height: 400px; overflow-y: auto;">';
  duplicates.forEach((dup, index) => {
		duplicatesHTML += `
			<div class="duplicate-item">
				<strong>${index + 1}.</strong> "${dup.title}" - ${dup.artist} 
				<span class="duplicate-number" style="display: grid; block;">был #${dup.number}</span>
			</div>
		`;
  });
  duplicatesHTML += '</div>';
  
  // Обновляем содержимое модального окна
  duplicatesContent.innerHTML = duplicatesHTML;
  duplicatesStats.innerHTML = `
		<div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
			<span>Дубликатов: <strong>${duplicates.length}</strong></span>
			<span>Было: <strong>${beforeCount}</strong></span>
			<span>Станет: <strong>${afterCount}</strong></span>
		</div>
  `;
  
  // Показываем модальное окно
  duplicatesModal.style.display = 'flex';
  
  // Сохраняем данные для использования после подтверждения
  window.currentDuplicatesData = {
		duplicates: duplicates,
		beforeCount: beforeCount,
		afterCount: afterCount,
		uniqueTracks: uniqueTracks
  };
}

// Функция выполнения удаления дубликатов
function performRemoveDuplicates(duplicates, beforeCount, afterCount, uniqueTracks) {
	musicTracks = uniqueTracks;
	duplicatesFound = duplicates;
	
	// Показываем результат
	let resultHTML = `
		<p><strong>✅ Удалено ${duplicates.length} дубликатов!</strong></p>
		<p>Было: ${beforeCount} треков</p>
		<p>Стало: ${afterCount} уникальных треков</p>
		
		<div style="padding: 10px; background: #fff; border-radius: 5px;">
			<p style="font-weight: bold; margin-bottom: 10px;">Удаленные дубликаты:</p>
`;
	
	duplicates.forEach((dup, index) => {
		resultHTML += `
			<div style="padding: 5px 0; border-bottom: 1px solid #eee; user-select: text;">
				${index + 1}. "${dup.title}" - ${dup.artist} (был #${dup.number})
			</div>
		`;
	});
    
	resultHTML += '</div>';
	
	showResult('✅ Удаление дубликатов', resultHTML);
	
	// Предлагаем сохранить отчет через 500мс
	setTimeout(() => {
		if (confirm('Сохранить отчет об удаленных дубликатах в файл?')) {
			saveDuplicatesReport(duplicates, beforeCount, afterCount);
		}
		displayResults();
	}, 500);
}

// Функция сохранения отчета
function saveDuplicatesReport(duplicates, beforeCount, afterCount) {
	let report = `Отчет об удаленных дубликатах\n`;
	report += `Дата: ${new Date().toLocaleString()}\n`;
	report += `Файл: ${currentFileName || 'из HTML кода'}\n`;
	report += `Удалено дубликатов: ${duplicates.length}\n`;
	report += `Было треков: ${beforeCount}\n`;
	report += `Стало треков: ${afterCount}\n\n`;
	report += `СПИСОК УДАЛЕННЫХ ДУБЛИКАТОВ:\n`;
	report += '='.repeat(50) + '\n\n';
	
	duplicates.forEach((dup, index) => {
		report += `${index + 1}. "${dup.title}" - ${dup.artist} (был #${dup.number})\n`;
		report += `   Ключ для поиска: ${dup.title.toLowerCase()} ${dup.artist.toLowerCase()}\n\n`;
	});
    
	const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = `duplicates_report_${new Date().toISOString().slice(0,10)}.txt`;
	link.click();
}

// Функция показа результата в модальном окне
function showResult(title, content) {
	if (!resultModal || !resultTitle || !resultContent) {
		// Fallback на стандартный alert
		alert(title + '\n\n' + content.replace(/<[^>]*>/g, ''));
		return;
	}
	
	resultTitle.textContent = title;
	resultContent.innerHTML = content;
	resultModal.style.display = 'flex';
}

// Функция для скачивания CSV
function downloadCSV() {
	if (musicTracks.length === 0) {
		showResult('Внимание', 'Нет данных для скачивания!');
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
		showResult('Внимание', 'Нет данных для скачивания!');
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
		showResult('Внимание', 'Нет данных для копирования!');
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
			showResult('✅ Успех', `Список из ${musicTracks.length} песен скопирован в буфер обмена!`);
		})
		.catch(err => {
			console.error('Ошибка копирования:', err);
			showResult('❌ Ошибка', 'Не удалось скопировать в буфер обмена');
		});
}

// Функция очистки
function clearResults() {
	musicTracks = [];
	currentFileName = '';
	duplicatesFound = [];
	
	// Закрываем все модальные окна
	if (duplicatesModal) {
		duplicatesModal.style.display = 'none';
	}
	if (resultModal) {
		resultModal.style.display = 'none';
	}
	if (modal) {
		modal.style.display = 'none';
	}
	
	if (resultsDiv) {
		resultsDiv.style.display = 'none';
	}
	
	if (tableBody) {
		tableBody.innerHTML = '';
	}
	
	if (fileInput) {
		fileInput.value = '';
	}
    
	// Восстанавливаем оригинальные значения
	if (songCount) {
		songCount.textContent = '0';
	}
	
	if (fileName) {
		fileName.textContent = '-';
	}
	
	// Сбрасываем кнопку удаления дубликатов
	if (removeDuplicatesBtn) {
		removeDuplicatesBtn.innerHTML = '🔍 Удалить дубликаты';
		removeDuplicatesBtn.style.background = '';
	}
	
	console.log('🗑️ Результаты очищены');
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function setupEventListeners() {
	// Загрузка файла через кнопку
	if (selectFileBtn && fileInput) {
		selectFileBtn.addEventListener('click', () => {
			fileInput.click();
		});
	}
	
	// Обработка выбранного файла
	if (fileInput) {
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
	}
	
	// Drag & Drop
	if (uploadArea) {
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
				showResult('Ошибка', 'Пожалуйста, выберите HTML или текстовый файл!');
				return;
			}
				
			currentFileName = file.name;
			if (fileInput) {
				fileInput.files = e.dataTransfer.files;
			}
			
			const reader = new FileReader();
			reader.onload = (event) => {
				const htmlContent = event.target.result;
				extractMusicFromHTML(htmlContent);
				displayResults();
			};
			reader.readAsText(file);
		});
	}
	
	// Кнопка "Вставить HTML код"
	if (pasteHtmlBtn && modal && htmlInput) {
		pasteHtmlBtn.addEventListener('click', () => {
			modal.style.display = 'flex';
			htmlInput.focus();
		});
	}
	
	// Кнопка "Отмена" в модальном окне
	if (cancelBtn && modal && htmlInput) {
		cancelBtn.addEventListener('click', () => {
			modal.style.display = 'none';
			htmlInput.value = '';
		});
	}
	
	// Кнопка "Обработать" в модальном окне
	if (processHtmlBtn && modal && htmlInput) {
		processHtmlBtn.addEventListener('click', () => {
			const htmlContent = htmlInput.value.trim();
			if (!htmlContent) {
				showResult('Внимание', 'Вставьте HTML код!');
				return;
			}
			
			currentFileName = 'из HTML кода';
			extractMusicFromHTML(htmlContent);
			displayResults();
			
			modal.style.display = 'none';
			htmlInput.value = '';
		});
	}
	
	// Кнопки управления
	if (downloadCsvBtn) {
		downloadCsvBtn.addEventListener('click', downloadCSV);
	}
	
	if (downloadTxtBtn) {
		downloadTxtBtn.addEventListener('click', downloadTXT);
	}
	
	if (copyListBtn) {
		copyListBtn.addEventListener('click', copyListToClipboard);
	}
	
	if (removeDuplicatesBtn) {
		removeDuplicatesBtn.addEventListener('click', removeDuplicates);
	}
	
	if (clearBtn) {
		clearBtn.addEventListener('click', clearResults);
	}
    
	// Обработчики для модального окна с дубликатами
	if (cancelRemoveBtn && duplicatesModal) {
		cancelRemoveBtn.addEventListener('click', () => {
			duplicatesModal.style.display = 'none';
			window.currentDuplicatesData = null;
		});
	}
	
	if (confirmRemoveBtn && duplicatesModal) {
		confirmRemoveBtn.addEventListener('click', () => {
			duplicatesModal.style.display = 'none';
			
			if (window.currentDuplicatesData) {
				const { duplicates, beforeCount, afterCount, uniqueTracks } = window.currentDuplicatesData;
				performRemoveDuplicates(duplicates, beforeCount, afterCount, uniqueTracks);
				window.currentDuplicatesData = null;
			}
		});
	}
	
	// Обработчик для модального окна с результатом
	if (closeResultBtn && resultModal) {
		closeResultBtn.addEventListener('click', () => {
			resultModal.style.display = 'none';
		});
	}
	
	// Закрытие модальных окон по клику вне их
	if (modal && htmlInput) {
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.style.display = 'none';
				htmlInput.value = '';
			}
		});
	}
	
	if (duplicatesModal) {
		duplicatesModal.addEventListener('click', (e) => {
			if (e.target === duplicatesModal) {
				duplicatesModal.style.display = 'none';
				window.currentDuplicatesData = null;
			}
		});
	}
	
	if (resultModal) {
		resultModal.addEventListener('click', (e) => {
			if (e.target === resultModal) {
				resultModal.style.display = 'none';
			}
		});
	}
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
	console.log('🔄 Инициализация музыкального экстрактора...');
	
	// Инициализируем DOM элементы
	initDomElements();
	
	// Настраиваем обработчики событий
	setupEventListeners();
	
	// Сообщение при загрузке
	console.log('🎵 Музыкальный экстрактор загружен!');
	console.log('📝 Инструкция:');
	console.log('1. Загрузи HTML файл с музыкой');
	console.log('2. Или вставь HTML код вручную');
	console.log('3. Скачай результаты в CSV или TXT формате');
	console.log('4. Используй кнопку "Удалить дубликаты" для очистки списка');
});

// Fallback для старых браузеров
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDomElements);
} else {
	// DOM уже загружен
	initDomElements();
	setupEventListeners();
}