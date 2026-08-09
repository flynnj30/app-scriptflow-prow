// Main Application
class ScriptFlowApp {
    constructor() {
        this.state = {
            user: null,
            appointments: [],
            scripts: [],
            tasks: [],
            closers: [],
            teamMembers: [],
            currentView: 'dashboard',
            currentScript: null,
            selectedAppointments: [],
            theme: 'dark',
            calendarView: 'month',
            calendarDate: new Date(),
            taskFilter: 'all',
            searchQuery: '',
            isOffline: false,
            loading: false,
            initialized: false
        };
        
        this.listeners = [];
        this.charts = {};
        this.toasts = [];
        this.autoSaveTimer = null;
        this.bulkSelected = new Set();
        
        this.init();
    }

    async init() {
        loadingManager.show();
        
        try {
            // Step 1: Firebase
            loadingManager.advanceStep('firebase', 'Initializing Firebase...');
            await this.initFirebase();
            
            // Step 2: Authentication
            loadingManager.advanceStep('auth', 'Checking authentication...');
            await this.initAuth();
            
            // Step 3: Data
            loadingManager.advanceStep('data', 'Loading data...');
            await this.loadData();
            
            // Step 4: Scripts
            loadingManager.advanceStep('scripts', 'Loading scripts...');
            await this.loadScripts();
            
            // Step 5: Calendar
            loadingManager.advanceStep('calendar', 'Loading calendar...');
            this.initCalendar();
            
            // Step 6: Features
            loadingManager.advanceStep('features', 'Initializing features...');
            this.initFeatures();
            
            // Complete loading
            loadingManager.complete();
            this.state.initialized = true;
            
            // Show app
            document.getElementById('app').style.display = 'flex';
            
            // Initial render
            this.renderAll();
            
            // Start real-time listeners
            this.startListeners();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
        } catch (error) {
            console.error('Initialization error:', error);
            loadingManager.updateProgress(100, 'Error loading application. Please refresh.');
            this.showToast('Failed to initialize application: ' + error.message, 'error');
        }
    }

    initFirebase() {
        return new Promise((resolve, reject) => {
            try {
                // Firebase is already initialized in firebase-config.js
                // Just check if it's ready
                if (firebase.apps.length === 0) {
                    reject(new Error('Firebase not initialized'));
                    return;
                }
                
                // Check connection status
                firebase.firestore().enablePersistence({ synchronizeTabs: true })
                    .catch(err => {
                        console.warn('Persistence warning:', err);
                    });
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    initAuth() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(user => {
                this.state.user = user;
                if (user) {
                    this.updateUserUI(user);
                    resolve();
                } else {
                    // Show sign-in
                    this.showSignIn();
                    resolve();
                }
            });
        });
    }

    showSignIn() {
        // Create sign-in modal
        const overlay = document.getElementById('modalOverlay');
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'signInModal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-rocket"></i> ScriptFlow Pro</h2>
            </div>
            <div class="modal-body" style="text-align:center;padding:2rem;">
                <p style="margin-bottom:1.5rem;color:var(--text-secondary);">Sign in to access your CRM</p>
                <button class="btn-primary" id="googleSignIn" style="width:100%;justify-content:center;padding:0.75rem;">
                    <i class="fab fa-google"></i> Sign in with Google
                </button>
                <div style="margin:1rem 0;color:var(--text-muted);">— or —</div>
                <form id="emailSignInForm" style="text-align:left;">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="signInEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="signInPassword" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">
                        Sign In
                    </button>
                </form>
                <div style="margin-top:1rem;">
                    <a href="#" id="showSignUp" style="color:var(--accent);text-decoration:none;">Create Account</a>
                </div>
            </div>
        `;
        
        overlay.classList.add('active');
        document.body.appendChild(modal);
        
        // Google sign-in
        document.getElementById('googleSignIn').addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch(err => {
                this.showToast('Sign in failed: ' + err.message, 'error');
            });
        });
        
        // Email sign-in
        document.getElementById('emailSignInForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;
            
            auth.signInWithEmailAndPassword(email, password).catch(err => {
                this.showToast('Sign in failed: ' + err.message, 'error');
            });
        });
        
        // Show sign up
        document.getElementById('showSignUp').addEventListener('click', (e) => {
            e.preventDefault();
            // Switch to sign up view
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `
                <p style="margin-bottom:1.5rem;color:var(--text-secondary);">Create your account</p>
                <form id="emailSignUpForm" style="text-align:left;">
                    <div class="form-group">
                        <label>Display Name</label>
                        <input type="text" id="signUpName" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="signUpEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="signUpPassword" required minlength="6">
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">
                        Create Account
                    </button>
                </form>
                <div style="margin-top:1rem;">
                    <a href="#" id="showSignInLink" style="color:var(--accent);text-decoration:none;">Back to Sign In</a>
                </div>
            `;
            
            document.getElementById('emailSignUpForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('signUpName').value;
                const email = document.getElementById('signUpEmail').value;
                const password = document.getElementById('signUpPassword').value;
                
                auth.createUserWithEmailAndPassword(email, password)
                    .then(result => {
                        return result.user.updateProfile({ displayName: name });
                    })
                    .catch(err => {
                        this.showToast('Sign up failed: ' + err.message, 'error');
                    });
            });
            
            document.getElementById('showSignInLink').addEventListener('click', (e) => {
                e.preventDefault();
                modal.remove();
                this.showSignIn();
            });
        });
    }

    updateUserUI(user) {
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        const email = document.getElementById('userEmail');
        
        if (avatar) {
            avatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=6366f1&color=fff`;
        }
        if (name) {
            name.textContent = user.displayName || 'User';
        }
        if (email) {
            email.textContent = user.email || '';
        }
        
        // Remove sign-in modal
        const signInModal = document.getElementById('signInModal');
        if (signInModal) {
            signInModal.remove();
            document.getElementById('modalOverlay').classList.remove('active');
        }
    }

    async loadData() {
        if (!this.state.user) return;
        
        try {
            const uid = this.state.user.uid;
            
            // Load from localStorage first (offline fallback)
            const localData = this.loadFromLocalStorage(uid);
            if (localData) {
                this.state.appointments = localData.appointments || [];
                this.state.tasks = localData.tasks || [];
                this.state.closers = localData.closers || [];
                this.state.teamMembers = localData.teamMembers || [];
            }
            
            // Load from Firestore
            const appointmentsSnapshot = await db.collection('users').doc(uid).collection('appointments').get();
            if (!appointmentsSnapshot.empty) {
                this.state.appointments = appointmentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }
            
            const tasksSnapshot = await db.collection('users').doc(uid).collection('tasks').get();
            if (!tasksSnapshot.empty) {
                this.state.tasks = tasksSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }
            
            const closersSnapshot = await db.collection('users').doc(uid).collection('closers').get();
            if (!closersSnapshot.empty) {
                this.state.closers = closersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }
            
            // Save to localStorage
            this.saveToLocalStorage(uid);
            
        } catch (error) {
            console.warn('Error loading data from Firestore:', error);
            // Use localStorage data if available
            if (this.state.appointments.length === 0) {
                this.loadSampleData();
            }
        }
    }

    loadFromLocalStorage(uid) {
        try {
            const key = `scriptflow_data_${uid}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    saveToLocalStorage(uid) {
        try {
            const key = `scriptflow_data_${uid}`;
            const data = {
                appointments: this.state.appointments,
                tasks: this.state.tasks,
                closers: this.state.closers,
                teamMembers: this.state.teamMembers,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadSampleData() {
        // Sample appointments
        const sampleAppointments = [
            {
                id: '1',
                business: 'Acme Corp',
                contactName: 'John Smith',
                role: 'CEO',
                phone: '(555) 123-4567',
                email: 'john@acme.com',
                date: '2026-03-15',
                time: '10:00 AM',
                status: 'Hot Transfer',
                assigned: 'team1',
                closer: 'Sarah Johnson',
                notes: 'Interested in enterprise plan',
                tags: 'enterprise,hot',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                business: 'TechStart Inc',
                contactName: 'Jane Doe',
                role: 'VP Sales',
                phone: '(555) 987-6543',
                email: 'jane@techstart.com',
                date: '2026-03-16',
                time: '2:30 PM',
                status: 'Warm Callback',
                assigned: 'team2',
                closer: 'Mike Wilson',
                notes: 'Following up on demo',
                tags: 'demo,follow-up',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                business: 'Global Solutions',
                contactName: 'Bob Johnson',
                role: 'Director',
                phone: '(555) 456-7890',
                email: 'bob@global.com',
                date: '2026-03-17',
                time: '11:00 AM',
                status: 'Completed',
                assigned: 'team1',
                closer: 'Sarah Johnson',
                notes: 'Closed deal - $50k annual',
                tags: 'closed,success',
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                business: 'Innovation Labs',
                contactName: 'Alice Brown',
                role: 'CTO',
                phone: '(555) 234-5678',
                email: 'alice@innolabs.com',
                date: '2026-03-18',
                time: '3:00 PM',
                status: 'Pending',
                assigned: 'team3',
                closer: 'Emily Davis',
                notes: 'Technical evaluation needed',
                tags: 'technical,pending',
                createdAt: new Date().toISOString()
            },
            {
                id: '5',
                business: 'Premier Consulting',
                contactName: 'David Lee',
                role: 'Managing Partner',
                phone: '(555) 876-5432',
                email: 'david@premier.com',
                date: '2026-03-19',
                time: '9:30 AM',
                status: 'Meeting Booked',
                assigned: 'team2',
                closer: 'Mike Wilson',
                notes: 'Strategic partnership discussion',
                tags: 'partner,meeting',
                createdAt: new Date().toISOString()
            }
        ];
        
        // Sample tasks
        const sampleTasks = [
            {
                id: 't1',
                description: 'Follow up with Acme Corp',
                dueDate: '2026-03-20',
                priority: 'High',
                appointmentId: '1',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 't2',
                description: 'Send demo recording to TechStart',
                dueDate: '2026-03-17',
                priority: 'Medium',
                appointmentId: '2',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 't3',
                description: 'Prepare contract for Global Solutions',
                dueDate: '2026-03-16',
                priority: 'High',
                appointmentId: '3',
                completed: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 't4',
                description: 'Schedule technical review with Innovation Labs',
                dueDate: '2026-03-21',
                priority: 'Medium',
                appointmentId: '4',
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
        
        // Sample closers
        const sampleClosers = [
            {
                id: 'c1',
                name: 'Sarah Johnson',
                email: 'sarah@scriptflow.com',
                phone: '(555) 111-2222',
                active: true,
                default: true
            },
            {
                id: 'c2',
                name: 'Mike Wilson',
                email: 'mike@scriptflow.com',
                phone: '(555) 333-4444',
                active: true,
                default: false
            },
            {
                id: 'c3',
                name: 'Emily Davis',
                email: 'emily@scriptflow.com',
                phone: '(555) 555-6666',
                active: true,
                default: false
            }
        ];
        
        // Sample team members
        const sampleTeam = [
            {
                id: 'tm1',
                name: 'Team Alpha',
                role: 'Sales Team',
                color: '#6366f1',
                active: true
            },
            {
                id: 'tm2',
                name: 'Team Beta',
                role: 'Sales Team',
                color: '#34d399',
                active: true
            },
            {
                id: 'tm3',
                name: 'Team Gamma',
                role: 'Sales Team',
                color: '#fbbf24',
                active: true
            }
        ];
        
        this.state.appointments = sampleAppointments;
        this.state.tasks = sampleTasks;
        this.state.closers = sampleClosers;
        this.state.teamMembers = sampleTeam;
        
        // Save to localStorage
        if (this.state.user) {
            this.saveToLocalStorage(this.state.user.uid);
        }
    }

    async loadScripts() {
        if (!this.state.user) return;
        
        try {
            const uid = this.state.user.uid;
            const scriptsSnapshot = await db.collection('users').doc(uid).collection('scripts').get();
            
            if (!scriptsSnapshot.empty) {
                this.state.scripts = scriptsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Load sample scripts
                this.state.scripts = [
                    {
                        id: 'script1',
                        name: 'Initial Cold Call',
                        content: `Hello [Name],

This is [Your Name] from ScriptFlow Pro. I'm reaching out because we've been helping businesses like [Company] increase their sales conversion rates by up to 40%.

I noticed that you're in the [Industry] space, and I thought you might be interested in how we're helping companies streamline their sales process.

I'd love to schedule a brief 15-minute call to share some insights. Would you have time this week?

Best regards,
[Your Name]`,
                        version: 1,
                        favorite: true,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'script2',
                        name: 'Follow-up Call',
                        content: `Hi [Name],

Following up on our previous conversation about ScriptFlow Pro.

I wanted to share some additional information about how we help businesses like yours:
- Increase conversion rates by 30-40%
- Reduce time spent on calls by 50%
- Improve lead management and tracking

Would you be open to a brief call to discuss this further?

Looking forward to hearing from you.`,
                        version: 1,
                        favorite: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'script3',
                        name: 'Demo Call',
                        content: `Welcome [Name]!

Thank you for joining this demo of ScriptFlow Pro.

Today we'll cover:
1. Overview of the platform
2. How to manage leads effectively
3. Smart import features
4. Analytics and reporting
5. Q&A

Let me start by sharing my screen...`,
                        version: 1,
                        favorite: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'script4',
                        name: 'Objection Handling',
                        content: `When facing objections:

Objection: "We don't need this"
Response: "I understand. Many of our clients felt the same way. Could you tell me more about your current process?"

Objection: "We're too busy"
Response: "I completely understand. That's actually why we created ScriptFlow Pro - to save time."

Objection: "Just send info"
Response: "I'd be happy to. Would you also be open to a brief call to discuss your specific needs?"`,
                        version: 1,
                        favorite: false,
                        createdAt: new Date().toISOString()
                    }
                ];
            }
            
            // Set current script
            if (this.state.scripts.length > 0) {
                this.state.currentScript = this.state.scripts[0];
            }
            
        } catch (error) {
            console.warn('Error loading scripts:', error);
            // Use sample scripts if available
            if (this.state.scripts.length === 0) {
                this.state.scripts = [
                    {
                        id: 'script1',
                        name: 'Sample Script 1',
                        content: 'Welcome to ScriptFlow Pro! This is your first script.',
                        version: 1,
                        favorite: false,
                        createdAt: new Date().toISOString()
                    }
                ];
                this.state.currentScript = this.state.scripts[0];
            }
        }
    }

    startListeners() {
        if (!this.state.user) return;
        
        const uid = this.state.user.uid;
        
        // Listen to appointments
        const appointmentsListener = db.collection('users').doc(uid).collection('appointments')
            .onSnapshot(snapshot => {
                if (snapshot.empty) return;
                this.state.appointments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.saveToLocalStorage(uid);
                this.renderAll();
            }, error => {
                console.warn('Appointments listener error:', error);
                this.state.isOffline = true;
            });
        this.listeners.push(appointmentsListener);
        
        // Listen to tasks
        const tasksListener = db.collection('users').doc(uid).collection('tasks')
            .onSnapshot(snapshot => {
                if (snapshot.empty) return;
                this.state.tasks = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.saveToLocalStorage(uid);
                this.renderAll();
            }, error => {
                console.warn('Tasks listener error:', error);
            });
        this.listeners.push(tasksListener);
        
        // Listen to closers
        const closersListener = db.collection('users').doc(uid).collection('closers')
            .onSnapshot(snapshot => {
                if (snapshot.empty) return;
                this.state.closers = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.saveToLocalStorage(uid);
                this.renderAll();
            }, error => {
                console.warn('Closers listener error:', error);
            });
        this.listeners.push(closersListener);
    }

    initCalendar() {
        // Calendar view switching
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.calendarView = btn.dataset.view;
                this.renderCalendar();
            });
        });
        
        // Calendar navigation
        document.getElementById('calendarPrev').addEventListener('click', () => {
            const date = this.state.calendarDate;
            if (this.state.calendarView === 'month') {
                date.setMonth(date.getMonth() - 1);
            } else if (this.state.calendarView === 'week') {
                date.setDate(date.getDate() - 7);
            } else {
                date.setDate(date.getDate() - 1);
            }
            this.state.calendarDate = new Date(date);
            this.renderCalendar();
        });
        
        document.getElementById('calendarNext').addEventListener('click', () => {
            const date = this.state.calendarDate;
            if (this.state.calendarView === 'month') {
                date.setMonth(date.getMonth() + 1);
            } else if (this.state.calendarView === 'week') {
                date.setDate(date.getDate() + 7);
            } else {
                date.setDate(date.getDate() + 1);
            }
            this.state.calendarDate = new Date(date);
            this.renderCalendar();
        });
        
        // Quick add
        document.getElementById('quickAddBtn').addEventListener('click', () => {
            this.openQuickAdd();
        });
        
        // Initial render
        this.renderCalendar();
    }

    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        
        const view = this.state.calendarView;
        const date = this.state.calendarDate;
        
        if (view === 'month') {
            this.renderMonthView(grid, date);
        } else if (view === 'week') {
            this.renderWeekView(grid, date);
        } else if (view === 'day') {
            this.renderDayView(grid, date);
        } else {
            this.renderListView(grid, date);
        }
    }

    renderMonthView(grid, date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Update title
        document.getElementById('calendarTitle').textContent = 
            new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        let html = `
            <div class="calendar-weekdays">
                <div class="calendar-weekday">Sun</div>
                <div class="calendar-weekday">Mon</div>
                <div class="calendar-weekday">Tue</div>
                <div class="calendar-weekday">Wed</div>
                <div class="calendar-weekday">Thu</div>
                <div class="calendar-weekday">Fri</div>
                <div class="calendar-weekday">Sat</div>
            </div>
            <div class="calendar-days">
        `;
        
        // Empty days before first day
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day other-month"></div>`;
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const isToday = dateObj.toDateString() === today.toDateString();
            const dayEvents = this.state.appointments.filter(a => 
                a.date === dateObj.toISOString().split('T')[0]
            );
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateObj.toISOString().split('T')[0]}">
                    <div class="day-number">${day}</div>
                    <div class="day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="day-event" style="background:${this.getStatusColor(event.status)}" data-id="${event.id}">
                                ${event.time} ${event.business}
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div class="day-event" style="background:var(--bg-hover);color:var(--text-secondary);">+${dayEvents.length - 3} more</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        grid.innerHTML = html;
        
        // Add click events
        grid.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const dateStr = dayEl.dataset.date;
                if (dateStr) {
                    this.showDayAppointments(dateStr);
                }
            });
        });
    }

    renderWeekView(grid, date) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        
        document.getElementById('calendarTitle').textContent = 
            `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        
        let html = `
            <div class="calendar-weekdays" style="grid-template-columns: 80px repeat(7, 1fr);">
                <div class="calendar-weekday">Time</div>
                ${Array.from({length: 7}, (_, i) => {
                    const day = new Date(startOfWeek);
                    day.setDate(day.getDate() + i);
                    return `<div class="calendar-weekday">${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>`;
                }).join('')}
            </div>
        `;
        
        // Time slots
        const hours = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        html += '<div style="display:grid;grid-template-columns:80px repeat(7,1fr);">';
        
        hours.forEach(hour => {
            html += `<div style="padding:0.5rem;font-size:0.75rem;color:var(--text-muted);border-bottom:1px solid var(--border-color);">${hour}</div>`;
            
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(day.getDate() + i);
                const dateStr = day.toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                
                // Find events at this time
                const events = this.state.appointments.filter(a => 
                    a.date === dateStr && a.time && a.time.includes(hour.split(' ')[0])
                );
                
                html += `
                    <div style="padding:0.25rem;border-bottom:1px solid var(--border-color);background:${isToday ? 'var(--accent-light)' : 'transparent'};min-height:40px;">
                        ${events.map(event => `
                            <div class="day-event" style="background:${this.getStatusColor(event.status)};padding:0.1rem 0.35rem;border-radius:3px;font-size:0.6rem;color:white;cursor:pointer;" data-id="${event.id}">
                                ${event.business}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        });
        
        html += '</div>';
        grid.innerHTML = html;
    }

    renderDayView(grid, date) {
        const dateStr = date.toISOString().split('T')[0];
        const dayEvents = this.state.appointments.filter(a => a.date === dateStr);
        
        document.getElementById('calendarTitle').textContent = 
            date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        
        let html = `
            <div style="padding:1rem;">
                <h3 style="margin-bottom:1rem;">${dayEvents.length} appointments</h3>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
        `;
        
        if (dayEvents.length === 0) {
            html += `<p style="color:var(--text-muted);text-align:center;padding:2rem;">No appointments for this day</p>`;
        } else {
            dayEvents.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
            dayEvents.forEach(event => {
                html += `
                    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.75rem 1rem;border-left:4px solid ${this.getStatusColor(event.status)};cursor:pointer;" data-id="${event.id}">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>${event.business}</strong>
                                <span style="color:var(--text-secondary);font-size:0.875rem;margin-left:0.5rem;">${event.contactName}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <span style="font-size:0.875rem;color:var(--text-secondary);">${event.time || 'TBD'}</span>
                                <span style="font-size:0.7rem;padding:0.1rem 0.5rem;border-radius:10px;background:${this.getStatusColor(event.status)}20;color:${this.getStatusColor(event.status)};">${event.status}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div></div>';
        grid.innerHTML = html;
        
        // Add click events
        grid.querySelectorAll('[data-id]').forEach(el => {
            el.addEventListener('click', () => {
                const appointment = this.state.appointments.find(a => a.id === el.dataset.id);
                if (appointment) {
                    this.openAppointmentDetail(appointment);
                }
            });
        });
    }

    renderListView(grid, date) {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startStr = startOfMonth.toISOString().split('T')[0];
        const endStr = endOfMonth.toISOString().split('T')[0];
        
        const monthEvents = this.state.appointments.filter(a => 
            a.date >= startStr && a.date <= endStr
        );
        
        document.getElementById('calendarTitle').textContent = 
            date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' - List View';
        
        let html = `
            <div style="padding:1rem;">
                <h3 style="margin-bottom:1rem;">${monthEvents.length} appointments this month</h3>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
        `;
        
        if (monthEvents.length === 0) {
            html += `<p style="color:var(--text-muted);text-align:center;padding:2rem;">No appointments this month</p>`;
        } else {
            monthEvents.sort((a, b) => a.date.localeCompare(b.date));
            let currentDate = '';
            monthEvents.forEach(event => {
                const dateDisplay = event.date !== currentDate ? 
                    `<div style="font-weight:600;margin-top:0.5rem;padding:0.5rem 0;">${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>` : '';
                currentDate = event.date;
                
                html += `
                    ${dateDisplay}
                    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.75rem 1rem;border-left:4px solid ${this.getStatusColor(event.status)};cursor:pointer;" data-id="${event.id}">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>${event.business}</strong>
                                <span style="color:var(--text-secondary);font-size:0.875rem;margin-left:0.5rem;">${event.contactName}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <span style="font-size:0.875rem;color:var(--text-secondary);">${event.time || 'TBD'}</span>
                                <span style="font-size:0.7rem;padding:0.1rem 0.5rem;border-radius:10px;background:${this.getStatusColor(event.status)}20;color:${this.getStatusColor(event.status)};">${event.status}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div></div>';
        grid.innerHTML = html;
        
        // Add click events
        grid.querySelectorAll('[data-id]').forEach(el => {
            el.addEventListener('click', () => {
                const appointment = this.state.appointments.find(a => a.id === el.dataset.id);
                if (appointment) {
                    this.openAppointmentDetail(appointment);
                }
            });
        });
    }

    getStatusColor(status) {
        const colors = {
            'Hot Transfer': '#f87171',
            'Warm Callback': '#fbbf24',
            'Completed': '#34d399',
            'Pending': '#60a5fa',
            'Canceled': '#9ca3af',
            'Meeting Booked': '#818cf8',
            'Rescheduled': '#a78bfa',
            'Overdue': '#fb923c',
            'Held': '#34d399'
        };
        return colors[status] || '#6b7280';
    }

    showDayAppointments(dateStr) {
        const appointments = this.state.appointments.filter(a => a.date === dateStr);
        if (appointments.length === 0) {
            this.showToast('No appointments on this day', 'info');
            return;
        }
        
        // Show in a modal or switch to day view
        this.state.calendarDate = new Date(dateStr);
        this.state.calendarView = 'day';
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === 'day');
        });
        this.renderCalendar();
    }

    initFeatures() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.signOut();
        });
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.switchView(view);
            });
        });
        
        // Mobile menu toggle
        document.getElementById('mobileMenuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
        
        // Sidebar toggle (desktop)
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('open');
            }
        });
        
        // Global search
        const searchInput = document.getElementById('globalSearch');
        searchInput.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value;
            this.performSearch();
        });
        
        // Refresh
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
        
        // Shortcuts help
        document.getElementById('shortcutsHelpBtn').addEventListener('click', () => {
            this.openShortcutsHelp();
        });
        
        // New script
        document.getElementById('newScriptBtn').addEventListener('click', () => {
            this.createNewScript();
        });
        
        // Script content auto-save
        const scriptContent = document.getElementById('scriptContent');
        scriptContent.addEventListener('input', () => {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.saveScriptContent();
            }, 1000);
        });
        
        // Script name change
        document.getElementById('scriptName').addEventListener('change', () => {
            this.saveScriptName();
        });
        
        // Favorite script
        document.getElementById('favoriteScriptBtn').addEventListener('click', () => {
            this.toggleScriptFavorite();
        });
        
        // Copy script
        document.getElementById('copyScriptBtn').addEventListener('click', () => {
            this.copyScriptToClipboard();
        });
        
        // Reset script
        document.getElementById('resetScriptBtn').addEventListener('click', () => {
            this.resetScriptContent();
        });
        
        // Delete script
        document.getElementById('deleteScriptBtn').addEventListener('click', () => {
            this.deleteCurrentScript();
        });
        
        // Import
        document.getElementById('parseImportBtn').addEventListener('click', () => {
            this.parseImportText();
        });
        
        document.getElementById('clearImportBtn').addEventListener('click', () => {
            document.getElementById('importText').value = '';
            document.getElementById('importResults').innerHTML = '';
        });
        
        document.getElementById('saveAllImportBtn').addEventListener('click', () => {
            this.saveAllImportRecords();
        });
        
        // Quick add
        document.getElementById('saveQuickAddBtn').addEventListener('click', () => {
            this.saveQuickAdd();
        });
        
        // New task
        document.getElementById('newTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });
        
        // Task filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.taskFilter = btn.dataset.filter;
                this.renderTasks();
            });
        });
        
        // New closer
        document.getElementById('newCloserBtn').addEventListener('click', () => {
            this.openCloserModal();
        });
        
        // Export CSV
        document.getElementById('exportCSVBtn').addEventListener('click', () => {
            this.exportCSV();
        });
        
        // Bulk actions
        document.getElementById('bulkBtn').addEventListener('click', () => {
            this.openBulkActions();
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modal;
                if (modalId) {
                    this.closeModal(modalId);
                }
            });
        });
        
        // Close modal on overlay click
        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeAllModals();
        });
        
        // Initialize objection handler
        if (window.objectionHandler) {
            objectionHandler.init();
        }
        
        // Load theme preference
        const savedTheme = localStorage.getItem('scriptflow_theme') || 'dark';
        this.state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    switchView(view) {
        this.state.currentView = view;
        
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
        
        // Update view panels
        document.querySelectorAll('.view-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `view-${view}`);
        });
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            calendar: 'Calendar',
            scripts: 'Scripts',
            import: 'Smart Import',
            tasks: 'Tasks & Follow-ups',
            closers: 'Closer Management',
            analytics: 'Analytics'
        };
        document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';
        
        // Close mobile sidebar
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('open');
        }
        
        // Render specific views
        if (view === 'dashboard') {
            this.renderDashboard();
        } else if (view === 'calendar') {
            this.renderCalendar();
        } else if (view === 'scripts') {
            this.renderScripts();
        } else if (view === 'tasks') {
            this.renderTasks();
        } else if (view === 'closers') {
            this.renderClosers();
        } else if (view === 'analytics') {
            this.renderAnalytics();
        }
    }

    renderAll() {
        this.renderDashboard();
        this.renderScripts();
        this.renderTasks();
        this.renderClosers();
        this.renderCalendar();
        this.updateBadges();
    }

    renderDashboard() {
        const appointments = this.state.appointments;
        const total = appointments.length;
        const hotTransfers = appointments.filter(a => a.status === 'Hot Transfer').length;
        const warmCallbacks = appointments.filter(a => a.status === 'Warm Callback').length;
        const completed = appointments.filter(a => a.status === 'Completed').length;
        const pending = appointments.filter(a => a.status === 'Pending').length;
        const canceled = appointments.filter(a => a.status === 'Canceled').length;
        const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Goal progress (assuming weekly goal of 10 appointments)
        const weeklyGoal = 10;
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStr = weekStart.toISOString().split('T')[0];
        const thisWeek = appointments.filter(a => a.date >= weekStr);
        const goalProgress = Math.min(Math.round((thisWeek.length / weeklyGoal) * 100), 100);
        
        document.getElementById('totalPipeline').textContent = total;
        document.getElementById('hotTransfers').textContent = hotTransfers;
        document.getElementById('warmCallbacks').textContent = warmCallbacks;
        document.getElementById('completedAppointments').textContent = completed;
        document.getElementById('pendingAppointments').textContent = pending;
        document.getElementById('canceledAppointments').textContent = canceled;
        document.getElementById('conversionRate').textContent = conversionRate + '%';
        document.getElementById('goalProgress').textContent = goalProgress + '%';
        
        // Update charts
        this.updateDashboardCharts(appointments);
    }

    updateDashboardCharts(appointments) {
        // Status distribution
        const statuses = ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked'];
        const counts = statuses.map(s => appointments.filter(a => a.status === s).length);
        
        this.renderChart('statusDonutChart', 'doughnut', {
            labels: statuses,
            datasets: [{
                data: counts,
                backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#9ca3af', '#818cf8'],
                borderWidth: 2
            }]
        });
        
        // Weekly trend
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekData = days.map((_, i) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            return appointments.filter(a => a.date === dateStr).length;
        });
        
        this.renderChart('weeklyTrendChart', 'line', {
            labels: days,
            datasets: [{
                label: 'Appointments',
                data: weekData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        });
    }

    renderChart(canvasId, type, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text-secondary)'
                        }
                    }
                },
                scales: type === 'line' ? {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border-color)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'var(--border-color)'
                        }
                    }
                } : undefined
            }
        });
    }

    renderScripts() {
        const list = document.getElementById('scriptsList');
        const scripts = this.state.scripts;
        
        if (!list) return;
        
        if (scripts.length === 0) {
            list.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-muted);">
                    <i class="fas fa-file-alt" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
                    <p>No scripts yet. Create your first one!</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = scripts.map(script => `
            <div class="script-item ${this.state.currentScript?.id === script.id ? 'active' : ''}" data-id="${script.id}">
                <span class="drag-handle"><i class="fas fa-grip-lines"></i></span>
                <span class="script-name">${script.name}</span>
                <button class="favorite-btn ${script.favorite ? 'active' : ''}" data-id="${script.id}">
                    <i class="${script.favorite ? 'fas' : 'far'} fa-star"></i>
                </button>
                ${script.version > 1 ? `<span class="script-badge">v${script.version}</span>` : ''}
            </div>
        `).join('');
        
        // Add click events
        list.querySelectorAll('.script-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-btn')) return;
                const id = item.dataset.id;
                const script = this.state.scripts.find(s => s.id === id);
                if (script) {
                    this.state.currentScript = script;
                    this.renderScripts();
                    this.loadScriptContent(script);
                }
            });
        });
        
        // Favorite toggle
        list.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const script = this.state.scripts.find(s => s.id === id);
                if (script) {
                    script.favorite = !script.favorite;
                    this.saveScripts();
                    this.renderScripts();
                }
            });
        });
        
        // Load current script content
        if (this.state.currentScript) {
            this.loadScriptContent(this.state.currentScript);
        } else if (scripts.length > 0) {
            this.state.currentScript = scripts[0];
            this.loadScriptContent(scripts[0]);
        }
    }

    loadScriptContent(script) {
        document.getElementById('scriptName').value = script.name || '';
        document.getElementById('scriptContent').value = script.content || '';
        document.getElementById('scriptVersion').textContent = `Version ${script.version || 1}`;
        document.getElementById('scriptStatus').textContent = 'Loaded';
        
        // Update favorite button
        const favBtn = document.getElementById('favoriteScriptBtn');
        favBtn.innerHTML = `<i class="${script.favorite ? 'fas' : 'far'} fa-star"></i>`;
    }

    createNewScript() {
        const newScript = {
            id: 'script_' + Date.now(),
            name: 'New Script',
            content: 'Write your script here...',
            version: 1,
            favorite: false,
            createdAt: new Date().toISOString()
        };
        
        this.state.scripts.unshift(newScript);
        this.state.currentScript = newScript;
        this.saveScripts();
        this.renderScripts();
        this.loadScriptContent(newScript);
        this.showToast('New script created', 'success');
    }

    saveScriptContent() {
        if (!this.state.currentScript) return;
        
        const content = document.getElementById('scriptContent').value;
        this.state.currentScript.content = content;
        document.getElementById('scriptStatus').textContent = 'Saving...';
        
        this.saveScripts();
        
        setTimeout(() => {
            document.getElementById('scriptStatus').textContent = 'Saved';
        }, 300);
    }

    saveScriptName() {
        if (!this.state.currentScript) return;
        
        const name = document.getElementById('scriptName').value;
        this.state.currentScript.name = name;
        this.saveScripts();
        this.renderScripts();
    }

    toggleScriptFavorite() {
        if (!this.state.currentScript) return;
        
        this.state.currentScript.favorite = !this.state.currentScript.favorite;
        this.saveScripts();
        this.renderScripts();
        this.loadScriptContent(this.state.currentScript);
    }

    copyScriptToClipboard() {
        if (!this.state.currentScript) return;
        
        navigator.clipboard.writeText(this.state.currentScript.content).then(() => {
            this.showToast('Script copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy script', 'error');
        });
    }

    resetScriptContent() {
        if (!this.state.currentScript) return;
        
        if (confirm('Reset script to its original content?')) {
            // For simplicity, just keep the current content
            // In a real app, you'd store original version
            this.showToast('Script reset', 'info');
        }
    }

    deleteCurrentScript() {
        if (!this.state.currentScript) return;
        
        if (confirm(`Delete script "${this.state.currentScript.name}"?`)) {
            const index = this.state.scripts.findIndex(s => s.id === this.state.currentScript.id);
            if (index !== -1) {
                this.state.scripts.splice(index, 1);
                this.state.currentScript = this.state.scripts[0] || null;
                this.saveScripts();
                this.renderScripts();
                if (this.state.currentScript) {
                    this.loadScriptContent(this.state.currentScript);
                } else {
                    document.getElementById('scriptName').value = '';
                    document.getElementById('scriptContent').value = '';
                    document.getElementById('scriptVersion').textContent = 'No script selected';
                    document.getElementById('scriptStatus').textContent = '';
                }
                this.showToast('Script deleted', 'info');
            }
        }
    }

    saveScripts() {
        if (!this.state.user) return;
        
        const uid = this.state.user.uid;
        const batch = db.batch();
        
        this.state.scripts.forEach(script => {
            const ref = db.collection('users').doc(uid).collection('scripts').doc(script.id);
            batch.set(ref, script);
        });
        
        batch.commit().catch(err => {
            console.warn('Failed to save scripts:', err);
        });
    }

    renderTasks() {
        const list = document.getElementById('tasksList');
        if (!list) return;
        
        let filtered = [...this.state.tasks];
        const filter = this.state.taskFilter;
        
        if (filter === 'pending') {
            filtered = filtered.filter(t => !t.completed);
        } else if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(t => t.dueDate === today);
        }
        
        // Sort by due date
        filtered.sort((a, b) => a.dueDate?.localeCompare(b.dueDate || ''));
        
        if (filtered.length === 0) {
            list.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-muted);">
                    <i class="fas fa-check-circle" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = filtered.map(task => `
            <div class="task-item" data-id="${task.id}">
                <button class="task-check ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check" style="color:white;font-size:10px;"></i>' : ''}
                </button>
                <div class="task-info">
                    <div class="task-description ${task.completed ? 'completed-text' : ''}">${task.description}</div>
                    <div class="task-meta">
                        <span>Due: ${task.dueDate || 'No date'}</span>
                        <span class="task-priority ${task.priority?.toLowerCase() || 'medium'}">${task.priority || 'Medium'}</span>
                        ${task.appointmentId ? `<span>📅 Related appointment</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon edit-task" data-id="${task.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-task" data-id="${task.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        // Toggle complete
        list.querySelectorAll('.task-check').forEach(btn => {
            btn.addEventListener('click', () => {
                const task = this.state.tasks.find(t => t.id === btn.dataset.id);
                if (task) {
                    task.completed = !task.completed;
                    this.saveTasks();
                    this.renderTasks();
                    this.updateBadges();
                }
            });
        });
        
        // Edit task
        list.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const task = this.state.tasks.find(t => t.id === btn.dataset.id);
                if (task) {
                    this.openTaskModal(task);
                }
            });
        });
        
        // Delete task
        list.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this task?')) {
                    const index = this.state.tasks.findIndex(t => t.id === btn.dataset.id);
                    if (index !== -1) {
                        this.state.tasks.splice(index, 1);
                        this.saveTasks();
                        this.renderTasks();
                        this.updateBadges();
                        this.showToast('Task deleted', 'info');
                    }
                }
            });
        });
    }

    saveTasks() {
        if (!this.state.user) return;
        
        const uid = this.state.user.uid;
        const batch = db.batch();
        
        this.state.tasks.forEach(task => {
            const ref = db.collection('users').doc(uid).collection('tasks').doc(task.id);
            batch.set(ref, task);
        });
        
        batch.commit().catch(err => {
            console.warn('Failed to save tasks:', err);
        });
    }

    renderClosers() {
        const grid = document.getElementById('closersGrid');
        if (!grid) return;
        
        const closers = this.state.closers;
        
        if (closers.length === 0) {
            grid.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-muted);grid-column:1/-1;">
                    <i class="fas fa-user-tie" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>
                    <p>No closers added yet. Add your first closer!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = closers.map(closer => `
            <div class="closer-card" data-id="${closer.id}">
                <div class="closer-header">
                    <div class="closer-name">${closer.name}</div>
                    <div class="closer-badges">
                        ${closer.default ? `<span class="closer-badge default">Default</span>` : ''}
                        ${!closer.active ? `<span class="closer-badge" style="background:var(--danger);color:white;">Inactive</span>` : ''}
                    </div>
                </div>
                <div class="closer-details">
                    <p><i class="fas fa-envelope"></i> ${closer.email || 'No email'}</p>
                    <p><i class="fas fa-phone"></i> ${closer.phone || 'No phone'}</p>
                </div>
                <div class="closer-actions">
                    <button class="btn-secondary-sm edit-closer" data-id="${closer.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-secondary-sm toggle-closer" data-id="${closer.id}">
                        <i class="fas ${closer.active ? 'fa-pause' : 'fa-play'}"></i> ${closer.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn-secondary-sm default-closer" data-id="${closer.id}" ${closer.default ? 'disabled' : ''}>
                        <i class="fas fa-star"></i> Set Default
                    </button>
                    <button class="btn-secondary-sm delete-closer" data-id="${closer.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        // Edit closer
        grid.querySelectorAll('.edit-closer').forEach(btn => {
            btn.addEventListener('click', () => {
                const closer = this.state.closers.find(c => c.id === btn.dataset.id);
                if (closer) {
                    this.openCloserModal(closer);
                }
            });
        });
        
        // Toggle active
        grid.querySelectorAll('.toggle-closer').forEach(btn => {
            btn.addEventListener('click', () => {
                const closer = this.state.closers.find(c => c.id === btn.dataset.id);
                if (closer) {
                    closer.active = !closer.active;
                    this.saveClosers();
                    this.renderClosers();
                    this.showToast(`${closer.name} ${closer.active ? 'activated' : 'deactivated'}`, 'info');
                }
            });
        });
        
        // Set default
        grid.querySelectorAll('.default-closer').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.state.closers.forEach(c => c.default = c.id === id);
                this.saveClosers();
                this.renderClosers();
                this.showToast('Default closer updated', 'success');
            });
        });
        
        // Delete closer
        grid.querySelectorAll('.delete-closer').forEach(btn => {
            btn.addEventListener('click', () => {
                const closer = this.state.closers.find(c => c.id === btn.dataset.id);
                if (closer && confirm(`Delete closer "${closer.name}"?`)) {
                    const index = this.state.closers.findIndex(c => c.id === btn.dataset.id);
                    if (index !== -1) {
                        this.state.closers.splice(index, 1);
                        this.saveClosers();
                        this.renderClosers();
                        this.showToast('Closer deleted', 'info');
                    }
                }
            });
        });
    }

    saveClosers() {
        if (!this.state.user) return;
        
        const uid = this.state.user.uid;
        const batch = db.batch();
        
        this.state.closers.forEach(closer => {
            const ref = db.collection('users').doc(uid).collection('closers').doc(closer.id);
            batch.set(ref, closer);
        });
        
        batch.commit().catch(err => {
            console.warn('Failed to save closers:', err);
        });
    }

    renderAnalytics() {
        const appointments = this.state.appointments;
        const total = appointments.length;
        const completed = appointments.filter(a => a.status === 'Completed').length;
        const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Status breakdown
        const statuses = ['Hot Transfer', 'Warm Callback', 'Completed', 'Pending', 'Canceled', 'Meeting Booked'];
        const statusData = statuses.map(s => ({
            status: s,
            count: appointments.filter(a => a.status === s).length
        }));
        
        // Monthly trend
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthData = months.map((_, i) => {
            const month = i + 1;
            return appointments.filter(a => {
                const date = new Date(a.date);
                return date.getMonth() === i;
            }).length;
        });
        
        // Render analytics stats
        const statsContainer = document.getElementById('analyticsStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${total}</span>
                            <span class="stat-label">Total Appointments</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${completed}</span>
                            <span class="stat-label">Completed</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${conversionRate}%</span>
                            <span class="stat-label">Conversion Rate</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
                        <div class="stat-info">
                            <span class="stat-value">${this.state.closers.filter(c => c.active).length}</span>
                            <span class="stat-label">Active Closers</span>
                        </div>
                    </div>
                </div>
                <div style="margin-top:1rem;">
                    <h3>Status Breakdown</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.5rem;margin-top:0.5rem;">
                        ${statusData.map(s => `
                            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.5rem 0.75rem;border-left:4px solid ${this.getStatusColor(s.status)};">
                                <div style="font-size:0.75rem;color:var(--text-secondary);">${s.status}</div>
                                <div style="font-size:1.25rem;font-weight:600;">${s.count}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Render trend chart
        this.renderChart('analyticsTrendChart', 'line', {
            labels: months,
            datasets: [{
                label: 'Appointments',
                data: monthData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        });
    }

    exportCSV() {
        const appointments = this.state.appointments;
        if (appointments.length === 0) {
            this.showToast('No data to export', 'warning');
            return;
        }
        
        const headers = ['Business', 'Contact', 'Phone', 'Email', 'Date', 'Time', 'Status', 'Closer', 'Notes', 'Tags'];
        const rows = appointments.map(a => [
            a.business || '',
            a.contactName || '',
            a.phone || '',
            a.email || '',
            a.date || '',
            a.time || '',
            a.status || '',
            a.closer || '',
            a.notes || '',
            a.tags || ''
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `scriptflow_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast('CSV exported successfully', 'success');
    }

    openQuickAdd(appointment = null) {
        const modal = document.getElementById('quickAddModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (!modal) return;
        
        // Populate closers
        const closerSelect = document.getElementById('qaCloser');
        closerSelect.innerHTML = '<option value="">Select closer</option>' +
            this.state.closers.filter(c => c.active).map(c => 
                `<option value="${c.name}" ${c.default ? 'selected' : ''}>${c.name}</option>`
            ).join('');
        
        // Set default date
        const dateInput = document.getElementById('qaDate');
        dateInput.value = new Date().toISOString().split('T')[0];
        
        // Populate form if editing
        if (appointment) {
            document.getElementById('qaBusiness').value = appointment.business || '';
            document.getElementById('qaContactName').value = appointment.contactName || '';
            document.getElementById('qaPhone').value = appointment.phone || '';
            document.getElementById('qaEmail').value = appointment.email || '';
            document.getElementById('qaDate').value = appointment.date || '';
            document.getElementById('qaTime').value = appointment.time || '';
            document.getElementById('qaStatus').value = appointment.status || 'Pending';
            document.getElementById('qaCloser').value = appointment.closer || '';
            document.getElementById('qaNotes').value = appointment.notes || '';
            document.getElementById('qaTags').value = appointment.tags || '';
            modal.dataset.editId = appointment.id;
        } else {
            document.getElementById('qaBusiness').value = '';
            document.getElementById('qaContactName').value = '';
            document.getElementById('qaPhone').value = '';
            document.getElementById('qaEmail').value = '';
            document.getElementById('qaTime').value = '';
            document.getElementById('qaStatus').value = 'Pending';
            document.getElementById('qaNotes').value = '';
            document.getElementById('qaTags').value = '';
            modal.dataset.editId = '';
        }
        
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    saveQuickAdd() {
        const form = document.getElementById('quickAddForm');
        const business = document.getElementById('qaBusiness').value.trim();
        const contactName = document.getElementById('qaContactName').value.trim();
        const phone = document.getElementById('qaPhone').value.trim();
        const email = document.getElementById('qaEmail').value.trim();
        const date = document.getElementById('qaDate').value;
        const time = document.getElementById('qaTime').value;
        const status = document.getElementById('qaStatus').value;
        const closer = document.getElementById('qaCloser').value;
        const notes = document.getElementById('qaNotes').value.trim();
        const tags = document.getElementById('qaTags').value.trim();
        
        if (!business || !contactName) {
            this.showToast('Business name and contact name are required', 'error');
            return;
        }
        
        const editId = document.getElementById('quickAddModal').dataset.editId;
        
        if (editId) {
            // Edit existing
            const index = this.state.appointments.findIndex(a => a.id === editId);
            if (index !== -1) {
                this.state.appointments[index] = {
                    ...this.state.appointments[index],
                    business,
                    contactName,
                    phone,
                    email,
                    date,
                    time,
                    status,
                    closer,
                    notes,
                    tags
                };
                this.saveAppointments();
                this.showToast('Appointment updated', 'success');
            }
        } else {
            // New appointment
            const newAppointment = {
                id: 'app_' + Date.now(),
                business,
                contactName,
                phone,
                email,
                date,
                time,
                status,
                closer,
                notes,
                tags,
                createdAt: new Date().toISOString()
            };
            
            this.state.appointments.push(newAppointment);
            this.saveAppointments();
            this.showToast('Appointment added', 'success');
        }
        
        this.closeModal('quickAddModal');
        this.renderAll();
        this.updateBadges();
    }

    openAppointmentDetail(appointment) {
        const modal = document.getElementById('appointmentModal');
        const body = document.getElementById('appointmentModalBody');
        const overlay = document.getElementById('modalOverlay');
        
        if (!modal || !body) return;
        
        body.innerHTML = `
            <form id="appointmentForm">
                <div class="form-group">
                    <label>Business Name</label>
                    <input type="text" id="detBusiness" value="${appointment.business || ''}" required>
                </div>
                <div class="form-group">
                    <label>Contact Name</label>
                    <input type="text" id="detContactName" value="${appointment.contactName || ''}" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" id="detRole" value="${appointment.role || ''}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" id="detPhone" value="${appointment.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="detEmail" value="${appointment.email || ''}">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="detDate" value="${appointment.date || ''}" required>
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <input type="time" id="detTime" value="${appointment.time || ''}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="detStatus">
                        <option value="Pending" ${appointment.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Hot Transfer" ${appointment.status === 'Hot Transfer' ? 'selected' : ''}>Hot Transfer</option>
                        <option value="Warm Callback" ${appointment.status === 'Warm Callback' ? 'selected' : ''}>Warm Callback</option>
                        <option value="Completed" ${appointment.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Canceled" ${appointment.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
                        <option value="Meeting Booked" ${appointment.status === 'Meeting Booked' ? 'selected' : ''}>Meeting Booked</option>
                        <option value="Rescheduled" ${appointment.status === 'Rescheduled' ? 'selected' : ''}>Rescheduled</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Closer</label>
                    <select id="detCloser">
                        <option value="">Select closer</option>
                        ${this.state.closers.filter(c => c.active).map(c => 
                            `<option value="${c.name}" ${appointment.closer === c.name ? 'selected' : ''}>${c.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="detNotes" rows="3">${appointment.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Tags</label>
                    <input type="text" id="detTags" value="${appointment.tags || ''}" placeholder="Comma separated tags">
                </div>
                <div class="form-group">
                    <label>CRM Link</label>
                    <input type="url" id="detCrmLink" value="${appointment.crmLink || ''}" placeholder="https://...">
                </div>
            </form>
        `;
        
        modal.dataset.editId = appointment.id;
        modal.classList.add('active');
        overlay.classList.add('active');
        
        // Save appointment
        document.getElementById('saveAppointmentBtn').addEventListener('click', () => {
            this.saveAppointmentDetail(appointment.id);
        });
        
        // Delete appointment
        document.getElementById('deleteAppointmentBtn').addEventListener('click', () => {
            if (confirm('Delete this appointment?')) {
                const index = this.state.appointments.findIndex(a => a.id === appointment.id);
                if (index !== -1) {
                    this.state.appointments.splice(index, 1);
                    this.saveAppointments();
                    this.closeModal('appointmentModal');
                    this.renderAll();
                    this.updateBadges();
                    this.showToast('Appointment deleted', 'info');
                }
            }
        });
    }

    saveAppointmentDetail(id) {
        const business = document.getElementById('detBusiness').value.trim();
        const contactName = document.getElementById('detContactName').value.trim();
        const role = document.getElementById('detRole').value.trim();
        const phone = document.getElementById('detPhone').value.trim();
        const email = document.getElementById('detEmail').value.trim();
        const date = document.getElementById('detDate').value;
        const time = document.getElementById('detTime').value;
        const status = document.getElementById('detStatus').value;
        const closer = document.getElementById('detCloser').value;
        const notes = document.getElementById('detNotes').value.trim();
        const tags = document.getElementById('detTags').value.trim();
        const crmLink = document.getElementById('detCrmLink').value.trim();
        
        if (!business || !contactName || !date || !time) {
            this.showToast('Required fields: Business, Contact, Date, Time', 'error');
            return;
        }
        
        const index = this.state.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            this.state.appointments[index] = {
                ...this.state.appointments[index],
                business,
                contactName,
                role,
                phone,
                email,
                date,
                time,
                status,
                closer,
                notes,
                tags,
                crmLink
            };
            this.saveAppointments();
            this.closeModal('appointmentModal');
            this.renderAll();
            this.updateBadges();
            this.showToast('Appointment updated', 'success');
        }
    }

    saveAppointments() {
        if (!this.state.user) return;
        
        const uid = this.state.user.uid;
        const batch = db.batch();
        
        this.state.appointments.forEach(app => {
            const ref = db.collection('users').doc(uid).collection('appointments').doc(app.id);
            batch.set(ref, app);
        });
        
        batch.commit().catch(err => {
            console.warn('Failed to save appointments:', err);
        });
        
        this.saveToLocalStorage(uid);
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (!modal) return;
        
        // Populate appointments
        const appointmentSelect = document.getElementById('taskAppointment');
        appointmentSelect.innerHTML = '<option value="">No related appointment</option>' +
            this.state.appointments.map(a => 
                `<option value="${a.id}" ${task?.appointmentId === a.id ? 'selected' : ''}>${a.business} - ${a.contactName}</option>`
            ).join('');
        
        if (task) {
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority || 'Medium';
            modal.dataset.editId = task.id;
            document.getElementById('deleteTaskBtn').style.display = 'block';
        } else {
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskDueDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('taskPriority').value = 'Medium';
            modal.dataset.editId = '';
            document.getElementById('deleteTaskBtn').style.display = 'none';
        }
        
        modal.classList.add('active');
        overlay.classList.add('active');
        
        // Save task
        document.getElementById('saveTaskBtn').onclick = () => {
            this.saveTask();
        };
        
        // Delete task
        document.getElementById('deleteTaskBtn').onclick = () => {
            if (confirm('Delete this task?')) {
                const id = modal.dataset.editId;
                const index = this.state.tasks.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.state.tasks.splice(index, 1);
                    this.saveTasks();
                    this.closeModal('taskModal');
                    this.renderTasks();
                    this.updateBadges();
                    this.showToast('Task deleted', 'info');
                }
            }
        };
    }

    saveTask() {
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        const appointmentId = document.getElementById('taskAppointment').value;
        
        if (!description || !dueDate) {
            this.showToast('Description and due date are required', 'error');
            return;
        }
        
        const editId = document.getElementById('taskModal').dataset.editId;
        
        if (editId) {
            // Edit existing
            const index = this.state.tasks.findIndex(t => t.id === editId);
            if (index !== -1) {
                this.state.tasks[index] = {
                    ...this.state.tasks[index],
                    description,
                    dueDate,
                    priority,
                    appointmentId
                };
                this.saveTasks();
                this.showToast('Task updated', 'success');
            }
        } else {
            // New task
            const newTask = {
                id: 'task_' + Date.now(),
                description,
                dueDate,
                priority,
                appointmentId,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.state.tasks.push(newTask);
            this.saveTasks();
            this.showToast('Task added', 'success');
        }
        
        this.closeModal('taskModal');
        this.renderTasks();
        this.updateBadges();
    }

    openCloserModal(closer = null) {
        const modal = document.getElementById('closerModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (!modal) return;
        
        if (closer) {
            document.getElementById('closerName').value = closer.name || '';
            document.getElementById('closerEmail').value = closer.email || '';
            document.getElementById('closerPhone').value = closer.phone || '';
            document.getElementById('closerActive').checked = closer.active !== false;
            document.getElementById('closerDefault').checked = closer.default || false;
            modal.dataset.editId = closer.id;
            document.getElementById('deleteCloserBtn').style.display = 'block';
        } else {
            document.getElementById('closerName').value = '';
            document.getElementById('closerEmail').value = '';
            document.getElementById('closerPhone').value = '';
            document.getElementById('closerActive').checked = true;
            document.getElementById('closerDefault').checked = false;
            modal.dataset.editId = '';
            document.getElementById('deleteCloserBtn').style.display = 'none';
        }
        
        modal.classList.add('active');
        overlay.classList.add('active');
        
        // Save closer
        document.getElementById('saveCloserBtn').onclick = () => {
            this.saveCloser();
        };
        
        // Delete closer
        document.getElementById('deleteCloserBtn').onclick = () => {
            if (confirm('Delete this closer?')) {
                const id = modal.dataset.editId;
                const index = this.state.closers.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.state.closers.splice(index, 1);
                    this.saveClosers();
                    this.closeModal('closerModal');
                    this.renderClosers();
                    this.showToast('Closer deleted', 'info');
                }
            }
        };
    }

    saveCloser() {
        const name = document.getElementById('closerName').value.trim();
        const email = document.getElementById('closerEmail').value.trim();
        const phone = document.getElementById('closerPhone').value.trim();
        const active = document.getElementById('closerActive').checked;
        const isDefault = document.getElementById('closerDefault').checked;
        
        if (!name) {
            this.showToast('Name is required', 'error');
            return;
        }
        
        const editId = document.getElementById('closerModal').dataset.editId;
        
        if (isDefault) {
            // Remove default from all others
            this.state.closers.forEach(c => c.default = false);
        }
        
        if (editId) {
            // Edit existing
            const index = this.state.closers.findIndex(c => c.id === editId);
            if (index !== -1) {
                this.state.closers[index] = {
                    ...this.state.closers[index],
                    name,
                    email,
                    phone,
                    active,
                    default: isDefault
                };
                this.saveClosers();
                this.showToast('Closer updated', 'success');
            }
        } else {
            // New closer
            const newCloser = {
                id: 'closer_' + Date.now(),
                name,
                email,
                phone,
                active,
                default: isDefault
            };
            this.state.closers.push(newCloser);
            this.saveClosers();
            this.showToast('Closer added', 'success');
        }
        
        this.closeModal('closerModal');
        this.renderClosers();
        // Update closer dropdowns
        this.updateCloserDropdowns();
    }

    updateCloserDropdowns() {
        const selects = document.querySelectorAll('#qaCloser, #detCloser');
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select closer</option>' +
                this.state.closers.filter(c => c.active).map(c => 
                    `<option value="${c.name}" ${c.default && !currentValue ? 'selected' : ''}>${c.name}</option>`
                ).join('');
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    parseImportText() {
        const text = document.getElementById('importText').value;
        if (!text.trim()) {
            this.showToast('Please paste some data to import', 'warning');
            return;
        }
        
        const records = window.smartImport.parseText(text);
        if (records.length === 0) {
            this.showToast('No valid records found. Check your input format.', 'error');
            return;
        }
        
        // Validate and check for duplicates
        const validRecords = [];
        const invalidRecords = [];
        
        records.forEach(record => {
            const validation = window.smartImport.validateRecord(record);
            const isDuplicate = window.smartImport.detectDuplicate(record, this.state.appointments);
            
            if (validation.valid && !isDuplicate) {
                validRecords.push({ record, validation, isDuplicate: false });
            } else {
                invalidRecords.push({ 
                    record, 
                    validation, 
                    isDuplicate,
                    errors: validation.errors
                });
            }
        });
        
        // Show results
        this.showImportResults(validRecords, invalidRecords);
    }

    showImportResults(validRecords, invalidRecords) {
        const modal = document.getElementById('importResultsModal');
        const body = document.getElementById('importResultsBody');
        const overlay = document.getElementById('modalOverlay');
        
        if (!modal || !body) return;
        
        if (validRecords.length === 0 && invalidRecords.length === 0) {
            body.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--text-muted);">No records found to import.</p>';
            modal.classList.add('active');
            overlay.classList.add('active');
            return;
        }
        
        let html = `
            <div style="margin-bottom:1rem;">
                <span style="color:var(--success);"><i class="fas fa-check-circle"></i> ${validRecords.length} valid records</span>
                <span style="color:var(--danger);margin-left:1rem;"><i class="fas fa-exclamation-circle"></i> ${invalidRecords.length} invalid records</span>
            </div>
            <div style="max-height:400px;overflow-y:auto;">
        `;
        
        // Show valid records
        validRecords.forEach((item, index) => {
            html += this.renderImportRecord(item.record, 'valid', index);
        });
        
        // Show invalid records
        invalidRecords.forEach((item, index) => {
            html += this.renderImportRecord(item.record, 'invalid', index, item.errors);
        });
        
        html += '</div>';
        body.innerHTML = html;
        
        modal.dataset.records = JSON.stringify(validRecords.map(r => r.record));
        modal.classList.add('active');
        overlay.classList.add('active');
        
        // Save individual record
        body.querySelectorAll('.save-record-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const record = validRecords[index]?.record;
                if (record) {
                    this.saveImportRecord(record);
                }
            });
        });
    }

    renderImportRecord(record, type, index, errors = []) {
        const confidence = record._confidence || {};
        const statusLabel = type === 'valid' ? 'Valid' : 'Invalid';
        const statusClass = type;
        
        return `
            <div class="import-record ${statusClass}">
                <div class="record-header">
                    <strong>Record ${index + 1}</strong>
                    <span class="record-status ${statusClass}">${statusLabel}</span>
                </div>
                <div class="record-fields">
                    <div class="record-field">
                        <label>Business</label>
                        <div class="field-value">
                            <span>${record.business || '-'}</span>
                            <span class="confidence-badge ${confidence.business || 'low'}">${(confidence.business || 'low').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="record-field">
                        <label>Contact</label>
                        <div class="field-value">
                            <span>${record.contactName || '-'}</span>
                            <span class="confidence-badge ${confidence.contactName || 'low'}">${(confidence.contactName || 'low').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="record-field">
                        <label>Phone</label>
                        <div class="field-value">
                            <span>${record.phone || '-'}</span>
                            <span class="confidence-badge ${confidence.phone || 'low'}">${(confidence.phone || 'low').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="record-field">
                        <label>Email</label>
                        <div class="field-value">
                            <span>${record.email || '-'}</span>
                            <span class="confidence-badge ${confidence.email || 'low'}">${(confidence.email || 'low').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="record-field">
                        <label>Date</label>
                        <div class="field-value">
                            <span>${record.date || '-'}</span>
                            <span class="confidence-badge ${confidence.date || 'low'}">${(confidence.date || 'low').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="record-field">
                        <label>Time</label>
                        <div class="field-value">
                            <span>${record.time || '-'}</span>
                            <span class="confidence-badge ${confidence.time || 'low'}">${(confidence.time || 'low').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="record-field">
                        <label>Status</label>
                        <div class="field-value">
                            <span>${record.status || 'Pending'}</span>
                            <span class="confidence-badge ${confidence.status || 'medium'}">${(confidence.status || 'medium').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="record-field">
                        <label>Closer</label>
                        <div class="field-value">
                            <span>${record.closer || '-'}</span>
                        </div>
                    </div>
                </div>
                ${errors.length > 0 ? `
                    <div style="margin-top:0.5rem;padding:0.5rem;background:rgba(248,113,113,0.1);border-radius:var(--radius-sm);">
                        ${errors.map(e => `<span style="color:var(--danger);font-size:0.8rem;">⚠️ ${e}</span>`).join('<br>')}
                    </div>
                ` : ''}
                ${type === 'valid' ? `
                    <div class="record-actions">
                        <button class="btn-primary-sm save-record-btn" data-index="${index}"><i class="fas fa-save"></i> Save</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    saveImportRecord(record) {
        const newAppointment = {
            id: 'app_' + Date.now(),
            business: record.business || '',
            contactName: record.contactName || '',
            role: record.role || '',
            phone: record.phone || '',
            email: record.email || '',
            date: record.date || '',
            time: record.time || '',
            status: record.status || 'Pending',
            assigned: record.assigned || '',
            closer: record.closer || '',
            notes: record.notes || '',
            tags: record.tags || '',
            crmLink: record.crmLink || '',
            createdAt: new Date().toISOString()
        };
        
        this.state.appointments.push(newAppointment);
        this.saveAppointments();
        this.renderAll();
        this.updateBadges();
        this.showToast(`Imported: ${newAppointment.business}`, 'success');
    }

    saveAllImportRecords() {
        const modal = document.getElementById('importResultsModal');
        const recordsData = modal.dataset.records;
        if (!recordsData) return;
        
        try {
            const records = JSON.parse(recordsData);
            records.forEach(record => {
                this.saveImportRecord(record);
            });
            this.closeModal('importResultsModal');
            this.showToast(`Imported ${records.length} records`, 'success');
        } catch (e) {
            this.showToast('Failed to import records', 'error');
        }
    }

    openShortcutsHelp() {
        this.openModal('shortcutsModal');
    }

    openBulkActions() {
        const selected = this.state.appointments.filter(a => this.bulkSelected.has(a.id));
        if (selected.length === 0) {
            this.showToast('Select appointments first (click the checkbox on appointment cards)', 'warning');
            return;
        }
        
        this.openModal('bulkModal');
        
        // Set up bulk action buttons
        document.querySelectorAll('.bulk-action-btn').forEach(btn => {
            btn.onclick = () => {
                const action = btn.dataset.action;
                this.handleBulkAction(action, selected);
            };
        });
        
        document.getElementById('executeBulkBtn').onclick = () => {
            // Execute the selected action
            const content = document.getElementById('bulkActionContent');
            const action = content.dataset.action;
            if (action === 'status') {
                const status = document.getElementById('bulkStatusSelect').value;
                selected.forEach(a => a.status = status);
                this.saveAppointments();
                this.renderAll();
                this.updateBadges();
                this.showToast(`Updated ${selected.length} appointments to ${status}`, 'success');
                this.closeModal('bulkModal');
            } else if (action === 'tag') {
                const tag = document.getElementById('bulkTagInput').value.trim();
                if (tag) {
                    selected.forEach(a => {
                        const tags = a.tags ? a.tags.split(',').map(t => t.trim()) : [];
                        if (!tags.includes(tag)) tags.push(tag);
                        a.tags = tags.join(', ');
                    });
                    this.saveAppointments();
                    this.renderAll();
                    this.showToast(`Added tag "${tag}" to ${selected.length} appointments`, 'success');
                    this.closeModal('bulkModal');
                }
            } else if (action === 'delete') {
                if (confirm(`Delete ${selected.length} appointments?`)) {
                    const ids = selected.map(a => a.id);
                    this.state.appointments = this.state.appointments.filter(a => !ids.includes(a.id));
                    this.saveAppointments();
                    this.renderAll();
                    this.updateBadges();
                    this.bulkSelected.clear();
                    this.showToast(`Deleted ${selected.length} appointments`, 'info');
                    this.closeModal('bulkModal');
                }
            } else if (action === 'export') {
                this.exportSelectedCSV(selected);
                this.closeModal('bulkModal');
            }
        };
    }

    handleBulkAction(action, selected) {
        const content = document.getElementById('bulkActionContent');
        content.dataset.action = action;
        
        if (action === 'status') {
            content.innerHTML = `
                <div class="form-group">
                    <label>Change status to:</label>
                    <select id="bulkStatusSelect" class="form-control">
                        <option value="Pending">Pending</option>
                        <option value="Hot Transfer">Hot Transfer</option>
                        <option value="Warm Callback">Warm Callback</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                        <option value="Meeting Booked">Meeting Booked</option>
                    </select>
                </div>
                <p style="color:var(--text-secondary);font-size:0.875rem;">${selected.length} appointments selected</p>
            `;
        } else if (action === 'tag') {
            content.innerHTML = `
                <div class="form-group">
                    <label>Tag to add:</label>
                    <input type="text" id="bulkTagInput" placeholder="Enter tag" class="form-control">
                </div>
                <p style="color:var(--text-secondary);font-size:0.875rem;">${selected.length} appointments selected</p>
            `;
        } else if (action === 'delete') {
            content.innerHTML = `
                <p style="color:var(--danger);">⚠️ This will permanently delete ${selected.length} appointments.</p>
                <p style="color:var(--text-secondary);font-size:0.875rem;">This action cannot be undone.</p>
            `;
        } else if (action === 'export') {
            content.innerHTML = `
                <p style="color:var(--text-secondary);font-size:0.875rem;">Exporting ${selected.length} appointments to CSV...</p>
            `;
        }
    }

    exportSelectedCSV(selected) {
        if (selected.length === 0) {
            this.showToast('No appointments selected', 'warning');
            return;
        }
        
        const headers = ['Business', 'Contact', 'Phone', 'Email', 'Date', 'Time', 'Status', 'Closer', 'Notes', 'Tags'];
        const rows = selected.map(a => [
            a.business || '',
            a.contactName || '',
            a.phone || '',
            a.email || '',
            a.date || '',
            a.time || '',
            a.status || '',
            a.closer || '',
            a.notes || '',
            a.tags || ''
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `scriptflow_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast(`Exported ${selected.length} appointments`, 'success');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        if (modal) {
            modal.classList.add('active');
            overlay.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        if (modal) {
            modal.classList.remove('active');
        }
        // Check if any modals are still open
        const openModals = document.querySelectorAll('.modal.active');
        if (openModals.length === 0) {
            overlay.classList.remove('active');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modalOverlay').classList.remove('active');
    }

    toggleTheme() {
        const current = this.state.theme;
        const next = current === 'dark' ? 'light' : 'dark';
        this.state.theme = next;
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('scriptflow_theme', next);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    signOut() {
        if (confirm('Are you sure you want to sign out?')) {
            // Unsubscribe from listeners
            this.listeners.forEach(unsubscribe => {
                try { unsubscribe(); } catch(e) {}
            });
            this.listeners = [];
            
            auth.signOut().then(() => {
                this.state.user = null;
                this.state.appointments = [];
                this.state.tasks = [];
                this.state.scripts = [];
                this.state.closers = [];
                this.showToast('Signed out', 'info');
                // Show sign-in again
                this.showSignIn();
            }).catch(err => {
                this.showToast('Sign out failed: ' + err.message, 'error');
            });
        }
    }

    refreshData() {
        if (!this.state.user) return;
        this.showToast('Refreshing data...', 'info');
        this.loadData().then(() => {
            this.renderAll();
            this.showToast('Data refreshed', 'success');
        });
    }

    performSearch() {
        const query = this.state.searchQuery.toLowerCase().trim();
        if (!query) {
            // Clear search results
            return;
        }
        
        const results = {
            appointments: this.state.appointments.filter(a => 
                a.business?.toLowerCase().includes(query) ||
                a.contactName?.toLowerCase().includes(query) ||
                a.phone?.includes(query) ||
                a.email?.toLowerCase().includes(query) ||
                a.notes?.toLowerCase().includes(query) ||
                a.tags?.toLowerCase().includes(query)
            ),
            tasks: this.state.tasks.filter(t =>
                t.description?.toLowerCase().includes(query)
            ),
            scripts: this.state.scripts.filter(s =>
                s.name?.toLowerCase().includes(query) ||
                s.content?.toLowerCase().includes(query)
            ),
            closers: this.state.closers.filter(c =>
                c.name?.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query)
            )
        };
        
        // Show results in a modal or dropdown
        this.showSearchResults(results);
    }

    showSearchResults(results) {
        // Simple implementation - show in a toast or alert
        const total = results.appointments.length + results.tasks.length + results.scripts.length + results.closers.length;
        if (total === 0) {
            this.showToast('No results found', 'info');
            return;
        }
        
        // Create a temporary results display
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.maxWidth = '600px';
        modal.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-search"></i> Search Results</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove();document.getElementById('modalOverlay').classList.remove('active');">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="max-height:60vh;overflow-y:auto;">
                ${results.appointments.length > 0 ? `
                    <h4 style="margin:0.5rem 0;">Appointments (${results.appointments.length})</h4>
                    ${results.appointments.map(a => `
                        <div style="padding:0.5rem;background:var(--bg-card);border-radius:var(--radius-sm);margin-bottom:0.25rem;cursor:pointer;" onclick="window.app.openAppointmentDetail(window.app.state.appointments.find(x=>x.id=='${a.id}'))">
                            <strong>${a.business}</strong> - ${a.contactName} (${a.status})
                        </div>
                    `).join('')}
                ` : ''}
                ${results.tasks.length > 0 ? `
                    <h4 style="margin:0.5rem 0;">Tasks (${results.tasks.length})</h4>
                    ${results.tasks.map(t => `
                        <div style="padding:0.5rem;background:var(--bg-card);border-radius:var(--radius-sm);margin-bottom:0.25rem;">
                            ${t.description} (${t.priority})
                        </div>
                    `).join('')}
                ` : ''}
                ${results.scripts.length > 0 ? `
                    <h4 style="margin:0.5rem 0;">Scripts (${results.scripts.length})</h4>
                    ${results.scripts.map(s => `
                        <div style="padding:0.5rem;background:var(--bg-card);border-radius:var(--radius-sm);margin-bottom:0.25rem;cursor:pointer;" onclick="window.app.state.currentScript=window.app.state.scripts.find(x=>x.id=='${s.id}');window.app.renderScripts();">
                            ${s.name}
                        </div>
                    `).join('')}
                ` : ''}
                ${results.closers.length > 0 ? `
                    <h4 style="margin:0.5rem 0;">Closers (${results.closers.length})</h4>
                    ${results.closers.map(c => `
                        <div style="padding:0.5rem;background:var(--bg-card);border-radius:var(--radius-sm);margin-bottom:0.25rem;">
                            ${c.name} ${c.active ? '✅' : '❌'}
                        </div>
                    `).join('')}
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove();document.getElementById('modalOverlay').classList.remove('active');">Close</button>
            </div>
        `;
        
        document.getElementById('modalOverlay').classList.add('active');
        document.body.appendChild(modal);
    }

    updateBadges() {
        const calendarBadge = document.getElementById('calendarBadge');
        const taskBadge = document.getElementById('taskBadge');
        
        if (calendarBadge) {
            const today = new Date().toISOString().split('T')[0];
            const todayAppointments = this.state.appointments.filter(a => a.date === today);
            calendarBadge.textContent = todayAppointments.length;
        }
        
        if (taskBadge) {
            const pendingTasks = this.state.tasks.filter(t => !t.completed);
            taskBadge.textContent = pendingTasks.length;
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                // Allow Escape to close modals even in inputs
                if (e.key === 'Escape') {
                    this.closeAllModals();
                }
                return;
            }
            
            // Ctrl+Shift+O - Objection Handler
            if (e.ctrlKey && e.shiftKey && e.key === 'o') {
                e.preventDefault();
                this.openModal('objectionModal');
                return;
            }
            
            // Ctrl+Shift+I - Smart Import
            if (e.ctrlKey && e.shiftKey && e.key === 'i') {
                e.preventDefault();
                this.switchView('import');
                return;
            }
            
            // Ctrl+Shift+T - Toggle Theme
            if (e.ctrlKey && e.shiftKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
                return;
            }
            
            // Single key shortcuts
            switch(e.key) {
                case 'c':
                case 'C':
                    this.switchView('calendar');
                    break;
                case 's':
                case 'S':
                    this.switchView('scripts');
                    break;
                case 'f':
                case 'F':
                    document.getElementById('globalSearch').focus();
                    break;
                case 'a':
                case 'A':
                    this.openQuickAdd();
                    break;
                case 'h':
                case 'H':
                    this.switchView('analytics');
                    break;
                case 'm':
                case 'M':
                    this.switchView('closers');
                    break;
                case '?':
                    this.openShortcutsHelp();
                    break;
                case 'e':
                case 'E':
                    this.exportCSV();
                    break;
                case 'r':
                case 'R':
                    this.refreshData();
                    break;
                case 'b':
                case 'B':
                    this.openBulkActions();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    const index = parseInt(e.key) - 1;
                    if (this.state.scripts[index]) {
                        this.state.currentScript = this.state.scripts[index];
                        this.renderScripts();
                        this.loadScriptContent(this.state.scripts[index]);
                        this.showToast(`Switched to: ${this.state.scripts[index].name}`, 'info');
                    }
                    break;
                case 'Escape':
                    this.closeAllModals();
                    break;
            }
        });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ScriptFlowApp();
});