let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let schedules = JSON.parse(localStorage.getItem('schedules')) || [];

function saveData() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

function addTeacher() {
    const name = document.getElementById('teacherName').value.trim();
    if (!name) {
        alert("⚠️ Please enter a teacher's name.");
        return;
    }
    if (teachers.includes(name)) {
        alert("⚠️ This teacher already exists.");
        return;
    }
    teachers.push(name);
    saveData();
    populateTeachers();
    document.getElementById('teacherName').value = '';
}

function populateTeachers() {
    const select = document.getElementById('teacherSelect');
    select.innerHTML = '<option value="">-- Select a Teacher --</option>';
    teachers.forEach((teacher, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = teacher;
        select.appendChild(option);
    });
}

function addSchedule() {
    const teacherId = document.getElementById('teacherSelect').value;
    const subject = document.getElementById('subject').value.trim();
    const semester = document.getElementById('semester').value.trim();
    const day = document.getElementById('day').value.trim();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    // Validate form
    if (!teacherId || !subject || !semester || !day || !startTime || !endTime) {
        alert("⚠️ Please fill all fields properly.");
        return;
    }
    if (startTime >= endTime) {
        alert("⚠️ Start time must be before end time.");
        return;
    }

    // Check overlap: for all, AND specifically for same teacher
    const overlap = schedules.some(s =>
        s.day.toLowerCase() === day.toLowerCase() &&
        (
            (startTime >= s.startTime && startTime < s.endTime) ||
            (endTime > s.startTime && endTime <= s.endTime) ||
            (startTime <= s.startTime && endTime >= s.endTime)
        ) &&
        (s.teacherId == teacherId)
    );

    if (overlap) {
        alert("❌ Time Overlap! This teacher already has a class at that time.");
        return;
    }

    schedules.push({ teacherId, subject, semester, day, startTime, endTime });
    saveData();
    displaySchedules();

    // Clear inputs
    document.getElementById('teacherSelect').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('semester').value = '';
    document.getElementById('day').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
}

function displaySchedules() {
    const tbody = document.getElementById('scheduleTable').querySelector('tbody');
    tbody.innerHTML = '';

    schedules.forEach((s, index) => {
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

function deleteSchedule(index) {
    if (confirm("Are you sure you want to delete this schedule?")) {
        schedules.splice(index, 1);
        saveData();
        displaySchedules();
    }
}

function editSchedule(index) {
    const s = schedules[index];

    document.getElementById('teacherSelect').value = s.teacherId;
    document.getElementById('subject').value = s.subject;
    document.getElementById('semester').value = s.semester;
    document.getElementById('day').value = s.day;
    document.getElementById('startTime').value = s.startTime;
    document.getElementById('endTime').value = s.endTime;

    // Remove old entry
    schedules.splice(index, 1);
    saveData();
    displaySchedules();
}

// Initialize
populateTeachers();
displaySchedules();
