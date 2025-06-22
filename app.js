// Study Productivity Dashboard App
class StudyDashboard {
    constructor() {
        this.currentModule = 'pomodoro';
        this.theme = localStorage.getItem('theme') || 'light';
        this.initializeApp();
    }

    initializeApp() {
        this.initializeTheme();
        this.initializeNavigation();
        this.initializePomodoro();
        this.initializeTasks();
        this.initializeFocus();
        this.initializePlanner();
        this.initializeNotes();
        this.initializeMusic();
        this.initializeFlashcards();
        this.initializeJournal();
        this.loadSampleData();
    }

    // Theme Management
    initializeTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.theme);
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        
        themeToggle.addEventListener('click', () => {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-color-scheme', this.theme);
            localStorage.setItem('theme', this.theme);
            themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        });
    }

    // Navigation
    initializeNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const modules = document.querySelectorAll('.module');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const dashboardNav = document.getElementById('dashboardNav');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetModule = tab.dataset.tab;
                this.switchModule(targetModule);
                dashboardNav.classList.remove('open');
            });
        });

        mobileMenuToggle.addEventListener('click', () => {
            dashboardNav.classList.toggle('open');
        });
    }

    switchModule(moduleId) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${moduleId}"]`).classList.add('active');

        // Update modules
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });
        document.getElementById(`${moduleId}-module`).classList.add('active');

        this.currentModule = moduleId;
    }

    // Pomodoro Timer
    initializePomodoro() {
        this.pomodoroState = {
            isRunning: false,
            isWorkSession: true,
            timeLeft: 25 * 60, // 25 minutes in seconds
            workDuration: 25,
            breakDuration: 5,
            sessionsCompleted: 0
        };

        this.pomodoroInterval = null;
        this.setupPomodoroControls();
        this.updatePomodoroDisplay();
    }

    setupPomodoroControls() {
        const startPauseBtn = document.getElementById('startPauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const workDurationInput = document.getElementById('workDuration');
        const breakDurationInput = document.getElementById('breakDuration');

        startPauseBtn.addEventListener('click', () => {
            if (this.pomodoroState.isRunning) {
                this.pausePomodoro();
            } else {
                this.startPomodoro();
            }
        });

        resetBtn.addEventListener('click', () => {
            this.resetPomodoro();
        });

        workDurationInput.addEventListener('change', (e) => {
            this.pomodoroState.workDuration = parseInt(e.target.value);
            if (!this.pomodoroState.isRunning && this.pomodoroState.isWorkSession) {
                this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
                this.updatePomodoroDisplay();
            }
        });

        breakDurationInput.addEventListener('change', (e) => {
            this.pomodoroState.breakDuration = parseInt(e.target.value);
            if (!this.pomodoroState.isRunning && !this.pomodoroState.isWorkSession) {
                this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
                this.updatePomodoroDisplay();
            }
        });
    }

    startPomodoro() {
        this.pomodoroState.isRunning = true;
        document.getElementById('startPauseBtn').textContent = 'Pause';
        
        this.pomodoroInterval = setInterval(() => {
            this.pomodoroState.timeLeft--;
            this.updatePomodoroDisplay();
            
            if (this.pomodoroState.timeLeft <= 0) {
                this.pomodoroComplete();
            }
        }, 1000);
    }

    pausePomodoro() {
        this.pomodoroState.isRunning = false;
        document.getElementById('startPauseBtn').textContent = 'Start';
        clearInterval(this.pomodoroInterval);
    }

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoroState.isWorkSession = true;
        this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
        this.updatePomodoroDisplay();
    }

    pomodoroComplete() {
        this.pausePomodoro();
        
        // Play notification sound
        this.playNotificationSound();
        
        if (this.pomodoroState.isWorkSession) {
            this.pomodoroState.sessionsCompleted++;
            this.pomodoroState.isWorkSession = false;
            this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
            alert('Work session complete! Time for a break.');
        } else {
            this.pomodoroState.isWorkSession = true;
            this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
            alert('Break complete! Ready for another work session?');
        }
        
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroState.timeLeft / 60);
        const seconds = this.pomodoroState.timeLeft % 60;
        const timeDisplay = document.getElementById('timeDisplay');
        const sessionType = document.getElementById('sessionType');
        const sessionCount = document.getElementById('sessionCount');
        const progressRing = document.querySelector('.progress-ring__progress');

        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        sessionType.textContent = this.pomodoroState.isWorkSession ? 'Work Session' : 'Break Time';
        sessionCount.textContent = this.pomodoroState.sessionsCompleted;

        // Update progress ring
        const totalTime = this.pomodoroState.isWorkSession ? 
            this.pomodoroState.workDuration * 60 : 
            this.pomodoroState.breakDuration * 60;
        const progress = ((totalTime - this.pomodoroState.timeLeft) / totalTime) * 577;
        progressRing.style.strokeDasharray = `${progress} 577`;
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }

    // Task Organizer
    initializeTasks() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 1;
        
        this.setupTaskControls();
        this.renderTasks();
    }

    setupTaskControls() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskModal = document.getElementById('taskModal');
        const closeTaskModal = document.getElementById('closeTaskModal');
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const taskFilter = document.getElementById('taskFilter');
        const subjectFilter = document.getElementById('subjectFilter');

        addTaskBtn.addEventListener('click', () => {
            taskModal.classList.add('active');
        });

        closeTaskModal.addEventListener('click', () => {
            taskModal.classList.remove('active');
            this.clearTaskForm();
        });

        cancelTaskBtn.addEventListener('click', () => {
            taskModal.classList.remove('active');
            this.clearTaskForm();
        });

        saveTaskBtn.addEventListener('click', () => {
            this.saveTask();
        });

        taskFilter.addEventListener('change', () => {
            this.renderTasks();
        });

        subjectFilter.addEventListener('change', () => {
            this.renderTasks();
        });
    }

    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const subject = document.getElementById('taskSubject').value;
        const priority = document.getElementById('taskPriority').value;

        if (!title) {
            alert('Please enter a task title');
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            title,
            subject,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasksToStorage();
        this.renderTasks();
        
        document.getElementById('taskModal').classList.remove('active');
        this.clearTaskForm();
    }

    clearTaskForm() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskSubject').value = 'Math';
        document.getElementById('taskPriority').value = 'medium';
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const taskFilter = document.getElementById('taskFilter').value;
        const subjectFilter = document.getElementById('subjectFilter').value;

        let filteredTasks = this.tasks;

        if (taskFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => 
                taskFilter === 'completed' ? task.completed : !task.completed
            );
        }

        if (subjectFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.subject === subjectFilter);
        }

        taskList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
    }

    createTaskElement(task) {
        const subjectColors = {
            'Math': '#FF6B6B',
            'Science': '#4ECDC4',
            'English': '#45B7D1',
            'History': '#96CEB4',
            'Art': '#FFEAA7',
            'Other': '#DDA0DD'
        };

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="dashboard.toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-subject" style="background-color: ${subjectColors[task.subject]}">${task.subject}</span>
                        <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn--sm btn--secondary" onclick="dashboard.editTask(${task.id})">Edit</button>
                    <button class="btn btn--sm btn--secondary" onclick="dashboard.deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `;
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasksToStorage();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasksToStorage();
            this.renderTasks();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskSubject').value = task.subject;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskModal').classList.add('active');
            
            // Replace save button functionality for editing
            const saveBtn = document.getElementById('saveTaskBtn');
            saveBtn.onclick = () => {
                task.title = document.getElementById('taskTitle').value.trim();
                task.subject = document.getElementById('taskSubject').value;
                task.priority = document.getElementById('taskPriority').value;
                
                this.saveTasksToStorage();
                this.renderTasks();
                document.getElementById('taskModal').classList.remove('active');
                this.clearTaskForm();
                
                // Restore original save functionality
                saveBtn.onclick = () => this.saveTask();
            };
        }
    }

    saveTasksToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
    }

    // Focus Session Tracker
    initializeFocus() {
        this.focusState = {
            isRunning: false,
            startTime: null,
            currentSession: 0,
            sessions: JSON.parse(localStorage.getItem('focusSessions')) || []
        };

        this.focusInterval = null;
        this.setupFocusControls();
        this.updateFocusDisplay();
    }

    setupFocusControls() {
        const focusStartStop = document.getElementById('focusStartStop');
        
        focusStartStop.addEventListener('click', () => {
            if (this.focusState.isRunning) {
                this.stopFocusSession();
            } else {
                this.startFocusSession();
            }
        });
    }

    startFocusSession() {
        this.focusState.isRunning = true;
        this.focusState.startTime = Date.now();
        this.focusState.currentSession = 0;
        
        document.getElementById('focusStartStop').textContent = 'Stop Focus';
        
        this.focusInterval = setInterval(() => {
            this.focusState.currentSession = Date.now() - this.focusState.startTime;
            this.updateFocusDisplay();
        }, 1000);
    }

    stopFocusSession() {
        if (!this.focusState.isRunning) return;
        
        this.focusState.isRunning = false;
        clearInterval(this.focusInterval);
        
        const sessionDuration = Date.now() - this.focusState.startTime;
        const session = {
            date: new Date().toISOString(),
            duration: sessionDuration,
            subject: 'General Study' // Could be enhanced to select subject
        };
        
        this.focusState.sessions.push(session);
        localStorage.setItem('focusSessions', JSON.stringify(this.focusState.sessions));
        
        document.getElementById('focusStartStop').textContent = 'Start Focus';
        this.focusState.currentSession = 0;
        this.updateFocusDisplay();
        this.renderSessionHistory();
    }

    updateFocusDisplay() {
        const focusTime = document.getElementById('focusTime');
        const todayTotal = document.getElementById('todayTotal');
        const weekTotal = document.getElementById('weekTotal');
        
        // Current session time
        const seconds = Math.floor(this.focusState.currentSession / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        focusTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Today's total
        const today = new Date().toDateString();
        const todaySessions = this.focusState.sessions.filter(session => 
            new Date(session.date).toDateString() === today
        );
        const todayMs = todaySessions.reduce((total, session) => total + session.duration, 0);
        const todayHours = Math.floor(todayMs / (1000 * 60 * 60));
        const todayMinutes = Math.floor((todayMs % (1000 * 60 * 60)) / (1000 * 60));
        todayTotal.textContent = `${todayHours}h ${todayMinutes}m`;
        
        // Week's total
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekSessions = this.focusState.sessions.filter(session => 
            new Date(session.date) >= weekAgo
        );
        const weekMs = weekSessions.reduce((total, session) => total + session.duration, 0);
        const weekHours = Math.floor(weekMs / (1000 * 60 * 60));
        const weekMinutes = Math.floor((weekMs % (1000 * 60 * 60)) / (1000 * 60));
        weekTotal.textContent = `${weekHours}h ${weekMinutes}m`;
        
        this.renderSessionHistory();
    }

    renderSessionHistory() {
        const sessionLog = document.getElementById('sessionLog');
        const recentSessions = this.focusState.sessions.slice(-10).reverse();
        
        sessionLog.innerHTML = recentSessions.map(session => {
            const date = new Date(session.date);
            const duration = Math.floor(session.duration / (1000 * 60)); // minutes
            return `
                <div class="session-entry">
                    <div class="session-info">
                        <div class="session-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
                        <div class="session-duration">${duration} minutes</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Weekly Study Planner
    initializePlanner() {
        this.schedule = JSON.parse(localStorage.getItem('schedule')) || {};
        this.setupPlannerGrid();
        this.setupPlannerControls();
    }

    setupPlannerGrid() {
        const scheduleGrid = document.getElementById('scheduleGrid');
        const hours = [];
        for (let i = 8; i <= 22; i++) {
            hours.push(`${i}:00`);
        }
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Add time slots
        hours.forEach(hour => {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-header';
            timeLabel.textContent = hour;
            scheduleGrid.appendChild(timeLabel);
            
            days.forEach((day, dayIndex) => {
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.dataset.day = dayIndex;
                slot.dataset.hour = hour;
                
                const scheduleKey = `${dayIndex}-${hour}`;
                if (this.schedule[scheduleKey]) {
                    slot.classList.add('has-task');
                    slot.innerHTML = `<div class="slot-task">${this.schedule[scheduleKey].title}</div>`;
                }
                
                slot.addEventListener('click', () => this.editTimeSlot(dayIndex, hour));
                scheduleGrid.appendChild(slot);
            });
        });
    }

    setupPlannerControls() {
        const clearSchedule = document.getElementById('clearSchedule');
        clearSchedule.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the entire schedule?')) {
                this.schedule = {};
                localStorage.setItem('schedule', JSON.stringify(this.schedule));
                this.refreshPlannerGrid();
            }
        });
    }

    editTimeSlot(day, hour) {
        const scheduleKey = `${day}-${hour}`;
        const currentTask = this.schedule[scheduleKey];
        
        const taskTitle = prompt('Enter task for this time slot:', currentTask ? currentTask.title : '');
        
        if (taskTitle === null) return; // User cancelled
        
        if (taskTitle.trim() === '') {
            // Remove task if empty
            delete this.schedule[scheduleKey];
        } else {
            // Add or update task
            this.schedule[scheduleKey] = {
                title: taskTitle.trim(),
                subject: 'Other' // Could be enhanced to select subject
            };
        }
        
        localStorage.setItem('schedule', JSON.stringify(this.schedule));
        this.refreshPlannerGrid();
    }

    refreshPlannerGrid() {
        const scheduleGrid = document.getElementById('scheduleGrid');
        scheduleGrid.innerHTML = `
            <div class="time-header">Time</div>
            <div class="day-header">Mon</div>
            <div class="day-header">Tue</div>
            <div class="day-header">Wed</div>
            <div class="day-header">Thu</div>
            <div class="day-header">Fri</div>
            <div class="day-header">Sat</div>
            <div class="day-header">Sun</div>
        `;
        this.setupPlannerGrid();
    }

    // Notes Interface
    initializeNotes() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.noteIdCounter = parseInt(localStorage.getItem('noteIdCounter')) || 1;
        this.currentNote = null;
        
        this.setupNotesControls();
        this.renderNotesList();
    }

    setupNotesControls() {
        const addNoteBtn = document.getElementById('addNoteBtn');
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');
        const noteSearch = document.getElementById('noteSearch');
        
        addNoteBtn.addEventListener('click', () => this.createNewNote());
        saveNoteBtn.addEventListener('click', () => this.saveCurrentNote());
        deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());
        noteSearch.addEventListener('input', () => this.searchNotes());
        
        // Auto-save functionality
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        
        noteTitle.addEventListener('input', () => this.autoSave());
        noteContent.addEventListener('input', () => this.autoSave());
    }

    createNewNote() {
        const note = {
            id: this.noteIdCounter++,
            title: 'New Note',
            content: '',
            subject: 'Other',
            date: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        this.notes.unshift(note);
        this.currentNote = note;
        this.renderNotesList();
        this.loadNoteInEditor(note);
        this.saveNotesToStorage();
    }

    loadNoteInEditor(note) {
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteSubject').value = note.subject;
        this.currentNote = note;
    }

    saveCurrentNote() {
        if (!this.currentNote) return;
        
        this.currentNote.title = document.getElementById('noteTitle').value || 'Untitled';
        this.currentNote.content = document.getElementById('noteContent').value;
        this.currentNote.subject = document.getElementById('noteSubject').value;
        this.currentNote.lastModified = new Date().toISOString();
        
        this.saveNotesToStorage();
        this.renderNotesList();
    }

    deleteCurrentNote() {
        if (!this.currentNote) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== this.currentNote.id);
            this.saveNotesToStorage();
            this.renderNotesList();
            
            // Clear editor
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            this.currentNote = null;
        }
    }

    autoSave() {
        if (this.currentNote) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                this.saveCurrentNote();
            }, 2000);
        }
    }

    searchNotes() {
        const query = document.getElementById('noteSearch').value.toLowerCase();
        const noteItems = document.querySelectorAll('.note-item');
        
        noteItems.forEach(item => {
            const title = item.querySelector('.note-item-title').textContent.toLowerCase();
            if (title.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    renderNotesList() {
        const notesList = document.getElementById('notesList');
        
        notesList.innerHTML = this.notes.map(note => {
            const date = new Date(note.lastModified).toLocaleDateString();
            return `
                <div class="note-item ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}" 
                     onclick="dashboard.selectNote(${note.id})">
                    <div class="note-item-title">${note.title}</div>
                    <div class="note-item-meta">${note.subject} • ${date}</div>
                </div>
            `;
        }).join('');
    }

    selectNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.loadNoteInEditor(note);
            this.renderNotesList();
        }
    }

    saveNotesToStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
        localStorage.setItem('noteIdCounter', this.noteIdCounter.toString());
    }

    // Music Player
    initializeMusic() {
        this.musicState = {
            currentTrack: null,
            isPlaying: false,
            volume: 50,
            tracks: [
                { name: 'Forest Sounds', duration: '10:00' },
                { name: 'Rain & Thunder', duration: '8:30' },
                { name: 'Lo-fi Study Beats', duration: '12:15' },
                { name: 'Ocean Waves', duration: '15:00' }
            ]
        };
        
        this.setupMusicControls();
        this.renderTrackList();
    }

    setupMusicControls() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        
        playPauseBtn.addEventListener('click', () => this.togglePlayback());
        stopBtn.addEventListener('click', () => this.stopPlayback());
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    }

    renderTrackList() {
        const trackList = document.getElementById('trackList');
        
        trackList.innerHTML = this.musicState.tracks.map((track, index) => `
            <div class="track-item ${this.musicState.currentTrack === index ? 'active' : ''}" 
                 onclick="dashboard.selectTrack(${index})">
                <span class="track-name">${track.name}</span>
                <span class="track-length">${track.duration}</span>
            </div>
        `).join('');
    }

    selectTrack(trackIndex) {
        this.musicState.currentTrack = trackIndex;
        const track = this.musicState.tracks[trackIndex];
        
        document.getElementById('currentTrack').textContent = track.name;
        document.getElementById('trackDuration').textContent = track.duration;
        
        this.renderTrackList();
    }

    togglePlayback() {
        if (!this.musicState.currentTrack && this.musicState.currentTrack !== 0) {
            alert('Please select a track first');
            return;
        }
        
        const playPauseBtn = document.getElementById('playPauseBtn');
        
        if (this.musicState.isPlaying) {
            this.musicState.isPlaying = false;
            playPauseBtn.textContent = 'Play';
        } else {
            this.musicState.isPlaying = true;
            playPauseBtn.textContent = 'Pause';
        }
    }

    stopPlayback() {
        this.musicState.isPlaying = false;
        document.getElementById('playPauseBtn').textContent = 'Play';
    }

    setVolume(volume) {
        this.musicState.volume = volume;
        // In a real implementation, this would control actual audio volume
    }

    // Flashcards
    initializeFlashcards() {
        this.flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
        this.flashcardIdCounter = parseInt(localStorage.getItem('flashcardIdCounter')) || 1;
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        
        this.setupFlashcardControls();
        this.renderFlashcards();
    }

    setupFlashcardControls() {
        const addFlashcardBtn = document.getElementById('addFlashcardBtn');
        const flashcardModal = document.getElementById('flashcardModal');
        const closeFlashcardModal = document.getElementById('closeFlashcardModal');
        const cancelFlashcardBtn = document.getElementById('cancelFlashcardBtn');
        const saveFlashcardBtn = document.getElementById('saveFlashcardBtn');
        const flipCardBtn = document.getElementById('flipCardBtn');
        const prevCardBtn = document.getElementById('prevCardBtn');
        const nextCardBtn = document.getElementById('nextCardBtn');
        const shuffleBtn = document.getElementById('shuffleBtn');
        const flashcard = document.getElementById('flashcard');
        
        addFlashcardBtn.addEventListener('click', () => {
            flashcardModal.classList.add('active');
        });
        
        closeFlashcardModal.addEventListener('click', () => {
            flashcardModal.classList.remove('active');
            this.clearFlashcardForm();
        });
        
        cancelFlashcardBtn.addEventListener('click', () => {
            flashcardModal.classList.remove('active');
            this.clearFlashcardForm();
        });
        
        saveFlashcardBtn.addEventListener('click', () => {
            this.saveFlashcard();
        });
        
        flipCardBtn.addEventListener('click', () => this.flipCard());
        flashcard.addEventListener('click', () => this.flipCard());
        
        prevCardBtn.addEventListener('click', () => this.previousCard());
        nextCardBtn.addEventListener('click', () => this.nextCard());
        shuffleBtn.addEventListener('click', () => this.shuffleCards());
    }

    saveFlashcard() {
        const setName = document.getElementById('cardSetName').value.trim();
        const frontText = document.getElementById('cardFrontText').value.trim();
        const backText = document.getElementById('cardBackText').value.trim();
        const subject = document.getElementById('cardSubject').value;
        
        if (!setName || !frontText || !backText) {
            alert('Please fill in all fields');
            return;
        }
        
        const flashcard = {
            id: this.flashcardIdCounter++,
            set: setName,
            front: frontText,
            back: backText,
            subject: subject,
            correct: 0,
            wrong: 0
        };
        
        this.flashcards.push(flashcard);
        this.saveFlashcardsToStorage();
        this.renderFlashcards();
        
        document.getElementById('flashcardModal').classList.remove('active');
        this.clearFlashcardForm();
    }

    clearFlashcardForm() {
        document.getElementById('cardSetName').value = '';
        document.getElementById('cardFrontText').value = '';
        document.getElementById('cardBackText').value = '';
        document.getElementById('cardSubject').value = 'Math';
    }

    renderFlashcards() {
        if (this.flashcards.length === 0) {
            document.getElementById('cardFront').innerHTML = '<div class="card-content">Click "Add Card" to create your first flashcard</div>';
            document.getElementById('cardBack').innerHTML = '<div class="card-content"></div>';
            document.getElementById('currentCardNum').textContent = '0';
            document.getElementById('totalCards').textContent = '0';
            return;
        }
        
        const currentCard = this.flashcards[this.currentCardIndex];
        document.getElementById('cardFront').innerHTML = `<div class="card-content">${currentCard.front}</div>`;
        document.getElementById('cardBack').innerHTML = `<div class="card-content">${currentCard.back}</div>`;
        document.getElementById('currentCardNum').textContent = this.currentCardIndex + 1;
        document.getElementById('totalCards').textContent = this.flashcards.length;
        
        // Update card set dropdown
        const sets = [...new Set(this.flashcards.map(card => card.set))];
        const flashcardSet = document.getElementById('flashcardSet');
        flashcardSet.innerHTML = '<option value="all">All Cards</option>' + 
            sets.map(set => `<option value="${set}">${set}</option>`).join('');
    }

    flipCard() {
        const flashcard = document.getElementById('flashcard');
        this.isCardFlipped = !this.isCardFlipped;
        flashcard.classList.toggle('flipped', this.isCardFlipped);
    }

    previousCard() {
        if (this.flashcards.length === 0) return;
        this.currentCardIndex = (this.currentCardIndex - 1 + this.flashcards.length) % this.flashcards.length;
        this.isCardFlipped = false;
        document.getElementById('flashcard').classList.remove('flipped');
        this.renderFlashcards();
    }

    nextCard() {
        if (this.flashcards.length === 0) return;
        this.currentCardIndex = (this.currentCardIndex + 1) % this.flashcards.length;
        this.isCardFlipped = false;
        document.getElementById('flashcard').classList.remove('flipped');
        this.renderFlashcards();
    }

    shuffleCards() {
        for (let i = this.flashcards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.flashcards[i], this.flashcards[j]] = [this.flashcards[j], this.flashcards[i]];
        }
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        document.getElementById('flashcard').classList.remove('flipped');
        this.renderFlashcards();
    }

    saveFlashcardsToStorage() {
        localStorage.setItem('flashcards', JSON.stringify(this.flashcards));
        localStorage.setItem('flashcardIdCounter', this.flashcardIdCounter.toString());
    }

    // Journal & Mood Tracker
    initializeJournal() {
        this.journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        this.setupJournalControls();
        this.updateEntryDate();
        this.renderMoodOptions();
        this.renderJournalHistory();
        this.loadTodayEntry();
    }

    setupJournalControls() {
        const saveJournalBtn = document.getElementById('saveJournalBtn');
        const journalSearch = document.getElementById('journalSearch');
        
        saveJournalBtn.addEventListener('click', () => this.saveJournalEntry());
        journalSearch.addEventListener('input', () => this.searchJournalEntries());
    }

    updateEntryDate() {
        const entryDate = document.getElementById('entryDate');
        const today = new Date();
        entryDate.textContent = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    renderMoodOptions() {
        const moodOptions = document.getElementById('moodOptions');
        const moods = ['😊', '😐', '😔', '😡', '😴', '🤔', '😎', '🥳'];
        
        moodOptions.innerHTML = moods.map(mood => `
            <div class="mood-option" data-mood="${mood}" onclick="dashboard.selectMood('${mood}')">
                ${mood}
            </div>
        `).join('');
    }

    selectMood(mood) {
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
        this.selectedMood = mood;
    }

    loadTodayEntry() {
        const today = new Date().toDateString();
        const todayEntry = this.journalEntries.find(entry => 
            new Date(entry.date).toDateString() === today
        );
        
        if (todayEntry) {
            document.getElementById('journalText').value = todayEntry.text;
            this.selectMood(todayEntry.mood);
        }
    }

    saveJournalEntry() {
        const text = document.getElementById('journalText').value.trim();
        const mood = this.selectedMood;
        
        if (!text && !mood) {
            alert('Please write something or select a mood');
            return;
        }
        
        const today = new Date().toDateString();
        const existingEntryIndex = this.journalEntries.findIndex(entry => 
            new Date(entry.date).toDateString() === today
        );
        
        const entry = {
            date: new Date().toISOString(),
            text: text,
            mood: mood || '😐'
        };
        
        if (existingEntryIndex >= 0) {
            this.journalEntries[existingEntryIndex] = entry;
        } else {
            this.journalEntries.unshift(entry);
        }
        
        localStorage.setItem('journalEntries', JSON.stringify(this.journalEntries));
        this.renderJournalHistory();
        
        alert('Journal entry saved!');
    }

    renderJournalHistory() {
        const entriesList = document.getElementById('entriesList');
        
        entriesList.innerHTML = this.journalEntries.map(entry => {
            const date = new Date(entry.date);
            const preview = entry.text.substring(0, 100) + (entry.text.length > 100 ? '...' : '');
            
            return `
                <div class="entry-item" onclick="dashboard.viewJournalEntry('${entry.date}')">
                    <div class="entry-header">
                        <div class="entry-date-small">${date.toLocaleDateString()}</div>
                        <div class="entry-mood">${entry.mood}</div>
                    </div>
                    <div class="entry-preview">${preview}</div>
                </div>
            `;
        }).join('');
    }

    viewJournalEntry(dateString) {
        const entry = this.journalEntries.find(e => e.date === dateString);
        if (entry) {
            alert(`${new Date(entry.date).toLocaleDateString()}\nMood: ${entry.mood}\n\n${entry.text}`);
        }
    }

    searchJournalEntries() {
        const query = document.getElementById('journalSearch').value.toLowerCase();
        const entries = document.querySelectorAll('.entry-item');
        
        entries.forEach(entry => {
            const preview = entry.querySelector('.entry-preview').textContent.toLowerCase();
            if (preview.includes(query)) {
                entry.style.display = 'block';
            } else {
                entry.style.display = 'none';
            }
        });
    }

    // Load sample data
    loadSampleData() {
        // Only load if no existing data
        if (this.tasks.length === 0) {
            const sampleTasks = [
                {id: 1, title: "Complete Math Assignment", subject: "Math", completed: false, priority: "high", createdAt: new Date().toISOString()},
                {id: 2, title: "Read History Chapter 5", subject: "History", completed: true, priority: "medium", createdAt: new Date().toISOString()},
                {id: 3, title: "Write English Essay", subject: "English", completed: false, priority: "high", createdAt: new Date().toISOString()}
            ];
            this.tasks = sampleTasks;
            this.taskIdCounter = 4;
            this.saveTasksToStorage();
            this.renderTasks();
        }
        
        if (this.notes.length === 0) {
            const sampleNotes = [
                {id: 1, title: "Physics Formulas", content: "# Important Formulas\n\n- F = ma\n- E = mc²", subject: "Science", date: new Date().toISOString(), lastModified: new Date().toISOString()},
                {id: 2, title: "Essay Outline", content: "## Introduction\n- Hook\n- Thesis statement", subject: "English", date: new Date().toISOString(), lastModified: new Date().toISOString()}
            ];
            this.notes = sampleNotes;
            this.noteIdCounter = 3;
            this.saveNotesToStorage();
            this.renderNotesList();
        }
        
        if (this.flashcards.length === 0) {
            const sampleFlashcards = [
                {id: 1, set: "Math Basics", front: "What is 2 + 2?", back: "4", subject: "Math", correct: 0, wrong: 0},
                {id: 2, set: "Math Basics", front: "What is 5 × 6?", back: "30", subject: "Math", correct: 0, wrong: 0},
                {id: 3, set: "Science Facts", front: "What is H2O?", back: "Water", subject: "Science", correct: 0, wrong: 0}
            ];
            this.flashcards = sampleFlashcards;
            this.flashcardIdCounter = 4;
            this.saveFlashcardsToStorage();
            this.renderFlashcards();
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new StudyDashboard();
});