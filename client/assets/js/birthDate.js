// Birth Date Functionality for Register Page

document.addEventListener('DOMContentLoaded', function() {
    initializeBirthDate();
});

function initializeBirthDate() {
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');

    if (!daySelect || !monthSelect || !yearSelect) {
        return; // Not on register page
    }

    // Populate years (from 1924 to current year - 18)
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 100; // 100 years back
    const maxYear = currentYear - 18; // Must be at least 18 years old

    for (let year = maxYear; year >= minYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Initially populate days with 1-31 (will be updated when month is selected)
    function populateDays(maxDays = 31) {
        // Clear existing day options except the first one
        daySelect.innerHTML = '<option value="">Gün</option>';
        
        for (let day = 1; day <= maxDays; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        }
    }

    // Update days when month or year changes
    function updateDays() {
        const selectedMonth = parseInt(monthSelect.value);
        const selectedYear = parseInt(yearSelect.value);
        const currentSelectedDay = parseInt(daySelect.value); // Save currently selected day
        
        if (!selectedMonth) {
            // If no month selected, show default 31 days
            populateDays(31);
            return;
        }
        
        // Get number of days in the selected month
        let daysInMonth;
        if (selectedYear) {
            // If year is selected, calculate exact days (for leap year)
            daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        } else {
            // If no year selected, use default days for each month
            const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            daysInMonth = daysPerMonth[selectedMonth - 1];
        }
        
        populateDays(daysInMonth);
        
        // Restore the previously selected day if it's valid for the new month
        if (currentSelectedDay && currentSelectedDay <= daysInMonth) {
            daySelect.value = currentSelectedDay;
        } else if (currentSelectedDay && currentSelectedDay > daysInMonth) {
            // If selected day is greater than days in new month, select the last day
            daySelect.value = daysInMonth;
        }
    }

    // Add event listeners
    monthSelect.addEventListener('change', updateDays);
    yearSelect.addEventListener('change', updateDays);

    // Initial population of days (show 1-31 by default)
    populateDays(31);
}

// Function to validate birth date
function validateBirthDate() {
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');

    if (!daySelect || !monthSelect || !yearSelect) {
        return true; // Not on register page
    }

    const day = daySelect.value;
    const month = monthSelect.value;
    const year = yearSelect.value;

    if (!day || !month || !year) {
        return false;
    }

    // Check if user is at least 18 years old
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 18;
}

// Export for use in main registration validation
window.validateBirthDate = validateBirthDate;