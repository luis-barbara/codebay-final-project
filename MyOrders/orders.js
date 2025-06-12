document.addEventListener('DOMContentLoaded', function() {
    // Selecionar elementos
    const table = document.querySelector('.orders-table');
    const tableRows = document.querySelectorAll('.orders-table tbody tr');
    const tableHeaders = document.querySelectorAll('.orders-table th');
    const searchInput = document.querySelector('.search-box input');
    const filterDropdown = document.querySelector('.filter-dropdown');

    // 1. Alternar cores das linhas (backup caso CSS não funcione)
    function alternateRowColors() {
        tableRows.forEach((row, index) => {
            // Reset styles
            row.style.backgroundColor = '';
            
            // Apply alternate colors
            if (index % 2 === 0) {
                row.style.backgroundColor = 'var(--darker-bg)';
            } else {
                row.style.backgroundColor = 'var(--primary-active)';
            }
        });
    }

    // 3. Seleção de linha
    function addRowSelection() {
        tableRows.forEach(row => {
            row.addEventListener('click', function() {
                // Remove selection from all rows
                tableRows.forEach(r => r.classList.remove('selected'));
                // Add to clicked row
                this.classList.add('selected');
            });
        });
    }

    // 4. Ordenação de tabela
    function addSorting() {
        tableHeaders.forEach((header, index) => {
            // Marcar cabeçalhos ordenáveis (todos exceto o de ações)
            if (index !== tableHeaders.length - 1) {
                header.classList.add('sortable');
                
                header.addEventListener('click', () => {
                    // Determinar ordem atual e alternar
                    const isAsc = header.classList.contains('sorted-asc');
                    const isDesc = header.classList.contains('sorted-desc');
                    
                    // Reset all headers
                    tableHeaders.forEach(h => {
                        h.classList.remove('sorted-asc', 'sorted-desc');
                    });
                    
                    // Set new sort direction
                    if (!isAsc && !isDesc) {
                        header.classList.add('sorted-asc');
                        sortTable(index, 'asc');
                    } else if (isAsc) {
                        header.classList.add('sorted-desc');
                        sortTable(index, 'desc');
                    } else {
                        sortTable(0, 'asc'); // Reset to default
                    }
                });
            }
        });
    }

    function sortTable(columnIndex, direction) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            // Verificar se é numérico (para preço)
            const isNumeric = !isNaN(parseFloat(aValue)) && isFinite(aValue);
            
            if (isNumeric) {
                return direction === 'asc' 
                    ? parseFloat(aValue) - parseFloat(bValue)
                    : parseFloat(bValue) - parseFloat(aValue);
            } else {
                return direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        });
        
        // Reordenar as linhas
        rows.forEach(row => tbody.appendChild(row));
        
        // Reaplicar cores alternadas
        alternateRowColors();
    }

    // 5. Filtro de busca
    function setupSearch() {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filterValue = filterDropdown.value.toLowerCase();
            
            tableRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                const status = row.querySelector('.status-badge')?.textContent.toLowerCase();
                
                const matchesSearch = rowText.includes(searchTerm);
                const matchesFilter = filterValue === 'all status' || status === filterValue;
                
                row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
            });
        });
    }

    // 6. Filtro por status
    function setupFilter() {
        filterDropdown.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase();
            const searchTerm = searchInput.value.toLowerCase();
            
            tableRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                const status = row.querySelector('.status-badge')?.textContent.toLowerCase();
                
                const matchesSearch = rowText.includes(searchTerm);
                const matchesFilter = filterValue === 'all status' || status === filterValue;
                
                row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
            });
        });
    }

    // Inicializar todas as funcionalidades
    function init() {
        alternateRowColors();
        addHoverEffects();
        addRowSelection();
        addSorting();
        setupSearch();
        setupFilter();
    }

    // Chamar inicialização
    init();
});