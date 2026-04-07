import { renderDashboard, initDashboard } from './views/dashboard.js';
import { renderHistorial, initHistorial } from './views/historial.js';
import { renderRecibos, initRecibos } from './views/recibos.js';
import { renderInsights, initInsights } from './views/insights.js';
import { renderRightSidebar, initRightSidebar, renderCalendar } from './components/sidebar.js';
import { openModal } from './components/modal.js';

const views = {
    dashboard: { render: renderDashboard, init: initDashboard },
    historial: { render: renderHistorial, init: initHistorial },
    recibos:   { render: renderRecibos,   init: initRecibos },
    insights:  { render: renderInsights,  init: initInsights }
};

const app = {
    currentView: 'dashboard',

    init() {
        this.bindNav();
        this.bindSidebarToggle();
        this.refreshSidebar();
        renderCalendar(2023, 9);
        this.navigate('dashboard');
    },

    navigate(viewName) {
        if (!views[viewName]) return;
        this.currentView = viewName;
        const main = document.getElementById('main-content');
        main.innerHTML = views[viewName].render();
        views[viewName].init();
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
            const icon = item.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.toggle('fill-1', item.dataset.view === viewName);
        });
    },

    bindNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => { e.preventDefault(); this.navigate(item.dataset.view); });
        });
    },

    bindSidebarToggle() {
        const btn = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('right-sidebar');
        if (!btn || !sidebar) return;

        btn.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            btn.classList.toggle('shifted', isCollapsed);
        });
    },

    refreshSidebar() {
        const el = document.getElementById('sidebar-right-content');
        if (el) { el.innerHTML = renderRightSidebar(); initRightSidebar(); }
    },

    openModal(type, data) { openModal(type, data); }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
