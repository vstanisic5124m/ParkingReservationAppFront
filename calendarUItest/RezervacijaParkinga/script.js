const dvoristeParkingEl = document.getElementById('dvoristeParking');
const garazaParkingEl = document.getElementById('garazaParking');
const calendarContainerEl = document.getElementById('calendarContainer');
const monthTitleEl = document.getElementById('monthTitle');
const selectedDateDisplayEl = document.getElementById('selectedDateDisplay');

const modal = document.getElementById("reservationModal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementsByClassName("close");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

let allParkingData = []; 
let currentDisplayedDate = new Date();
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
let selectedDate = new Date(TODAY);

// Променљива која сада чува и референцу на DOM елемент
let pendingReservation = null; 

async function loadParkingData() {
    try {
        const response = await fetch('testparkingdata.json');
        if (!response.ok) throw new Error('Network response was not ok');
        allParkingData = await response.json();
        renderCalendar();
        updateParkingTables();
    } catch (error) {
        console.error("Could not load parking data:", error);
    }
}

function formatDateToYMD(date) {
    return date.toISOString().slice(0, 10);
}

// Funkcija koja simulira upis u bazu i ažurira UI
function confirmReservation() {
    if (!pendingReservation) return;

    const { spotNum, spotType, dateYMD, spotElement } = pendingReservation;

    // SIMULACIJA UPISA U BAZU (uklanjanje mesta iz slobodnih podataka)
    const index = allParkingData.findIndex(item => 
        item.dan === dateYMD && 
        item.tip_parkinga === spotType && 
        item.parking_mesto_broj === spotNum
    );

    if (index > -1) {
        allParkingData.splice(index, 1); 
    }
    
    // AŽURIRANJE UI-a: Koristimo direktno prosleđeni spotElement
    if (spotElement) {
        spotElement.classList.remove('free');
        spotElement.classList.add('occupied'); // Promena boje u crveno
        spotElement.style.cursor = 'not-allowed';
        // Uklanjamo event listener da ne bi moglo ponovo da se klikne
        spotElement.removeEventListener('click', spotElement._handleClick); 
    }

    closeModalHandler();
}


// ... renderCalendar() i navigacija su isti kao pre ...
function renderCalendar() {
    calendarContainerEl.innerHTML = '';
    const year = currentDisplayedDate.getFullYear();
    const month = currentDisplayedDate.getMonth();
    monthTitleEl.textContent = currentDisplayedDate.toLocaleString('sr-RS', { year: 'numeric', month: 'long' });
     ['Нед', 'Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб'].forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.classList.add('day-header');
        headerCell.textContent = day;
        calendarContainerEl.appendChild(headerCell);
    });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty');
        calendarContainerEl.appendChild(emptyCell);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const cellDate = new Date(year, month, i);
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        dayCell.textContent = i;
        dayCell.dataset.date = formatDateToYMD(cellDate);

        if (cellDate < TODAY) {
            dayCell.classList.add('empty');
            dayCell.style.cursor = 'default';
        } else {
            dayCell.addEventListener('click', () => {
                selectedDate = new Date(cellDate);
                renderCalendar();
                updateParkingTables();
            });
        }
        if (dayCell.dataset.date === formatDateToYMD(TODAY)) {
            dayCell.classList.add('today');
        }
        if (dayCell.dataset.date === formatDateToYMD(selectedDate)) {
            dayCell.classList.add('selected-day');
        }
        calendarContainerEl.appendChild(dayCell);
    }
}
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
    currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() + 1);
    renderCalendar();
});


function updateParkingTables() {
    selectedDateDisplayEl.textContent = selectedDate.toLocaleDateString('sr-RS');
    const selectedDateYMD = formatDateToYMD(selectedDate);
    const freeSpotsData = allParkingData.filter(d => d.dan === selectedDateYMD);

    renderParking('dvoriste', 50, dvoristeParkingEl, freeSpotsData);
    renderParking('garaza', 100, garazaParkingEl, freeSpotsData);
}

function renderParking(type, totalSpots, containerEl, freeSpotsData) {
    containerEl.innerHTML = '';
    containerEl.style.gridTemplateColumns = 'repeat(10, 1fr)'; 

    const freeSpotNumbers = new Set(freeSpotsData
        .filter(item => item.tip_parkinga === type)
        .map(item => item.parking_mesto_broj)
    );

    for (let i = 1; i <= totalSpots; i++) {
        const spotEl = document.createElement('div');
        spotEl.classList.add('parking-spot');
        spotEl.textContent = i;
        // Dodajemo data atribut za lakšu identifikaciju, mada ga trenutno ne koristimo svuda
        spotEl.dataset.spotId = `${type}-${i}`; 

        const isFree = freeSpotNumbers.has(i);

        if (isFree) {
            spotEl.classList.add('free'); 

            if (formatDateToYMD(selectedDate) === formatDateToYMD(TODAY)) {
                // *** KLJUČNA PROMENA OVDE ***
                // Handler sada poziva funkciju showReservationModal i prosleđuje CEO spotEl element
                spotEl._handleClick = () => {
                    showReservationModal(i, type, selectedDate, spotEl);
                };
                spotEl.addEventListener('click', spotEl._handleClick);
            } else {
                 spotEl.style.cursor = 'default';
            }

        } else {
            spotEl.classList.add('occupied');
        }

        containerEl.appendChild(spotEl);
    }
}

// Logika Popapa:

// *** KLJUČNA PROMENA U PARAMETRIMA FUNKCIJE ***
function showReservationModal(spotNum, spotType, dateObj, elementClicked) {
    const dateStr = dateObj.toLocaleDateString('sr-RS');
    const fullSpotType = spotType === 'dvoriste' ? 'Двориште' : 'Гаража';

    modalMessage.textContent = `Да ли желиш да резервишеш паркинг место бр. ${spotNum} на паркингу "${fullSpotType}" за дан ${dateStr}?`;
    
    // Čuvamo SVE potrebne podatke, uključujući referencu na element
    pendingReservation = {
        spotNum: spotNum,
        spotType: spotType,
        dateYMD: formatDateToYMD(dateObj),
        spotElement: elementClicked // <--- OVO JE KLJUČNO
    };
    
    modal.style.display = "block";
}

function closeModalHandler() {
    modal.style.display = "none";
    pendingReservation = null;
}

closeModal.onclick = closeModalHandler;
noButton.onclick = closeModalHandler;
yesButton.onclick = confirmReservation; 

window.onclick = function(event) {
    if (event.target == modal) {
        closeModalHandler();
    }
}

loadParkingData();
