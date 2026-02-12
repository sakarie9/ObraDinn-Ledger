const App = {
    data: {
        faces: {},
        crew: [],
        correctNames: {},
        correctFates: {},
        fatesStructure: []
    },
    state: {
        currentPage: 0,
        view: 'grid', // 'grid' or 'detail'
        currentFace: null,
        hintsUsed: {}
        // Structure of hintsUsed[filename]:
        // {
        //   identity: count,
        //   fate: count,
        //   guessed_id: int | null,
        //   guessed_fate: { cause_id: int, weapon: str, offender_id: int },
        //   status: "verified" | "pending" | "incorrect",
        //   fate_status: "verified" | "pending" | "incorrect"
        // }
    },
    config: {
        rowsPerPage: 2,
        colsPerPage: 5,
        get imagesPerPage() { return this.rowsPerPage * this.colsPerPage; },
        imageDir: 'FacesHi/'
    },

    // Cache for images list (since we don't have os.listdir, we assume faces are face_01.png to face_60.png)
    imageFiles: [],

    init: async () => {
        // Generate image file list
        for (let i = 1; i <= 60; i++) {
            const num = i.toString().padStart(2, '0');
            App.imageFiles.push(`face_${num}.png`);
        }

        await App.loadData();
        App.loadState();
        App.render();
    },

    loadData: async () => {
        try {
            const [faces, crew, correctNames, correctFates, fatesStructure] = await Promise.all([
                fetch('data/faces_data.json').then(r => r.json()),
                fetch('data/name_lists.json').then(r => r.json()),
                fetch('data/correct_name_list.json').then(r => r.json()),
                fetch('data/correct_fates_list.json').then(r => r.json()),
                fetch('data/fates_structure.json').then(r => r.json())
            ]);

            App.data.faces = faces;
            App.data.crew = crew;
            App.data.correctNames = correctNames;
            App.data.correctFates = correctFates;
            App.data.fatesStructure = fatesStructure;
        } catch (e) {
            console.error("Failed to load data:", e);
            alert("Failed to load data files. Please check console.");
        }
    },

    loadState: () => {
        const stored = localStorage.getItem('obraDinnState');
        if (stored) {
            App.state.hintsUsed = JSON.parse(stored);
        }
    },

    saveState: () => {
        localStorage.setItem('obraDinnState', JSON.stringify(App.state.hintsUsed));
    },

    resetData: () => {
        if (confirm("确定要清空所有身份推测和提示进度吗？(此操作不可撤销)")) {
            App.state.hintsUsed = {};
            App.saveState();
            App.render();
            alert("已初始化", "所有进度已重置。");
        }
    },

    // --- Navigation ---

    setView: (view, face = null) => {
        App.state.view = view;
        App.state.currentFace = face;
        App.render();
    },

    nextPage: () => {
        const totalPages = Math.ceil(App.imageFiles.length / App.config.imagesPerPage);
        App.state.currentPage = (App.state.currentPage + 1) % totalPages;
        App.render();
    },

    prevPage: () => {
        const totalPages = Math.ceil(App.imageFiles.length / App.config.imagesPerPage);
        App.state.currentPage = (App.state.currentPage - 1 + totalPages) % totalPages;
        App.render();
    },

    // --- Rendering ---

    render: () => {
        const container = document.getElementById('app-container');
        container.innerHTML = '';

        if (App.state.view === 'grid') {
            App.renderGrid(container);
        } else if (App.state.view === 'detail') {
            App.renderDetail(container);
        }
    },

    renderGrid: (container) => {
        // Tools Header
        const toolsDiv = document.createElement('div');
        toolsDiv.className = 'tools-header';
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '格式化';
        resetBtn.className = 'nav-btn';
        resetBtn.onclick = App.resetData;
        toolsDiv.appendChild(resetBtn);
        container.appendChild(toolsDiv);

        // Grid
        const gridDiv = document.createElement('div');
        gridDiv.className = 'faces-grid';

        const start = App.state.currentPage * App.config.imagesPerPage;
        const end = Math.min(start + App.config.imagesPerPage, App.imageFiles.length);
        const pageImages = App.imageFiles.slice(start, end);

        pageImages.forEach(filename => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'grid-item';

            const img = document.createElement('img');
            img.src = App.config.imageDir + filename;
            img.onclick = () => App.setView('detail', filename);

            itemDiv.appendChild(img);
            gridDiv.appendChild(itemDiv);
        });
        container.appendChild(gridDiv);

        // Navigation
        const navDiv = document.createElement('div');
        navDiv.className = 'nav-footer';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '<< 上一页';
        prevBtn.className = 'nav-btn';
        prevBtn.onclick = App.prevPage;

        const nextBtn = document.createElement('button');
        nextBtn.textContent = '下一页 >>';
        nextBtn.className = 'nav-btn';
        nextBtn.onclick = App.nextPage;

        const pageInfo = document.createElement('div');
        pageInfo.className = 'page-info';
        const totalPages = Math.ceil(App.imageFiles.length / App.config.imagesPerPage);

        // Mixed font rendering for page info
        pageInfo.innerHTML = `<span class="cn-text">第 </span><span class="en-text">${App.state.currentPage + 1}</span><span class="cn-text"> 页 / 共 </span><span class="en-text">${totalPages}</span><span class="cn-text"> 页</span>`;

        navDiv.appendChild(prevBtn);
        navDiv.appendChild(pageInfo);
        navDiv.appendChild(nextBtn);
        container.appendChild(navDiv);
    },

    renderDetail: (container) => {
        const filename = App.state.currentFace;
        App.ensureState(filename);
        const state = App.state.hintsUsed[filename];
        const faceData = App.data.faces[filename] || {};

        // Container
        const detailDiv = document.createElement('div');
        detailDiv.className = 'detail-view';

        // Top Bar
        const topBar = document.createElement('div');
        topBar.className = 'top-bar';
        const backBtn = document.createElement('button');
        backBtn.textContent = '<< 返回列表';
        backBtn.className = 'nav-btn';
        backBtn.onclick = () => App.setView('grid');
        topBar.appendChild(backBtn);
        detailDiv.appendChild(topBar);

        // Top Container (Image + Guesses)
        const topContainer = document.createElement('div');
        topContainer.className = 'top-container';

        // Identity Guess Widget (Left)
        const idWidget = App.createIdentityWidget(filename, state);
        idWidget.classList.add('widget-left');

        // Image (Center)
        const imgDiv = document.createElement('div');
        imgDiv.className = 'detail-image-container';
        const img = document.createElement('img');
        img.src = App.config.imageDir + filename;
        imgDiv.appendChild(img);

        // Fate Guess Widget (Right)
        const fateWidget = App.createFateWidget(filename, state);
        fateWidget.classList.add('widget-right');

        topContainer.appendChild(idWidget);
        topContainer.appendChild(imgDiv);
        topContainer.appendChild(fateWidget);
        detailDiv.appendChild(topContainer);

        // Info Container (Hints)
        const infoContainer = document.createElement('div');
        infoContainer.className = 'info-container';

        // Identity Hints
        const idHintsDiv = App.createHintColumn(filename, 'identity', faceData.identity_hints || [], state);

        // Separator
        const separator = document.createElement('div');
        separator.className = 'separator';

        // Fate Hints
        const fateHintsDiv = App.createHintColumn(filename, 'fate', faceData.fate_hints || [], state);

        infoContainer.appendChild(idHintsDiv);
        infoContainer.appendChild(separator);
        infoContainer.appendChild(fateHintsDiv);
        detailDiv.appendChild(infoContainer);

        container.appendChild(detailDiv);
    },

    ensureState: (filename) => {
        if (!App.state.hintsUsed[filename]) {
            App.state.hintsUsed[filename] = {
                identity: 0,
                fate: 0,
                guessed_id: null,
                guessed_fate: { cause_id: null, weapon: null, offender_id: null },
                status: 'pending',
                fate_status: 'pending'
            };
        }
        // Ensure structure updates
        if (!App.state.hintsUsed[filename].guessed_fate) {
            App.state.hintsUsed[filename].guessed_fate = { cause_id: null, weapon: null, offender_id: null };
        }
    },

    // --- Widgets ---

    createIdentityWidget: (filename, state) => {
        const container = document.createElement('div');
        container.className = 'guess-widget';

        // 1. Content Area (Clickable)
        const contentArea = document.createElement('div');
        contentArea.className = 'guess-content';

        let displayText = '不详';
        if (state.guessed_id) {
            const crew = App.data.crew.find(c => c.id === state.guessed_id);
            if (crew) displayText = `${crew.name} (${crew.role})`;
        }

        const label = document.createElement('div');
        label.className = `guess-label ${state.status === 'verified' ? 'verified-text' : 'handwriting-text'}`;
        label.textContent = displayText;
        contentArea.appendChild(label);

        container.appendChild(contentArea);

        if (state.status !== 'verified') {
            // Bind click to the entire content area
            contentArea.classList.add('clickable');
            contentArea.onclick = () => App.openCrewSelector(filename, 'identity');

            // 2. Action Area (Button)
            const checkBtn = document.createElement('button');
            checkBtn.textContent = '查验';
            checkBtn.className = 'check-btn'; // Use specific class, remove generic 'nav-btn' if styled separately or keep for base
            checkBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering widget click if nested (though here they are siblings)
                App.checkIdentity(filename);
            };
            container.appendChild(checkBtn);
        } else {
             container.classList.add('verified-widget');
        }

        return container;
    },

    createFateWidget: (filename, state) => {
        const container = document.createElement('div');
        container.className = 'guess-widget';

        // 1. Content Area (Clickable)
        const contentArea = document.createElement('div');
        contentArea.className = 'guess-content';

        const guess = state.guessed_fate;
        const causeObj = App.data.fatesStructure.find(c => c.id === guess.cause_id);

        let part1Text = '未记录下落';
        if (causeObj) {
            part1Text = causeObj.label;
            if (causeObj.has_weapon && guess.weapon) {
                part1Text += `，${guess.weapon}`;
            }
            if (causeObj.requires_offender) {
                part1Text += '，';
            }
        }

        const label1 = document.createElement('div');
        label1.className = `guess-label ${state.fate_status === 'verified' ? 'verified-text' : 'handwriting-text'}`;
        label1.textContent = part1Text;
        contentArea.appendChild(label1);

        if (causeObj && causeObj.requires_offender) {
            let offName = '不详';
            if (guess.offender_id) {
                if (guess.offender_id === -1) offName = '敌人';
                else if (guess.offender_id === -2) offName = '野兽';
                else {
                    const crew = App.data.crew.find(c => c.id === guess.offender_id);
                    if (crew) offName = crew.name;
                }
            }
            const label2 = document.createElement('div');
            label2.className = `guess-label ${state.fate_status === 'verified' ? 'verified-text' : 'handwriting-text'}`;
            label2.textContent = offName;

            if (state.fate_status !== 'verified') {
                // If special handling needed for second label click (offender selector)
                // We can bind specific click to this label, stopping propagation to contentArea
                label2.onclick = (e) => {
                    e.stopPropagation();
                    App.openCrewSelector(filename, 'offender');
                };
                label2.style.cursor = 'pointer';
                label2.style.textDecoration = 'underline'; // Optional: visual cue
            }
            contentArea.appendChild(label2);
        }

        container.appendChild(contentArea);

        if (state.fate_status !== 'verified') {
            // Bind main click (Fate Selector) to content area
            // Note: If clicking label2 (offender), it stops propagation so this won't fire.
            contentArea.classList.add('clickable');
            contentArea.onclick = () => App.openFateSelector(filename);

            // Check if complete
            let isComplete = false;
            if (guess.cause_id && guess.cause_id !== 1) { // 1 is Unknown
                 let weaponOk = true;
                 let offenderOk = true;
                 if (causeObj.has_weapon && !guess.weapon) weaponOk = false;
                 if (causeObj.requires_offender && !guess.offender_id) offenderOk = false;
                 if (weaponOk && offenderOk) isComplete = true;
            }

            const checkBtn = document.createElement('button');
            checkBtn.textContent = '查验';
            checkBtn.className = 'check-btn';
            checkBtn.disabled = !isComplete;
            checkBtn.onclick = (e) => {
                e.stopPropagation();
                App.checkFate(filename);
            };
            container.appendChild(checkBtn);
        } else {
            container.classList.add('verified-widget');
        }

        return container;
    },

    createHintColumn: (filename, type, hints, state) => {
        const col = document.createElement('div');
        col.className = 'hint-column';
        col.id = `hint-column-${type}`;

        // Header (Title + Button)
        const header = document.createElement('div');
        header.className = 'hint-header';

        const title = document.createElement('div');
        title.className = 'hint-title';
        title.textContent = type === 'identity' ? '身份' : '下落';
        header.appendChild(title);

        const count = state[type];
        // Handle hints array: default fallback if empty
        const effectiveHints = (hints && hints.length > 0) ? hints : [`未记录${type === 'identity' ? '身份' : '下落'}`];

        // Button in Header
        if (count < effectiveHints.length) {
            const btn = document.createElement('button');
            btn.textContent = '获取提示'; // Shortened text
            btn.className = 'nav-btn hint-btn';
            btn.id = `hint-btn-${type}`;
            btn.onclick = () => App.revealHint(filename, type, effectiveHints);
            header.appendChild(btn);
        } else {
            const done = document.createElement('div');
            done.className = 'hint-done-badge';
            done.textContent = '✓';
            header.appendChild(done);
        }
        col.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'hint-content';
        content.id = `hint-content-${type}`;

        let textHTML = '';
        for (let i = 0; i < count; i++) {
             if (i < effectiveHints.length) {
                 if (i > 0) textHTML += '<br><br>';
                 textHTML += App.processMixedText(effectiveHints[i]);
             }
        }
        content.innerHTML = textHTML;
        col.appendChild(content);

        if (count >= effectiveHints.length) {
             const doneMsg = document.createElement('div');
             doneMsg.className = 'hint-done-msg';
             doneMsg.textContent = '已显示所有提示';
             col.appendChild(doneMsg);
        }

        return col;
    },

    processMixedText: (text) => {
        // Simple heuristic: ASCII -> en-text, others -> cn-text
        // We will wrap sequences
        let result = "";
        let isEn = null;
        let buffer = "";

        for (let char of text) {
            const charCode = char.charCodeAt(0);
            const charIsEn = charCode < 128; // ASCII

            if (isEn === null) isEn = charIsEn;

            if (charIsEn !== isEn) {
                // flush
                result += `<span class="${isEn ? 'en-text' : 'cn-text'}">${buffer}</span>`;
                buffer = char;
                isEn = charIsEn;
            } else {
                buffer += char;
            }
        }
        if (buffer) {
             result += `<span class="${isEn ? 'en-text' : 'cn-text'}">${buffer}</span>`;
        }
        return result;
    },

    // --- Logic ---

    revealHint: (filename, type, allHints) => {
        const state = App.state.hintsUsed[filename];
        state[type]++;

        let autoLockTriggered = false;

        // Auto-lock logic
        if (type === 'identity') {
            if (state[type] >= allHints.length && state.status !== 'verified') {
                const correctId = App.data.correctNames[filename];
                if (correctId) {
                    state.guessed_id = correctId;
                    state.status = 'verified';
                    autoLockTriggered = true;
                }
            }
        } else if (type === 'fate') {
            if (state[type] >= allHints.length && state.fate_status !== 'verified') {
                const correctData = App.data.correctFates[filename];
                if (correctData) {
                    const correctFate = Array.isArray(correctData) ? correctData[0] : correctData;
                    // Find cause ID
                    const causeObj = App.data.fatesStructure.find(c => c.label === correctFate.cause);
                    if (causeObj) {
                         state.guessed_fate = {
                             cause_id: causeObj.id,
                             weapon: correctFate.weapon,
                             offender_id: correctFate.offender_id
                         };
                         state.fate_status = 'verified';
                         autoLockTriggered = true;
                    }
                }
            }
        }

        App.saveState();

        if (autoLockTriggered) {
             // If auto-lock happened, we need a full render to update the widget styling and everything
             App.render();
        } else {
             // Otherwise, just update the hint text in place to avoid jarring refresh
             // Check if we are in detail view and looking at the correct file
             if (App.state.view === 'detail' && App.state.currentFace === filename) {
                 App.updateHintColumnDOM(filename, type, allHints, state);
             } else {
                 // Fallback
                 App.render();
             }
        }
    },

    updateHintColumnDOM: (filename, type, allHints, state) => {
         const contentEl = document.getElementById(`hint-content-${type}`);
         const btnEl = document.getElementById(`hint-btn-${type}`);
         const colEl = document.getElementById(`hint-column-${type}`);

         if (!contentEl || !colEl) return;

         const count = state[type];

         // Generate new HTML for content
         let textHTML = '';
         for (let i = 0; i < count; i++) {
             if (i < allHints.length) {
                 if (i > 0) textHTML += '<br><br>';
                 textHTML += App.processMixedText(allHints[i]);
             }
         }
         contentEl.innerHTML = textHTML;

         // Check if we reached the end
         if (count >= allHints.length) {
             if (btnEl) {
                 const header = btnEl.parentElement;
                 btnEl.remove();

                 const done = document.createElement('div');
                 done.className = 'hint-done-badge';
                 done.textContent = '✓';
                 header.appendChild(done);
             }

             if (!colEl.querySelector('.hint-done-msg')) {
                const doneMsg = document.createElement('div');
                doneMsg.className = 'hint-done-msg';
                doneMsg.textContent = '已显示所有提示';
                colEl.appendChild(doneMsg);
             }
         }
    },

    checkIdentity: (filename) => {
        const state = App.state.hintsUsed[filename];
        const guess = state.guessed_id;
        const correct = App.data.correctNames[filename];

        if (guess === correct) {
            state.status = 'verified';
            // Auto reveal all hints
            const faceData = App.data.faces[filename] || {};
            const hints = faceData.identity_hints || [];
            state.identity = Math.max(state.identity, hints.length > 0 ? hints.length : 1);

            App.saveState();
            App.render();
        } else {
            App.animateShake('identity');
            // Reset guess
            setTimeout(() => {
                state.guessed_id = null;
                App.saveState();
                App.render();
            }, 1000);
        }
    },

    checkFate: (filename) => {
        const state = App.state.hintsUsed[filename];
        const guess = state.guessed_fate;
        const correctData = App.data.correctFates[filename];

        if (!correctData) return;
        const possibleFates = Array.isArray(correctData) ? correctData : [correctData];

        const gCauseObj = App.data.fatesStructure.find(c => c.id === guess.cause_id);
        const gLabel = gCauseObj ? gCauseObj.label : "";

        let isCorrect = false;
        for (let correct of possibleFates) {
            const matchCause = (gLabel === correct.cause);
            const matchWeapon = (guess.weapon === correct.weapon);
            let matchOffender = true;
            if (gCauseObj && gCauseObj.requires_offender) {
                matchOffender = (guess.offender_id === correct.offender_id);
            }
            if (matchCause && matchWeapon && matchOffender) {
                isCorrect = true;
                break;
            }
        }

        if (isCorrect) {
            state.fate_status = 'verified';
             // Auto reveal all hints
            const faceData = App.data.faces[filename] || {};
            const hints = faceData.fate_hints || [];
            state.fate = Math.max(state.fate, hints.length > 0 ? hints.length : 1);

            App.saveState();
            App.render();
        } else {
             App.animateShake('fate');
             setTimeout(() => {
                 state.guessed_fate = { cause_id: null, weapon: null, offender_id: null };
                 App.saveState();
                 App.render();
             }, 1000);
        }
    },

    animateShake: (type) => {
        const selector = type === 'identity' ? '.widget-left' : '.widget-right';
        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('shake');
            const inner = el.querySelector('.guess-label');
            if(inner) inner.style.textDecoration = 'line-through';
            setTimeout(() => el.classList.remove('shake'), 500);
        }
    },

    // --- Selectors ---

    // Modal Overlay helper
    createModal: () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        const content = document.createElement('div');
        content.className = 'modal-content';
        modal.appendChild(content);

        document.body.appendChild(modal);
        return { modal, content };
    },

    openCrewSelector: (filename, mode) => {
        // mode: 'identity' or 'offender'
        const { modal, content } = App.createModal();

        // Title
        const title = document.createElement('h2');
        title.textContent = mode === 'identity' ? '选择船员' : '选择凶手';
        content.appendChild(title);

        const innerLayout = document.createElement('div');
        innerLayout.className = 'selector-layout';

        // Sidebar for special offenders
        if (mode === 'offender') {
            const sidebar = document.createElement('div');
            sidebar.className = 'selector-sidebar';
            sidebar.innerHTML = '<h3>特殊</h3>';

            const special = [
                { name: '敌人', id: -1 },
                { name: '野兽', id: -2 }
            ];

            special.forEach(s => {
                const item = document.createElement('div');
                item.className = 'selector-item';
                item.textContent = s.name;
                item.onclick = () => {
                    App.selectCrew(filename, s.id, mode);
                    modal.remove();
                };
                sidebar.appendChild(item);
            });
            innerLayout.appendChild(sidebar);
        }

        // Crew List
        const listContainer = document.createElement('div');
        listContainer.className = 'selector-list-container';

        const sortedCrew = [...App.data.crew].sort((a,b) => a.id - b.id);
        let currentPage = 0;
        const perPage = 10;

        const renderList = () => {
             listContainer.innerHTML = '';
             // Header
             const header = document.createElement('div');
             header.className = 'crew-header-row';
             header.innerHTML = `<span>编号</span><span>姓名</span><span>身份</span><span>籍贯</span>`;
             listContainer.appendChild(header);

             const start = currentPage * perPage;
             const end = Math.min(start + perPage, sortedCrew.length);
             const pageData = sortedCrew.slice(start, end);

             pageData.forEach(c => {
                 const row = document.createElement('div');
                 row.className = 'crew-row';
                 row.innerHTML = `
                    <span class="en-text">${c.id}</span>
                    <span class="en-text">${c.name}</span>
                    <span class="en-text">${c.role}</span>
                    <span class="en-text">${c.origin}</span>
                 `;
                 row.onclick = () => {
                     App.selectCrew(filename, c.id, mode);
                     modal.remove();
                 };
                 listContainer.appendChild(row);
             });
        };

        innerLayout.appendChild(listContainer);
        content.appendChild(innerLayout);

        // Footer Pagination
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        const prev = document.createElement('button');
        prev.textContent = '<<';
        prev.className = 'nav-btn';
        prev.onclick = () => {
             const total = Math.ceil(sortedCrew.length / perPage);
             currentPage = (currentPage - 1 + total) % total;
             renderList();
             pageLabel.textContent = `${currentPage + 1} / ${total}`;
        };

        const total = Math.ceil(sortedCrew.length / perPage);
        const pageLabel = document.createElement('span');
        pageLabel.className = 'en-text';
        pageLabel.textContent = `1 / ${total}`;

        const next = document.createElement('button');
        next.textContent = '>>';
        next.className = 'nav-btn';
        next.onclick = () => {
             const total = Math.ceil(sortedCrew.length / perPage);
             currentPage = (currentPage + 1) % total;
             renderList();
             pageLabel.textContent = `${currentPage + 1} / ${total}`;
        };

        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        cancel.className = 'nav-btn';
        cancel.style.marginLeft = '20px';
        cancel.onclick = () => modal.remove();

        footer.appendChild(prev);
        footer.appendChild(pageLabel);
        footer.appendChild(next);
        footer.appendChild(cancel);
        content.appendChild(footer);

        renderList();
    },

    selectCrew: (filename, id, mode) => {
        if (mode === 'identity') {
            App.state.hintsUsed[filename].guessed_id = id;
            App.saveState();
            App.render();
        } else {
            App.state.hintsUsed[filename].guessed_fate.offender_id = id;
            App.saveState();
            // If overlay is open (cause selector), we might need to refresh, but usually this closes the crew selector modal
            // and we are back to detail view or cause selector.
            // Wait, if we are in cause flow, this was called from createFateWidget's label2 click or from inside fate flow?
            // The original Python app opens crew selector separately for Offender.
            // So we just render detail view.
            App.render();
        }
    },

    openFateSelector: (filename) => {
        const { modal, content } = App.createModal();

        const header = document.createElement('h2');
        header.textContent = '选择死因';
        content.appendChild(header);

        const listContainer = document.createElement('div');
        listContainer.className = 'fate-list';
        content.appendChild(listContainer);

        let currentPage = 0;
        const perPage = 9;
        const fates = App.data.fatesStructure;

        const renderCauses = () => {
             listContainer.innerHTML = '';
             const start = currentPage * perPage;
             const end = Math.min(start + perPage, fates.length);
             const pageData = fates.slice(start, end);

             pageData.forEach(c => {
                 const item = document.createElement('div');
                 item.className = 'fate-item';
                 item.textContent = c.label;
                 item.onclick = () => {
                     App.selectCause(filename, c.id, modal, content);
                 };
                 listContainer.appendChild(item);
             });
        };

        // Footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        const prev = document.createElement('button');
        prev.textContent = '<<';
        prev.className = 'nav-btn';
        prev.onclick = () => {
             const total = Math.ceil(fates.length / perPage);
             currentPage = (currentPage - 1 + total) % total;
             renderCauses();
             pageLabel.textContent = `${currentPage + 1} / ${total}`;
        };

        const total = Math.ceil(fates.length / perPage);
        const pageLabel = document.createElement('span');
        pageLabel.className = 'en-text';
        pageLabel.textContent = `1 / ${total}`;

        const next = document.createElement('button');
        next.textContent = '>>';
        next.className = 'nav-btn';
        next.onclick = () => {
             const total = Math.ceil(fates.length / perPage);
             currentPage = (currentPage + 1) % total;
             renderCauses();
             pageLabel.textContent = `${currentPage + 1} / ${total}`;
        };

        const cancel = document.createElement('button');
        cancel.textContent = '取消';
        cancel.className = 'nav-btn';
        cancel.style.marginLeft = '20px';
        cancel.onclick = () => modal.remove();

        footer.appendChild(prev);
        footer.appendChild(pageLabel);
        footer.appendChild(next);
        footer.appendChild(cancel);
        content.appendChild(footer);

        renderCauses();
    },

    selectCause: (filename, causeId, modal, content) => {
        App.state.hintsUsed[filename].guessed_fate.cause_id = causeId;
        App.state.hintsUsed[filename].guessed_fate.weapon = null; // Reset weapon

        const causeObj = App.data.fatesStructure.find(c => c.id === causeId);

        if (causeObj && causeObj.has_weapon) {
            // Show Weapon Selector in same modal
            content.innerHTML = ''; // Clear existing

            const header = document.createElement('h2');
            header.textContent = causeObj.label;
            content.appendChild(header);

            const listContainer = document.createElement('div');
            listContainer.className = 'fate-list';
            content.appendChild(listContainer);

            causeObj.weapons.forEach(w => {
                const item = document.createElement('div');
                item.className = 'fate-item';
                item.textContent = w;
                item.onclick = () => {
                    App.state.hintsUsed[filename].guessed_fate.weapon = w;
                    App.saveState();
                    modal.remove();
                    App.render();
                };
                listContainer.appendChild(item);
            });

             const footer = document.createElement('div');
             footer.className = 'modal-footer';
             const cancel = document.createElement('button');
             cancel.textContent = '取消';
             cancel.className = 'nav-btn';
             cancel.onclick = () => modal.remove();
             footer.appendChild(cancel);
             content.appendChild(footer);

        } else {
            App.saveState();
            modal.remove();
            App.render();
        }
    }

};

document.addEventListener('DOMContentLoaded', App.init);
