import { renderDashboard, initDashboard } from './views/dashboard.js';
import { renderHistory, initHistory } from './views/history.js';
import { renderReceipts, initReceipts } from './views/receipts.js';
import { renderInsights, initInsights } from './views/insights.js';
import { renderRightSidebar, initRightSidebar, renderCalendar } from './components/sidebar.js';
import { openModal } from './components/modal.js';
import { t } from './i18n.js';
import { getLanguage, setLanguage } from './state/store.js';

const views = {
    dashboard: { render: renderDashboard, init: initDashboard },
    history: { render: renderHistory, init: initHistory },
    receipts: { render: renderReceipts, init: initReceipts },
    insights: { render: renderInsights, init: initInsights }
};

const app = {
    currentView: 'dashboard',

    init() {
        this.ensureToastRoot();
        this.bindNav();
        this.bindLayoutControls();
        this.refreshSidebar();
        this.refreshNavigationLabels();
        this.syncResponsiveState();
        this.navigate('dashboard');
        window.addEventListener('resize', () => this.syncResponsiveState());
    },

    navigate(viewName) {
        if (!views[viewName]) return;
        this.currentView = viewName;

        const main = document.getElementById('main-content');
        if (!main) return;

        main.innerHTML = views[viewName].render();
        views[viewName].init();

        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.view === viewName;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'page' : 'false');

            const icon = item.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.toggle('fill-1', isActive);
        });

        this.closeMobileSidebar();
    },

    rerender() {
        this.refreshNavigationLabels();
        this.refreshSidebar();
        this.navigate(this.currentView);
    },

    refreshNavigationLabels() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const label = item.querySelector('[data-nav-label]');
            if (label) label.textContent = t(`common.${item.dataset.labelKey}`);
        });

        const menuButton = document.getElementById('mobile-nav-toggle');
        if (menuButton) menuButton.title = t('common.mobileMenu');

        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) sidebarToggle.title = t('sidebar.openRightPanel');
    },

    bindNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', event => {
                event.preventDefault();
                this.navigate(item.dataset.view);
            });
        });
    },

    bindLayoutControls() {
        const navToggle = document.getElementById('mobile-nav-toggle');
        const appOverlay = document.getElementById('app-overlay');
        const rightSidebar = document.getElementById('right-sidebar');
        const rightToggle = document.getElementById('sidebar-toggle');

        navToggle?.addEventListener('click', () => {
            document.querySelector('.sidebar-left')?.classList.toggle('mobile-open');
            document.body.classList.toggle('overlay-active');
        });

        appOverlay?.addEventListener('click', () => {
            this.closeMobileSidebar();
            if (window.innerWidth <= 1180) {
                rightSidebar?.classList.add('collapsed');
                rightToggle?.classList.add('shifted');
                document.body.classList.remove('overlay-active');
            }
        });

        rightToggle?.addEventListener('click', () => {
            if (window.innerWidth <= 1180) {
                const isCollapsed = rightSidebar?.classList.toggle('collapsed');
                rightToggle.classList.toggle('shifted', isCollapsed);
                document.body.classList.toggle('overlay-active', !isCollapsed);
                return;
            }

            const isCollapsed = rightSidebar?.classList.toggle('collapsed');
            rightToggle.classList.toggle('shifted', isCollapsed);
        });
    },

    syncResponsiveState() {
        const rightSidebar = document.getElementById('right-sidebar');
        const rightToggle = document.getElementById('sidebar-toggle');

        if (!rightSidebar || !rightToggle) return;

        if (window.innerWidth <= 1180) {
            rightSidebar.classList.add('collapsed');
            rightToggle.classList.add('shifted');
            document.body.classList.remove('overlay-active');
        } else {
            document.querySelector('.sidebar-left')?.classList.remove('mobile-open');
            document.body.classList.remove('overlay-active');
            rightSidebar.classList.remove('collapsed');
            rightToggle.classList.remove('shifted');
        }
    },

    closeMobileSidebar() {
        document.querySelector('.sidebar-left')?.classList.remove('mobile-open');
        if (window.innerWidth <= 1180) document.body.classList.remove('overlay-active');
    },

    refreshSidebar() {
        const container = document.getElementById('sidebar-right-content');
        if (!container) return;
        container.innerHTML = renderRightSidebar();
        initRightSidebar();

        const today = new Date();
        renderCalendar(today.getFullYear(), today.getMonth());
    },

    toggleLanguage() {
        const nextLanguage = getLanguage() === 'es' ? 'en' : 'es';
        setLanguage(nextLanguage);
        document.documentElement.lang = nextLanguage;
        this.rerender();
    },

    openModal(type, data) {
        openModal(type, data);
    },

    ensureToastRoot() {
        if (document.getElementById('app-toast-root')) return;
        const root = document.createElement('div');
        root.id = 'app-toast-root';
        root.className = 'app-toast-root';
        document.body.appendChild(root);
    },

    showToast(message, variant = 'success') {
        if (!message) return;
        this.ensureToastRoot();
        const root = document.getElementById('app-toast-root');
        if (!root) return;

        const toast = document.createElement('div');
        toast.className = `app-toast app-toast-${variant}`;
        toast.textContent = message;
        root.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('is-visible'));

        window.setTimeout(() => {
            toast.classList.remove('is-visible');
            window.setTimeout(() => toast.remove(), 220);
        }, 2600);
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = getLanguage();
    app.init();
});
