let pagesData = [];

async function fetchPages() {
    const response = await fetch('JSON/Pages.json');
    pagesData = await response.json();
    return pagesData;
}

function getPageByPath(pages, path) {
    let node = pages;
    for (let i = 0; i < path.length - 1; i++) {
        node = node[path[i]].children;
    }
    return {parent: node, index: path[path.length - 1]};
}

async function movePage(fromPath, toPath) {
    // Ne pas permettre de déplacer sur soi-même ou dans ses enfants
    if (toPath.length >= fromPath.length && toPath.slice(0, fromPath.length).every((v, i) => v === fromPath[i])) {
        return;
    }
    // Retirer la page source
    const from = getPageByPath(pagesData, fromPath);
    const [movedPage] = from.parent.splice(from.index, 1);

    // Calculer la nouvelle position (après suppression)
    let to = getPageByPath(pagesData, toPath);
    // Si on déplace vers un index après l'élément supprimé dans le même parent, il faut décrémenter l'index
    if (from.parent === to.parent && from.index < to.index) {
        to.index--;
    }
    to.parent.splice(to.index, 0, movedPage);

    // Rafraîchir l'affichage
    const navContainer = document.querySelector('.pages-nav-container ul');
    navContainer.innerHTML = '';
    renderPages(pagesData, navContainer);

    // (Optionnel) Sauvegarder dans le JSON côté serveur via une requête POST/AJAX
}

function createPageNavRow(page, isLast, depth = 0, pagePath = []) {
    const row = document.createElement('div');
    row.className = 'page-nav-row';
    row.draggable = true;
    row.dataset.pagePath = JSON.stringify(pagePath);

    // Tree line
    const treeLine = document.createElement('span');
    treeLine.className = 'tree-line';
    if (depth === 0) {
        treeLine.textContent = '';
    } else if (isLast) {
        treeLine.textContent = '└';
    } else {
        treeLine.textContent = '├';
    }
    row.appendChild(treeLine);

    // Chevron
    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = (page.children && page.children.length) ? '▶' : '';
    row.appendChild(chevron);
    chevron.addEventListener('click', (e) => {
        e.stopPropagation();
        const subUl = row.nextSibling;
        if (subUl && subUl.classList && subUl.classList.contains('subpage-nav')) {
            subUl.style.display = subUl.style.display === 'none' ? '' : 'none';
            chevron.style.transform = subUl.style.display === 'none' ? 'rotate(0deg)' : 'rotate(90deg)';
        }
    });

    // Button
    const btn = document.createElement('button');
    btn.className = 'page-nav-button';
    btn.textContent = page.title;
    row.appendChild(btn);

    // Drag events
    row.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', row.dataset.pagePath);
        row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
    });
    row.addEventListener('dragover', (e) => {
        e.preventDefault();
        row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
    });
    row.addEventListener('drop', async (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        const fromPath = JSON.parse(e.dataTransfer.getData('text/plain'));
        const toPath = pagePath;
        if (JSON.stringify(fromPath) !== JSON.stringify(toPath)) {
            await movePage(fromPath, toPath);
        }
    });

    return row;
}

function renderPages(pages, container, depth = 0, parentPath = []) {
    pages.forEach((page, idx) => {
        // --- Drop zone avant la page ---
        const dropBefore = document.createElement('div');
        dropBefore.className = 'page-drop-indicator';
        dropBefore.addEventListener('dragover', e => {
            e.preventDefault();
            dropBefore.classList.add('active');
        });
        dropBefore.addEventListener('dragleave', () => {
            dropBefore.classList.remove('active');
        });
        dropBefore.addEventListener('drop', async e => {
            e.preventDefault();
            dropBefore.classList.remove('active');
            const fromPath = JSON.parse(e.dataTransfer.getData('text/plain'));
            const toPath = [...parentPath, idx];
            await movePage(fromPath, toPath);
        });
        container.appendChild(dropBefore);

        // --- La page elle-même ---
        const isLast = idx === pages.length - 1;
        const pagePath = [...parentPath, idx];
        const row = createPageNavRow(page, isLast, depth, pagePath);

        // Drop sur la page = devient enfant
        row.addEventListener('dragover', e => {
            e.preventDefault();
            row.classList.add('drag-over');
        });
        row.addEventListener('dragleave', () => {
            row.classList.remove('drag-over');
        });
        row.addEventListener('drop', async e => {
            e.preventDefault();
            row.classList.remove('drag-over');
            const fromPath = JSON.parse(e.dataTransfer.getData('text/plain'));
            // Ajoute comme premier enfant
            const toPath = [...pagePath, 0];
            await movePage(fromPath, toPath);
        });

        container.appendChild(row);

        // --- Les enfants ---
        if (page.children && page.children.length) {
            const subUl = document.createElement('ul');
            subUl.className = 'subpage-nav';
            renderPages(page.children, subUl, depth + 1, pagePath);
            container.appendChild(subUl);
        }
    });

    // Drop zone après la dernière page
    const dropAfter = document.createElement('div');
    dropAfter.className = 'page-drop-indicator';
    dropAfter.addEventListener('dragover', e => {
        e.preventDefault();
        dropAfter.classList.add('active');
    });
    dropAfter.addEventListener('dragleave', () => {
        dropAfter.classList.remove('active');
    });
    dropAfter.addEventListener('drop', async e => {
        e.preventDefault();
        dropAfter.classList.remove('active');
        const fromPath = JSON.parse(e.dataTransfer.getData('text/plain'));
        const toPath = [...parentPath, container.childElementCount / 2]; // /2 car drop + row
        await movePage(fromPath, toPath);
    });
    container.appendChild(dropAfter);
}

document.addEventListener('DOMContentLoaded', async () => {
    const navContainer = document.querySelector('.pages-nav-container ul');
    navContainer.innerHTML = '';
    pagesData = await fetchPages();
    renderPages(pagesData, navContainer);
});