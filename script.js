// Простое приложение кроссворда: генерация маленькой сетки с русскими словами
// Подход: берём случайный набор слов, размещаем по пересечениям в небольшой сетке
//  - цель: быстрая, понятная реализация без внешних зависимостей

(function(){
    // Банк загадок: answer (в верхнем регистре) и краткая загадка/подсказка
    const RIDDLES = [
        { answer: "КОТ", clue: "Кто мурлычет у окна и ловит мышей?" },
        { answer: "САД", clue: "Место, где растут деревья и цветы." },
        { answer: "ДОМ", clue: "Место, где живут люди." },
        { answer: "ЛЕС", clue: "Где много деревьев и зверей." },
        { answer: "МОРЕ", clue: "Большая солёная вода." },
        { answer: "ГОРА", clue: "Высокая возвышенность над землёй." },
        { answer: "ЯБЛОКО", clue: "Красный или зелёный плод с семенами внутри." },
        { answer: "ШКОЛА", clue: "Сюда дети ходят за знаниями." },
        { answer: "ОКНО", clue: "Сквозь него видно улицу." },
        { answer: "СТОЛ", clue: "На нём едят и пишут." },
        { answer: "КНИГА", clue: "В ней много страниц с историями." },
        { answer: "РЫБА", clue: "Обитатель воды с плавниками." },
        { answer: "ОЗЕРО", clue: "Большой водоём среди суши." },
        { answer: "ПУСТЫНЯ", clue: "Где много песка и мало воды." },
        { answer: "ТРАВА", clue: "Зелёный ковёр земли летом." },
        { answer: "ЛУНА", clue: "Ночная спутница Земли." },
        { answer: "СОЛНЦЕ", clue: "Звезда, дающая свет и тепло." },
        { answer: "МОСТ", clue: "Строение через реку или овраг." },
        { answer: "ДЕРЕВО", clue: "Растение с корнями, стволом и кроной." },
        { answer: "СКАЗКА", clue: "В ней всё возможно и есть чудеса." },
        { answer: "ГОРОД", clue: "Большой населённый пункт." },
        { answer: "УЛИЦА", clue: "По ней ходят люди и ездят машины." },
        { answer: "МАШИНА", clue: "Железный конь на четырёх колёсах." },
        { answer: "ТЕАТР", clue: "Здесь играют актёры на сцене." },
        { answer: "ФОТО", clue: "Изображение, сделанное камерой." },
        { answer: "КАРТА", clue: "Рисунок местности с дорогами и городами." },
        { answer: "ПАРК", clue: "Зелёное место отдыха в городе." },
        { answer: "ПТИЦА", clue: "Существо с крыльями и перьями." },
        { answer: "РЕКА", clue: "Течёт от истока к устью." },
        { answer: "ВОДА", clue: "Без неё не прожить ни дня." }
    ];

    const GRID_SIZE = 11; // компактная площадь, хорошо влезает на телефон

    /**
     * Создаёт пустую сетку с блоками (null = блок), буквы будут строками
     */
    function createEmptyGrid(){
        const grid = new Array(GRID_SIZE).fill(null).map(()=>new Array(GRID_SIZE).fill(null));
        return grid;
    }

    function cloneGrid(grid){
        return grid.map(row => row.slice());
    }

    function randInt(n){ return Math.floor(Math.random()*n); }

    function shuffle(arr){
        const a = arr.slice();
        for(let i=a.length-1;i>0;i--){
            const j = Math.floor(Math.random()*(i+1));
            [a[i],a[j]] = [a[j],a[i]];
        }
        return a;
    }

    function pickWords(){
        // выбираем 6-9 загадок/слов
        const shuffled = shuffle(RIDDLES);
        const chosen = [];
        for(const item of shuffled){
            if(chosen.length >= 9) break;
            if(item.answer.length < 3) continue;
            chosen.push(item);
        }
        return chosen.slice(0, randInt(4)+6); // 6..9
    }

    function canPlace(grid, word, row, col, horizontal){
        const len = word.length;
        if(horizontal){
            if(col+len > GRID_SIZE) return false;
        }else{
            if(row+len > GRID_SIZE) return false;
        }

        for(let i=0;i<len;i++){
            const r = row + (horizontal?0:i);
            const c = col + (horizontal?i:0);
            const cell = grid[r][c];
            if(cell === null) continue; // пустая ячейка
            if(typeof cell === 'string' && cell !== word[i]) return false; // конфликт буквы
        }
        return true;
    }

    function placeWord(grid, word, row, col, horizontal){
        for(let i=0;i<word.length;i++){
            const r = row + (horizontal?0:i);
            const c = col + (horizontal?i:0);
            grid[r][c] = word[i];
        }
    }

    function tryPlaceWithIntersections(grid, word){
        // пробуем использовать пересечения с уже стоящими буквами
        // собираем список уже занятых букв с координатами
        const existing = [];
        for(let r=0;r<GRID_SIZE;r++){
            for(let c=0;c<GRID_SIZE;c++){
                const ch = grid[r][c];
                if(typeof ch === 'string') existing.push({r,c,ch});
            }
        }

        const candidates = [];
        for(const {r,c,ch} of existing){
            for(let i=0;i<word.length;i++){
                if(word[i] !== ch) continue;
                // вариант 1: слово горизонтально, пересекается в i -> (r, c-i)
                const colStart = c - i;
                if(colStart >= 0 && colStart + word.length <= GRID_SIZE){
                    if(canPlace(grid, word, r, colStart, true)) candidates.push({row:r, col:colStart, horizontal:true});
                }
                // вариант 2: вертикально
                const rowStart = r - i;
                if(rowStart >= 0 && rowStart + word.length <= GRID_SIZE){
                    if(canPlace(grid, word, rowStart, c, false)) candidates.push({row:rowStart, col:c, horizontal:false});
                }
            }
        }
        if(candidates.length === 0) return false;
        const pick = candidates[randInt(candidates.length)];
        placeWord(grid, word, pick.row, pick.col, pick.horizontal);
        return true;
    }

    function generateGrid(){
        for(let attempt=0; attempt<40; attempt++){
            const grid = createEmptyGrid();
            const items = pickWords();
            // первое слово ставим по центру горизонтально
            const firstItem = items[0];
            const first = firstItem.answer;
            const row = Math.floor(GRID_SIZE/2);
            const col = Math.max(0, Math.floor((GRID_SIZE-first.length)/2));
            placeWord(grid, first, row, col, true);

            for(let i=1;i<items.length;i++){
                const w = items[i].answer;
                if(!tryPlaceWithIntersections(grid, w)){
                    // запасной способ — случайно куда поместится
                    let placed = false;
                    for(let tries=0; tries<50; tries++){
                        const horiz = Math.random() < 0.5;
                        const r = randInt(GRID_SIZE);
                        const c = randInt(GRID_SIZE);
                        if(canPlace(grid, w, r, c, horiz)){
                            placeWord(grid, w, r, c, horiz);
                            placed = true; break;
                        }
                    }
                    if(!placed){
                        // перегенерация всей сетки
                        break;
                    }
                }
            }

            // если сетка заполнена хотя бы десятком букв — принимаем
            let countLetters = 0;
            for(let r=0;r<GRID_SIZE;r++) for(let c=0;c<GRID_SIZE;c++) if(typeof grid[r][c]==='string') countLetters++;
            if(countLetters >= 18) return { grid, items };
        }
        // fallback
        return { grid: createEmptyGrid(), items: [] };
    }

    function renderGrid(container, grid, clueMap){
        // расчёт колонок для CSS Grid
        container.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 36px)`;
        container.innerHTML = '';
        for(let r=0;r<GRID_SIZE;r++){
            for(let c=0;c<GRID_SIZE;c++){
                const cellEl = document.createElement('div');
                const val = grid[r][c];
                if(typeof val === 'string'){
                    cellEl.className = 'cell';
                    // номер старта слова, если есть
                    const key = `${r}:${c}`;
                    const maybeNum = clueMap.startNumbers.get(key);
                    if(maybeNum){
                        const numEl = document.createElement('div');
                        numEl.className = 'cell__num';
                        numEl.textContent = String(maybeNum);
                        cellEl.appendChild(numEl);
                    }
                    const input = document.createElement('input');
                    input.setAttribute('maxlength', '1');
                    input.setAttribute('aria-label', `Ячейка ${r+1}:${c+1}`);
                    input.addEventListener('input', onInput);
                    input.addEventListener('keydown', onKeyMove);
                    input.dataset.expected = val;
                    cellEl.appendChild(input);
                } else {
                    cellEl.className = 'cell cell--block';
                }
                container.appendChild(cellEl);
            }
        }
    }

    function onInput(e){
        const input = e.target;
        const v = (input.value || '').toUpperCase().replace(/[^А-ЯЁA-Z]/g,'');
        input.value = v;
        const expected = (input.dataset.expected || '').toUpperCase();
        const cell = input.parentElement;
        cell.classList.remove('correct','error');
        if(v.length === 1){
            if(v === expected){
                cell.classList.add('correct');
                focusNextInput(input);
                checkSolved();
            } else {
                cell.classList.add('error');
            }
        } else if(v.length === 0){
            // очищено
        }
    }

    function onKeyMove(e){
        const input = e.target;
        const index = getInputIndex(input);
        if(index === -1) return;
        const inputs = getAllInputs();
        const cols = GRID_SIZE;
        switch(e.key){
            case 'ArrowRight': moveFocus(index+1); e.preventDefault(); break;
            case 'ArrowLeft': moveFocus(index-1); e.preventDefault(); break;
            case 'ArrowDown': moveFocus(index+cols); e.preventDefault(); break;
            case 'ArrowUp': moveFocus(index-cols); e.preventDefault(); break;
            case 'Backspace':
                if(input.value === '') moveFocus(index-1);
                break;
            default: break;
        }
        function moveFocus(i){
            if(i<0 || i>=inputs.length) return;
            inputs[i].focus();
            inputs[i].select();
        }
    }

    function getAllInputs(){
        return Array.from(document.querySelectorAll('.cell input'));
    }
    function getInputIndex(el){
        const list = getAllInputs();
        return list.indexOf(el);
    }
    function focusNextInput(current){
        const list = getAllInputs();
        const i = list.indexOf(current);
        if(i>=0 && i<list.length-1){
            list[i+1].focus();
        }
    }

    function checkSolved(){
        const inputs = getAllInputs();
        for(const inp of inputs){
            const v = (inp.value||'').toUpperCase();
            const exp = (inp.dataset.expected||'').toUpperCase();
            if(v !== exp) return false;
        }
        // всё угадано → показать статус, обновить подсказки как выполненные, сгенерировать заново
        const status = document.getElementById('status');
        if(status){
            status.textContent = 'Отлично! Новый кроссворд через 1 секунду…';
        }
        markAllCluesSolved();
        setTimeout(() => {
            window.CrosswordApp.newPuzzle();
        }, 1000);
        return true;
    }

    function newPuzzle(){
        const { grid, items } = generateGrid();
        const container = document.getElementById('crossword');
        const status = document.getElementById('status');
        if(status) status.textContent = '';
        // построение карты подсказок
        const { placements, startNumbers, across, down } = buildClues(grid, items);
        renderClues(across, down);
        renderGrid(container, grid, { startNumbers });
        // автофокус на первую ячейку
        const first = container.querySelector('.cell input');
        if(first) first.focus();
        state.current = { grid, items, placements };
    }

    function init(){
        const btn = document.getElementById('btn-new');
        if(btn){
            btn.addEventListener('click', () => newPuzzle());
        }
        newPuzzle();
    }

    // ----- Подсказки: построение позиций, нумерация, вывод -----
    function buildClues(grid, items){
        // Для простоты: ищем слова как непрерывные последовательности букв по строкам и столбцам
        // Затем сопоставляем с доступными ответами; если совпало — берём загадку
        const placements = [];
        const startNumbers = new Map(); // "r:c" -> n
        let nextNum = 1;

        // По горизонтали
        for(let r=0;r<GRID_SIZE;r++){
            let c = 0;
            while(c < GRID_SIZE){
                if(typeof grid[r][c] === 'string'){
                    const startC = c;
                    let word = '';
                    while(c<GRID_SIZE && typeof grid[r][c] === 'string'){
                        word += grid[r][c];
                        c++;
                    }
                    if(word.length >= 2){
                        const match = items.find(it => it.answer === word);
                        if(match){
                            startNumbers.set(`${r}:${startC}`, nextNum);
                            placements.push({ number: nextNum, row: r, col: startC, horizontal: true, answer: word, clue: match.clue });
                            nextNum++;
                        }
                    }
                } else {
                    c++;
                }
            }
        }

        // По вертикали
        for(let c=0;c<GRID_SIZE;c++){
            let r = 0;
            while(r < GRID_SIZE){
                if(typeof grid[r][c] === 'string'){
                    const startR = r;
                    let word = '';
                    while(r<GRID_SIZE && typeof grid[r][c] === 'string'){
                        word += grid[r][c];
                        r++;
                    }
                    if(word.length >= 2){
                        const match = items.find(it => it.answer === word);
                        if(match){
                            startNumbers.set(`${startR}:${c}`, nextNum);
                            placements.push({ number: nextNum, row: startR, col: c, horizontal: false, answer: word, clue: match.clue });
                            nextNum++;
                        }
                    }
                } else {
                    r++;
                }
            }
        }

        const across = placements.filter(p => p.horizontal).sort((a,b)=>a.number-b.number);
        const down = placements.filter(p => !p.horizontal).sort((a,b)=>a.number-b.number);
        return { placements, startNumbers, across, down };
    }

    function renderClues(across, down){
        const acrossOl = document.getElementById('clues-across');
        const downOl = document.getElementById('clues-down');
        function fill(target, list){
            if(!target) return;
            target.innerHTML = '';
            for(const p of list){
                const li = document.createElement('li');
                li.innerHTML = `<strong>${p.number}.</strong> ${escapeHtml(p.clue)} <span class="clues__answer">(${p.answer.length} букв)</span>`;
                target.appendChild(li);
            }
        }
        fill(acrossOl, across);
        fill(downOl, down);
    }

    function escapeHtml(s){
        return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
    }

    const state = { current: null };

    function markAllCluesSolved(){
        const lists = [document.getElementById('clues-across'), document.getElementById('clues-down')];
        for(const list of lists){
            if(!list) continue;
            for(const li of Array.from(list.children)){
                li.style.opacity = '0.6';
                li.style.textDecoration = 'line-through';
            }
        }
    }

    window.CrosswordApp = { init, newPuzzle };
})();


