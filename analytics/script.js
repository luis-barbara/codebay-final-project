// Funções para carregar header/footer (mantidas como no original)
async function loadcopyright() {
    const year = new Date().getFullYear();
    if(document.getElementById('copyright-year')) {
        document.getElementById('copyright-year').innerHTML = `© ${year} CodeBay - all rights reserved`;
    }
}
async function loadfooter() {
    const response = await fetch('../components/footer.html');
    const footer = await response.text();
    document.getElementById('foot').innerHTML = footer;
    loadcopyright();
}
async function loadheader() {
    const response = await fetch('../components/header_logged_in.html');
    const header = await response.text();
    document.getElementById('head').innerHTML = header;
    await loadavat();
    setupNotificationDropdown();
}
async function loadhamb() {
    const response = await fetch('../components/hamb_menu.html');
    const hamb = await response.text();
    document.getElementById('hamb').innerHTML = hamb;
    setTimeout(setupSidebar, 0);
}
async function loadavat() {
    const response = await fetch('../components/avat_menu.html');
    const avat = await response.text();
    document.getElementById('avat').innerHTML = avat;
    setTimeout(setupAvatarSidebar, 0);
}
async function setupSidebar() { /* ... Lógica do sidebar ... */ }
async function setupAvatarSidebar() { /* ... Lógica do sidebar do avatar ... */ }
function setupNotificationDropdown() { /* ... Lógica das notificações ... */ }

(async () => {
    await loadfooter();
    await loadheader(); 
    await loadhamb();   
})();


// ============== LÓGICA DO DASHBOARD DINÂMICO ==============

document.addEventListener('DOMContentLoaded', () => {

    const FOUNDATION_YEAR = 2025;
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    let revenueChart, ordersChart, clientsChart;
    const currentDate = new Date();
    const currentRealYear = currentDate.getFullYear();
    const currentRealMonthIndex = currentDate.getMonth();

    let selectedYear = currentRealYear;
    let selectedMonthIndex = -1; // -1 para "Ano Inteiro"

    const allDashboardData = {};

    const statElements = {
        totalRevenue: document.getElementById('total-revenue-value'),
        totalRevenuePerc: document.getElementById('total-revenue-perc'),
        totalOrders: document.getElementById('total-orders-value'),
        totalOrdersPerc: document.getElementById('total-orders-perc'),
        totalClients: document.getElementById('total-clients-value'),
        totalClientsPerc: document.getElementById('total-clients-perc'),
        newClients: document.getElementById('new-clients-value'),
        newClientsPerc: document.getElementById('new-clients-perc'),
        regularClients: document.getElementById('regular-clients-value'),
        regularClientsPerc: document.getElementById('regular-clients-perc'),
        productsSold: document.getElementById('products-sold-value'),
        productsSoldPerc: document.getElementById('products-sold-perc'),
        moneyPerOrder: document.getElementById('money-per-order-value'),
        moneyPerOrderPerc: document.getElementById('money-per-order-perc'),
        ordersTableBody: document.getElementById('orders-table-body'),
    };
    
    function formatCurrency(value) { return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value); }
    function formatInteger(value) { return new Intl.NumberFormat('pt-PT').format(value); }

    function init() {
        for (let year = FOUNDATION_YEAR; year <= currentRealYear + 1; year++) {
            allDashboardData[year] = generateFakeDataForYear(year);
        }
        setupDatePicker();
        createCharts();
        updateDashboard(selectedYear, selectedMonthIndex);
    }

    function setupDatePicker() {
        const datePicker = document.getElementById('datePicker');
        const button = document.getElementById('datePickerButton');
        const dropdown = document.getElementById('datePickerDropdown');
        
        dropdown.innerHTML = `
            <div class="dash-dp__nav">
                <button class="dash-dp__arrow" id="prevYear">&lt;</button>
                <span class="dash-dp__year" id="currentPickerYear"></span>
                <button class="dash-dp__arrow" id="nextYear">&gt;</button>
            </div>
            <div class="dash-dp__months-list" id="monthsList"></div>
        `;
        
        populateDatePicker(selectedYear);

        button.addEventListener('click', () => { dropdown.classList.toggle('dash-dp-show'); button.classList.toggle('dash-dp-open'); });
        document.getElementById('prevYear').addEventListener('click', () => { if (selectedYear > FOUNDATION_YEAR) { selectedYear--; populateDatePicker(selectedYear); updateDashboard(selectedYear, -1); } });
        document.getElementById('nextYear').addEventListener('click', () => { if (selectedYear < currentRealYear) { selectedYear++; populateDatePicker(selectedYear); updateDashboard(selectedYear, -1); } });

        document.getElementById('monthsList').addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('.dash-date-picker__item') && !target.matches('.dash-date-picker__item--disabled')) {
                selectedMonthIndex = parseInt(target.dataset.monthIndex, 10);
                updateDashboard(selectedYear, selectedMonthIndex);
                
                dropdown.querySelector('.dash-date-picker__item--active')?.classList.remove('dash-date-picker__item--active');
                target.classList.add('dash-date-picker__item--active');
                
                dropdown.classList.remove('dash-dp-show');
                button.classList.remove('dash-dp-open');
            }
        });

        window.addEventListener('click', (e) => { if (!datePicker.contains(e.target)) { dropdown.classList.remove('dash-dp-show'); button.classList.remove('dash-dp-open'); }});
    }

    function populateDatePicker(year) {
        const monthsList = document.getElementById('monthsList');
        document.getElementById('currentPickerYear').textContent = year;
        
        const prevYearBtn = document.getElementById('prevYear');
        const nextYearBtn = document.getElementById('nextYear');
        prevYearBtn.disabled = (year <= FOUNDATION_YEAR);
        nextYearBtn.disabled = (year >= currentRealYear);
        prevYearBtn.classList.toggle('dash-dp__arrow--disabled', prevYearBtn.disabled);
        nextYearBtn.classList.toggle('dash-dp__arrow--disabled', nextYearBtn.disabled);

        monthsList.innerHTML = '';
        
        // Adiciona "Ano Inteiro"
        const allYearEl = document.createElement('div');
        allYearEl.classList.add('dash-date-picker__item');
        allYearEl.textContent = `Ano Inteiro ${year}`;
        allYearEl.dataset.monthIndex = -1;
        if (selectedMonthIndex === -1) {
            allYearEl.classList.add('dash-date-picker__item--active');
            document.getElementById('datePickerLabel').textContent = `Ano Inteiro ${year}`;
        }
        monthsList.appendChild(allYearEl);
        monthsList.innerHTML += `<div class="dash-dp__separator"></div>`;

        // Adiciona os meses
        monthNames.forEach((name, index) => {
            const monthEl = document.createElement('div');
            monthEl.classList.add('dash-date-picker__item');
            monthEl.textContent = name;
            monthEl.dataset.monthIndex = index;

            if (year === currentRealYear && index > currentRealMonthIndex) {
                monthEl.classList.add('dash-date-picker__item--disabled');
            }
            if (year === selectedYear && index === selectedMonthIndex) {
                monthEl.classList.add('dash-date-picker__item--active');
                document.getElementById('datePickerLabel').textContent = `${name} ${year}`;
            }
            monthsList.appendChild(monthEl);
        });
    }

    function updateDashboard(year, monthIndex) {
        if (monthIndex === -1) { // Vista Anual
            const yearData = aggregateYearData(year);
            const prevYearData = aggregateYearData(year - 1);
            
            updateStat(statElements.totalRevenue, statElements.totalRevenuePerc, yearData.stats.totalRevenue, prevYearData.stats.totalRevenue, 'currency');
            updateStat(statElements.totalOrders, statElements.totalOrdersPerc, yearData.stats.totalOrders, prevYearData.stats.totalOrders, 'integer');
            updateStat(statElements.totalClients, statElements.totalClientsPerc, yearData.stats.totalClients, prevYearData.stats.totalClients, 'integer');
            updateStat(statElements.newClients, statElements.newClientsPerc, yearData.stats.newClients, prevYearData.stats.newClients, 'integer');
            updateStat(statElements.regularClients, statElements.regularClientsPerc, yearData.stats.regularClients, prevYearData.stats.regularClients, 'integer');
            updateStat(statElements.productsSold, statElements.productsSoldPerc, yearData.stats.productsSold, prevYearData.stats.productsSold, 'integer');
            updateStat(statElements.moneyPerOrder, statElements.moneyPerOrderPerc, yearData.stats.moneyPerOrder, prevYearData.stats.moneyPerOrder, 'currency');
            
            const lastMonthWithData = year === currentRealYear ? currentRealMonthIndex : 11;
            updateOrdersTable(allDashboardData[year][lastMonthWithData].lastOrders, year);

            revenueChart.data.labels = monthNamesShort;
            revenueChart.data.datasets[0].data = yearData.charts.monthlyTotals.revenue;
            ordersChart.data.labels = monthNamesShort;
            ordersChart.data.datasets[0].data = yearData.charts.monthlyTotals.orders;
            clientsChart.data.labels = monthNamesShort;
            clientsChart.data.datasets[0].data = yearData.charts.monthlyTotals.clients;
        } else { // Vista Mensal
            const data = allDashboardData[year][monthIndex];
            const prevMonthYear = monthIndex === 0 ? year - 1 : year;
            const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
            const prevMonthData = prevMonthYear >= FOUNDATION_YEAR ? allDashboardData[prevMonthYear][prevMonthIndex] : null;

            updateStat(statElements.totalRevenue, statElements.totalRevenuePerc, data.stats.totalRevenue, prevMonthData?.stats.totalRevenue, 'currency');
            updateStat(statElements.totalOrders, statElements.totalOrdersPerc, data.stats.totalOrders, prevMonthData?.stats.totalOrders, 'integer');
            updateStat(statElements.totalClients, statElements.totalClientsPerc, data.stats.totalClients, prevMonthData?.stats.totalClients, 'integer');
            updateStat(statElements.newClients, statElements.newClientsPerc, data.stats.newClients, prevMonthData?.stats.newClients, 'integer');
            updateStat(statElements.regularClients, statElements.regularClientsPerc, data.stats.regularClients, prevMonthData?.stats.regularClients, 'integer');
            updateStat(statElements.productsSold, statElements.productsSoldPerc, data.stats.productsSold, prevMonthData?.stats.productsSold, 'integer');
            updateStat(statElements.moneyPerOrder, statElements.moneyPerOrderPerc, data.stats.moneyPerOrder, prevMonthData?.stats.moneyPerOrder, 'currency');

            updateOrdersTable(data.lastOrders, year);

            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            const chartLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            revenueChart.data.labels = chartLabels;
            revenueChart.data.datasets[0].data = data.charts.dailyData.revenue.slice(0, daysInMonth);
            ordersChart.data.labels = chartLabels;
            ordersChart.data.datasets[0].data = data.charts.dailyData.orders.slice(0, daysInMonth);
            clientsChart.data.labels = chartLabels;
            clientsChart.data.datasets[0].data = data.charts.dailyData.clients.slice(0, daysInMonth);
        }
        revenueChart.update();
        ordersChart.update();
        clientsChart.update();
    }
    
    function updateStat(valueEl, percEl, currentValue, prevValue, formatType) { /* ... Função inalterada ... */ }
    function updateOrdersTable(orders, year) { /* ... Função inalterada ... */ }
    function createCharts() { /* ... Função inalterada ... */ }

    function aggregateYearData(year) {
        if (!allDashboardData[year]) {
            return { stats: { totalRevenue: 0, totalOrders: 0, totalClients: 0, newClients: 0, regularClients: 0, productsSold: 0, moneyPerOrder: 0 }, charts: { monthlyTotals: { revenue: [], orders: [], clients: [] } } };
        }
        
        const aggregated = {
            stats: { totalRevenue: 0, totalOrders: 0, totalClients: 0, newClients: 0, regularClients: 0, productsSold: 0 },
            charts: { monthlyTotals: { revenue: [], orders: [], clients: [] } }
        };

        const monthsToAggregate = year < currentRealYear ? 12 : currentRealMonthIndex + 1;

        for (let i = 0; i < 12; i++) {
            if (i < monthsToAggregate) {
                const monthData = allDashboardData[year][i];
                aggregated.stats.totalRevenue += monthData.stats.totalRevenue;
                aggregated.stats.totalOrders += monthData.stats.totalOrders;
                aggregated.stats.totalClients += monthData.stats.totalClients;
                aggregated.stats.newClients += monthData.stats.newClients;
                aggregated.stats.regularClients += monthData.stats.regularClients;
                aggregated.stats.productsSold += monthData.stats.productsSold;
                
                aggregated.charts.monthlyTotals.revenue.push(monthData.stats.totalRevenue);
                aggregated.charts.monthlyTotals.orders.push(monthData.stats.totalOrders);
                aggregated.charts.monthlyTotals.clients.push(monthData.stats.totalClients);
            } else {
                aggregated.charts.monthlyTotals.revenue.push(0);
                aggregated.charts.monthlyTotals.orders.push(0);
                aggregated.charts.monthlyTotals.clients.push(0);
            }
        }
        aggregated.stats.moneyPerOrder = aggregated.stats.totalOrders > 0 ? aggregated.stats.totalRevenue / aggregated.stats.totalOrders : 0;
        return aggregated;
    }

    function generateFakeDataForYear(year) {
        let yearGrowthFactor = 1 + ((year - FOUNDATION_YEAR) * 0.15);
        let baseRevenue = 40000 * yearGrowthFactor;
        let baseOrders = 400 * yearGrowthFactor;

        return monthNames.map((month, index) => {
            baseRevenue += (Math.sin(index / 2) * 15000 * yearGrowthFactor) + (Math.random() * 5000 - 2500);
            baseOrders += (Math.sin(index / 2) * 150 * yearGrowthFactor) + (Math.random() * 20 - 10);
            const revenue = Math.max(20000, baseRevenue);
            const orders = Math.max(150, baseOrders);
            return {
                stats: { totalRevenue: revenue, totalOrders: Math.floor(orders), totalClients: Math.floor(orders * (0.8 + Math.random() * 0.1)), newClients: Math.floor(orders * (0.1 + Math.random() * 0.05)), regularClients: Math.floor(orders * (0.7 + Math.random() * 0.05)), productsSold: 5 + Math.floor(Math.random() * 3), moneyPerOrder: revenue / orders, },
                lastOrders: [ {id: `#${8351 + index}`, customer: 'Ana Silva', amount: 1500 + Math.random() * 1000, product: 'Website', status: 'Delivered', date: `15/${index+1}/YYYY`}, {id: `#${8350 + index}`, customer: 'Bruno Costa', amount: 500 + Math.random() * 500, product: 'Logo Design', status: 'Pending', date: `12/${index+1}/YYYY`}, {id: `#${8349 + index}`, customer: 'Carla Dias', amount: 2500 + Math.random() * 1500, product: 'Mobile App', status: 'Delivered', date: `05/${index+1}/YYYY`}, ],
                charts: { dailyData: { revenue: Array.from({ length: 31 }, () => 1000 + Math.random() * 4000), orders: Array.from({ length: 31 }, () => 10 + Math.floor(Math.random() * 30)), clients: Array.from({ length: 31 }, () => 5 + Math.floor(Math.random() * 15)), }}
            };
        });
    }
    
    // Recopying utility functions to avoid reference errors in the final script
    updateStat = function(valueEl, percEl, currentValue, prevValue, formatType) {
        const percentage = (prevValue && prevValue > 0) ? ((currentValue - prevValue) / prevValue) * 100 : 0;
        const formattedValue = formatType === 'currency' ? formatCurrency(currentValue) : formatInteger(currentValue);
        valueEl.textContent = formattedValue;
        percEl.textContent = `${Math.abs(percentage).toFixed(1)}% ${percentage >= 0 ? '↑' : '↓'}`;
        percEl.className = 'percentage';
        percEl.classList.add(percentage >= 0 ? 'positive' : 'negative');
        valueEl.appendChild(document.createTextNode(' '));
        valueEl.appendChild(percEl);
    }
    
    updateOrdersTable = function(orders, year) {
        statElements.ordersTableBody.innerHTML = '';
        orders.forEach(order => {
            const statusClass = `status-${order.status.toLowerCase()}`;
            const row = `
                <tr>
                    <td class="font-mono">${order.id}</td>
                    <td>${order.customer}</td>
                    <td class="font-medium">${formatCurrency(order.amount)}</td>
                    <td>${order.product}</td>
                    <td><span class="status-pill ${statusClass}">${order.status}</span></td>
                    <td>${order.date.replace('YYYY', year)}</td>
                </tr>
            `;
            statElements.ordersTableBody.innerHTML += row;
        });
    }

    createCharts = function() {
        const defaultFontColor = '#94A3B8';
        const gridColor = 'rgba(255, 255, 255, 0.1)';
        const revenueGradient = document.getElementById('revenueChart').getContext('2d').createLinearGradient(0, 0, 0, 300);
        revenueGradient.addColorStop(0, 'rgba(196, 117, 232, 0.5)');
        revenueGradient.addColorStop(1, 'rgba(196, 117, 232, 0)');
        const commonOptions = { responsive: true, maintainAspectRatio: false, animation: { duration: 500 } };
        revenueChart = new Chart('revenueChart', { type: 'line', data: { datasets: [{ label: 'Revenue', borderColor: '#C475E8', backgroundColor: revenueGradient, fill: true, tension: 0.4 }] }, options: { ...commonOptions, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatCurrency(ctx.parsed.y) }}}, scales: { y: { beginAtZero: true, ticks: { color: defaultFontColor, callback: (v) => formatCurrency(v/1000) + 'K' }, grid: { color: gridColor, drawBorder: false }}, x: { ticks: { color: defaultFontColor }, grid: { display: false }} } } });
        ordersChart = new Chart('ordersChart', { type: 'bar', data: { datasets: [{ label: 'Orders', backgroundColor: '#5AB2F7', borderRadius: 4 }] }, options: { ...commonOptions, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: true, ticks: { color: defaultFontColor }, grid: { display: false } } } } });
        clientsChart = new Chart('clientsChart', { type: 'line', data: { datasets: [{ label: 'Clients', borderColor: '#C475E8', tension: 0.4, pointRadius: 0 }] }, options: { ...commonOptions, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: true, ticks: { color: defaultFontColor }, grid: { display: false } } } } });
    }

    init();
});