// Array to store teachers and schedules
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let schedules = JSON.parse(localStorage.getItem('schedules')) || [];

// Save teachers and schedules to localStorage
function saveData() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

// Add teacher to the list
function addTeacher() {
    const name = document.getElementById('teacherName').value.trim();  // Get input value
    if (!name) {
        alert("⚠️ Please enter a teacher's name.");
        return;  // Stop the function if name is empty
    }

    if (teachers.includes(name)) {
        alert("⚠️ This teacher already exists.");
        return;
    }

    teachers.push(name);  // Add teacher to the array
    saveData();           // Save the updated list of teachers to localStorage
    populateTeachers();   // Update the teacher dropdown
    document.getElementById('teacherName').value = '';  // Clear input field
}

// Populate the teacher dropdown
function populateTeachers() {
    const select = document.getElementById('teacherSelect');
    select.innerHTML = '<option value="">-- Select a Teacher --</option>';  // Clear existing options
    teachers.forEach((teacher, index) => {
        const option = document.createElement('option');
        option.value = index;  // Store teacher index
        option.textContent = teacher;
        select.appendChild(option);
    });
}

// Add schedule to the list
function addSchedule() {
    const teacherId = document.getElementById('teacherSelect').value;
    const subject = document.getElementById('subject').value.trim();
    const semester = document.getElementById('semester').value;
    const day = document.getElementById('day').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (!teacherId || !subject || !semester || !day || !startTime || !endTime) {
        alert("⚠️ Please fill all fields properly.");
        return;
    }

    if (startTime >= endTime) {
        alert("⚠️ Start time must be before end time.");
        return;
    }

    // Check overlap
    const overlap = schedules.some(s =>
        s.day.toLowerCase() === day.toLowerCase() &&
        s.teacherId == teacherId &&
        (
            (startTime >= s.startTime && startTime < s.endTime) ||
            (endTime > s.startTime && endTime <= s.endTime) ||
            (startTime <= s.startTime && endTime >= s.endTime)
        )
    );

    if (overlap) {
        alert("❌ Time Overlap! This teacher already has a class at that time.");
        return;
    }

    schedules.push({ teacherId, subject, semester, day, startTime, endTime });
    saveData();
    displaySchedules();
    updateCalendarView();

    // Clear input fields
    document.getElementById('teacherSelect').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('semester').value = '';
    document.getElementById('day').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
}

// Display schedules in the table
function displaySchedules(filteredSchedules = schedules) {
    const tbody = document.getElementById('scheduleTable').querySelector('tbody');
    tbody.innerHTML = '';

    filteredSchedules.forEach((s, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teachers[s.teacherId]}</td>
            <td>${s.subject}</td>
            <td>${s.semester}</td>
            <td>${s.day}</td>
            <td>${s.startTime}</td>
            <td>${s.endTime}</td>
            <td>
                <button style="background:#ffa500;" onclick="editSchedule(${index})">✏️ Edit</button>
                <button style="background:#e60000;" onclick="deleteSchedule(${index})">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete a schedule
function deleteSchedule(index) {
    if (confirm("Are you sure you want to delete this schedule?")) {
        schedules.splice(index, 1);
        saveData();
        displaySchedules();
        updateCalendarView();
    }
}

// Edit an existing schedule
function editSchedule(index) {
    const s = schedules[index];

    document.getElementById('teacherSelect').value = s.teacherId;
    document.getElementById('subject').value = s.subject;
    document.getElementById('semester').value = s.semester;
    document.getElementById('day').value = s.day;
    document.getElementById('startTime').value = s.startTime;
    document.getElementById('endTime').value = s.endTime;

    schedules.splice(index, 1);
    saveData();
    displaySchedules();
    updateCalendarView();
}

// Filter schedules by teacher name
function filterSchedules() {
    const query = document.getElementById('searchTeacher').value.toLowerCase();
    const filtered = schedules.filter(s => 
        teachers[s.teacherId].toLowerCase().includes(query)
    );
    displaySchedules(filtered);
}

// Sort schedules by day
function sortSchedulesByDay() {
    schedules.sort((a, b) => a.day.localeCompare(b.day));
    saveData();
    displaySchedules();
    updateCalendarView();
}

// Sort schedules by start time
function sortSchedulesByTime() {
    schedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
    saveData();
    displaySchedules();
    updateCalendarView();
}

// Export schedule to Excel
function exportToExcel() {
    const table = document.getElementById('scheduleTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Schedule" });
    XLSX.writeFile(wb, "Teacher_Schedule.xlsx");
}

// Export schedule to PDF
function exportToPDF() {
    const table = document.getElementById('scheduleTable');
    const newWindow = window.open('', '', 'width=800,height=600');
    newWindow.document.write('<html><head><title>Schedule PDF</title>');
    newWindow.document.write('<style>table,th,td{border:1px solid black;border-collapse:collapse;padding:10px;text-align:center;} th{background:#007bff;color:white;}</style>');
    newWindow.document.write('</head><body>');
    newWindow.document.write('<h1>Teacher Schedule</h1>');
    newWindow.document.write(table.outerHTML);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
}

// Update the weekly calendar view
function updateCalendarView() {
    const calendar = document.getElementById('calendarView');
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    calendar.innerHTML = '';

    days.forEach(day => {
        const col = document.createElement('div');
        const heading = document.createElement('h4');
        heading.textContent = day;
