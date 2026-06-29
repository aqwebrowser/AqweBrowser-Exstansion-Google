// --- Clock and Date Widget ---
function updateWidgets() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toTimeString().split(' ')[0];
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
setInterval(updateWidgets, 1000);
updateWidgets();

// --- Ad Filtered Search Form Actions ---
document.getElementById('cleanSearchForm').addEventListener('submit', function(e) {
    const val = document.getElementById('searchInput').value;
    if (val.trim() !== "") {
        document.getElementById('hiddenQuery').value = val + " -shop -ad";
    }
});

// --- Memory Repositories and Global Storage Arrays ---
let initialCubes = [
    { id: "1", label: "YouTube", url: "https://youtube.com" },
    { id: "2", label: "ChatGPT", url: "https://chatgpt.com" }
];

let initialSidebar = [
    { id: "1", icon: "🌐", url: "https://google.com" },
    { id: "2", icon: "💬", url: "https://discord.com" }
];

// --- Startup Storage Engine Interfacing Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadThemeSettings();
    loadLogoSettings();
    loadPinnedCubes();
    loadSidebarItems();
});

// --- Logo Storage Routing ---
function loadLogoSettings() {
    const logoImg = document.getElementById('browserLogo');
    chrome.storage.local.get(['customLogoData'], (data) => {
        if (data.customLogoData) {
            logoImg.src = data.customLogoData;
        } else {
            logoImg.src = "logo.png"; // Local repository fallback
        }
    });
}

document.getElementById('logoUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event.target.result;
            chrome.storage.local.set({ customLogoData: dataUrl }, () => {
                loadLogoSettings();
            });
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('resetLogo').addEventListener('click', () => {
    chrome.storage.local.remove('customLogoData', () => {
        loadLogoSettings();
    });
});

// --- Color Theme Settings ---
function loadThemeSettings() {
    const htmlNode = document.documentElement;
    const select = document.getElementById('themeSelect');
    
    chrome.storage.local.get(['themeMode'], (data) => {
        const theme = data.themeMode || 'system';
        htmlNode.setAttribute('data-theme', theme);
        select.value = theme;
    });
}

document.getElementById('themeSelect').addEventListener('change', (e) => {
    const choice = e.target.value;
    chrome.storage.local.set({ themeMode: choice }, () => {
        loadThemeSettings();
    });
});

// --- Pinned Shortcuts Rules ---
function loadPinnedCubes() {
    const grid = document.getElementById('shortcutsGrid');
    chrome.storage.local.get(['pinnedCubes'], (data) => {
        const items = data.pinnedCubes || initialCubes;
        grid.innerHTML = '';
        items.forEach(cube => {
            const wrap = document.createElement('div');
            wrap.className = 'shortcut-card-wrapper';
            wrap.innerHTML = `
                <a href="${cube.url}" class="shortcut-card">
                    <div class="shortcut-icon-tile">${cube.label.substring(0,2).toUpperCase()}</div>
                    <div class="shortcut-name-label">${cube.label}</div>
                </a>
                <div class="card-delete-btn" data-id="${cube.id}">❌</div>
            `;
            grid.appendChild(wrap);
        });

        // Trigger Listeners
        document.querySelectorAll('.card-delete-btn').forEach(btn => {
            btn.onclick = (e) => deleteCube(e.target.getAttribute('data-id'));
        });
    });
}

document.getElementById('saveCubeBtn').onclick = () => {
    const label = document.getElementById('newCubeLabel').value;
    const url = document.getElementById('newCubeUrl').value;
    if(label && url) {
        chrome.storage.local.get(['pinnedCubes'], (data) => {
            let list = data.pinnedCubes || initialCubes;
            list.push({ id: Date.now().toString(), label, url });
            chrome.storage.local.set({ pinnedCubes: list }, () => {
                loadPinnedCubes();
                document.getElementById('newCubeLabel').value = '';
                document.getElementById('newCubeUrl').value = '';
            });
        });
    }
};

function deleteCube(id) {
    chrome.storage.local.get(['pinnedCubes'], (data) => {
        let list = data.pinnedCubes || initialCubes;
        list = list.filter(c => c.id !== id);
        chrome.storage.local.set({ pinnedCubes: list }, () => loadPinnedCubes());
    });
}

// --- Interactive Sidebar Management Framework ---
function loadSidebarItems() {
    const container = document.getElementById('sidebarItems');
    chrome.storage.local.get(['sidebarItems'], (data) => {
        const items = data.sidebarItems || initialSidebar;
        container.innerHTML = '';
        items.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'sidebar-item-wrapper';
            wrapper.innerHTML = `
                <a href="${item.url}" class="sidebar-icon" title="${item.url}">${item.icon}</a>
                <div class="item-control-overlay" data-id="${item.id}">❌</div>
            `;
            container.appendChild(wrapper);
        });

        document.querySelectorAll('.item-control-overlay').forEach(btn => {
            btn.onclick = (e) => deleteSidebarItem(e.target.getAttribute('data-id'));
        });
    });
}

document.getElementById('saveSidebarBtn').onclick = () => {
    const icon = document.getElementById('sidebarLabel').value;
    const url = document.getElementById('sidebarUrl').value;
    if (icon && url) {
        chrome.storage.local.get(['sidebarItems'], (data) => {
            let list = data.sidebarItems || initialSidebar;
            list.push({ id: Date.now().toString(), icon, url });
            chrome.storage.local.set({ sidebarItems: list }, () => {
                loadSidebarItems();
                document.getElementById('sidebarModal').style.display = 'none';
                document.getElementById('sidebarLabel').value = '';
                document.getElementById('sidebarUrl').value = '';
            });
        });
    }
};

function deleteSidebarItem(id) {
    chrome.storage.local.get(['sidebarItems'], (data) => {
        let list = data.sidebarItems || initialSidebar;
        list = list.filter(item => item.id !== id);
        chrome.storage.local.set({ sidebarItems: list }, () => loadSidebarItems());
    });
}

// --- Modals Display Toggles Hooks ---
const sModal = document.getElementById('settingsModal');
const sbModal = document.getElementById('sidebarModal');

document.getElementById('openSettings').onclick = () => sModal.style.display = 'block';
document.getElementById('closeSettings').onclick = () => sModal.style.display = 'none';
document.getElementById('addSidebarItem').onclick = () => sbModal.style.display = 'block';
document.getElementById('closeSidebarModal').onclick = () => sbModal.style.display = 'none';

window.onclick = (e) => {
    if (e.target === sModal) sModal.style.display = 'none';
    if (e.target === sbModal) sbModal.style.display = 'none';
};