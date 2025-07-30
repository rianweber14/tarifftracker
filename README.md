# Tariff Tracker

A modern, responsive web application for tracking and analyzing tariff data across different countries and industries.

## Features

- **Dashboard Overview**: Real-time statistics showing total tariffs, countries, industries, and last update
- **Add New Tariffs**: Easy-to-use form to add tariff entries with country, industry, rate, and effective date
- **Search & Filter**: Advanced filtering by country, industry, and text search
- **Edit & Delete**: Full CRUD operations for managing tariff data
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Local Storage**: Data persists in browser localStorage
- **Modern UI**: Clean, professional interface with smooth animations

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Flexbox and Grid layouts
- **JavaScript (ES6+)**: Vanilla JavaScript with modern features
- **Font Awesome**: Icons for enhanced UI
- **Google Fonts**: Inter font family for typography

## Getting Started

### Prerequisites

No special requirements! This is a pure HTML/CSS/JavaScript application that runs in any modern web browser.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rianweber14/tarifftracker.git
   cd tarifftracker
   ```

2. Open `index.html` in your web browser

That's it! The application will load with sample data and be ready to use.

## Usage

### Adding Tariffs

1. Fill out the "Add New Tariff" form on the left side
2. Select a country from the dropdown
3. Choose an industry category
4. Enter the tariff rate (0-100%)
5. Set the effective date
6. Add an optional description
7. Click "Add Tariff"

### Managing Tariffs

- **Search**: Use the search box to find specific tariffs
- **Filter**: Use the country and industry dropdowns to filter results
- **Edit**: Click the edit button (pencil icon) to modify a tariff
- **Delete**: Click the delete button (trash icon) to remove a tariff

### Dashboard

The dashboard shows:
- Total number of tariffs tracked
- Number of countries with tariffs
- Number of industries affected
- Last update timestamp

## Data Structure

Each tariff entry contains:
- **ID**: Unique identifier
- **Country**: Country code (US, CN, EU, etc.)
- **Industry**: Industry category (steel, automotive, electronics, etc.)
- **Tariff Rate**: Percentage rate (0-100%)
- **Effective Date**: When the tariff takes effect
- **Description**: Optional notes about the tariff
- **Created At**: Timestamp when entry was added
- **Updated At**: Timestamp when entry was last modified

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Local Storage

The application uses browser localStorage to persist data. This means:
- Data is saved locally in your browser
- Data persists between browser sessions
- No server or database required
- Data is private to your browser

## Sample Data

The application comes with sample tariff data to demonstrate functionality:
- US Steel tariffs (25%)
- China Electronics tariffs (15%)
- EU Automotive tariffs (10%)
- Canada Agriculture tariffs (5%)
- Mexico Textiles tariffs (8%)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Enhancements

- Export data to CSV/Excel
- Import data from external sources
- Advanced analytics and charts
- Multi-user support with backend
- Real-time tariff updates from APIs
- Mobile app version

## Support

If you have any questions or issues, please open an issue on the GitHub repository.

---

Built with ❤️ for efficient tariff tracking and analysis. 