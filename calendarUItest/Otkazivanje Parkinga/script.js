const calendarContainer = document.getElementById('calendarContainer');
const monthTitle = document.getElementById('monthTitle');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDaysList = document.getElementById('selectedDaysList');
const clearSelectionsBtn = document.getElementById('clearSelections'); // Дугме за брисање

const daysOfWeek = ['Нед', 'Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб'];
let currentDisplayedDate = new Date();

// 1. КОНТРОЛА СЕЛЕКЦИЈЕ: Користимо Set за чување свих изабраних датума (YYYYMMDD)
// Set аутоматски спречава дупликате и лако се проверава постојање
let selectedDatesSet = new Set(); 
// Можете додати localStorage овде ако желите да се памти и након освежавања странице

// Функција која ажурира текст испод календара и приказује/скрива дугме (Захтеви 1 и 2)
function updateSelectedDaysText() {
    // Претварамо Set у низ да бисмо могли да сортирамо
    const sortedDates = Array.from(selectedDatesSet).sort();

    if (sortedDates.length === 0) {
        selectedDaysList.textContent = '';
        clearSelectionsBtn.style.display = 'none'; // Сакриј дугме кад је празно
        return;
    }

    // Форматирамо датуме за лепши приказ кориснику (нпр. 08.12.2025)
    const formattedDates = sortedDates.map(ymd => {
        const year = ymd.substring(0, 4);
        const month = ymd.substring(4, 6);
        const day = ymd.substring(6, 8);
        return `${day}.${month}.${year}.`;
    });

    selectedDaysList.textContent = `Изабрали сте: ${formattedDates.join(', ')}`;
    clearSelectionsBtn.style.display = 'inline-block'; // Прикажи дугме
}

// 2. Функција за брисање свих селекција
function clearAllSelections() {
    selectedDatesSet.clear(); // Брисање свих ставки из Сета
    renderCalendar();         // Поново рендерујемо календар да би се чекбокси ажурирали
    updateSelectedDaysText(); // Ажурирамо текст испод календара
}

clearSelectionsBtn.addEventListener('click', clearAllSelections);


function renderCalendar() {
    calendarContainer.innerHTML = '';

    const year = currentDisplayedDate.getFullYear();
    const month = currentDisplayedDate.getMonth();
    
    monthTitle.textContent = currentDisplayedDate.toLocaleString('sr-RS', { year: 'numeric', month: 'long' });

    daysOfWeek.forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.classList.add('day-cell', 'header');
        headerCell.textContent = day;
        calendarContainer.appendChild(headerCell);
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'disabled-past');
        calendarContainer.appendChild(emptyCell);
    }
    
    const today = new Date();
    const todayYMD = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        
        const cellDate = new Date(year, month, i);
        const cellYMD = year * 10000 + (month + 1) * 100 + i;
        const formattedDateAttr = cellDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

        dayCell.setAttribute('data-date', formattedDateAttr);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `day-${formattedDateAttr}`;
        
        // 1. Проверавамо да ли је овај датум већ у нашем Set-у (ако долазимо из другог месеца)
        if (selectedDatesSet.has(formattedDateAttr)) {
            checkbox.checked = true;
            dayCell.classList.add('selected');
        }

        if (cellYMD < todayYMD) {
            checkbox.disabled = true;
            dayCell.classList.add('disabled-past');
        } else {
            // Ажурирамо Set при клику
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    dayCell.classList.add('selected');
                    selectedDatesSet.add(formattedDateAttr); // Dodajemo u Set
                } else {
                    dayCell.classList.remove('selected');
                    selectedDatesSet.delete(formattedDateAttr); // Brišemo iz Set-a
                }
                updateSelectedDaysText(); // Ažuriramo tekst
            });
        }

        if (cellYMD === todayYMD) {
            dayCell.classList.add('today');
        }

        dayCell.innerHTML += `<span>${i}</span>`;
        dayCell.appendChild(checkbox);
        calendarContainer.appendChild(dayCell);
    }
}

// Навигација сада само позива renderCalendar(), а Set чува стање
prevMonthBtn.addEventListener('click', () => {
    currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() + 1);
    renderCalendar();
});

// Иницијално рендеровање календара и текста
renderCalendar();
updateSelectedDaysText();
