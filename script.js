// Tariff Tracker Application
class TariffTracker {
    constructor() {
        this.tariffs = JSON.parse(localStorage.getItem('tariffs')) || [];
        this.currentEditIndex = -1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderTariffTable();
        this.populateFilterOptions();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('tariffForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTariff();
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTariffs();
        });

        document.getElementById('filterCountry').addEventListener('change', () => {
            this.filterTariffs();
        });

        document.getElementById('filterIndustry').addEventListener('change', () => {
            this.filterTariffs();
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTariff();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('editModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('effectiveDate').value = today;
    }

    addTariff() {
        const formData = this.getFormData('tariffForm');
        
        if (!this.validateFormData(formData)) {
            return;
        }

        const tariff = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString()
        };

        this.tariffs.unshift(tariff);
        this.saveTariffs();
        this.updateStats();
        this.renderTariffTable();
        this.resetForm('tariffForm');
        this.showMessage('Tariff added successfully!', 'success');
    }

    updateTariff() {
        const formData = this.getFormData('editForm');
        
        if (!this.validateFormData(formData)) {
            return;
        }

        if (this.currentEditIndex >= 0) {
            this.tariffs[this.currentEditIndex] = {
                ...this.tariffs[this.currentEditIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };

            this.saveTariffs();
            this.updateStats();
            this.renderTariffTable();
            this.closeModal();
            this.showMessage('Tariff updated successfully!', 'success');
        }
    }

    deleteTariff(id) {
        if (confirm('Are you sure you want to delete this tariff?')) {
            this.tariffs = this.tariffs.filter(tariff => tariff.id !== id);
            this.saveTariffs();
            this.updateStats();
            this.renderTariffTable();
            this.showMessage('Tariff deleted successfully!', 'success');
        }
    }

    editTariff(id) {
        const tariff = this.tariffs.find(t => t.id === id);
        if (tariff) {
            this.currentEditIndex = this.tariffs.indexOf(tariff);
            this.populateEditForm(tariff);
            this.openModal();
        }
    }

    populateEditForm(tariff) {
        document.getElementById('editCountry').value = tariff.country;
        document.getElementById('editIndustry').value = tariff.industry;
        document.getElementById('editTariffRate').value = tariff.tariffRate;
        document.getElementById('editEffectiveDate').value = tariff.effectiveDate;
        document.getElementById('editDescription').value = tariff.description || '';
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    validateFormData(data) {
        if (!data.country || !data.industry || !data.tariffRate || !data.effectiveDate) {
            this.showMessage('Please fill in all required fields.', 'error');
            return false;
        }

        const rate = parseFloat(data.tariffRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            this.showMessage('Tariff rate must be between 0 and 100%.', 'error');
            return false;
        }

        return true;
    }

    resetForm(formId) {
        document.getElementById(formId).reset();
        this.setDefaultDate();
    }

    renderTariffTable() {
        const tbody = document.getElementById('tariffTableBody');
        const filteredTariffs = this.getFilteredTariffs();

        if (filteredTariffs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h3>No tariffs found</h3>
                            <p>Add your first tariff to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredTariffs.map(tariff => `
            <tr>
                <td>
                    <div class="country-info">
                        <strong>${this.getCountryName(tariff.country)}</strong>
                        <small>${tariff.country}</small>
                    </div>
                </td>
                <td>
                    <span class="industry-badge">${this.getIndustryName(tariff.industry)}</span>
                </td>
                <td>
                    <strong class="rate-display">${tariff.tariffRate}%</strong>
                </td>
                <td>${this.formatDate(tariff.effectiveDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="tariffTracker.editTariff(${tariff.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="tariffTracker.deleteTariff(${tariff.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getFilteredTariffs() {
        let filtered = [...this.tariffs];
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const countryFilter = document.getElementById('filterCountry').value;
        const industryFilter = document.getElementById('filterIndustry').value;

        if (searchTerm) {
            filtered = filtered.filter(tariff => 
                this.getCountryName(tariff.country).toLowerCase().includes(searchTerm) ||
                this.getIndustryName(tariff.industry).toLowerCase().includes(searchTerm) ||
                tariff.description?.toLowerCase().includes(searchTerm)
            );
        }

        if (countryFilter) {
            filtered = filtered.filter(tariff => tariff.country === countryFilter);
        }

        if (industryFilter) {
            filtered = filtered.filter(tariff => tariff.industry === industryFilter);
        }

        return filtered;
    }

    filterTariffs() {
        this.renderTariffTable();
    }

    populateFilterOptions() {
        const countries = [...new Set(this.tariffs.map(t => t.country))];
        const industries = [...new Set(this.tariffs.map(t => t.industry))];

        const countrySelect = document.getElementById('filterCountry');
        const industrySelect = document.getElementById('filterIndustry');

        // Clear existing options except the first one
        countrySelect.innerHTML = '<option value="">All Countries</option>';
        industrySelect.innerHTML = '<option value="">All Industries</option>';

        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = this.getCountryName(country);
            countrySelect.appendChild(option);
        });

        industries.forEach(industry => {
            const option = document.createElement('option');
            option.value = industry;
            option.textContent = this.getIndustryName(industry);
            industrySelect.appendChild(option);
        });
    }

    updateStats() {
        const totalTariffs = this.tariffs.length;
        const countries = new Set(this.tariffs.map(t => t.country)).size;
        const industries = new Set(this.tariffs.map(t => t.industry)).size;
        const lastUpdated = this.tariffs.length > 0 ? 'Today' : 'Never';

        document.getElementById('totalTariffs').textContent = totalTariffs;
        document.getElementById('totalCountries').textContent = countries;
        document.getElementById('totalIndustries').textContent = industries;
        document.getElementById('lastUpdated').textContent = lastUpdated;

        this.populateFilterOptions();
    }

    saveTariffs() {
        localStorage.setItem('tariffs', JSON.stringify(this.tariffs));
    }

    getCountryName(code) {
        const countries = {
            'US': 'United States',
            'CN': 'China',
            'EU': 'European Union',
            'CA': 'Canada',
            'MX': 'Mexico',
            'JP': 'Japan',
            'KR': 'South Korea',
            'IN': 'India',
            'BR': 'Brazil',
            'AU': 'Australia'
        };
        return countries[code] || code;
    }

    getIndustryName(code) {
        const industries = {
            'steel': 'Steel & Aluminum',
            'automotive': 'Automotive',
            'electronics': 'Electronics',
            'agriculture': 'Agriculture',
            'textiles': 'Textiles',
            'chemicals': 'Chemicals',
            'pharmaceuticals': 'Pharmaceuticals',
            'energy': 'Energy'
        };
        return industries[code] || code;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of the main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(messageDiv, mainContent.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    openModal() {
        document.getElementById('editModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditIndex = -1;
    }
}

// Initialize the application
const tariffTracker = new TariffTracker();

// Global function for modal close (used in HTML)
function closeModal() {
    tariffTracker.closeModal();
}

// Add some sample data for demonstration
if (tariffTracker.tariffs.length === 0) {
    const sampleData = [
        {
            id: 1,
            country: 'US',
            industry: 'steel',
            tariffRate: '25',
            effectiveDate: '2024-01-15',
            description: 'Section 232 tariffs on steel imports',
            createdAt: '2024-01-15T10:00:00.000Z'
        },
        {
            id: 2,
            country: 'CN',
            industry: 'electronics',
            tariffRate: '15',
            effectiveDate: '2024-02-01',
            description: 'Retaliatory tariffs on electronic goods',
            createdAt: '2024-02-01T14:30:00.000Z'
        },
        {
            id: 3,
            country: 'EU',
            industry: 'automotive',
            tariffRate: '10',
            effectiveDate: '2024-01-20',
            description: 'Automotive import tariffs',
            createdAt: '2024-01-20T09:15:00.000Z'
        },
        {
            id: 4,
            country: 'CA',
            industry: 'agriculture',
            tariffRate: '5',
            effectiveDate: '2024-02-10',
            description: 'Agricultural product tariffs',
            createdAt: '2024-02-10T16:45:00.000Z'
        },
        {
            id: 5,
            country: 'MX',
            industry: 'textiles',
            tariffRate: '8',
            effectiveDate: '2024-01-25',
            description: 'Textile import duties',
            createdAt: '2024-01-25T11:20:00.000Z'
        }
    ];

    tariffTracker.tariffs = sampleData;
    tariffTracker.saveTariffs();
    tariffTracker.updateStats();
    tariffTracker.renderTariffTable();
} 